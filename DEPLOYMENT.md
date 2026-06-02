# Doomloop — Sprint 2: Mobile Touch Controls

## Deployment Instructions

### Build
```bash
cd /opt/data/workspace/projects/doomloop
npm run build
```

This produces:
- `dist/index.html` (11.76 KB)
- `dist/assets/index-DB7Z52AE.js` (55.21 KB)
- `dist/assets/cannon-CbR5xzcU.js` (84.08 KB)
- `dist/assets/three-B4v6BLg2.js` (459.39 KB)

### Deploy
The build output is a static site. Serve the `dist/` directory with any static file server (nginx, Caddy, Vercel, Netlify, etc.).

### Key Changes (Sprint 2)
- **5 new files** in `src/input/`: `InputAdapter.ts`, `MobileDetector.ts`, `TouchInputAdapter.ts`, `TouchTypes.ts`, `touch-controls.css`
- **6 modified files**: `Game.ts`, `InputManager.ts`, `Player.ts`, `OverlayScreen.ts`, `Constants.ts`, `index.html`
- **Zero new npm dependencies** — all touch handling uses vanilla JS DOM touch events

### Architecture
- Adapter pattern: `InputAdapter` interface implemented by both `InputManager` (desktop) and `TouchInputAdapter` (mobile)
- Mobile detection: `'ontouchstart' in window` or `navigator.maxTouchPoints > 0`
- On mobile: TouchInputAdapter creates DOM overlay with virtual joystick (left half), camera touch-drag (right half), fire button (lower-right), jump button (lower-left)
- Desktop: completely unchanged — no touch elements in DOM, Pointer Lock still works
- iOS Safari prevention: viewport meta with `user-scalable=no`, CSS `overscroll-behavior: none`, non-passive `touchmove`

### Verification
- Desktop: `npm run dev`, confirm WASD + mouse look + Shift sprint + Space jump all work
- Mobile: Open on iPhone/Android, confirm touch controls appear and game is playable
