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

    // Play notification sound
    playNotification(type = 'info') {
        if (!this.enabled) return;

        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sounds for different alert types
        switch (type) {
            case 'critical':
                // High-pitched urgent beep
                oscillator.frequency.value = 880;
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);

                // Second beep
                setTimeout(() => {
                    const osc2 = this.audioContext.createOscillator();
                    const gain2 = this.audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(this.audioContext.destination);
                    osc2.frequency.value = 880;
                    gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    osc2.start();
                    osc2.stop(this.audioContext.currentTime + 0.3);
                }, 150);
                break;

            case 'warning':
                // Medium-pitched alert
                oscillator.frequency.value = 660;
                gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;

            case 'info':
            default:
                // Soft notification
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
        }
    }

    // Success sound
    playSuccess() {
        if (!this.enabled) return;

        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 523.25; // C note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);

        // Second note (E)
        setTimeout(() => {
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            osc2.frequency.value = 659.25;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.2);
        }, 100);
    }

    // Connection sound
    playConnect() {
        if (!this.enabled) return;

        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Mute
    mute() {
        this.enabled = false;
    }

    // Unmute
    unmute() {
        this.enabled = true;
    }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
