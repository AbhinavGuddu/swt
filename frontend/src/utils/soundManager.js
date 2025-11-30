// Sound notification utility
class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.sounds = {};
    }

    // Initialize audio context
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Resume audio context (handle autoplay policy)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play notification sound
    playNotification(type = 'info') {
        if (!this.enabled) return;

        this.init();
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sounds for different alert types
        switch (type) {
            case 'critical':
                // High-pitched urgent alarm (Sawtooth wave)
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);

                // Repeat for urgency
                setTimeout(() => {
                    const osc2 = this.audioContext.createOscillator();
                    const gain2 = this.audioContext.createGain();
                    osc2.type = 'sawtooth';
                    osc2.connect(gain2);
                    gain2.connect(this.audioContext.destination);
                    osc2.frequency.setValueAtTime(880, this.audioContext.currentTime);
                    osc2.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1);
                    gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    osc2.start();
                    osc2.stop(this.audioContext.currentTime + 0.4);
                }, 200);
                break;

            case 'warning':
                // Medium-pitched double beep (Square wave)
                oscillator.type = 'square';
                oscillator.frequency.value = 660;

                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);

                setTimeout(() => {
                    const osc2 = this.audioContext.createOscillator();
                    const gain2 = this.audioContext.createGain();
                    osc2.type = 'square';
                    osc2.connect(gain2);
                    gain2.connect(this.audioContext.destination);
                    osc2.frequency.value = 660;
                    gain2.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    osc2.start();
                    osc2.stop(this.audioContext.currentTime + 0.3);
                }, 150);
                break;

            case 'info':
            default:
                // Soft chime (Sine wave)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(1046.5, this.audioContext.currentTime + 0.1); // C6

                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;
        }
    }

    // Success sound
    playSuccess() {
        if (!this.enabled) return;

        this.init();
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 523.25; // C note
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Connection sound
    playConnect() {
        if (!this.enabled) return;

        this.init();
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 440;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            this.resume();
            this.playNotification('info'); // Test sound
        }
        return this.enabled;
    }

    // Mute
    mute() {
        this.enabled = false;
    }

    // Unmute
    unmute() {
        this.enabled = true;
        this.resume();
    }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
