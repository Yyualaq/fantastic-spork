/**
 * CameraController — Third-person camera with smooth follow and orbit
 * Supports mouse-look orbit, scroll zoom, and lock-on camera behavior.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.CameraController = class CameraController {
    constructor(camera) {
        this.camera = camera;

        // Orbit settings
        this.yaw = 0;           // Horizontal angle (radians)
        this.pitch = 0.3;       // Vertical angle (radians, positive = looking down)
        this.distance = 8;      // Distance from target

        // Limits
        this.minPitch = -0.2;
        this.maxPitch = 1.2;
        this.minDistance = 3;
        this.maxDistance = 15;

        // Mouse sensitivity
        this.mouseSensitivity = 0.003;
        this.zoomSensitivity = 0.005;

        // Smooth follow
        this.targetPosition = new THREE.Vector3();
        this.currentPosition = new THREE.Vector3();
        this.smoothSpeed = 8;

        // Lock-on
        this.lockOnTarget = null;
    }

    /**
     * Update camera position and orientation each frame
     * @param {number} dt - Delta time
     * @param {THREE.Vector3} playerPos - Player world position
     * @param {GAME.InputManager} input - Input manager
     */
    update(dt, playerPos, input) {
        // Process mouse input for orbit
        if (input.pointerLocked) {
            this.yaw -= input.mouseDeltaX * this.mouseSensitivity;
            this.pitch += input.mouseDeltaY * this.mouseSensitivity;
            this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        }

        // Scroll zoom
        if (input.scrollDelta !== 0) {
            this.distance += input.scrollDelta * this.zoomSensitivity;
            this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        }

        // Lock-on camera: if locked onto a target, adjust yaw to face it
        if (this.lockOnTarget && !this.lockOnTarget.dead) {
            const toTarget = new THREE.Vector3()
                .subVectors(this.lockOnTarget.getPosition(), playerPos);
            const targetYaw = Math.atan2(-toTarget.x, -toTarget.z);

            // Smoothly interpolate yaw toward target
            let angleDiff = targetYaw - this.yaw;
            // Normalize angle difference to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.yaw += angleDiff * Math.min(1, dt * 5);
        }

        // Calculate desired camera position (orbit around player)
        const targetPoint = playerPos.clone();
        targetPoint.y += 1.5; // Camera looks at player chest height

        // Spherical coordinates to Cartesian
        const offsetX = Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
        const offsetY = Math.sin(this.pitch) * this.distance;
        const offsetZ = Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;

        const desiredPos = new THREE.Vector3(
            targetPoint.x + offsetX,
            targetPoint.y + offsetY,
            targetPoint.z + offsetZ
        );

        // Smooth follow
        this.currentPosition.lerp(desiredPos, Math.min(1, this.smoothSpeed * dt));

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(targetPoint);
    }

    /** Get the camera yaw for player movement direction */
    getYaw() {
        return this.yaw;
    }

    /** Set lock-on target */
    setLockOnTarget(target) {
        this.lockOnTarget = target;
    }
};
