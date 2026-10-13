// Audio Engine using Web Audio API for offline, instant kids games sound effects
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.instrument = 'piano'; // piano, xylophone, funny
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterVolume = this.ctx.createGain();
            this.masterVolume.gain.setValueAtTime(0.3, this.ctx.currentTime); // Limit volume for safety
            this.masterVolume.connect(this.ctx.destination);
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        this.resume();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    playPop() {
        this.resume();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
    }

    playBubble() {
        this.resume();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
    }

    playFlip() {
        this.resume();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
    }

    playSuccess() {
        this.resume();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
        const now = this.ctx.currentTime;
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.1);
            
            gain.gain.setValueAtTime(0, now + index * 0.1);
            gain.gain.linearRampToValueAtTime(0.6, now + index * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);

            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.35);
        });
    }

    playFail() {
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start();
        osc.stop(now + 0.45);
    }

    playPianoNote(freq) {
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        if (this.instrument === 'piano') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            
            // Add a subharmonic for warmth
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.masterVolume);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq / 2, now);
            gain2.gain.setValueAtTime(0.2, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            osc2.start();
            osc2.stop(now + 0.85);

        } else if (this.instrument === 'xylophone') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            // Xylophone transient hit (high frequency noise/ping)
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.masterVolume);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 3.5, now);
            gain2.gain.setValueAtTime(0.4, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc2.start();
            osc2.stop(now + 0.06);

        } else if (this.instrument === 'funny') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.2);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.4);
            
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        }

        osc.start();
        osc.stop(now + 0.9);
    }

    playAnimalSound(type) {
        try {
            const audio = new Audio(`./assets/sounds/${type}.mp3`);
            audio.volume = 0.5; // safe for kids' ears
            audio.play().then(() => {
                // Limit playback to exactly 2 seconds maximum, with a smooth fade-out
                setTimeout(() => {
                    if (!audio.paused) {
                        let fadeInterval = setInterval(() => {
                            if (audio.volume > 0.05) {
                                audio.volume -= 0.05;
                            } else {
                                clearInterval(fadeInterval);
                                audio.pause();
                            }
                        }, 20);
                    }
                }, 1800); // Start fade-out at 1.8 seconds, complete pause at 2.0 seconds
            }).catch(err => {
                console.error("Audio playback error: ", err);
            });
        } catch (e) {
            console.error("Failed to initialize Audio: ", e);
        }
    }
}

// Global Sound Instance
const sound = new SoundEngine();
window.sound = sound;
