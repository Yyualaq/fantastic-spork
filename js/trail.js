/**
 * WeaponTrail — Renders glowing sword slash trails during attacks
 * Tracks weapon tip positions each frame and builds a fading ribbon mesh.
 * Used for both player and enemy weapon swings.
 */
'use strict';

window.GAME = window.GAME || {};

/**
 * A single trail instance attached to one character's weapon.
 * Records tip positions during an attack and renders a fading ribbon.
 */
GAME.WeaponTrail = class WeaponTrail {
    /**
     * @param {THREE.Scene} scene
     * @param {object} opts - { color, maxPoints, width, duration }
     */
    constructor(scene, opts = {}) {
        this.scene = scene;
        this.color = opts.color || 0x88ccff;
        this.maxPoints = opts.maxPoints || 20;
        this.trailWidth = opts.width || 0.3;
        this.fadeDuration = opts.duration || 0.25; // seconds after attack ends to fade
        this.baseOpacity = typeof opts.opacity === 'number' ? opts.opacity : 0.6;

        // Trail state
        this.points = [];      // Array of {tip: Vector3, base: Vector3}
        this.active = false;
        this.fadeTimer = 0;

        // Trail mesh (rebuilt each frame)
        this.mesh = null;
        this.material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.baseOpacity,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
    }

    /**
     * Call each frame with the weapon's world-space tip and base positions.
     * @param {THREE.Vector3} tipWorld  - Sword tip in world space
     * @param {THREE.Vector3} baseWorld - Sword base/hilt in world space
     * @param {boolean} attacking - Whether the character is currently attacking
     * @param {number} dt - Delta time
     */
    update(tipWorld, baseWorld, attacking, dt) {
        if (attacking) {
            this.active = true;
            this.fadeTimer = this.fadeDuration;
            this.material.opacity = this.baseOpacity;

            // Record point pair
            this.points.push({
                tip: tipWorld.clone(),
                base: baseWorld.clone()
            });

            // Limit trail length
            if (this.points.length > this.maxPoints) {
                this.points.shift();
            }
        } else if (this.active) {
            // Fade out after attack ends
            this.fadeTimer -= dt;
            if (this.fadeTimer <= 0) {
                this.active = false;
                this.points = [];
                this._removeMesh();
                return;
            }
        } else {
            return; // Nothing to render
        }

        this._buildMesh();
    }

    /** Build or update the ribbon mesh from recorded points */
    _buildMesh() {
        this._removeMesh();

        if (this.points.length < 2) return;

        const numSegments = this.points.length - 1;
        const vertices = new Float32Array(numSegments * 6 * 3); // 2 triangles per segment, 3 verts each
        const alphas = new Float32Array(numSegments * 6);

        let vi = 0;
        let ai = 0;

        for (let i = 0; i < numSegments; i++) {
            const curr = this.points[i];
            const next = this.points[i + 1];

            // Fade: older segments are more transparent
            const alphaStart = (i / this.points.length) * this.baseOpacity;
            const alphaEnd = ((i + 1) / this.points.length) * this.baseOpacity;

            // Overall fade when trail is ending
            const fadeMult = this.active && this.fadeTimer < this.fadeDuration
                ? this.fadeTimer / this.fadeDuration
                : 1.0;

            const a0 = alphaStart * fadeMult;
            const a1 = alphaEnd * fadeMult;

            // Triangle 1: curr.base, curr.tip, next.tip
            vertices[vi++] = curr.base.x; vertices[vi++] = curr.base.y; vertices[vi++] = curr.base.z;
            vertices[vi++] = curr.tip.x;  vertices[vi++] = curr.tip.y;  vertices[vi++] = curr.tip.z;
            vertices[vi++] = next.tip.x;  vertices[vi++] = next.tip.y;  vertices[vi++] = next.tip.z;

            alphas[ai++] = a0; alphas[ai++] = a0; alphas[ai++] = a1;

            // Triangle 2: curr.base, next.tip, next.base
            vertices[vi++] = curr.base.x; vertices[vi++] = curr.base.y; vertices[vi++] = curr.base.z;
            vertices[vi++] = next.tip.x;  vertices[vi++] = next.tip.y;  vertices[vi++] = next.tip.z;
            vertices[vi++] = next.base.x; vertices[vi++] = next.base.y; vertices[vi++] = next.base.z;

            alphas[ai++] = a0; alphas[ai++] = a1; alphas[ai++] = a1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Calculate opacity: fade out based on remaining fade time
        let opacity = this.baseOpacity;
        if (this.fadeTimer < this.fadeDuration) {
            opacity = (this.fadeTimer / this.fadeDuration) * this.baseOpacity;
        }
        this.material.opacity = opacity;

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.frustumCulled = false;
        this.scene.add(this.mesh);
    }

    /** Remove the current trail mesh from the scene */
    _removeMesh() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            this.mesh = null;
        }
    }

    /** Clean up all resources */
    dispose() {
        this._removeMesh();
        this.material.dispose();
    }
};

