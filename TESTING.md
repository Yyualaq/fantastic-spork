# Manual Testing Guide for Souls-like 3D RPG

This document provides a comprehensive testing checklist for verifying all game features work correctly.

## Setup Testing

### ✓ Initial Load
- [ ] Open index.html in a modern browser
- [ ] Verify Three.js loads from CDN without errors
- [ ] Confirm 3D scene renders with dark background
- [ ] Check that all UI elements are visible

### ✓ Visual Elements
- [ ] Player character (blue humanoid) is visible at center
- [ ] 3 Regular enemies (gray knights) are visible in the arena
- [ ] 1 Boss enemy (red knight) is visible in the red circular arena
- [ ] 2 Checkpoints (orange flames) are visible
- [ ] Walls, ground, and pillars are rendered correctly
- [ ] Lighting creates shadows and atmospheric effects
- [ ] Fog is visible in the distance

## Control Testing

### ✓ Movement (WASD)
- [ ] W key moves player forward
- [ ] A key moves player left
- [ ] S key moves player backward
- [ ] D key moves player right
- [ ] Diagonal movement (W+A, W+D, etc.) works smoothly
- [ ] Player character rotates to face movement direction
- [ ] Character stays within arena boundaries (no escaping walls)

### ✓ Camera Control (Mouse)
- [ ] Moving mouse left/right rotates camera horizontally
- [ ] Moving mouse up/down adjusts camera pitch (limited range)
- [ ] Camera follows player smoothly
- [ ] Camera maintains appropriate distance from player
- [ ] Clicking on canvas locks mouse pointer

### ✓ Combat - Light Attack
- [ ] Left-click performs a light attack
- [ ] Attack animation plays (arm swings forward)
- [ ] Sound effect plays on attack
- [ ] Stamina decreases by 20 points
- [ ] Cannot attack if stamina < 20
- [ ] Enemies take damage when in range and facing
- [ ] Hit sound effect plays on successful hit

### ✓ Combat - Heavy Attack
- [ ] Hold left-click for > 0.5 seconds performs heavy attack
- [ ] Heavy attack has longer wind-up animation
- [ ] Different sound effect for heavy attack
- [ ] Stamina decreases by 40 points
- [ ] Cannot attack if stamina < 40
- [ ] Heavy attack deals more damage than light attack
- [ ] Enemies react to heavy attacks with visual feedback

### ✓ Dodge/Roll
- [ ] Spacebar performs a dodge roll
- [ ] Roll animation plays (body rotates)
- [ ] Roll moves player forward quickly
- [ ] Stamina decreases by 25 points
- [ ] Cannot roll if stamina < 25
- [ ] Player is invincible during first 0.4s of roll
- [ ] Enemy attacks miss during i-frames
- [ ] Roll sound effect plays

### ✓ Lock-on System
- [ ] Q key toggles lock-on
- [ ] Red reticle appears on nearest enemy
- [ ] Reticle follows locked enemy's position
- [ ] Camera adjusts to keep both player and enemy visible
- [ ] Pressing Q again unlocks target
- [ ] Lock-on releases if enemy dies
- [ ] Lock-on releases if enemy is too far

## UI Testing

### ✓ Health Bar
- [ ] Health bar is visible in top-left
- [ ] Bar is full (100%) at start
- [ ] Bar decreases when taking damage
- [ ] Bar displays correct percentage
- [ ] Bar color is red gradient
- [ ] Label "HEALTH" is visible

### ✓ Stamina Bar
- [ ] Stamina bar is visible below health bar
- [ ] Bar is full (100%) at start
- [ ] Bar decreases when attacking/rolling
- [ ] Bar regenerates when idle (15 per second)
- [ ] Regeneration stops during actions
- [ ] Bar color is green gradient
- [ ] Label "STAMINA" is visible

### ✓ Enemy Health Bar
- [ ] Enemy health bar appears when locked-on or in combat
- [ ] Bar shows enemy name ("Enemy Knight" or "Boss Knight")
- [ ] Bar decreases as enemy takes damage
- [ ] Bar disappears when enemy dies
- [ ] Bar is centered at top of screen
- [ ] Bar shows correct health percentage

