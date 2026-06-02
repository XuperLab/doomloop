import { InputState } from '../engine/InputManager';

export interface InputAdapter {
  /** Poll current frame's input state, resetting frame-specific flags */
  poll(): InputState;

  /** Bind event listeners to the provided element */
  init(element: HTMLElement): void;

  /** Remove event listeners and clean up DOM */
  destroy(): void;

  /** Reset input state (called on game restart) */
  reset(): void;
}
