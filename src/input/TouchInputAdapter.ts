import { InputState } from '../engine/InputManager';
import { InputAdapter } from './InputAdapter';
import { TouchControlDOM } from './TouchTypes';
import {
  JOYSTICK_MAX_RADIUS,
  JOYSTICK_DEAD_ZONE,
  TOUCH_SENSITIVITY,
  SPRINT_DOUBLE_TAP_WINDOW,
  DEFAULT_OPACITY,
  ACTIVE_OPACITY,
  CONTROL_FADE_DELAY,
} from '../utils/Constants';

/**
 * Touch input adapter for mobile devices.
 * Implements the same InputAdapter interface as Desktop InputManager.
 *
 * Zone layout (using touch.clientX/Y):
 *   Left  half (0–50%) → virtual joystick (movement)
 *   Right half (50–100%) → camera drag (look)
 *   Fire button → fixed DOM element (lower-right)
 *   Jump button → fixed DOM element (lower-left, above joystick)
 */
export class TouchInputAdapter implements InputAdapter {
  // ── Internal State ──

  private state: InputState = {
    moveForward: false, moveBackward: false,
    moveLeft: false, moveRight: false,
    fire: false, jumpPressed: false,
    sprint: false,
    mouseDeltaX: 0, mouseDeltaY: 0,
    restart: false,
    moveAnalogX: 0, moveAnalogZ: 0,
  };

  private isInitialized = false;
  private containerEl: HTMLElement | null = null;

  // Touch tracking — map of identifier → touch data
  private touches: Map<number, { identifier: number; zone: string }> = new Map();
  private joystickTouchId: number | null = null;
  private cameraTouchId: number | null = null;
  private fireTouchId: number | null = null;
  private jumpTouchId: number | null = null;

  // Joystick
  private joystickCenterX = 0;
  private joystickCenterY = 0;
  private joystickActive = false;

  // Camera drag
  private cameraLastX = 0;
  private cameraLastY = 0;

  // Sprint
  private sprintActive = false;
  private lastForwardReleaseTime = 0;

  // DOM elements (created in init)
  private dom: TouchControlDOM | null = null;

  // Bound event handlers (for removal in destroy)
  private boundTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: ((e: TouchEvent) => void) | null = null;
  private boundTouchCancel: ((e: TouchEvent) => void) | null = null;
  private boundFireStart: ((e: TouchEvent) => void) | null = null;
  private boundFireEnd: ((e: TouchEvent) => void) | null = null;
  private boundJumpStart: ((e: TouchEvent) => void) | null = null;

  // Control fade timer (P2)
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  // ── InputAdapter Implementation ──

  poll(): InputState {
    // Apply touch sensitivity to camera deltas in the returned state
    const result: InputState = {
      moveForward: this.state.moveForward,
      moveBackward: this.state.moveBackward,
      moveLeft: this.state.moveLeft,
      moveRight: this.state.moveRight,
      fire: this.state.fire,
      jumpPressed: this.state.jumpPressed,
      sprint: this.state.sprint,
      mouseDeltaX: this.state.mouseDeltaX * TOUCH_SENSITIVITY,
      mouseDeltaY: this.state.mouseDeltaY * TOUCH_SENSITIVITY,
      restart: this.state.restart,
      moveAnalogX: this.state.moveAnalogX,
      moveAnalogZ: this.state.moveAnalogZ,
    };

    // Reset frame-specific flags
    this.state.jumpPressed = false;
    this.state.restart = false;
    this.state.mouseDeltaX = 0;
    this.state.mouseDeltaY = 0;

    return result;
  }

  init(element: HTMLElement): void {
    if (this.isInitialized) return;
    this.containerEl = element;
    this.createDOM();
    this.bindEvents();
    this.startFadeTimer();
    this.isInitialized = true;
  }

  destroy(): void {
    if (!this.isInitialized) return;
    this.unbindEvents();
    this.removeDOM();
    this.touches.clear();
    this.joystickTouchId = null;
    this.cameraTouchId = null;
    this.fireTouchId = null;
    this.jumpTouchId = null;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.isInitialized = false;
  }

  reset(): void {
    this.sprintActive = false;
    this.state.sprint = false;
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.cameraTouchId = null;
    this.fireTouchId = null;
    this.jumpTouchId = null;
    this.touches.clear();
    this.updateSprintVisual();
    // Reset joystick thumb position
    this.updateJoystickVisual(0, 0);
  }

  // ── DOM Creation ──

