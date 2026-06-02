# Architectural Decisions — Doomloop Sprint 3 (iPhone Touch Control Polish)

---

## D01 — Safe Area Insets: CSS `env()` Variables Over JS Recalculation

**Status:** Accepted

**Context:** Sprint 2 set `viewport-fit=cover` on the viewport meta tag, but all touch control CSS positions use hardcoded pixel values (`bottom: 30px`, `right: 20px`). On notched iPhones, the home indicator overlaps the fire button. On Dynamic Island iPhones, the top area is unaffected but bottom clearance is still needed.

**Decision:** Use CSS `env(safe-area-inset-*)` variables with fallback values in the touch control stylesheet. All fixed-positioned control elements will reference `env(safe-area-inset-bottom, 20px)`, `env(safe-area-inset-right, 20px)`, etc.

**Alternatives considered:**
1. **JS recalculation via `window.navigator` APIs** — Rejected because `env()` is the standard WebKit approach, zero JS overhead, and automatically responds to orientation changes without event listeners.
2. **Hardcoded 44px margin for all iOS** — Rejected because iPhone SE has no notch (34px safe area default) and would lose 10px of usable space.
3. **CSS `constant()` (iOS 11 fallback)** — Rejected because iOS 11 is below our minimum target (iOS 15+). `env()` is supported on all target devices.

**Consequences:** CSS-only change, no new JS code. All four inset variables with fallbacks. Controls auto-adjust on orientation change. Future responsiveness improvements automatically benefit.

---

## D02 — 300ms Delay: `touch-action: manipulation` CSS Over JS FastClick

**Status:** Accepted

**Context:** iOS Safari adds a 300ms delay between `touchstart` and click events when it's unsure if the user intends to double-tap to zoom. Sprint 2 already uses `touchstart` listeners (not `click`) on buttons and zones, so the delay shouldn't manifest in gameplay JS. However, any element relying on click events (settings panel, overlays) may still see the delay. Additionally, iOS applies the 300ms delay to all touch interactions on elements without explicit `touch-action` CSS.

**Decision:** Apply `touch-action: manipulation` to `<html>` and all interactive touch elements. This is the standard, browser-recommended approach to eliminating the 300ms delay. No JavaScript FastClick library needed.

**Alternatives considered:**
1. **FastClick library (FT Labs)** — Rejected because it's deprecated (last updated 2016), adds ~3 KB, and `touch-action: manipulation` is the modern standard supported in iOS 15+.
2. **All-interaction via `touchstart` only** — Already done for gameplay, but settings/overlay elements need click for accessibility. `touch-action: manipulation` handles both.
3. **`touchstart` + `preventDefault` on every element** — Fragile, error-prone, doesn't fix all cases. CSS is simpler and more robust.

**Consequences:** Single line of CSS on `<html>`. All click-based interactions also benefit (settings panel, overlay buttons). No JS library dependency. Verified via `performance.now()` instrumentation.

---

## D03 — iOS Gesture Suppression: Existing CSS + `touchmove.preventDefault()`

**Status:** Accepted

**Context:** iOS Safari has default gesture recognizers for swipe-back (left edge), pull-to-refresh (top overscroll), long-press (text selection), and rubber-banding (all edges). Sprint 2 already has some CSS prevention but the full set is not uniformly applied.

**Decision:** Combine existing CSS (`overscroll-behavior: none`, `position: fixed`, `-webkit-touch-callout: none`, `user-select: none`) with `touchmove.preventDefault()` at the document level (already in Sprint 2 with `{ passive: false }`). This is a belt-and-suspenders approach: CSS handles the standard cases, `preventDefault` catches edge cases.

**Alternatives considered:**
1. **CSS only** — `overscroll-behavior: none` is well-supported on iOS 16+ but was buggy on earlier iOS versions. Belt-and-suspenders is safer.
2. **JS-only prevention** — Would work but adds JS overhead per touch event. CSS handles the vast majority of cases without any JS execution.
3. **CSS `touch-events: none` on body** — Too aggressive, would block all touch input. The existing zone-based approach (specific zones handle touch) with global scroll prevention is correct.

**Consequences:** Zero new libraries. CSS handles standard cases efficiently; JS `preventDefault` catches edge cases. Must verify no side effects on desktop (touch-capable laptops with fine pointer).

---

## D04 — Address Bar Resize: `visualViewport` API Event Handler

**Status:** Accepted

**Context:** iOS Safari's address bar collapses/expands as the user scrolls. This changes the visual viewport height but NOT the layout viewport. CSS `position: fixed` elements (our touch controls) position relative to the layout viewport by default, meaning they can drift out of position or leave dead zones when the address bar state changes.

