# Souls of the Fallen

A web-based 3D action RPG inspired by Souls-like games (e.g., Dark Souls), built with [Three.js](https://threejs.org/) and vanilla JavaScript. The game runs entirely in the browser with real-time 3D rendering, combat mechanics, and responsive controls.

## Play

Open `index.html` in a modern web browser (Chrome, Firefox, Edge). An internet connection is required for the Three.js CDN dependency.

## Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move character |
| **Mouse** | Rotate camera |
| **Scroll Wheel** | Zoom in/out |
| **Left Click** | Light attack (fast swing, moderate damage) |
| **Hold Left Click** | Heavy attack (charged, high damage + stagger) |
| **Spacebar** | Dodge roll (grants invincibility frames) |
| **Q** | Toggle lock-on to nearest enemy |
| **E** | Interact (rest at bonfire) |
| **Shift** | Sprint |
| **R** | Respawn (when dead) |

## Features

### 3D Environment & Rendering
- Dark fantasy themed environment with dynamic lighting and shadows
- Third-person camera with mouse orbit and zoom controls
- Exponential fog for atmosphere and performance
- Procedurally generated level geometry (walls, corridors, pillars, rubble)

### Player Character & Combat
- Humanoid character model built from basic geometry with procedural animations
- **Light attack**: Quick swing, 15 damage, costs 12 stamina
- **Heavy attack**: Charged swing, 35 damage, costs 25 stamina, can stagger enemies
- **Dodge roll**: Brief invincibility frames (i-frames) to avoid damage, costs 20 stamina
- **Stamina system**: Regenerates after a short delay; depletes with attacks, dodges, and sprinting
- **Lock-on targeting**: Press Q to lock onto the nearest enemy with a UI reticle

### Enemy AI & Behavior
- **Knight enemies**: Patrol designated areas, detect the player within range, and engage in combat
- **Telegraphed attacks**: Enemies wind up before striking, giving the player time to react/dodge
- **State machine AI**: Patrol → Chase → Telegraph → Attack → Recover cycle
- Health bars floating above enemies

### Boss Fight
- **Guardian of the Abyss**: Larger, more powerful boss enemy with:
  - 300 HP (vs 80 for regular knights)
  - Multiple attack patterns (overhead slam, wide sweep, lunge thrust)
  - Phase 2 at 50% health: increased speed and aggression
  - Dedicated boss health bar on the HUD

### UI & Game Systems
- Player health and stamina bars (top-left HUD)
- Boss health bar (bottom-center, shown during boss encounter)
- Death screen with respawn prompt
- Victory screen upon defeating the boss
- Bonfire interaction prompt
- Screen flash on hit for damage feedback

### Level Design
- Starting courtyard with bonfire (checkpoint)
- Corridor with patrol enemies and obstacles
- Mid-level bonfire checkpoint
- Boss arena with pillars for cover
- Shortcut passages

### Checkpoint System (Bonfires)
- Rest at bonfires to restore health and stamina
- Sets respawn point
- Respawns all enemies when resting

### Audio
- Procedural sound effects via Web Audio API (no external files needed):
  - Weapon swoosh (light/heavy attacks)
  - Impact sounds on hit
  - Footsteps while walking/sprinting
  - Dodge roll sound
  - Death sound
  - Bonfire interaction sound
  - Boss roar

## Technical Details

- **Engine**: Three.js r128 via CDN
- **Language**: ES6+ JavaScript with modular code structure
- **Rendering**: WebGL with PCF soft shadow mapping, ACES filmic tone mapping
- **Performance**: Built-in frustum culling, exponential fog for distance culling, capped pixel ratio
- **Audio**: Web Audio API with procedural sound synthesis
- **Architecture**: Namespace-based modular design (`GAME.*` classes)

## File Structure

```
index.html          — Main HTML page with HUD overlay
css/styles.css      — Game UI and HUD styles
js/audio.js         — AudioManager (Web Audio API sound effects)
js/input.js         — InputManager (keyboard + mouse input handling)
js/level.js         — LevelBuilder (environment geometry and bonfires)
js/player.js        — Player (character, movement, combat, stamina)
js/enemy.js         — Enemy + EnemyManager (AI, boss, patrol/combat)
js/camera.js        — CameraController (third-person orbit camera)
js/ui.js            — UIManager (HUD bars, reticle, screens)
js/combat.js        — CombatSystem (hit detection, damage resolution)
js/game.js          — Game (main loop, scene setup, state management)
js/main.js          — Entry point
```

## Browser Requirements

- Modern browser with WebGL support
- Pointer Lock API support (for mouse-look camera)
- Web Audio API support (for sound effects)
