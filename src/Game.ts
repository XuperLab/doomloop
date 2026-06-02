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
import { ArenaTheme, ARENA_THEMES, getMusicKey } from './arena/ArenaTheme';
import { TrapZone, TrapType } from './arena/TrapZone';
import { SupplyStation } from './arena/SupplyStation';
import { Player } from './entities/Player';
import { Imp } from './entities/Imp';
import { Boss } from './entities/Boss';
import { ShooterImp } from './entities/ShooterImp';
import { Exploder } from './entities/Exploder';
import { Flyer } from './entities/Flyer';
import { Projectile } from './entities/Projectile';
import { HealthPack } from './entities/HealthPack';
import { Entity } from './entities/Entity';
import { WaveManager } from './waves/WaveManager';
import { HUD } from './hud/HUD';
import { Crosshair } from './hud/Crosshair';
import { MiniMap } from './hud/MiniMap';
import { OverlayScreen } from './hud/OverlayScreen';
import { DamageFlash } from './effects/DamageFlash';
import { HitMarker } from './effects/HitMarker';
import { DeathEffect } from './effects/DeathEffect';
import { ScreenShake } from './effects/ScreenShake';
import { MuzzleFlash } from './effects/MuzzleFlash';
import { ShellCasing } from './effects/ShellCasing';
import { AudioManager } from './audio/AudioManager';
import { PowerUpManager } from './gameplay/PowerUpManager';
import { ScoreManager } from './gameplay/ScoreManager';
import { Weapon } from './weapons/Weapon';
import { WeaponPickup } from './weapons/WeaponPickup';
import { Shotgun } from './weapons/Shotgun';
import { SMG } from './weapons/SMG';
import { RocketLauncher } from './weapons/RocketLauncher';
import {
  PHYSICS_FIXED_DT,
  MAX_FRAME_DELTA,
  PLAYER_EYE_HEIGHT,
  ARENA_SIZE,
  WALL_HEIGHT,
  PLAYER_SPAWN,
  BOSS_SPAWN,
  COLLISION_GROUPS,
  LOCALSTORAGE_SETTINGS_KEY,
  LOCALSTORAGE_HELP_KEY,
  SETTINGS_SENSITIVITY_DEFAULT,
  SETTINGS_DEAD_ZONE_DEFAULT,
  SETTINGS_HAPTIC_DEFAULT,
  VISUAL_VIEWPORT_DEBOUNCE_MS,
  EnemyType,
  ROCKET_AOE_RADIUS,
  ROCKET_SELF_DAMAGE,
  ROCKET_SELF_DAMAGE_RADIUS,
  WEAPON_CONFIGS,
  AMMO_PICKUP_SMALL,
  TRAP_SPIKE_DAMAGE,
  TRAP_GEYSER_DAMAGE,
  TRAP_SLOW_DURATION,
  TRAP_SLOW_MULTIPLIER,
  SUPPLY_STATION_HEAL,
  TRAP_COOLDOWN,
  COMBO_WINDOW,
  Difficulty,
  DIFFICULTY_CONFIGS,
} from './utils/Constants';
import { RNG } from './utils/RNG';

function vec3ToThree(v: CANNON.Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}
function threeToVec3(v: THREE.Vector3): CANNON.Vec3 {
  return new CANNON.Vec3(v.x, v.y, v.z);
}

export class Game {
  // Three.js
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  // Engine
  private gameLoop: GameLoop;
  private inputAdapter: InputAdapter;
  private inputManager: InputManager;
  private camera: Camera;
  private physicsWorld: PhysicsWorld;

  // Arena
  private arenaGenerator: ArenaGenerator;
  private arenaMesh: ArenaMesh;

  // Entities
  private player: Player | null = null;
  private imps: Imp[] = [];
  private bosses: Boss[] = [];
  private shooterImps: ShooterImp[] = [];
  private exploders: Exploder[] = [];
  private flyers: Flyer[] = [];
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

  // Sprint 4: New systems
  private audioManager: AudioManager;
  private powerUpManager: PowerUpManager | null = null;
  private scoreManager: ScoreManager;
  private miniMap: MiniMap | null = null;
  private muzzleFlash: MuzzleFlash;
  private shellCasing: ShellCasing;
  private trapZones: TrapZone[] = [];
  private supplyStations: SupplyStation[] = [];
  private weaponPickups: WeaponPickup[] = [];
  private difficulty: Difficulty = Difficulty.normal;
  private currentArenaIndex = 0;
  private currentArenaTheme: ArenaTheme | null = null;
  private portalMesh: THREE.Mesh | null = null;
  private isTransitioning = false;

  // State
  private gamePhase: 'loading' | 'menu' | 'playing' | 'dead' | 'victory' = 'loading';
  private currentSeed = 0;
  private isTouchDevice = false;

  // Input state
  private lastInput: InputState = {
    moveForward: false, moveBackward: false, moveLeft: false, moveRight: false,
    fire: false, jumpPressed: false, sprint: false,
    mouseDeltaX: 0, mouseDeltaY: 0, restart: false,
    weaponSwitchTo: -1, interact: false,
  };

