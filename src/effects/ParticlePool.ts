import * as THREE from 'three';

export interface ParticleInstance {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  color: THREE.Color;
  size: number;
  mesh: THREE.Points;
  isActive: boolean;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

export class ParticlePool {
  pool: ParticleInstance[] = [];
  activeCount = 0;
  maxSize: number;

  private scene: THREE.Scene;
  private config: {
    poolSize: number;
    particleCount: number;
    defaultLifetime: number;
    defaultSize: number;
    colors: number[];
    velocityMin: number;
    velocityMax: number;
  };

  constructor(
    scene: THREE.Scene,
    config: {
      poolSize: number;
      particleCount: number;
      defaultLifetime: number;
      defaultSize: number;
      colors: number[];
      velocities: { min: number; max: number };
    }
  ) {
    this.scene = scene;
    this.maxSize = config.poolSize;
    this.config = {
      ...config,
      velocityMin: config.velocities.min,
      velocityMax: config.velocities.max,
    };

    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.maxSize; i++) {
      const positions = new Float32Array(this.config.particleCount * 3);
      const colors = new Float32Array(this.config.particleCount * 3);
      const sizes = new Float32Array(this.config.particleCount);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: this.config.defaultSize,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Points(geometry, material);
      mesh.visible = false;
      mesh.frustumCulled = false;

      const instance: ParticleInstance = {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        lifetime: 0,
        maxLifetime: 0,
        color: new THREE.Color(),
        size: this.config.defaultSize,
        mesh,
        isActive: false,
        geometry,
        material,
      };

      this.pool.push(instance);
    }
  }

  acquire(): ParticleInstance | null {
    for (const p of this.pool) {
      if (!p.isActive) {
        p.isActive = true;
        this.activeCount++;
        return p;
      }
    }
    return null;
  }

  release(instance: ParticleInstance): void {
    if (!instance.isActive) return;
    instance.isActive = false;
    instance.mesh.visible = false;
    this.activeCount--;
  }

  emit(
    position: THREE.Vector3,
    count: number = 1,
    color: THREE.Color = new THREE.Color(0xFFFFFF),
    lifetime: number = this.config.defaultLifetime,
    size: number = this.config.defaultSize,
    velocity?: THREE.Vector3
  ): void {
    const instance = this.acquire();
    if (!instance) return;

    instance.position.copy(position);
    instance.lifetime = lifetime;
    instance.maxLifetime = lifetime;
    instance.color.copy(color);
    instance.size = size;

    if (velocity) {
      instance.velocity.copy(velocity);
    } else {
      // Random velocity
      instance.velocity.set(
        (Math.random() - 0.5) * (this.config.velocityMax - this.config.velocityMin),
        Math.random() * this.config.velocityMax,
        (Math.random() - 0.5) * (this.config.velocityMax - this.config.velocityMin)
      );
    }

    // Update geometry attributes
    const positions = instance.geometry.attributes.position.array as Float32Array;
    const colors = instance.geometry.attributes.color.array as Float32Array;
    const sizes = instance.geometry.attributes.size.array as Float32Array;
    const pCount = this.config.particleCount;

    for (let i = 0; i < pCount; i++) {
      if (i < count) {
        positions[i * 3] = position.x + (Math.random() - 0.5) * 0.2;
        positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.2;
        positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.2;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = size;
      } else {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        sizes[i] = 0;
      }
    }

    instance.geometry.attributes.position.needsUpdate = true;
    instance.geometry.attributes.color.needsUpdate = true;
    instance.geometry.attributes.size.needsUpdate = true;

    instance.mesh.visible = true;
    this.scene.add(instance.mesh);
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.isActive) continue;

      p.lifetime -= dt;

      // Update position by velocity
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;

      // Apply gravity for some particles
      p.velocity.y += -10 * dt;

      // Update geometry
      const positions = p.geometry.attributes.position.array as Float32Array;
      const count = this.config.particleCount;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += p.velocity.x * dt;
        positions[i * 3 + 1] += p.velocity.y * dt;
        positions[i * 3 + 2] += p.velocity.z * dt;
      }
      p.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const alpha = Math.max(0, p.lifetime / p.maxLifetime);
      p.material.opacity = alpha * 0.8;

      if (p.lifetime <= 0) {
        this.scene.remove(p.mesh);
        this.release(p);
      }
    }
  }

  clear(): void {
    for (const p of this.pool) {
      if (p.isActive) {
        this.scene.remove(p.mesh);
        p.isActive = false;
        p.mesh.visible = false;
      }
    }
    this.activeCount = 0;
  }
}
