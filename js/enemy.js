/**
 * Enemy & EnemyManager — AI enemies with patrol, detection, and combat
 * Includes regular Knight enemies and a Boss enemy with unique attack patterns.
 */
'use strict';

window.GAME = window.GAME || {};

// ===== Base Enemy class =====
GAME.Enemy = class Enemy {
    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Vector3} spawnPos
     * @param {object} config - {health, damage, speed, detectRange, attackRange, type}
     */
    constructor(scene, spawnPos, config = {}) {
        this.scene = scene;
        this.spawnPosition = spawnPos.clone();

        // Stats
        this.maxHealth = config.health || 80;
        this.health = this.maxHealth;
        this.damage = config.damage || 20;
        this.speed = config.speed || 3;
        this.detectRange = config.detectRange || 15;
        this.attackRange = config.attackRange || 2.5;
        this.type = config.type || 'knight';
        this.isBoss = config.isBoss || false;

        // State machine: patrol, chase, attack, telegraph, recover, stagger, dead
        this.state = 'patrol';
        this.stateTimer = 0;
        this.dead = false;

        // Patrol
        this.patrolTarget = this.spawnPosition.clone();
        this.patrolRadius = config.patrolRadius || 5;
        this._pickNewPatrolTarget();

        // Attack tracking
        this.attackHasHit = false;
        this.attackBox = new THREE.Box3();
        this.telegraphDuration = config.telegraphDuration || 0.8;
        this.attackDuration = config.attackDuration || 0.5;
        this.recoverDuration = config.recoverDuration || 1.0;

        // Boss-specific
        this.bossAttackPattern = 0;
        this.bossPhase = 1;

        // Animation
        this.animTime = 0;

        // Create mesh
        this.mesh = this._createMesh();
        this.mesh.position.copy(spawnPos);
        this.mesh.position.y = 0;
        this.scene.add(this.mesh);

        // Health bar mesh (floating above head)
        this.healthBarGroup = this._createHealthBar();
        this.scene.add(this.healthBarGroup);
    }

    /** Build the enemy mesh (knight or boss variant) */
    _createMesh() {
        const group = new THREE.Group();
        const scale = this.isBoss ? 1.6 : 1.0;

        const bodyColor = this.isBoss ? 0x3a1a1a : 0x4a3a3a;
        const armorColor = this.isBoss ? 0x2a0a0a : 0x555555;

        const bodyMat = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.7,
            metalness: 0.3
        });

        const armorMat = new THREE.MeshStandardMaterial({
            color: armorColor,
            roughness: 0.5,
            metalness: 0.6
        });

        // Body
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.9 * scale, 1.1 * scale, 0.6 * scale),
            armorMat
        );
        torso.position.y = 1.4 * scale;
        torso.castShadow = true;
        torso.name = 'torso';
        group.add(torso);

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.35 * scale, 0.35 * scale, 0.35 * scale),
            bodyMat
        );
        head.position.y = 2.15 * scale;
        head.castShadow = true;
        head.name = 'head';
        group.add(head);

        // Eyes (glowing red)
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: this.isBoss ? 3 : 1.5
        });
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05 * scale, 4, 4),
            eyeMat
        );
        leftEye.position.set(-0.08 * scale, 2.2 * scale, -0.18 * scale);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05 * scale, 4, 4),
            eyeMat
        );
        rightEye.position.set(0.08 * scale, 2.2 * scale, -0.18 * scale);
        group.add(rightEye);

        // Arms
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.25 * scale, 0.9 * scale, 0.25 * scale),
            armorMat
        );
        leftArm.position.set(-0.65 * scale, 1.3 * scale, 0);
        leftArm.castShadow = true;
        leftArm.name = 'leftArm';
        group.add(leftArm);

        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.25 * scale, 0.9 * scale, 0.25 * scale),
            armorMat
        );
        rightArm.position.set(0.65 * scale, 1.3 * scale, 0);
        rightArm.castShadow = true;
        rightArm.name = 'rightArm';
        group.add(rightArm);

        // Weapon
        const weaponMat = new THREE.MeshStandardMaterial({
            color: 0x888899,
            roughness: 0.3,
            metalness: 0.8
        });

        if (this.isBoss) {
            // Boss: giant greatsword
            const sword = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 2.2, 0.06),
                weaponMat
            );
            sword.position.set(0.65 * scale, 0.3 * scale, 0);
            sword.castShadow = true;
            sword.name = 'weapon';
            group.add(sword);
        } else {
            // Knight: sword and shield
            const sword = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 1.0, 0.04),
                weaponMat
            );
            sword.position.set(0.65, 0.5, 0);
            sword.castShadow = true;
            sword.name = 'weapon';
            group.add(sword);

            // Shield
            const shield = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.6, 0.5),
                armorMat
            );
            shield.position.set(-0.65, 1.0, -0.1);
            shield.castShadow = true;
            shield.name = 'shield';
            group.add(shield);
        }

        // Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });
        const leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.3 * scale, 0.8 * scale, 0.3 * scale),
            legMat
        );
        leftLeg.position.set(-0.2 * scale, 0.4 * scale, 0);
        leftLeg.castShadow = true;
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.3 * scale, 0.8 * scale, 0.3 * scale),
            legMat
        );
        rightLeg.position.set(0.2 * scale, 0.4 * scale, 0);
        rightLeg.castShadow = true;
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);

        // Boss special: shoulder pauldrons
        if (this.isBoss) {
            const pauldronMat = new THREE.MeshStandardMaterial({
                color: 0x1a0a0a,
                roughness: 0.4,
                metalness: 0.7
            });
            for (const side of [-1, 1]) {
                const pauldron = new THREE.Mesh(
                    new THREE.SphereGeometry(0.35, 6, 4),
                    pauldronMat
                );
                pauldron.position.set(side * 0.75 * scale, 2.0 * scale, 0);
                pauldron.scale.y = 0.6;
                pauldron.castShadow = true;
                group.add(pauldron);
            }
        }

        return group;
    }

    /** Create a floating health bar above the enemy */
    _createHealthBar() {
        const group = new THREE.Group();

        // Background bar
        const bgGeo = new THREE.PlaneGeometry(1.2, 0.12);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.7 });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        group.add(bg);

        // Health fill
        const fillGeo = new THREE.PlaneGeometry(1.16, 0.08);
        const fillColor = this.isBoss ? 0xd4a646 : 0xcc3333;
        const fillMat = new THREE.MeshBasicMaterial({ color: fillColor });
        const fill = new THREE.Mesh(fillGeo, fillMat);
        fill.position.z = 0.01;
        fill.name = 'healthFill';
        group.add(fill);

        return group;
    }

    /** Get the world position */
    getPosition() {
        return this.mesh.position;
    }

    /** Get a bounding box for combat hit detection */
    getBoundingBox() {
        const pos = this.mesh.position;
        const s = this.isBoss ? 1.3 : 0.8;
        return new THREE.Box3(
            new THREE.Vector3(pos.x - s * 0.5, pos.y, pos.z - s * 0.5),
            new THREE.Vector3(pos.x + s * 0.5, pos.y + 2.5, pos.z + s * 0.5)
        );
    }

    /** Take damage */
    takeDamage(amount) {
        if (this.dead) return;
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.die();
        } else {
            // Only stagger if not boss or if damage is high enough
            if (!this.isBoss || amount >= 30) {
                this.state = 'stagger';
                this.stateTimer = 0.5;
            }
        }
    }

    /** Enemy death */
    die() {
        this.dead = true;
        this.state = 'dead';
        this.health = 0;
    }

    /** Reset enemy to spawn position (e.g., after bonfire rest) */
    reset() {
        this.dead = false;
        this.health = this.maxHealth;
        this.state = 'patrol';
        this.mesh.position.copy(this.spawnPosition);
        this.mesh.position.y = 0;
        this.mesh.visible = true;
        this.healthBarGroup.visible = true;
        this.bossPhase = 1;
        this.bossAttackPattern = 0;
        this._pickNewPatrolTarget();
    }

    /** Pick a random point within patrol radius */
    _pickNewPatrolTarget() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * this.patrolRadius;
        this.patrolTarget.set(
            this.spawnPosition.x + Math.cos(angle) * dist,
            0,
            this.spawnPosition.z + Math.sin(angle) * dist
        );
    }

    /** Face toward a position */
    _faceToward(targetPos) {
        const dx = targetPos.x - this.mesh.position.x;
        const dz = targetPos.z - this.mesh.position.z;
        this.mesh.rotation.y = Math.atan2(-dx, -dz);
    }

    /** Move toward a position at given speed */
    _moveToward(targetPos, speed, dt) {
        const dir = new THREE.Vector3()
            .subVectors(targetPos, this.mesh.position)
            .setY(0)
            .normalize();
        this.mesh.position.add(dir.multiplyScalar(speed * dt));
        this.mesh.position.y = 0;
    }

    /** Distance to player */
    _distToPlayer(playerPos) {
        return this.mesh.position.distanceTo(playerPos);
    }

    /**
     * Main AI update
     * @param {number} dt
     * @param {THREE.Vector3} playerPos
     * @param {GAME.AudioManager} audio
     */
    update(dt, playerPos, audio) {
        if (this.dead) {
            // Sink into ground on death
            if (this.mesh.position.y > -3) {
                this.mesh.position.y -= dt * 0.5;
                this.mesh.rotation.x = Math.min(this.mesh.rotation.x + dt, Math.PI / 4);
            } else {
                this.mesh.visible = false;
                this.healthBarGroup.visible = false;
            }
            return;
        }

        this.animTime += dt;
        this.stateTimer -= dt;

        const dist = this._distToPlayer(playerPos);

        switch (this.state) {
            case 'patrol':
                this._updatePatrol(dt, dist);
                break;
            case 'chase':
                this._updateChase(dt, playerPos, dist);
                break;
            case 'telegraph':
                this._updateTelegraph(dt, playerPos);
                break;
            case 'attack':
                this._updateAttack(dt, playerPos, audio);
                break;
            case 'recover':
                this._updateRecover(dt, dist, playerPos);
                break;
            case 'stagger':
                if (this.stateTimer <= 0) {
                    this.state = 'chase';
                }
                break;
        }

        // Update health bar position (floating above head)
        const barHeight = this.isBoss ? 4.5 : 3.0;
        this.healthBarGroup.position.set(
            this.mesh.position.x,
            this.mesh.position.y + barHeight,
            this.mesh.position.z
        );
        this.healthBarGroup.lookAt(
            this.healthBarGroup.position.x,
            this.healthBarGroup.position.y,
            this.healthBarGroup.position.z + 1
        );

        // Update health bar fill
        const fill = this.healthBarGroup.getObjectByName('healthFill');
        if (fill) {
            const ratio = this.health / this.maxHealth;
            fill.scale.x = Math.max(0.001, ratio);
            fill.position.x = -(1 - ratio) * 0.58;
        }

        // Procedural animation
        this._animate(dt);
    }

    /** Patrol state: wander near spawn point */
    _updatePatrol(dt, distToPlayer) {
        // Check if player is in detection range
        if (distToPlayer < this.detectRange) {
            this.state = 'chase';
            return;
        }

        // Move toward patrol target
        const distToTarget = this.mesh.position.distanceTo(this.patrolTarget);
        if (distToTarget < 1) {
            this._pickNewPatrolTarget();
        }
        this._faceToward(this.patrolTarget);
        this._moveToward(this.patrolTarget, this.speed * 0.4, dt);
    }

    /** Chase state: pursue the player */
    _updateChase(dt, playerPos, dist) {
        this._faceToward(playerPos);

        if (dist > this.detectRange * 1.5) {
            // Lost the player, return to patrol
            this.state = 'patrol';
            return;
        }

        if (dist <= this.attackRange) {
            // In range, begin attack telegraph
            this.state = 'telegraph';
            this.stateTimer = this.telegraphDuration;
            this.attackHasHit = false;

            if (this.isBoss) {
                this._pickBossAttack();
            }
            return;
        }

        this._moveToward(playerPos, this.speed, dt);
    }

    /** Telegraph state: wind up before attacking (gives player time to react) */
    _updateTelegraph(dt, playerPos) {
        this._faceToward(playerPos);

        if (this.stateTimer <= 0) {
            this.state = 'attack';
            this.stateTimer = this.attackDuration;
            this.attackHasHit = false;
        }
    }

    /** Attack state: active attack frames */
    _updateAttack(dt, playerPos, audio) {
        if (this.stateTimer <= 0) {
            this.state = 'recover';
            this.stateTimer = this.recoverDuration;
            return;
        }

        // Update attack hitbox
        const forward = new THREE.Vector3(
            -Math.sin(this.mesh.rotation.y), 0, -Math.cos(this.mesh.rotation.y)
        );
        const attackCenter = this.mesh.position.clone().add(forward.multiplyScalar(this.attackRange * 0.8));
        attackCenter.y = 1.2;

        const halfSize = this.isBoss ? 2.0 : 1.0;
        this.attackBox.set(
            new THREE.Vector3(attackCenter.x - halfSize, 0, attackCenter.z - halfSize),
            new THREE.Vector3(attackCenter.x + halfSize, 3, attackCenter.z + halfSize)
        );
    }

    /** Recovery state: brief pause after attacking */
    _updateRecover(dt, dist, playerPos) {
        if (this.stateTimer <= 0) {
            this.state = dist <= this.attackRange ? 'telegraph' : 'chase';
            if (this.state === 'telegraph') {
                this.stateTimer = this.telegraphDuration;
                if (this.isBoss) this._pickBossAttack();
            }
        }
    }

    /** Boss: select next attack pattern */
    _pickBossAttack() {
        this.bossAttackPattern = (this.bossAttackPattern + 1) % 3;

        // Phase 2 at half health — faster, more aggressive
        if (this.health < this.maxHealth * 0.5 && this.bossPhase === 1) {
            this.bossPhase = 2;
            this.speed *= 1.3;
            this.telegraphDuration = 0.5;
            this.recoverDuration = 0.6;
        }

        switch (this.bossAttackPattern) {
            case 0: // Overhead slam
                this.attackDuration = 0.6;
                this.damage = this.isBoss ? 30 : 20;
                break;
            case 1: // Wide sweep
                this.attackDuration = 0.8;
                this.damage = this.isBoss ? 25 : 20;
                break;
            case 2: // Lunge thrust
                this.attackDuration = 0.4;
                this.damage = this.isBoss ? 35 : 20;
                break;
        }
    }

    /** Is the enemy currently in the active attack window? */
    isAttacking() {
        return this.state === 'attack' && !this.attackHasHit;
    }

    /** Mark attack as having connected */
    markAttackHit() {
        this.attackHasHit = true;
    }

    /** Procedural animation */
    _animate(dt) {
        const torso = this.mesh.getObjectByName('torso');
        const rightArm = this.mesh.getObjectByName('rightArm');
        const leftArm = this.mesh.getObjectByName('leftArm');
        const weapon = this.mesh.getObjectByName('weapon');
        const leftLeg = this.mesh.getObjectByName('leftLeg');
        const rightLeg = this.mesh.getObjectByName('rightLeg');

        // Reset
        if (rightArm) rightArm.rotation.set(0, 0, 0);
        if (leftArm) leftArm.rotation.set(0, 0, 0);
        if (weapon) weapon.rotation.set(0, 0, 0);
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        if (torso) torso.rotation.set(0, 0, 0);

        const scale = this.isBoss ? 1.6 : 1.0;

        switch (this.state) {
            case 'patrol':
            case 'chase': {
                const walkSpeed = this.state === 'chase' ? 8 : 4;
                const swing = Math.sin(this.animTime * walkSpeed) * 0.3;
                if (leftArm) leftArm.rotation.x = swing;
                if (rightArm) rightArm.rotation.x = -swing;
                if (leftLeg) leftLeg.rotation.x = -swing;
                if (rightLeg) rightLeg.rotation.x = swing;
                break;
            }

            case 'telegraph': {
                // Wind-up: raise weapon arm
                const t = 1 - Math.max(0, this.stateTimer / this.telegraphDuration);
                if (rightArm) rightArm.rotation.x = -t * 2.0;
                if (weapon) {
                    weapon.rotation.x = -t * 2.0;
                    weapon.position.y = 0.3 * scale - t * 0.5;
                }
                // Glowing eyes pulse during telegraph
                if (torso) torso.rotation.x = -t * 0.1;
                break;
            }

            case 'attack': {
                // Swing forward
                const t = 1 - Math.max(0, this.stateTimer / this.attackDuration);
                const swingAngle = Math.sin(t * Math.PI) * 2.5;
                if (rightArm) rightArm.rotation.x = -2.0 + swingAngle;
                if (weapon) {
                    weapon.rotation.x = -2.0 + swingAngle;
                }
                if (torso) torso.rotation.y = Math.sin(t * Math.PI) * 0.3;
                break;
            }

            case 'recover':
                // Resting pose
                if (rightArm) rightArm.rotation.x = -0.3;
                break;

            case 'stagger':
                if (torso) torso.rotation.x = -0.15;
                if (torso) torso.rotation.z = Math.sin(this.animTime * 20) * 0.05;
                break;
        }
    }
};

