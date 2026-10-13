// Game 39: Brick Breaker Arcade (كسر الكتل الكلاسيكية)
(function() {
    window.initBrickBreakerGame = function(container) {
        let score = 0;
        let lives = 3;
        let gameActive = true;
        let animationId = null;
        let gameOver = false;
        let level = 1;

        const CANVAS_W = 400;
        const CANVAS_H = 600;

        // Paddle
        let currentPaddleWidth = 70;
        const paddleHeight = 12;
        let paddleX = (CANVAS_W - currentPaddleWidth) / 2;
        const paddleY = CANVAS_H - 40;
        let isDragging = false;
        let paddleWidthTimer = 0;

        // Balls (multiple balls support)
        const ballRadius = 6;
        let balls = [];
        let ballAttached = true; // ball starts on the paddle

        // Safety Floor/Shield powerup
        let shieldActive = false;
        let shieldTimer = 0;

        // Active falling Powerups
        let powerups = [];

        // Powerup types definition
        const powerupTypes = [
            { type: 'MULTI_BALL', emoji: '🥎', color: '#00E676', name: 'كرات مضاعفة' },
            { type: 'LONG_PADDLE', emoji: '↔️', color: '#2979FF', name: 'تطويل المضرب' },
            { type: 'EXTRA_LIFE', emoji: '❤️', color: '#FF1744', name: 'روح إضافية' },
            { type: 'SHIELD', emoji: '🛡️', color: '#AA00FF', name: 'درع سفلي' }
        ];

        // Bricks grid
        const brickRows = 5;
        const brickCols = 6;
        const brickWidth = 56;
        const brickHeight = 16;
        const brickPadding = 4;
        const brickOffsetTop = 50;
        const brickOffsetLeft = 22;
        let bricks = [];

        const rowColors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#2979FF'];

        let html = `
            <div class="game-brick-breaker-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: ltr;">
                <h2 class="game-title" style="color: #FF2E93; margin-bottom: 8px; font-weight: 900; font-family: var(--font-kids);">🧱 Brick Breaker 🧱</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #FF2E93; font-size: 15px;">🏆 <span id="brickScore">0</span></div>
                    <div style="font-weight: bold; color: #9C27B0; font-size: 15px;">LEVEL <span id="brickLevel">1</span></div>
                    <div id="brickLives" style="font-weight: bold; color: #E53935; font-size: 15px;">❤️❤️❤️</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.3); border: 4px solid #333;">
                    <canvas id="brickCanvas" width="${CANVAS_W}" height="${CANVAS_H}" style="display: block; background: #1A1A2E; touch-action: none; cursor: pointer;"></canvas>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #888; font-weight: bold; text-align: center;">
                    التقط الجوائز المتساقطة: كرات مضاعفة 🥎، تطويل المضرب ↔️، روح إضافية ❤️، درع حماية 🛡️!
                </div>

                <div id="brickWinModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 26px; margin-bottom: 10px;">🏆 مستوى جديد! 🏆</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">استعد للمستوى القادم يا بطل!</p>
                        <button class="menu-btn restart-btn" id="nextLevelBtn" style="background: #4CAF50; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">ابدأ الآن 🎮</button>
                    </div>
                </div>

                <div id="brickFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 26px; margin-bottom: 10px;">💥 انتهت المحاولات! 💥</h3>
                        <p style="font-size: 18px; margin-bottom: 5px; color: #555;">النقاط المحققة: <span id="brickFinalScore" style="font-weight: bold; color: #E53935; font-size: 22px;">0</span></p>
                        <p style="font-size: 14px; margin-bottom: 20px; color: #888;">حاول مرة أخرى لتحطيم الأرقام القياسية!</p>
                        <button class="menu-btn restart-btn" id="restartBrick" style="background: linear-gradient(135deg, #FF5252, #FF1744); color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #C62828; transition: transform 0.1s;">العب مجدداً 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('brickCanvas');
        const ctx = canvas.getContext('2d');

        function initBricks() {
            bricks = [];
            for (let r = 0; r < brickRows; r++) {
                bricks[r] = [];
                for (let c = 0; c < brickCols; c++) {
                    bricks[r][c] = {
                        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                        y: r * (brickHeight + brickPadding) + brickOffsetTop,
                        status: 1, // 1 = visible/active
                        color: rowColors[r % rowColors.length]
                    };
                }
            }
        }

        // ============ DRAWING FUNCTIONS ============
        function drawPaddle() {
            ctx.save();
            ctx.fillStyle = '#E0F2F1';
            ctx.beginPath();
            ctx.roundRect(paddleX, paddleY, currentPaddleWidth, paddleHeight, 6);
            ctx.fill();

            // Glow color based on active paddle timer
            ctx.strokeStyle = paddleWidthTimer > 0 ? '#2979FF' : '#00E676';
            ctx.lineWidth = paddleWidthTimer > 0 ? 3 : 2;
            ctx.stroke();

            // Inner design detail
            ctx.fillStyle = '#00B0FF';
            ctx.beginPath();
            ctx.roundRect(paddleX + currentPaddleWidth / 2 - 10, paddleY + 3, 20, 6, 3);
            ctx.fill();
            ctx.restore();
        }

        function drawBalls() {
            balls.forEach(ball => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
                const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ballRadius);
                ballGrad.addColorStop(0, '#FFF');
                ballGrad.addColorStop(1, '#FF2E93');
                ctx.fillStyle = ballGrad;
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FF2E93';
                ctx.closePath();
                ctx.restore();
            });
        }

        function drawBricks() {
            for (let r = 0; r < brickRows; r++) {
                for (let c = 0; c < brickCols; c++) {
                    const b = bricks[r][c];
                    if (b.status === 1) {
                        ctx.save();
                        ctx.fillStyle = b.color;
                        ctx.beginPath();
                        ctx.roundRect(b.x, b.y, brickWidth, brickHeight, 4);
                        ctx.fill();

                        // Gloss highlight on top border
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                        ctx.fillRect(b.x + 2, b.y + 2, brickWidth - 4, 3);

                        // Shadow/shade on bottom border
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.fillRect(b.x + 2, b.y + brickHeight - 4, brickWidth - 4, 2);

                        ctx.restore();
                    }
                }
            }
        }

        function drawPowerups() {
            powerups.forEach(p => {
                ctx.save();
                // Draw circular floating pill/container
                ctx.beginPath();
                ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.fill();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Draw powerup emoji centered
                ctx.font = '13px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.emoji, p.x, p.y);
                ctx.restore();
            });
        }

        function drawShield() {
            if (shieldActive) {
                ctx.save();
                ctx.strokeStyle = '#AA00FF';
                ctx.lineWidth = 5;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#AA00FF';
                ctx.beginPath();
                ctx.moveTo(0, CANVAS_H - 8);
                ctx.lineTo(CANVAS_W, CANVAS_H - 8);
                ctx.stroke();
                ctx.restore();
            }
        }

        // ============ COLLISION DETECTION ============
        function checkCollisions() {
            for (let i = balls.length - 1; i >= 0; i--) {
                const ball = balls[i];

                // Ball hitting left/right walls
                if (ball.x + ball.speedX > CANVAS_W - ballRadius || ball.x + ball.speedX < ballRadius) {
                    ball.speedX = -ball.speedX;
                    if (window.sound) window.sound.playClick();
                }

                // Ball hitting top wall
                if (ball.y + ball.speedY < ballRadius) {
                    ball.speedY = -ball.speedY;
                    if (window.sound) window.sound.playClick();
                }

                // Ball hitting shield
                if (shieldActive && ball.y + ball.speedY >= CANVAS_H - 12) {
                    ball.speedY = -Math.abs(ball.speedY);
                    if (window.sound) window.sound.playClick();
                }

                // Ball hitting bricks
                for (let r = 0; r < brickRows; r++) {
                    for (let c = 0; c < brickCols; c++) {
                        const b = bricks[r][c];
                        if (b.status === 1) {
                            if (
                                ball.x + ballRadius > b.x &&
                                ball.x - ballRadius < b.x + brickWidth &&
                                ball.y + ballRadius > b.y &&
                                ball.y - ballRadius < b.y + brickHeight
                            ) {
                                b.status = 0;
                                ball.speedY = -ball.speedY;
                                score += 10;
                                document.getElementById('brickScore').innerText = score;
                                if (window.sound) window.sound.playBubble();

                                // Randomly spawn powerup (25% chance)
                                if (Math.random() < 0.25) {
                                    const pType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                                    powerups.push({
                                        x: b.x + brickWidth / 2,
                                        y: b.y + brickHeight / 2,
                                        type: pType.type,
                                        emoji: pType.emoji,
                                        color: pType.color,
                                        speedY: 2
                                    });
                                }

                                checkLevelProgress();
                                break;
                            }
                        }
                    }
                }

                // Ball hitting paddle
                if (
                    ball.y + ballRadius >= paddleY && 
                    ball.y - ballRadius <= paddleY + paddleHeight &&
                    ball.x >= paddleX && 
                    ball.x <= paddleX + currentPaddleWidth
                ) {
                    const hitPos = (ball.x - paddleX) / currentPaddleWidth; // 0 to 1
                    const angleMultiplier = 8;
                    ball.speedX = (hitPos - 0.5) * angleMultiplier;
                    ball.speedY = -Math.abs(ball.speedY); // Bounce back up
                    if (window.sound) window.sound.playClick();
                }

                // Ball falling off bottom (when no shield active)
                if (ball.y + ballRadius > CANVAS_H) {
                    balls.splice(i, 1);
                    
                    // If no balls left, lose a life
                    if (balls.length === 0) {
                        lives--;
                        updateLivesUI();
                        if (window.sound) window.sound.playFail();

                        if (lives <= 0) {
                            endGame();
                        } else {
                            resetBall();
                        }
                    }
                }
            }
        }

        // ============ POWERUPS MANAGEMENT ============
        function updatePowerups() {
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                p.y += p.speedY;

                // Check collision with paddle
                if (
                    p.y + 12 >= paddleY &&
                    p.y - 12 <= paddleY + paddleHeight &&
                    p.x >= paddleX &&
                    p.x <= paddleX + currentPaddleWidth
                ) {
                    applyPowerup(p.type);
                    if (window.sound) window.sound.playBubble();
                    powerups.splice(i, 1);
                    continue;
                }

                // Remove off-screen powerups
                if (p.y > CANVAS_H + 20) {
                    powerups.splice(i, 1);
                }
            }
        }

        function applyPowerup(type) {
            if (type === 'MULTI_BALL') {
                // Add 2 extra balls with varied angles
                const baseBall = balls[0] || { x: CANVAS_W/2, y: paddleY - 10, speedX: 0, speedY: -4 };
                balls.push({
                    x: baseBall.x,
                    y: baseBall.y,
                    speedX: baseBall.speedX + 2,
                    speedY: -Math.abs(baseBall.speedY)
                });
                balls.push({
                    x: baseBall.x,
                    y: baseBall.y,
                    speedX: baseBall.speedX - 2,
                    speedY: -Math.abs(baseBall.speedY)
                });
            } else if (type === 'LONG_PADDLE') {
                currentPaddleWidth = 110;
                paddleWidthTimer = 400; // active for ~6-7 seconds
            } else if (type === 'EXTRA_LIFE') {
                if (lives < 3) {
                    lives++;
                    updateLivesUI();
                }
            } else if (type === 'SHIELD') {
                shieldActive = true;
                shieldTimer = 400; // active for ~6-7 seconds
            }
        }

        function checkLevelProgress() {
            let win = true;
            for (let r = 0; r < brickRows; r++) {
                for (let c = 0; c < brickCols; c++) {
                    if (bricks[r][c].status === 1) {
                        win = false;
                        break;
                    }
                }
            }
            if (win) {
                gameActive = false;
                cancelAnimationFrame(animationId);
                document.getElementById('brickWinModal').style.display = 'flex';
            }
        }

        function resetBall() {
            ballAttached = true;
            balls = [{
                x: paddleX + currentPaddleWidth / 2,
                y: paddleY - ballRadius - 2,
                speedX: 3 + level * 0.5,
                speedY: -(3 + level * 0.5)
            }];
        }

        function updateLivesUI() {
            let hearts = '';
            for (let i = 0; i < lives; i++) hearts += '❤️';
            for (let i = lives; i < 3; i++) hearts += '🖤';
            document.getElementById('brickLives').innerText = hearts;
        }

        // ============ GAME LOOP ============
        function update() {
            if (!gameActive) return;

            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // Handle timers
            if (paddleWidthTimer > 0) {
                paddleWidthTimer--;
                if (paddleWidthTimer === 0) {
                    currentPaddleWidth = 70;
                }
            }
            if (shieldTimer > 0) {
                shieldTimer--;
                if (shieldTimer === 0) {
                    shieldActive = false;
                }
            }

            // Draw game elements
            drawBricks();
            drawShield();
            drawPaddle();
            drawBalls();
            drawPowerups();

            // Ball attached movement
            if (ballAttached) {
                if (balls[0]) {
                    balls[0].x = paddleX + currentPaddleWidth / 2;
                    balls[0].y = paddleY - ballRadius - 2;
                }
            } else {
                balls.forEach(ball => {
                    ball.x += ball.speedX;
                    ball.y += ball.speedY;
                });
                checkCollisions();
            }

            updatePowerups();

            animationId = requestAnimationFrame(update);
        }

        // ============ INTERACTION HANDLERS ============
        function movePaddle(clientX) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = (clientX - rect.left) * (CANVAS_W / rect.width);
            paddleX = canvasX - currentPaddleWidth / 2;
            paddleX = Math.max(4, Math.min(CANVAS_W - currentPaddleWidth - 4, paddleX));

            if (ballAttached && balls[0]) {
                balls[0].x = paddleX + currentPaddleWidth / 2;
            }
        }

        function onTouchStart(e) {
            e.preventDefault();
            isDragging = true;
            if (ballAttached) {
                ballAttached = false;
            }
            movePaddle(e.touches[0].clientX);
        }

        function onTouchMove(e) {
            e.preventDefault();
            if (isDragging) {
                movePaddle(e.touches[0].clientX);
            }
        }

        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', () => isDragging = false);

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            if (ballAttached) {
                ballAttached = false;
            }
            movePaddle(e.clientX);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                movePaddle(e.clientX);
            }
        });
        canvas.addEventListener('mouseup', () => isDragging = false);

        // Keyboard support
        function handleKeydown(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                paddleX = Math.max(4, paddleX - 18);
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                paddleX = Math.min(CANVAS_W - currentPaddleWidth - 4, paddleX + 18);
            }
            if (ballAttached && (e.key === ' ' || e.key === 'Enter')) {
                ballAttached = false;
            }
        }
        document.addEventListener('keydown', handleKeydown);

        function endGame() {
            gameActive = false;
            gameOver = true;
            cancelAnimationFrame(animationId);
            document.getElementById('brickFinalScore').innerText = score;
            document.getElementById('brickFailModal').style.display = 'flex';
        }

        function startNextLevel() {
            level++;
            document.getElementById('brickLevel').innerText = level;
            document.getElementById('brickWinModal').style.display = 'none';
            initBricks();
            resetBall();
            powerups = [];
            shieldActive = false;
            shieldTimer = 0;
            paddleWidthTimer = 0;
            currentPaddleWidth = 70;
            gameActive = true;
            update();
        }

        function resetGame() {
            score = 0;
            lives = 3;
            level = 1;
            powerups = [];
            shieldActive = false;
            shieldTimer = 0;
            paddleWidthTimer = 0;
            currentPaddleWidth = 70;
            document.getElementById('brickScore').innerText = '0';
            document.getElementById('brickLevel').innerText = '1';
            document.getElementById('brickFailModal').style.display = 'none';
            document.getElementById('brickWinModal').style.display = 'none';
            updateLivesUI();
            initBricks();
            resetBall();
            gameActive = true;
            update();
        }

        document.getElementById('nextLevelBtn').addEventListener('click', startNextLevel);
        document.getElementById('restartBrick').addEventListener('click', resetGame);

        resetGame();

        container.addEventListener('game-exit', () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', handleKeydown);
        });
    };
})();
