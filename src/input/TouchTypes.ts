/**
 * Internal tracking for each active touch point.
 */
export interface TouchTracking {
  identifier: number;
  clientX: number;
  clientY: number;
  zone: 'joystick' | 'camera' | 'fire' | 'jump' | 'unknown';
  startedAt: number; // performance.now() timestamp
}

/**
 * Joystick computed state (recalculated each touchmove frame).
 */
export interface JoystickState {
  active: boolean;
  normalizedX: number;  // -1..1
  normalizedY: number;  // -1..1
  angleDeg: number;     // 0-360 (0 = right, 90 = up)
  distance: number;     // 0..1 normalized
  isForward: boolean;   // within forward arc
}

/**
 * Touch sensitivity settings (P2 — persisted to localStorage).
 */
export interface TouchSettings {
  cameraSensitivity: number;  // default: TOUCH_SENSITIVITY
  joystickDeadZone: number;   // default: JOYSTICK_DEAD_ZONE
}

/**
 * DOM element references created and managed by TouchInputAdapter.
 */
export interface TouchControlDOM {
  container: HTMLElement;       // #touch-controls
  styleEl: HTMLStyleElement;    // injected <style>
  joystickBase: HTMLElement;    // #joystick-base
  joystickThumb: HTMLElement;   // #joystick-thumb
  sprintIndicator: HTMLElement; // #sprint-indicator
  fireButton: HTMLElement;      // #fire-button
  jumpButton: HTMLElement;      // #jump-button
  controlHint: HTMLElement;     // #control-hint
}