  // Sprint 3: Touch adapter reference
  private touchAdapter: TouchInputAdapter | null = null;
  private boundViewportResize: (() => void) | null = null;

  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isTouchDevice = isTouchDevice();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111122);
    this.scene.fog = new THREE.Fog(0x111122, 40, 80);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x667799, 1.2);
    this.scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);
    const hemiLight = new THREE.HemisphereLight(0x6688bb, 0x333355, 0.8);
    this.scene.add(hemiLight);

    // Engine
    this.inputManager = new InputManager();
    this.inputAdapter = this.inputManager;
    this.camera = new Camera(window.innerWidth / window.innerHeight);
    this.physicsWorld = new PhysicsWorld();
    this.gameLoop = new GameLoop(PHYSICS_FIXED_DT, MAX_FRAME_DELTA);

    // Arena
    this.arenaGenerator = new ArenaGenerator();
    this.arenaMesh = new ArenaMesh(this.physicsWorld);

    // Sprint 4: Audio
    this.audioManager = AudioManager.getInstance();

    // Systems
    this.waveManager = new WaveManager();
    this.hud = new HUD();
    this.crosshair = new Crosshair();
    this.overlay = new OverlayScreen();
    this.damageFlash = new DamageFlash();
    this.hitMarker = new HitMarker();
    this.deathEffect = new DeathEffect(this.scene, this.physicsWorld);
    this.screenShake = new ScreenShake(this.camera);

    // Sprint 4: New systems
    this.scoreManager = new ScoreManager();
    this.muzzleFlash = new MuzzleFlash(this.scene);
    this.shellCasing = new ShellCasing(this.scene);

    // Setup
    this.setupCollisions();
    this.setupWaveManager();
    this.setupInput();

    window.addEventListener('resize', this.onResize);
    this.gameLoop.onFixedUpdate = this.fixedUpdate;
    this.gameLoop.onRender = this.renderFrame;

    this.currentSeed = Date.now();
  }

  async init(): Promise<void> {
    if (this.isTouchDevice) {
      const touchAdapter = new TouchInputAdapter();
      this.inputAdapter = touchAdapter;
      this.touchAdapter = touchAdapter;
      this.inputAdapter.init(this.renderer.domElement);
      this.setupVisualViewport();
      const helpShown = localStorage.getItem(LOCALSTORAGE_HELP_KEY);
      if (!helpShown) {
        touchAdapter.showHelpOverlay();
      }
      this.overlay.onStartClick = () => {
        this.overlay.hideStart();
        if (this.gamePhase === 'menu') {
          this.startPlaying();
        }
      };
    } else {
      this.inputManager.init(this.renderer.domElement);
      this.inputManager.onPointerLockChange = () => { this.overlay.hideStart(); };
      this.inputManager.onPointerLockError = () => { this.overlay.showPointerLockRequired(); };
      this.overlay.onStartClick = () => {
        this.inputManager.requestPointerLock(this.renderer.domElement);
        if (this.gamePhase === 'menu') this.startPlaying();
      };
      this.overlay.onPointerLockRetry = () => {
        this.inputManager.requestPointerLock(this.renderer.domElement);
        this.overlay.hidePointerLockRequired();
      };
    }

    this.overlay.onRestartFromDeath = () => this.restart();
    this.overlay.onRestartFromVictory = () => this.restart();

    // Init audio on first interaction (wrapped into existing callbacks)
    const origStartClick = this.overlay.onStartClick;
    this.overlay.onStartClick = () => {
      this.audioManager.init();
      this.audioManager.resume();
      origStartClick?.();
    };

    // Build initial arena
    this.currentArenaIndex = 0;
    this.currentArenaTheme = ARENA_THEMES[0];
    this.buildArena(this.currentSeed);

    this.gamePhase = 'menu';
    this.overlay.hideLoading();
    if (this.isTouchDevice) {
      this.overlay.showMobileStart();
    } else {
      this.overlay.showStart();
    }
    this.hud.hide();
    this.crosshair.hide();
    this.gameLoop.start();
  }

  // ── Game Loop ──

  private fixedUpdate = (dt: number): void => {
    this.lastInput = this.inputAdapter.poll();
    if (this.gamePhase === 'dead' || this.gamePhase === 'victory') {
      if (this.lastInput.restart) this.restart();
      return;
    }
    if (this.isDying || this.isTransitioning) return;
    if (this.gamePhase !== 'playing') return;
    if (this.lastInput.restart) { this.restart(); return; }

    if (!this.player || !this.powerUpManager) return;

    // Sprint 4: Weapon switching
    if (this.lastInput.weaponSwitchTo !== undefined && this.lastInput.weaponSwitchTo >= 0) {
      const idx = this.lastInput.weaponSwitchTo;
      if (idx < this.player.weapons.length && idx !== this.player.currentWeaponIndex) {
        this.player.switchWeapon(idx);
      }
    }

    // Player input
    this.player.applyMovement(this.lastInput, dt);
    this.player.applyLook(this.lastInput.mouseDeltaX, this.lastInput.mouseDeltaY);

    // Fire weapon
    if (this.lastInput.fire && this.player.currentWeapon) {
      const lookDir = this.camera.getLookDirection();
      const spawnPos = this.camera.camera.position.clone();
      const weapon = this.player.currentWeapon;
      const fired = weapon.fire(spawnPos, lookDir, this.scene);
      if (fired) {
        // Track projectiles for updates and cleanup
        if (weapon.lastCreatedProjectiles.length > 0) {
          this.projectiles.push(...weapon.lastCreatedProjectiles);
          weapon.lastCreatedProjectiles.length = 0;
        }

        // Muzzle flash
        const weaponKey = this.getWeaponTypeKey(this.player.currentWeaponIndex);
        this.muzzleFlash.emit(weaponKey, spawnPos, lookDir);

        // Shell casing
        this.shellCasing.emit(weaponKey, spawnPos);

        // Audio
        this.audioManager.playSFX(weaponKey + '_fire');
      }
    }

    // Interact key
    if (this.lastInput.interact) {
      this.handleInteract();
    }

    // Update entities
    this.player.update(dt);
    this.player.syncCamera();

    // Update imps
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

    // Update bosses
    for (const boss of this.bosses) {
      if (boss.isAlive && this.player) {
        boss.target.copy(vec3ToThree(this.player.body.position));
        // Boss projectiles get added to tracking
      }
      boss.update(dt);
    }

    // Sprint 4: New enemies
    for (const s of this.shooterImps) {
      if (s.isAlive && this.player) s.target.copy(vec3ToThree(this.player.body.position));
      s.update(dt);
    }
    for (const e of this.exploders) {
      if (e.isAlive && this.player) e.target.copy(vec3ToThree(this.player.body.position));
      e.update(dt);
    }
    for (const f of this.flyers) {
      if (f.isAlive && this.player) f.target.copy(vec3ToThree(this.player.body.position));
      f.update(dt);
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      proj.update(dt);
    }

    // Update health packs
    for (const hp of this.healthPacks) {
      hp.update(dt);
    }

    // Sprint 4: Power-up manager
    this.powerUpManager.update(dt, vec3ToThree(this.player.body.position));

    // Sprint 4: Score manager
    this.scoreManager.update(dt);

    // Sprint 4: Trap zones
    for (const trap of this.trapZones) {
      trap.update(dt);
      if (trap.isReady && this.player) {
        const dist = vec3ToThree(this.player.body.position).distanceTo(trap.position);
        if (dist < trap.activationRadius) {
          trap.activate();
          this.player.takeDamage(trap.damage);
          if (trap.knockbackDistance) {
            const knockDir = new THREE.Vector3(
              this.player.body.position.x - trap.position.x,
              0,
              this.player.body.position.z - trap.position.z
            ).normalize();
            this.player.body.velocity.x += knockDir.x * trap.knockbackDistance;
            this.player.body.velocity.z += knockDir.z * trap.knockbackDistance;
          }
          if (!this.player.isAlive) {
            this.triggerPlayerDeath();
          }
        }
      }
    }

    // Sprint 4: Supply stations
    for (const ss of this.supplyStations) {
      ss.update(dt);
      // Activation is via interact key (handled in handleInteract)
    }

    // Sprint 4: Weapon pickups
    for (const wp of this.weaponPickups) {
      wp.update(dt);
      if (wp.isAvailable && this.player) {
        const dist = vec3ToThree(this.player.body.position).distanceTo(wp.position);
        if (dist < 1.5) {
          this.collectWeaponPickup(wp);
        }
      }
    }

    // Sprint 4: Portal check
    if (this.waveManager.portalActive && this.portalMesh && this.player) {
      const dist = vec3ToThree(this.player.body.position).distanceTo(this.portalMesh.position);
      if (dist < 2) {
        this.transitionArena();
      }
    }

    // Sprint 4: Footstep audio
    if (this.player && this.player.footstepTimer <= 0) {
      const isMoving = this.lastInput.moveForward || this.lastInput.moveBackward ||
        this.lastInput.moveLeft || this.lastInput.moveRight ||
        (this.lastInput.moveAnalogX !== undefined && Math.abs(this.lastInput.moveAnalogX) > 0.1) ||
        (this.lastInput.moveAnalogZ !== undefined && Math.abs(this.lastInput.moveAnalogZ) > 0.1);
      if (isMoving) {
        // Timer handled inside Player, sound triggered here
      }
    }

    // Wave manager
    this.waveManager.update(dt);

    // Physics
    this.physicsWorld.step(dt);

    // Remove dead entities
    this.flushRemovals();
  };

  private renderFrame = (alpha: number): void => {
    this.player?.syncCamera();
    this.camera.update(1 / 60);
    this.updateDeathAnimation(1 / 60);

    this.damageFlash.update(1 / 60);
    this.hitMarker.update(1 / 60);
    this.deathEffect.update(1 / 60);
    this.screenShake.update(1 / 60);

    // Sprint 4: Update new effect systems
    this.muzzleFlash.update(1 / 60);
    this.shellCasing.update(1 / 60);

    // Sprint 4: HUD with weapon, score, combo
    if (this.gamePhase === 'playing' && this.player) {
      this.hud.update(
        this.player.health,
        this.player.maxHealth,
        this.waveManager.currentWaveIndex + 1,
        this.waveManager.enemiesKilled,
        this.waveManager.totalEnemiesThisWave,
        this.player.weapons,
        this.player.currentWeaponIndex,
        this.scoreManager.score,
        this.scoreManager.combo,
        this.scoreManager.comboTimer,
        COMBO_WINDOW, // Forward declared
      );
    }

    // Sprint 4: Combo display update (callout animation)
    this.hud.comboDisplay.update(1 / 60);

    // Sprint 4: Crosshair update per weapon
    if (this.player && this.player.currentWeapon) {
      this.crosshair.setBloom(0); // Simplified for now
    }

    // Sprint 4: Mini-map
    if (this.miniMap && this.player) {
      const arenaSize = this.currentArenaTheme?.size ?? { width: ARENA_SIZE, depth: ARENA_SIZE };
      const heading = this.camera.getYaw();
      const entities = this.getMiniMapEntities();
      this.miniMap.update(vec3ToThree(this.player.body.position), heading, entities, arenaSize);
    }

    this.renderer.render(this.scene, this.camera.camera);
  };

  // ── Arena ──

  private buildArena(seed: number): void {
    this.arenaMesh.clear();
    const theme = this.currentArenaTheme;
    const layout = this.arenaGenerator.generate(seed, theme ?? undefined);
    this.arenaMesh.build(layout, theme ?? undefined, this.scene);
    this.scene.add(this.arenaMesh.group);

    // Create trap zones based on theme
    this.createTrapZones(theme ?? undefined);
    this.createSupplyStations(theme ?? undefined);
    this.createPortal(theme ?? undefined);
    this.createWeaponPickups(layout);

    // Create mini-map
    if (!this.miniMap) {
      this.miniMap = new MiniMap();
    }

    // Start BGM
    const musicKey = getMusicKey(this.currentArenaIndex);
    this.audioManager.playMusic(musicKey);
  }

  private createTrapZones(theme?: ArenaTheme): void {
    this.trapZones = [];
    if (!theme) return;

    const positions = [
      new THREE.Vector3(-6, 0, -6),
      new THREE.Vector3(6, 0, 6),
      new THREE.Vector3(-6, 0, 6),
      new THREE.Vector3(6, 0, -6),
    ];

    // Only place 2 traps per arena
    const count = 2;
    let trapType: TrapType;
    switch (theme.specialFeature) {
      case 'lava_pools': trapType = 'geyser'; break;
      case 'crystals': trapType = 'gravity_well'; break;
      default: trapType = 'spikes';
    }

    for (let i = 0; i < count; i++) {
      const pos = positions[i % positions.length];
      const trap = new TrapZone(
        pos, trapType,
        trapType === 'gravity_well' ? 0 : (trapType === 'geyser' ? TRAP_GEYSER_DAMAGE : TRAP_SPIKE_DAMAGE),
        TRAP_COOLDOWN,
        1.5,
        trapType === 'geyser' ? 5 : undefined,
        trapType === 'gravity_well' ? TRAP_SLOW_MULTIPLIER : undefined,
        trapType === 'gravity_well' ? TRAP_SLOW_DURATION : undefined,
      );
      this.trapZones.push(trap);
      this.scene.add(trap.mesh);
    }
  }

  private createSupplyStations(theme?: ArenaTheme): void {
    this.supplyStations = [];
    if (!theme) return;

    const pos = new THREE.Vector3(0, 0, -10);
    const station = new SupplyStation(pos);
    this.supplyStations.push(station);
    this.scene.add(station.mesh);
  }

  private createPortal(theme?: ArenaTheme): void {
    if (this.portalMesh) {
      this.scene.remove(this.portalMesh);
      this.portalMesh = null;
    }

    const geo = new THREE.TorusGeometry(1, 0.2, 8, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.8,
    });
    this.portalMesh = new THREE.Mesh(geo, mat);
    this.portalMesh.position.set(0, 1.5, 0);
    this.portalMesh.visible = false; // Only visible after wave 5 boss kill
    this.scene.add(this.portalMesh);
  }

  private createWeaponPickups(layout: import('./utils/Constants').ArenaLayout): void {
    this.weaponPickups = [];
    const weaponTypes = ['shotgun', 'smg', 'rocket'];
    const positions = [
      new THREE.Vector3(5, 0, 5),
      new THREE.Vector3(-5, 0, -5),
      new THREE.Vector3(5, 0, -5),
    ];

    for (let i = 0; i < weaponTypes.length; i++) {
      const wp = new WeaponPickup(positions[i], weaponTypes[i]);
      this.weaponPickups.push(wp);
      this.scene.add(wp.mesh);
    }
  }

  private collectWeaponPickup(wp: WeaponPickup): void {
    if (!this.player) return;
    const weaponType = wp.weaponType;
    const existing = this.player.weapons.find(w => {
      const key = this.getWeaponTypeKey(this.player!.weapons.indexOf(w));
      return key === weaponType;
    });

    if (existing) {
      existing.addAmmo(AMMO_PICKUP_SMALL[weaponType] ?? 0);
    } else {
      // Create weapon based on type
      const newWeapon = this.createWeaponByType(weaponType);
      if (newWeapon) {
        this.player.addWeapon(newWeapon);
      }
    }
    wp.collect(this.player);
    this.audioManager.playSFX('power_up_collect');
  }

  private createWeaponByType(type: string): Weapon | null {
    if (!this.player) return null;
    switch (type) {
      case 'shotgun': return new Shotgun(this.camera.camera, this.physicsWorld, this.player);
      case 'smg': return new SMG(this.camera.camera, this.physicsWorld, this.player);
      case 'rocket': return new RocketLauncher(this.camera.camera, this.physicsWorld, this.player);
      default: return null;
    }
  }

  // ── Player ──

  private spawnPlayer(): void {
    this.player = new Player(this.camera, this.physicsWorld);
    this.player.body.position.set(PLAYER_SPAWN[0], PLAYER_SPAWN[1], PLAYER_SPAWN[2]);
  }

  // ── Enemies ──

  private spawnImp(position: THREE.Vector3): void {
    const imp = new Imp(position, this.physicsWorld);
    this.imps.push(imp);
    this.scene.add(imp.mesh);
  }

  private spawnBoss(): void {
    if (!this.player) return;
    const pos = new THREE.Vector3(BOSS_SPAWN[0], BOSS_SPAWN[1], BOSS_SPAWN[2]);
    const boss = new Boss(pos, this.physicsWorld);
    this.bosses.push(boss);
    this.scene.add(boss.mesh);
  }

  private spawnShooterImp(position: THREE.Vector3): void {
    const enemy = new ShooterImp(position, this.physicsWorld);
    this.shooterImps.push(enemy);
    this.scene.add(enemy.mesh);
    // Exploder light is added separately
  }

  private spawnExploder(position: THREE.Vector3): void {
    const enemy = new Exploder(position, this.physicsWorld);
    this.exploders.push(enemy);
    this.scene.add(enemy.mesh);
    this.scene.add(enemy.getLight());
  }

  private spawnFlyer(position: THREE.Vector3): void {
    const enemy = new Flyer(position, this.physicsWorld);
    this.flyers.push(enemy);
    this.scene.add(enemy.mesh);
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
      const entityA = (bodyA as any).userData?.entity;
      const entityB = (bodyB as any).userData?.entity;
      if (!entityA || !entityB) return;

      const groups = [bodyA.collisionFilterGroup, bodyB.collisionFilterGroup];
      const ents = [entityA, entityB];
      const find = (type: new (...args: any[]) => any) => ents.find((e) => e instanceof type);

      const player = find(Player) as Player | undefined;
      const imp = find(Imp) as Imp | undefined;
      const boss = find(Boss) as Boss | undefined;
      const proj = find(Projectile) as Projectile | undefined;
      const hp = find(HealthPack) as HealthPack | undefined;

      // Sprint 4: New enemy types
      const shooterImp = find(ShooterImp) as ShooterImp | undefined;
      const exploder = find(Exploder) as Exploder | undefined;
      const flyer = find(Flyer) as Flyer | undefined;

      // Player ↔ Imp
      if (player && imp && imp.isAlive && player.isAlive) {
        player.takeDamage(imp.contactDamage);
        this.damageFlash.show();
        if (this.touchAdapter) this.touchAdapter.damageHaptic();
        const knockbackFrom = vec3ToThree(player.body.position);
        imp.applyKnockback(knockbackFrom);
        if (!player.isAlive) this.triggerPlayerDeath();
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

      // PlayerProjectile ↔ Enemy
      const enemyTargets = [imp, boss, shooterImp, exploder, flyer].filter(e => e?.isAlive);
      if (proj && proj.owner === 'player' && enemyTargets.length > 0) {
        const target = enemyTargets[0]; // First alive enemy found
        if (target?.isAlive) {
          target.takeDamage(proj.damage);
          this.hitMarker.show();
          this.audioManager.playSFX('impact_enemy');
          if (this.touchAdapter) this.touchAdapter.hitHaptic();

          // Handle AoE from rockets
          if (proj.areaRadius && proj.areaDamage) {
            this.handleRocketAoE(proj);
          }

          if (!target.isAlive) {
            this.handleEnemyDeath(target);
          }

          proj.onHit();
          this.markForRemoval(proj);
        }
        return;
      }

      // Projectile ↔ Arena
      if (proj && !imp && !boss && !shooterImp && !exploder && !flyer && !player && !hp) {
        this.audioManager.playSFX('impact_wall');
        if (proj.areaRadius && proj.areaDamage) {
          this.handleRocketAoE(proj);
        }
        proj.onHit();
        this.markForRemoval(proj);
        return;
      }

      // BossProjectile ↔ Player
      if (proj && proj.owner === 'boss' && player && player.isAlive) {
        player.takeDamage(proj.damage);
        this.damageFlash.show();
        if (this.touchAdapter) this.touchAdapter.damageHaptic();
        proj.onHit();
        this.markForRemoval(proj);
        if (!player.isAlive) this.triggerPlayerDeath();
        return;
      }

      // Flyer ↔ Player
      if (player && flyer && flyer.isAlive && player.isAlive) {
        player.takeDamage(12); // Flyer contact damage
        this.damageFlash.show();
        if (this.touchAdapter) this.touchAdapter.damageHaptic();
        if (!player.isAlive) this.triggerPlayerDeath();
        return;
      }
    });
  }

  private handleRocketAoE(proj: Projectile): void {
    if (!proj.areaRadius) return;
    const hitPos = proj.mesh.position.clone();

    // Check all entities within radius
    const allEnemies = [...this.imps, ...this.bosses, ...this.shooterImps, ...this.exploders, ...this.flyers]
      .filter(e => e.isAlive);

    for (const enemy of allEnemies) {
      const dist = enemy.mesh.position.distanceTo(hitPos);
      if (dist < proj.areaRadius) {
        const dmg = Math.max(1, Math.round((proj.areaDamage ?? 0) * (1 - dist / proj.areaRadius)));
        enemy.takeDamage(dmg);
        if (!enemy.isAlive) {
          this.handleEnemyDeath(enemy);
        }
      }
    }

    // Self-damage to player
    if (this.player) {
      const dist = vec3ToThree(this.player.body.position).distanceTo(hitPos);
      if (dist < ROCKET_SELF_DAMAGE_RADIUS) {
        this.player.takeDamage(ROCKET_SELF_DAMAGE);
        this.damageFlash.show();
        if (!this.player.isAlive) this.triggerPlayerDeath();
      }
    }

    // Visual: explosion effect via screen shake
    this.screenShake.shake();
    this.audioManager.playSFX('explosion');
  }

  private handleEnemyDeath(target: Entity): void {
    // Death effect
    if (target instanceof Imp) {
      this.deathEffect.spawnImp(target.mesh.position);
      this.scoreManager.registerKill('imp');
    } else if (target instanceof Boss) {
      this.deathEffect.spawnBoss(target.mesh.position);
      this.screenShake.shake();
      this.scoreManager.registerKill('boss');
    } else if (target instanceof ShooterImp) {
      this.deathEffect.spawnShooterImp(target.mesh.position);
      this.scoreManager.registerKill('shooter_imp');
    } else if (target instanceof Exploder) {
      this.deathEffect.spawnExploder(target.mesh.position);
      this.scoreManager.registerKill('exploder');
      // Exploder explosion damages nearby entities
      const hitPos = target.mesh.position.clone();
      const allNearby = [...this.imps, ...this.shooterImps, ...this.flyers]
        .filter(e => e.isAlive && e.mesh.position.distanceTo(hitPos) < 4);
      for (const e of allNearby) {
        e.takeDamage(5);
        if (!e.isAlive) this.handleEnemyDeath(e);
      }
      if (this.player && vec3ToThree(this.player.body.position).distanceTo(hitPos) < 4) {
        this.player.takeDamage(20);
        this.damageFlash.show();
        if (!this.player.isAlive) this.triggerPlayerDeath();
      }
    } else if (target instanceof Flyer) {
      this.deathEffect.spawnFlyer(target.mesh.position);
      this.scoreManager.registerKill('flyer');
    }

    this.audioManager.playSFX(
      target instanceof Imp ? 'imp_death' :
      target instanceof Boss ? 'boss_death' :
      target instanceof ShooterImp ? 'shooter_imp_death' :
      target instanceof Exploder ? 'exploder_death' :
      target instanceof Flyer ? 'flyer_death' : 'imp_death'
    );

    this.waveManager.onEnemyKilled();
    this.markForRemoval(target);
  }

  // ── Wave Manager Setup ──

  private setupWaveManager(): void {
    this.waveManager.onSpawnEnemies = (count: number, waveDef) => {
      if (!this.player) return;

      if (waveDef.hasBoss) {
        this.spawnBoss();
      } else {
        this.spawnEnemyWave(waveDef);
      }
    };

    this.waveManager.onSpawnHealthPacks = () => {
      const layout = this.arenaGenerator.generate(this.currentSeed, this.currentArenaTheme ?? undefined);
      for (const pos of layout.healthPackPositions) {
        this.spawnHealthPack(new THREE.Vector3(pos[0], pos[1], pos[2]));
      }
    };

    this.waveManager.onSpawnAmmoPickup = () => {
      // Spawn ammo at random position
      if (!this.player) return;
      const arenaHalf = (this.currentArenaTheme?.size.width ?? ARENA_SIZE) / 2 - 3;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * arenaHalf * 2,
        0.5,
        (Math.random() - 0.5) * arenaHalf * 2
      );
      // Place colored sphere as visual ammo pickup
      const geo = new THREE.SphereGeometry(0.15, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.healthPacks.push(mesh as any); // Quick hack - reuse health packs array for cleanup
    };

    this.waveManager.onPortalActivated = () => {
      // Show portal
      if (this.portalMesh) {
        this.portalMesh.visible = true;
        this.audioManager.playSFX('portal_open');
      }
    };

    this.waveManager.onWaveStateChange = (state: string, waveNum: number) => {
      if (state === 'spawning') {
        this.overlay.showNotification(`Wave ${waveNum}/5 incoming!`, '', 2);
        this.audioManager.setWave(waveNum - 1);
      } else if (state === 'intermission') {
        this.overlay.showNotification(`Wave ${waveNum - 1} complete!`, 'Get ready...', 3);
        // Reset supply stations
        for (const ss of this.supplyStations) ss.resetForWave();
      } else if (state === 'victory') {
        if (this.isLastWave()) {
          // Final victory — show portal
          this.waveManager.portalActive = true;
          if (this.portalMesh) this.portalMesh.visible = true;
        } else {
          this.gamePhase = 'victory';
          if (this.isTouchDevice) {
            this.overlay.showMobileVictory();
          } else {
            this.overlay.showVictory();
            this.inputManager.exitPointerLock();
          }
          this.hud.hide();
          this.crosshair.hide();
        }
      }
    };
  }

  private isLastWave(): boolean {
    return this.waveManager.currentWaveIndex >= 4; // TOTAL_WAVES - 1
  }

  private spawnEnemyWave(waveDef: any): void {
    if (!this.player) return;

    const layout = this.arenaGenerator.generate(this.currentSeed, this.currentArenaTheme ?? undefined);
    const spawnPoints = layout.enemySpawnPoints;
    const rng = new RNG(this.currentSeed + this.waveManager.currentWaveIndex + 1);

    let idx = 0;
    if (waveDef.enemies) {
      for (const group of waveDef.enemies) {
        for (let i = 0; i < group.count; i++) {
          const pt = spawnPoints[idx % spawnPoints.length];
          const pos = new THREE.Vector3(pt[0], pt[1] + 0.5, pt[2]);
          pos.x += (rng.next() - 0.5) * 2;
          pos.z += (rng.next() - 0.5) * 2;

          switch (group.type) {
            case 'imp': this.spawnImp(pos); break;
            case 'shooter_imp': this.spawnShooterImp(pos); break;
            case 'exploder': this.spawnExploder(pos); break;
            case 'flyer': this.spawnFlyer(pos); break;
          }
          idx++;
        }
      }
    } else {
      // Fallback to old behavior for backward compat
      for (let i = 0; i < waveDef.enemyCount; i++) {
        const pt = spawnPoints[idx % spawnPoints.length];
        const pos = new THREE.Vector3(pt[0], pt[1] + 0.5, pt[2]);
        pos.x += (rng.next() - 0.5) * 2;
        pos.z += (rng.next() - 0.5) * 2;
        this.spawnImp(pos);
        idx++;
      }
    }
  }

  // ── Arena Transition ──

  private transitionArena(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Serialize game state
    if (!this.player) return;
    const gameState = {
      player: {
        health: this.player.health,
        weapons: this.player.weapons.map(w => ({ type: this.getWeaponTypeKey(this.player!.weapons.indexOf(w)), ammo: w.getAmmo() })),
        currentWeaponIndex: this.player.currentWeaponIndex,
      },
      score: this.scoreManager.score,
      combo: this.scoreManager.combo,
      difficulty: this.difficulty,
      currentArenaIndex: this.currentArenaIndex,
    };

    // CSS fade to white
    const fadeOverlay = document.createElement('div');
    fadeOverlay.style.cssText = `
      position: fixed; inset: 0; background: white; z-index: 9999;
      opacity: 0; transition: opacity 0.5s; pointer-events: none;
    `;
    document.body.appendChild(fadeOverlay);
    requestAnimationFrame(() => { fadeOverlay.style.opacity = '1'; });

    setTimeout(() => {
      // Destroy current arena + entities
      this.clearEntities();
      this.arenaMesh.clear();
      this.scene.remove(this.arenaMesh.group);
      for (const trap of this.trapZones) { trap.destroy(); this.scene.remove(trap.mesh); }
      for (const ss of this.supplyStations) { ss.destroy(); this.scene.remove(ss.mesh); }
      for (const wp of this.weaponPickups) { this.scene.remove(wp.mesh); }
      this.trapZones = [];
      this.supplyStations = [];
      this.weaponPickups = [];
      this.powerUpManager?.clear();

      // Pick next arena
      this.currentArenaIndex++;
      const themeIdx = this.currentArenaIndex % ARENA_THEMES.length;
      this.currentArenaTheme = ARENA_THEMES[themeIdx];

      // Generate new arena
      this.currentSeed = Date.now();
      this.buildArena(this.currentSeed);

      // Restore player
      this.spawnPlayer();
      if (this.player) {
        this.player.health = gameState.player.health;
        this.player.currentWeaponIndex = gameState.player.currentWeaponIndex;
        // Restore weapons and ammo
        for (const wd of gameState.player.weapons) {
          const existingWeapon = this.player.weapons.find(w => this.getWeaponTypeKey(this.player!.weapons.indexOf(w)) === wd.type);
          if (existingWeapon) {
            existingWeapon.addAmmo(wd.ammo - existingWeapon.getAmmo());
          }
        }
        this.scoreManager.score = gameState.score;
        this.scoreManager.combo = gameState.combo;
        this.scoreManager.comboTimer = 0;
      }

      // Reset wave manager
      this.waveManager.startNextArenaWaveSet();

      // Fade back in
      fadeOverlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(fadeOverlay);
        this.isTransitioning = false;
      }, 500);
    }, 500);
  }

  private getWeaponTypeKey(index: number): string {
    const keys = ['plasma', 'shotgun', 'smg', 'rocket'];
    return keys[index] ?? 'plasma';
  }

  // ── Interact ──

  private handleInteract(): void {
    if (!this.player) return;

    // Check supply stations
    for (const ss of this.supplyStations) {
      if (ss.isReady) {
        const dist = vec3ToThree(this.player.body.position).distanceTo(ss.position);
        if (dist < ss.activationRadius) {
          ss.activate();
          this.player.heal(SUPPLY_STATION_HEAL);
          this.player.refillAllAmmo(1.0);
          this.audioManager.playSFX('supply_station');
          return;
        }
      }
    }
  }

  // ── MiniMap ──

  private getMiniMapEntities(): Array<{ type: any; position: THREE.Vector3; color?: string; size?: number }> {
    const entities: Array<{ type: any; position: THREE.Vector3; color?: string; size?: number }> = [];

    if (this.player) {
      entities.push({ type: 'player', position: vec3ToThree(this.player.body.position) });
    }

    for (const imp of this.imps) {
      if (imp.isAlive) entities.push({ type: 'enemy', position: imp.mesh.position });
    }
    for (const boss of this.bosses) {
      if (boss.isAlive) entities.push({ type: 'enemy', position: boss.mesh.position, size: 4 });
    }
    for (const s of this.shooterImps) {
      if (s.isAlive) entities.push({ type: 'enemy', position: s.mesh.position });
    }
    for (const e of this.exploders) {
      if (e.isAlive) entities.push({ type: 'enemy', position: e.mesh.position });
    }
    for (const f of this.flyers) {
      if (f.isAlive) entities.push({ type: 'enemy', position: f.mesh.position });
    }

    for (const wp of this.weaponPickups) {
      if (wp.isAvailable) entities.push({ type: 'pickup', position: wp.position });
    }

    if (this.portalMesh?.visible) {
      entities.push({ type: 'portal', position: this.portalMesh.position });
    }

    for (const ss of this.supplyStations) {
      entities.push({ type: 'supply_station', position: ss.position });
    }

    return entities;
  }

  // ── Input Setup ──

  private setupInput(): void {
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
  private readonly DEATH_ANIM_DURATION = 1.2;

  private triggerPlayerDeath(): void {
    if (this.isDying) return;
    this.isDying = true;
    this.deathAnimTimer = 0;

    // Sprint 4: Save high score
    this.scoreManager.onDeath();

    if (!this.isTouchDevice) {
      this.inputManager.exitPointerLock();
    }
  }

  private updateDeathAnimation(dt: number): void {
    if (!this.isDying) return;
    this.deathAnimTimer += dt;
    const t = Math.min(this.deathAnimTimer / this.DEATH_ANIM_DURATION, 1);
    const easeT = 1 - Math.pow(1 - t, 3);
    const deathPitch = easeT * (Math.PI / 3);
    this.camera.setDeathPitch(deathPitch);
    const deathRoll = easeT * 0.15;
    this.camera.setDeathRoll(deathRoll);

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

    // Sprint 4: Init subsystems
    this.powerUpManager = new PowerUpManager(this.scene);
    const diffConfig = DIFFICULTY_CONFIGS[this.difficulty];
    this.scoreManager.scoreMultiplier = diffConfig.scoreMultiplier;

    this.waveManager.startGame();
  }

  restart(): void {
    this.clearEntities();
    this.isDying = false;
    this.deathAnimTimer = 0;
    this.camera.setDeathPitch(0);
    this.camera.setDeathRoll(0);

    this.deathEffect.clear();
    this.damageFlash.reset();
    this.hitMarker.reset();
    this.screenShake.reset();
    this.muzzleFlash.clear();
    this.shellCasing.clear();
    this.powerUpManager?.clear();

    this.currentSeed = Date.now() + Math.floor(Math.random() * 100000);

    // Reset arena
    this.currentArenaIndex = 0;
    this.currentArenaTheme = ARENA_THEMES[0];
    this.buildArena(this.currentSeed);

    this.spawnPlayer();
    this.waveManager.reset();
    this.scoreManager.reset();
    this.camera.reset();
    this.inputAdapter.reset();

    this.hud.show();
    this.crosshair.show();
    this.gamePhase = 'menu';
    this.overlay.hideDeath();
    this.overlay.hideVictory();

    if (this.isTouchDevice) {
      this.overlay.showMobileStart();
    } else {
      this.overlay.showStart();
      this.inputManager.requestPointerLock(this.renderer.domElement);
      this.startPlaying();
    }
  }

  private clearEntities(): void {
    if (this.player) { this.player.destroy(); this.player = null; }
    for (const imp of this.imps) imp.destroy();
    this.imps.length = 0;
    for (const boss of this.bosses) boss.destroy();
    this.bosses.length = 0;
    for (const s of this.shooterImps) s.destroy();
    this.shooterImps.length = 0;
    for (const e of this.exploders) e.destroy();
    this.exploders.length = 0;
    for (const f of this.flyers) f.destroy();
    this.flyers.length = 0;
    for (const proj of this.projectiles) proj.destroy();
    this.projectiles.length = 0;
    for (const hp of this.healthPacks) hp.destroy();
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
      if (entity.mesh) this.scene.remove(entity.mesh);
      if (entity.body) this.physicsWorld.removeBody(entity.body);

      const removeFrom = (arr: any[], check: any) => {
        const idx = arr.indexOf(check);
        if (idx >= 0) arr.splice(idx, 1);
      };

      if (entity instanceof Imp) removeFrom(this.imps, entity);
      else if (entity instanceof Boss) removeFrom(this.bosses, entity);
      else if (entity instanceof Projectile) removeFrom(this.projectiles, entity);
      else if (entity instanceof HealthPack) removeFrom(this.healthPacks, entity);
      else if (entity instanceof ShooterImp) removeFrom(this.shooterImps, entity);
      else if (entity instanceof Exploder) removeFrom(this.exploders, entity);
      else if (entity instanceof Flyer) removeFrom(this.flyers, entity);
    }
    this.pendingRemovals.length = 0;
  }

  // ── Sprint 3: VisualViewport ──

  private setupVisualViewport(): void {
    const vv = window.visualViewport;
    if (!vv) return;
    this.boundViewportResize = () => {
      if (!this.touchAdapter) return;
      const vvInner = window.visualViewport;
      if (!vvInner) return;
      if (this.renderer) {
        this.renderer.setSize(vvInner.width, vvInner.height);
      }
      this.camera.setAspect(vvInner.width / vvInner.height);
    };
    vv.addEventListener('resize', this.boundViewportResize);
  }

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.setAspect(w / h);
  };

  destroy(): void {
    this.gameLoop.stop();
    this.inputAdapter.destroy();
    this.clearEntities();
    this.arenaMesh.clear();
    this.deathEffect.clear();
    this.muzzleFlash.clear();
    this.shellCasing.clear();
    this.powerUpManager?.clear();

    for (const trap of this.trapZones) trap.destroy();
    for (const ss of this.supplyStations) ss.destroy();
    this.trapZones = [];
    this.supplyStations = [];

    if (this.portalMesh) {
      this.scene.remove(this.portalMesh);
      this.portalMesh = null;
    }

    this.hud.destroy();

    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

interface EntityLike {
  mesh?: THREE.Object3D;
  body?: CANNON.Body;
}
