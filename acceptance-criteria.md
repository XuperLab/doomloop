# Acceptance Criteria — Doomloop Sprint 4 (Audio, Weapons, Gameplay Depth, Scenes)

All acceptance criteria are organized by feature ID (matching the PRD), with cross-references to user stories (US-XXX). Priority: P0 = ship blocker, P1 = high priority, P2 = nice to have.

---

## A01 — AudioManager Architecture

Priority: P0 | US-A08

- **AC-A01-01** [P0] `AudioManager` is a singleton class with methods: `playSFX(name: string, options?: SFXOptions)`, `playMusic(name: string)`, `stopAll()`, `setVolume(channel: 'master' | 'sfx' | 'music', level: number)`, `resume()`.
- **AC-A01-02** [P0] `AudioManager` uses Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `StereoPannerNode`). No external audio files required for P0 features.
- **AC-A01-03** [P0] AudioContext is created on first user interaction (click/tap on start screen). Before that, `audioContext.state` is `'suspended'`. After interaction, `audioContext.resume()` is called.
- **AC-A01-04** [P0] `setVolume('master', 0.5)` reduces all output by 50%. `setVolume('sfx', 0)` mutes all SFX while music still plays. Master volume multiplies both SFX and Music gain nodes.
- **AC-A01-05** [P1] All sound-producing modules reference `AudioManager.getInstance()` — no direct Web Audio API usage outside AudioManager.
- **AC-A01-06** [P1] A `SFXOptions` interface exists supporting: `volume?: number` (0-1), `loop?: boolean`, `stereoPan?: number` (-1 to 1), `pitch?: number` (playback rate multiplier).

---

## A02 — Weapon Shooting SFX

Priority: P0 | US-A01

