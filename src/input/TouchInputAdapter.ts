import { InputState } from '../engine/InputManager';
import { InputAdapter } from './InputAdapter';
import { TouchControlDOM, TouchSettings } from './TouchTypes';
import {
  JOYSTICK_MAX_RADIUS,
  JOYSTICK_DEAD_ZONE,
  TOUCH_SENSITIVITY,
  SPRINT_DOUBLE_TAP_WINDOW,
  DEFAULT_OPACITY,
  ACTIVE_OPACITY,
  CONTROL_FADE_DELAY,
  // Sprint 3: Haptic
  HAPTIC_FIRE_MS,
  HAPTIC_HIT_MS,
  HAPTIC_DAMAGE_MS,
  HAPTIC_DAMAGE_DEBOUNCE_MS,
  // Sprint 3: Settings
  SETTINGS_DEAD_ZONE_DEFAULT,
  SETTINGS_SENSITIVITY_DEFAULT,
  SETTINGS_HAPTIC_DEFAULT,
  LOCALSTORAGE_SETTINGS_KEY,
  LOCALSTORAGE_HELP_KEY,
  // Sprint 3: Visual Feedback
  FIRE_HOLD_ACTIVE_MS,
  HINT_LABEL_DURATION_MS,
  // Sprint 3: Viewport
  VISUAL_VIEWPORT_DEBOUNCE_MS,
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
  // Sprint 3: Settings gear + help overlay event handlers
  private boundGearClick: ((e: TouchEvent) => void) | null = null;
  private boundSettingsDismiss: ((e: TouchEvent) => void) | null = null;
  private boundSettingsClose: (() => void) | null = null;
  private boundHelpDismiss: ((e: TouchEvent) => void) | null = null;
  // Sprint 3: Dead zone slider + sensi slider + haptic toggle bindings
  private boundDeadZoneChange: ((e: Event) => void) | null = null;
  private boundSensitivityChange: ((e: Event) => void) | null = null;
  private boundHapticToggle: (() => void) | null = null;
  private boundShowHelp: (() => void) | null = null;

  // Control fade timer (P2)
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Sprint 3: Settings (F07) ──
  private settings: TouchSettings = {
    cameraSensitivity: SETTINGS_SENSITIVITY_DEFAULT,
    joystickDeadZone: SETTINGS_DEAD_ZONE_DEFAULT,
    hapticFeedback: SETTINGS_HAPTIC_DEFAULT,
  };
  private settingsPanelOpen: boolean = false;
  private deadZoneSlider: HTMLInputElement | null = null;
  private sensitivitySlider: HTMLInputElement | null = null;

  // ── Sprint 3: Haptic Feedback (F06) ──
  private lastDamageHapticTime: number = 0;
  private hapticEnabled: boolean = true;

  // ── Sprint 3: Visual Feedback (F08) ──
  private fireHoldStartTime: number = 0;
  private fireHoldTimer: ReturnType<typeof setTimeout> | null = null;
  private isActiveHold: boolean = false;

  // ── Sprint 3: Help Overlay (F09) ──
  private helpHintFired: boolean = false;

  // ── Sprint 3: Viewport (F04) ──
  private boundViewportResize: (() => void) | null = null;
  private viewportResizeTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.loadSettings();
    this.bindEvents();
    this.setupViewportHandler();
    this.startFadeTimer();
    this.isInitialized = true;
  }

  destroy(): void {
    if (!this.isInitialized) return;
    this.unbindEvents();
    this.removeDOM();
    this.teardownViewportHandler();
    this.touches.clear();
    this.joystickTouchId = null;
    this.cameraTouchId = null;
    this.fireTouchId = null;
    this.jumpTouchId = null;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.fireHoldTimer) {
      clearTimeout(this.fireHoldTimer);
      this.fireHoldTimer = null;
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
    // Reset visual feedback state
    this.isActiveHold = false;
    this.fireHoldStartTime = 0;
    if (this.fireHoldTimer) {
      clearTimeout(this.fireHoldTimer);
      this.fireHoldTimer = null;
    }
  }

  // ── Sprint 3: Settings Load/Save (F07) ──

  private loadSettings(): void {
    const saved = localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings = {
          cameraSensitivity: typeof parsed.cameraSensitivity === 'number'
            ? parsed.cameraSensitivity : SETTINGS_SENSITIVITY_DEFAULT,
          joystickDeadZone: typeof parsed.joystickDeadZone === 'number'
            ? parsed.joystickDeadZone : SETTINGS_DEAD_ZONE_DEFAULT,
          hapticFeedback: typeof parsed.hapticFeedback === 'boolean'
            ? parsed.hapticFeedback : SETTINGS_HAPTIC_DEFAULT,
        };
      } catch {
        this.settings = {
          cameraSensitivity: SETTINGS_SENSITIVITY_DEFAULT,
          joystickDeadZone: SETTINGS_DEAD_ZONE_DEFAULT,
          hapticFeedback: SETTINGS_HAPTIC_DEFAULT,
        };
      }
    }
    this.applySettings(this.settings);
  }

  private saveSettings(): void {
    localStorage.setItem(LOCALSTORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
  }

  private applySettings(s: TouchSettings): void {
    this.settings = s;
    this.hapticEnabled = s.hapticFeedback;
    // The dead zone and sensitivity are read from Constants at runtime,
    // but settings override will be applied in the poll() and touch handlers.
    // For settings to take effect immediately, we communicate via the adapter state.
  }

  private getDeadZone(): number {
    return this.settings.joystickDeadZone;
  }

  private getSensitivity(): number {
    return this.settings.cameraSensitivity;
  }

  // ── Sprint 3: Haptic Feedback (F06) ──

  private triggerVibrate(ms: number): void {
    if (!this.hapticEnabled) return;
    if (typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(ms); } catch { /* silently ignore */ }
    }
  }

  /** Fire button haptic — 20ms short tap */
  fireHaptic(): void {
    this.triggerVibrate(HAPTIC_FIRE_MS);
  }

  /** Projectile hit haptic — 50ms */
  hitHaptic(): void {
    this.triggerVibrate(HAPTIC_HIT_MS);
  }

  /** Player damage haptic — 100ms with debounce */
  damageHaptic(): void {
    const now = performance.now();
    if (now - this.lastDamageHapticTime < HAPTIC_DAMAGE_DEBOUNCE_MS) return;
    this.lastDamageHapticTime = now;
    this.triggerVibrate(HAPTIC_DAMAGE_MS);
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

    // ── Sprint 3: Settings gear icon (F07) ──
    const gear = document.createElement('div');
    gear.id = 'settings-gear';
    gear.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
    container.appendChild(gear);

    // ── Sprint 3: Settings overlay (F07) ──
    const settingsOverlay = this.createSettingsOverlay();
    container.appendChild(settingsOverlay);

    // ── Sprint 3: Help overlay (F09) ──
    const helpOverlay = this.createHelpOverlay();
    container.appendChild(helpOverlay);

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
      settingsGear: gear,
      settingsOverlay,
      helpOverlay,
    };
  }

  // ── Sprint 3: Settings Overlay DOM (F07) ──

  private createSettingsOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';

    const panel = document.createElement('div');
    panel.id = 'settings-panel';

    panel.innerHTML = `
      <h2>Touch Settings</h2>
      <div class="setting-row">
        <span class="setting-label">Dead Zone: <span id="dead-zone-value">${this.settings.joystickDeadZone}px</span></span>
        <input type="range" id="dead-zone-slider" min="4" max="20" step="1" value="${this.settings.joystickDeadZone}">
      </div>
      <div class="setting-row">
        <span class="setting-label">Sensitivity: <span id="sensitivity-value">${this.settings.cameraSensitivity.toFixed(3)}</span></span>
        <input type="range" id="sensitivity-slider" min="0.004" max="0.016" step="0.001" value="${this.settings.cameraSensitivity}">
      </div>
      <div class="toggle-row">
        <span class="setting-label">Haptic Feedback</span>
        <div class="toggle-track ${this.settings.hapticFeedback ? 'active' : ''}" id="haptic-toggle">
          <div class="toggle-knob"></div>
        </div>
      </div>
      <div class="settings-actions">
        <button class="settings-btn" id="show-help-btn">Show Help</button>
        <button class="settings-btn" id="close-settings-btn">Close</button>
      </div>
    `;

    overlay.appendChild(panel);
    return overlay;
  }

  // ── Sprint 3: Help Overlay DOM (F09) ──

  private createHelpOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'help-overlay';

    overlay.innerHTML = `
      <div id="help-content">
        <h2>How to Play</h2>
        <div class="help-row">
          <span class="help-icon joystick-icon">◉</span>
          <span>JOYSTICK — Move / Sprint (double-tap forward)</span>
        </div>
        <div class="help-row">
          <span class="help-icon joystick-icon">▤</span>
          <span>RIGHT SIDE — Look / Aim</span>
        </div>
        <div class="help-row">
          <span class="help-icon fire-icon">✕</span>
          <span>FIRE — Shoot (hold for auto-fire)</span>
        </div>
        <div class="help-row">
          <span class="help-icon jump-icon">▲</span>
          <span>JUMP — Tap to jump</span>
        </div>
        <button class="help-got-it" id="help-got-it-btn">Got it!</button>
      </div>
    `;

    return overlay;
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

        // ── Sprint 3: Haptic + Ripple on fire (F06/F08) ──
        this.fireHaptic();
        this.dom!.fireButton.classList.remove('ripple');
        // Force reflow to restart animation
        void this.dom!.fireButton.offsetWidth;
        this.dom!.fireButton.classList.add('ripple');

        // ── Sprint 3: Start hold timer for active-hold state (F08) ──
        this.fireHoldStartTime = performance.now();
        this.isActiveHold = false;
        if (this.fireHoldTimer) clearTimeout(this.fireHoldTimer);
        this.fireHoldTimer = setTimeout(() => {
          if (this.fireTouchId !== null) {
            this.isActiveHold = true;
            this.dom!.fireButton.classList.remove('active');
            this.dom!.fireButton.classList.add('active-hold');
          }
        }, FIRE_HOLD_ACTIVE_MS);
      };

      this.boundFireEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.fireTouchId) {
            this.state.fire = false;
            this.fireTouchId = null;
            this.dom!.fireButton.classList.remove('active');
            this.dom!.fireButton.classList.remove('active-hold');
            this.dom!.fireButton.classList.remove('ripple');
            break;
          }
        }
        // Clear hold timer
        if (this.fireHoldTimer) {
          clearTimeout(this.fireHoldTimer);
          this.fireHoldTimer = null;
        }
        this.isActiveHold = false;
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

      // ── Sprint 3: Settings gear click (F07) ──
      this.boundGearClick = (e: TouchEvent) => {
        e.stopPropagation();
        this.openSettings();
      };
      this.dom.settingsGear.addEventListener('touchstart', this.boundGearClick, { passive: true });

      // ── Sprint 3: Settings overlay dismiss on backdrop tap (F07) ──
      this.boundSettingsDismiss = (e: TouchEvent) => {
        if (e.target === this.dom!.settingsOverlay) {
          this.closeSettings();
        }
      };
      this.dom.settingsOverlay.addEventListener('touchstart', this.boundSettingsDismiss, { passive: true });

      // ── Sprint 3: Settings controls (F07) ──
      this.boundDeadZoneChange = (e: Event) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        this.settings.joystickDeadZone = val;
        const valDisplay = document.getElementById('dead-zone-value');
        if (valDisplay) valDisplay.textContent = `${val}px`;
        this.saveSettings();
        this.applySettings(this.settings);
      };
      this.boundSensitivityChange = (e: Event) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.settings.cameraSensitivity = val;
        const valDisplay = document.getElementById('sensitivity-value');
        if (valDisplay) valDisplay.textContent = val.toFixed(3);
        this.saveSettings();
        this.applySettings(this.settings);
      };
      this.boundHapticToggle = () => {
        this.settings.hapticFeedback = !this.settings.hapticFeedback;
        this.saveSettings();
        this.applySettings(this.settings);
        // Update toggle visual
        const track = document.getElementById('haptic-toggle');
        if (track) {
          track.classList.toggle('active', this.settings.hapticFeedback);
        }
      };
      this.boundShowHelp = () => {
        this.closeSettings();
        this.showHelpOverlay();
      };
      this.boundSettingsClose = () => {
        this.closeSettings();
      };

      const dzSlider = document.getElementById('dead-zone-slider') as HTMLInputElement | null;
      const sensSlider = document.getElementById('sensitivity-slider') as HTMLInputElement | null;
      const hapticToggle = document.getElementById('haptic-toggle');
      const showHelpBtn = document.getElementById('show-help-btn');
      const closeBtn = document.getElementById('close-settings-btn');

      if (dzSlider) {
        this.deadZoneSlider = dzSlider;
        dzSlider.addEventListener('input', this.boundDeadZoneChange);
      }
      if (sensSlider) {
        this.sensitivitySlider = sensSlider;
        sensSlider.addEventListener('input', this.boundSensitivityChange);
      }
      if (hapticToggle) {
        hapticToggle.addEventListener('click', this.boundHapticToggle);
      }
      if (showHelpBtn) {
        showHelpBtn.addEventListener('click', this.boundShowHelp);
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', this.boundSettingsClose);
      }

      // ── Sprint 3: Help overlay dismiss (F09) ──
      this.boundHelpDismiss = (e: TouchEvent) => {
        if (e.target === this.dom!.helpOverlay || (e.target as HTMLElement).id === 'help-got-it-btn') {
          this.dismissHelpOverlay();
        }
      };
      this.dom.helpOverlay.addEventListener('touchstart', this.boundHelpDismiss, { passive: true });
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
      // Sprint 3: Settings gear
      if (this.boundGearClick) {
        this.dom.settingsGear.removeEventListener('touchstart', this.boundGearClick);
      }
      if (this.boundSettingsDismiss) {
        this.dom.settingsOverlay.removeEventListener('touchstart', this.boundSettingsDismiss);
      }
      // Sprint 3: Settings controls
      if (this.deadZoneSlider && this.boundDeadZoneChange) {
        this.deadZoneSlider.removeEventListener('input', this.boundDeadZoneChange);
      }
      if (this.sensitivitySlider && this.boundSensitivityChange) {
        this.sensitivitySlider.removeEventListener('input', this.boundSensitivityChange);
      }
      const hapticToggle = document.getElementById('haptic-toggle');
      if (hapticToggle && this.boundHapticToggle) {
        hapticToggle.removeEventListener('click', this.boundHapticToggle);
      }
      const showHelpBtn = document.getElementById('show-help-btn');
      if (showHelpBtn && this.boundShowHelp) {
        showHelpBtn.removeEventListener('click', this.boundShowHelp);
      }
      const closeBtn = document.getElementById('close-settings-btn');
      if (closeBtn && this.boundSettingsClose) {
        closeBtn.removeEventListener('click', this.boundSettingsClose);
      }
      // Sprint 3: Help overlay
      if (this.boundHelpDismiss) {
        this.dom.helpOverlay.removeEventListener('touchstart', this.boundHelpDismiss);
      }
    }

    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
    this.boundTouchCancel = null;
    this.boundFireStart = null;
    this.boundFireEnd = null;
    this.boundJumpStart = null;
    this.boundGearClick = null;
    this.boundSettingsDismiss = null;
    this.boundDeadZoneChange = null;
    this.boundSensitivityChange = null;
    this.boundHapticToggle = null;
    this.boundShowHelp = null;
    this.boundSettingsClose = null;
    this.boundHelpDismiss = null;
  }

  // ── Sprint 3: Settings Panel Open/Close (F07) ──

  private openSettings(): void {
    if (!this.dom) return;
    this.settingsPanelOpen = true;
    this.dom.settingsOverlay.classList.add('visible');
  }

  private closeSettings(): void {
    if (!this.dom) return;
    this.settingsPanelOpen = false;
    this.dom.settingsOverlay.classList.remove('visible');
  }

  // ── Sprint 3: Help Overlay Show/Dismiss (F09) ──

  showHelpOverlay(): void {
    if (!this.dom) return;
    this.dom.helpOverlay.classList.add('visible');
  }

  private dismissHelpOverlay(): void {
    if (!this.dom) return;
    this.dom.helpOverlay.classList.remove('visible');
    // Mark help as shown in localStorage
    localStorage.setItem(LOCALSTORAGE_HELP_KEY, 'true');
  }

  // ── Sprint 3: Viewport Handler (F04) ──

  private setupViewportHandler(): void {
    const vv = window.visualViewport;
    if (!vv) return;

    this.boundViewportResize = () => {
      if (this.viewportResizeTimer) clearTimeout(this.viewportResizeTimer);
      this.viewportResizeTimer = setTimeout(() => {
        if (!this.dom) return;
        const vvInner = window.visualViewport;
        if (!vvInner) return;

        // Reposition touch controls container to account for address bar
        const offsetTop = vvInner.offsetTop || 0;
        this.dom!.container.style.transform = `translateY(${-offsetTop}px)`;

        // Recalculate joystick center
        this.recalcJoystickCenter();
      }, VISUAL_VIEWPORT_DEBOUNCE_MS);
    };

    vv.addEventListener('resize', this.boundViewportResize);
  }

  private teardownViewportHandler(): void {
    if (this.boundViewportResize && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.boundViewportResize);
    }
    if (this.viewportResizeTimer) {
      clearTimeout(this.viewportResizeTimer);
      this.viewportResizeTimer = null;
    }
    this.boundViewportResize = null;
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

      // ── Sprint 3: First-touch hint label hide (F09) ──
      if (!this.helpHintFired && this.dom) {
        this.helpHintFired = true;
        setTimeout(() => {
          if (this.dom) {
            this.dom.controlHint.classList.remove('visible');
          }
        }, HINT_LABEL_DURATION_MS);
      }
    }
    this.resetFadeTimer();
  }

  private onTouchMove(e: TouchEvent): void {
    // Prevent default to block scroll/zoom on iOS
    // Sprint 3 (F11): Use { passive: false } to ensure scroll prevention works
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

        // Use dynamic dead zone from settings (F07)
        const effectiveDeadZone = this.getDeadZone();

        if (distance > effectiveDeadZone) {
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
        if (this.dom) {
          this.dom.fireButton.classList.remove('active');
          this.dom.fireButton.classList.remove('active-hold');
          this.dom.fireButton.classList.remove('ripple');
        }
        // Clear hold timer
        if (this.fireHoldTimer) {
          clearTimeout(this.fireHoldTimer);
          this.fireHoldTimer = null;
        }
        this.isActiveHold = false;
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
        if (this.dom) {
          this.dom.fireButton.classList.remove('active');
          this.dom.fireButton.classList.remove('active-hold');
          this.dom.fireButton.classList.remove('ripple');
        }
        if (this.fireHoldTimer) {
          clearTimeout(this.fireHoldTimer);
          this.fireHoldTimer = null;
        }
        this.isActiveHold = false;
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
      // Sprint 3 (F10): Add sprint-active class to thumb for gold border
      this.dom.joystickThumb.classList.add('sprint-active');
    } else {
      this.dom.joystickBase.classList.remove('sprint-active');
      this.dom.sprintIndicator.classList.remove('visible');
      this.dom.joystickThumb.classList.remove('sprint-active');
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
/* ── Sprint 3: Safe Area Insets (F01) ── */
:root {
  --safe-area-top: env(safe-area-inset-top, 20px);
  --safe-area-right: env(safe-area-inset-right, 20px);
  --safe-area-bottom: env(safe-area-inset-bottom, 20px);
  --safe-area-left: env(safe-area-inset-left, 20px);
  --control-margin: 10px;
  --joystick-bottom: calc(var(--safe-area-bottom) + var(--control-margin));
  --joystick-left: calc(var(--safe-area-left) + var(--control-margin));
  --fire-right: calc(var(--safe-area-right) + max(20px, 5vw));
  --fire-bottom: calc(var(--safe-area-bottom) + max(20px, 5vh));
  --hud-top: calc(var(--safe-area-top) + 10px);
}

/* ── Sprint 3: 300ms Tap Delay Elimination (F02) ── */
html { touch-action: manipulation; }

/* ── Touch Controls Container ── */
#touch-controls {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  display: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
#touch-controls.touch-device {
  display: block;
}

/* ── Virtual Joystick ── */
#joystick-container {
  position: fixed;
  left: var(--joystick-left);
  bottom: var(--joystick-bottom);
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

/* ── Sprint 3: Joystick Thumb Direction Indicator (F10) ── */
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
#joystick-thumb.sprint-active {
  background: rgba(255, 200, 50, 0.7);
  box-shadow: 0 0 8px rgba(255, 200, 50, 0.5);
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
  right: var(--fire-right);
  bottom: var(--fire-bottom);
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
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
  will-change: transform;
}
#fire-button.active {
  transform: scale(0.9);
  background: rgba(255, 68, 68, 0.7);
}