// ===== Enemy Manager — manages all enemies in the level =====
GAME.EnemyManager = class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.boss = null;
    }

    /** Spawn all enemies for the level */
    spawnAll() {
        this.enemies = [];

        // Regular knight enemies along the corridor
        const knightPositions = [
            new THREE.Vector3(0, 0, -20),
            new THREE.Vector3(-5, 0, -35),
            new THREE.Vector3(5, 0, -50),
            new THREE.Vector3(-3, 0, -65),
            new THREE.Vector3(4, 0, -78),
        ];

        for (const pos of knightPositions) {
            const knight = new GAME.Enemy(this.scene, pos, {
                health: 80,
                damage: 18,
                speed: 3.5,
                detectRange: 12,
                attackRange: 2.5,
                patrolRadius: 4,
                type: 'knight'
            });
            this.enemies.push(knight);
        }

        // Boss enemy in the boss arena
        this.boss = new GAME.Enemy(this.scene, new THREE.Vector3(0, 0, -120), {
            health: 300,
            damage: 30,
            speed: 3.0,
            detectRange: 25,
            attackRange: 3.5,
            patrolRadius: 8,
            telegraphDuration: 0.8,
            attackDuration: 0.6,
            recoverDuration: 0.8,
            type: 'boss',
            isBoss: true
        });
        this.enemies.push(this.boss);
    }

    /** Update all enemies */
    update(dt, playerPos, audio) {
        for (const enemy of this.enemies) {
            enemy.update(dt, playerPos, audio);
        }
    }

    /** Reset all enemies (bonfire rest) */
    resetAll() {
        for (const enemy of this.enemies) {
            enemy.reset();
        }
    }

    /** Get the nearest alive enemy to a position within range */
    getNearestEnemy(position, maxRange = Infinity) {
        let nearest = null;
        let nearestDist = maxRange;

        for (const enemy of this.enemies) {
            if (enemy.dead) continue;
            const dist = enemy.getPosition().distanceTo(position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    /** Get all alive enemies */
    getAlive() {
        return this.enemies.filter(e => !e.dead);
    }
};