  private createDOM(): void {
    // Create container
    const container = document.createElement('div');
    container.id = 'touch-controls';
    container.className = 'touch-device';

    // Invisible touch zones
    const leftZone = document.createElement('div');
    leftZone.id = 'touch-left-zone';
    const rightZone = document.createElement('div');
    rightZone.id = 'touch-right-zone';

    // Joystick
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'joystick-container';

    const joystickBase = document.createElement('div');
    joystickBase.id = 'joystick-base';
    const joystickThumb = document.createElement('div');
    joystickThumb.id = 'joystick-thumb';
    const sprintIndicator = document.createElement('div');
    sprintIndicator.id = 'sprint-indicator';
    sprintIndicator.textContent = 'SPRINT';

    joystickContainer.appendChild(joystickBase);
    joystickContainer.appendChild(joystickThumb);
    joystickContainer.appendChild(sprintIndicator);

    // Fire button
    const fireBtn = document.createElement('div');
    fireBtn.id = 'fire-button';
    fireBtn.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="2" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22" y2="12"/></svg>`;

    // Jump button
    const jumpBtn = document.createElement('div');
    jumpBtn.id = 'jump-button';
    jumpBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="12,20 12,4 5,11 12,4 19,11" stroke-linejoin="round" stroke-linecap="round"/></svg>`;

    // Control hint
    const hint = document.createElement('div');
    hint.id = 'control-hint';
    hint.className = 'visible';
    hint.innerHTML = `
      <div class="hint-label" data-zone="left">Move</div>
      <div class="hint-label" data-zone="right">Look</div>
      <div class="hint-label" data-zone="fire">Fire</div>
      <div class="hint-label" data-zone="jump">Jump</div>
    `;

    container.appendChild(leftZone);
    container.appendChild(rightZone);
    container.appendChild(joystickContainer);
    container.appendChild(fireBtn);
    container.appendChild(jumpBtn);
    container.appendChild(hint);

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.id = 'touch-controls-styles';
    styleEl.textContent = this.getCSS();

    document.head.appendChild(styleEl);
    document.body.appendChild(container);

    // Compute joystick center in screen coords
    this.recalcJoystickCenter();

    // Store references
    this.dom = {
      container,
      styleEl,
      joystickBase,
      joystickThumb,
      sprintIndicator,
      fireButton: fireBtn,
      jumpButton: jumpBtn,
      controlHint: hint,
    };
  }

  private removeDOM(): void {
    if (this.dom) {
      if (this.dom.container.parentNode) {
        this.dom.container.parentNode.removeChild(this.dom.container);
      }
      if (this.dom.styleEl.parentNode) {
        this.dom.styleEl.parentNode.removeChild(this.dom.styleEl);
      }
      this.dom = null;
    }
  }

  private recalcJoystickCenter(): void {
    // The joystick container is fixed at left:30px, bottom:30px
    // Center of the container in screen coordinates
    const joystickEl = document.getElementById('joystick-container');
    if (!joystickEl) return;

    const rect = joystickEl.getBoundingClientRect();
    this.joystickCenterX = rect.left + rect.width / 2;
    this.joystickCenterY = rect.top + rect.height / 2;
  }

  // ── Event Binding ──

  private bindEvents(): void {
    // Zone-level events on document
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);
    this.boundTouchCancel = this.onTouchCancel.bind(this);

    document.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    document.addEventListener('touchcancel', this.boundTouchCancel, { passive: true });

    // Button-level events
    if (this.dom) {
      this.boundFireStart = (e: TouchEvent) => {
        e.stopPropagation();
        const touch = e.changedTouches[0];
        this.fireTouchId = touch.identifier;
        this.state.fire = true;
        this.dom!.fireButton.classList.add('active');
        this.resetFadeTimer();
      };
      this.boundFireEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.fireTouchId) {
            this.state.fire = false;
            this.fireTouchId = null;
            this.dom!.fireButton.classList.remove('active');
            break;
          }
        }
        this.resetFadeTimer();
      };
      this.boundJumpStart = (e: TouchEvent) => {
        e.stopPropagation();
        const touch = e.changedTouches[0];
        this.jumpTouchId = touch.identifier;
        this.state.jumpPressed = true;
        this.dom!.jumpButton.classList.add('active');
        this.resetFadeTimer();
      };

      this.dom.fireButton.addEventListener('touchstart', this.boundFireStart, { passive: true });
      this.dom.fireButton.addEventListener('touchend', this.boundFireEnd, { passive: true });
      this.dom.fireButton.addEventListener('touchcancel', this.boundFireEnd, { passive: true });
      this.dom.jumpButton.addEventListener('touchstart', this.boundJumpStart, { passive: true });
      this.dom.jumpButton.addEventListener('touchend', () => {
        this.jumpTouchId = null;
        if (this.dom) this.dom.jumpButton.classList.remove('active');
        this.resetFadeTimer();
      }, { passive: true });
    }
  }

  private unbindEvents(): void {
    if (this.boundTouchStart) {
      document.removeEventListener('touchstart', this.boundTouchStart);
    }
    if (this.boundTouchMove) {
      document.removeEventListener('touchmove', this.boundTouchMove);
    }
    if (this.boundTouchEnd) {
      document.removeEventListener('touchend', this.boundTouchEnd);
    }
    if (this.boundTouchCancel) {
      document.removeEventListener('touchcancel', this.boundTouchCancel);
    }

    if (this.dom) {
      if (this.boundFireStart) {
        this.dom.fireButton.removeEventListener('touchstart', this.boundFireStart);
      }
      if (this.boundFireEnd) {
        this.dom.fireButton.removeEventListener('touchend', this.boundFireEnd);
        this.dom.fireButton.removeEventListener('touchcancel', this.boundFireEnd);
      }
      if (this.boundJumpStart) {
        this.dom.jumpButton.removeEventListener('touchstart', this.boundJumpStart);
      }
    }

    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
    this.boundTouchCancel = null;
    this.boundFireStart = null;
    this.boundFireEnd = null;
    this.boundJumpStart = null;
  }

  // ── Touch Event Handlers ──

  private onTouchStart(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zone = this.getTouchZone(touch.clientX, touch.clientY);

      // Skip if touch is consumed by a button
      if (zone === 'fire' || zone === 'jump') continue;

      this.touches.set(touch.identifier, {
        identifier: touch.identifier,
        zone,
      });

      if (zone === 'joystick' && this.joystickTouchId === null) {
        this.joystickTouchId = touch.identifier;
        this.joystickActive = true;
        // Recalc center in case of resize
        this.recalcJoystickCenter();
        this.updateJoystickVisual(0, 0);
        if (this.dom) this.dom.joystickThumb.classList.add('active');
      } else if (zone === 'camera' && this.cameraTouchId === null) {
        this.cameraTouchId = touch.identifier;
        this.cameraLastX = touch.clientX;
        this.cameraLastY = touch.clientY;
      }
    }
    this.resetFadeTimer();
  }

  private onTouchMove(e: TouchEvent): void {
    // Prevent default to block scroll/zoom on iOS
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const id = touch.identifier;

      // Handle joystick
      if (id === this.joystickTouchId) {
        const dx = touch.clientX - this.joystickCenterX;
        const dy = touch.clientY - this.joystickCenterY;

        // Calculate normalized direction
        let distance = Math.sqrt(dx * dx + dy * dy);
        let normX = 0;
        let normZ = 0;

        if (distance > JOYSTICK_DEAD_ZONE) {
          // Clamp to max radius
          const clampedDist = Math.min(distance, JOYSTICK_MAX_RADIUS);
          const ratio = clampedDist / distance;
          normX = dx * ratio / JOYSTICK_MAX_RADIUS;
          // Invert Y: screen Y down is positive, but we want forward = +Z
          normZ = -(dy * ratio / JOYSTICK_MAX_RADIUS);

          // Clamp to unit circle
          const length = Math.sqrt(normX * normX + normZ * normZ);
          if (length > 1) {
            normX /= length;
            normZ /= length;
          }
        }

        // Store state
        this.state.moveAnalogX = normX;
        this.state.moveAnalogZ = normZ;

        // Set boolean flags for backward compat
        this.state.moveForward = normZ > 0.3;
        this.state.moveBackward = normZ < -0.3;
        this.state.moveLeft = normX < -0.3;
        this.state.moveRight = normX > 0.3;

        // Update visual thumb position
        const thumbX = dx > 0
          ? Math.min(dx, JOYSTICK_MAX_RADIUS)
          : Math.max(dx, -JOYSTICK_MAX_RADIUS);
        const thumbY = dy > 0
          ? Math.min(dy, JOYSTICK_MAX_RADIUS)
          : Math.max(dy, -JOYSTICK_MAX_RADIUS);
        this.updateJoystickVisual(thumbX, thumbY);

        // Cancel fade on movement
        this.resetFadeTimer();
      }

      // Handle camera drag
      if (id === this.cameraTouchId) {
        const deltaX = touch.clientX - this.cameraLastX;
        const deltaY = touch.clientY - this.cameraLastY;

        this.state.mouseDeltaX += deltaX;
        this.state.mouseDeltaY += deltaY;

        this.cameraLastX = touch.clientX;
        this.cameraLastY = touch.clientY;

        this.resetFadeTimer();
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const id = touch.identifier;

      // Check for sprint double-tap on joystick release
      if (id === this.joystickTouchId) {
        // Compute the joystick angle at release
        const dx = touch.clientX - this.joystickCenterX;
        const dy = touch.clientY - this.joystickCenterY;

        if (this.isForwardDirection(dx, dy)) {
          const now = performance.now();
          if (now - this.lastForwardReleaseTime < SPRINT_DOUBLE_TAP_WINDOW) {
            this.toggleSprint();
          }
          this.lastForwardReleaseTime = now;
        }

        // Reset joystick
        this.joystickTouchId = null;
        this.joystickActive = false;
        this.state.moveAnalogX = 0;
        this.state.moveAnalogZ = 0;
        this.state.moveForward = false;
        this.state.moveBackward = false;
        this.state.moveLeft = false;
        this.state.moveRight = false;
        this.updateJoystickVisual(0, 0);
        if (this.dom) this.dom.joystickThumb.classList.remove('active');
      }

      // Release camera
      if (id === this.cameraTouchId) {
        this.cameraTouchId = null;
      }

      // Release buttons
      if (id === this.fireTouchId) {
        this.state.fire = false;
        this.fireTouchId = null;
        if (this.dom) this.dom.fireButton.classList.remove('active');
      }
      if (id === this.jumpTouchId) {
        this.jumpTouchId = null;
        if (this.dom) this.dom.jumpButton.classList.remove('active');
      }

      this.touches.delete(id);
    }
    this.resetFadeTimer();
  }

  private onTouchCancel(e: TouchEvent): void {
    // Treat cancel like end — release all touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const id = touch.identifier;

      if (id === this.joystickTouchId) {
        this.joystickTouchId = null;
        this.joystickActive = false;
        this.state.moveAnalogX = 0;
        this.state.moveAnalogZ = 0;
        this.state.moveForward = false;
        this.state.moveBackward = false;
        this.state.moveLeft = false;
        this.state.moveRight = false;
        this.updateJoystickVisual(0, 0);
        if (this.dom) this.dom.joystickThumb.classList.remove('active');
      }
      if (id === this.cameraTouchId) {
        this.cameraTouchId = null;
      }
      if (id === this.fireTouchId) {
        this.state.fire = false;
        this.fireTouchId = null;
        if (this.dom) this.dom.fireButton.classList.remove('active');
      }
      if (id === this.jumpTouchId) {
        this.jumpTouchId = null;
        if (this.dom) this.dom.jumpButton.classList.remove('active');
      }

      this.touches.delete(id);
    }
    this.resetFadeTimer();
  }

  // ── Zone Assignment ──

  private getTouchZone(clientX: number, clientY: number): 'joystick' | 'camera' | 'fire' | 'jump' {
    // Check fixed buttons first (highest priority)
    if (this.dom) {
      const fireRect = this.dom.fireButton.getBoundingClientRect();
      if (
        clientX >= fireRect.left && clientX <= fireRect.right &&
        clientY >= fireRect.top && clientY <= fireRect.bottom
      ) {
        return 'fire';
      }

      const jumpRect = this.dom.jumpButton.getBoundingClientRect();
      if (
        clientX >= jumpRect.left && clientX <= jumpRect.right &&
        clientY >= jumpRect.top && clientY <= jumpRect.bottom
      ) {
        return 'jump';
      }
    }

    // Check position relative to screen center
    if (clientX < window.innerWidth / 2) {
      return 'joystick'; // Left half
    } else {
      return 'camera';   // Right half
    }
  }

  // ── Joystick ──

  private isForwardDirection(dx: number, dy: number): boolean {
    // Forward in screen space = up = negative dy
    // The forward arc is the top 30% of the joystick (±67.5° from straight up)
    // Straight up in screen = (0, -1)
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return false; // At center, not forward

    const angle = Math.atan2(dy, dx); // radians from right
    // Convert to angle from straight-up
    const angleFromUp = Math.abs(angle + Math.PI / 2);
    // Normalize to [0, π]
    const normalizedAngle = angleFromUp > Math.PI
      ? 2 * Math.PI - angleFromUp
      : angleFromUp;

    // Forward arc: within ±67.5° of straight up = top 30% of circle
    return normalizedAngle <= Math.PI * 0.375; // 67.5° in radians
  }

  private toggleSprint(): void {
    this.sprintActive = !this.sprintActive;
    this.state.sprint = this.sprintActive;
    this.updateSprintVisual();
  }

  private updateSprintVisual(): void {
    if (!this.dom) return;
    if (this.sprintActive) {
      this.dom.joystickBase.classList.add('sprint-active');
      this.dom.sprintIndicator.classList.add('visible');
    } else {
      this.dom.joystickBase.classList.remove('sprint-active');
      this.dom.sprintIndicator.classList.remove('visible');
    }
  }

  private updateJoystickVisual(thumbX: number, thumbY: number): void {
    if (!this.dom) return;
    this.dom.joystickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;
  }

  // ── Control Fade (P2) ──

  private startFadeTimer(): void {
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      if (this.dom) {
        this.dom.container.classList.add('fade-controls');
      }
    }, CONTROL_FADE_DELAY);
  }

  private resetFadeTimer(): void {
    if (this.dom) {
      this.dom.container.classList.remove('fade-controls');
    }
    this.startFadeTimer();
  }

  // ── CSS Injection ──

  private getCSS(): string {
    return `
/* ── Touch Controls Container ── */
#touch-controls {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  display: none;
}
#touch-controls.touch-device {
  display: block;
}

