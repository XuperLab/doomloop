import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameLoop } from './engine/GameLoop';
import { InputManager, InputState } from './engine/InputManager';
import { InputAdapter } from './input/InputAdapter';
import { TouchInputAdapter } from './input/TouchInputAdapter';
import { isTouchDevice } from './input/MobileDetector';
import { Camera } from './engine/Camera';
import { PhysicsWorld, CollisionPair } from './physics/PhysicsWorld';
import { ArenaGenerator } from './arena/ArenaGenerator';
import { ArenaMesh } from './arena/ArenaMesh';
import { Player } from './entities/Player';
import { Imp } from './entities/Imp';
import { Boss } from './entities/Boss';
import { Projectile } from './entities/Projectile';
import { HealthPack } from './entities/HealthPack';
import { WaveManager } from './waves/WaveManager';
import { HUD } from './hud/HUD';
import { Crosshair } from './hud/Crosshair';
import { OverlayScreen } from './hud/OverlayScreen';
import { DamageFlash } from './effects/DamageFlash';
import { HitMarker } from './effects/HitMarker';
import { DeathEffect } from './effects/DeathEffect';
import { ScreenShake } from './effects/ScreenShake';
import {
  PHYSICS_FIXED_DT,
  MAX_FRAME_DELTA,
  PLAYER_EYE_HEIGHT,
  ARENA_SIZE,
  WALL_HEIGHT,
  PLAYER_SPAWN,
  BOSS_SPAWN,
  COLLISION_GROUPS,
} from './utils/Constants';
import { RNG } from './utils/RNG';

export class Game {
  // Three.js
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  // Engine
  private gameLoop: GameLoop;
  private inputAdapter: InputAdapter;
  private inputManager: InputManager; // Desktop adapter (kept for pointer lock access)
  private camera: Camera;
  private physicsWorld: PhysicsWorld;

  // Arena
  private arenaGenerator: ArenaGenerator;
  private arenaMesh: ArenaMesh;

  // Entities
  private player: Player | null = null;
  private imps: Imp[] = [];
  private bosses: Boss[] = [];
  private projectiles: Projectile[] = [];
  private healthPacks: HealthPack[] = [];
  private pendingRemovals: EntityLike[] = [];

  // Systems
  private waveManager: WaveManager;
  private hud: HUD;
  private crosshair: Crosshair;
  private overlay: OverlayScreen;
  private damageFlash: DamageFlash;
  private hitMarker: HitMarker;
  private deathEffect: DeathEffect;
  private screenShake: ScreenShake;

  // State
  private gamePhase: 'loading' | 'menu' | 'playing' | 'dead' | 'victory' = 'loading';
  private currentSeed = 0;
  private isTouchDevice = false;

  // Desktop-specific input state (for legacy defaults)
  private lastInput: InputState = {
    moveForward: false, moveBackward: false, moveLeft: false, moveRight: false,
    fire: false, jumpPressed: false, sprint: false,
    mouseDeltaX: 0, mouseDeltaY: 0, restart: false,
  };

