# Visual Guide & Game Walkthrough

## What to Expect When You Open the Game

### Initial View
When you first open `index.html`, you'll see:
- **Black background** with fog effects
- **Your character** (blue humanoid) in the center
- **3 gray knight enemies** scattered around the arena
- **1 red boss knight** in the circular red arena
- **2 orange checkpoint flames** (one near you, one to the side)
- **Gray walls** forming the arena boundaries
- **Pillars** scattered for tactical cover
- **UI overlay** with health/stamina bars and controls

### HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─HEALTH──────────────┐                                     │
│ │████████████████░░░░░│ Red bar                            │
│ └─────────────────────┘                                     │
│ ┌─STAMINA─────────────┐          Enemy Knight              │
│ │████████████████████░│ Green bar  ┌────────────────┐      │
│ └─────────────────────┘            │████████░░░░░░░░│      │
│                                     └────────────────┘      │
│                                                             │
│                        [3D GAME VIEW]                       │
│                                                             │
│                                   ⊕ Lock-on Reticle        │
│                                                             │
│ ┌─CONTROLS─────────┐                                       │
│ │ WASD - Move       │                                       │
│ │ Mouse - Camera    │                                       │
│ │ Left Click - Att  │                                       │
│ │ Hold Click - Heavy│                                       │
│ │ Space - Dodge     │                                       │
│ │ Q - Lock-on       │                                       │
│ │ E - Checkpoint    │                                       │
│ └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Visual Elements Description

### Your Character (Player)
```
      ⚪ <- Head (tan sphere)
    ┌─█─┐ <- Arms (blue)
    │ █ │ <- Body (blue box)
    │ █ │
    └─┬─┘
     ─┼─  <- Weapon (silver sword)
```
- Blue colored humanoid
- Visible sword on right side
- Animates when moving/attacking

### Enemy Knights
```
      ▪ <- Helmet (gray box)
    ┌─█─┐ <- Armored body (gray/metallic)
    │ █ │
    │ █ │
    └─┼─┘
      ─  <- Weapon (dark sword)
```
- Gray colored for regular enemies
- Red colored and larger for boss
- Rotate to face you when chasing

### Checkpoints (Bonfires)
```
      🔥 <- Orange flame (animated)
      ║
     ╱█╲ <- Gray base
    ═════
```
- Orange glowing flames
- Rotate continuously
- Bob up and down
- Emit orange light

### Level Layout (Top View)
```
┌─────────────────────────────────────────────────┐
│ ████ Walls ████                    ████ Walls ████│
│                                                 │
│    💀 Enemy        🏛️ Pillar                    │
│                                                 │
│                   🔥 Checkpoint                 │
│         🏛️                                      │
│    👤 Player                    💀 Enemy        │
│                   🏛️                            │
│                                                 │
│  🔥 Checkpoint           🏛️                     │
│                                                 │
│         🏛️                Boss Arena 🏛️          │
│                          ╔═══════╗              │
│    💀 Enemy              ║ 😈Boss║              │
│                          ╚═══════╝              │
│                                                 │
│ ████ Walls ████                    ████ Walls ████│
└─────────────────────────────────────────────────┘

Legend:
👤 = Player (Blue)
💀 = Enemy (Gray)
😈 = Boss (Red)
🔥 = Checkpoint
🏛️ = Pillar
```

## Game States Visual Guide

### 1. Normal Play
- Full color rendering
- Smooth camera following player
- Health and stamina bars visible
- Enemies moving around

### 2. Combat
```
[Player attacking enemy]
👤 ──⚔️─→ 💀
        SLASH!
        -15 HP
```
- Attack animations play
- Sound effects trigger
- Stamina bar decreases
- Enemy flashes red when hit

### 3. Lock-On Mode
```
    Camera view centers on:
    
    👤 Player          💀 Enemy
     ↓                  ↓
    You              Target
                       ⊕ Red reticle
```
- Red circular reticle on enemy
- Camera shows both player and enemy
- Easier to track enemy movements

### 4. Dodging
```
    👤 → 👤 → 👤 → 👤
   (Rolling animation)
   ✨ Invincible! ✨
```
- Character rotates while rolling
- Moves quickly forward
- Green stamina bar drops
- Brief invincibility

### 5. Death Screen
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│          ⚠️ YOU DIED ⚠️             │
│         (Pulsing red text)          │
│                                     │
│         [  Respawn  ]               │
│         (Click here)                │
│                                     │
└─────────────────────────────────────┘
```
- Large red "YOU DIED" text
- Pulsing animation
- Respawn button appears

## Lighting & Atmosphere

### Scene Lighting
- **Ambient**: Low bluish light (#404060)
- **Directional**: Moon-like light from above
- **Point Lights**: 
  - Orange glow near checkpoints
  - Purple atmospheric light
- **Shadows**: All characters and objects cast shadows
- **Fog**: Distance creates mysterious atmosphere

### Visual Effects
- **Attack Flash**: Enemy flashes red when hit
- **Damage Flash**: Player body flashes red when damaged
- **Checkpoint Glow**: Bright when activated
- **Death Animation**: Enemies rotate and fall
- **Stamina Glow**: Bar has gradient effect

## Animation Preview

### Idle (Standing Still)
```
Frame 1:    Frame 2:    Frame 3:
  👤          👤          👤
 Normal    Slight up   Slight down
          (breathing)
