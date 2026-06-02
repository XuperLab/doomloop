# Doomloop Deployment Guide

## Project Overview
Doomloop is a first-person shooter game built with Three.js + Cannon-es + Vite 5 + TypeScript.

## Build
```
cd /opt/data/workspace/projects/doomloop
npm run build
```
Output goes to `dist/`.

## Deployment
The build output is a static site (`dist/`). Serve with any static file server:
- Vite dev server: `npm run dev`
- Production: serve `dist/` via nginx, Netlify, Vercel, Cloudflare Pages, etc.

## Environment
- No server-side runtime required
- All browser-native APIs (no npm deps beyond Three.js, Cannon-es, Vite)
- Works on modern browsers (Chrome, Firefox, Safari, Edge)
- iPhone Safari specifically optimized (Sprint 3)

## Files Modified (Sprint 3)
- `src/input/touch-controls.css` — safe area, animations, panel/overlay styles (±200 lines)
- `src/input/TouchInputAdapter.ts` — settings, haptics, viewport, help overlay, visual feedback (+~150 lines)
- `src/input/TouchTypes.ts` — hapticFeedback field, 3 new DOM refs (+4 lines)
- `src/utils/Constants.ts` — 20 new constants (+20 lines)
- `src/Game.ts` — visualViewport handler, settings load, haptic calls (+~25 lines)