### ✓ Controls Info
- [ ] Controls panel visible in bottom-left
- [ ] All control mappings are listed
- [ ] Text is readable with good contrast
- [ ] Panel doesn't obstruct gameplay

### ✓ Death Screen
- [ ] "YOU DIED" appears when health reaches 0
- [ ] Text pulses with animation
- [ ] "Respawn" button is visible and clickable
- [ ] Death sound effect plays
- [ ] Screen appears centered

### ✓ Checkpoint Message
- [ ] "Checkpoint Activated" message appears when activating
- [ ] Message fades in and out smoothly
- [ ] Message is centered on screen
- [ ] Message disappears after 2 seconds

## Enemy AI Testing

### ✓ Patrol State
- [ ] Enemies walk around their spawn area when idle
- [ ] Enemies choose random patrol points
- [ ] Enemies face their movement direction
- [ ] Enemies rotate smoothly

### ✓ Detection & Chase
- [ ] Enemies detect player within 15 units (20 for boss)
- [ ] Enemies change to chase state when player is detected
- [ ] Enemies move toward player
- [ ] Enemies face player while chasing
- [ ] Enemies return to patrol if player moves far away

### ✓ Attack State
- [ ] Enemies attack when within 3 units (4 for boss)
- [ ] Attack has visible wind-up animation
- [ ] Telegraph sound plays before attack
- [ ] Player takes damage if in range when attack lands
- [ ] Attack has cooldown period (2s for regular, 1.5s for boss)
- [ ] Enemies continue facing player during attack

### ✓ Enemy Damage & Death
- [ ] Enemies flash red when taking damage
- [ ] Enemy health decreases correctly
- [ ] Enemies die when health reaches 0
- [ ] Death animation plays (rotation/fall)
- [ ] Dead enemies are removed after 3 seconds
- [ ] Boss has more health than regular enemies

## Checkpoint System Testing

### ✓ Checkpoint Activation
- [ ] First checkpoint is auto-activated at start
- [ ] Pressing E near checkpoint activates it
- [ ] Activation range is approximately 3 units
- [ ] Checkpoint flame becomes brighter when active
- [ ] "Checkpoint Activated" message displays
- [ ] Player health is restored to 100%
- [ ] Player stamina is restored to 100%
- [ ] Activation sound plays

### ✓ Respawn System
- [ ] Player respawns at last activated checkpoint
- [ ] Health is restored to 100% on respawn
- [ ] Stamina is restored to 100% on respawn
- [ ] All enemies respawn (including dead ones)
- [ ] Player position resets to checkpoint location
- [ ] Death screen disappears after respawn

## Combat Mechanics Testing

### ✓ Damage Calculation
- [ ] Light attack deals 15 damage
- [ ] Heavy attack deals 35 damage
- [ ] Regular enemy deals 20 damage
- [ ] Boss deals 30 damage
- [ ] Damage is only dealt to enemies in front of player
- [ ] Damage requires being within attack range

### ✓ Stamina Management
- [ ] Light attack costs 20 stamina
- [ ] Heavy attack costs 40 stamina
- [ ] Roll costs 25 stamina
- [ ] Stamina regenerates at 15 per second when idle
- [ ] Actions are blocked when insufficient stamina
- [ ] Stamina cannot exceed 100

### ✓ Invincibility Frames
- [ ] Player is invincible for first 0.4s of roll
- [ ] Enemy attacks miss during i-frames
- [ ] Visual indicator (no damage feedback) during i-frames
- [ ] I-frames end after timer expires
- [ ] Player can be hit after i-frames end

## Animation Testing

### ✓ Player Animations
- [ ] Idle: Subtle breathing motion (up/down)
- [ ] Walking: Body bobs up and down
- [ ] Walking: Arms swing opposite to each other
- [ ] Attack: Arm swings forward then returns
- [ ] Heavy Attack: Slower, more pronounced swing
- [ ] Roll: Body rotates during roll motion
- [ ] All transitions are smooth

