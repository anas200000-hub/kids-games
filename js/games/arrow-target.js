// Game: Arrow Target (قناص السهام)
(function() {
    window.initArrowTargetGame = function(container) {
        let canvas, ctx;
        let animationFrameId;
        let gameActive = true;
        let score = 0;
        let level = 1;
        let arrowsToShoot = 7; // Number of arrows player must shoot to win
        let arrowsShot = [];   // Array of angles where arrows are stuck in the target

        // Target Board parameters
        const targetX = 190;
        const targetY = 140;
        const targetRadius = 55;
        let targetAngle = 0;
        let rotateSpeed = 0.022; // Speed of log rotation

        // Bow & Active Flying Arrow
        const bowX = targetX;
        const bowY = 320;
        let flyingArrow = null; // {x, y, speed}

        let particles = [];
        let screenShake = 0;

        // HTML Layout Setup
        let html = `
            <div class="game-arrow-target-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: ltr; background: linear-gradient(to bottom, #FFFDE7 0%, #FFF59D 100%); border-radius: 20px; padding: 10px; overflow: hidden; position: relative;">
                <h2 class="game-title" style="color: #4E342E; margin-bottom: 6px; font-weight: 900;">🏹 قناص السهام 🏹</h2>
                <p style="font-size: 0.75rem; color: #6D4C41; margin: 0 0 8px; text-align: center;">انقر على الشاشة لإطلاق السهم! تفادى ضرب السهام الأخرى المثبتة!</p>
                
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 6px 12px; background: rgba(255,255,255,0.4); border-radius: 12px; margin-bottom: 8px; box-sizing: border-box; border: 1.5px solid rgba(255,255,255,0.65);">
                    <div style="font-weight: bold; color: #4E342E; font-size: 14px;">المستوى Level: <span id="atLevel">1</span></div>
                    <div style="font-weight: bold; color: #D84315; font-size: 14px;">السهام المتبقية: <span id="atProgress">7</span></div>
                </div>

                <div style="position: relative; background: #FFF9C4; border-radius: 24px; border: 4px solid #D84315; box-shadow: 0 8px 16px rgba(0,0,0,0.15); width: 380px; height: 380px; box-sizing: border-box; overflow: hidden;">
                    <canvas id="atCanvas" width="372" height="372" style="display: block; border-radius: 20px;"></canvas>
                </div>

                <!-- Bow area indicator -->
                <div style="font-size: 12px; color: #6D4C41; margin-top: 10px; font-weight: bold; text-align: center;">انقر لإطلاق السهم!</div>

                <!-- Win/Fail Modals -->
                <div id="atWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); z-index: 10; align-items: center; justify-content: center; border-radius: 20px;">
                    <div class="modal-content bounce-anim" style="background: #FFF; border: 4px solid #4CAF50; border-radius: 25px; padding: 25px; text-align: center; max-width: 290px; color: #333;">
                        <h3 style="color: #4CAF50; font-size: 22px; margin-bottom: 8px;">🎯 قناص رائع! 🎯</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">لقد أصبت الهدف بجميع السهام بنجاح!</p>
                        <button class="menu-btn restart-btn" id="atNextBtn" style="background: #4CAF50; color: white; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; border: none; box-shadow: 0 4px 0 #2E7D32;">المستوى التالي ➡️</button>
                    </div>
                </div>

                <div id="atFailModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); z-index: 10; align-items: center; justify-content: center; border-radius: 20px;">
                    <div class="modal-content bounce-anim" style="background: #FFF; border: 4px solid #F44336; border-radius: 25px; padding: 25px; text-align: center; max-width: 290px; color: #333;">
                        <h3 style="color: #F44336; font-size: 22px; margin-bottom: 8px;">💥 تحطم السهم! 💥</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">لقد ضربت سهماً معلقاً بالهدف!</p>
                        <button class="menu-btn restart-btn" id="atRestartBtn" style="background: #F44336; color: white; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; border: none; box-shadow: 0 4px 0 #D32F2F;">إعادة المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        canvas = document.getElementById('atCanvas');
        ctx = canvas.getContext('2d');
        const progressEl = document.getElementById('atProgress');
        const levelEl = document.getElementById('atLevel');
        const winModal = document.getElementById('atWinModal');
        const failModal = document.getElementById('atFailModal');
        const nextBtn = document.getElementById('atNextBtn');
        const restartBtn = document.getElementById('atRestartBtn');

        // Setup Level state
        function startLevel() {
            gameActive = true;
            targetAngle = 0;
            flyingArrow = null;
            particles = [];
            screenShake = 0;

            // Target arrow count and speeds
            arrowsToShoot = 6 + level;
            rotateSpeed = 0.02 + level * 0.007; // Speed increase per level
            
            // Randomly reverse direction on higher levels
            if (level > 2 && Math.random() > 0.5) {
                rotateSpeed *= -1;
            }

            // Pre-place a few arrows on target depending on level difficulty
            arrowsShot = [];
            const prePlacedCount = Math.min(level - 1, 3);
            for (let i = 0; i < prePlacedCount; i++) {
                const randomAngle = (i * Math.PI * 2) / prePlacedCount + 0.5;
                arrowsShot.push({ relativeAngle: randomAngle });
            }

            levelEl.innerText = level;
            progressEl.innerText = arrowsToShoot;

            winModal.style.display = 'none';
            failModal.style.display = 'none';
        }

        // Particle sparks on collision
        function spawnSparks(x, y, color) {
            for (let i = 0; i < 12; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 + (flyingArrow ? -2 : 2),
                    color: color || '#FF3D00',
                    size: Math.random() * 3 + 2,
                    life: 1.0,
                    decay: Math.random() * 0.04 + 0.02
                });
            }
        }

        // Trigger Arrow Shoot
        function shootArrow() {
            if (!gameActive || flyingArrow || arrowsToShoot <= 0) return;
            
            flyingArrow = {
                x: bowX,
                y: bowY,
                speed: 15 // Pixels per frame straight up
            };

            if (window.sound) {
                window.sound.playClick(); // Whizzing sound
            }
        }

        container.addEventListener('mousedown', shootArrow);
        container.addEventListener('touchstart', (e) => {
            shootArrow();
            e.preventDefault();
        }, { passive: false });

        // Update loop
        function update() {
            if (!gameActive) return;

            // Screen shake dampening
            if (screenShake > 0) screenShake -= 0.4;

            // Rotate Target Board
            targetAngle = (targetAngle + rotateSpeed) % (Math.PI * 2);

            // Update Flying Arrow
            if (flyingArrow) {
                flyingArrow.y -= flyingArrow.speed;

                // Check collision with the target log
                const distToCenter = Math.hypot(flyingArrow.x - targetX, flyingArrow.y - targetY);
                if (distToCenter <= targetRadius + 15) { // Arrow hit target boundary
                    const hitY = targetY + targetRadius;
                    
                    // Angle of impact relative to target's current rotation angle
                    const hitAngle = Math.PI / 2; // hitting directly from bottom (angle 90 deg)
                    const relativeAngle = (hitAngle - targetAngle + Math.PI * 2) % (Math.PI * 2);

                    // Check collision with other stuck arrows!
                    let collided = false;
                    for (let i = 0; i < arrowsShot.length; i++) {
                        const stuck = arrowsShot[i];
                        // Calculate difference between angles
                        const angleDiff = Math.abs(relativeAngle - stuck.relativeAngle) % (Math.PI * 2);
                        const angleWindow = 0.16; // Collision threshold in radians (~9 degrees)
                        if (angleDiff < angleWindow || angleDiff > Math.PI * 2 - angleWindow) {
                            collided = true;
                            break;
                        }
                    }

                    if (collided) {
                        // Fail! Arrow bounces off
                        gameActive = false;
                        spawnSparks(flyingArrow.x, flyingArrow.y - 12, '#EF4444');
                        spawnSparks(flyingArrow.x, flyingArrow.y - 12, '#FFE082');
                        screenShake = 6;
                        
                        if (window.sound) {
                            window.sound.playFail();
                        }

                        // Animate failing arrow bounce
                        let failArrow = { ...flyingArrow, vx: 3, vy: 5, grav: 0.5 };
                        flyingArrow = null;

                        setTimeout(() => {
                            failModal.style.display = 'flex';
                        }, 750);
                    } else {
                        // Success! Arrow sticks into the log
                        arrowsShot.push({ relativeAngle: relativeAngle });
                        flyingArrow = null;
                        arrowsToShoot--;
                        progressEl.innerText = arrowsToShoot;
                        screenShake = 3;

                        spawnSparks(targetX, targetY + targetRadius, '#8D6E63'); // brown splinters

                        if (window.sound) {
                            window.sound.playPop(); // Solid stick thwack
                        }

                        // Check Level Win
                        if (arrowsToShoot <= 0) {
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
            }

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

        // Draw arrow
        function drawArrow(x, y, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Shaft (Wooden stick)
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 36);
            ctx.stroke();

            // Arrow Tip (Metal triangle)
            ctx.fillStyle = '#CFD8DC';
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(-4, 2);
            ctx.lineTo(4, 2);
            ctx.closePath();
            ctx.fill();

            // Fletching (Red feathers)
            ctx.fillStyle = '#FF5252';
            ctx.fillRect(-3, 30, 2, 8);
            ctx.fillRect(1, 30, 2, 8);

            ctx.restore();
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

            // Clean background with radial rays
            ctx.fillStyle = '#FFFDE7';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Sunburst rays matching user graphic
            ctx.save();
            ctx.translate(targetX, targetY);
            ctx.fillStyle = 'rgba(255, 213, 79, 0.18)';
            for (let i = 0; i < 18; i++) {
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.arc(0, 0, 320, (i * Math.PI) / 9, ((i + 0.5) * Math.PI) / 9);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // Draw Bow at the bottom
            ctx.save();
            ctx.translate(bowX, bowY);
            ctx.strokeStyle = '#5D4037'; // Wood bow color
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 25, 30, Math.PI * 1.15, Math.PI * 1.85); // curved bow
            ctx.stroke();
            
            // Bowstring
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-24, 15);
            ctx.lineTo(24, 15);
            ctx.stroke();
            ctx.restore();

            // Draw Stuck Arrows (Rotate along with the target log!)
            arrowsShot.forEach(stuck => {
                // Absolute angle of the arrow
                const absAngle = targetAngle + stuck.relativeAngle;
                
                // Tip coordinates stuck on target surface
                const ax = targetX + Math.cos(absAngle) * targetRadius;
                const ay = targetY + Math.sin(absAngle) * targetRadius;

                // Arrow angle points outward from target center
                const arrowAngle = absAngle - Math.PI / 2;
                drawArrow(ax, ay, arrowAngle);
            });

            // Draw Target Board Log with concentric rings
            ctx.save();
            ctx.translate(targetX, targetY);
            ctx.rotate(targetAngle);

            // Main log background bark (wood brown)
            ctx.fillStyle = '#5D4037';
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius + 4, 0, Math.PI * 2);
            ctx.fill();

            // concentric rings (Red, Blue, Beige target rings matching user graphic)
            ctx.fillStyle = '#FFA726'; // Wood light rings
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FF5252'; // Outer Red Ring
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius - 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#29B6F6'; // Middle Blue Ring
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius - 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFF8E1'; // Inner Beige Center Ring
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius - 32, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FF5252'; // Inner Red Bullseye
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius - 44, 0, Math.PI * 2);
            ctx.fill();

            // Tiny wood cracks or rings indicator
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, targetRadius - 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            // Draw center score count in board log
            ctx.fillStyle = '#000';
            ctx.font = '900 18px var(--font-kids)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(arrowsToShoot, targetX, targetY);

            // Draw Ready Arrow in Bow
            if (!flyingArrow && arrowsToShoot > 0) {
                drawArrow(bowX, bowY - 18, 0);
            }

            // Draw Flying Arrow
            if (flyingArrow) {
                drawArrow(flyingArrow.x, flyingArrow.y, 0);
            }

            // Draw Particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        }

        // Loop Runner
        function loop() {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        }

        // Action button handlers
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