/* ── Sprint 3: Fire Button Active-Hold (F08) ── */
#fire-button.active-hold {
  opacity: 0.8;
  transform: scale(0.9);
  animation: hold-pulse 0.8s ease-in-out infinite;
}
@keyframes hold-pulse {
  0%, 100% { border-color: rgba(255, 68, 68, 0.6); }
  50%      { border-color: rgba(255, 68, 68, 1.0); }
}

/* ── Sprint 3: Fire Button Ripple Effect (F08) ── */
#fire-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
#fire-button.ripple::after {
  opacity: 1;
  animation: fire-ripple 0.3s ease-out forwards;
}
@keyframes fire-ripple {
  0%   { transform: scale(0.2); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
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
  left: max(calc(var(--joystick-left) + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: var(--joystick-bottom);
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
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s ease, background 0.15s ease, opacity 0.3s ease;
  cursor: default;
  box-shadow: 0 0 4px rgba(68, 200, 68, 0.3);
  animation: jump-glow 1.5s ease-in-out infinite;
}
#jump-button.active {
  transform: scale(0.9);
  background: rgba(68, 200, 68, 0.7);
}

/* ── Sprint 3: Jump Button Glow Animation (F08) ── */
@keyframes jump-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(68, 200, 68, 0.3); }
  50%      { box-shadow: 0 0 12px rgba(68, 200, 68, 0.5); }
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
  bottom: calc(var(--joystick-bottom) + 30vmin + 10px);
}
.hint-label[data-zone="right"] {
  right: 5%;
  top: 40%;
}
.hint-label[data-zone="fire"] {
  right: var(--fire-right);
  bottom: calc(var(--fire-bottom) + 12vmin + 8px);
}
.hint-label[data-zone="jump"] {
  left: max(calc(var(--joystick-left) + 30vmin + 20px), calc(5vw + 30vmin));
  bottom: calc(var(--joystick-bottom) + 10vmin + 8px);
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

/* ── Sprint 3: Settings Gear Icon (F07) ── */
#settings-gear {
  position: fixed;
  top: calc(var(--safe-area-top) + 10px);
  right: calc(var(--safe-area-right) + 10px);
  width: 32px;
  height: 32px;
  z-index: 65;
  pointer-events: all;
  touch-action: manipulation;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#settings-gear:hover,
#settings-gear:active {
  opacity: 0.8;
  transform: rotate(30deg);
}
#settings-gear svg {
  width: 24px;
  height: 24px;
  fill: rgba(255, 255, 255, 0.7);
}