### ✓ Enemy Animations
- [ ] Patrol: Enemies walk smoothly
- [ ] Attack: Arm wind-up then swing
- [ ] Death: Enemy rotates and falls over
- [ ] All animations complete properly

### ✓ Environment Animations
- [ ] Checkpoint flames rotate continuously
- [ ] Checkpoint flames bob up and down
- [ ] Lighting effects pulse on checkpoints

## Audio Testing

### ✓ Sound Effects
- [ ] Light attack: 400Hz square wave
- [ ] Heavy attack: 300Hz sawtooth wave
- [ ] Dodge/roll: 200Hz sine wave
- [ ] Hit enemy: 600Hz square wave (short)
- [ ] Take damage: 250Hz sawtooth wave
- [ ] Enemy telegraph: 350Hz triangle wave
- [ ] Checkpoint activation: 800Hz sine wave (longer)
- [ ] Death: 150Hz sawtooth wave (long)
- [ ] All sounds have appropriate duration
- [ ] Volume levels are balanced

## Performance Testing

### ✓ Rendering Performance
- [ ] Game runs at ~60 FPS on modern hardware
- [ ] No stuttering during movement
- [ ] No frame drops during combat
- [ ] Shadows render correctly
- [ ] Fog doesn't cause performance issues

### ✓ Memory & Resources
- [ ] No memory leaks during extended play
- [ ] Dead enemies are cleaned up properly
- [ ] Event listeners don't accumulate
- [ ] Browser doesn't slow down over time

## Edge Cases Testing

### ✓ Boundary Conditions
- [ ] Player cannot escape arena
- [ ] Enemies don't clip through walls
- [ ] Camera doesn't go underground
- [ ] Health cannot go below 0
- [ ] Stamina cannot go below 0
- [ ] Health cannot exceed 100
- [ ] Stamina cannot exceed 100

### ✓ State Conflicts
- [ ] Cannot attack while rolling
- [ ] Cannot roll while attacking
- [ ] Cannot move normally during roll
- [ ] Actions blocked when dead
- [ ] Lock-on releases properly on enemy death
- [ ] Multiple checkpoints work independently

### ✓ Rapid Input
- [ ] Rapid clicking doesn't break attack system
- [ ] Spam rolling respects stamina cost
- [ ] Quick lock-on toggles work correctly
- [ ] Movement inputs don't conflict

## Browser Compatibility

### ✓ Chrome
- [ ] All features work
- [ ] Performance is good
- [ ] Audio works
- [ ] Pointer lock works

### ✓ Firefox
- [ ] All features work
- [ ] Performance is good
- [ ] Audio works
- [ ] Pointer lock works

### ✓ Safari
- [ ] All features work
- [ ] Performance is acceptable
- [ ] Audio works (may need user interaction first)
- [ ] Pointer lock works

### ✓ Edge
- [ ] All features work
- [ ] Performance is good
- [ ] Audio works
- [ ] Pointer lock works

## Final Integration Test

### ✓ Complete Playthrough
- [ ] Start game from beginning
- [ ] Activate first checkpoint
- [ ] Kill 1 regular enemy using light attacks
- [ ] Kill 1 regular enemy using heavy attacks
- [ ] Kill 1 regular enemy using mixed attacks
- [ ] Activate second checkpoint
- [ ] Take damage and verify health bar updates
- [ ] Use roll to avoid attack successfully
- [ ] Lock onto boss enemy
- [ ] Engage in boss fight
- [ ] Get killed intentionally
- [ ] Verify death screen appears
- [ ] Respawn and verify checkpoint system
- [ ] Defeat boss enemy
- [ ] Verify all systems working together

## Known Limitations

- Three.js must be loaded from CDN (included in HTML)
- Requires modern browser with WebGL support
- Requires pointer lock API support
- Audio requires user interaction in some browsers
- Performance depends on hardware capabilities

## Reporting Issues

When reporting issues, please include:
1. Browser name and version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Console errors (if any)
6. Screenshots (if applicable)
