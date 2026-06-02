import { MOUSE_SENSITIVITY } from '../utils/Constants';

export interface InputState {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  fire: boolean;
  jumpPressed: boolean;
  sprint: boolean;
  mouseDeltaX: number;
  mouseDeltaY: number;
  restart: boolean;
}

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private _mouseDeltaX = 0;
  private _mouseDeltaY = 0;
  private _firePressed = false;
  private _jumpPressed = false;
  private _restartPressed = false;
  private _sprintHeld = false;
  private _pointerLocked = false;
  private _onPointerLockChange: (() => void) | null = null;
  private _onPointerLockError: (() => void) | null = null;

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.set(e.code, true);
    if (e.code === 'KeyR') {
      this._restartPressed = true;
    }
    // Prevent space from scrolling
    if (e.code === 'Space') {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.set(e.code, false);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this._pointerLocked) {
      this._mouseDeltaX += e.movementX;
      this._mouseDeltaY += e.movementY;
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      this._firePressed = true;
    }
  };

  private onPointerLockChangeEvent = (): void => {
    this._pointerLocked = document.pointerLockElement !== null;
    if (this._pointerLocked) {
      this._onPointerLockChange?.();
    }
  };

  private onPointerLockErrorEvent = (): void => {
    this._onPointerLockError?.();
  };

  init(element: HTMLElement): void {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeEvent);
    document.addEventListener('pointerlockerror', this.onPointerLockErrorEvent);
  }

  destroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeEvent);
    document.removeEventListener('pointerlockerror', this.onPointerLockErrorEvent);
  }

  requestPointerLock(element: HTMLElement): void {
    element.requestPointerLock();
  }

  exitPointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  get isPointerLocked(): boolean {
    return this._pointerLocked;
  }

  set onPointerLockChange(cb: (() => void) | null) {
    this._onPointerLockChange = cb;
  }

  set onPointerLockError(cb: (() => void) | null) {
    this._onPointerLockError = cb;
  }

  /** Poll input state for current frame — resets frame-specific flags */
  poll(): InputState {
    const state: InputState = {
      moveForward: !!this.keys.get('KeyW'),
      moveBackward: !!this.keys.get('KeyS'),
      moveLeft: !!this.keys.get('KeyA'),
      moveRight: !!this.keys.get('KeyD'),
      fire: this._firePressed,
      jumpPressed: this._jumpPressed,
      sprint: !!this.keys.get('ShiftLeft') || !!this.keys.get('ShiftRight'),
      mouseDeltaX: this._mouseDeltaX * MOUSE_SENSITIVITY,
      mouseDeltaY: this._mouseDeltaY * MOUSE_SENSITIVITY,
      restart: this._restartPressed,
    };

    // Reset frame-specific flags
    this._firePressed = false;
    this._jumpPressed = false;
    this._restartPressed = false;
    this._mouseDeltaX = 0;
    this._mouseDeltaY = 0;

    return state;
  }

  /** Called externally when space is pressed for jump */
  notifyJumpPressed(): void {
    this._jumpPressed = true;
  }

  /** Called externally when R is pressed for restart */
  notifyRestartPressed(): void {
    this._restartPressed = true;
  }
}
