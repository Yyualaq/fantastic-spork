/**
 * CombatSystem — Resolves attacks, hit detection, and damage between player and enemies
 * Checks player attack hitboxes against enemy bounding boxes and vice versa.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.CombatSystem = class CombatSystem {
    constructor(audio, ui) {
        this.audio = audio;
        this.ui = ui;
    }

    /**
     * Process combat interactions each frame
     * @param {GAME.Player} player
     * @param {GAME.EnemyManager} enemyManager
     */
    update(player, enemyManager) {
        if (player.dead) return;

        // --- Player attacking enemies ---
        if (player.isAttacking()) {
            for (const enemy of enemyManager.getAlive()) {
                const enemyBox = enemy.getBoundingBox();
                if (player.attackBox.intersectsBox(enemyBox)) {
                    enemy.takeDamage(player.attackDamage);
                    player.markAttackHit();
                    this.audio.play('hit');
                    this.ui.triggerHitFlash();
                    break; // Only hit one enemy per swing
                }
            }
        }

        // --- Enemies attacking player ---
        for (const enemy of enemyManager.getAlive()) {
            if (enemy.isAttacking()) {
                const playerBox = player.getBoundingBox();
                if (enemy.attackBox.intersectsBox(playerBox)) {
                    player.takeDamage(enemy.damage);
                    enemy.markAttackHit();
                    this.audio.play('enemyHit');
                    this.ui.triggerHitFlash();

                    if (player.dead) {
                        this.audio.play('death');
                    }
                }
            }
        }
    }
};