/* ── Virtual Joystick ── */
#joystick-container {
  position: fixed;
  left: 30px;
  bottom: 30px;
  width: min(160px, 30vmin);
  height: min(160px, 30vmin);
  pointer-events: none;
  touch-action: none;
}
#joystick-base {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(160px, 30vmin);
  height: min(160px, 30vmin);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
  transition: border-color 0.2s ease, opacity 0.3s ease;
}
#joystick-base.sprint-active {
  border-color: rgba(255, 200, 50, 0.8);
}
#joystick-thumb {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(30px, 6vmin);
  height: min(30px, 6vmin);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  transition: background 0.15s ease, opacity 0.3s ease;
}
#joystick-thumb.active {
  background: rgba(255, 255, 255, 0.7);
}
#sprint-indicator {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 200, 50, 0.9);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-shadow: 0 0 4px rgba(0,0,0,0.8);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
#sprint-indicator.visible {
  opacity: 1;
}

/* ── Fire Button ── */
#fire-button {
  position: fixed;
  right: max(20px, 5vw);
  bottom: max(20px, 5vh);
  width: 70px;
  width: min(70px, 12vmin);
  height: min(70px, 12vmin);
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.4);
  border: 2px solid rgba(255, 68, 68, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
}
#fire-button.active {
  transform: scale(0.9);
  background: rgba(255, 68, 68, 0.7);
}
#fire-button svg {
  width: 60%;
  height: 60%;
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 2;
  pointer-events: none;
}