**Decision:** Register a `window.visualViewport.onresize` handler that recalculates touch control positions and canvas size. Use `visualViewport.width` and `visualViewport.height` to resize the canvas renderer. Reposition fixed controls using the offset between `visualViewport.offsetTop` and the layout viewport origin.

**Alternatives considered:**
1. **`window.onresize` only** — The standard `resize` event fires for layout viewport changes but NOT for address bar show/hide. `visualViewport` is the only API that detects this.
2. **Ignore address bar** — Controls would be mispositioned on every address bar interaction, which is common when players tap near the top of the screen (camera drag area).
3. **`position: absolute` with scroll tracking** — More complex, less reliable. `position: fixed` + visualViewport correction is the pattern recommended by WebKit engineers.

**Consequences:** New event handler (10-20 lines of JS). Must guard against non-supporting browsers with existence check. Desktop unaffected (no `visualViewport` or no significant offset). Debounce/throttle to avoid jank during address bar animation.

---

## D05 — Haptic Feedback: Vibration API With Graceful Fallback

**Status:** Accepted

**Context:** Mobile FPS games on mobile commonly use haptic feedback for immersive tactile cues (fire, hit, damage). The Web Vibration API (`navigator.vibrate()`) is supported on iOS Safari 15+ but not on iPadOS (no vibration hardware) and can be disabled by Battery Saver mode.

**Decision:** Implement haptic feedback using `navigator.vibrate()` with distinct patterns for fire (20ms), enemy hit (50ms), and player damage (100ms). All calls wrapped in `typeof navigator.vibrate === 'function'` guard and try/catch. Opt-in toggle in settings panel, persisted to localStorage. Default: ON.

**Alternatives considered:**
1. **No haptics** — Less immersive on mobile. Competitor mobile FPS games (COD Mobile, PUBG Mobile) all use haptics for core actions.
2. **Haptic feedback via AudioContext** — Could create audible click/impact sounds but adds latency and complexity. Vibration API is simpler and truly tactile.
3. **Always-on haptics (no toggle)** — Would annoy players who dislike vibration or are in quiet environments. Toggle is standard practice.

**Consequences:** Zero new dependencies. 3 vibration patterns in Constants.ts. Settings toggle + localStorage persistence. Graceful no-op on unsupported devices.

---

## D06 — Touch Settings: Mobile-Only Overlay Panel With localStorage Persistence

**Status:** Accepted

**Context:** Sprint 2 introduced `TouchSettings` interface and constant-based joystick dead zone / sensor sensitivity. Players have different hand sizes and preferences. There is currently no way to adjust these at runtime.

**Decision:** Create a mobile-only settings panel (gear icon) that allows runtime adjustment of dead zone, sensitivity, and haptics. Values stored in localStorage under key `doomloop_touch_settings`. On game init, saved values override constants. Desktop does not show the gear icon.

**Alternatives considered:**
1. **No settings panel** — Players stuck with defaults. Dead zone of 8px may be too sensitive for some, too dead for others. Not acceptable for a polished mobile game.
2. **Settings in the start overlay only** — Would require restarting to change settings. Real-time adjustment is important for finding the right sensitivity mid-game.
3. **Persist to backend/server** — Overkill for a local game. localStorage is appropriate, zero-latency, and works offline (NFR06 from Sprint 1).
4. **Global settings across all play sessions** — The localStorage key is flat, not per-session. This is intended — players want their settings to persist.

**Consequences:** ~50 lines of HTML/CSS for the panel overlay. ~30 lines of JS for read/write/apply. Zero dependencies. Must verify the gear icon doesn't overlap with HUD or safe area.

---

## D07 — Visual Feedback: CSS-Only Enhancements (No Canvas)

**Status:** Accepted

**Context:** The existing fire/jump buttons have basic CSS `:active` / `.active` class transitions (scale + opacity change). Sprint 3 calls for enhanced visual feedback: ripple effect, pulsing glow, and three-state distinctions (idle/pressed/active-hold).

**Decision:** All visual feedback enhancements are pure CSS — no canvas drawing, no JavaScript animation loops. Ripple effects use CSS `@keyframes` with pseudo-elements (`::before`/`::after`). Glow effects use `box-shadow` animation. Three-state distinction uses CSS classes and transitions.

**Alternatives considered:**
1. **Canvas-drawn effects (Three.js overlay)** — Would require render-to-texture or overlay canvas with `pointer-events: none`. Adds complexity, performance cost, and potential z-ordering issues.
2. **JavaScript-driven animations (requestAnimationFrame)** — More flexible but adds CPU overhead per frame for simple UI effects. CSS animations are GPU-accelerated on iOS Safari.
3. **SVG-animated inline graphics** — Overly complex for button feedback. CSS is simpler, more maintainable, and already proven in Sprint 2.

