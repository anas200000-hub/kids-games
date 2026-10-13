// Game 3: Balloon Pop (فرقعة البالونات)
window.initBalloonsGame = function (container) {
    let score = 0;
    const targetScore = 20;
    let gameActive = true;
    let animationId = null;

    let html = `
        <div class="game-balloons-layout">
            <h2 class="game-title">🎈 فرقعة البالونات 🎈</h2>
            <div class="game-hud">
                <div class="hud-score">البالونات المفرقعة: <span id="balloonScore">0</span> / 20</div>
            </div>
            <div class="canvas-container">
                <canvas id="balloonsCanvas" width="400" height="600"></canvas>
            </div>
            <div id="balloonSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا بطل! 🎉</h3>
                    <p>لقد فرقعت 20 بالوناً ملوناً!</p>
                    <button class="menu-btn restart-btn" id="restartBalloons">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const canvas = document.getElementById('balloonsCanvas');
    const ctx = canvas.getContext('2d');

    const balloonColors = [
        '#FF3B30', // Red
        '#FF9500', // Orange
        '#FFCC00', // Yellow
        '#4CD964', // Green
        '#5AC8FA', // Light Blue
        '#FF2D55', // Pink
        '#AF52DE'  // Purple
    ];

    let balloons = [];
    let particles = [];

    // Initialize balloons
    function spawnBalloon() {
        const radius = Math.random() * 15 + 25; // radius between 25 and 40
        return {
            x: Math.random() * (canvas.width - radius * 2) + radius,
            y: canvas.height + radius + Math.random() * 100,
            r: radius,
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            speed: Math.random() * 1.5 + 1.2,
            wiggle: Math.random() * 0.05,
            wiggleSpeed: Math.random() * 0.05 + 0.02,
            phase: Math.random() * Math.PI * 2
        };
    }

    // Populate initial balloons
    for (let i = 0; i < 6; i++) {
        balloons.push(spawnBalloon());
        // Stagger their heights initially
        balloons[i].y -= Math.random() * canvas.height;
    }

    // Spawn popping particles
    function createPopParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // slight upward bias
                r: Math.random() * 3 + 2,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    // Main animation loop
    function update() {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw and update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. Draw and update balloons
        balloons.forEach((b, index) => {
            b.phase += b.wiggleSpeed;
            b.x += Math.sin(b.phase) * 0.5; // gentle side wiggle
            b.y -= b.speed;

            // If balloon floats off the top, reset it to the bottom
            if (b.y < -b.r) {
                balloons[index] = spawnBalloon();
            }

            // Draw balloon string
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.r);
            ctx.quadraticCurveTo(b.x - 5, b.y + b.r + 15, b.x + 5, b.y + b.r + 35);
            ctx.stroke();

            // Draw balloon body (egg shape/oval)
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(1, 1.15); // stretch vertically slightly
            ctx.arc(0, 0, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw small triangle knot at the bottom of the balloon
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.r * 1.1);
            ctx.lineTo(b.x - 6, b.y + b.r * 1.1 + 8);
            ctx.lineTo(b.x + 6, b.y + b.r * 1.1 + 8);
            ctx.closePath();
            ctx.fill();

            // Draw balloon highlight (glossy effect)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, Math.PI * 2);
            ctx.fill();
        });

        animationId = requestAnimationFrame(update);
    }

    // Click/Touch handling
    function checkPop(clientX, clientY) {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const touchX = (clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (clientY - rect.top) * (canvas.height / rect.height);

        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            // Check collision using distance formula
            const dist = Math.hypot(touchX - b.x, touchY - b.y);
            if (dist < b.r + 10) { // generous hitbox for kids
                // Pop balloon!
                createPopParticles(b.x, b.y, b.color);
                
                if (window.sound) {
                    window.sound.playPop();
                }

                // Replace popped balloon
                balloons[i] = spawnBalloon();

                // Increment score
                score++;
                document.getElementById('balloonScore').innerText = score;

                // Check Win condition
                if (score >= targetScore) {
                    winGame();
                }
                break;
            }
        }
    }

    function winGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        if (window.sound) {
            window.sound.playSuccess();
        }
        document.getElementById('balloonSuccessModal').classList.add('show');
    }

    function resetGame() {
        score = 0;
        document.getElementById('balloonScore').innerText = score;
        balloons = [];
        particles = [];
        for (let i = 0; i < 6; i++) {
            balloons.push(spawnBalloon());
            balloons[i].y -= Math.random() * canvas.height;
        }
        document.getElementById('balloonSuccessModal').classList.remove('show');
        gameActive = true;
        update();
    }

    canvas.addEventListener('mousedown', (e) => checkPop(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        checkPop(e.touches[0].clientX, e.touches[0].clientY);
    });

    document.getElementById('restartBalloons').addEventListener('click', () => {
        resetGame();
    });

    // Start game loop
    update();

    // Clean up animation on exit
    container.addEventListener('game-exit', () => {
        cancelAnimationFrame(animationId);
    });
};
