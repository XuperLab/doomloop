# User Stories — Doomloop Sprint 1

## Epic 1: First Launch & Orientation

### US-01: First-time player opens the game
> **As a** new player  
> **I want to** open the URL and see the game load quickly  
> **So that** I can start playing without waiting or installing anything

**Acceptance:**
- Loading screen appears within 1 second of opening the URL
- Total load time under 5 seconds on 10 Mbps connection
- Game shows a "Click to play" prompt before activating mouse lock
- No download, install, or account creation required

### US-02: Understanding the controls
> **As a** player  
> **I want to** see a brief controls hint  
> **So that** I know how to move, shoot, and interact

**Acceptance:**
- On first load, a brief overlay shows WASD + mouse + Shift + Space controls
- Overlay dismisses on mouse click
- Controls are standard FPS layout familiar to most players

---

## Epic 2: Movement & Combat

### US-03: Moving through the arena
> **As a** player  
> **I want to** move freely with WASD, look around with the mouse, sprint with Shift, and jump with Space  
> **So that** I can navigate the arena and dodge enemies

**Acceptance:**
- WASD moves the player forward, backward, left, right relative to camera view
- Mouse controls camera yaw and pitch (pointer lock)
- Shift toggles sprint (increased speed, 1.5x walk speed)
- Space makes the player jump (gravity pulls back down)
- Movement feels smooth with acceleration/deceleration (not instant start/stop)
- Player cannot walk through walls

### US-04: Shooting enemies
> **As a** player  
> **I want to** aim with the mouse and shoot with left-click  
> **So that** I can kill enemies

**Acceptance:**
- Left-click fires a visible projectile (energy bolt with tracer effect)
- Projectile travels in a straight line from the gun/camera toward the crosshair
- Projectile disappears on hitting a wall or enemy
- Firing rate: ~4 shots per second (not fully automatic — brisk semi-auto)
- Crosshair slightly widens on each shot (bloom), resets quickly
- Infinite ammo — no reload mechanic

### US-05: Taking damage
> **As a** player  
> **I want to** know when I'm hit  
> **So that** I can react and avoid further damage

**Acceptance:**
- Taking damage causes a brief red flash on screen edges
- HP bar visibly decreases
- Enemy contact causes damage (Imps: 10 HP per hit, Boss projectiles: 15 HP per hit)
- Player starts each game with 100 HP

### US-06: Healing during combat
> **As a** player  
> **I want to** find and collect health packs in the arena  
> **So that** I can recover HP between waves

**Acceptance:**
- 3 health packs spawn at fixed positions in the arena at the start of each wave
- Each health pack restores 25 HP
- Health pack is a glowing green cylinder/cube, visually distinct
- Health pack is consumed on contact (walk over it)
- HP cannot exceed 100

### US-07: Dying
> **As a** player  
> **I want to** clearly know when I die  
> **So that** I can restart and try again

**Acceptance:**
- HP reaches 0 → screen fades to red, "YOU DIED" text appears
- Shows current wave reached (e.g., "Wave 3/5")
- "Click to Restart" or press R to restart
- Restart resets arena seed, HP, wave counter, and enemy spawns

---

## Epic 3: Enemies & Waves

### US-08: Fighting waves of Imps
> **As a** player  
> **I want to** fight increasing numbers of Imps across 4 waves  
> **So that** the challenge gradually ramps up

**Acceptance:**
- Wave 1: 3 Imps spawn, Wave 2: 5, Wave 3: 7, Wave 4: 10
- Imps spawn at random positions along arena edges (not inside walls)
- Each Imp charges directly toward the player at a speed slightly slower than player sprint
- Imps deal 10 damage on contact
- Imp dies after 3 hits from the plasma rifle
- Brief notification (wave number / enemy count) displayed when a new wave starts
- 3-second pause between waves showing "Wave X incoming!" text

### US-09: Boss fight
> **As a** player  
> **I want to** fight a challenging boss on Wave 5  
> **So that** the game has a climactic ending

**Acceptance:**
- Boss is visually distinct from Imps (larger, different color, different model)
- Boss has 15 HP (15 hits to kill)
- Boss moves slower than the player's walk speed
- Boss fires ranged projectiles at the player (1 projectile per 2 seconds)
- Boss projectiles travel slower than player's plasma bolts, are visually distinct (larger, red/orange)
- Boss takes reduced knockback (if any)
- Boss death triggers a larger, more dramatic death effect (big explosion / particle burst)

### US-10: Winning the game
> **As a** player  
> **I want to** see a victory screen when I defeat the boss  
> **So that** I feel a sense of accomplishment

**Acceptance:**
- Boss death → "VICTORY" screen with particle celebration effect
- "Play Again" button restarts with new arena seed
- No score display (Sprint 3 feature)

---

## Epic 4: Arena & Environment

### US-11: Procedural arena generation
> **As a** player  
> **I want to** fight in an arena that looks different each game  
> **So that** each playthrough feels fresh

**Acceptance:**
- Arena is approximately 40x40 units with walls, floor, and ceiling
- Arena includes 4–8 randomly placed pillars/obstacles for cover
- Pillar positions, sizes, and count are determined by a seeded random algorithm
- Seed changes on each new game (restart = new layout)
- Arena geometry uses low-poly Three.js primitives (box walls, cylinder/flat pillars)
- Floor has a grid or tile pattern texture (procedural, no image asset needed)

### US-12: Arena boundaries
> **As a** player  
> **I want to** be contained within the arena  
> **So that** I can't fall off or walk out of bounds

**Acceptance:**
- Walls are tall enough (> 3x player height) to prevent jumping over
- Collision detection prevents passing through walls or pillars
- Visual boundary markers (wall color differs from floor)

---

## Epic 5: HUD & Feedback

### US-13: Seeing my status
> **As a** player  
> **I want to** see my health, wave number, and kill progress  
> **So that** I know how I'm doing

**Acceptance:**
- HP bar in top-left corner (red bar, numerical "HP: 75/100" text)
- "Wave 3/5" display in top-center
- Enemy kill count for current wave (e.g., "3/7 Killed")
- Crosshair in screen center

### US-14: Game over and victory screens
> **As a** player  
> **I want to** clearly distinct end screens for death vs victory  
> **So that** I know whether I won or lost

**Acceptance:**
- Death: red screen, "YOU DIED — Wave 3/5", click/press R to restart
- Victory: gold/white screen, "VICTORY", particle celebration, click to play again
- Both screens have a clickable restart button
- Both support R key to restart

---

## Epic 6: Feel & Polish (Sprint 1 P1/P2)

### US-15: Hit feedback
> **As a** player  
> **I want to** see and feel when I hit an enemy  
> **So that** shooting feels satisfying

**Acceptance:**
- Enemy flashes white/red briefly on hit
- Crosshair displays a brief hit marker (small X or dot flash)
- Projectile impact on enemy produces a small spark/particle effect

### US-16: Death effects
> **As a** player  
> **I want to** see enemies explode or disintegrate when killed  
> **So that** combat feels impactful

**Acceptance:**
- Imp death: bursts into 4–6 low-poly fragments that scatter and disappear
- Boss death: larger explosion with more particles and a screen shake effect
- Fragments fade out after 1–2 seconds

### US-17: Smooth movement feel
> **As a** player  
> **I want to** movement that feels weighty and responsive  
> **So that** the game feels polished

**Acceptance:**
- FOV narrows slightly when sprinting (peripheral tunnel vision effect)
- Camera has subtle bob when walking (not sprinting)
- Acceleration curve: ~0.2s to reach full speed, ~0.1s to stop
- Jump arc feels natural (gravity ~30 units/s²)