/* ── Jump Button ── */
#jump-button {
  position: fixed;
  left: max(calc(30px + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: max(30px, 5vh);
  width: 60px;
  width: min(60px, 10vmin);
  height: min(60px, 10vmin);
  border-radius: 50%;
  background: rgba(68, 200, 68, 0.4);
  border: 2px solid rgba(68, 200, 68, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
}
#jump-button.active {
  transform: scale(0.9);
  background: rgba(68, 200, 68, 0.7);
}
#jump-button svg {
  width: 60%;
  height: 60%;
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3;
  pointer-events: none;
}

/* ── Control Layout Hint ── */
#control-hint {
  position: fixed;
  inset: 0;
  z-index: 55;
  pointer-events: none;
  display: none;
}
#control-hint.visible {
  display: block;
}
.hint-label {
  position: absolute;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 6px rgba(0,0,0,0.8);
  pointer-events: none;
}
.hint-label[data-zone="left"] {
  left: 15%;
  bottom: calc(30px + 30vmin + 10px);
}
.hint-label[data-zone="right"] {
  right: 5%;
  top: 40%;
}
.hint-label[data-zone="fire"] {
  right: max(20px, 5vw);
  bottom: max(calc(20px + 12vmin + 8px), calc(5vh + 12vmin + 8px));
}
.hint-label[data-zone="jump"] {
  left: max(calc(30px + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: max(calc(30px + 10vmin + 8px), calc(5vh + 10vmin + 8px));
}

/* ── Fade controls when idle ── */
#touch-controls.fade-controls #joystick-base,
#touch-controls.fade-controls #joystick-thumb,
#touch-controls.fade-controls #fire-button,
#touch-controls.fade-controls #jump-button {
  opacity: 0.3;
  transition: opacity 0.5s ease;
}

/* ── iOS / mobile prevention ── */
.touch-device canvas {
  touch-action: none;
}
#touch-controls.touch-device {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}
`;
  }
}
