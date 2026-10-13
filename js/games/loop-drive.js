// Game: Loop Drive (تحدي الدوران)
(function() {
    window.initLoopDriveGame = function(container) {
        let canvas, ctx;
        let animationFrameId;
        let gameActive = true;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('kids_loop_drive_high') || '0');

        // Circular Road parameters
        const centerX = 190;
        const centerY = 190;
        const radius = 95;
        const roadWidth = 32;

        // Game Entities
        let playerCar = {
            angle: Math.PI * 0.8, // Start angle on the circle
            speed: 0.025,         // Base speed (angular)
            normalSpeed: 0.025,
            fastSpeed: 0.055,
            targetSpeed: 0.025,
            currentSpeed: 0.025,
            color: '#39FF14',    // Neon Green player car
            radius: 8,
            lapCompleted: false
        };

        // Obstacle cars in the loop
        let enemyCars = [];
        let particles = [];

        // HTML Layout Setup
        let html = `
            <div class="game-loop-drive-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: ltr; background: linear-gradient(to bottom, #1E1B4B 0%, #0F172A 100%); border-radius: 20px; padding: 10px; overflow: hidden; position: relative;">
                <h2 class="game-title" style="color: #FFD700; margin-bottom: 6px; font-weight: 900;">🚗 تحدي الدوران 🚗</h2>
                <p style="font-size: 0.75rem; color: #94A3B8; margin: 0 0 8px; text-align: center;">اضغط واستمر في الضغط لتسرع! اترك الشاشة لتبطئ وتتفادى الاصطدام!</p>
                
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 6px 12px; background: rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 8px; box-sizing: border-box;">
                    <div style="font-weight: bold; color: #39FF14; font-size: 14px;">النقاط Laps: <span id="ldScore">0</span></div>
                    <div style="font-weight: bold; color: #FFB74D; font-size: 14px;">أعلى دورة: <span id="ldHighScore">0</span></div>
                </div>

                <div style="position: relative; background: #0F172A; border-radius: 24px; border: 4px solid #334155; box-shadow: 0 8px 16px rgba(0,0,0,0.5); width: 380px; height: 380px; box-sizing: border-box;">
                    <canvas id="ldCanvas" width="372" height="372" style="display: block; border-radius: 20px;"></canvas>
                </div>

                <!-- Input area indicator -->
                <div style="font-size: 12px; color: #64748B; margin-top: 10px; font-weight: bold; text-align: center;">اضغط في أي مكان على الشاشة للتحكم بالسرعة</div>

                <div id="ldFailModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10; align-items: center; justify-content: center; border-radius: 20px;">
                    <div class="modal-content bounce-anim" style="background: #1E293B; border: 4px solid #EF4444; border-radius: 25px; padding: 25px; text-align: center; max-width: 290px; color: white;">
                        <h3 style="color: #EF4444; font-size: 22px; margin-bottom: 8px;">💥 حادث تصادم! 💥</h3>
                        <p style="font-size: 14px; color: #94A3B8; margin-bottom: 15px;">انتبه للسيارات الأخرى في الدوران!</p>
                        <div style="font-size: 18px; font-weight: 800; color: #39FF14; margin-bottom: 20px;">الدورات المكتملة: <span id="ldFinalScore">0</span></div>
                        <button class="menu-btn restart-btn" id="ldRestartBtn" style="background: #EF4444; color: white; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; border: none; box-shadow: 0 4px 0 #991B1B;">العب مجدداً 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        canvas = document.getElementById('ldCanvas');
        ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('ldScore');
        const highScoreEl = document.getElementById('ldHighScore');
        const failModal = document.getElementById('ldFailModal');
        const finalScoreEl = document.getElementById('ldFinalScore');
        const restartBtn = document.getElementById('ldRestartBtn');

        highScoreEl.innerText = highScore;

        // Initialize Level/Game state
        function initGame() {
            score = 0;
            scoreEl.innerText = score;
            gameActive = true;
            failModal.style.display = 'none';
            particles = [];

            // Set player initial status
            playerCar.angle = Math.PI * 0.5; // Start at bottom of circle
            playerCar.targetSpeed = playerCar.normalSpeed;
            playerCar.currentSpeed = playerCar.normalSpeed;
            playerCar.lapCompleted = false;

            // Generate enemy cars
            enemyCars = [
                {
                    angle: Math.PI * 1.5, // Top of circle
                    speed: 0.02,
                    color: '#FFA726', // Orange car
                    length: 22,
                    width: 12
                },
                {
                    angle: Math.PI * 2.0, // Right side
                    speed: 0.016,
                    color: '#FFFFFF', // White car
                    length: 22,
                    width: 12
                }
            ];
        }

        // Draw a rounded car
        function drawCar(x, y, angle, color, isPlayer) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Car body
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(-11, -6, 22, 12, 4);
            ctx.fill();

            // Windshield/Windows
            ctx.fillStyle = isPlayer ? '#1E293B' : '#334155';
            ctx.beginPath();
            ctx.roundRect(-2, -4, 6, 8, 1);
            ctx.fill();

            // Rear window
            ctx.beginPath();
            ctx.roundRect(-7, -4, 3, 8, 1);
            ctx.fill();

            // Headlights
            ctx.fillStyle = '#FFFDE7';
            ctx.fillRect(9, -4, 2, 2);
            ctx.fillRect(9, 2, 2, 2);

            ctx.restore();
        }

        // Particle sparks on collision
        function spawnSparks(x, y, color) {
            for (let i = 0; i < 15; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    color: color,
                    size: Math.random() * 4 + 2,
                    life: 1.0,
                    decay: Math.random() * 0.04 + 0.02
                });
            }
        }

        // Input controllers: Tap and Hold to accelerate, release to slow down
        let isHolding = false;

        function handlePointerDown() {
            if (!gameActive) return;
            isHolding = true;
            playerCar.targetSpeed = playerCar.fastSpeed;
            if (window.sound) {
                // Short hum sound
                window.sound.playClick();
            }
        }

        function handlePointerUp() {
            isHolding = false;
            playerCar.targetSpeed = playerCar.normalSpeed;
        }

        container.addEventListener('mousedown', handlePointerDown);
        container.addEventListener('mouseup', handlePointerUp);
        container.addEventListener('mouseleave', handlePointerUp);

        container.addEventListener('touchstart', (e) => {
            handlePointerDown();
            e.preventDefault();
        }, { passive: false });
        container.addEventListener('touchend', (e) => {
            handlePointerUp();
            e.preventDefault();
        }, { passive: false });

        // Update loop
        function update() {
            if (!gameActive) return;

            // Smooth speed transitions
            playerCar.currentSpeed += (playerCar.targetSpeed - playerCar.currentSpeed) * 0.15;

            // Save old angle to check lap completion
            let oldAngle = playerCar.angle;
            playerCar.angle = (playerCar.angle + playerCar.currentSpeed) % (Math.PI * 2);

            // Check Lap completion (crossed Math.PI * 0.5 from behind)
            const targetCrossAngle = Math.PI * 0.5;
            if (oldAngle < targetCrossAngle && playerCar.angle >= targetCrossAngle) {
                score++;
                scoreEl.innerText = score;
                if (window.sound) {
                    window.sound.playPop();
                }
                
                // Gradually speed up obstacles slightly to increase difficulty
                enemyCars.forEach(car => {
                    car.speed += 0.001;
                });
            }

            // Move Obstacles
            enemyCars.forEach(car => {
                car.angle = (car.angle + car.speed) % (Math.PI * 2);
            });

            // Player position
            const playerX = centerX + Math.cos(playerCar.angle) * radius;
            const playerY = centerY + Math.sin(playerCar.angle) * radius;

            // Check Collisions
            enemyCars.forEach(car => {
                const enemyX = centerX + Math.cos(car.angle) * radius;
                const enemyY = centerY + Math.sin(car.angle) * radius;

                const dist = Math.hypot(playerX - enemyX, playerY - enemyY);
                if (dist < 18) { // Collision threshold
                    gameActive = false;
                    spawnSparks((playerX + enemyX) / 2, (playerY + enemyY) / 2, '#FF8A00');
                    spawnSparks((playerX + enemyX) / 2, (playerY + enemyY) / 2, '#FFD54F');
                    
                    if (window.sound) {
                        window.sound.playFail();
                    }

                    setTimeout(() => {
                        finalScoreEl.innerText = score;
                        failModal.style.display = 'flex';
                        if (score > highScore) {
                            highScore = score;
                            highScoreEl.innerText = highScore;
                            localStorage.setItem('kids_loop_drive_high', highScore);
                        }
                    }, 800);
                }
            });

            // Update particles
            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) {
                    particles.splice(idx, 1);
                }
            });
        }

        // Render loop
        function draw() {
            // Clear canvas with a nice radar beam effect
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw radial beam background matching user graphic
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.03)';
            for (let i = 0; i < 16; i++) {
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.arc(0, 0, 200, (i * Math.PI) / 8, ((i + 0.5) * Math.PI) / 8);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // Draw circular road
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#334155'; // road grey border
            ctx.lineWidth = roadWidth + 4;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#475569'; // road asphalt center
            ctx.lineWidth = roadWidth;
            ctx.stroke();

            // Draw dashed center white line
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 10]);
            ctx.stroke();
            ctx.restore();

            // Draw entry lane (forming a "9" shape tail like user graphic)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI * 0.7); // Tilted bottom tail
            ctx.fillStyle = '#475569';
            ctx.fillRect(-radius - roadWidth / 2, 40, roadWidth, 100);
            
            // Tail white center line
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-radius, 40);
            ctx.lineTo(-radius, 140);
            ctx.stroke();
            ctx.restore();

            // Draw Obstacles
            enemyCars.forEach(car => {
                const x = centerX + Math.cos(car.angle) * radius;
                const y = centerY + Math.sin(car.angle) * radius;
                // Car rotation angle is perpendicular to radius (tangent)
                const rot = car.angle + Math.PI / 2;
                drawCar(x, y, rot, car.color, false);
            });

            // Draw Player
            if (gameActive || Math.floor(Date.now() / 150) % 2 === 0) { // flashing effect on death
                const x = centerX + Math.cos(playerCar.angle) * radius;
                const y = centerY + Math.sin(playerCar.angle) * radius;
                const rot = playerCar.angle + Math.PI / 2;
                drawCar(x, y, rot, playerCar.color, true);
            }

            // Draw explosion particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        }

        // Loop Runner
        function loop() {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        }

        // Start button handler
        restartBtn.addEventListener('click', () => {
            initGame();
        });

        // Start initial state
        initGame();
        loop();

        // Cleanup on exit
        container.addEventListener('game-exit', () => {
            cancelAnimationFrame(animationFrameId);
            gameActive = false;
        });
    };
})();
