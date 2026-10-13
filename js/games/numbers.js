// Game 19: Numbers Balloon Pop (بالونات الأرقام)
window.initNumbersGame = function (container) {
    let score = 0;
    const targetScore = 10;
    let targetNumber = 1;
    let gameActive = true;
    let animationId = null;

    let html = `
        <div class="game-numbers-pop-layout">
            <h2 class="game-title">🔢 بالونات الأرقام 🔢</h2>
            <div class="game-hud">
                <div class="hud-score">النقاط: <span id="numPopScore">0</span> / 10</div>
                <div class="hud-target-num" style="background-color: var(--color-pink); color: white; padding: 4px 12px; border-radius: 20px;">الهدف: <strong id="numPopTarget" style="font-size: 1.4rem;">1</strong></div>
            </div>
            <p class="game-instructions" id="numPopPrompt">ابحث عن الرقم 1 وفرقعه!</p>
            
            <div class="canvas-container">
                <canvas id="numPopCanvas" width="400" height="460"></canvas>
            </div>

            <div id="numPopSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 بطل الأرقام الممتاز! 🎉</h3>
                    <p>لقد فرقعت 10 بالونات أرقام مطابقة للهدف بنجاح!</p>
                    <button class="menu-btn restart-btn" id="restartNumPop">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const canvas = document.getElementById('numPopCanvas');
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

    function spawnBalloon() {
        const radius = 32;
        // Make sure a fair share of balloons contain the target number
        const number = Math.random() < 0.35 ? targetNumber : (Math.floor(Math.random() * 5) + 1);
        
        return {
            x: Math.random() * (canvas.width - radius * 2) + radius,
            y: canvas.height + radius + Math.random() * 100,
            r: radius,
            number: number,
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            speed: Math.random() * 1.2 + 1.0,
            phase: Math.random() * Math.PI * 2,
            wiggleSpeed: Math.random() * 0.04 + 0.02
        };
    }

    // Populate balloons
    for (let i = 0; i < 5; i++) {
        balloons.push(spawnBalloon());
        balloons[i].y -= Math.random() * canvas.height;
    }

    function changeTarget() {
        const prevTarget = targetNumber;
        do {
            targetNumber = Math.floor(Math.random() * 5) + 1;
        } while (targetNumber === prevTarget);

        document.getElementById('numPopTarget').innerText = targetNumber;
        document.getElementById('numPopPrompt').innerText = `ابحث عن الرقم ${targetNumber} وفرقعه! 🎈`;
    }

    function createPopParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                r: Math.random() * 3 + 2,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    function update() {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
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

        // Update balloons
        balloons.forEach((b, index) => {
            b.phase += b.wiggleSpeed;
            b.x += Math.sin(b.phase) * 0.4;
            b.y -= b.speed;

            if (b.y < -b.r) {
                balloons[index] = spawnBalloon();
            }

            // Draw balloon string
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.r);
            ctx.lineTo(b.x, b.y + b.r + 30);
            ctx.stroke();

            // Draw balloon body
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(1, 1.15);
            ctx.arc(0, 0, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw balloon knot
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.r * 1.1);
            ctx.lineTo(b.x - 5, b.y + b.r * 1.1 + 6);
            ctx.lineTo(b.x + 5, b.y + b.r * 1.1 + 6);
            ctx.closePath();
            ctx.fill();

            // Draw number text on balloon
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.number, b.x, b.y);
        });

        animationId = requestAnimationFrame(update);
    }

    function checkPop(clientX, clientY) {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const touchX = (clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (clientY - rect.top) * (canvas.height / rect.height);

        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            const dist = Math.hypot(touchX - b.x, touchY - b.y);
            
            if (dist < b.r + 10) {
                // Balloon tapped!
                createPopParticles(b.x, b.y, b.color);
                balloons[i] = spawnBalloon(); // replace

                if (b.number === targetNumber) {
                    // Correct pop!
                    score++;
                    document.getElementById('numPopScore').innerText = score;
                    
                    if (window.sound) window.sound.playPop();

                    if (score >= targetScore) {
                        winGame();
                    } else {
                        changeTarget(); // Switch target number
                    }
                } else {
                    // Incorrect pop
                    if (window.sound) window.sound.playFail();
                    // Shake canvas
                    canvas.classList.add('shake-anim');
                    setTimeout(() => canvas.classList.remove('shake-anim'), 500);
                }
                break;
            }
        }
    }

    function winGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        if (window.sound) window.sound.playSuccess();
        document.getElementById('numPopSuccessModal').classList.add('show');
    }

    function resetGame() {
        score = 0;
        document.getElementById('numPopScore').innerText = score;
        document.getElementById('numPopSuccessModal').classList.remove('show');
        balloons = [];
        particles = [];
        targetNumber = 1;
        changeTarget();
        
        for (let i = 0; i < 5; i++) {
            balloons.push(spawnBalloon());
            balloons[i].y -= Math.random() * canvas.height;
        }

        gameActive = true;
        update();
    }

    canvas.addEventListener('mousedown', (e) => checkPop(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        checkPop(e.touches[0].clientX, e.touches[0].clientY);
    });

    document.getElementById('restartNumPop').addEventListener('click', resetGame);

    resetGame();

    // Clean up
    container.addEventListener('game-exit', () => {
        cancelAnimationFrame(animationId);
    });
};
