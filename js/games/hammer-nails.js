// Game: Hammer Nails (مطرقة المسامير)
(function() {
    window.initHammerNailsGame = function(container) {
        let canvas, ctx;
        let animationFrameId;
        let gameActive = true;
        let score = 0;
        let levelNailsHit = 0;
        const targetNails = 5; // Hit 5 nails to win/advance level
        let speed = 1.0;       // Plank sliding speed (تقليل السرعة إلى النصف)
        let level = 1;

        // Wooden board plank position
        const plankY = 280;
        const plankHeight = 50;

        // Hammer position & state
        const hammerX = 120;
        const hammerY = plankY - 20;
        let hammerAngle = -Math.PI / 4; // Angle: -45 degrees (idle resting position)
        let isSwinging = false;
        let swingPhase = 0; // 0 = idle, 1 = swinging down, 2 = returning

        // Nails list (x coordinate relative to scrolling, height)
        let nails = [];
        let particles = [];
        let screenShake = 0;

        // HTML Layout Setup
        let html = `
            <div class="game-hammer-nails-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: ltr; background: linear-gradient(to bottom, #FFF9C4 0%, #FBC02D 100%); border-radius: 20px; padding: 10px; overflow: hidden; position: relative;">
                <h2 class="game-title" style="color: #5D4037; margin-bottom: 6px; font-weight: 900;">🔨 مطرقة المسامير 🔨</h2>
                <p style="font-size: 0.75rem; color: #795548; margin: 0 0 8px; text-align: center;">اضغط على الشاشة في اللحظة المناسبة لتطرق المسمار في الخشب!</p>
                
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 6px 12px; background: rgba(255,255,255,0.25); border-radius: 12px; margin-bottom: 8px; box-sizing: border-box; border: 1.5px solid rgba(255,255,255,0.4);">
                    <div style="font-weight: bold; color: #5D4037; font-size: 14px;">المستوى Level: <span id="hnLevel">1</span></div>
                    <div style="font-weight: bold; color: #1565C0; font-size: 14px;">المسامير: <span id="hnProgress">0/5</span></div>
                </div>

                <div style="position: relative; background: #FFFFFF; border-radius: 24px; border: 4px solid #B0BEC5; box-shadow: 0 8px 16px rgba(0,0,0,0.1); width: 380px; height: 380px; box-sizing: border-box; overflow: hidden;">
                    <canvas id="hnCanvas" width="372" height="372" style="display: block; border-radius: 20px; background: #FFFFFF;"></canvas>
                </div>

                <!-- Touch target message -->
                <div style="font-size: 12px; color: #795548; margin-top: 10px; font-weight: bold; text-align: center;">انقر هنا للطرق بالشاكوش!</div>

                <!-- Win/Fail Modals -->
                <div id="hnWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10; align-items: center; justify-content: center; border-radius: 20px;">
                    <div class="modal-content bounce-anim" style="background: #FFF; border: 4px solid #4CAF50; border-radius: 25px; padding: 25px; text-align: center; max-width: 290px; color: #333;">
                        <h3 style="color: #4CAF50; font-size: 22px; margin-bottom: 8px;">🎉 أحسنت يا بطل! 🎉</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">لقد طرقت جميع المسامير بنجاح مذهل!</p>
                        <button class="menu-btn restart-btn" id="hnNextBtn" style="background: #4CAF50; color: white; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; border: none; box-shadow: 0 4px 0 #2E7D32;">المستوى التالي ➡️</button>
                    </div>
                </div>

                <div id="hnFailModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10; align-items: center; justify-content: center; border-radius: 20px;">
                    <div class="modal-content bounce-anim" style="background: #FFF; border: 4px solid #F44336; border-radius: 25px; padding: 25px; text-align: center; max-width: 290px; color: #333;">
                        <h3 style="color: #F44336; font-size: 22px; margin-bottom: 8px;">😢 لقد أخطأت الهدف! 😢</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">حاول التركيز وطرق المسامير فقط!</p>
                        <button class="menu-btn restart-btn" id="hnRestartBtn" style="background: #F44336; color: white; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; border: none; box-shadow: 0 4px 0 #D32F2F;">إعادة المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        canvas = document.getElementById('hnCanvas');
        ctx = canvas.getContext('2d');
        const progressEl = document.getElementById('hnProgress');
        const levelEl = document.getElementById('hnLevel');
        const winModal = document.getElementById('hnWinModal');
        const failModal = document.getElementById('hnFailModal');
        const nextBtn = document.getElementById('hnNextBtn');
        const restartBtn = document.getElementById('hnRestartBtn');

        // Spawns a nail far off to the right
        function spawnNail(startX) {
            nails.push({
                x: startX,
                status: 'up', // 'up', 'hit', 'missed'
                height: 38,
                currentHeight: 38 // animates down to 5 when hit
            });
        }

        // Initialize Level
        function startLevel() {
            gameActive = true;
            levelNailsHit = 0;
            isSwinging = false;
            swingPhase = 0;
            hammerAngle = -Math.PI / 4;
            nails = [];
            particles = [];
            screenShake = 0;

            levelEl.innerText = level;
            progressEl.innerText = `0/${targetNails}`;

            winModal.style.display = 'none';
            failModal.style.display = 'none';

            // Increase speed based on level (reduced to half)
            speed = 1.0 + level * 0.22;

            // Pre-spawn first few nails
            for (let i = 0; i < targetNails; i++) {
                spawnNail(300 + i * 160);
            }
        }

        // Particle sparks on nail hit
        function spawnSparks(x, y, color) {
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.8) * 6 - 2,
                    color: color || '#2196F3',
                    size: Math.random() * 3 + 2,
                    life: 1.0,
                    decay: Math.random() * 0.05 + 0.03
                });
            }
        }

        // Swing Hammer triggered by screen tap
        function swingHammer() {
            if (!gameActive || isSwinging) return;
            isSwinging = true;
            swingPhase = 1; // Downward swing
        }

        container.addEventListener('mousedown', swingHammer);
        container.addEventListener('touchstart', (e) => {
            swingHammer();
            e.preventDefault();
        }, { passive: false });

        // Update loop
        function update() {
            if (!gameActive) return;

            // Screen shake dampening
            if (screenShake > 0) {
                screenShake -= 0.5;
            }

            // Move nails on the plank
            nails.forEach(nail => {
                nail.x -= speed;

                // Check if a nail passes the screen without being hit
                if (nail.x < hammerX - 30 && nail.status === 'up') {
                    // Let it pass, but if the level ends, fail
                    nail.status = 'missed';
                    gameActive = false;
                    setTimeout(() => {
                        if (window.sound) {
                            window.sound.playFail();
                        }
                        failModal.style.display = 'flex';
                    }, 600);
                }
            });

            // Hammer Swing Physics
            if (isSwinging) {
                if (swingPhase === 1) {
                    hammerAngle += 0.22; // Swing down fast
                    if (hammerAngle >= 0) {
                        hammerAngle = 0;
                        swingPhase = 2; // Impact and return
                        checkImpact();
                    }
                } else if (swingPhase === 2) {
                    hammerAngle -= 0.09; // Return slowly
                    if (hammerAngle <= -Math.PI / 4) {
                        hammerAngle = -Math.PI / 4;
                        isSwinging = false;
                        swingPhase = 0;
                    }
                }
            }

            // Animate nails being driven down
            nails.forEach(nail => {
                if (nail.status === 'hit' && nail.currentHeight > 5) {
                    nail.currentHeight -= 8;
                    if (nail.currentHeight < 5) nail.currentHeight = 5;
                }
            });

            // Update particles
            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life -= p.decay;
                if (p.life <= 0) {
                    particles.splice(idx, 1);
                }
            });
        }

        // Check if hammer hit any nail during impact
        function checkImpact() {
            let hitAny = false;
            
            nails.forEach(nail => {
                if (nail.status === 'up') {
                    // Check horizontal distance
                    const dist = Math.abs(nail.x - hammerX);
                    if (dist < 18) { // Perfect hit window
                        nail.status = 'hit';
                        hitAny = true;
                        levelNailsHit++;
                        progressEl.innerText = `${levelNailsHit}/${targetNails}`;
                        screenShake = 6;

                        spawnSparks(nail.x, plankY - nail.currentHeight, '#FFD54F');
                        spawnSparks(nail.x, plankY - nail.currentHeight, '#2196F3');

                        if (window.sound) {
                            window.sound.playClick();
                        }

                        // Check Win
                        if (levelNailsHit >= targetNails) {
                            gameActive = false;
                            setTimeout(() => {
                                if (window.sound) {
                                    window.sound.playSuccess();
                                }
                                winModal.style.display = 'flex';
                            }, 500);
                        }
                    }
                }
            });

            // If swung and missed
            if (!hitAny) {
                // If they hit nothing, play a dull thud or show miss error
                if (window.sound) {
                    window.sound.playClick();
                }
                screenShake = 2;
                spawnSparks(hammerX, plankY, '#8D6E63'); // brown dust sparks
            }
        }

        // Render Canvas layout
        function draw() {
            ctx.save();
            // Apply screen shake
            if (screenShake > 0) {
                const dx = (Math.random() - 0.5) * screenShake;
                const dy = (Math.random() - 0.5) * screenShake;
                ctx.translate(dx, dy);
            }

            // Draw clean pure white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Wooden Board Plank
            ctx.fillStyle = '#A1887F';
            ctx.fillRect(0, plankY, canvas.width, plankHeight);
            
            // Wooden texture lines
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, plankY + 12);
            ctx.lineTo(canvas.width, plankY + 12);
            ctx.moveTo(0, plankY + 36);
            ctx.lineTo(canvas.width, plankY + 36);
            ctx.stroke();

            // Draw Nails
            nails.forEach(nail => {
                // Draw nail body
                ctx.fillStyle = '#2196F3'; // Blue nail matching user graphic
                ctx.fillRect(nail.x - 3, plankY - nail.currentHeight, 6, nail.currentHeight);

                // Draw nail head
                ctx.fillRect(nail.x - 8, plankY - nail.currentHeight, 16, 4);

                // If hit, draw sparks glow
                if (nail.status === 'hit') {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#FFD54F';
                    ctx.beginPath();
                    ctx.arc(nail.x, plankY, 12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            // Draw Clean, Proportionate Cartoon Hammer
            ctx.save();
            // The hammer pivots from its handle base (back end)
            // Idle angle is tilted back (-45 deg), striking angle hits flat down onto the nail at hammerX
            ctx.translate(hammerX - 85, hammerY);
            ctx.rotate(hammerAngle);

            // 1. Grip Cap (Bottom of handle)
            ctx.fillStyle = '#4E342E';
            ctx.beginPath();
            ctx.roundRect(-4, -6.5, 14, 13, 4);
            ctx.fill();

            // 2. Rubber Grip
            ctx.fillStyle = '#6D4C41';
            ctx.beginPath();
            ctx.roundRect(8, -6, 28, 12, 3);
            ctx.fill();

            // Grip ridges
            ctx.fillStyle = '#4E342E';
            for (let gx = 13; gx <= 31; gx += 5) {
                ctx.fillRect(gx, -5.5, 2, 11);
            }

            // 3. Wooden Shaft (straight, centered)
            ctx.fillStyle = '#A16B58';
            ctx.beginPath();
            ctx.roundRect(34, -5, 52, 10, 2);
            ctx.fill();

            // Wood highlight streak
            ctx.fillStyle = '#BCAAA4';
            ctx.fillRect(36, -3, 48, 2.5);

            // 4. Steel Collar / Neck (where handle enters hammer head)
            ctx.fillStyle = '#37474F';
            ctx.beginPath();
            ctx.roundRect(82, -5.5, 8, 11, 2);
            ctx.fill();

            // 5. Steel Hammer Head (Positioned at x = 90) - Dark Cast Steel
            // Head Eye / Central Socket
            ctx.fillStyle = '#455A64';
            ctx.beginPath();
            ctx.roundRect(86, -11, 14, 22, 3);
            ctx.fill();

            // Striking Neck & Face (Pointing Downwards toward the nail: y > 0)
            // Striking neck
            ctx.fillStyle = '#546E7A';
            ctx.beginPath();
            ctx.roundRect(87.5, 10, 11, 8, 2);
            ctx.fill();

            // Striking Face (the impact surface that hits the nail head)
            ctx.fillStyle = '#78909C';
            ctx.beginPath();
            ctx.roundRect(85.5, 18, 15, 6, 2.5);
            ctx.fill();

            // Striking face highlight
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(87, 19, 12, 2);

            // 6. Curved Claw (Back of the head: y < 0, curving upwards/backwards)
            ctx.fillStyle = '#37474F';
            ctx.beginPath();
            ctx.moveTo(86, -10);
            ctx.quadraticCurveTo(84, -26, 70, -28); // Curve outward/back
            ctx.quadraticCurveTo(80, -23, 91, -16);
            ctx.lineTo(100, -10);
            ctx.closePath();
            ctx.fill();

            // Claw highlight
            ctx.strokeStyle = '#90A4AE';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(87, -11);
            ctx.quadraticCurveTo(85, -25, 72, -27);
            ctx.stroke();

            // Steel central socket highlight
            ctx.fillStyle = '#78909C';
            ctx.fillRect(89, -8, 8, 2.5);

            ctx.restore();

            // Draw Sparks Particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        }

        // Frame Runner loop
        function loop() {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        }

        // Action Modals handlers
        nextBtn.addEventListener('click', () => {
            level++;
            startLevel();
        });

        restartBtn.addEventListener('click', () => {
            startLevel();
        });

        startLevel();
        loop();

        container.addEventListener('game-exit', () => {
            cancelAnimationFrame(animationFrameId);
            gameActive = false;
        });
    };
})();
