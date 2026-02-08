/**
 * UIManager — HUD elements and screen overlays
 * Manages health/stamina bars, lock-on reticle, boss health bar,
 * death/victory screens, and interaction prompts.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.UIManager = class UIManager {
    constructor() {
        // Cache DOM elements
        this.healthBar = document.getElementById('health-bar');
        this.staminaBar = document.getElementById('stamina-bar');
        this.bossBarContainer = document.getElementById('boss-bar-container');
        this.bossHealthBar = document.getElementById('boss-health-bar');
        this.bossNameEl = document.getElementById('boss-name');
        this.lockOnReticle = document.getElementById('lock-on-reticle');
        this.deathScreen = document.getElementById('death-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.startScreen = document.getElementById('start-screen');
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.gameContainer = document.getElementById('game-container');

        // Reticle screen position
        this.reticleScreenPos = new THREE.Vector2();
    }

    /**
     * Update all HUD elements
     * @param {GAME.Player} player
     * @param {GAME.EnemyManager} enemyManager
     * @param {THREE.Camera} camera
     */
    update(player, enemyManager, camera) {
        // Player health bar
        const healthPercent = (player.health / player.maxHealth) * 100;
        this.healthBar.style.width = healthPercent + '%';

        // Player stamina bar
        const staminaPercent = (player.stamina / player.maxStamina) * 100;
        this.staminaBar.style.width = staminaPercent + '%';

        // Flash stamina bar when low
        if (staminaPercent < 20) {
            this.staminaBar.style.opacity = 0.5 + Math.sin(performance.now() * 0.01) * 0.5;
        } else {
            this.staminaBar.style.opacity = 1;
        }

        // Lock-on reticle
        if (player.lockOnTarget && !player.lockOnTarget.dead) {
            this._updateReticle(player.lockOnTarget, camera);
            this.lockOnReticle.classList.remove('hidden');
        } else {
            this.lockOnReticle.classList.add('hidden');
        }

        // Boss health bar
        const boss = enemyManager.boss;
        if (boss && !boss.dead && boss.state !== 'patrol') {
            this.bossBarContainer.classList.remove('hidden');
            const bossHealthPercent = (boss.health / boss.maxHealth) * 100;
            this.bossHealthBar.style.width = bossHealthPercent + '%';
        } else {
            this.bossBarContainer.classList.add('hidden');
        }
    }

    /** Position the lock-on reticle over the target enemy */
    _updateReticle(target, camera) {
        const targetPos = target.getPosition().clone();
        targetPos.y += 1.5; // Head height

        // Project 3D position to screen coordinates
        const projected = targetPos.project(camera);
        const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

        // Only show if in front of camera
        if (projected.z < 1) {
            this.lockOnReticle.style.left = x + 'px';
            this.lockOnReticle.style.top = y + 'px';
        } else {
            this.lockOnReticle.classList.add('hidden');
        }
    }

    /** Show the death screen */
    showDeathScreen() {
        this.deathScreen.classList.remove('hidden');
    }

    /** Hide the death screen */
    hideDeathScreen() {
        this.deathScreen.classList.add('hidden');
    }

    /** Show the victory screen */
    showVictoryScreen() {
        this.victoryScreen.classList.remove('hidden');
    }

    /** Hide the start screen */
    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    /** Show interaction prompt */
    showInteractionPrompt() {
        this.interactionPrompt.classList.remove('hidden');
    }

    /** Hide interaction prompt */
    hideInteractionPrompt() {
        this.interactionPrompt.classList.add('hidden');
    }

    /** Trigger a hit flash effect on the game container */
    triggerHitFlash() {
        this.gameContainer.classList.remove('hit-flash');
        // Force reflow to restart animation
        void this.gameContainer.offsetWidth;
        this.gameContainer.classList.add('hit-flash');
        setTimeout(() => {
            this.gameContainer.classList.remove('hit-flash');
        }, 150);
    }
};