**Consequences:** Zero bundle size increase from animation libraries. All effects GPU-composited on iOS. Simple to maintain (just CSS). No performance regression on low-end devices.

---

## D08 — Sprint 2 Hotfix Verification Strategy

**Status:** Accepted

**Context:** Commit 01ba096 shipped 6 hotfixes: mobile detection, WASD, enemy overlap, game over flow, death animation, lighting. These were verified at Sprint 2 deployment time but Sprint 3 changes (CSS, event handlers, settings panel) could inadvertently regress them.

**Decision:** Verify all 6 hotfixes at the acceptance criteria level (AC-F05-01 through AC-F05-10). Specific checks include:
1. Mobile detection — `isTouchDevice()` returns correct boolean based on pointer type + screen width
2. WASD — keyboard handlers unchanged, no touch-capable laptop false positive
3. Enemy overlap — collision mask `ENEMIES: 0x004` unchanged
4. Game over — `triggerPlayerDeath()` path still correct after any InputAdapter changes
5. Death animation — camera tilt unchanged (no modifications to `Camera.ts` planned)
6. Lighting — Three.js light configuration unchanged

These are regression checks, not re-testing from scratch. The acceptance criteria codify the expected behavior so the arch-agent and impl-agent know what not to break.

**Alternatives considered:**
1. **No explicit verification** — Risky. CSS changes to touch controls could affect `MobileDetector` logic or create event handler conflicts.
2. **Automated regression tests** — Would be ideal but the existing codebase has no test framework. Sprint 3 scope is polish-only. Adding a test framework is a separate concern.

**Consequences:** 10 verification acceptance criteria. No new test infrastructure. If regression is found, it will be caught during Sprint 3 implementation testing.

---

## D09 — No New npm Dependencies

**Status:** Accepted

**Context:** Sprint 3 features (safe areas, gesture prevention, haptics, settings panel) all use browser-native APIs (CSS env(), Vibration API, localStorage, visualViewport). No third-party library is required.

**Decision:** Zero new npm dependencies for Sprint 3. All features implemented using:
- CSS: `env()`, `touch-action`, `overscroll-behavior`, `@keyframes` animations
- JS: `navigator.vibrate()`, `window.visualViewport`, `localStorage`, `matchMedia()`
- HTML: Settings panel DOM (created by `TouchInputAdapter` or extension class)

**Alternatives considered:**
1. **FastClick library** — Deprecated, unnecessary with `touch-action: manipulation`.
2. **iNoBounce** — Library for iOS scroll prevention. Our CSS + preventDefault approach covers the same ground without a dependency.
3. **Hammer.js** — Gesture recognition library. Overkill (we handle single-touch joystick, camera drag, and buttons directly).

**Consequences:** Bundle size increase ≤ 5 KB gzipped (estimated: 2 KB CSS additions, 2 KB JS for settings panel + visual viewport handler + haptic wrapper). Zero new dependencies to maintain or audit.

---

## D10 — Scope Boundary: Polish, Not Redesign

**Status:** Accepted

**Context:** Sprint 3's task description focuses on "polish" and "enhancements" — not rewriting the touch control architecture. The existing adapter pattern (InputAdapter → TouchInputAdapter), DOM overlay, zone-based touch routing, and control layout are all from Sprint 2 and are structurally sound.

**Decision:** Sprint 3 explicitly does NOT change:
- The adapter pattern (TouchInputAdapter still implements InputAdapter)
- The joystick position (fixed bottom-left, 30px from edges)
- The zone layout (left 50% = joystick, right 50% = camera drag)
- The fire/jump button DOM structure
- The desktop InputManager code path
- Any Three.js rendering code

Changes are additive: new CSS, new event handlers, new DOM elements (settings panel), and enhancements to existing CSS.

**Alternatives considered:**
1. **Redesign control layout for mobile** — Would require touch-input-driven user testing. Beyond Sprint 3 scope. Save for a potential future sprint focused on mobile UX.
2. **Unified desktop/mobile settings** — Desktop already has no-touch-input settings; adding mobile settings to a shared panel adds complexity without clear value.
3. **Refactor TouchInputAdapter into subclasses** — Not needed for 3 features (settings + haptics + visual feedback). Single-class extension is simpler.

**Consequences:** Clear boundaries for arch-agent and impl-agent. No structural changes. All changes scoped to `touch-controls.css`, `TouchInputAdapter.ts`, `Constants.ts`, and creation of a `TouchSettings.ts` or inline settings panel logic. Desktop codebase remains untouched.
