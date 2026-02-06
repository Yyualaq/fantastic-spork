/**
 * Player — Character controller with movement, combat, and stamina
 * Handles WASD movement, dodge rolling, light/heavy attacks, lock-on,
 * health/stamina systems, and death/respawn.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.Player = class Player {
    constructor(scene) {
        this.scene = scene;

        // Stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxStamina = 100;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 25;   // Per second
        this.staminaRegenDelay = 0.8; // Seconds before regen starts
        this.staminaTimer = 0;        // Time since last stamina use
        this.dead = false;

        // Movement
        this.moveSpeed = 8;
        this.sprintSpeed = 12;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.facingAngle = 0;

        // Combat state
        this.state = 'idle'; // idle, walking, sprinting, rolling, lightAttack, heavyAttack, stagger, dead
        this.stateTimer = 0;
        this.attackDamage = 0;
        this.attackHasHit = false;   // Prevent multi-hit per swing
        this.iFrames = false;        // Invincibility frames during roll
        this.comboWindow = false;    // Can chain attacks

        // Lock-on
        this.lockOnTarget = null;

        // Animation time (for procedural animation)
        this.animTime = 0;
        this.walkCycle = 0;
        this.footstepTimer = 0;

        // Respawn
        this.checkpointPosition = new THREE.Vector3(0, 0, 8);

        // Create the player mesh
        this.mesh = this._createMesh();
        this.mesh.position.copy(this.checkpointPosition);
        this.scene.add(this.mesh);

        // Attack hitbox helper (invisible, used for hit detection)
        this.attackBox = new THREE.Box3();
    }

    /** Build a simple humanoid character from basic geometry */
    _createMesh() {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x5a5a6e,
            roughness: 0.6,
            metalness: 0.4
        });

        const accentMat = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.7,
            metalness: 0.3
        });

        // Body (torso)
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.0, 0.5),
            bodyMat
        );
        torso.position.y = 1.3;
        torso.castShadow = true;
        torso.name = 'torso';
        group.add(torso);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 })
        );
        head.position.y = 2.05;
        head.castShadow = true;
        head.name = 'head';
        group.add(head);

        // Helmet
        const helmet = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6),
            bodyMat
        );
        helmet.position.y = 2.1;
        helmet.castShadow = true;
        group.add(helmet);

        // Left arm
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.2),
            bodyMat
        );
        leftArm.position.set(-0.55, 1.3, 0);
        leftArm.castShadow = true;
        leftArm.name = 'leftArm';
        group.add(leftArm);

        // Right arm (weapon arm)
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.2),
            bodyMat
        );
        rightArm.position.set(0.55, 1.3, 0);
        rightArm.castShadow = true;
        rightArm.name = 'rightArm';
        group.add(rightArm);

        // Sword (attached to right arm)
        const sword = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 1.2, 0.04),
            new THREE.MeshStandardMaterial({
                color: 0xccccdd,
                roughness: 0.3,
                metalness: 0.8
            })
        );
        sword.position.set(0.55, 0.6, 0);
        sword.castShadow = true;
        sword.name = 'sword';
        group.add(sword);

        // Legs
        const legMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8
        });
        const leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.7, 0.25),
            legMat
        );
        leftLeg.position.set(-0.2, 0.35, 0);
        leftLeg.castShadow = true;
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.7, 0.25),
            legMat
        );
        rightLeg.position.set(0.2, 0.35, 0);
        rightLeg.castShadow = true;
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);

        return group;
    }

    /** Get the world position of the player */
    getPosition() {
        return this.mesh.position;
    }

    /** Get a bounding box for collision detection */
    getBoundingBox() {
        const pos = this.mesh.position;
        return new THREE.Box3(
            new THREE.Vector3(pos.x - 0.4, pos.y, pos.z - 0.4),
            new THREE.Vector3(pos.x + 0.4, pos.y + 2, pos.z + 0.4)
        );
    }

    /** Take damage from an enemy attack */
    takeDamage(amount) {
        if (this.dead || this.iFrames) return;

        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.die();
        } else {
            this.state = 'stagger';
            this.stateTimer = 0.3;
        }
    }

    /** Player death */
    die() {
        this.dead = true;
        this.health = 0;
        this.state = 'dead';
        this.stateTimer = 0;
    }

    /** Respawn at last checkpoint */
    respawn() {
        this.dead = false;
        this.health = this.maxHealth;
        this.stamina = this.maxStamina;
        this.state = 'idle';
        this.stateTimer = 0;
        this.lockOnTarget = null;
        this.mesh.position.copy(this.checkpointPosition);
        this.mesh.position.y = 0;
    }

    /** Set checkpoint position (when resting at bonfire) */
    setCheckpoint(position) {
        this.checkpointPosition.copy(position);
    }

    /** Rest at bonfire — restore health and stamina */
    rest() {
        this.health = this.maxHealth;
        this.stamina = this.maxStamina;
    }

    /** Use stamina for an action; returns false if not enough */
    _useStamina(amount) {
        if (this.stamina < amount) return false;
        this.stamina -= amount;
        this.staminaTimer = 0;
        return true;
    }

    /**
     * Main update function — called each frame
     * @param {number} dt - Delta time in seconds
     * @param {GAME.InputManager} input - Input manager
     * @param {number} cameraYaw - Camera yaw angle for movement direction
     * @param {GAME.AudioManager} audio - Audio manager
     * @param {Array} colliders - Level colliders
     */
    update(dt, input, cameraYaw, audio, colliders) {
        if (this.dead) return;

        // Update state timer
        if (this.stateTimer > 0) {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                // Return to idle when action completes
                if (this.state === 'rolling' || this.state === 'lightAttack' ||
                    this.state === 'heavyAttack' || this.state === 'stagger') {
                    this.state = 'idle';
                    this.iFrames = false;
                    this.attackHasHit = false;
                }
            }
        }

        // Stamina regeneration
        this.staminaTimer += dt;
        if (this.staminaTimer >= this.staminaRegenDelay) {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * dt);
        }

        // Process input only in idle/walking/sprinting states
        const canAct = (this.state === 'idle' || this.state === 'walking' || this.state === 'sprinting');

        if (canAct) {
            this._handleMovement(dt, input, cameraYaw, audio, colliders);
            this._handleCombat(input, audio);
        }

        // Update roll movement (continue moving during roll)
        if (this.state === 'rolling') {
            const rollSpeed = 14;
            const rollDir = new THREE.Vector3(
                Math.sin(this.facingAngle),
                0,
                Math.cos(this.facingAngle)
            );
            const newPos = this.mesh.position.clone().add(rollDir.multiplyScalar(rollSpeed * dt));
            if (!this._checkCollision(newPos, colliders)) {
                this.mesh.position.copy(newPos);
            }
        }

        // Procedural animation
        this._animate(dt);

        // Update attack hitbox position
        if (this.state === 'lightAttack' || this.state === 'heavyAttack') {
            this._updateAttackBox();
        }
    }

    /** Handle WASD movement and sprinting */
    _handleMovement(dt, input, cameraYaw, audio, colliders) {
        let moveX = 0;
        let moveZ = 0;

        if (input.isKeyDown('KeyW')) moveZ -= 1;
        if (input.isKeyDown('KeyS')) moveZ += 1;
        if (input.isKeyDown('KeyA')) moveX -= 1;
        if (input.isKeyDown('KeyD')) moveX += 1;

        if (moveX === 0 && moveZ === 0) {
            if (this.state === 'walking' || this.state === 'sprinting') {
                this.state = 'idle';
            }
            return;
        }

        // Determine movement direction relative to camera
        const angle = Math.atan2(moveX, moveZ) + cameraYaw;
        this.direction.set(Math.sin(angle), 0, Math.cos(angle)).normalize();

        // Sprint check
        const sprinting = input.isKeyDown('ShiftLeft') && this.stamina > 1;
        const speed = sprinting ? this.sprintSpeed : this.moveSpeed;
        this.state = sprinting ? 'sprinting' : 'walking';

        if (sprinting) {
            this._useStamina(15 * dt);
        }

        // If locked on, face the target instead of movement direction
        if (this.lockOnTarget && !this.lockOnTarget.dead) {
            const toTarget = new THREE.Vector3()
                .subVectors(this.lockOnTarget.getPosition(), this.mesh.position);
            this.facingAngle = Math.atan2(-toTarget.x, -toTarget.z);
        } else {
            this.facingAngle = angle;
        }

        // Apply movement
        const newPos = this.mesh.position.clone().add(
            this.direction.clone().multiplyScalar(speed * dt)
        );

        // Collision check
        if (!this._checkCollision(newPos, colliders)) {
            this.mesh.position.copy(newPos);
        }

        // Update facing
        this.mesh.rotation.y = this.facingAngle;

        // Footstep sounds
        this.footstepTimer += dt;
        const stepInterval = sprinting ? 0.25 : 0.4;
        if (this.footstepTimer >= stepInterval) {
            this.footstepTimer = 0;
            audio.play('footstep');
        }
    }

    /** Handle combat inputs: attack and dodge */
    _handleCombat(input, audio) {
        // Dodge roll (Spacebar)
        if (input.isKeyJustPressed('Space')) {
            if (this._useStamina(20)) {
                this.state = 'rolling';
                this.stateTimer = 0.5;
                this.iFrames = true;
                audio.play('roll');
                return;
            }
        }

        // Heavy attack (mouse held > 0.4s then released)
        if (input.mouseJustReleased && input.lastHoldDuration >= 0.4) {
            if (this._useStamina(25)) {
                this.state = 'heavyAttack';
                this.stateTimer = 0.7;
                this.attackDamage = 35;
                this.attackHasHit = false;
                audio.play('heavyAttack');
                return;
            }
        }

        // Light attack (quick click)
        if (input.mouseJustPressed) {
            // Will resolve as light attack if released quickly
            // For immediate feedback, start light attack
            if (this._useStamina(12)) {
                this.state = 'lightAttack';
                this.stateTimer = 0.4;
                this.attackDamage = 15;
                this.attackHasHit = false;
                audio.play('lightAttack');
            }
        }
    }

    /** Update the attack hitbox position based on sword swing */
    _updateAttackBox() {
        const pos = this.mesh.position;
        const forward = new THREE.Vector3(-Math.sin(this.facingAngle), 0, -Math.cos(this.facingAngle));
        const attackCenter = pos.clone().add(forward.multiplyScalar(1.5));
        attackCenter.y = 1.2;

        const halfSize = this.state === 'heavyAttack' ? 1.2 : 0.8;
        this.attackBox.set(
            new THREE.Vector3(attackCenter.x - halfSize, attackCenter.y - halfSize, attackCenter.z - halfSize),
            new THREE.Vector3(attackCenter.x + halfSize, attackCenter.y + halfSize, attackCenter.z + halfSize)
        );
    }

    /** Check if an attack is currently active and can hit */
    isAttacking() {
        return (this.state === 'lightAttack' || this.state === 'heavyAttack') &&
               !this.attackHasHit &&
               this.stateTimer < (this.state === 'lightAttack' ? 0.25 : 0.45);
    }

    /** Mark that this attack has already hit (prevent multi-hit) */
    markAttackHit() {
        this.attackHasHit = true;
    }

    /** Simple collision detection against level colliders */
    _checkCollision(newPos, colliders) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(newPos.x - 0.4, 0, newPos.z - 0.4),
            new THREE.Vector3(newPos.x + 0.4, 2, newPos.z + 0.4)
        );

        for (const collider of colliders) {
            if (playerBox.intersectsBox(collider.box)) {
                return true;
            }
        }
        return false;
    }

    /** Procedural animation based on state */
    _animate(dt) {
        this.animTime += dt;

        const torso = this.mesh.getObjectByName('torso');
        const leftArm = this.mesh.getObjectByName('leftArm');
        const rightArm = this.mesh.getObjectByName('rightArm');
        const sword = this.mesh.getObjectByName('sword');
        const leftLeg = this.mesh.getObjectByName('leftLeg');
        const rightLeg = this.mesh.getObjectByName('rightLeg');
        const head = this.mesh.getObjectByName('head');

        if (!torso) return;

        // Reset rotations
        torso.rotation.set(0, 0, 0);
        if (leftArm) leftArm.rotation.set(0, 0, 0);
        if (rightArm) rightArm.rotation.set(0, 0, 0);
        if (sword) { sword.rotation.set(0, 0, 0); sword.position.set(0.55, 0.6, 0); }
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);

        switch (this.state) {
            case 'idle':
                // Subtle breathing animation
                if (torso) torso.position.y = 1.3 + Math.sin(this.animTime * 2) * 0.02;
                break;

            case 'walking':
            case 'sprinting': {
                const speed = this.state === 'sprinting' ? 12 : 8;
                this.walkCycle += dt * speed;
                const swing = Math.sin(this.walkCycle) * 0.4;
                if (leftArm) leftArm.rotation.x = swing;
                if (rightArm) rightArm.rotation.x = -swing;
                if (sword) sword.rotation.x = -swing;
                if (leftLeg) leftLeg.rotation.x = -swing;
                if (rightLeg) rightLeg.rotation.x = swing;
                if (torso) torso.position.y = 1.3 + Math.abs(Math.sin(this.walkCycle)) * 0.05;
                break;
            }

            case 'rolling':
                // Roll: lower body and rotate forward
                this.mesh.children.forEach(child => {
                    child.visible = false;
                });
                // Show a rolling ball
                if (!this.mesh.getObjectByName('rollBall')) {
                    const rollBall = new THREE.Mesh(
                        new THREE.SphereGeometry(0.6, 8, 6),
                        new THREE.MeshStandardMaterial({ color: 0x5a5a6e })
                    );
                    rollBall.position.y = 0.6;
                    rollBall.name = 'rollBall';
                    rollBall.castShadow = true;
                    this.mesh.add(rollBall);
                }
                const rollBall = this.mesh.getObjectByName('rollBall');
                if (rollBall) {
                    rollBall.visible = true;
                    rollBall.rotation.x = this.animTime * 15;
                }
                break;

            case 'lightAttack': {
                // Quick sword swing
                const t = 1 - (this.stateTimer / 0.4);
                const swingAngle = Math.sin(t * Math.PI) * 1.8;
                if (rightArm) rightArm.rotation.x = -1.2 + swingAngle * 0.5;
                if (rightArm) rightArm.rotation.z = -swingAngle * 0.3;
                if (sword) {
                    sword.rotation.x = -1.2 + swingAngle * 0.5;
                    sword.rotation.z = -swingAngle * 0.3;
                    sword.position.set(0.55 + swingAngle * 0.2, 0.6, -swingAngle * 0.3);
                }
                if (torso) torso.rotation.y = swingAngle * 0.2;
                break;
            }

            case 'heavyAttack': {
                // Charged heavy swing
                const t = 1 - (this.stateTimer / 0.7);
                let swingAngle;
                if (t < 0.3) {
                    // Wind-up
                    swingAngle = -t / 0.3 * 1.5;
                } else {
                    // Swing
                    swingAngle = -1.5 + ((t - 0.3) / 0.7) * 4;
                }
                if (rightArm) rightArm.rotation.x = swingAngle;
                if (sword) {
                    sword.rotation.x = swingAngle;
                    sword.position.set(0.55 + Math.sin(swingAngle) * 0.3, 0.6, Math.cos(swingAngle) * 0.3 - 0.3);
                }
                if (torso) torso.rotation.y = swingAngle * 0.15;
                break;
            }

            case 'stagger':
                if (torso) torso.rotation.x = -0.2;
                if (head) head.position.y = 1.95;
                break;

            default:
                break;
        }

        // Restore body visibility when not rolling
        if (this.state !== 'rolling') {
            this.mesh.children.forEach(child => {
                if (child.name !== 'rollBall') child.visible = true;
            });
            const rollBall = this.mesh.getObjectByName('rollBall');
            if (rollBall) rollBall.visible = false;
        }
    }
};
