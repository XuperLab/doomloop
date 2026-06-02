# Acceptance Criteria — Doomloop Sprint 3 (iPhone Touch Control Polish)

All acceptance criteria are organized by feature ID (matching the PRD), with cross-references to user stories (US-###).

---

## F01 — Safe Area Insets

Priority: P0 | US-01, US-02, US-03

- **AC-F01-01** [P0] Joystick container uses `bottom: calc(env(safe-area-inset-bottom, 20px) + 30px)` instead of hardcoded `bottom: 30px`. On devices with `env()` support, the bottom safe area is respected. On devices without, the fallback 20px is used.
- **AC-F01-02** [P0] Fire button uses `right: calc(env(safe-area-inset-right, 20px) + max(20px, 5vw))` and `bottom: calc(env(safe-area-inset-bottom, 20px) + max(20px, 5vh))`.
- **AC-F01-03** [P0] Jump button uses `left` and `bottom` positions that account for safe area insets relative to the joystick position.
- **AC-F01-04** [P0] On an iPhone 14/15 emulator with notch, the fire button does not visually overlap the home indicator area.
- **AC-F01-05** [P0] On iPhone SE (no notch, `env()` fallback), controls use 20px safe area fallback and do not clip off-screen.
- **AC-F01-06** [P1] In landscape on iPhone 14 (notch on left edge), the joystick has `env(safe-area-inset-left)` clearance and is fully visible.
- **AC-F01-07** [P1] The existing `viewport-fit=cover` meta tag is preserved and correct.
- **AC-F01-08** [P2] Safe area CSS variables are isolated to a CSS custom property block for easy theme maintenance (e.g., `--safe-area-bottom: env(safe-area-inset-bottom, 20px)`).

---

## F02 — 300ms Tap Delay Elimination

Priority: P0 | US-04

- **AC-F02-01** [P0] `<html>` element has CSS `touch-action: manipulation` set.
- **AC-F02-02** [P0] All interactive touch control elements (fire button, jump button, joystick container, settings gear) have CSS `touch-action: manipulation` set.
- **AC-F02-03** [P0] Time from `touchstart` to `InputState.fire = true` is < 50ms on iPhone Safari (measured via instrumented `performance.now()`).
- **AC-F02-44** [P0] No ghost click or delayed double-registration occurs on fire button taps at any rate (single taps, rapid taps, hold-and-release).
- **AC-F02-05** [P1] Desktop experience is unaffected — `touch-action: manipulation` does not interfere with pointer lock or keyboard input.
- **AC-F02-06** [P1] `touchstart` listeners on buttons remain `{ passive: true }` (since manipulation is handled via CSS, not preventDefault).

---

## F03 — iOS Safari Gesture Suppression

Priority: P0 | US-06, US-07, US-08

- **AC-F03-01** [P0] `overscroll-behavior: none` is set on `<body>` (already present — verify in deployed CSS).
- **AC-F03-02** [P0] `position: fixed` is set on `<html>` (already present — verify).
- **AC-F03-03** [P0] `-webkit-touch-callout: none` is applied to `#touch-controls` (already present — verify).
- **AC-F03-04** [P0] `user-select: none` and `-webkit-user-select: none` are applied to all interactive touch elements (already on buttons — verify extended to joystick zones and hint elements).
- **AC-F03-05** [P0] Swiping left-to-right on the camera drag (right half of screen) does NOT trigger iOS back/forward navigation. Verified on iPhone Safari.
- **AC-F03-06** [P0] Swiping upward at the top of the viewport does NOT trigger pull-to-refresh. Verified on iPhone Safari.
- **AC-F03-07** [P0] Long-pressing the fire button for 3+ seconds does NOT trigger text selection or context menu. Verified on iPhone Safari.
- **AC-F03-08** [P1] `touchmove` listener on document has `{ passive: false }` and calls `e.preventDefault()` (already present — verify the call is effective).
- **AC-F03-09** [P1] Rubber-banding/overscroll is suppressed at all four viewport edges.
- **AC-F03-10** [P2] Desktop touch (touch-enabled laptop) still allows normal scrolling on non-game pages (no side effects — verify outside game context).

---

## F04 — iOS Address Bar Resize Handling

Priority: P0 | US-05

- **AC-F04-01** [P0] A `window.visualViewport.onresize` event handler is registered in `Game.init()`.
- **AC-F04-02** [P0] On address bar collapse (viewport height increases), all fixed-position touch control elements maintain their correct screen-relative positions without gap or overlap.
- **AC-F04-03** [P0] On address bar show (viewport height decreases), controls shift up/down appropriately so they remain visible and usable.
- **AC-F04-04** [P0] The game canvas (`<canvas>` or `#app` container) resizes to fill 100% of the visual viewport width and height on resize.
- **AC-F04-05** [P0] The joystick center (`recalcJoystickCenter()`) is recalculated on `visualViewport.resize` to account for any position shift.
- **AC-F04-06** [P1] No visual glitch, flicker, or black bar appears during address bar show/hide animation.
- **AC-F04-07** [P1] The resize handler debounces or throttles to avoid excessive recalculations during rapid address bar transitions (< 100ms between resize events).
- **AC-F04-08** [P2] Desktop browsers (no `visualViewport` API) are unaffected — event registration checks for API existence.

---

## F05 — Verify Sprint 2 Hotfixes

Priority: P0 | US-21, US-22, US-23, US-24, US-25, US-26

- **AC-F05-01** [P0] **Mobile Detection**: `isTouchDevice()` returns `false` on a device with both touch capability AND fine pointer (mouse) AND screen width >= 1024px. Desktop controls are used.
- **AC-F05-02** [P0] **Mobile Detection**: `isTouchDevice()` returns `true` on a device with touch AND (no fine pointer OR screen width < 1024px). Mobile controls are used.
- **AC-F05-03** [P0] **WASD**: On desktop, pressing `W` moves player forward, `S` backward, `A` left-strafe, `D` right-strafe. Shift sprints (player speed 18 vs walk 12). Space jumps.
- **AC-F05-04** [P0] **Enemy Overlap**: 10 Imps spawned simultaneously. After 2 seconds, no two Imps occupy the same collision volume (verified via `body.position` distance check or visual inspection).
- **AC-F05-05** [P0] **Game Over from Imp Contact**: Player with 10 HP (or less) takes contact damage from Imp → HP reaches 0 → `triggerPlayerDeath()` fires → death animation plays → death screen appears.
- **AC-F05-06** [P0] **Death Animation**: On death, camera pitch smoothly rotates ~60 degrees upward over 1.2 seconds, with ~10 degrees of roll. No instant cut.
- **AC-F05-07** [P0] **Lighting**: AmbientLight at 1.2, DirectionalLight at 2.0, HemisphereLight at 0.8. Arena interior is clearly visible from center spawn. Fog at 40–80.
- **AC-F05-08** [P0] **No Desktop Regression**: On desktop, no touch-control DOM is created (`#touch-controls` absent from DOM). Pointer lock functions as before. All keyboard bindings unchanged.
- **AC-F05-09** [P1] `tsc --noEmit` produces zero errors on the Sprint 3 codebase.
- **AC-F05-10** [P1] `npm run build` succeeds and produces a deployable `dist/` directory.

---

## F06 — Haptic Feedback (Vibration API)

Priority: P1 | US-09, US-10, US-11, US-12, US-13

- **AC-F06-01** [P1] On fire button `touchstart` (when weapon is off cooldown and haptic is enabled), `navigator.vibrate(20)` fires.
- **AC-F06-02** [P1] On enemy hit (player projectile collision with Imp/Boss and haptic enabled), `navigator.vibrate(50)` fires once.
- **AC-F06-03** [P1] On player `takeDamage()` and haptic enabled, `navigator.vibrate(100)` fires once.
- **AC-F06-04** [P1] Haptic on fire does NOT fire when weapon is on cooldown (respecting `PLASMA_FIRE_INTERVAL = 0.25`).
- **AC-F06-05** [P1] When haptic toggle is OFF, no `navigator.vibrate()` calls are made at all.
- **AC-F06-06** [P1] On devices without `navigator.vibrate` (iPad, desktop), no errors thrown. Wrapped in `typeof navigator.vibrate === 'function'` check and try/catch.
- **AC-F06-07** [P1] Haptic setting persists across page refreshes via localStorage (`doomloop_haptic_enabled` key). Default: `true`.
- **AC-F06-08** [P2] Repeated damage within 200ms only triggers one haptic pulse (debounced to avoid vibration spam from Imp contact chains).

---

## F07 — User-Configurable Touch Settings

Priority: P1 | US-14, US-15, US-16, US-17

- **AC-F07-01** [P1] A settings gear icon (⚙️, 16x16px) appears fixed at the top-right of mobile layout, within safe area (`top: calc(env(safe-area-inset-top, 10px) + 10px); right: calc(env(safe-area-inset-right, 10px) + 10px)`).
- **AC-F07-02** [P1] Tapping the gear opens a touch settings overlay with three controls: dead zone slider, sensitivity slider, haptic toggle.
- **AC-F07-03** [P1] Dead zone slider: range 4–20px, step 1px, default 8px. Current value displayed. Changes take effect on next `touchmove` frame.
- **AC-F07-04** [P1] Sensitivity slider: range 0.004–0.016 rad/px, step 0.001, default 0.008. Current value displayed. Changes take effect on next camera `touchmove` delta.
- **AC-F07-05** [P1] Haptic toggle: ON/OFF switch. Changes take effect immediately.
- **AC-F07-06** [P1] Settings overlay is dismissible by tapping outside its bounds or tapping a close (X) button.
- **AC-F07-07** [P1] All three settings are saved to localStorage under key `doomloop_touch_settings` as JSON (`{cameraSensitivity, joystickDeadZone, hapticFeedback}`). Matches `TouchSettings` interface.
- **AC-F07-08** [P1] On game init, saved settings are loaded and applied. If no saved settings exist, defaults are used (dead zone: 8, sensitivity: 0.008, haptics: true).
- **AC-F07-09** [P1] Settings panel does not pause the game — enemies continue moving, player can still be damaged (but controls stop responding while panel is focused).
- **AC-F07-10** [P2] Settings overlay is semi-transparent so the player can see the game behind it.
- **AC-F07-11** [P2] Desktop mode does NOT show the settings gear icon (mobile-only feature).

---

## F08 — Visual Feedback Enhancements

Priority: P1 | US-18, US-19, US-20

- **AC-F08-01** [P1] Fire button shows a CSS ripple effect on `touchstart`: a radial gradient circle expands from the touch point center to the button edge over 300ms, then fades.
- **AC-F08-02** [P1] Ripple effect does not block touch events — the button remains interactive during animation.
- **AC-F08-03** [P1] Jump button has a pulsing `box-shadow` glow animation in idle state (1.5s sine wave, green-tinted `rgba(68, 200, 68, 0.3)`).
- **AC-F08-04** [P1] Three distinct visual states on fire button: idle (opacity 0.4, no transform), pressed (opacity 1.0, scale 0.85, 0.1s transition), active-hold (opacity 0.8, scale 0.9, border glow pulse, after 300ms of continuous hold).
- **AC-F08-05** [P1] Three distinct visual states on jump button: idle (opacity 0.4 + glow pulse), pressed (opacity 1.0, scale 0.85), released (returns to idle).
- **AC-F08-06** [P1] All visual state transitions use CSS `transition` (0.1s ease for press/release, 0.3s for idle fade) — no JavaScript animation loops required.
- **AC-F08-07** [P2] Extreme rapid fire (tapping fire button as fast as possible) creates overlapping ripples — each tap spawns an independent ripple that doesn't interrupt previous ones.

---

## F09 — Control Hint Overlay for Mobile

Priority: P1 | US-01 through US-26 (cross-cutting)

- **AC-F09-01** [P1] First-time mobile players see a persistent control hints overlay on initial "Tap to start" screen, showing labeled control zones (joystick area, camera drag area, fire button, jump button) with brief descriptions.
- **AC-F09-02** [P1] The hints overlay is dismissible by tapping anywhere outside it or pressing a "Got it" button.
- **AC-F09-03** [P1] A "Show Help" option exists in the settings panel to re-display the hints.
- **AC-F09-04** [P1] The existing control hint labels (`.hint-label` elements) appear briefly (2 seconds) on first touch interaction, then fade to `opacity: 0` with a 1s transition.
- **AC-F09-05** [P2] A first-time-visit flag is stored in localStorage (`doomloop_help_shown`). If `true`, skip the hints overlay on subsequent sessions.

---

## F10 — Joystick Visual Enhancement (P2)

Priority: P2 | US-01 through US-26 (cross-cutting)

- **AC-F10-01** [P2] A subtle direction indicator (arrow or highlight) briefly appears on the joystick thumb when dragged, indicating movement direction.
- **AC-F10-02** [P2] When sprint is active, the joystick thumb border shifts to gold color (matching the existing `#sprint-indicator` color scheme).
- **AC-F10-03** [P2] No performance degradation from joystick visual enhancements — all changes are CSS-only, no canvas drawing.

---

## F11 — iOS Native Scroll Prevention (P2)

Priority: P2 | US-06 (enhancement)

- **AC-F11-01** [P2] A `touchmove` listener is registered on `document` with `{ passive: false }` that calls `e.preventDefault()` for any touch movement that originates within the game viewport.
- **AC-F11-02** [P2] The `touchmove` prevention does NOT break legitimate scrolling/zooming outside the game app (no side effects on non-game pages).

---

## F12 — Mobile HUD Optimization (P2)

Priority: P2 | US-01 through US-26 (cross-cutting)

- **AC-F12-01** [P2] On mobile (< 768px viewport width), HUD font sizes are reduced: HP label from 0.9rem to 0.7rem, wave display from 1.2rem to 0.9rem, kill count from 1rem to 0.8rem.
- **AC-F12-02** [P2] HP bar container top offset accounts for safe area: `top: calc(env(safe-area-inset-top, 10px) + 10px)`.
- **AC-F12-03** [P2] HP bar width scales with viewport: `width: min(250px, 50vmin)` on mobile.
- **AC-F12-04** [P2] On iPhone SE (375x667 viewport), all HUD elements are readable and don't overlap with touch controls.

---

## Non-Functional Requirements

- **AC-NFR01** [P0] iOS 15+ Safari compatibility — all touch interactions work correctly.
- **AC-NFR02** [P0] Zero desktop regression — `let inputAdapter: InputAdapter = this.inputManager` path untouched.
- **AC-NFR03** [P0] Touch `touchstart` → state change latency < 50ms (instrumented).
- **AC-NFR04** [P1] Controls maintain `env(safe-area-inset-*)` + 10px from screen edges.
- **AC-NFR05** [P1] Canvas + controls re-render within 100ms of `visualViewport.resize`.
- **AC-NFR06** [P1] Settings persist across page refreshes via localStorage.
- **AC-NFR07** [P1] No errors thrown from `navigator.vibrate()` on unsupported devices.
- **AC-NFR08** [P1] Entry bundle increase ≤ 5 KB gzipped. Zero new npm dependencies.
- **AC-NFR09** [P1] `tsc --noEmit` zero errors.
- **AC-NFR10** [P1] `npm run build` succeeds.
