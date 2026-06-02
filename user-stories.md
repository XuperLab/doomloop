# User Stories — Doomloop Sprint 3 (iPhone Touch Control Polish)

## Epic 1: iOS Safe Area & Viewport Rendering

> *Touch controls must render correctly on every iPhone, regardless of notch, Dynamic Island, or home indicator.*

### US-01: Safe Area Respect
**As a** player on iPhone 14/15 (notch/Dynamic Island),  
**I want** the joystick, fire button, and jump button to not overlap the notch or Dynamic Island,  
**So that** I can access all controls without obstruction.

**Acceptance:** All touch control DOM elements use `env(safe-area-inset-*)` CSS variables for positioning. On an iPhone 15 Pro Max in portrait, the fire button in the bottom-right has at least 34px (`env(safe-area-inset-right)` + padding) from screen edge, and joystick has at least 34px from bottom screen edge (`env(safe-area-inset-bottom)` + padding). On iPhone SE (no notch), safe-area-inset values default to 20px.

---

### US-02: Home Indicator Avoidance
**As a** player on iPhone X or later,  
**I want** the fire button to not overlap the home indicator bar at the bottom of the screen,  
**So that** I don't accidentally trigger home gesture while trying to shoot.

**Acceptance:** Fire button and jump button have at least `env(safe-area-inset-bottom)` + 10px clearance from the bottom of the screen. On edge-to-edge iPhones, this means minimum 44px (34px safe area + 10px padding) from the visible bottom edge.

---

### US-03: Safe Area Landscape
**As a** player playing in landscape orientation on iPhone,  
**I want** touch controls to reposition correctly so they avoid the notch area (which is on the left or right edge in landscape),  
**So that** I can play without controls being hidden by the notch.

**Acceptance:** In landscape on iPhone 14, the notch is on the left edge. The joystick (bottom-left) must have at least `env(safe-area-inset-left)` clearance. In landscape on iPhone 15 Pro Max, the Dynamic Island is on the top edge — controls at the bottom are unaffected by top insets. Both cases verified.

---

### US-04: 300ms Delay Elimination
**As a** mobile gamer,  
**I want** the fire button to fire the instant I touch it,  
**So that** the game feels responsive and snappy like a native app.

**Acceptance:** `touch-action: manipulation` is applied to `<html>` and all interactive elements. Time from `touchstart` to state change is consistently < 50ms (measured via `performance.now()` instrumentation). No perceptible delay between touching fire button and seeing the projectile fire.

---

### US-05: Address Bar Resize Stability
**As a** player who scrolls up/down on the page (causing the iOS Safari address bar to hide/show),  
**I want** the game canvas and touch controls to stay correctly positioned,  
**So that** I don't lose my place or find controls have shifted.

**Acceptance:** The `window.visualViewport` resize event handler recalculates control positions within 100ms. On address bar collapse (visual viewport height increases), controls maintain their relative screen positions. On address bar show (visual viewport height decreases), controls shift up to stay visible. Canvas resizes correctly to fill the new visual viewport.

---

## Epic 2: iOS Gesture Suppression

> *No iOS Safari gestures should interrupt gameplay.*

### US-06: Swipe-Back Prevention
**As a** player dragging my finger left-to-right to aim (camera drag),  
**I want** iOS Safari to not interpret this as a "swipe back" gesture,  
**So that** I can aim freely without being navigated away from the game.

**Acceptance:** `touchmove.preventDefault()` on the camera drag zone and document level blocks iOS swipe-back/forward navigation. Verified on iPhone by dragging left-to-right across the right half (camera zone) — no navigation action occurs. The back-swipe gesture from the very left edge of the screen is still suppressed.

---

### US-07: Pull-to-Refresh Prevention
**As a** player moving the joystick upward (which creates downward scroll momentum),  
**I want** the page to not refresh due to pull-to-refresh,  
**So that** my game session continues uninterrupted.

**Acceptance:** `overscroll-behavior: none` on `<body>` and `position: fixed` on `<html>` prevent iOS Safari pull-to-refresh. Verified by aggressively scrolling past the top of the viewport in-game — no refresh or bounce occurs.

---

### US-08: Long-Press Context Menu Prevention
**As a** player holding the fire button for continuous fire,  
**I want** iOS Safari to not show the text selection / copy-paste context menu,  
**So that** I can hold the fire button without interruption.

**Acceptance:** `-webkit-touch-callout: none` and `user-select: none` are applied to all touch control elements and the canvas. Verified by long-pressing the fire button for 3+ seconds — no context menu, no text selection, no popup.

