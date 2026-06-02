# PRD: Doomloop — Sprint 3 (iPhone Touch Control Polish)

## 1. Product Overview

Doomloop is a fast-paced, low-poly 3D FPS web game inspired by Doom 2016. Sprint 1 delivered the minimum playable loop (1 weapon, 1 enemy, 5 waves, 1 boss). Sprint 2 added mobile touch controls (virtual joystick, camera drag, fire/jump buttons) with forward-compatible adapter pattern.

Sprint 3 focuses on **iPhone Safari/WebKit polish** and **touch control quality-of-life enhancements**. The mobile experience must feel native on iOS — responsive to screen geometry, snappy to taps, free from Safari gesture interference, and configurable to individual play preference.

### 1.1 Vision Statement

A browser-based 3D FPS that plays as well on an iPhone as it does on desktop — zero-compromise touch controls that are smooth, responsive, and feel native to iOS.

### 1.2 Sprint 3 Goal

Polish existing touch controls for iPhone Safari/WebKit, fix iOS-specific usability issues (safe areas, gestures, address bar), and add configurable tuning options so players can set dead zone, sensitivity, and haptics to their preference.

### 1.3 Target Audience

- **Primary**: iPhone users (iOS 15+) playing Doomloop in Safari
- **Secondary**: Android mobile users who benefit from the same polish
- **Tertiary**: Desktop users (unchanged — no desktop regressions)

### 1.4 Current State (Sprint 2 Delivered)

| Area | Status | Details |
|------|--------|---------|
| Virtual joystick | ✅ Deployed | Fixed bottom-left, 80px max radius, 8px dead zone |
| Camera drag | ✅ Deployed | Right half of screen, touch sensitivity 0.008 rad/px |
| Fire button | ✅ Deployed | Bottom-right, hold=continuous fire |
| Jump button | ✅ Deployed | Near joystick, edge-triggered |
| Sprint | ✅ Deployed | Double-tap forward, 300ms window, toggle |
| Control fade | ✅ Deployed | 3s idle → opacity 0.3 |
| Mobile detection | ✅ Fixed | pointer:fine + screen width heuristic |
| Viewport meta | ✅ Deployed | viewport-fit=cover, user-scalable=no |
| iOS CSS | ✅ Deployed | touch-action:none, overscroll-behavior:none |
| Hotfix: enemy overlap | ✅ Fixed | Collision masks added |
| Hotfix: death flow | ✅ Fixed | Imp contact → game over |
| Hotfix: death anim | ✅ Fixed | Camera tilt over 1.2s |
| Hotfix: lighting | ✅ Fixed | Ambient 1.2, directional 2.0, hemisphere 0.8 |

---

## 2. Feature List (Sprint 3)

### P0 — Must Have (Ship Blockers)

| ID | Feature | Description |
|----|---------|-------------|
| F01 | **Safe Area Insets** | All fixed-position touch control DOM elements (joystick, fire button, jump button, control hint labels) must respect iOS safe area insets using `env(safe-area-inset-top)`, `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`. Controls must not overlap the notch, Dynamic Island, or home indicator. Fallback to sensible defaults (20px) when `env()` is not available. |
| F02 | **300ms Tap Delay Elimination** | Apply `touch-action: manipulation` to `<html>` and all interactive control elements. This tells iOS Safari to skip the 300ms double-tap-to-zoom delay. Verify no ghost clicks or delayed tap registration on fire/jump buttons. |
| F03 | **iOS Safari Gesture Suppression** | Block the following iOS Safari default behaviors during gameplay: (a) swipe-back/forward navigation, (b) pull-to-refresh, (c) long-press context menu / text selection, (d) rubber-banding/overscroll at page edges. Use a combination of `touchmove.preventDefault()`, CSS `overscroll-behavior: none`, `-webkit-touch-callout: none`, and `touch-callout: none`. Must not interfere with legitimate touch gameplay. |
| F04 | **iOS Address Bar Resize Handling** | Use the `window.visualViewport` API to detect when the iOS Safari address bar appears or disappears (changes the visual viewport height). On resize, recalculate and reposition fixed touch controls so they stay at the correct screen-relative positions. The game canvas must also resize correctly so it fills the visible area, not the layout viewport. |
| F05 | **Verify Sprint 2 Hotfixes** | Confirm all 6 Sprint 2 hotfixes shipped in commit 01ba096 are working correctly on both desktop and mobile: (a) mobile detection does not false-positive on touch-capable laptops, (b) WASD works on desktop, (c) Imps/Boss do not overlap each other, (d) death from Imp contact triggers proper game-over flow, (e) death animation plays (camera tilt to sky over 1.2s with roll), (f) arena lighting is visible and correct. |

### P1 — Should Have (High Priority)