```

### Walking
```
Frame 1:    Frame 2:    Frame 3:    Frame 4:
  👤          👤          👤          👤
  ↑          ↑           ↑          ↑
 Left arm   Right arm   Left arm   Right arm
 forward    forward     forward    forward
 (bobbing up and down)
```

### Light Attack
```
Frame 1:    Frame 2:    Frame 3:
  👤          👤          👤
  |          ⤶──         ──⤷
Wind up    Swing out    Follow through
```

### Dodge Roll
```
Frame 1:    Frame 2:    Frame 3:    Frame 4:
  👤          ⤺👤         ⤹👤         👤
Standing   Rotating   Rotating    Complete
           180°       360°
```

## Combat Scenarios

### Scenario 1: First Enemy Encounter
```
1. Spot enemy patrolling
   💀 ← → Enemy walking

2. Approach carefully
   👤 → → → 💀

3. Press Q to lock on
   👤 → 💀 ⊕
        ^locked

4. Left-click to attack
   👤 ⚔️ → 💀 (flash red)
   -15 HP, -20 stamina

5. Enemy attacks back
   💀 ⚔️ → 👤
   (See wind-up animation!)

6. Press SPACE to dodge
   👤 ↺ ✨ (roll away)
   Enemy misses!

7. Counter-attack
   👤 ⚔️ → 💀
   Repeat until defeated
```

### Scenario 2: Using Checkpoint
```
1. See orange flame
   👤 → → → 🔥

2. Press E when close
   👤 (E) 🔥 ✨
   "Checkpoint Activated!"

3. Health & stamina restore
   ████████████ HP: 100%
   ████████████ Stamina: 100%

4. Checkpoint glows brighter
   🔥 💫
```

### Scenario 3: Boss Fight
```
1. Enter red arena
   👤 → ╔═══╗
        ║😈 ║
        ╚═══╝

2. Boss detects you
   😈 ! → 👤
   "Boss Knight"

3. Boss attacks (faster)
   😈 ⚔️⚔️ → 👤
   -30 damage!

4. Use lock-on (Q)
   👤 ⊕ 😈
   Track boss easier

5. Hit and run tactics
   👤 ⚔️ → 😈 (dash away)
   Repeat until victory!
```

## Performance Indicators

### Good Performance (60 FPS)
- ✅ Smooth camera movement
- ✅ Fluid animations
- ✅ Instant input response
- ✅ No stuttering

### If Performance Issues
- Try closing other browser tabs
- Check browser hardware acceleration
- Lower browser window size
- Clear browser cache

## Troubleshooting Visuals

### Problem: Black Screen
```
❌ Issue: Three.js not loading
✅ Solution: Check browser console
✅ Solution: Ensure internet connection
✅ Solution: Try different browser
```

### Problem: No Controls Working
```
❌ Issue: Mouse not locked
✅ Solution: Click on canvas
✅ Solution: Look for pointer icon
```

### Problem: Can't See Character
```
❌ Issue: Camera position wrong
✅ Solution: Refresh page
✅ Solution: Move mouse to rotate camera
```

## Expected Visual Quality

### Graphics Quality
- **Models**: Low-poly but recognizable
- **Lighting**: Dynamic with shadows
- **Materials**: PBR (Physically Based Rendering)
- **Shadows**: Soft shadows on all objects
- **Fog**: Atmospheric depth
- **UI**: Clean, readable overlays

### Color Palette
- **Background**: Very dark (#0a0a0a)
- **Player**: Blue (#4a90e2)
- **Enemies**: Gray (#666666)
- **Boss**: Dark Red (#8b0000)
- **Checkpoints**: Orange (#ff6600)
- **Health Bar**: Red (#c41e3a → #ff4d4d)
- **Stamina Bar**: Green (#2e7d32 → #4caf50)

## Recommended First Playthrough

1. ✅ **Start**: Load game, see character
2. ✅ **Learn**: Read controls, try moving
3. ✅ **Checkpoint**: Activate first flame (E key)
4. ✅ **Combat**: Fight one enemy, learn timing
5. ✅ **Lock-on**: Try Q key on an enemy
6. ✅ **Die**: Experience death screen
7. ✅ **Respawn**: Use checkpoint system
8. ✅ **Explore**: Find second checkpoint
9. ✅ **Boss**: Challenge the red knight
10. ✅ **Victory**: Defeat all enemies!

---

**Note**: This is a text-based representation of the visual game. The actual 3D game in the browser will have smooth animations, proper lighting, and full interactivity. Open `index.html` in your browser to experience it!