- **AC-A02-01** [P0] Plasma Rifle fires a synthesized zap sound: brief high-frequency oscillator (sawtooth, 800→1200Hz sweep over 0.08s) with 0.1s gain envelope.
- **AC-A02-02** [P0] Shotgun fires a synthesized boom: white noise burst (0.15s) through low-pass filter (300Hz cutoff), gain envelope with fast attack (0.01s), slow decay (0.2s).
- **AC-A02-03** [P0] SMG fires a synthesized crackle: short noise burst (0.03s) through band-pass filter (2000Hz), repeated at fire rate (8/sec). Each burst is an independent short envelope.
- **AC-A02-04** [P0] Rocket Launcher fires a synthesized whoosh: filtered noise sweep (2000→200Hz over 0.3s) followed by explosion (white noise burst 0.2s, low-pass 150Hz, gain 0.8).
- **AC-A02-05** [P0] All weapon SFX play within 50ms of the `fire()` call (measured via `performance.now()`).
- **AC-A02-06** [P1] Each weapon SFX is stereo-panned to the center (player's own weapon). Enemy weapon SFX are panned based on enemy position relative to camera.

---

## A03 — Enemy Hurt/Death Sounds

Priority: P0 | US-A02

- **AC-A03-01** [P0] Imp hurt: brief low growl (square wave, 150Hz, 0.1s). Imp death: shriek (sawtooth, 400→200Hz sweep, 0.3s).
- **AC-A03-02** [P0] Boss hurt: deep roar (sawtooth, 100→80Hz, 0.3s, with distortion). Boss death: explosion (noise burst 0.5s, low-pass 100Hz, gain 1.0) + debris crackle.
- **AC-A03-03** [P0] Shooter Imp hurt: electronic screech (square wave, 600→400Hz, 0.15s). Shooter Imp death: ping + fizzle (sine 1000→200Hz, 0.4s).
- **AC-A03-04** [P0] Exploder hurt: hiss (white noise, high-pass 5000Hz, 0.2s). Exploder death: explosion (noise burst, 0.3s, same as rocket explosion but smaller).
- **AC-A03-05** [P0] Flyer hurt: buzzing crackle (sawtooth + noise, 0.15s). Flyer death: crackle + fade (noise burst 0.2s fading out).
- **AC-A03-06** [P0] Hurt sounds play when `enemy.takeDamage()` is called (on projectile hit). Death sounds play when `enemy.health <= 0` and before death effect.
- **AC-A03-07** [P1] Enemy sounds are positioned in 3D space using stereo panning based on the angle from player to enemy (simplified: left/right position on screen maps to stereo pan).

---

## A04 — Boss Entrance Roar

Priority: P0 | US-A03

- **AC-A04-01** [P0] Boss entrance roar plays when boss spawns (Wave 5 start, before boss mesh appears or within 0.1s of it appearing).
- **AC-A04-02** [P0] Roar is a distinctive sound: low distorted roar (sawtooth+square, 120→60Hz sweep over 1.5s, with distortion/waveshaper, gain 1.0).
- **AC-A04-03** [P0] Roar is approximately 2 seconds long. Must be the loudest sound in the game (gain 1.0, unaffected by SFX volume reduction — only Master volume controls it).
- **AC-A04-04** [P0] Camera shake accompanies the roar: intensity 0.2, duration 0.5s, triggered via `ScreenShake.trigger(0.2, 0.5)`.
- **AC-A04-05** [P1] HUD displays "BOSS INCOMING" text center-screen for 1.5s during the roar, fading in over 0.3s and out over 0.5s.
- **AC-A04-06** [P1] The roar sound effect is pre-allocated (not created from scratch at spawn time) to avoid audio startup latency.

---

## A05 — Background Music

Priority: P0 | US-A04

- **AC-A05-01** [P0] BGM consists of synthesized layers: drone (low sawtooth, 55Hz, low-pass filter 300Hz), percussion (noise bursts, 808-style kick via oscillator sweep), bass (triangle wave, 55-110Hz), lead (square wave melody, 400-800Hz).
- **AC-A05-02** [P0] Wave 1: drone only. Wave 2: drone + percussion. Wave 3: drone + percussion + bass. Wave 4: all 4 layers. Wave 5: all layers + distortion on lead + increased tempo (1.2x play rate).
- **AC-A05-03** [P0] Layer transitions between waves crossfade over 0.5s (new layer ramps in, no abrupt cut).
- **AC-A05-04** [P0] Music volume is controlled by the Music channel slider independently of SFX.
- **AC-A05-05** [P1] An arena-specific music theme modifier adjusts oscillator types: Stone Fortress (organ-like tones, square wave), Lava Cavern (aggressive, sawtooth + distortion), Void Nexus (ethereal, sine wave + reverb via delay node).
- **AC-A05-06** [P1] BGM stops on death and victory screens, resumes on restart (fade in over 1s).

---

## A06 — Footstep Sounds

Priority: P0 | US-A05

- **AC-A06-01** [P0] Footsteps play at a rate of ~2/sec when player is walking and on the ground. ~3/sec when sprinting. No footsteps when standing still or airborne.
- **AC-A06-02** [P0] Footstep sound is a synthesized thud: short noise burst (0.05s) through low-pass filter (200Hz), with 0.01s attack and 0.04s release gain envelope.
- **AC-A06-03** [P0] Step timing uses an accumulator: each step resets a timer; next step fires when timer >= stepInterval. Step interval = 0.5s for walk, 0.33s for sprint.
- **AC-A06-04** [P1] Footstep volume is proportional to player speed: slow walk quieter, sprint louder (gain 0.3 vs 0.6).
- **AC-A06-05** [P2] Different floor materials (Stone Fortress stone, Lava Cavern rock, Void Nexus crystal) produce slightly different footstep timbres (filter cutoff adjustment per arena).

---

## A07 — Bullet Impact Sounds

Priority: P0 | US-A06

- **AC-A07-01** [P0] Player projectile hitting an enemy: sharp crack sound (short noise burst 0.05s, band-pass 2000Hz, gain 0.5).
- **AC-A07-02** [P0] Player projectile hitting arena wall/floor/pillar: dull thud + spark (noise burst 0.08s, low-pass 400Hz, high-frequency overlay).
- **AC-A07-03** [P0] Rocket explosion: deep boom (noise burst 0.3s, low-pass 120Hz, gain 1.0) with reverb tail (delay node feedback 0.3 for 0.5s).
- **AC-A07-04** [P0] Impact sounds play at the impact position (stereo panned to collision location).
- **AC-A07-05** [P1] Impact sounds are gated: if 10+ impacts occur within 0.1s (e.g., Shotgun pellets), only the first plays or the volume is aggregated.

---

## A08 — Volume Controls in Settings

Priority: P0 | US-A07

- **AC-A08-01** [P0] Settings panel (extending Sprint 3 TouchSettings) has three additional sliders: Master Volume, SFX Volume, Music Volume.
- **AC-A08-02** [P0] Each slider has a range of 0–100, displayed as percentage. Defaults: Master=100, SFX=80, Music=50.
- **AC-A08-03** [P0] Master volume slider multiplies the output of both SFX and Music gain nodes. Master at 0 = silence.
- **AC-A08-04** [P0] Changes apply in real-time (no restart needed). Slider `oninput` event updates the corresponding AudioManager channel immediately.
- **AC-A08-05** [P0] Settings persist to localStorage under key `doomloop_audio_settings` (in addition to existing `doomloop_touch_settings`). Format: `{ masterVolume: 100, sfxVolume: 80, musicVolume: 50 }`.
- **AC-A08-06** [P0] Volume sliders work on both desktop (mouse drag) and mobile (touch drag). They inherit the touch-action: manipulation CSS from Sprint 3.
- **AC-A08-07** [P1] Volume sliders are displayed as part of the same settings overlay (can be in a second tab/page if the panel is crowded). Accessible from the gear icon.

---

## B01 — Weapon Interface / Abstract Class

Priority: P0 | US-B01

- **AC-B01-01** [P0] A `Weapon` abstract class exists with methods: `fire(): boolean`, `update(dt: number): void`, `getName(): string`, `getIcon(): string` (emoji or SVG name), `getAmmo(): number`, `getMaxAmmo(): number`, `reload(): void`.
- **AC-B01-02** [P0] `Weapon` has properties: `damage: number`, `fireRate: number` (seconds between shots), `ammo: number`, `maxAmmo: number`, `projectileSpeed: number`, `spreadAngle: number`, `projectileCount: number`, `isAutomatic: boolean`, `name: string`.
- **AC-B01-03** [P0] Existing `PlasmaRifle.ts` is refactored to extend `Weapon`. Its behavior (250ms fire rate, single projectile, damage 1) is preserved.
- **AC-B01-04** [P0] `Player.ts` holds a `weapons: Weapon[]` array with `currentWeaponIndex: number`. `currentWeapon` reference returns `weapons[currentWeaponIndex]`.
- **AC-B01-05** [P0] `tsc --noEmit` zero errors after refactor. `npm run build` succeeds.

---

## B02 — Weapons — Shotgun

Priority: P0 | US-B01

- **AC-B02-01** [P0] Shotgun fires 5–8 projectiles in a 15° spread cone. Each pellet is an individual Projectile with speed 40 units/sec, lifetime 0.8s.
- **AC-B02-02** [P0] Each pellet does 2 damage on hit. Maximum theoretical damage per shot: 16 (8 pellets × 2 damage).
- **AC-B02-03** [P0] Fire rate: 1 shot per 1.2 seconds (0.833 shots/sec). Cannot fire during cooldown.
- **AC-B02-04** [P0] Max ammo: 12. Uses 1 ammo per shot. Cannot fire when ammo = 0.
- **AC-B02-05** [P0] Projectile meshes are small spheres or elongated pellets (fast-moving, small visual footprint).

---

## B03 — Weapons — SMG (Sub-Machine Gun)

Priority: P0 | US-B01

- **AC-B03-01** [P0] SMG fires 1 projectile per shot. Damage per hit: 1.
- **AC-B03-02** [P0] Fire rate: 8 shots per second (0.125s interval). Automatic: holding fire button continuously fires.
- **AC-B03-03** [P0] Max ammo: 60. Uses 1 ammo per shot.
- **AC-B03-04** [P0] Projectile speed: 60 units/sec (fastest weapon).
- **AC-B03-05** [P0] Minimal spread angle (2°) for slight inaccuracy at range, preventing it from being as accurate as the Plasma Rifle.

---

## B04 — Weapons — Rocket Launcher

Priority: P0 | US-B01

- **AC-B04-01** [P0] Rocket Launcher fires 1 projectile per shot. Projectile speed: 30 units/sec.
- **AC-B04-02** [P0] Direct hit: 20 damage to primary target. Area damage: 10 damage in 3-unit radius with falloff (linear from 20 at center to 1 at 3 units).
- **AC-B04-03** [P0] Fire rate: 1 shot per 1.5 seconds (0.667 shots/sec).
- **AC-B04-04** [P0] Max ammo: 6. Uses 1 ammo per shot.
- **AC-B04-05** [P0] Rocket projectile is a larger mesh (glowing cylinder/capsule) with a visible particle trail (simple line or Points trail behind it).
- **AC-B04-06** [P0] On impact (enemy or arena wall): explosion particle effect (20-40 particles) + screen shake (intensity 0.3, duration 0.3s).
- **AC-B04-07** [P0] Self-damage: if player is within 2 units of explosion center, take 10 damage (half of enemy direct hit). This prevents rocket spam at close range.
- **AC-B04-08** [P1] Rocket explosion creates a temporary point light (THREE.PointLight, color 0xFF6600, intensity 2, range 10, duration 0.3s).

---

## B05 — Weapon Switching — Desktop

Priority: P0 | US-B02

- **AC-B05-01** [P0] Pressing key `1` selects Plasma Rifle, `2` selects Shotgun, `3` selects SMG, `4` selects Rocket Launcher.
- **AC-B05-02** [P0] Scrolling mouse wheel up selects the next weapon in the array. Scrolling down selects the previous weapon. Wraps around at array bounds.
- **AC-B05-03** [P0] Switching weapons has a 0.3s cooldown. `currentWeapon.fire()` returns false during cooldown. Visual: brief weapon-swap animation (HUD weapon icon slides down/up).
- **AC-B05-04** [P0] Keybinding only switches to a weapon the player owns. Pressing a key for an unowned weapon does nothing (no error).
- **AC-B05-05** [P0] Starting inventory: player begins with Plasma Rifle only. Other weapons are acquired via pickups during play.

---

## B06 — Weapon Switching — Mobile

Priority: P0 | US-B03

- **AC-B06-01** [P0] A weapon bar (horizontal row of weapon icons) is displayed above the fire button on mobile devices. Width: auto, max 4 icons.
- **AC-B06-02** [P0] Each weapon icon is a 24x24px square or circle with the weapon's identifying symbol/color. Current weapon has a bright border/highlight.
- **AC-B06-03** [P0] Tapping a weapon icon switches to that weapon. Same 0.3s switch cooldown as desktop. Feedback: icon briefly scales up then returns.
- **AC-B06-04** [P0] Weapon bar auto-fades to opacity 0.3 after 2 seconds of no interaction. Any tap on the weapon bar area restores full opacity.
- **AC-B06-05** [P0] Weapon bar position respects safe area inset: `bottom: calc(env(safe-area-inset-bottom, 10px) + 90px)` (above fire button which is ~70px from bottom).

---

## B07 — Weapon Pickup Spawners

Priority: P0 | US-B04

- **AC-B07-01** [P0] Each arena has 2–3 weapon pickup spawner positions, defined in the `ArenaLayout.weaponSpawners` array.
- **AC-B07-02** [P0] Each spawner is a visual marker: a floating weapon icon above a small platform/crate, with a gentle bob animation (sine wave, amplitude 0.3 units, period 1.5s).
- **AC-B07-03** [P0] When the player overlaps the spawner (within 1.5-unit radius), the weapon is added to the player's inventory. If the player already owns that weapon, ammo is added instead (half of max ammo).
- **AC-B07-04** [P0] After collection, the spawner enters a 15-second respawn cooldown. During cooldown, the icon dims and bobbing stops. After cooldown, the icon brightens and resumes bobbing.
- **AC-B07-05** [P1] Each spawner is assigned a specific weapon type in ArenaLayout (not random per spawn).

---

## B08 — Ammo System

Priority: P0 | US-B05

- **AC-B08-01** [P0] Each weapon tracks `ammo` (current) and `maxAmmo`. Plasma Rifle: max 40. Shotgun: max 12. SMG: max 60. Rocket Launcher: max 6.
- **AC-B08-02** [P0] `fire()` decrements ammo by 1 per shot. If ammo = 0, `fire()` returns false and no projectile is created.
- **AC-B08-03** [P0] Switching to a weapon with 0 ammo shows a brief "No Ammo" indicator (red text or icon flash on the HUD weapon icon, 1 second).
- **AC-B08-04** [P0] Ammo cannot go below 0 or above maxAmmo. `reload()` from a pickup respects maxAmmo cap.

---

## B09 — Ammo Pickups

Priority: P0 | US-B06

- **AC-B09-01** [P0] Small ammo pickup: visual = single floating bullet/energy cell model with dimmer glow. On collection: adds SMG +15, Shotgun +5, Rocket +3, Plasma +20.
- **AC-B09-02** [P0] Large ammo pickup: visual = stack/crate model with brighter glow. On collection: fills all weapons to 50% of maxAmmo.
- **AC-B09-03** [P0] Small ammo pickups spawn every 3 enemy kills (tracked by WaveManager.enemiesKilled counter). Spawn at random positions using existing arena spawn point logic (not overlapping pillars).
- **AC-B09-04** [P0] Large ammo pickup spawns once at the start of each wave intermission (after all enemies in wave killed, before next wave spawns).
- **AC-B09-05** [P0] Both pickup types float and bob at height 1 unit above ground, with a green/cyan glow. Collection radius: 1.5 units (same as health packs).

---

## B10 — Weapon HUD

Priority: P0 | US-B07

- **AC-B10-01** [P0] Bottom-center HUD bar shows weapon icons for all owned weapons. Current weapon is highlighted (brighter, slightly larger, with a selection underline/border).
- **AC-B10-02** [P0] Below each weapon icon, the current ammo count is displayed as "ammo/max" (e.g., "12/12" for full Shotgun).
- **AC-B10-03** [P0] Weapons with 0 ammo show a dimmed icon with a small red X overlay or translucent.
- **AC-B10-04** [P0] The crosshair changes based on the current weapon: Plasma Rifle (small circle), Shotgun (wide + indicator, 5-8 dots in spread pattern), SMG (tight cluster), Rocket Launcher (large circle with center dot).
- **AC-B10-05** [P1] Weapon HUD is HTML/CSS overlay (matching existing HUD approach). Crosshair is SVG (matching existing Crosshair.ts pattern).
- **AC-B10-06** [P1] HUD elements are responsive: on mobile, weapon icons reduce to 20x20px and ammo text to 0.6rem to fit the smaller screen.

---

## C01 — Power-Up Spawning

Priority: P0 | US-C01

- **AC-C01-01** [P0] One power-up spawns at the start of each wave (during the SPAWNING state). Spawns at a random arena position (using the same spawn-point logic as enemy spawns).
- **AC-C01-02** [P0] Max 1 active power-up at a time. If a power-up is already active and uncollected, no new one spawns.
- **AC-C01-03** [P0] After a power-up is collected, a new one spawns after 10 seconds (or at next wave start, whichever comes first).
- **AC-C01-04** [P0] Power-up type is selected randomly: 30% chance Speed Boost, 25% Double Damage, 25% Shield, 20% Health Pack.
- **AC-C01-05** [P0] Power-up visual: glowing floating orb at 1.5 units height, with color matching type (blue/red/white/green), 0.5-unit radius. Gentle bob animation (sine, amplitude 0.2, period 1s).

---

## C02 — Power-Up — Speed Boost

Priority: P0 | US-C01

- **AC-C02-01** [P0] On collection, player movement speed increases by 50% for 8 seconds (walk 12→18, sprint 18→27). Effect on timer display on HUD.
- **AC-C02-02** [P0] Visual: blue aura/rim light on the player model (Three.js rim light or a blue-tinted emissive sphere slightly larger than the player mesh).
- **AC-C02-03** [P0] Blue particle trail behind the player while active (3-5 small blue particles per frame, lifetime 0.5s).
- **AC-C02-04** [P0] Collecting another Speed Boost while active resets the 8-second timer (no stacking of effect magnitude).

---

## C03 — Power-Up — Double Damage

Priority: P0 | US-C01

- **AC-C03-01** [P0] On collection, all weapon damage is multiplied by 2 for 8 seconds. Timer displayed on HUD.
- **AC-C03-02** [P0] Visual: projectiles gain a red hue/glow (emissive color shift) while active. Crosshair turns red. Subtle red vignette effect on screen edges.
- **AC-C03-03** [P0] Damage calculation: `finalDamage = baseDamage × 2`. Rocket explosions also deal double damage.
- **AC-C03-04** [P0] Collecting another Double Damage resets the timer. No stacking beyond 2x.

---

## C04 — Power-Up — Shield

Priority: P0 | US-C01

- **AC-C04-01** [P0] On collection, player is invulnerable for 6 seconds. Timer displayed on HUD.
- **AC-C04-02** [P0] Visual: translucent white sphere/wireframe sphere surrounds the player (THREE.SphereGeometry with MeshBasicMaterial, opacity 0.3, wireframe or semi-transparent). Sphere is child of player mesh (moves with player).
- **AC-C04-03** [P0] During shield, `player.takeDamage()` receives the call but deals 0 damage (damage flash and sound still play? — no, shield blocks damage flash too).
- **AC-C04-04** [P0] Shield break: when timer expires, shield sphere fades out over 0.5s. Distinctive "shield break" sound plays (descending tone, 800→200Hz, 0.3s).
- **AC-C04-05** [P0] Collecting another Shield resets the timer. No stacking of duration.

---

## C05 — Power-Up — Health Pack

Priority: P0 | US-C01

- **AC-C05-01** [P0] On collection, player heals 40 HP. HP cannot exceed 100 (overheal prevention).
- **AC-C05-02** [P0] Visual: green glow burst on collection (existing health pack collection effect can be reused). No duration timer (instant effect).
- **AC-C05-03** [P0] If player HP is already at 100, the power-up spawns but has a slightly dimmer glow to indicate it's less urgent. Collecting at full HP does nothing (item persists — no consumption).

---

## C06 — Score System

Priority: P0 | US-C02

- **AC-C06-01** [P0] ScoreManager tracks: `score: number`, `combo: number`, `highScore: number`, `enemiesKilledThisWave: number`.
- **AC-C06-02** [P0] Points per kill: Imp=100, Shooter Imp=150, Exploder=200, Flyer=300, Boss=1000.
- **AC-C06-03** [P0] Score is displayed in the top-right HUD area as a number (e.g., "SCORE: 4500").
- **AC-C06-04** [P0] High score is loaded from localStorage (`doomloop_high_score`) on game init. On death, if current score > high score, new high score is saved and "NEW HIGH SCORE!" text flashes on death screen.
- **AC-C06-05** [P0] Score persists across arena transitions (does not reset when moving through a portal).

---

## C07 — Combo Multiplier

Priority: P0 | US-C02

- **AC-C07-01** [P0] Combo multiplier starts at 1. Each kill within 2 seconds of the previous kill increments combo by 1. Max combo: 10.
- **AC-C07-02** [P0] Combo timer: a 2-second countdown visible on HUD near the score (thin bar depleting left-to-right). When the bar empties, combo resets to 1.
- **AC-C07-03** [P0] Score per kill = base_points × combo_multiplier. A 5x combo kill of a Flyer (300 base) = 1500 points.
- **AC-C07-04** [P0] Combo resets to 1 if 2 seconds pass without a kill. Combo also resets to 1 on player death.
- **AC-C07-05** [P1] Combo bar animates smoothly: on each kill, the bar resets and pulses briefly.

---

## C08 — Kill Streak Display

Priority: P0 | US-C03

- **AC-C08-01** [P0] On reaching combo 2: "Double Kill!" callout appears center-screen. Animated: scale 0.8→1.2→1.0 over 1.5s, opacity 1→0 over 2s total.
- **AC-C08-02** [P0] Combo 3: "Triple Kill!". Combo 4: "Multi Kill!". Combo 5: "RAMPAGE!". Combo 7: "DOMINATION!". Combo 10: "GODLIKE!".
- **AC-C08-03** [P0] Each tier has a unique sound: a short ascending tone sequence (higher pitch for higher tiers). e.g., Double Kill: 2 quick beeps, Triple Kill: 3 beeps, RAMPAGE: distorted shout-like synthesis.
- **AC-C08-04** [P0] Callout is rendered as HTML text overlay (centered, large font, gold color with text-shadow). Font size: 2rem on desktop, 1.5rem on mobile.
- **AC-C08-05** [P0] Callout does not block gameplay — purely visual/audio feedback. Multiple callouts can overlap (if combo 2 and 3 fire within the 2s animation window, both stack on screen).

---

## C09 — Difficulty Selection

Priority: P0 | US-C04

- **AC-C09-01** [P0] Start screen shows 3 buttons below the title: "Easy", "Normal", "Hard". Default selection: Normal (highlighted by default).
- **AC-C09-02** [P0] Difficulty choice persists for the entire run (cannot change mid-game).
- **AC-C09-03** [P0] Easy: enemy health × 0.7, enemy damage × 0.5, wave count unchanged (reference), power-up duration 10s, score × 0.8.
- **AC-C09-04** [P0] Normal: enemy health × 1.0, enemy damage × 1.0, reference wave count, power-up duration 8s, score × 1.0.
- **AC-C09-05** [P0] Hard: enemy health × 1.5, enemy damage × 1.5, wave count +25% (wave 1 = 4 imps instead of 3, etc), power-up duration 5s, score × 1.5.
- **AC-C09-06** [P0] Difficulty selection works on both desktop (click buttons) and mobile (tap buttons). Touch-action: manipulation ensures no delay.
- **AC-C09-07** [P1] "High Score" display on start screen notes the difficulty it was achieved on ("High Score: 12000 — Normal").

---

## C10 — New Enemy — Shooter Imp

Priority: P0 | US-C05

- **AC-C10-01** [P0] Shooter Imp has 3 HP (same as regular Imp). Contact damage if touching player: 5 (lower than Imp's 10 — ranged enemies are weaker in melee).
- **AC-C10-02** [P0] AI behavior: run to a preferred range of 8–15 units from player. Once in range: stop and face player → fire projectile (1.5s cooldown) → after firing, reposition (strafe or back up).
- **AC-C10-03** [P0] Projectile: speed 20 units/sec, damage 8 per hit, mesh = smaller version of boss projectile (red energy bolt). Lifetime: 3s.
- **AC-C10-04** [P0] Visual: Imp body texture with a glowing arm-cannon attachment on the right arm. The cannon glows red when firing.
- **AC-C10-05** [P0] Spawn positions: same as regular Imps, mixed in wave composition (e.g., Wave 2: 2 Imps + 1 Shooter Imp).

---

## C11 — New Enemy — Exploder

Priority: P0 | US-C06

- **AC-C11-01** [P0] Exploder has 2 HP. Contact damage: 5 (from bumping, not primary threat — the explosion is).
- **AC-C11-02** [P0] Movement: charges at player at 1.3x player sprint speed (speed = 23.4 units/sec). Direct path toward player, no evasion.
- **AC-C11-03** [P0] Self-destruct: when Exploder reaches the player (within 1-unit contact range), it explodes. Explosion radius: 4 units. Player damage: 20 (up to 3 units) with falloff to 5 at 4 units. Other enemies in blast: 5 damage.
- **AC-C11-04** [P0] If the Exploder is killed before reaching the player (HP reaches 0), it still explodes after 0.5s delay. Explosion damage: 10 to player, 5 to enemies.
- **AC-C11-05** [P0] Visual indication: Exploder glows yellow/orange. The glow intensity increases as it gets closer to the player (brightness inversely proportional to distance). Light emission: THREE.PointLight on Exploder that grows.
- **AC-C11-06** [P0] Audio: continuous hissing sound that gets louder and higher-pitched as it approaches.
- **AC-C11-07** [P0] Spawn: at least 1 Exploder per wave from Wave 2 onward.

---

## C12 — New Enemy — Flyer

Priority: P0 | US-C07

- **AC-C12-01** [P0] Flyer has 4 HP. Cannot be body-blocked by ground enemies (different collision group, or no collision with ground enemies).
- **AC-C12-02** [P0] Flight height: 6–10 units above the arena floor. Moves in a sine-wave horizontal path (amplitude 3 units, period 2s) toward the player's XZ position.
- **AC-C12-03** [P0] Dive attack: when Flyer is within 5 units horizontally of the player, it dives downward toward the player at speed 30 units/sec. Contact damage on dive: 12. After dive (regardless of hit), climbs back to flight height over 1s.
- **AC-C12-04** [P0] Dive cooldown: 3 seconds after reaching flight height again.
- **AC-C12-05** [P0] Visual: bat-like or floating skull mesh with translucent wings/appendages. Has a subtle hovering idle animation (gentle bobbing at flight height).
- **AC-C12-06** [P0] Spawn: Wave 3 onward, 1–2 per wave. Flyers are immune to trap zones (flying above them).

---

## D01 — Multiple Arenas — Stone Fortress

Priority: P0 | US-D01

- **AC-D01-01** [P0] Stone Fortress is the first arena. Size: 40x40. Wall color: stone gray (#8B8B8B). Floor: flagstone tile pattern (grid lines).
- **AC-D01-02** [P0] AmbientLight: color 0xFFCC88 (warm), intensity 0.8. DirectionalLight: color 0xFFFFFF, intensity 1.5, position (10, 20, 10). Fog: color 0xCCBBAA, near 30, far 60.
- **AC-D01-03** [P0] Pillars: square stone columns (BoxGeometry, 2x8x2 units) with capital tops (smaller box on top). Color: #7A7A7A.
- **AC-D01-04** [P0] 2–4 torch sconces on walls (small floating sphere with PointLight, orange, intensity 0.5) for ambiance.

---

## D02 — Multiple Arenas — Lava Cavern

Priority: P0 | US-D01

- **AC-D02-01** [P0] Lava Cavern is the second arena. Size: 45x45. Wall color: dark basalt (#2A1A0A). Floor: dark rock with glowing lava cracks (emissive lines/orange glow).
- **AC-D02-02** [P0] AmbientLight: color 0xFF4422 (red), intensity 0.6. DirectionalLight: color 0xFF6644, intensity 1.2, position (-10, 25, -5). Fog: color 0x442200, near 35, far 60.
- **AC-D02-03** [P0] Pillars: rough rock columns (CylinderGeometry, radius 1–2, height 6–10). Color: #3A2A1A.
- **AC-D02-04** [P0] Lava pools at arena edges (decorative only): orange emissive planes with subtle animation (UV offset for flow). Player falls off arena → instant death respawn.

---

## D03 — Multiple Arenas — Void Nexus

Priority: P0 | US-D01

- **AC-D03-01** [P0] Void Nexus is the third arena. Size: 50x50 (largest). Wall color: dark purple (#1A0033). Floor: reflective dark surface with star-like specks (emissive dots, randomly placed).
- **AC-D03-02** [P0] AmbientLight: color 0x8844FF (purple), intensity 0.5. DirectionalLight: color 0xAA88FF, intensity 1.0, position (5, 15, 5). Fog: color 0x110022, near 40, far 70.
- **AC-D03-03** [P0] Pillars: crystalline/glowing columns (BoxGeometry with emissive material, color #6633CC, emissive #4422AA). Hexagonal or tapered shape preferred.
- **AC-D03-04** [P0] Floating debris/asteroid rocks at random positions (static, 3–5 units above ground, for atmosphere). Small sphere meshes with emissive material.

---

## D04 — Arena Selection & Portal Transitions

Priority: P0 | US-D02

- **AC-D04-01** [P0] Arena selection at game start: random choice from 3 arenas. After completing 5 waves, next arena is the next in sequence (Stone Fortress → Lava Cavern → Void Nexus → back to Stone Fortress for endless).
- **AC-D04-02** [P0] When all 5 waves in current arena are complete, a portal mesh appears at a fixed position (e.g., arena center, marked with a glowing ring on floor). Portal mesh: torus/ring geometry with animated emissive spiral texture.
- **AC-D04-03** [P0] Player touching the portal triggers transition: 0.5s fade to white (CSS overlay, opacity 0→1) → destroy current arena/scene → load new arena → 0.5s fade from white (opacity 1→0).
- **AC-D04-04** [P0] On transition: Player health (current value) persists. Weapons inventory persists with current ammo counts. Score and combo persist. WaveManager resets to Wave 1 of the new arena.
- **AC-D04-05** [P0] Enemies, pickups, and arena meshes from the previous arena are fully destroyed (Three.js geometry disposed, physics bodies removed).
- **AC-D04-06** [P1] Portal has a gravitational particle effect: 10–20 particles streaming into the portal center. Particles are small white dots, lifetime 0.5s, spawned in a ring around the portal.

---

## D05 — Enhanced Particle Effects — Muzzle Flash

Priority: P0 | US-D03

- **AC-D05-01** [P0] Plasma Rifle muzzle flash: 5–8 small blue particles (points) at weapon tip, burst outward over 0.1s, fade out. Color: 0x4488FF.
- **AC-D05-02** [P0] Shotgun muzzle flash: 10–15 yellow/white particles in a wide cone (15°), over 0.2s. Contains a brief smoke puff (larger, semi-transparent white sphere, 0.3s).
- **AC-D05-03** [P0] SMG muzzle flash: 3 orange sparks per shot, emit at fire rate. Small, over 0.05s each.
- **AC-D05-04** [P0] Rocket Launcher muzzle flash: 15–20 red/orange particles with a smoke ring (torus of particles), over 0.3s. Largest flash of all weapons.
- **AC-D05-05** [P0] All muzzle flash particle systems use `THREE.Points` with `PointsMaterial` (size attenuation, vertex colors). Spawn at `weaponMuzzlePosition` (a Vector3 computed from camera/player forward direction).
- **AC-D05-06** [P1] Muzzle flash particles despawn completely after their lifetime (no lingering particles). Object pooling preferred to avoid GC pressure.

---

## D06 — Enhanced Particle Effects — Explosion

Priority: P0 | US-D03

- **AC-D06-01** [P0] Explosion particle effect: 20–40 points expanding spherically from explosion center. Colors: orange (#FF8800), red (#FF2200), yellow (#FFCC00). Lifetime: 0.5s. Size: start 0.3, end 0.05.
- **AC-D06-02** [P0] Explosion creates a temporary `THREE.PointLight`: color 0xFF6600, intensity 2.0, distance 10. Light fades out over 0.3s.
- **AC-D06-03** [P0] Screen shake accompanies explosion: `ScreenShake.trigger(0.3, 0.3)`.
- **AC-D06-04** [P1] Explosion particles are affected by a simple radial velocity: each particle has a random outward velocity (magnitude 5–15 units/sec), decelerating to 0 over lifetime.

---

## D07 — Enhanced Particle Effects — Shell Casings

Priority: P0 | US-D03

- **AC-D07-01** [P0] On weapon fire, a shell casing mesh spawns at the player's weapon position, drops to the ground under physics, and despawns after 5 seconds.
- **AC-D07-02** [P0] Plasma Rifle: glowing energy cell (small box, emissive blue, fades to transparent over 1s). Shotgun: large shell casing (box, 0.1×0.2×0.1 units, brass color). SMG: small casing (box, 0.03×0.05×0.03 units). Rocket Launcher: smoking canister (cylinder, 0.1×0.15 units, with smoke particle trail).
- **AC-D07-03** [P0] Shell casings use `CANNON.Body` with low mass (0.1) and physics material with high restitution (0.3). They bounce once then settle.
- **AC-D07-04** [P1] Max 30 shell casings alive at once. When limit is reached, oldest casing is removed (pool reuse).

---

## D08 — Enhanced Particle Effects — Death Burst

Priority: P0 | US-D03

- **AC-D08-01** [P0] Imp death burst: 8–12 red particle shards (small box geometry meshes) flying outward from death position. Velocity: 5–10 units/sec random. Lifetime: 0.8s. Despawn: fade out.
- **AC-D08-02** [P0] Shooter Imp death burst: 8–12 blue sparks. Same mechanics as Imp but blue color.
- **AC-D08-03** [P0] Exploder death burst: 15–20 orange embers + the explosion effect from D06 (which also plays on Exploder death). Combined effect.
- **AC-D08-04** [P0] Flyer death burst: 10–15 purple wisps (small semi-transparent spheres or points). Slow velocity (3–5 units/sec) with upward drift. Lifetime: 1s.
- **AC-D08-05** [P0] Boss death burst: 50+ golden particles in a large expanding sphere. More dramatic than regular enemies. Includes the explosion effect from D06 and extended screen shake (0.5 intensity, 0.8s duration).

---

## D09 — Mini-Map

Priority: P0 | US-D04

- **AC-D09-01** [P0] Mini-map is an HTML5 Canvas overlay (`<canvas>` element with CSS `position: fixed`, `pointer-events: none`). Size: 120x120px on desktop (>768px viewport), 80x80px on mobile.
- **AC-D09-02** [P0] Position: top-right corner. Respects safe area: `top: calc(env(safe-area-inset-top, 10px) + 10px); right: calc(env(safe-area-inset-right, 10px) + 10px)`.
- **AC-D09-03** [P0] Rendered elements: arena rectangle (outline, 1px white line), player position (bright green dot, 3px radius, always center of the map), enemy positions (red dots, 2px radius), power-up/ammo pickup positions (colored dots matching their type color), portal position (golden circle, 4px radius, pulsing).
- **AC-D09-04** [P0] Map orientation: top-down view, player always at center, map rotates to match player heading (player face-up convention).
- **AC-D09-05** [P0] Map scale: arena dimensions mapped to canvas size with 4px padding. Player's current arena dimensions used for scaling.
- **AC-D09-06** [P0] Mini-map updates every frame (or every other frame to reduce CPU usage). Canvas is cleared and redrawn each update.
- **AC-D09-07** [P0] Mini-map does NOT block any touch input (pointer-events: none). Does not overlap with touch controls or weapon bar.

---

## D10 — Interactive Arena Elements — Trap Zones

Priority: P0 | US-D05

- **AC-D10-01** [P0] Each arena has 2–4 trap zones. Each trap zone is a visually distinct floor area (2x2 units square) with a subtle glow or pulse animation.
- **AC-D10-02** [P0] Stone Fortress trap: pressure plate → wall spikes. When player/enemy walks over the plate, wall spikes extend from the nearest wall into the plate area. Damage: 15 to anything in the spike area. Spike duration: 1.5s. Cooldown: 5s.
- **AC-D10-03** [P0] Lava Cavern trap: geyser vent. When player/enemy steps on it, a column of fire/steam erupts upward (height 5 units, duration 1s). Damage: 15. Knockback: player pushed 3 units away. Cooldown: 5s.
- **AC-D10-04** [P0] Void Nexus trap: gravity well. When player/enemy steps on it, a purple sphere (radius 4 units) slows movement by 50% for 3 seconds. No damage. Cooldown: 5s.
- **AC-D10-05** [P0] Traps affect both player and enemies. An enemy stepping on a trap takes damage or is slowed the same as the player.
- **AC-D10-06** [P1] Visual indicator: trap zones have a subtle pulsing floor glow (Stone Fortress: faint orange pulse, Lava Cavern: red/orange glow, Void Nexus: purple ripple). The glow intensifies as the trap cooldown ends.

---

## D11 — Interactive Arena Elements — Supply Stations

Priority: P0 | US-D06

- **AC-D11-01** [P0] One supply station per arena. A visually distinct mesh: glowing crystal (Void Nexus), stone altar with runes (Stone Fortress), obsidian pedestal with lava crystal (Lava Cavern). Height: 2 units. Glow: matches arena theme.
- **AC-D11-02** [P0] When player is within 2 units of the supply station, a prompt appears: "Press E to use" (desktop) or an on-screen interaction button (mobile — new touch element near the fire button area).
- **AC-D11-03** [P0] Activation: pressing E (desktop) or tapping the interaction button (mobile) triggers: full ammo refill (all weapons restored to maxAmmo) + heal 25 HP. "SUPPLIES RESTORED" text appears briefly.
- **AC-D11-04** [P0] Cooldown: once per wave. When on cooldown, the station dims and the prompt says "Recharging...". On wave start (SPAWNING state), the station becomes available again with a bright flash/pulse effect.
- **AC-D11-05** [P0] Visual state: green checkmark or bright glow above station when available. Grey/dim when on cooldown.

---

## Cross-Cutting & Non-Functional Requirements

- **AC-NFR01** [P0] Maintain 60 FPS on desktop (i5-8400, GTX 1060) with 15+ enemies, active particles, mini-map, and audio all running simultaneously.
- **AC-NFR02** [P0] Maintain 30 FPS on iPhone 11+ with touch controls, particles, mini-map, and audio.
- **AC-NFR03** [P0] SFX plays within 50ms of trigger event (measured via performance.now()).
- **AC-NFR04** [P0] Sprint 1-3 features are unchanged: basic arena loop, touch controls (joystick/camera drag/fire/jump), safe areas, gesture suppression, haptic feedback, touch settings panel continue to work.
- **AC-NFR05** [P0] Desktop touch input is not modified. Pointer lock still works. WASD + mouse unchanged.
- **AC-NFR06** [P0] Bundle size increase from Sprint 4 additions ≤ 50 KB gzipped. No new npm library dependencies (all audio and particles are procedural/code-only).
- **AC-NFR07** [P0] AudioContext is suspended until first user interaction. No audio plays before user click/tap.
- **AC-NFR08** [P0] Mini-map positioned top-right, does not overlap touch controls, respects safe area insets.
- **AC-NFR09** [P0] Weapon switch input registers within 50ms of keypress/tap.
- **AC-NFR10** [P0] Arena transition fade completes within 1 second total.
- **AC-NFR11** [P0] `tsc --noEmit` zero errors.
- **AC-NFR12** [P0] `npm run build` succeeds.
- **AC-NFR13** [P1] Particle systems use object pooling (pre-allocated particle arrays) to avoid GC pressure during combat.
- **AC-NFR14** [P1] AudioManager uses pre-allocated oscillator/gain nodes where possible (lazy initialization inside playSFX, not create-from-scratch every call).
- **AC-NFR15** [P1] Settings (volume, difficulty selection) persist across page refreshes via localStorage.