/* ── Sprint 3: Settings Overlay (F07) ── */
#settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.65);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#settings-overlay.visible {
  display: flex;
}
#settings-panel {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px 28px;
  width: min(320px, 85vw);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #fff;
  pointer-events: all;
}
#settings-panel h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
  text-align: center;
}
#settings-panel .setting-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}
#settings-panel .setting-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}
#settings-panel .setting-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}
#settings-panel input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  pointer-events: all;
}
#settings-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  pointer-events: all;
}
#settings-panel .toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
#settings-panel .toggle-track {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  pointer-events: all;
}
#settings-panel .toggle-track.active {
  background: rgba(68, 200, 68, 0.6);
}
#settings-panel .toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s ease;
  pointer-events: none;
}
#settings-panel .toggle-track.active .toggle-knob {
  left: 22px;
}
#settings-panel .settings-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
#settings-panel .settings-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  pointer-events: all;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  transition: background 0.15s ease;
}
#settings-panel .settings-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

/* ── Sprint 3: Help Overlay (F09) ── */
#help-overlay {
  position: fixed;
  inset: 0;
  z-index: 75;
  background: rgba(0, 0, 0, 0.7);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
#help-overlay.visible {
  display: flex;
}
#help-content {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 28px 24px;
  width: min(320px, 85vw);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #fff;
  pointer-events: all;
  text-align: center;
}
#help-content h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
}
#help-content .help-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
}
#help-content .help-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  flex-shrink: 0;
}
#help-content .help-icon.joystick-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
#help-content .help-icon.fire-icon {
  background: rgba(255, 68, 68, 0.3);
  border: 1px solid rgba(255, 68, 68, 0.5);
}
#help-content .help-icon.jump-icon {
  background: rgba(68, 200, 68, 0.3);
  border: 1px solid rgba(68, 200, 68, 0.5);
}
#help-content .help-got-it {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 40px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  pointer-events: all;
  margin-top: 12px;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

/* ── Sprint 3: Mobile HUD Optimization (F12) ── */
@media (max-width: 768px) {
  #hp-bar-container {
    width: min(250px, 50vmin);
  }
  #hp-bar-container {
    top: calc(var(--safe-area-top) + 10px) !important;
  }
  #wave-display {
    font-size: 1rem;
  }
  #kill-count {
    font-size: 0.9rem;
  }
}
`;
  }
}
