# Doomloop — Deployment Guide

## Tech Stack
- **Build:** Vite 5+
- **Output:** Static HTML/JS/CSS in `dist/`
- **Deploy Target:** Any static host (Vercel, Netlify, GitHub Pages, S3, etc.)

## Build
```bash
npm install
npm run build    # outputs to dist/
```

## Deploy
Upload the `dist/` directory to any static hosting provider.

### Vercel
```bash
npx vercel --prod
```
No special config needed — Vercel auto-detects Vite.

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages
```bash
npm run build
# push dist/ to gh-pages branch
```

## Configuration
No server-side configuration needed. The game is fully client-side:
- Zero external API calls
- Zero CDN dependencies
- Works offline after initial page load
- No cookies, no analytics, no tracking

## Browser Requirements
- Chrome 90+, Firefox 90+, Edge 90+
- Pointer Lock API support
- WebGL 1.0+ (Three.js requirement)
- Desktop only (no mobile support in Sprint 1)

## Environment Variables
None required.
