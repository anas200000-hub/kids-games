// Game 37: Kids Drums (طبلة وموسيقى)
(function() {
    window.initDrumsGame = function(container) {
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:420px;margin:0 auto;box-sizing:border-box;font-family:var(--font-kids);user-select:none;';
        container.appendChild(wrap);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.style.cssText = 'color:#E91E63;margin-bottom:10px;font-weight:900;';
        title.innerText = '🥁 طبلة وموسيقى 🥁';
        wrap.appendChild(title);

        const subtitle = document.createElement('div');
        subtitle.style.cssText = 'font-size:13px;color:#888;margin-bottom:12px;text-align:center;font-weight:bold;';
        subtitle.innerText = 'اضغط على الطبول والصنج لتعزف ألحاناً رائعة!';
        wrap.appendChild(subtitle);

        // Create canvas for drum kit
        const canvasContainer = document.createElement('div');
        canvasContainer.style.cssText = 'position:relative;border-radius:20px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.2);border:4px solid #FFF;width:100%;';
        wrap.appendChild(canvasContainer);

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 420;
        canvas.style.cssText = 'display:block;width:100%;touch-action:none;cursor:pointer;';
        canvasContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Floating notes container
        const notesLayer = document.createElement('div');
        notesLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
        canvasContainer.appendChild(notesLayer);

        // Define drum pads with positions
        const drums = [
            {
                id: 'hihat', label: 'هاي هات', emoji: '🔔',
                x: 65, y: 75, radius: 42,
                color1: '#FFD54F', color2: '#FFC107', borderColor: '#F9A825',
                sound: { type: 'hihat' }
            },
            {
                id: 'crash', label: 'كراش', emoji: '💥',
                x: 335, y: 75, radius: 42,
                color1: '#FFE082', color2: '#FFD54F', borderColor: '#FFB300',
                sound: { type: 'crash' }
            },
            {
                id: 'tom1', label: 'توم 1', emoji: '🥁',
                x: 140, y: 155, radius: 50,
                color1: '#EF5350', color2: '#E53935', borderColor: '#C62828',
                sound: { type: 'tom', freq: 250 }
            },
            {
                id: 'tom2', label: 'توم 2', emoji: '🥁',
                x: 260, y: 155, radius: 50,
                color1: '#42A5F5', color2: '#1E88E5', borderColor: '#1565C0',
                sound: { type: 'tom', freq: 200 }
            },
            {
                id: 'snare', label: 'سنير', emoji: '💫',
                x: 200, y: 260, radius: 58,
                color1: '#AB47BC', color2: '#8E24AA', borderColor: '#6A1B9A',
                sound: { type: 'snare' }
            },
            {
                id: 'bass', label: 'بيس', emoji: '💥',
                x: 200, y: 375, radius: 42,
                color1: '#66BB6A', color2: '#43A047', borderColor: '#2E7D32',
                sound: { type: 'bass' }
            }
        ];

        // Track active animations
        let drumAnimations = {};

        // Synthesized drum sounds using Web Audio API
        function playDrumSound(drumType, freq) {
            if (!window.sound || !window.sound.ctx) {
                if (window.sound) window.sound.resume();
                if (!window.sound || !window.sound.ctx) return;
            }

            const audioCtx = window.sound.ctx;
            const masterVol = window.sound.masterVolume;
            const now = audioCtx.currentTime;

            if (drumType === 'bass') {
                // Deep bass kick drum
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(masterVol);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
                gain.gain.setValueAtTime(1.0, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (drumType === 'snare') {
                // Snare drum (noise + tone)
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(masterVol);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
                gain.gain.setValueAtTime(0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.15);

                // White noise burst for snare snap
                const bufferSize = audioCtx.sampleRate * 0.1;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = audioCtx.createGain();
                noise.connect(noiseGain);
                noiseGain.connect(masterVol);
                noiseGain.gain.setValueAtTime(0.6, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                noise.start(now);
                noise.stop(now + 0.12);
            } else if (drumType === 'tom') {
                // Tom drum (tuned)
                const f = freq || 200;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(masterVol);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + 0.2);
                gain.gain.setValueAtTime(0.9, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (drumType === 'hihat') {
                // Hi-hat (high-pitched noise)
                const bufferSize = audioCtx.sampleRate * 0.06;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;

                // Bandpass filter for metallic sound
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(8000, now);

                const gain = audioCtx.createGain();
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(masterVol);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                noise.start(now);
                noise.stop(now + 0.08);
            } else if (drumType === 'crash') {
                // Crash cymbal (long noise)
                const bufferSize = audioCtx.sampleRate * 0.5;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(5000, now);

                const gain = audioCtx.createGain();
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(masterVol);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                noise.start(now);
                noise.stop(now + 0.5);
            }
        }

        // Draw the drum kit
        function drawDrumKit() {
            // Dark stage background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#1a1a2e');
            bgGrad.addColorStop(1, '#16213e');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stage lights glow
            ctx.save();
            ctx.globalAlpha = 0.08;
            const spotGrad = ctx.createRadialGradient(200, 0, 20, 200, 0, 350);
            spotGrad.addColorStop(0, '#FFD54F');
            spotGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = spotGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Draw each drum
            drums.forEach(drum => {
                const anim = drumAnimations[drum.id] || 0;
                const scale = 1 + anim * 0.15;

                ctx.save();
                ctx.translate(drum.x, drum.y);
                ctx.scale(scale, scale);

                // Shadow
                ctx.beginPath();
                ctx.arc(3, 5, drum.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fill();

                // Body gradient
                const drumGrad = ctx.createRadialGradient(-drum.radius * 0.3, -drum.radius * 0.3, 0, 0, 0, drum.radius);
                drumGrad.addColorStop(0, drum.color1);
                drumGrad.addColorStop(1, drum.color2);
                ctx.beginPath();
                ctx.arc(0, 0, drum.radius, 0, Math.PI * 2);
                ctx.fillStyle = drumGrad;
                ctx.fill();

                // Border ring
                ctx.strokeStyle = drum.borderColor;
                ctx.lineWidth = 4;
                ctx.stroke();

                // Inner highlight ring
                ctx.beginPath();
                ctx.arc(0, 0, drum.radius * 0.65, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Shine
                ctx.beginPath();
                ctx.arc(-drum.radius * 0.25, -drum.radius * 0.3, drum.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();

                // Label text
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 13px var(--font-kids)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(drum.label, 0, drum.radius + 18);

                ctx.restore();
            });
        }

        // Hit animation tick
        function animationLoop() {
            let anyActive = false;
            for (const id in drumAnimations) {
                if (drumAnimations[id] > 0) {
                    drumAnimations[id] -= 0.07;
                    if (drumAnimations[id] < 0) drumAnimations[id] = 0;
                    anyActive = true;
                }
            }

            drawDrumKit();

            if (anyActive) {
                requestAnimationFrame(animationLoop);
            }
        }

        // Spawn floating note emoji
        function spawnNote(x, y) {
            const notes = ['🎵', '🎶', '🎵', '✨', '🌟'];
            const noteEl = document.createElement('div');
            noteEl.innerText = notes[Math.floor(Math.random() * notes.length)];
            noteEl.style.cssText = `
                position: absolute;
                left: ${(x / canvas.width) * 100}%;
                top: ${(y / canvas.height) * 100}%;
                font-size: ${20 + Math.random() * 14}px;
                pointer-events: none;
                z-index: 100;
                opacity: 1;
                transition: transform 1.2s ease-out, opacity 1.2s ease-out;
            `;
            notesLayer.appendChild(noteEl);

            requestAnimationFrame(() => {
                noteEl.style.transform = `translateY(-${60 + Math.random() * 60}px) rotate(${Math.random() * 40 - 20}deg)`;
                noteEl.style.opacity = '0';
            });

            setTimeout(() => noteEl.remove(), 1300);
        }

        // Hit a drum
        function hitDrum(drum) {
            drumAnimations[drum.id] = 1;
            playDrumSound(drum.sound.type, drum.sound.freq);
            spawnNote(drum.x, drum.y);
            animationLoop();
        }

        // Detect which drum was tapped
        function getDrumAtPoint(canvasX, canvasY) {
            for (let i = drums.length - 1; i >= 0; i--) {
                const d = drums[i];
                const dx = canvasX - d.x;
                const dy = canvasY - d.y;
                if (Math.sqrt(dx * dx + dy * dy) <= d.radius) {
                    return d;
                }
            }
            return null;
        }

        // Input handlers
        function handleInteraction(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
            const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

            const drum = getDrumAtPoint(canvasX, canvasY);
            if (drum) {
                hitDrum(drum);
            }
        }

        canvas.addEventListener('mousedown', (e) => {
            handleInteraction(e.clientX, e.clientY);
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
            }
        });

        // Initial draw
        drawDrumKit();

        // Clean up on exit
        container.addEventListener('game-exit', () => {
            // nothing special needed
        });
    };
})();
