# User Stories — Doomloop Sprint 4 (Audio, Weapons, Gameplay Depth, Scenes)

## Epic A: Audio & Atmosphere

> *"The game should sound as good as it looks — every action has a satisfying audio response."*

### US-A01: Weapon Shooting Sounds
**As a** player,  
**I want** each weapon to make a distinct and satisfying sound when I fire it,  
**So that** I can identify which weapon I'm using by sound alone and feel the impact of each shot.

**Acceptance:** Plasma Rifle emits a zap/energy pulse, Shotgun a heavy boom, SMG a rapid crackle, Rocket Launcher a whoosh + delayed explosion. All sounds play within 50ms of fire trigger. Sounds are synthesized via Web Audio API.

---

### US-A02: Enemy Sounds (Hurt & Death)
**As a** player fighting multiple enemy types,  
**I want** each enemy type to make distinct sounds when hurt and when dying,  
**So that** I get audio feedback on my hits and can tell when enemies are defeated without looking at them.

**Acceptance:** Each enemy type (Imp, Boss, Shooter Imp, Exploder, Flyer) has a unique hurt sound (on projectile hit) and death sound (on health reaching 0). Sound is audible from the enemy's position (stereo panning based on in-game position).

---

### US-A03: Boss Entrance Roar
**As a** player reaching Wave 5,  
**I want** the boss to announce its arrival with a dramatic roar,  
**So that** I feel the tension and significance of the boss fight.

**Acceptance:** On boss spawn, a ~2-second distinctive roar plays. Camera shakes briefly (intensity 0.2, duration 0.5s). HUD flashes "BOSS INCOMING" text for 1.5s. The roar is louder and more dramatic than normal boss sounds.

---

### US-A04: Background Music Intensifying
**As a** player progressing through waves,  
**I want** the background music to become more intense as waves advance,  
**So that** I feel the escalating tension and my heart rate rises with the difficulty.

**Acceptance:** Wave 1: dark drone ambient. Each subsequent wave adds a new layer (percussion, bass, melody, full intensity on wave 5). Music transitions smoothly between waves (0.5s crossfade). All layers synthesized via Web Audio API oscillators.

---

### US-A05: Footstep Sounds
**As a** player moving through the arena,  
**I want** to hear my character's footsteps at a rate matching my speed,  
**So that** the movement feels grounded and immersive.

**Acceptance:** Footsteps play at ~2/sec walking, ~3/sec sprinting. No footsteps when standing still or in air. Sound is a low-impact synthesized thud (short noise burst + low-pass filter). Not audible to enemies (player-only sound).

---

### US-A06: Bullet Impact Sounds
**As a** player firing at enemies and walls,  
**I want** to hear when my shots connect with enemies or hit the environment,  
**So that** I get audio confirmation of hits, helping me aim.

**Acceptance:** Enemy impact: sharp crack/meaty thud. Wall impact: dull thud with spark-like high-end. Explosions: loud deep boom with reverb tail. Rocket Launcher splash damage plays a distinct explosion sound.

---

### US-A07: Volume Controls
**As a** player who wants to control the game's audio,  
**I want** to adjust Master, SFX, and Music volume independently from the settings panel,  
**So that** I can find a comfortable audio balance or play silently.

**Acceptance:** Settings panel (accessible from gear icon) has three sliders: Master (0-100%, default 100%), SFX (0-100%, default 80%), Music (0-100%, default 50%). Master multiplies both SFX and Music. Changes apply immediately. Persisted to localStorage. Works on both desktop and mobile.

---

### US-A08: Audio Autoplay Compliance
**As a** browser user,  
**I want** the game to not play any audio until I've clicked or tapped the screen,  
**So that** I'm not surprised by sudden sound, and the browser doesn't block audio playback.

**Acceptance:** AudioContext is created on first user interaction (click/tap on start screen). No Web Audio API calls before interaction. AudioManager is in "suspended" state until explicitly resumed. AudioContext state transitions are logged in development mode.

---

## Epic B: Weapon System

> *"Four distinct weapons with unique play styles, satisfying to switch between, with resource management via ammo."*

### US-B01: Multiple Weapons
**As a** player who has mastered the Plasma Rifle,  
**I want** to use a Shotgun, SMG, and Rocket Launcher with unique behaviors,  
**So that** I can choose the right tool for each combat situation.

**Acceptance:** Shotgun fires 5-8 pellet spread (15° cone), SMG fires rapid single projectiles (8/sec), Rocket Launcher fires slow explosive projectile. Each weapon has unique damage, fire rate, spread, and ammo values.

---

### US-B02: Weapon Switching — Desktop
**As a** desktop player,  
**I want** to switch weapons using number keys 1-4 and the mouse wheel,  
**So that** I can quickly adapt to changing combat needs.

