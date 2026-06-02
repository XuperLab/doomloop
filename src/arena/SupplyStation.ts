import * as THREE from 'three';
import { SUPPLY_STATION_HEAL } from '../utils/Constants';

export class SupplyStation {
  position: THREE.Vector3;
  activationRadius: number;
  isReady = true;
  cooldownTimer = 0;
  healAmount: number;
  waveReset = true;

  mesh: THREE.Group;
  availableVisual: THREE.Mesh;
  cooldownVisual: THREE.Mesh;
  promptText: string;

  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  constructor(position: THREE.Vector3) {
    this.position = position;
    this.activationRadius = 2;
    this.healAmount = SUPPLY_STATION_HEAL;
    this.promptText = 'Press E / Tap to use';
    this.mesh = new THREE.Group();

    // Base platform
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.3, 8);
    this.geometries.push(baseGeo);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x886622,
      flatShading: true,
    });
    this.materials.push(baseMat);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    this.mesh.add(base);

    // Glowing column (available state)
    const columnGeo = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 6);
    this.geometries.push(columnGeo);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x44FF44,
      emissive: 0x44FF44,
      emissiveIntensity: 0.5,
      transparent: true,
    });
    this.materials.push(columnMat);
    this.availableVisual = new THREE.Mesh(columnGeo, columnMat);
    this.availableVisual.position.y = 0.7;
    this.mesh.add(this.availableVisual);

    // Dim column (cooldown state)
    const dimGeo = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 6);
    this.geometries.push(dimGeo);
    const dimMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      emissive: 0x222222,
      emissiveIntensity: 0.1,
      transparent: true,
    });
    this.materials.push(dimMat);
    this.cooldownVisual = new THREE.Mesh(dimGeo, dimMat);
    this.cooldownVisual.position.y = 0.7;
    this.cooldownVisual.visible = false;
    this.mesh.add(this.cooldownVisual);

    // Label ring
    const ringGeo = new THREE.TorusGeometry(0.6, 0.03, 6, 16);
    this.geometries.push(ringGeo);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x44FF44,
      transparent: true,
      opacity: 0.4,
    });
    this.materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.4;
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    this.mesh.position.copy(position);
  }

  getVisualState(): 'ready' | 'active' | 'cooldown' {
    if (this.cooldownTimer > 0) return 'cooldown';
    return 'ready';
  }

  activate(): void {
    if (!this.isReady) return;
    this.isReady = false;
    this.cooldownTimer = 10;
    this.availableVisual.visible = false;
    this.cooldownVisual.visible = true;
  }

  resetForWave(): void {
    if (!this.waveReset) return;
    this.isReady = true;
    this.cooldownTimer = 0;
    this.availableVisual.visible = true;
    this.cooldownVisual.visible = false;
  }

  update(dt: number): void {
    if (!this.isReady) {
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0) {
        this.isReady = true;
        this.availableVisual.visible = true;
        this.cooldownVisual.visible = false;
      }
    }

    // Rotation animation
    this.mesh.rotation.y += dt * 0.5;

    // Glow pulse
    const pulse = 0.3 + Math.sin(performance.now() / 300) * 0.2;
    if (this.isReady && this.availableVisual.material && !Array.isArray(this.availableVisual.material)) {
      (this.availableVisual.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  }

  destroy(): void {
    for (const geo of this.geometries) geo.dispose();
    for (const mat of this.materials) mat.dispose();
  }
}
