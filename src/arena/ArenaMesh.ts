import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  ArenaLayout,
  COLORS,
  COLLISION_GROUPS,
} from '../utils/Constants';
import { ArenaTheme } from './ArenaTheme';

export class ArenaMesh {
  readonly group: THREE.Group;
  readonly collisionBodies: CANNON.Body[] = [];

  private physicsWorld: PhysicsWorld;
  private currentTheme: ArenaTheme | null = null;
  private decorationMeshes: THREE.Object3D[] = [];
  private fog: THREE.Fog | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private dirLight: THREE.DirectionalLight | null = null;

  constructor(physicsWorld: PhysicsWorld) {
    this.physicsWorld = physicsWorld;
    this.group = new THREE.Group();
  }

  /** Build arena from layout data with optional theme */
  build(layout: ArenaLayout, theme?: ArenaTheme, scene?: THREE.Scene): void {
    this.clear();
    this.currentTheme = theme ?? null;

    // Setup scene lighting/fog
    if (theme && scene) {
      this.setupSceneLighting(theme, scene);
    }

    this.createFloor(layout, theme);
    this.createWalls(layout, theme);
    this.createPillars(layout, theme);
    this.createDecorations(theme);
  }

  private setupSceneLighting(theme: ArenaTheme, scene: THREE.Scene): void {
    // Remove existing fog
    if (scene.fog) scene.fog = null;
    scene.fog = new THREE.Fog(theme.colors.fog, theme.lighting.fogNear, theme.lighting.fogFar);
    this.fog = scene.fog as THREE.Fog;

    // Ambient
    scene.traverse((child) => {
      if (child instanceof THREE.AmbientLight) {
        child.color.setHex(theme.colors.ambient);
        child.intensity = theme.lighting.ambientIntensity;
        this.ambientLight = child;
      }
      if (child instanceof THREE.DirectionalLight) {
        child.color.setHex(theme.lighting.directional.color);
        child.intensity = theme.lighting.directional.intensity;
        child.position.set(...theme.lighting.directional.position);
        this.dirLight = child;
      }
    });
  }

  private createFloor(layout: ArenaLayout, theme?: ArenaTheme): void {
    const floorColor = theme?.colors.floor ?? COLORS.FLOOR;
    const floorGeo = new THREE.PlaneGeometry(layout.size.width, layout.size.depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      flatShading: true,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -0.01, 0);
    this.group.add(floorMesh);

    // Procedural grid lines
    if (theme?.floorPattern === 'grid' || !theme) {
      const gridHelper = new THREE.GridHelper(
        layout.size.width,
        Math.round(layout.size.width / 4),
        0x555555,
        0x444444
      );
      gridHelper.position.y = 0;
      this.group.add(gridHelper);
    }

    // Floor physics body
    const floorBody = this.physicsWorld.createStaticBody(
      new CANNON.Plane(),
      [0, 0, 0],
      COLLISION_GROUPS.ARENA,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE | COLLISION_GROUPS.FLYER
    );
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.physicsWorld.addBody(floorBody);
    this.collisionBodies.push(floorBody);
  }