**Acceptance:** Keys 1-4 select Plasma Rifle, Shotgun, SMG, Rocket Launcher respectively. Mouse wheel scroll switches to next/previous weapon. Switch has 0.3s delay (cannot fire during switch). Current weapon is highlighted in weapon bar HUD.

---

### US-B03: Weapon Switching — Mobile
**As a** mobile player,  
**I want** to tap weapon icons in a weapon bar to switch weapons,  
**So that** I can change weapons during combat on a touch-only interface.

**Acceptance:** Weapon bar appears above fire button showing up to 4 weapon icons. Tap to switch. Current weapon highlighted. Bar fades to low opacity after 2s idle, reappears on tap in weapon bar zone. Same 0.3s switch delay as desktop.

---

### US-B04: Weapon Pickups
**As a** player starting a new game,  
**I want** to find and collect weapon pickups scattered around the arena,  
**So that** I can expand my arsenal beyond the starting Plasma Rifle.

**Acceptance:** Each arena has 2-3 weapon pickup spawner positions. Walk over the spawner to collect the weapon (or ammo if already owned). Spawners show floating weapon icon. Respawn after 15 seconds. New weapons are immediately available.

---

### US-B05: Ammo System
**As a** player,  
**I want** each weapon to have limited ammo that I must manage,  
**So that** I need to think strategically about when to use each weapon and seek ammo pickups.

**Acceptance:** Each weapon has a max ammo count: Plasma Rifle = 40, Shotgun = 12, SMG = 60, Rocket Launcher = 6. Ammo decrements on fire. Weapon cannot fire when ammo = 0. Ammo pickups restore ammo. Switching to empty weapon shows "No ammo" indicator.

---

### US-B06: Ammo Pickups
**As a** player running low on ammo mid-wave,  
**I want** ammo pickups to spawn in the arena,  
**So that** I can replenish my weapons and stay in the fight.

**Acceptance:** Small ammo pickups spawn every 3 enemy kills. Large ammo pickup spawns on wave intermission. Pickups glow and float. Walk over to collect. Small: +15 SMG / +5 Shotgun / +3 Rocket / +20 Plasma. Large: fills all weapons to 50% max.

---

### US-B07: Weapon HUD
**As a** player,  
**I want** to see my current weapon, ammo counts, and available weapons at all times,  
**So that** I can make informed decisions about weapon switching and reload strategy.

**Acceptance:** Bottom-center HUD shows weapon icons for all owned weapons. Current weapon highlighted. Ammo counter below each icon. Out-of-ammo weapon icon dimmed. Crosshair adapts to current weapon (Shotgun: wider cross, SMG: tight cluster, Rocket: large circle). All renders within HUD overlay.

---

## Epic C: Gameplay Depth

> *"The game becomes richer — power-ups, scoring, combos, difficulty tiers, and varied enemies create meaningful choices and replayability."*

### US-C01: Power-Ups
**As a** player in combat,  
**I want** power-ups to occasionally spawn in the arena that give me temporary advantages,  
**So that** I get exciting moments of empowerment and strategic choices about when to grab them.

**Acceptance:** Power-ups spawn one at a time (at wave start). 4 types: Speed Boost (blue, 50% speed for 8s), Double Damage (red, 2x damage for 8s), Shield (white, invulnerable for 6s), Health Pack (green, heal 40 HP). Visual: glowing floating orbs with color. 10s respawn after collection.

---

### US-C02: Score & Combo System
**As a** competitive player,  
**I want** my kills to be scored with a combo multiplier for rapid consecutive kills,  
**So that** I'm rewarded for aggressive, skillful play — and want to beat my high score.

**Acceptance:** Points per kill: Imp=100, Shooter Imp=150, Exploder=200, Flyer=300, Boss=1000. Kill within 2s of last kill: combo multiplier increases (max 10x). Score = base × multiplier. Combo timer bar shows remaining window. High score saved to localStorage.

---

### US-C03: Kill Streak Callouts
**As** a player building a combo,  
**I want** exciting callout text to appear on screen at streak milestones,  
**So that** I feel recognized and motivated to push for higher combos.

**Acceptance:** Combo 2 = "Double Kill!", 3 = "Triple Kill!", 4 = "Multi Kill!", 5 = "RAMPAGE!", 7 = "DOMINATION!", 10 = "GODLIKE!". Callout animates center-screen (scale 0.8→1.2→1.0, 1.5s). Distinct sound plays each tier.

---

### US-C04: Difficulty Selection
**As a** player of any skill level,  
**I want** to choose Easy, Normal, or Hard difficulty before starting,  
**So that** I can tailor the challenge to my ability or mood.

