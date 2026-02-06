/**
 * InputManager — Keyboard and mouse input handling
 * Tracks key states, mouse buttons, mouse movement, and scroll for camera zoom.
 * Supports pointer lock for FPS-style mouse look.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.InputManager = class InputManager {
    constructor(canvas) {
        this.canvas = canvas;

        // Keyboard state: key -> boolean
        this.keys = {};
        // Keys pressed this frame (for single-press actions)
        this.keysJustPressed = {};

        // Mouse state
        this.mouseDown = false;
        this.mouseDownTime = 0;       // Timestamp when mouse was pressed
        this.mouseJustPressed = false; // True for one frame on click
        this.mouseJustReleased = false;
        this.lastHoldDuration = 0;    // Duration of last completed hold (seconds)
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.scrollDelta = 0;

        // Pointer lock state
        this.pointerLocked = false;

        this._bindEvents();
    }

    _bindEvents() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            // Prevent default for game keys
            if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyR', 'ShiftLeft'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse buttons
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseDown = true;
                this.mouseDownTime = performance.now();
                this.mouseJustPressed = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                if (this.mouseDown) {
                    this.lastHoldDuration = (performance.now() - this.mouseDownTime) / 1000;
                    this.mouseJustReleased = true;
                }
                this.mouseDown = false;
            }
        });

        // Mouse movement (uses pointer lock delta)
        window.addEventListener('mousemove', (e) => {
            if (this.pointerLocked) {
                this.mouseDeltaX += e.movementX || 0;
                this.mouseDeltaY += e.movementY || 0;
            }
        });

        // Scroll wheel for camera zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scrollDelta += e.deltaY;
        }, { passive: false });

        // Pointer lock
        this.canvas.addEventListener('click', () => {
            if (!this.pointerLocked) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
        });
    }

    /** Check if a key is currently held down */
    isKeyDown(code) {
        return !!this.keys[code];
    }

    /** Check if a key was just pressed this frame (single-press) */
    isKeyJustPressed(code) {
        return !!this.keysJustPressed[code];
    }

    /** How long the mouse button has been held (in seconds) */
    getMouseHoldDuration() {
        if (!this.mouseDown) return 0;
        return (performance.now() - this.mouseDownTime) / 1000;
    }

    /** Reset per-frame input state — call at end of each game loop tick */
    resetFrameState() {
        this.keysJustPressed = {};
        this.mouseJustPressed = false;
        this.mouseJustReleased = false;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.scrollDelta = 0;
    }
};