  private createWalls(layout: ArenaLayout, theme?: ArenaTheme): void {
    const wallColor = theme?.colors.wall ?? COLORS.WALL;
    for (const wall of layout.walls) {
      const [width, height, depth] = wall.size;
      const [x, y, z] = wall.position;

      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshStandardMaterial({
        color: wallColor,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.group.add(mesh);

      const body = this.physicsWorld.createStaticBody(
        new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
        [x, y, z],
        COLLISION_GROUPS.ARENA,
        COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE | COLLISION_GROUPS.FLYER
      );
      this.physicsWorld.addBody(body);
      this.collisionBodies.push(body);
    }
  }

  private createPillars(layout: ArenaLayout, theme?: ArenaTheme): void {
    const pillarColor = theme?.colors.pillar ?? COLORS.PILLAR;
    for (const pillar of layout.pillars) {
      const [x, y, z] = pillar.position;

      if (pillar.shape === 'box') {
        const [w, d] = pillar.size ?? [2, 2];
        const h = pillar.height;
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
          color: pillarColor,
          flatShading: true,
          emissive: theme?.colors.pillarEmissive,
          emissiveIntensity: theme?.colors.pillarEmissive ? 0.3 : 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        this.group.add(mesh);

        const body = this.physicsWorld.createStaticBody(
          new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
          [x, h / 2, z],
          COLLISION_GROUPS.ARENA,
          COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE | COLLISION_GROUPS.FLYER
        );
        this.physicsWorld.addBody(body);
        this.collisionBodies.push(body);
      } else {
        const radius = pillar.radius ?? 1;
        const h = pillar.height;
        const geo = new THREE.CylinderGeometry(radius, radius, h, 8);
        const mat = new THREE.MeshStandardMaterial({
          color: pillarColor,
          flatShading: true,
          emissive: theme?.colors.pillarEmissive,
          emissiveIntensity: theme?.colors.pillarEmissive ? 0.3 : 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        this.group.add(mesh);

        const body = this.physicsWorld.createStaticBody(
          new CANNON.Cylinder(radius, radius, h, 8),
          [x, h / 2, z],
          COLLISION_GROUPS.ARENA,
          COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE | COLLISION_GROUPS.FLYER
        );
        this.physicsWorld.addBody(body);
        this.collisionBodies.push(body);
      }
    }
  }

  private createDecorations(theme?: ArenaTheme): void {
    if (!theme) return;

    // Torches
    if (theme.decorations.hasTorches && theme.decorations.torchesCount) {
      const count = theme.decorations.torchesCount ?? 3;
      const colors = theme.decorations.torchesColor ?? 0xFF8844;
      const halfW = theme.size.width / 2 - 2;
      const halfD = theme.size.depth / 2 - 2;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * halfW * 0.7;
        const z = Math.sin(angle) * halfD * 0.7;

        // Torch mesh (small cylinder + point light)
        const torchGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 4);
        const torchMat = new THREE.MeshBasicMaterial({ color: 0x884422 });
        const torch = new THREE.Mesh(torchGeo, torchMat);
        torch.position.set(x, 0.25, z);
        this.group.add(torch);
        this.decorationMeshes.push(torch);
      }
    }

    // Lava pools (for Lava Cavern)
    if (theme.decorations.hasLavaPools) {
      const positions = [
        [-8, 0, -8], [8, 0, 8], [-6, 0, 6], [6, 0, -6],
      ];
      for (const pos of positions) {
        const poolGeo = new THREE.CircleGeometry(1.2, 12);
        const poolMat = new THREE.MeshBasicMaterial({
          color: 0xFF4400,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(pos[0], 0.005, pos[2]);
        this.group.add(pool);
        this.decorationMeshes.push(pool);
      }
    }

    // Floating debris (for Void Nexus)
    if (theme.decorations.hasFloatingDebris && theme.decorations.debrisCount) {
      const count = theme.decorations.debrisCount ?? 5;
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * theme.size.width * 0.6;
        const z = (Math.random() - 0.5) * theme.size.depth * 0.6;
        const y = 2 + Math.random() * 4;

        const rockGeo = new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.2);
        const rockMat = new THREE.MeshBasicMaterial({
          color: 0x4466AA,
          transparent: true,
          opacity: 0.3,
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, y, z);
        this.group.add(rock);
        this.decorationMeshes.push(rock);
      }
    }
  }

  /** Clear all arena meshes and bodies */
  clear(): void {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      this.group.remove(child);
    }

    for (const body of this.collisionBodies) {
      this.physicsWorld.removeBody(body);
    }
    this.collisionBodies.length = 0;
    this.decorationMeshes.length = 0;
    this.fog = null;
    this.ambientLight = null;
    this.dirLight = null;
    this.currentTheme = null;
  }
}
