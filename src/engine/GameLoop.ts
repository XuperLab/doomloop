/**
 * Fixed-timestep game loop with accumulator pattern.
 * Physics runs at 1/60s fixed rate; rendering runs at display refresh rate.
 */
export class GameLoop {
  private readonly FIXED_DT: number;
  private readonly MAX_FRAME: number;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  private rafId = 0;

  // Callbacks set by Game.ts
  onFixedUpdate: ((dt: number) => void) | null = null;
  onRender: ((alpha: number) => void) | null = null;

  constructor(fixedDt: number = 1 / 60, maxFrame: number = 0.1) {
    this.FIXED_DT = fixedDt;
    this.MAX_FRAME = maxFrame;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.frame();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private frame = (): void => {
    if (!this.running) return;

    const now = performance.now() / 1000;
    let dt = now - this.lastTime;
    this.lastTime = now;

    // Cap to prevent spiral of death
    if (dt > this.MAX_FRAME) {
      dt = this.MAX_FRAME;
    }

    this.accumulator += dt;

    // Fixed-timestep updates
    while (this.accumulator >= this.FIXED_DT) {
      this.onFixedUpdate?.(this.FIXED_DT);
      this.accumulator -= this.FIXED_DT;
    }

    // Render with interpolation alpha
    const alpha = this.accumulator / this.FIXED_DT;
    this.onRender?.(alpha);

    this.rafId = requestAnimationFrame(this.frame);
  };
}