**Acceptance:** Start screen shows 3 buttons. Easy: 0.7x enemy health, 0.5x enemy damage, standard wave count, 10s power-ups, 0.8x score. Normal: 1.0x all, 8s power-ups, 1.0x score. Hard: 1.5x enemy health/damage, +25% enemies, 5s power-ups, 1.5x score.

---

### US-C05: Shooter Imp Enemy
**As a** player,  
**I want** to face a ranged enemy that fires projectiles from a distance,  
**So that** I can't just kite backward — I need to dodge and close the gap.

**Acceptance:** Shooter Imp has 3 HP. Stays 8-15 units from player. Fires energy projectile (speed 20, damage 8) every 1.5s. AI: run to range → aim → fire → reposition. Appearance: Imp with arm-cannon.

---

### US-C06: Exploder Enemy
**As a** player,  
**I want** to face a high-risk, high-reward enemy that charges and self-destructs,  
**So that** I need to prioritize it as a threat and use positioning to avoid the blast.

**Acceptance:** Exploder has 2 HP. Charges at 1.3x player sprint speed. Explodes in 4-unit radius (20 damage player, 5 damage other enemies). Glows brighter yellow as it gets closer. Hisses louder approaching. Killed before reaching player: still explodes but less damage (10). Drops no ammo.

---

### US-C07: Flyer Enemy
**As a** player used to ground-based combat,  
**I want** to face an aerial enemy that swoops down to attack,  
**So that** I have to watch the sky and lead my shots against a moving target.

**Acceptance:** Flyer has 4 HP. Hovers at height 6-10 units. Flight path: sine wave horizontal movement toward player. Dive attack: drops down when within 5 units (12 contact damage). 3s dive cooldown. Appearance: bat-like or floating skull mesh.

---

## Epic D: Scene & Visual

> *"Three unique arenas, portal transitions, particle effects, mini-map, and interactive elements make each run feel like an adventure."*

### US-D01: Three Unique Arenas
**As a** returning player,  
**I want** to play in visually different arenas (Stone Fortress, Lava Cavern, Void Nexus),  
**So that** each play session feels fresh and I look forward to seeing which arena comes next.

**Acceptance:** Stone Fortress (40x40, grey stone, warm light, torch-like ambiance). Lava Cavern (45x45, dark rock, red glow, lava cracks). Void Nexus (50x50, purple/black cosmic, star floor, crystalline pillars). Each has unique color palette, lighting, fog, and pillar types.

---

### US-D02: Portal Transitions
**As a** player who has completed an arena,  
**I want** to walk through a portal that transitions me to the next arena,  
**So that** I experience a smooth, visually impressive journey between distinct environments.

**Acceptance:** After 5 waves completed in current arena, a glowing portal appears. Walking into it triggers: fade to white (0.5s) → portal visual → load next arena → fade in (0.5s). Health, weapons, ammo, and score persist. Enemies reset for new wave set.

---

### US-D03: Enhanced Particle Effects
**As a** player firing weapons and killing enemies,  
**I want** to see satisfying particle effects (muzzle flash, explosions, shell casings, death bursts),  
**So that** the action feels punchy and visually spectacular.

**Acceptance:** Muzzle flash per weapon (blue/white/red/orange). Explosions (20-40 particles, 0.5s fade, dynamic light). Shell casings (physics bodies ejected per shot, despawn after 5s). Death burst (colored particle burst on enemy death). All particles must not drop frame rate below 30 FPS on mobile.

---

### US-D04: Mini-Map
**As a** player navigating a large arena,  
**I want** a mini-map in the corner showing arena layout, my position, enemies, and pickups,  
**So that** I can orient myself and plan my movement even while looking at the action.

**Acceptance:** 120x120px (desktop), 80x80px (mobile), top-right corner. HTML5 Canvas overlay. Shows: arena rectangle, player dot (centered), enemy dots (red), pickup dots (colored), portal (glowing circle). Updated every frame. Does not overlap touch controls or HUD.

---

### US-D05: Trap Zones
**As a** player moving through the arena,  
**I want** to encounter interactive trap zones that add environmental danger,  
**So that** positioning matters more and arenas feel alive.

**Acceptance:** 2-4 traps per arena. Stone Fortress: pressure plate → wall spikes (15 damage). Lava Cavern: geyser vents (15 damage + knockback). Void Nexus: gravity wells (50% slow, 3s). Traps affect both player and enemies. Visual indicator (floor glow/pulse). 5s reset cooldown.

---

### US-D06: Supply Stations
**As a** player running low on health and ammo,  
**I want** to find a supply station I can activate once per wave,  
**So that** I have a strategic fallback point when things get desperate.

**Acceptance:** One supply station per arena. Glowing terminal/crystal. Press E (desktop) or on-screen button (mobile) to activate. Full ammo refill + 25 HP heal. Once per wave cooldown. Green checkmark when available. Grey/dim when on cooldown.
