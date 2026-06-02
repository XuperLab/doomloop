import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  ArenaLayout,
  COLORS,
  COLLISION_GROUPS,
} from '../utils/Constants';

export class ArenaMesh {
  readonly group: THREE.Group;
  readonly collisionBodies: CANNON.Body[] = [];

  private physicsWorld: PhysicsWorld;

  constructor(physicsWorld: PhysicsWorld) {
    this.physicsWorld = physicsWorld;
    this.group = new THREE.Group();
  }

  /** Build arena from layout data */
  build(layout: ArenaLayout): void {
    this.clear();

    // Floor
    this.createFloor(layout);

    // Walls (north, south, east, west)
    for (const wall of layout.walls) {
      this.createWall(wall);
    }

    // Pillars
    for (const pillar of layout.pillars) {
      this.createPillar(pillar);
    }
  }

  private createFloor(layout: ArenaLayout): void {
    const floorGeo = new THREE.PlaneGeometry(layout.size.width, layout.size.depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      flatShading: true,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -0.01, 0); // Slightly below y=0
    this.group.add(floorMesh);

    // Procedural grid lines (thin lines on floor)
    const gridHelper = new THREE.GridHelper(
      layout.size.width,
      Math.round(layout.size.width / 4),
      0x555555,
      0x444444
    );
    gridHelper.position.y = 0;
    this.group.add(gridHelper);

    // Floor physics body (static plane)
    const floorBody = this.physicsWorld.createStaticBody(
      new CANNON.Plane(),
      [0, 0, 0],
      COLLISION_GROUPS.ARENA,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE
    );
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.physicsWorld.addBody(floorBody);
    this.collisionBodies.push(floorBody);
  }

  private createWall(wall: ArenaLayout['walls'][0]): void {
    const [width, height, depth] = wall.size;
    const [x, y, z] = wall.position;

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.group.add(mesh);

    // Physics body
    const body = this.physicsWorld.createStaticBody(
      new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
      [x, y, z],
      COLLISION_GROUPS.ARENA,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE
    );
    this.physicsWorld.addBody(body);
    this.collisionBodies.push(body);
  }

  private createPillar(pillar: ArenaLayout['pillars'][0]): void {
    const [x, y, z] = pillar.position;

    if (pillar.shape === 'box') {
      const [w, d] = pillar.size ?? [2, 2];
      const h = pillar.height;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.PILLAR,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      this.group.add(mesh);

      // Physics
      const body = this.physicsWorld.createStaticBody(
        new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
        [x, h / 2, z],
        COLLISION_GROUPS.ARENA,
        COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE
      );
      this.physicsWorld.addBody(body);
      this.collisionBodies.push(body);
    } else {
      const radius = pillar.radius ?? 1;
      const h = pillar.height;
      const geo = new THREE.CylinderGeometry(radius, radius, h, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.PILLAR,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      this.group.add(mesh);

      // Physics
      const body = this.physicsWorld.createStaticBody(
        new CANNON.Cylinder(radius, radius, h, 8),
        [x, h / 2, z],
        COLLISION_GROUPS.ARENA,
        COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.BOSS_PROJECTILE
      );
      this.physicsWorld.addBody(body);
      this.collisionBodies.push(body);
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
  }
}