| ID | Feature | Description |
|----|---------|-------------|
| F06 | **Haptic Feedback (Vibration API)** | Fire button press, successful enemy hit, and player damage trigger `navigator.vibrate()` with configurable patterns. Default: short 20ms pulse on fire, 50ms on hit, 100ms on damage. Must be opt-in via a settings toggle (persisted to localStorage). Graceful fallback when Vibration API is unavailable (non-supporting browsers or Battery Saver mode). |
| F07 | **User-Configurable Touch Settings** | Add an on-screen settings panel (accessed via a small gear icon overlay) that lets players adjust: (a) joystick dead zone (slider, range 4–20px, default 8px), (b) camera touch sensitivity (slider, range 0.004–0.016 rad/px, default 0.008), (c) haptic feedback toggle (on/off). All settings persisted to localStorage via the existing `TouchSettings` interface. Panel should be mobile-friendly and dismissable via tap-outside or close button. |
| F08 | **Visual Feedback Enhancements on Buttons** | Enhance the existing CSS-only button feedback with: (a) touch ripple effect on fire button (radial expanding circle from touch point), (b) subtle glow pulse on jump button when ready, (c) stronger visual distinction between idle/pressed/active states — idle (opacity 0.4), pressed (opacity 1.0 + scale 0.85), active-hold (opacity 0.8 + scale 0.9 + subtle pulse). Use CSS animations/transitions only — no canvas-drawn effects needed. |
| F09 | **Control Hint Overlay for Mobile** | The current mobile start screen has small control icons. Enhance with: (a) persistent first-time help overlay (tap-to-dismiss) showing labeled control zones and the double-tap sprint gesture, (b) option to re-show help from the settings panel, (c) the existing control hint labels should appear briefly on first interaction and fade. |

### P2 — Nice to Have (If Time Permits)

| ID | Feature | Description |
|----|---------|-------------|
| F10 | **Joystick Visual Enhancement** | Show a direction arrow or trail on the joystick thumb while dragged. Add a subtle speed indicator ring that fills proportionally to drag distance. Color shift on the joystick border when sprint is active (already done for base, extend to thumb). |
| F11 | **iOS Native Scroll Prevention** | On iOS, also set `touchmove.preventDefault()` with `{ passive: false }` on the `document` level (not just on zones) as a last-resort gesture blocker. Test that this does not break scrolling in non-game contexts (no side effects). |
| F12 | **Mobile HUD Optimization** | The current HUD (HP bar, wave display, kill count) uses desktop-relative positions (top-left, top-center, top-right). On small iPhone screens, these may overlap with the notch or be too small to read. Make HUD elements responsive: (a) scale down font sizes on mobile, (b) ensure HP bar is below safe area top inset, (c) test readability on iPhone SE, 14, 15 Pro Max, and landscape mode. |

---

## 3. Player Experience (Sprint 3 Flow)

1. iPhone user opens `doomloop.lmmlab.com` in Safari
2. Loading screen appears, fills the visual viewport (notched safe area)
3. First-time user sees enhanced help overlay showing labeled control zones
4. Returning user sees "Tap to start" — no 300ms delay on tap
5. Controls appear at correct positions — no overlap with Dynamic Island or home indicator
6. Player moves via joystick, aims via camera drag, fires via button — all feel immediate and smooth
7. Address bar collapses/expands — controls and canvas adjust instantly without glitch
8. Player can open settings gear to tune dead zone, sensitivity, or toggle haptics
9. On fire: subtle vibration pulse. On hit: stronger pulse. On damage: strongest pulse
10. On death/game-over: standard overlays render correctly within safe areas

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR01 | **iOS Safari compatibility** | iOS 15+ Safari (about 95% of active iOS devices as of 2026). Test on iPhone SE (smallest), iPhone 14/15 (notch), iPhone 15 Pro Max (Dynamic Island). |
| NFR02 | **No desktop regression** | Desktop controls, HUD, overlays must be byte-identical in behavior. No touch-control DOM created on desktop. No pointer-lock issues. |
| NFR03 | **Tap registration** | Fire/jump buttons must respond to `touchstart` within 50ms of finger contact (no 300ms delay). |
| NFR04 | **Safe area margin** | Controls must maintain at least `env(safe-area-inset-*)` + 10px padding from any screen edge. |
| NFR05 | **Address bar resilience** | Canvas and controls must re-render correctly within 100ms of a `visualViewport.resize` event. |
| NFR06 | **Settings persistence** | Settings stored in localStorage must survive page refreshes and exists between sessions. Default values when no saved settings exist. |
| NFR07 | **Haptic fallback** | `navigator.vibrate()` call must never throw. Wrap in try/catch or check `navigator.vibrate` exists. |
| NFR08 | **Bundle size impact** | Sprint 3 additions should add < 5 KB gzipped to the entry bundle. CSS additions and touch control enhancements only — no new library dependencies. |

---

## 5. Out-of-Scope (Even in Future Sprints)

- Android-specific hardware (Samsung DeX, foldables, stylus) — Android benefits from baseline polish but Sprint 3 targets iOS Safari specifically
- Gamepad / controller support
- Multi-touch gestures beyond current (pinch-to-zoom as gameplay mechanic)
- Voice control
- Redesign of control layout (position adjustments for safe areas are not layout redesign)
- Desktop touch (touch-capable laptops remain desktop-class)

---

## 6. Sprint 3 Success Criteria

1. On iPhone Safari, all touch controls render within safe areas — no overlap with notch, Dynamic Island, or home indicator
2. Fire and jump buttons register taps instantly — no perceptible delay (sub-100ms from touchstart to state change)
3. iOS Safari gestures (swipe-back, pull-to-refresh, long-press menu) do not fire during gameplay
4. Collapsing/expanding the address bar does not misposition touch controls or leave dead zones
5. All 6 Sprint 2 hotfix features are verified working on both desktop and mobile
6. Haptic feedback vibrates on fire/hit/damage when opted in, gracefully absent when not supported
7. User settings (dead zone, sensitivity, haptics) save across page refresh and affect gameplay perceptibly
8. Fire/jump buttons have visually distinct idle, pressed, and active states
9. Desktop experience is completely unchanged — no new DOM on desktop, no pointer-lock changes
10. Bundle size increase ≤ 5 KB gzipped, zero new library dependencies
