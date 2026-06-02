import * as THREE from 'three';
import {
  MINI_MAP_SIZE_DESKTOP,
  MINI_MAP_SIZE_MOBILE,
  MINI_MAP_PADDING,
  MINI_MAP_PLAYER_RADIUS,
  MINI_MAP_ENEMY_RADIUS,
} from '../utils/Constants';
import { isTouchDevice } from '../input/MobileDetector';

export interface MiniMapEntity {
  type: 'player' | 'enemy' | 'pickup' | 'portal' | 'supply_station';
  position: THREE.Vector3;
  color?: string;
  size?: number;
}

export class MiniMap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private container: HTMLElement | null = null;

  constructor() {
    this.size = isTouchDevice() ? MINI_MAP_SIZE_MOBILE : MINI_MAP_SIZE_DESKTOP;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = isTouchDevice() ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '8px';
    this.canvas.style.right = '8px';
    this.canvas.style.zIndex = '1000';
    this.canvas.style.borderRadius = '4px';
    this.canvas.style.border = '1px solid rgba(255,255,255,0.2)';
    this.canvas.style.pointerEvents = 'none';

    this.ctx = this.canvas.getContext('2d')!;

    document.body.appendChild(this.canvas);
  }

  update(
    playerPos: THREE.Vector3,
    heading: number,
    entities: MiniMapEntity[],
    arenaBounds: { width: number; depth: number }
  ): void {
    const ctx = this.ctx;
    const s = this.size;
    const pad = MINI_MAP_PADDING;
    const halfS = s / 2;

    // Clear
    ctx.clearRect(0, 0, s, s);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, s, s);

    ctx.save();

    // Rotate to player heading
    ctx.translate(halfS, halfS);
    ctx.rotate(-heading);

    // Arena outline
    const mapScaleX = (s - pad * 2) / arenaBounds.width;
    const mapScaleZ = (s - pad * 2) / arenaBounds.depth;
    const halfW = (arenaBounds.width / 2) * mapScaleX;
    const halfD = (arenaBounds.depth / 2) * mapScaleZ;

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-halfW, -halfD, halfW * 2, halfD * 2);

    ctx.restore();

    // Draw entities (relative to player, rotated)
    for (const entity of entities) {
      if (entity.type === 'player') {
        ctx.beginPath();
        ctx.fillStyle = '#00FF00';
        ctx.arc(halfS, halfS, MINI_MAP_PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      const dx = entity.position.x - playerPos.x;
      const dz = entity.position.z - playerPos.z;

      // Rotate by -heading (player-centric)
      const cos = Math.cos(-heading);
      const sin = Math.sin(-heading);
      const rx = dx * cos - dz * sin;
      const rz = dx * sin + dz * cos;

      const sx = halfS + rx * mapScaleX;
      const sy = halfS + rz * mapScaleZ;

      // Skip if off-map
      if (sx < 0 || sx > s || sy < 0 || sy > s) continue;

      const color = entity.color ?? this.getDefaultColor(entity.type);
      const radius = entity.size ?? this.getDefaultRadius(entity.type);

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private getDefaultColor(type: string): string {
    switch (type) {
      case 'enemy': return '#FF0000';
      case 'pickup': return '#FFFF00';
      case 'portal': return '#FFD700';
      case 'supply_station': return '#44FF44';
      default: return '#FFFFFF';
    }
  }

  private getDefaultRadius(type: string): number {
    switch (type) {
      case 'portal': return 4;
      case 'pickup': return 2;
      case 'supply_station': return 3;
      default: return 2;
    }
  }

  destroy(): void {
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
