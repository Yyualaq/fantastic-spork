# Souls-like 3D Action RPG

A browser-based 3D action RPG game inspired by Dark Souls, built with Three.js and JavaScript.

## Features

### 3D Environment & Rendering
- Dark fantasy-themed environment with dynamic lighting and shadows
- Third-person camera system with smooth following and mouse/keyboard controls
- Atmospheric fog and point lights for immersive visuals
- Arena-style level with walls, pillars, and obstacles
- Boss arena with distinct visual marking

### Player Character & Combat
- Low-poly humanoid player model with animated body parts
- **Combat Mechanics:**
  - **Light Attack** (Left Click): Fast swing with moderate damage (costs 20 stamina)
  - **Heavy Attack** (Hold Left Click > 0.5s): Slower charged attack with high damage (costs 40 stamina)
  - **Dodge/Roll** (Spacebar): Quick roll with invincibility frames (costs 25 stamina)
- **Lock-on Targeting** (Q key): Lock onto nearest enemy with visual reticle
- Stamina system that depletes with actions and regenerates when idle
- Smooth animations for idle, walking, rolling, and attacking

### Enemy AI & Behavior
- **Regular Enemies:** Knight enemies with patrol, chase, and attack states
- **Boss Enemy:** Larger, more dangerous knight with enhanced stats
- AI behaviors:
  - Patrol area when idle
  - Detect and chase player within detection range
  - Attack with telegraphed animations
  - Face player during combat
- Health bars and damage feedback with visual effects
- Death animations with gradual fade-out

### UI & Game Systems
- **HUD Elements:**
  - Player health bar (red gradient)
  - Player stamina bar (green gradient)
  - Enemy health bar (appears when in combat or locked-on)
  - Lock-on reticle (red circular indicator)
  - Controls guide (always visible)
- **Death/Respawn System:**
  - "YOU DIED" screen when health reaches 0
  - Respawn at last activated checkpoint
  - Enemies respawn on player death
- **Sound Effects:** Web Audio API integration for attacks, hits, and interactions

### Level Design & Progression
- Interconnected arena with boundaries
- Multiple checkpoints (bonfire-style) for health/stamina restoration
- Boss arena at the end of the level
- Strategic pillar placement for cover and tactics

## Controls

| Input | Action |
|-------|--------|
| **W/A/S/D** | Move character |
| **Mouse** | Rotate camera |
| **Left Click** | Light attack |
| **Hold Left Click** | Heavy attack (charge) |
| **Spacebar** | Dodge/Roll (i-frames) |
| **Q** | Toggle lock-on targeting |
| **E** | Activate checkpoint |

## How to Play

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Click on the game canvas to capture mouse input
3. Move around with WASD keys
4. Click anywhere in the game to lock the mouse pointer
5. Approach checkpoints (orange flames) and press 'E' to activate them
6. Combat enemies using light and heavy attacks
7. Use dodge/roll to avoid enemy attacks during their telegraphed wind-up
8. Manage your stamina - it's required for all actions
9. Lock onto enemies with 'Q' for easier targeting
10. Defeat all enemies including the boss in the red arena

## Technical Details

- **Engine:** Three.js (WebGL-based 3D rendering)
- **Language:** ES6+ JavaScript
- **Architecture:** Modular code structure with separate systems:
  - Scene & Rendering
  - Player Controller
  - Enemy AI State Machine
  - Combat System
  - Camera Controller
  - UI Management
  - Audio System
  - Checkpoint System
- **Performance Optimizations:**
  - Shadow mapping for realistic lighting
  - Fog for draw distance optimization
  - Efficient state-based AI updates
  - Frustum culling (built into Three.js)

## Game Configuration

The game uses a centralized `CONFIG` object for easy balancing:

```javascript
const CONFIG = {
    player: {
        maxHealth: 100,
        maxStamina: 100,
        staminaRegen: 15,
        moveSpeed: 5,
        rollSpeed: 10,
        rollDuration: 0.6,
        attackStaminaCost: 20,
        heavyAttackStaminaCost: 40,
        rollStaminaCost: 25,
        lightAttackDamage: 15,
        heavyAttackDamage: 35,
    },
    enemy: {
        maxHealth: 150,
        moveSpeed: 2,
        attackRange: 3,
        detectionRange: 15,
        attackDamage: 20,
        attackCooldown: 2,
    },
    boss: {
        maxHealth: 300,
        moveSpeed: 3,
        attackRange: 4,
        detectionRange: 20,
        attackDamage: 30,
        attackCooldown: 1.5,
    }
};
```

## Browser Compatibility

- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

**Requirements:**
- WebGL support
- Pointer Lock API support
- Web Audio API support (optional, for sound effects)

## File Structure

```
fantastic-spork/
├── index.html          # Main game file (self-contained)
└── README.md          # This file
```

## Development Notes

- The game uses a single HTML file with embedded CSS and JavaScript for easy deployment
- Three.js is loaded from CDN (jsdelivr)
- All game logic is commented for clarity
- The camera uses a third-person follow system with lock-on capability
- Enemy AI uses a simple but effective state machine (Patrol → Chase → Attack)
- Combat system includes hit detection based on distance and facing direction
- Stamina management adds strategic depth to combat

## Future Enhancements

Potential improvements for extended development:
- Additional enemy types with varied attack patterns
- More complex level design with multiple areas
- Equipment and upgrade system
- Particle effects for attacks and magic
- Advanced animations using skeletal rigging
- Multiplayer functionality
- Save/load system
- More sophisticated AI pathfinding
- Additional boss mechanics (phases, special attacks)

## Credits

Created as a demonstration of browser-based 3D game development using Three.js.

## License

MIT License - Feel free to use and modify for your own projects.
