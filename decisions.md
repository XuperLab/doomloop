# Decisions — Doomloop

> Rationale for key architectural, technical, and product decisions made during Sprint 1 specification.

---

## D01: Three.js (Renderer)

**Decision:** Use Three.js as the 3D rendering library.

**Alternatives considered:**
- **Raw WebGL / WebGL2** — maximum control, minimum overhead. Rejected because it would require writing a complete rendering pipeline (cameras, scene graph, lighting, materials, input handling) from scratch. The AI agent would need to generate thousands of lines of boilerplate before any game logic. Three.js provides all of this out of the box.
- **Babylon.js** — viable alternative with more built-in game features (collision system, physics integration). Rejected because Three.js has a simpler API surface that's easier for AI agents to reason about, and Cannon-es provides the physics layer.
- **PlayCanvas / Unity WebGL** — game engines with editor workflows. Rejected because the entire pipeline must be code-first for AI iteration. An editor-based workflow cannot be pipelined.

**Why Three.js wins:** Largest ecosystem, simplest API, most AI-friendly. The arch-agent and impl-agent can reason about Three.js code directly. The scene graph model maps naturally to game objects.

---

## D02: Cannon-es (Physics)

**Decision:** Use cannon-es for physics simulation.

**Alternatives considered:**
- **Ammo.js / Bullet** — full-featured but heavy for this use case. Overkill for simple collision detection and projectile physics.
- **Custom collision detection** — writing AABB or raycast collision from scratch is error-prone and time-consuming. Not worth the saved dependency weight.
- **rapier (Rapier3D)** — modern Rust-based WASM physics, lighter than cannon-es. Less documented in AI training data, which increases risk of hallucinated API calls.

**Why cannon-es wins:** Maintained fork of the well-known Cannon.js. Has a simple API (Body, Shape, World, ContactMaterial). Widely used in Three.js tutorials and examples — the AI agent is more likely to generate correct code. Good enough for box/sphere/plane collision, which is all Sprint 1 needs.

---

## D03: Low-Poly Visual Style

**Decision:** Use a low-poly aesthetic with procedural Three.js primitives and CC0 assets.

**Alternatives considered:**
- **Pixel sprites / 2D** — explicitly rejected by the stakeholder ("NOT pixel sprites — true 3D enemy models").
- **Realistic textures / PBR** — requires high-quality texture assets and shader complexity. Not achievable with CC0 assets alone within constraints.
- **Stylized flat-shaded** — close to low-poly but harder to achieve with procedural geometry alone.

**Why low-poly wins:** Achievable entirely with CC0 assets and procedural geometry. No custom 3D modeling required. Low-poly looks intentional and stylish even with simple geometry. Performance-friendly (low vertex count). Kenney.nl and Quaternius provide excellent CC0 low-poly assets.

---

## D04: CC0 Licensed Assets Only

**Decision:** All external 3D assets, sound effects, and textures must be CC0 (public domain equivalent).

**Alternatives considered:**
- **CC-BY / attribution required** — legally viable but creates a documentation burden. Every asset would need attribution in the game or README. CC0 avoids this entirely.
- **Royalty-free paid assets** (e.g., Unity Asset Store, Sketchfab Store) — incompatible with the zero-cost constraint and pipeline automation (no human purchasing assets).
- **AI-generated 3D models** — current tools (Point-E, Shap-E, DreamFusion) produce low-quality, un-rigged meshes unsuitable for a game. Not viable.

**Why CC0 wins:** Safest license for free distribution. Zero legal risk. Kenney.nl has extensive CC0 game assets (weapons, enemies, environment pieces). Quaternius has excellent CC0 low-poly character packs. Poly Pizza has more variety. The arch-agent and impl-agent should prioritize these sources and fall back to procedural geometry when no suitable CC0 asset exists.

---

## D05: Vite as Build Tool

**Decision:** Use Vite for bundling and local development.

