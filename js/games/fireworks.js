// Game 13: Fireworks Maker (ألعاب نارية)
window.initFireworksGame = function (container) {
    let active = true;
    let animationId = null;
    let particles = [];

    let html = `
        <div class="game-fireworks-layout">
            <h2 class="game-title" style="color: #ECEFF1; text-shadow: 0 0 10px #FFD54F;">🎆 صانع الألعاب النارية 🎆</h2>
            <p class="game-instructions" style="color: #B0BEC5;">المس الشاشة في أي مكان لتطلق ألعاباً نارية ملونة وجميلة!</p>

            <div class="canvas-container">
                <canvas id="fireworksCanvas" width="400" height="420" style="background-color: #0E0B16; border-color: #4A148C;"></canvas>
            </div>
            
            <div style="text-align: center; margin-top: 10px;">
                <button class="clear-btn" id="clearFireworks" style="background-color: #E64A19;">🗑️ مسح السماء</button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');

    const colors = [
        '#FF1744', // Neon Red
        '#FF5252',
        '#FF4081', // Neon Pink
        '#E040FB', // Neon Purple
        '#7C4DFF',
        '#651FFF',
        '#3D5AFE', // Neon Blue
        '#2979FF',
        '#00E5FF', // Neon Cyan
        '#1DE9B6',
        '#00E676', // Neon Green
        '#76FF03',
        '#CCFF90',
        '#FFEA00', // Neon Yellow
        '#FFD700',
        '#FF9100', // Neon Orange
        '#FF3D00'
    ];

    function createExplosion(x, y) {
        // Play Pop sound
        if (window.sound) {
            window.sound.playPop();
        }

        // Choose a main color palette for this explosion
        const baseColor1 = colors[Math.floor(Math.random() * colors.length)];
        const baseColor2 = colors[Math.floor(Math.random() * colors.length)];

        const particleCount = Math.floor(Math.random() * 20) + 30; // 30 to 50 particles

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2.5;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: Math.random() * 2.5 + 1.5,
                color: Math.random() < 0.5 ? baseColor1 : baseColor2,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                gravity: 0.08
            });
        }
    }

    // Animation Loop
    function update() {
        if (!active) return;

        // Create a slight trailing effect by painting with transparency
        ctx.fillStyle = 'rgba(14, 11, 22, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity; // gravity pulls down
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            
            // Draw spark
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            // Draw spark glow/shadow
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        animationId = requestAnimationFrame(update);
    }

    // Tap/Touch handler
    function handleTap(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const touchX = (clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (clientY - rect.top) * (canvas.height / rect.height);
        
        createExplosion(touchX, touchY);
    }

    canvas.addEventListener('mousedown', (e) => handleTap(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap(e.touches[0].clientX, e.touches[0].clientY);
    });

    document.getElementById('clearFireworks').addEventListener('click', () => {
        if (window.sound) window.sound.playFail();
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Start loop
    update();

    // Clean up animation on exit
    container.addEventListener('game-exit', () => {
        active = false;
        cancelAnimationFrame(animationId);
    });
};
