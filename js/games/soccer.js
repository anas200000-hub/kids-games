// Game 41: Fast Soccer (كرة القدم السريعة)
(function () {
    window.initSoccerGame = function (container) {
        let score = 0;
        const targetScore = 5;
        let gameActive = true;
        let animationId = null;

        let html = `
            <div class="game-soccer-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none;">
                <h2 class="game-title" style="color: #4CAF50; margin-bottom: 4px; font-weight: 900; width: 100%;">⚽ كرة القدم السريعة ⚽</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 8px; direction: rtl;">
                    <div style="font-weight: bold; color: #2E7D32; font-size: 15px;">الأهداف: <span id="soccerScore">0</span> / 5</div>
                    <div id="soccerFeedback" style="font-weight: bold; color: #FF9800; font-size: 15px; min-height: 20px;">انقر على المرمى لتسديد الكرة! 👇</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.2); border: 3px solid #FFF; width: 100%;">
                    <canvas id="soccerCanvas" width="400" height="500" style="display: block; background: #2E7D32; touch-action: none; cursor: crosshair; width: 100%; height: auto;"></canvas>
                </div>
                <div id="soccerSuccessModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 26px; margin-bottom: 10px;">🏆 بطل كرة القدم! 🏆</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد سجلت 5 أهداف رائعة في شباك الخصم!</p>
                        <button class="menu-btn restart-btn" id="restartSoccer" style="background: #4CAF50; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('soccerCanvas');
        const ctx = canvas.getContext('2d');

        // Goalpost dimensions (drawn at the top)
        const GOAL_X = 80;
        const GOAL_Y = 80;
        const GOAL_W = 240;
        const GOAL_H = 90;

        // Goalkeeper state
        let goalie = {
            x: 200,
            y: GOAL_Y + GOAL_H - 12,
            w: 50,
            h: 30,
            speed: 2,
            dir: 1, // 1 = right, -1 = left
            emoji: '🦁' // Cute lion goalkeeper
        };

        // Ball state
        const ballStart = { x: 200, y: 430, r: 20 };
        let ball = {
            x: ballStart.x,
            y: ballStart.y,
            r: ballStart.r,
            targetX: 0,
            targetY: 0,
            isShot: false,
            progress: 0, // 0 to 1
            spin: 0
        };

        let particles = [];
        let feedbackTimer = 0;
        let lastFeedback = '';

        // Spawn gold/star particles on scoring
        function spawnCelebrationParticles(x, y) {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2, // slightly upward
                    r: Math.random() * 4 + 2,
                    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.015
                });
            }
        }

        // Main game loop
        function update() {
            if (!gameActive) return;

            // 1. Draw Field
            drawField();

            // 2. Update & Draw Goalkeeper
            updateGoalie();
            drawGoalie();

            // 3. Update & Draw Ball
            updateBall();
            drawBall();

            // 4. Update & Draw Particles
            updateParticles();

            // 5. Draw Goalposts (in front of the ball if it is behind the goalpost line)
            drawGoalpost();

            // 6. Draw floating score feedback text
            drawFeedbackText();

            animationId = requestAnimationFrame(update);
        }

        // Draw the grass and lines
        function drawField() {
            // Field green background (gradient)
            const fieldGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            fieldGrad.addColorStop(0, '#1B5E20');
            fieldGrad.addColorStop(0.5, '#2E7D32');
            fieldGrad.addColorStop(1, '#388E3C');
            ctx.fillStyle = fieldGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw field stripes
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            for (let y = 0; y < canvas.height; y += 40) {
                if ((y / 40) % 2 === 0) {
                    ctx.fillRect(0, y, canvas.width, 40);
                }
            }

            // Draw penalty box
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 4;
            ctx.strokeRect(40, GOAL_Y, 320, 160);

            // Draw penalty spot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(200, 200, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw penalty arc
            ctx.beginPath();
            ctx.arc(200, 200, 45, 0, Math.PI);
            ctx.stroke();

            // Draw goal line
            ctx.beginPath();
            ctx.moveTo(0, GOAL_Y + GOAL_H);
            ctx.lineTo(canvas.width, GOAL_Y + GOAL_H);
            ctx.stroke();
        }

        // Update goalkeeper horizontal position
        function updateGoalie() {
            // Speed scales slightly with score to increase difficulty
            const currentSpeed = goalie.speed + (score * 0.4);
            goalie.x += goalie.dir * currentSpeed;

            // Constrain within goalposts
            const minX = GOAL_X + goalie.w / 2 + 5;
            const maxX = GOAL_X + GOAL_W - goalie.w / 2 - 5;

            if (goalie.x > maxX) {
                goalie.x = maxX;
                goalie.dir = -1;
            } else if (goalie.x < minX) {
                goalie.x = minX;
                goalie.dir = 1;
            }
        }

        // Draw goalie character/emoji
        function drawGoalie() {
            ctx.save();
            ctx.translate(goalie.x, goalie.y);

            // Goalie Jersey (a simple red rectangle/trapezoid)
            ctx.fillStyle = '#E53935';
            ctx.beginPath();
            ctx.moveTo(-16, 12);
            ctx.lineTo(16, 12);
            ctx.lineTo(24, 30);
            ctx.lineTo(-24, 30);
            ctx.closePath();
            ctx.fill();

            // Goalie gloves (yellow circles on left and right)
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(-26, 30, 8, 0, Math.PI * 2);
            ctx.arc(26, 30, 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw emoji head
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(goalie.emoji, 0, 0);

            ctx.restore();
        }

        // Draw goalposts and netting
        function drawGoalpost() {
            ctx.save();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 6;

            // Draw goalposts white frame
            ctx.beginPath();
            ctx.moveTo(GOAL_X, GOAL_Y + GOAL_H);
            ctx.lineTo(GOAL_X, GOAL_Y);
            ctx.lineTo(GOAL_X + GOAL_W, GOAL_Y);
            ctx.lineTo(GOAL_X + GOAL_W, GOAL_Y + GOAL_H);
            ctx.stroke();

            // Draw net mesh pattern inside goalpost
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            // Vertical net lines
            for (let x = GOAL_X + 15; x < GOAL_X + GOAL_W; x += 15) {
                ctx.moveTo(x, GOAL_Y);
                ctx.lineTo(x, GOAL_Y + GOAL_H);
            }
            // Horizontal net lines
            for (let y = GOAL_Y + 15; y < GOAL_Y + GOAL_H; y += 15) {
                ctx.moveTo(GOAL_X, y);
                ctx.lineTo(GOAL_X + GOAL_W, y);
            }
            ctx.stroke();
            ctx.restore();
        }

        // Update ball motion physics/animation
        function updateBall() {
            if (!ball.isShot) return;

            // Increment shot animation progress
            ball.progress += 0.045; // shot speed
            if (ball.progress >= 1) {
                ball.progress = 1;
                ball.isShot = false;

                // Check goal results when ball reaches target!
                checkScore(ball.x, ball.y);
            }

            // Interpolate position linearly
            ball.x = ballStart.x + (ball.targetX - ballStart.x) * ball.progress;
            ball.y = ballStart.y + (ball.targetY - ballStart.y) * ball.progress;

            // Perspective scale-down effect (radius gets smaller as it goes back)
            ball.r = ballStart.r - (ballStart.r - 10) * ball.progress;

            // Spin animation
            ball.spin += 0.25;
        }

        // Draw soccer ball
        function drawBall() {
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(ball.spin);

            // White base circle
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
            ctx.fill();

            // Black hex patterns (classic soccer pentagons)
            ctx.fillStyle = '#212121';
            const pentagonRadius = ball.r * 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, pentagonRadius, 0, Math.PI * 2);
            ctx.fill();

            // Additional surrounding hex shapes
            ctx.strokeStyle = '#212121';
            ctx.lineWidth = ball.r * 0.2;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * ball.r, Math.sin(a) * ball.r);
                ctx.stroke();
            }

            // Ball shadow underneath (only if not flying high or just starting)
            ctx.restore();
            ctx.save();
            ctx.translate(ball.x, ball.y + ball.r + 2);
            ctx.scale(1, 0.35);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            // Shadow gets smaller/fainter as ball flies
            const shadowRadius = ball.r * (1 - ball.progress * 0.5);
            ctx.arc(0, 0, shadowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Score logic and goalie collision
        function checkScore(targetX, targetY) {
            // Check if ball is inside the goal frame (GOAL_X to GOAL_X + GOAL_W) and y is goal line
            const inGoalWidth = targetX >= GOAL_X && targetX <= GOAL_X + GOAL_W;
            const inGoalHeight = targetY >= GOAL_Y && targetY <= GOAL_Y + GOAL_H + 5;

            if (inGoalWidth && inGoalHeight) {
                // Check if goalkeeper blocks it (goalie is located at goalie.x)
                const goalieCollisionDist = Math.abs(targetX - goalie.x);
                // Goalie half width is goalie.w / 2 (25px) plus ball radius (10px) = 35px tolerance
                if (goalieCollisionDist < (goalie.w / 2 + 10)) {
                    // Blocked!
                    setFeedback('صدة رائعة! 🧤', '#F57C00');
                    if (window.sound) window.sound.playFail();
                } else {
                    // GOAL!
                    score++;
                    document.getElementById('soccerScore').innerText = score;
                    setFeedback('هدف! 🎉⚽', '#4CAF50');
                    spawnCelebrationParticles(targetX, targetY);

                    if (window.sound) window.sound.playSuccess();

                    // Check win state
                    if (score >= targetScore) {
                        setTimeout(winGame, 800);
                    }
                }
            } else {
                // Missed wide/high
                setFeedback('خارج المرمى! 💨', '#D32F2F');
                if (window.sound) window.sound.playFail();
            }

            // Automatically reset ball after short delay to shoot again
            setTimeout(resetBallPosition, 1200);
        }

        // Set top HUD message and initialize countdown display
        function setFeedback(text, color) {
            const feed = document.getElementById('soccerFeedback');
            if (feed) {
                feed.innerText = text;
                feed.style.color = color;
            }
            lastFeedback = text;
            feedbackTimer = 60; // frames to show text
        }

        // Render float text feedback on canvas
        function drawFeedbackText() {
            if (feedbackTimer <= 0) return;
            feedbackTimer--;

            ctx.save();
            ctx.font = 'bold 36px var(--font-kids)';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 8;
            ctx.textAlign = 'center';
            ctx.fillText(lastFeedback, 200, 260 - (60 - feedbackTimer) * 0.5);
            ctx.restore();
        }

        // Put the ball back at bottom center
        function resetBallPosition() {
            if (!gameActive) return;
            ball = {
                x: ballStart.x,
                y: ballStart.y,
                r: ballStart.r,
                targetX: 0,
                targetY: 0,
                isShot: false,
                progress: 0,
                spin: 0
            };
        }

        // Update particle physics
        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // gravity
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
        }

        // Action when shoot is clicked/tapped
        function handleShoot(clientX, clientY) {
            if (!gameActive || ball.isShot) return;

            const rect = canvas.getBoundingClientRect();
            const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
            const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

            // Can only shoot towards the upper half of screen (goalpost area)
            if (canvasY > 300) return;

            ball.targetX = canvasX;
            ball.targetY = canvasY;
            ball.isShot = true;
            ball.progress = 0;

            if (window.sound) window.sound.playClick();
        }

        function winGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) window.sound.playSuccess();
            document.getElementById('soccerSuccessModal').style.display = 'flex';
        }

        function resetGame() {
            score = 0;
            document.getElementById('soccerScore').innerText = score;
            const feed = document.getElementById('soccerFeedback');
            if (feed) {
                feed.innerText = 'انقر على المرمى لتسديد الكرة! 👇';
                feed.style.color = '#FF9800';
            }
            particles = [];
            resetBallPosition();
            document.getElementById('soccerSuccessModal').style.display = 'none';
            gameActive = true;
            update();
        }

        // Mouse/Touch events
        canvas.addEventListener('mousedown', (e) => handleShoot(e.clientX, e.clientY));
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleShoot(e.touches[0].clientX, e.touches[0].clientY);
        });

        document.getElementById('restartSoccer').addEventListener('click', resetGame);

        // Start loop
        update();

        // Cleanup
        container.addEventListener('game-exit', () => {
            cancelAnimationFrame(animationId);
        });
    };
})();