/**
 * TrailManager — Manages weapon trails for all characters in the game.
 * Creates and updates trail instances for the player and each enemy.
 */
GAME.TrailManager = class TrailManager {
    constructor(scene) {
        this.scene = scene;
        this.playerTrail = null;
        this.enemyTrails = new Map(); // enemy -> WeaponTrail
    }

    /** Initialize trails for player and all enemies */
    init(player, enemyManager) {
        // Player trail: blue-white
        this.playerTrail = new GAME.WeaponTrail(this.scene, {
            color: 0x88ccff,
            maxPoints: 18,
            duration: 0.2
        });

        // Enemy trails: red for knights, orange-red for boss
        for (const enemy of enemyManager.enemies) {
            const color = enemy.isBoss ? 0xff4400 : 0xff2222;
            const trail = new GAME.WeaponTrail(this.scene, {
                color: color,
                maxPoints: enemy.isBoss ? 22 : 16,
                duration: 0.25
            });
            this.enemyTrails.set(enemy, trail);
        }
    }

    /**
     * Update all trails each frame.
     * Computes weapon world positions and passes them to each trail.
     * @param {GAME.Player} player
     * @param {GAME.EnemyManager} enemyManager
     * @param {number} dt
     */
    update(player, enemyManager, dt) {
        // --- Player trail ---
        const playerAttacking = player.state === 'lightAttack' || player.state === 'heavyAttack';
        const playerWeapon = player.mesh.getObjectByName('sword');
        if (playerWeapon && this.playerTrail) {
            const positions = this._getWeaponWorldPositions(playerWeapon, 1.2);
            this.playerTrail.update(positions.tip, positions.base, playerAttacking, dt);
        }

        // --- Enemy trails ---
        for (const enemy of enemyManager.enemies) {
            const trail = this.enemyTrails.get(enemy);
            if (!trail) continue;

            if (enemy.dead) {
                // Clear trail for dead enemies
                if (trail.active) {
                    trail.active = false;
                    trail.points = [];
                    trail._removeMesh();
                }
                continue;
            }

            const enemyAttacking = enemy.state === 'attack';
            const weapon = enemy.mesh.getObjectByName('weapon');
            if (weapon) {
                const weaponLength = enemy.isBoss ? 2.2 : 1.0;
                const positions = this._getWeaponWorldPositions(weapon, weaponLength);
                trail.update(positions.tip, positions.base, enemyAttacking, dt);
            }
        }
    }

    /**
     * Get weapon tip and base world positions.
     * The weapon mesh is oriented along its local Y axis.
     * @param {THREE.Object3D} weaponMesh
     * @param {number} length - Weapon length for tip offset
     * @returns {{tip: THREE.Vector3, base: THREE.Vector3}}
     */
    _getWeaponWorldPositions(weaponMesh, length) {
        // Ensure world matrix is up to date
        weaponMesh.updateWorldMatrix(true, false);

        // Base position (weapon center in world space)
        const base = new THREE.Vector3();
        weaponMesh.getWorldPosition(base);

        // Tip: offset along the weapon's local Y axis (up direction of the sword)
        const tipLocal = new THREE.Vector3(0, length * 0.5, 0);
        const tip = tipLocal.applyMatrix4(weaponMesh.matrixWorld);

        // Also compute base as opposite end
        const baseLocal = new THREE.Vector3(0, -length * 0.5, 0);
        const baseEnd = baseLocal.applyMatrix4(weaponMesh.matrixWorld);

        return { tip: tip, base: baseEnd };
    }

    /** Clean up all trails */
    dispose() {
        if (this.playerTrail) this.playerTrail.dispose();
        for (const trail of this.enemyTrails.values()) {
            trail.dispose();
        }
        this.enemyTrails.clear();
    }
};
