/**
 * AudioManager — Web Audio API sound system
 * Generates procedural sound effects for attacks, hits, footsteps, and ambient sounds.
 * No external audio files required; all sounds are synthesized.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.AudioManager = class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
    }

    /** Initialize the audio context (must be called after user gesture) */
    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }

    /**
     * Play a synthesized sound effect
     * @param {string} type - Sound type: 'lightAttack', 'heavyAttack', 'hit', 'roll',
     *                        'footstep', 'death', 'bonfire', 'bossRoar', 'enemyHit', 'block'
     */
    play(type) {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;

        switch (type) {
            case 'lightAttack':
                this._swoosh(t, 0.15, 800, 200);
                break;
            case 'heavyAttack':
                this._swoosh(t, 0.3, 400, 100);
                this._impact(t + 0.1, 0.15);
                break;
            case 'hit':
                this._impact(t, 0.25);
                this._noise(t, 0.08, 0.3);
                break;
            case 'enemyHit':
                this._impact(t, 0.2);
                break;
            case 'roll':
                this._noise(t, 0.15, 0.1);
                break;
            case 'footstep':
                this._noise(t, 0.05, 0.05);
                break;
            case 'death':
                this._deathSound(t);
                break;
            case 'bonfire':
                this._bonfireSound(t);
                break;
            case 'bossRoar':
                this._bossRoar(t);
                break;
            case 'block':
                this._metalClang(t);
                break;
            default:
                break;
        }
    }

    /** Swoosh sound for weapon swings */
    _swoosh(time, duration, freqStart, freqEnd) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freqStart, time);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, time + duration);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + duration);
    }

    /** Low thud impact sound */
    _impact(time, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    /** White noise burst for footsteps and rolls */
    _noise(time, duration, volume) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(time);
    }

    /** Dramatic death sound */
    _deathSound(time) {
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200 - i * 50, time + i * 0.3);
            osc.frequency.exponentialRampToValueAtTime(30, time + 1.5);
            gain.gain.setValueAtTime(0.15, time + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time + i * 0.3);
            osc.stop(time + 1.5);
        }
    }

    /** Bonfire ambient crackle */
    _bonfireSound(time) {
        this._noise(time, 0.5, 0.15);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.setValueAtTime(330, time + 0.2);
        osc.frequency.setValueAtTime(220, time + 0.4);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.6);
    }

    /** Boss roar sound */
    _bossRoar(time) {
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
            osc.frequency.setValueAtTime(80 + i * 20, time);
            osc.frequency.exponentialRampToValueAtTime(40, time + 0.8);
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.8);
        }
        this._noise(time, 0.6, 0.2);
    }

    /** Metal clang for blocked attacks */
    _metalClang(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.15);
    }
};
