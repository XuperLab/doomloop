import * as THREE from 'three';

export type TrapType = 'spikes' | 'geyser' | 'gravity_well';

export class TrapZone {
  position: THREE.Vector3;
  trapType: TrapType;
  damage: number;
  activationRadius: number;
  cooldown: number;
  cooldownTimer = 0;
  isReady = true;
  effectDuration: number;

  mesh: THREE.Group;
  visualIndicator: THREE.Mesh;
  activeMesh: THREE.Mesh | null = null;
  isActive = false;
  activeTimer = 0;

  // Gravity well properties
  knockbackDistance?: number;
  slowMultiplier?: number;
  slowDuration?: number;

  // Geometry references for disposal
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  constructor(
    position: THREE.Vector3,
    trapType: TrapType,
    damage: number,
    cooldown: number = 5,
    effectDuration: number = 1.5,
    knockbackDistance?: number,
    slowMultiplier?: number,
    slowDuration?: number,
  ) {
    this.position = position;
    this.trapType = trapType;
    this.damage = damage;
    this.activationRadius = 2;
    this.cooldown = cooldown;
    this.effectDuration = effectDuration;
    this.knockbackDistance = knockbackDistance;
    this.slowMultiplier = slowMultiplier;
    this.slowDuration = slowDuration;
    this.mesh = new THREE.Group();

    // Create visual indicator (floor zone)
    const indicatorColor = this.getIndicatorColor();
    const indicatorGeo = new THREE.CircleGeometry(1.5, 16);
    this.geometries.push(indicatorGeo);
    const indicatorMat = new THREE.MeshBasicMaterial({
      color: indicatorColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    this.materials.push(indicatorMat);
    this.visualIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    this.visualIndicator.rotation.x = -Math.PI / 2;
    this.visualIndicator.position.set(0, 0.01, 0);
    this.mesh.add(this.visualIndicator);

    // Border ring
    const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 8, 24);
    this.geometries.push(ringGeo);
    const ringMat = new THREE.MeshBasicMaterial({
      color: indicatorColor,
      transparent: true,
      opacity: 0.5,
    });
    this.materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.02, 0);
    this.mesh.add(ring);

    this.mesh.position.copy(position);
  }

  getVisualState(): 'ready' | 'active' | 'cooldown' {
    if (this.isActive) return 'active';
    if (!this.isReady) return 'cooldown';
    return 'ready';
  }

  activate(): void {
    if (!this.isReady) return;

    this.isReady = false;
    this.isActive = true;
    this.activeTimer = this.effectDuration;
    this.cooldownTimer = this.cooldown;

    // Show active mesh
    if (this.trapType === 'spikes') {
      this.createSpikes();
    } else if (this.trapType === 'geyser') {
      this.createGeyser();
    } else if (this.trapType === 'gravity_well') {
      this.createGravityWell();
    }

    // Pulse visual on activation
    this.pulseIndicator();
  }

  update(dt: number): void {
    // Active timer
    if (this.isActive) {
      this.activeTimer -= dt;
      if (this.activeTimer <= 0) {
        this.isActive = false;
        this.removeActiveMesh();
      }
    }

    // Cooldown recovery
    if (!this.isReady) {
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0) {
        this.isReady = true;
      }
    }

    // Idle animation — pulsing indicator
    const pulse = 0.3 + Math.sin(performance.now() / 500 + this.position.x) * 0.15;
    (this.visualIndicator.material as THREE.MeshBasicMaterial).opacity = pulse;
  }

  private getIndicatorColor(): number {
    switch (this.trapType) {
      case 'spikes': return 0x888888;
      case 'geyser': return 0xFF6600;
      case 'gravity_well': return 0x8844FF;
    }
  }

  private createSpikes(): void {
    const spikeGeo = new THREE.ConeGeometry(0.15, 0.5, 4);
    this.geometries.push(spikeGeo);
    const spikeMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA });
    this.materials.push(spikeMat);

    const group = new THREE.Group();
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.8;
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(Math.cos(angle) * r, 0.25, Math.sin(angle) * r);
      group.add(spike);
    }
    this.mesh.add(group);
    this.activeMesh = group as any;
  }

  private createGeyser(): void {
    const geo = new THREE.CylinderGeometry(0.1, 0.5, 2, 8);
    this.geometries.push(geo);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.6,
    });
    this.materials.push(mat);
    const geyser = new THREE.Mesh(geo, mat);
    geyser.position.set(0, 1, 0);
    this.mesh.add(geyser);
    this.activeMesh = geyser;

    // Fire particles (small spheres)
    for (let i = 0; i < 5; i++) {
      const emberGeo = new THREE.SphereGeometry(0.05, 4, 4);
      this.geometries.push(emberGeo);
      const emberMat = new THREE.MeshBasicMaterial({ color: 0xFF8800 });
      this.materials.push(emberMat);
      const ember = new THREE.Mesh(emberGeo, emberMat);
      ember.position.set(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 1,
        (Math.random() - 0.5) * 0.5,
      );
      this.mesh.add(ember);
    }
  }

  private createGravityWell(): void {
    const geo = new THREE.SphereGeometry(0.8, 12, 12);
    this.geometries.push(geo);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x8844FF,
      transparent: true,
      opacity: 0.3,
    });
    this.materials.push(mat);
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(0, 0.8, 0);
    this.mesh.add(sphere);
    this.activeMesh = sphere;
  }

  private removeActiveMesh(): void {
    if (this.activeMesh) {
      this.mesh.remove(this.activeMesh);
      this.activeMesh = null;
    }
  }

  private pulseIndicator(): void {
    // Brief bright pulse
    const mat = this.visualIndicator.material as THREE.MeshBasicMaterial;
    if (!Array.isArray(mat)) {
      mat.opacity = 0.7;
      setTimeout(() => {
        if (mat && !Array.isArray(mat)) mat.opacity = 0.3;
      }, 200);
    }
  }

  destroy(): void {
    this.removeActiveMesh();
    for (const geo of this.geometries) geo.dispose();
    for (const mat of this.materials) mat.dispose();
  }
}