---

## Epic 3: Haptic Feedback

> *Subtle vibrations make the game feel more immersive on mobile.*

### US-09: Haptic on Fire
**As a** mobile player,  
**I want** a subtle vibration when I press the fire button,  
**So that** I get tactile confirmation that my shot registered.

**Acceptance:** `navigator.vibrate(20)` fires on each `touchstart` of the fire button (subject to the weapon's fire rate — no haptic if weapon is on cooldown). Vibration is imperceptible in noisy environments but provides a tactile cue when the phone is held.

---

### US-10: Haptic on Hit
**As a** mobile player,  
**I want** a slightly stronger vibration when my shot hits an enemy,  
**So that** I feel the impact even if I'm not looking at the hit marker.

**Acceptance:** `navigator.vibrate(50)` fires when a player projectile collides with an enemy (Imps and Boss). This is in addition to the existing visual hit marker. Haptic fires once per hit, not per projectile.

---

### US-11: Haptic on Damage
**As a** mobile player,  
**I want** a strong vibration when I take damage,  
**So that** I'm immediately aware I'm being hit even if I'm looking away from the screen.

**Acceptance:** `navigator.vibrate(100)` fires when the player's `takeDamage()` is called. Combined with the existing damage flash visual effect. One haptic pulse per damage event (Imp contact, boss projectile).

---

### US-12: Haptic Toggle
**As a** player who dislikes haptic feedback or is on a device where vibration is annoying,  
**I want** to turn off haptic feedback from the settings panel,  
**So that** I can play without unwanted vibrations.

**Acceptance:** Settings panel has a "Haptic Feedback" toggle. When off, no `navigator.vibrate()` calls are made. When on, vibration patterns fire as described. Setting persists across page refreshes via localStorage. Default value: ON.

---

### US-13: Haptic Graceful Fallback
**As a** player on a device without vibration support (iPad, or Battery Saver mode),  
**I want** the game to never throw errors or crash due to haptic API calls,  
**So that** the game works normally on all devices.

**Acceptance:** All `navigator.vibrate()` calls are wrapped in a null-check and try/catch. No console errors from vibration API on unsupported devices. Game logic is unaffected.

---

## Epic 4: Configurable Touch Settings

> *Players have different hand sizes, accuracy, and preferences — let them tune.*

### US-14: Dead Zone Adjustment
**As a** player with a heavy thumb or imprecise touch,  
**I want** to increase the joystick dead zone so accidental micro-movements don't move me,  
**So that** I can stand still when I intend to.

**Acceptance:** Settings panel provides a slider for joystick dead zone (range 4–20px, default 8px). Changes take effect immediately (next `touchmove` frame). Setting persists in localStorage. At maximum dead zone (20px), a light resting thumb does not trigger movement. At minimum (4px), the joystick is highly sensitive.

---

### US-15: Camera Sensitivity Adjustment
**As a** player who prefers faster or slower camera movement,  
**I want** to adjust the camera drag sensitivity,  
**So that** I can aim at my preferred speed.

**Acceptance:** Settings panel provides a slider for camera sensitivity (range 0.004–0.016 rad/px, default 0.008). Changes take effect immediately (next `touchmove` delta calculation). Setting persists in localStorage. At maximum sensitivity, a 100px drag turns ~90 degrees. At minimum, a 100px drag turns ~23 degrees.

---

### US-16: Settings Persistence
**As a** returning player,  
**I want** the game to remember my touch settings (dead zone, sensitivity, haptics) from my last session,  
**So that** I don't have to re-tune every time I play.

**Acceptance:** All three settings (dead zone, sensitivity, haptics) are serialized to localStorage under the key `doomloop_touch_settings` (consuming the existing `TouchSettings` interface). On game init, these values are loaded and applied. If no saved settings exist, defaults are used (dead zone: 8px, sensitivity: 0.008 rad/px, haptics: on). Settings are read once on `Game.init()`.

---

### US-17: Settings Panel Access
**As a** player mid-game,  
**I want** to open and close the touch settings panel without pausing or restarting,  
**So that** I can experiment with different sensitivity values while fighting.

**Acceptance:** A small gear icon (16x16px, semi-transparent) is fixed at the top-right of the screen (within safe area). Tap opens a touch settings overlay. Changes apply in real-time. Tapping outside the overlay or tapping a close button dismisses it. Settings panel does not pause game logic (but is semi-transparent so gameplay is partially visible behind it).

---

## Epic 5: Visual Feedback Enhancement

> *Buttons should communicate their state clearly without the player looking away.*

### US-18: Fire Button Ripple Effect
**As a** mobile player,  
**I want** a visual ripple to spread from my touch point when I press fire,  
**So that** I have clear visual confirmation the button registered my touch.

**Acceptance:** On `touchstart` of the fire button, a CSS-animated ripple effect (radial gradient circle expanding from touch point, fading over 300ms) appears on the button. Multiple rapid taps create overlapping ripples. The effect is pure CSS/HTML (no canvas drawing).

---

### US-19: Jump Button Readiness Glow
**As a** mobile player,  
**I want** the jump button to have a subtle pulsing glow when it's available to press,  
**So that** I can quickly find it by peripheral vision.

**Acceptance:** The jump button has a subtle pulsing glow animation (`box-shadow` pulsing on a 1.5s sine wave) in its idle state. When pressed, the glow intensifies briefly then normalizes. The glow is green-tinted to match the button's color scheme.

---

### US-20: Stronger Active State Feedback
**As a** player holding the fire button for continuous fire,  
**I want** the button to clearly show it's in an "active-hold" state,  
**So that** I know it's still firing without looking at the crosshair.

**Acceptance:** Three visual states: (a) idle — opacity 0.4, no scaling, (b) pressed (initial touch) — opacity 1.0, scale 0.85, no glow, (c) active-hold (after 300ms of continuous fire-hold) — opacity 0.8, scale 0.9, subtle pulse animation on the border. All states use CSS transitions (0.1s ease for instant feedback).

---

## Epic 6: Sprint 2 Hotfix Verification

> *Confirm all previously fixed bugs remain fixed.*

### US-21: Mobile Detection Accuracy
**As a** player on a touch-capable laptop (e.g., MacBook with Touch Bar, Windows laptop with touch screen),  
**I want** the game to use desktop controls (WASD + mouse) not mobile controls,  
**So that** I can play the way I expect on a laptop.

**Acceptance:** On a touch-capable laptop with screen width > 1024px and `pointer: fine`, `isTouchDevice()` returns `false`. The game uses `InputManager` (pointer lock + keyboard). No touch-control DOM is created. This is the hotfix from Sprint 2 commit 01ba096 — must remain working.

---

### US-22: Desktop WASD Control
**As a** desktop player,  
**I want** WASD movement to work the same as in Sprint 1,  
**So that** my desktop gameplay is unaffected by mobile changes.

**Acceptance:** On desktop (no touch, pointer lock), `W/A/S/D` keys move the player forward/backward/strafe. Shift sprints. Space jumps. Mouse look works. `R` restarts. No regressions from Sprint 1 baseline.

---

### US-23: Enemy Non-Overlap
**As a** player,  
**I want** enemies (Imps, Boss) to not clip through or overlap each other,  
**So that** the game looks and feels physically correct.

**Acceptance:** Imps and Boss have collision bodies with correct collision group masks (`ENEMIES: 0x004`). Enemy bodies collide with each other and push apart without teleporting or overlapping. Verified with 10 Imps active simultaneously.

---

### US-24: Death from Imp Contact
**As a** player at low health,  
**I want** to die when an Imp touches me and I have 10 or fewer HP remaining,  
**So that** the game-over flow triggers correctly from contact damage.

**Acceptance:** An Imp contact with `IMP_CONTACT_DAMAGE = 10` triggers `player.takeDamage(10)`. If player HP drops to 0, `triggerPlayerDeath()` fires correctly. Death screen appears after death animation completes (~1.2s). This was the Sprint 2 hotfix bug — must remain working.

---

### US-25: Death Animation
**As a** player who dies,  
**I want** the camera to tilt up toward the sky with a slight roll over 1.2 seconds,  
**So that** the death has visual drama and provides feedback that I died.

**Acceptance:** On death, the camera smoothly rotates 60 degrees upward (pitch) with 10 degrees of roll over 1.2 seconds. Player can still see the death screen after the animation completes. No instant cut to black.

---

### US-26: Lighting Correctness
**As a** player entering the arena,  
**I want** the environment to be well-lit enough to see enemies and navigate,  
**So that** gameplay is not hampered by a dim or flat scene.

**Acceptance:** AmbientLight at intensity 1.2 with color 0x667799. DirectionalLight at 2.0 from (10, 20, 10). HemisphereLight at 0.8. Fog at distance 40–80. Arena walls, floor, pillars, and enemies are all clearly visible from the center spawn point with these lighting values.
