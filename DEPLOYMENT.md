# Doomloop Deployment Guide

## Build
```bash
cd /opt/data/workspace/projects/doomloop
npm install
npm run build
```

Output goes to `dist/`:
- `dist/index.html` — Entry point
- `dist/assets/` — JS bundles (cannon-es, Three.js, game code)
- `dist/doomloop-screens/` — Screenshots

## Bundle Size (Sprint 4)
- `index.js`: 151.62 KB raw, ~35.88 KB gzipped (under 50 KB NFR)
- `cannon-es`: 84.08 KB raw, ~24.39 KB gzipped
- `three.js`: 467.34 KB raw, ~117.59 KB gzipped

## Deployment Options

### Option 1: Static Site (Dokploy)
- App type: `static`
- Build output: `dist/`
- No server-side runtime needed
- Push dist/ or use Docker

### Option 2: Local Dev Server + Tunnel
```bash
cd dist && npx serve . -p 8080
# Then tunnel externally
```

### Option 3: Dokploy Docker Deploy
See `deploy-config.yaml` for Dokploy settings.

## Verification Checklist
1. ✅ `npm run build` succeeds
2. ✅ `tsc --noEmit` — zero errors
3. ✅ Game loads in browser (check console for errors)
4. ✅ All 4 weapon types fire (1-4 keys)
5. ✅ Audio plays (click first to resume AudioContext)
6. ✅ Power-ups spawn and are collectible
7. ✅ Score and combo display updates on kills
8. ✅ Mini-map shows at top-right
9. ✅ Arena transitions via portal after wave 5
10. ✅ Mobile: touch controls, weapon bar, mini-map sized correctly