**Alternatives considered:**
- **Webpack** — functionally equivalent but slower dev server, more configuration boilerplate.
- **Parcel** — zero-config but less control over Three.js-specific optimizations (e.g., GLSL shader imports).
- **Rollup** — great for production bundles but lacks dev server features.

**Why Vite wins:** Fastest builds and HMR (hot module replacement) for rapid iteration. Native ESM support means Three.js and cannon-es import cleanly. `vite build` produces optimized bundles suitable for deployment to a static host.

---

## D06: No Audio in Sprint 1

**Decision:** Defer all audio (SFX and music) to Sprint 2.

**Rationale:** Audio generation via AudioCraft or similar tools adds a dependency and generation step. Sprint 1's goal is to prove the mechanical loop (movement + shooting + waves). Audio is a content layer, not a structural dependency. Sprint 2 can add it without refactoring the core code. Additionally, AI-generated audio has variable quality and may require multiple generation attempts — Sprint 1 should not be blocked on this.

---

## D07: Open Arena Over Corridors

**Decision:** Build a single open arena with pillars for cover, rather than corridor-based levels.

**Alternatives considered:**
- **Corridor / room-based levels** — Truer to Doom 2016's map design. However, corridors introduce navigation complexity (doors, corners, enemy pathfinding around walls) that adds significant development time. The arena focuses effort on the essential combat feel.
- **Hybrid (arena with alcoves)** — Could be added in Sprint 2. Sprint 1 benefits from the simplicity of a single open space.

**Why arena wins:** Faster to build. Enemies are always visible (no line-of-sight surprises). Player movement is the focus, not navigation. The pillars provide enough cover to make combat interesting (dodge behind, peek out to shoot).

---

## D08: Health Packs Over Regeneration

**Decision:** Use collectible health packs rather than automatic health regeneration.

**Alternatives considered:**
- **Health regen** — familiar from modern FPS games. But removes tension — player can always hide and recover. Doesn't match Doom 2016's aggressive resource management.
- **No healing at all** — too punishing for Sprint 1's target audience.
- **Kill-to-heal (glory kill system)** — Doom 2016's signature mechanic. Requires a melee execution system with animations. Too complex for Sprint 1.

**Why health packs win:** Simple to implement. Creates resource management tension (run into the open to grab health). Fits the Doom 2016 "push forward" philosophy without requiring the full glory kill system. Health packs are a proven mechanic (Doom 1/2, Quake).

---

## D09: Plasma Rifle (Hitscan + Visible Tracers)

**Decision:** The Sprint 1 weapon fires visible energy bolts (projectile with visual tracer) rather than pure hitscan.

**Alternatives considered:**
- **Pure hitscan (instantaneous)** — Feels less satisfying (no visible bullet travel). Harder to dodge = more frustrating for casual players.
- **Slow projectile** — Too easy to dodge at range.

**Why tracer projectile wins:** Visible travel time makes aiming feel skill-based. The tracer effect (bright energy bolt with trail) is visually satisfying. The projectile speed is fast enough to feel responsive (~100 units/second) but slow enough to see.

---

## D10: JavaScript Over TypeScript (Deferred to Arch-Agent)

**Decision:** The language choice (JS vs TS) is deferred to the arch-agent.

**Rationale:** Both are viable. TypeScript adds type safety which helps AI agents generate code with fewer interface errors. JavaScript has less boilerplate and faster iteration. The arch-agent should evaluate based on their comfort and the complexity of the Three.js + Cannon-es integration. This decision is explicitly left open.

---

## D11: No Score / High Score in Sprint 1

**Decision:** Score tracking and localStorage persistence are deferred to Sprint 3.

**Rationale:** Score is a content/polish system, not core gameplay. Adding a score system in Sprint 1 would require: per-kill score assignment, wave completion bonuses, boss kill bonuses, localStorage read/write, and a high-score display screen. None of these affect whether the core loop is fun. Sprint 1 proves the loop; Sprint 3 optimizes the loop's replayability.
