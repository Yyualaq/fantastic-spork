/**
 * Game — Main game class orchestrating the game loop, scene setup,
 * and all subsystems (player, enemies, camera, UI, combat, audio, level).
 *
 * Manages:
 * - Three.js scene, renderer, and lighting
 * - Game loop with delta time
 * - Game state (start, playing, dead, victory)
 * - Bonfire/checkpoint system
 * - Lock-on targeting
 * - Performance: frustum culling (built-in), fog for distance culling
 */
'use strict';

window.GAME = window.GAME || {};

GAME.Game = class Game {
    constructor() {
        this.state = 'start'; // start, playing, dead, victory
        this.lastTime = 0;

        // Three.js core
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Subsystems
        this.input = null;
        this.audio = null;
        this.ui = null;
        this.player = null;
        this.enemyManager = null;
        this.cameraController = null;
        this.combatSystem = null;
        this.trailManager = null;
        this.levelData = null;

        // Bonfire fire animation references
        this.bonfireFires = [];

        // Death timer for delayed respawn prompt
        this.deathTimer = 0;
    }

    /** Initialize all game systems */
    init() {
        this._initRenderer();
        this._initScene();
        this._initSubsystems();
        this._initEventListeners();

        // Start the game loop
        this.lastTime = performance.now();
        this._gameLoop();
    }

    /** Set up Three.js renderer with shadows */
    _initRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    /** Set up scene, camera, lighting, fog, and skybox */
    _initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);

        // Fog for atmosphere and performance (distance culling)
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.set(0, 5, 12);

        // --- Lighting ---
        // Dim ambient light (dark fantasy feel)
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (moonlight)
        const dirLight = new THREE.DirectionalLight(0x4466aa, 0.6);
        dirLight.position.set(-20, 30, -10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 80;
        dirLight.shadow.camera.left = -40;
        dirLight.shadow.camera.right = 40;
        dirLight.shadow.camera.top = 40;
        dirLight.shadow.camera.bottom = -40;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);

        // Rim light from opposite direction
        const rimLight = new THREE.DirectionalLight(0x220022, 0.3);
        rimLight.position.set(15, 10, 20);
        this.scene.add(rimLight);

        // Hemisphere light for subtle color variation
        const hemiLight = new THREE.HemisphereLight(0x1a1a3e, 0x0a0a0a, 0.3);
        this.scene.add(hemiLight);

        // Build the level
        const levelBuilder = new GAME.LevelBuilder(this.scene);
        this.levelData = levelBuilder.build();

        // Collect bonfire fire meshes for animation
        for (const bonfire of this.levelData.bonfires) {
            const fire = bonfire.mesh.getObjectByName('bonfireFire');
            if (fire) this.bonfireFires.push(fire);
        }
    }

    /** Initialize all game subsystems */
    _initSubsystems() {
        const canvas = document.getElementById('game-canvas');

        this.input = new GAME.InputManager(canvas);
        this.audio = new GAME.AudioManager();
        this.ui = new GAME.UIManager();
        this.player = new GAME.Player(this.scene);
        this.enemyManager = new GAME.EnemyManager(this.scene);
        this.enemyManager.spawnAll();
        this.cameraController = new GAME.CameraController(this.camera);
        this.combatSystem = new GAME.CombatSystem(this.audio, this.ui);
        this.trailManager = new GAME.TrailManager(this.scene);
        this.trailManager.init(this.player, this.enemyManager);
    }

    /** Set up window events */
    _initEventListeners() {
        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start screen click handler
        document.getElementById('start-screen').addEventListener('click', () => {
            this._startGame();
        });
    }

    /** Transition from start screen to gameplay */
    _startGame() {
        this.audio.init();
        this.state = 'playing';
        this.ui.hideStartScreen();
        document.getElementById('game-container').classList.add('playing');
    }

    /** Main game loop using requestAnimationFrame */
    _gameLoop() {
        requestAnimationFrame(() => this._gameLoop());

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Cap at 50ms
        this.lastTime = now;

        if (this.state === 'start') {
            // Just render the scene (idle)
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Update game systems
        this._update(dt);

        // Render
        this.renderer.render(this.scene, this.camera);

        // Reset per-frame input state
        this.input.resetFrameState();
    }

    /** Update all game logic */
    _update(dt) {
        if (this.state === 'victory') return;

        const playerPos = this.player.getPosition();

        // --- Handle death state ---
        if (this.state === 'dead') {
            this.deathTimer += dt;
            if (this.input.isKeyJustPressed('KeyR') && this.deathTimer > 1.5) {
                this._respawnPlayer();
            }
            this.input.resetFrameState();
            return;
        }

        // --- Player death check ---
        if (this.player.dead && this.state !== 'dead') {
            this.state = 'dead';
            this.deathTimer = 0;
            this.ui.showDeathScreen();
            return;
        }

        // --- Lock-on targeting (Q key) ---
        if (this.input.isKeyJustPressed('KeyQ')) {
            this._toggleLockOn();
        }

        // Verify lock-on target is still valid
        if (this.player.lockOnTarget && this.player.lockOnTarget.dead) {
            this.player.lockOnTarget = null;
            this.cameraController.setLockOnTarget(null);
        }

        // --- Bonfire interaction ---
        this._checkBonfireInteraction();

        // --- Victory check (boss killed) ---
        if (this.enemyManager.boss && this.enemyManager.boss.dead && this.state !== 'victory') {
            this.state = 'victory';
            this.ui.showVictoryScreen();
            return;
        }

        // --- Update subsystems ---
        this.player.update(
            dt,
            this.input,
            this.cameraController.getYaw(),
            this.audio,
            this.levelData.colliders
        );

        this.enemyManager.update(dt, playerPos, this.audio);

        this.combatSystem.update(this.player, this.enemyManager);

        this.trailManager.update(this.player, this.enemyManager, dt);

        this.cameraController.update(dt, playerPos, this.input);

        this.ui.update(this.player, this.enemyManager, this.camera);

        // --- Animate bonfires ---
        this._animateBonfires(dt);
    }

    /** Toggle lock-on to nearest enemy */
    _toggleLockOn() {
        if (this.player.lockOnTarget) {
            // Disengage lock-on
            this.player.lockOnTarget = null;
            this.cameraController.setLockOnTarget(null);
        } else {
            // Lock onto nearest enemy within range
            const nearest = this.enemyManager.getNearestEnemy(
                this.player.getPosition(),
                20
            );
            if (nearest) {
                this.player.lockOnTarget = nearest;
                this.cameraController.setLockOnTarget(nearest);
            }
        }
    }

    /** Check if player is near a bonfire and handle interaction */
    _checkBonfireInteraction() {
        const playerPos = this.player.getPosition();
        let nearBonfire = false;

        for (const bonfire of this.levelData.bonfires) {
            const dist = playerPos.distanceTo(bonfire.position);
            if (dist < 3) {
                nearBonfire = true;
                this.ui.showInteractionPrompt();

                if (this.input.isKeyJustPressed('KeyE')) {
                    // Rest at bonfire
                    this.player.setCheckpoint(bonfire.position);
                    this.player.rest();
                    this.enemyManager.resetAll();
                    this.trailManager.dispose();
                    this.trailManager.init(this.player, this.enemyManager);
                    this.audio.play('bonfire');
                }
                break;
            }
        }

        if (!nearBonfire) {
            this.ui.hideInteractionPrompt();
        }
    }

    /** Respawn the player at last checkpoint */
    _respawnPlayer() {
        this.player.respawn();
        this.enemyManager.resetAll();
        this.trailManager.dispose();
        this.trailManager.init(this.player, this.enemyManager);
        this.ui.hideDeathScreen();
        this.state = 'playing';
    }

    /** Animate bonfire flames with flicker effect */
    _animateBonfires(dt) {
        for (const fire of this.bonfireFires) {
            const time = performance.now() * 0.003;
            fire.scale.x = 0.9 + Math.sin(time * 3) * 0.15;
            fire.scale.z = 0.9 + Math.cos(time * 2.7) * 0.15;
            fire.scale.y = 0.9 + Math.sin(time * 4) * 0.1;
            fire.rotation.y += dt * 2;

            // Flicker the fire light
            const light = fire.parent.children.find(c => c instanceof THREE.PointLight);
            if (light) {
                light.intensity = 1.5 + Math.sin(time * 5) * 0.5;
            }
        }
    }
};