  // Container
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Detect touch device early
    this.isTouchDevice = isTouchDevice();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false; // Performance: no shadows
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111122); // Dark blue-black sky
    this.scene.fog = new THREE.Fog(0x111122, 40, 80); // Distance fog (lighter)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x667799, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x6688bb, 0x333355, 0.8);
    this.scene.add(hemiLight);

    // Engine — Create InputManager as default
    this.inputManager = new InputManager();
    this.inputAdapter = this.inputManager;
    this.camera = new Camera(window.innerWidth / window.innerHeight);
    this.physicsWorld = new PhysicsWorld();
    this.gameLoop = new GameLoop(PHYSICS_FIXED_DT, MAX_FRAME_DELTA);

    // Arena
    this.arenaGenerator = new ArenaGenerator();
    this.arenaMesh = new ArenaMesh(this.physicsWorld);

    // Systems
    this.waveManager = new WaveManager();
    this.hud = new HUD();
    this.crosshair = new Crosshair();
    this.overlay = new OverlayScreen();
    this.damageFlash = new DamageFlash();
    this.hitMarker = new HitMarker();
    this.deathEffect = new DeathEffect(this.scene, this.physicsWorld);
    this.screenShake = new ScreenShake(this.camera);

    // Setup collision handling
    this.setupCollisions();

    // Setup wave manager callbacks
    this.setupWaveManager();

    // Setup input callbacks
    this.setupInput();

    // Setup window resize
    window.addEventListener('resize', this.onResize);

    // Start
    this.gameLoop.onFixedUpdate = this.fixedUpdate;
    this.gameLoop.onRender = this.renderFrame;

    // Generate initial seed
    this.currentSeed = Date.now();
  }

  /** Initialize and start the game */
  async init(): Promise<void> {
    if (this.isTouchDevice) {
      // Touch device: use TouchInputAdapter, skip pointer lock
      const touchAdapter = new TouchInputAdapter();
      this.inputAdapter = touchAdapter;
      this.inputAdapter.init(this.renderer.domElement);

      // Mobile overlay callback — tap to start (no pointer lock needed)
      this.overlay.onStartClick = () => {
        this.overlay.hideStart();
        if (this.gamePhase === 'menu') {
          this.startPlaying();
        }
      };
    } else {
      // Desktop: use InputManager with pointer lock
      this.inputManager.init(this.renderer.domElement);

      // Setup pointer lock
      this.inputManager.onPointerLockChange = () => {
        this.overlay.hideStart();
      };

      this.inputManager.onPointerLockError = () => {
        this.overlay.showPointerLockRequired();
      };

      // Desktop overlay callbacks
      this.overlay.onStartClick = () => {
        this.inputManager.requestPointerLock(this.renderer.domElement);
        if (this.gamePhase === 'menu') {
          this.startPlaying();
        }
      };

      this.overlay.onPointerLockRetry = () => {
        this.inputManager.requestPointerLock(this.renderer.domElement);
        this.overlay.hidePointerLockRequired();
      };
    }

    // Shared overlay callbacks
    this.overlay.onRestartFromDeath = () => this.restart();
    this.overlay.onRestartFromVictory = () => this.restart();

    // Build initial arena
    this.buildArena(this.currentSeed);

    // Show start overlay
    this.gamePhase = 'menu';
    this.overlay.hideLoading();

    if (this.isTouchDevice) {
      this.overlay.showMobileStart();
    } else {
      this.overlay.showStart();
    }

    this.hud.hide();
    this.crosshair.hide();

    // Start game loop
    this.gameLoop.start();
  }

  // ── Game Loop ──

  private fixedUpdate = (dt: number): void => {
    // Poll input from the active adapter
    this.lastInput = this.inputAdapter.poll();

    if (this.gamePhase === 'dead' || this.gamePhase === 'victory') {
      if (this.lastInput.restart) {
        this.restart();
      }
      return;
    }

    // During death animation, skip gameplay input
    if (this.isDying) return;

    if (this.gamePhase !== 'playing') return;

    // Handle restart during gameplay
    if (this.lastInput.restart) {
      this.restart();
      return;
    }

    // Player input and movement
    this.player?.applyMovement(this.lastInput, dt);
    this.player?.applyLook(
      this.lastInput.mouseDeltaX,
      this.lastInput.mouseDeltaY
    );

    // Fire weapon
    if (this.lastInput.fire && this.player) {
      const proj = this.player.weapon.fire();
      if (proj) {
        this.projectiles.push(proj);
        this.scene.add(proj.mesh);
      }
    }

    // Update entities
    this.player?.weapon.update(dt);

    for (const imp of this.imps) {
      if (imp.isAlive && this.player) {
        imp.target.set(
          this.player.body.position.x,
          this.player.body.position.y,
          this.player.body.position.z
        );
      }
      imp.update(dt);
    }

    for (const boss of this.bosses) {
      if (boss.isAlive && this.player) {
        boss.target.set(
          this.player.body.position.x,
          this.player.body.position.y,
          this.player.body.position.z
        );
      }
      boss.update(dt);
    }

    for (const proj of this.projectiles) {
      proj.update(dt);
    }

    for (const hp of this.healthPacks) {
      hp.update(dt);
    }

    // Wave manager
    this.waveManager.update(dt);

    // Step physics
    this.physicsWorld.step(dt);

    // Remove dead entities
    this.flushRemovals();
  };

  private renderFrame = (alpha: number): void => {
    // Sync camera to player
    this.player?.syncCamera();

    // Update camera (FOV, bob)
    this.camera.update(1 / 60);

    // Update death animation (camera tilt to sky)
    this.updateDeathAnimation(1 / 60);

    // Update effects
    this.damageFlash.update(1 / 60);
    this.hitMarker.update(1 / 60);
    this.deathEffect.update(1 / 60);
    this.screenShake.update(1 / 60);

    // Update HUD
    if (this.gamePhase === 'playing' && this.player) {
      this.hud.update(
        this.player.health,
        this.player.maxHealth,
        this.waveManager.currentWaveIndex + 1,
        this.waveManager.enemiesKilled,
        this.waveManager.totalEnemiesThisWave
      );
    }

    // Update crosshair bloom
    if (this.player) {
      this.crosshair.setBloom(this.player.weapon.crosshairBloom);
    }

    // Render
    this.renderer.render(this.scene, this.camera.camera);
  };

  // ── Arena ──

  private buildArena(seed: number): void {
    this.arenaMesh.clear();
    const layout = this.arenaGenerator.generate(seed);
    this.arenaMesh.build(layout);
    this.scene.add(this.arenaMesh.group);
  }

  // ── Player ──

  private spawnPlayer(): void {
    this.player = new Player(this.camera, this.physicsWorld);
    this.player.body.position.set(
      PLAYER_SPAWN[0],
      PLAYER_SPAWN[1],
      PLAYER_SPAWN[2]
    );
  }

  // ── Enemies ──

  private spawnImp(position: THREE.Vector3): void {
    const imp = new Imp(position, this.physicsWorld);
    this.imps.push(imp);
    this.scene.add(imp.mesh);
  }

  private spawnBoss(): void {
    if (!this.player) return;
        const pos = new THREE.Vector3(
          BOSS_SPAWN[0],
          BOSS_SPAWN[1],
          BOSS_SPAWN[2]
        );
    const boss = new Boss(pos, this.physicsWorld);
    this.bosses.push(boss);
    this.scene.add(boss.mesh);
  }

  private spawnHealthPack(position: THREE.Vector3): void {
    const hp = new HealthPack(position, this.physicsWorld);
    this.healthPacks.push(hp);
    this.scene.add(hp.mesh);
  }

  // ── Collisions ──

  private setupCollisions(): void {
    this.physicsWorld.onCollide((pair: CollisionPair) => {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Get entity references (need CANNON.Body with userData)
      // In cannon-es, userData is set via body.userData
      const entityA = (bodyA as any).userData?.entity;
      const entityB = (bodyB as any).userData?.entity;

      if (!entityA || !entityB) return;

      // Determine collision type from collision groups
      const groups = [
        bodyA.collisionFilterGroup,
        bodyB.collisionFilterGroup,
      ];
      const ents = [entityA, entityB];

      // Helper to find entity of a specific type
      const find = (type: new (...args: any[]) => any) =>
        ents.find((e) => e instanceof type);

      const player = find(Player) as Player | undefined;
      const imp = find(Imp) as Imp | undefined;
      const boss = find(Boss) as Boss | undefined;
      const proj = find(Projectile) as Projectile | undefined;
      const hp = find(HealthPack) as HealthPack | undefined;

      // Player ↔ Imp
      if (player && imp && imp.isAlive && player.isAlive) {
        player.takeDamage(imp.contactDamage);
        this.damageFlash.show();
        const knockbackFrom = new THREE.Vector3(
          player.body.position.x,
          player.body.position.y,
          player.body.position.z
        );
        imp.applyKnockback(knockbackFrom);

        // Check if player died from Imp contact
        if (!player.isAlive) {
          this.triggerPlayerDeath();
        }
        return;
      }

      // Player ↔ HealthPack
      if (player && hp && !hp.consumed && player.isAlive) {
        if (player.health < player.maxHealth) {
          player.heal(hp.healAmount);
          hp.onConsumed();
        }
        return;
      }

      // PlayerProjectile ↔ Imp/Boss
      if (proj && proj.owner === 'player' && (imp || boss)) {
        const target = imp ?? boss!;
        if (target.isAlive) {
          target.takeDamage(proj.damage);
          proj.onHit();
          this.hitMarker.show();

          if (!target.isAlive) {
            // Enemy died
            if (target instanceof Imp) {
              this.deathEffect.spawnImp(target.mesh.position);
            } else {
              this.deathEffect.spawnBoss(target.mesh.position);
              this.screenShake.shake();
            }
            this.waveManager.onEnemyKilled();
          }

          this.markForRemoval(proj);
        }
        return;
      }

      // BossProjectile ↔ Player
      if (proj && proj.owner === 'boss' && player && player.isAlive) {
        player.takeDamage(proj.damage);
        this.damageFlash.show();
        proj.onHit();
        this.markForRemoval(proj);

        if (!player.isAlive) {
          this.triggerPlayerDeath();
        }
        return;
      }

      // Projectile ↔ Arena (wall/floor/pillar)
      if (proj && !imp && !boss && !player && !hp) {
        proj.onHit();
        this.markForRemoval(proj);
        return;
      }
    });
  }

  // ── Wave Manager Setup ──

  private setupWaveManager(): void {
    this.waveManager.onSpawnEnemies = (count: number, waveDef) => {
      if (!this.player) return;

      if (waveDef.hasBoss) {
        this.spawnBoss();
      } else {
        // Spawn Imps at random edge points
        const layout = this.arenaGenerator.generate(this.currentSeed);
        const spawnPoints = layout.enemySpawnPoints;
        const rng = new RNG(this.currentSeed + this.waveManager.currentWaveIndex + 1);

        for (let i = 0; i < count; i++) {
          const idx = i % spawnPoints.length;
          const pt = spawnPoints[idx];
          const pos = new THREE.Vector3(pt[0], pt[1] + 0.5, pt[2]);

          // Add randomness from RNG
          pos.x += (rng.next() - 0.5) * 2;
          pos.z += (rng.next() - 0.5) * 2;

          this.spawnImp(pos);
        }
      }
    };

    this.waveManager.onSpawnHealthPacks = () => {
      const layout = this.arenaGenerator.generate(this.currentSeed);
      for (const pos of layout.healthPackPositions) {
        this.spawnHealthPack(new THREE.Vector3(pos[0], pos[1], pos[2]));
      }
    };

    this.waveManager.onWaveStateChange = (state: string, waveNum: number) => {
      if (state === 'spawning') {
        this.overlay.showNotification(
          `Wave ${waveNum}/5 incoming!`,
          '',
          2
        );
      } else if (state === 'intermission') {
        // Spawn health packs here too (also triggered when intermission starts)
        this.overlay.showNotification(
          `Wave ${waveNum - 1} complete!`,
          'Get ready...',
          3
        );
      } else if (state === 'victory') {
        this.gamePhase = 'victory';
        if (this.isTouchDevice) {
          this.overlay.showMobileVictory();
        } else {
          this.overlay.showVictory();
          this.inputManager.exitPointerLock();
        }
        this.hud.hide();
        this.crosshair.hide();
      } else if (state === 'gameOver') {
        // Death is now handled by triggerPlayerDeath() + death animation
        // This state is set after the animation completes
      }
    };
  }

  // ── Input Setup ──

  private setupInput(): void {
    // Handle jump via space key (desktop-only)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.gamePhase === 'playing') {
        this.inputManager.notifyJumpPressed();
        e.preventDefault();
      }
      if (e.code === 'KeyR' && (this.gamePhase === 'dead' || this.gamePhase === 'victory')) {
        this.restart();
      }
    });
  }

  // ── Player Death ──

  private isDying = false;
  private deathAnimTimer = 0;
  private readonly DEATH_ANIM_DURATION = 1.2; // seconds

  private triggerPlayerDeath(): void {
    if (this.isDying) return;
    this.isDying = true;
    this.deathAnimTimer = 0;

    // Exit pointer lock on desktop
    if (!this.isTouchDevice) {
      this.inputManager.exitPointerLock();
    }
  }

  private updateDeathAnimation(dt: number): void {
    if (!this.isDying) return;

    this.deathAnimTimer += dt;
    const t = Math.min(this.deathAnimTimer / this.DEATH_ANIM_DURATION, 1);

    // Smoothly tilt camera upward (pitch toward sky)
    // Ease-out curve for dramatic effect
    const easeT = 1 - Math.pow(1 - t, 3);
    const deathPitch = easeT * (Math.PI / 3); // 60 degrees up = looking at sky
    this.camera.setDeathPitch(deathPitch);

    // Slight roll for disorientation
    const deathRoll = easeT * 0.15;
    this.camera.setDeathRoll(deathRoll);

    // When animation complete, show death screen
    if (t >= 1) {
      this.isDying = false;
      this.gamePhase = 'dead';
      if (this.isTouchDevice) {
        this.overlay.showMobileDeath(this.waveManager.currentWaveIndex + 1);
      } else {
        this.overlay.showDeath(this.waveManager.currentWaveIndex + 1);
      }
      this.hud.hide();
      this.crosshair.hide();
      this.waveManager.onPlayerDeath();
    }
  }

  // ── Game State ──

  private startPlaying(): void {
    this.gamePhase = 'playing';
    this.hud.show();
    this.crosshair.show();
    this.overlay.hideStart();
    this.overlay.hideDeath();
    this.overlay.hideVictory();
    this.waveManager.startGame();
  }

  restart(): void {
    // Clear all entities
    this.clearEntities();

    // Reset death animation
    this.isDying = false;
    this.deathAnimTimer = 0;
    this.camera.setDeathPitch(0);
    this.camera.setDeathRoll(0);

    // Clear effects
    this.deathEffect.clear();
    this.damageFlash.reset();
    this.hitMarker.reset();
    this.screenShake.reset();

    // Generate new seed
    this.currentSeed = Date.now() + Math.floor(Math.random() * 100000);

    // Rebuild arena
    this.buildArena(this.currentSeed);

    // Respawn player
    this.spawnPlayer();

    // Reset wave manager
    this.waveManager.reset();

    // Reset camera
    this.camera.reset();

    // Reset the input adapter
    this.inputAdapter.reset();

    // Show HUD and crosshair
    this.hud.show();
    this.crosshair.show();

    // Set phase to menu (tap/click to start)
    this.gamePhase = 'menu';
    this.overlay.hideDeath();
    this.overlay.hideVictory();

    if (this.isTouchDevice) {
      this.overlay.showMobileStart();
    } else {
      this.overlay.showStart();
      // Request pointer lock
      this.inputManager.requestPointerLock(this.renderer.domElement);
      // Start the game immediately if pointer lock is already active
      this.startPlaying();
    }
  }

  private clearEntities(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    for (const imp of this.imps) {
      imp.destroy();
    }
    this.imps.length = 0;

    for (const boss of this.bosses) {
      boss.destroy();
    }
    this.bosses.length = 0;

    for (const proj of this.projectiles) {
      proj.destroy();
    }
    this.projectiles.length = 0;

    for (const hp of this.healthPacks) {
      hp.destroy();
    }
    this.healthPacks.length = 0;

    this.pendingRemovals.length = 0;
  }

  private markForRemoval(entity: EntityLike): void {
    if (entity && !this.pendingRemovals.includes(entity)) {
      this.pendingRemovals.push(entity);
    }
  }

  private flushRemovals(): void {
    for (const entity of this.pendingRemovals) {
      // Remove from scene
      if (entity.mesh) {
        this.scene.remove(entity.mesh);
      }

      // Remove from physics
      if (entity.body) {
        this.physicsWorld.removeBody(entity.body);
      }

      // Remove from tracking arrays
      const removeFrom = (arr: any[], check: any) => {
        const idx = arr.indexOf(check);
        if (idx >= 0) arr.splice(idx, 1);
      };

      if (entity instanceof Imp) {
        removeFrom(this.imps, entity);
      } else if (entity instanceof Boss) {
        removeFrom(this.bosses, entity);
      } else if (entity instanceof Projectile) {
        removeFrom(this.projectiles, entity);
      } else if (entity instanceof HealthPack) {
        removeFrom(this.healthPacks, entity);
      }
    }
    this.pendingRemovals.length = 0;
  }

  // ── Resize ──

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.setAspect(w / h);

    // Notify touch adapter of viewport change
    if (this.isTouchDevice && this.inputAdapter instanceof TouchInputAdapter) {
      // The adapter recalculates joystick center on next touch
    }
  };

  // ── Cleanup ──

  destroy(): void {
    this.gameLoop.stop();
    this.inputAdapter.destroy();
    this.clearEntities();
    this.arenaMesh.clear();
    this.deathEffect.clear();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Interface for flushRemovals
interface EntityLike {
  mesh?: THREE.Object3D;
  body?: CANNON.Body;
}
