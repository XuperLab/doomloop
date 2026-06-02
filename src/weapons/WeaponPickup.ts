import * as THREE from 'three';
import { Weapon } from './Weapon';
import { AMMO_PICKUP_SMALL, WEAPON_SPAWNER_RESPAWN_TIME } from '../utils/Constants';

export class WeaponPickup {
  position: THREE.Vector3;
  weaponType: string;
  isAvailable = true;
  respawnTimer = 0;
  mesh: THREE.Group;
  bobPhase = 0;

  constructor(position: THREE.Vector3, weaponType: string) {
    this.position = position;
    this.weaponType = weaponType;
    this.mesh = new THREE.Group();

    // Ammo crate visual
    const crateGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x886644,
      flatShading: true,
    });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.y = 0.2;
    this.mesh.add(crate);

    // Weapon icon floating above
    const iconGeo = new THREE.SphereGeometry(0.15, 6, 6);
    const iconMat = new THREE.MeshBasicMaterial({
      color: this.getWeaponColor(),
    });
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.y = 0.6;
    this.mesh.add(icon);

    // Glow ring
    const ringGeo = new THREE.TorusGeometry(0.3, 0.03, 6, 12);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.getWeaponColor(),
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.6;
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    this.mesh.position.copy(position);
  }

  update(dt: number): void {
    this.bobPhase += dt * 2;
    // Bob up and down
    this.mesh.position.y = this.position.y + 0.3 + Math.sin(this.bobPhase) * 0.15;
    // Rotate
    this.mesh.rotation.y += dt * 1.5;

    if (!this.isAvailable) {
      this.respawnTimer -= dt;
      this.mesh.visible = false;
      if (this.respawnTimer <= 0) {
        this.isAvailable = true;
        this.mesh.visible = true;
        this.respawnTimer = 0;
      }
    }
  }

  collect(player: { weapons: Weapon[]; addWeapon: (w: Weapon) => void }): boolean {
    if (!this.isAvailable) return false;
    this.isAvailable = false;
    this.respawnTimer = WEAPON_SPAWNER_RESPAWN_TIME;
    return true;
  }

  private getWeaponColor(): number {
    switch (this.weaponType) {
      case 'plasma': return 0x4488FF;
      case 'shotgun': return 0xFFFF88;
      case 'smg': return 0xFF8800;
      case 'rocket': return 0xFF4400;
      default: return 0xFFFFFF;
    }
  }
}
