// Game 33: Bird Hunting (صيد الطيور)
(function() {
    window.initBirdHuntingGame = function (container) {
        let score = 0;
        const targetScore = 10;
        let arrowsRemaining = 15;
        let gameActive = true;
        let animationId = null;

        let html = `
            <div class="game-hunt-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids);">
                <h2 class="game-title" style="color: #0288D1; margin-bottom: 8px;">🏹 صيد الطيور 🏹</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 10px;">
                    <div class="hud-score" style="font-weight: bold; color: #0288D1; font-size: 15px;">الطيور المصطادة: <span id="huntScore">0</span> / 10</div>
                    <div class="hud-arrows" style="font-weight: bold; color: #E53935; font-size: 15px;">السهام المتبقية: <span id="huntArrows">15</span> 🏹</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.15); border: 4px solid #FFF;">
                    <canvas id="huntCanvas" width="400" height="450" style="display: block; background: #E0F7FA; touch-action: none; cursor: crosshair;"></canvas>
                </div>
                <div id="huntSuccessModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 24px; margin-bottom: 10px;">🎉 بطل القوس والسهم! 🎉</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد اصطدت 10 طيور بمهارة عالية!</p>
                        <button class="menu-btn restart-btn" id="restartHuntWin" style="background: #4CAF50; color: #FFF; border: none; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
                <div id="huntFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 24px; margin-bottom: 10px;">😢 انتهت السهام! 😢</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">حاول التركيز والتصويب بدقة في المرة القادمة!</p>
                        <button class="menu-btn restart-btn" id="restartHuntFail" style="background: #E53935; color: #FFF; border: none; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #C62828; transition: transform 0.1s;">أعد المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('huntCanvas');
        const ctx = canvas.getContext('2d');

        const birdTemplates = [
            { char: '🐤', score: 1 },
            { char: '🦆', score: 1 },
            { char: '🐦', score: 1 },
            { char: '🕊️', score: 1 }
        ];

        const imageCache = {};
        birdTemplates.forEach(bird => {
            const img = new Image();
            img.src = window.getEmojiSVG(bird.char);
            imageCache[bird.char] = img;
        });

        // Game objects
        let birds = [];
        let arrows = [];
        let feathers = [];
        let clouds = [
            { x: 50, y: 40, size: 50, speed: 0.2 },
            { x: 220, y: 70, size: 70, speed: 0.15 },
            { x: 340, y: 30, size: 40, speed: 0.25 }
        ];

        // Bow definition
        const bowPos = { x: canvas.width / 2, y: canvas.height - 45 };
        let aimAngle = -Math.PI / 2; // Point straight up initially
        let isAiming = false;

        function spawnBird() {
            const template = birdTemplates[Math.floor(Math.random() * birdTemplates.length)];
            const fromLeft = Math.random() < 0.5;
            
            return {
                x: fromLeft ? -40 : canvas.width + 40,
                y: Math.random() * 180 + 50, // Between y=50 and y=230
                size: 38,
                char: template.char,
                speed: (Math.random() * 1.5 + 1.2) * (fromLeft ? 1 : -1),
                wobbleSpeed: Math.random() * 0.05 + 0.02,
                wobbleAmplitude: Math.random() * 1.2 + 0.5,
                angleOffset: Math.random() * Math.PI,
                isFalling: false,
                fallSpeedY: 0,
                fallRot: 0,
                rotDir: Math.random() < 0.5 ? -0.1 : 0.1
            };
        }

        function createFeathers(x, y, colorHex) {
            const count = 6 + Math.floor(Math.random() * 5);
            const colors = ['#FFF', '#FFD54F', '#81C784', '#64B5F6', '#E0E0E0'];
            for (let i = 0; i < count; i++) {
                feathers.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.8) * 3,
                    size: Math.random() * 6 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.015
                });
            }
        }

        // Initialize lists
        birds.push(spawnBird());
        let lastBirdSpawn = 0;

        function update(timestamp) {
            if (!gameActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Sky background
            let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#B3E5FC'); // Soft light blue
            skyGrad.addColorStop(0.6, '#E0F7FA');
            skyGrad.addColorStop(1, '#FFF9C4'); // Yellowish near ground
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            clouds.forEach(c => {
                c.x += c.speed;
                if (c.x > canvas.width + 60) c.x = -60;
                
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size * 0.4, 0, Math.PI * 2);
                ctx.arc(c.x + c.size * 0.25, c.y - c.size * 0.15, c.size * 0.4, 0, Math.PI * 2);
                ctx.arc(c.x + c.size * 0.5, c.y, c.size * 0.35, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Meadows (Grass hills) at bottom
            ctx.fillStyle = '#C8E6C9';
            ctx.beginPath();
            ctx.ellipse(100, canvas.height + 50, 250, 100, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#A5D6A7';
            ctx.beginPath();
            ctx.ellipse(300, canvas.height + 60, 200, 100, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw Ground grass border
            ctx.fillStyle = '#81C784';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

            // Spawn birds
            if (timestamp - lastBirdSpawn > 1800 && birds.filter(b => !b.isFalling).length < 3) {
                birds.push(spawnBird());
                lastBirdSpawn = timestamp;
            }

            // Draw and update Feathers
            for (let i = feathers.length - 1; i >= 0; i--) {
                const f = feathers[i];
                f.x += f.vx;
                f.y += f.vy;
                f.vy += 0.08; // Gravity on feathers
                f.alpha -= f.decay;

                if (f.alpha <= 0) {
                    feathers.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = f.alpha;
                ctx.fillStyle = f.color;
                ctx.beginPath();
                // Draw a simple feather shape (ellipse)
                ctx.ellipse(f.x, f.y, f.size, f.size * 0.4, Math.atan2(f.vy, f.vx), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Draw and update Birds
            for (let i = birds.length - 1; i >= 0; i--) {
                const b = birds[i];

                if (b.isFalling) {
                    b.fallSpeedY += 0.4;
                    b.y += b.fallSpeedY;
                    b.x += b.speed * 0.3; // drift slightly while falling
                    b.fallRot += b.rotDir;

                    if (b.y > canvas.height + 40) {
                        birds.splice(i, 1);
                        continue;
                    }

                    // Render falling bird
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    ctx.rotate(b.fallRot);
                    
                    const img = imageCache[b.char];
                    if (img && img.complete && img.naturalWidth !== 0) {
                        ctx.drawImage(img, -b.size / 2, -b.size / 2, b.size, b.size);
                    } else {
                        ctx.font = `${b.size}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(b.char, 0, 0);
                    }
                    ctx.restore();
                } else {
                    // Normal flight
                    b.x += b.speed;
                    b.y += Math.sin(timestamp * b.wobbleSpeed + b.angleOffset) * b.wobbleAmplitude;

                    // Border check
                    if ((b.speed > 0 && b.x > canvas.width + 50) || (b.speed < 0 && b.x < -50)) {
                        birds.splice(i, 1);
                        continue;
                    }

                    // Render flying bird
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    // Flip bird horizontal based on flight direction
                    if (b.speed > 0) {
                        ctx.scale(-1, 1);
                    }
                    const img = imageCache[b.char];
                    if (img && img.complete && img.naturalWidth !== 0) {
                        ctx.drawImage(img, -b.size / 2, -b.size / 2, b.size, b.size);
                    } else {
                        ctx.font = `${b.size}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(b.char, 0, 0);
                    }
                    ctx.restore();
                }
            }

            // Draw and update Arrows
            for (let i = arrows.length - 1; i >= 0; i--) {
                const arrow = arrows[i];
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;

                // Off-screen check
                if (arrow.y < -30 || arrow.x < -30 || arrow.x > canvas.width + 30) {
                    arrows.splice(i, 1);
                    if (arrowsRemaining <= 0 && arrows.length === 0 && score < targetScore) {
                        failGame();
                    }
                    continue;
                }

                // Collision with birds
                let hitAny = false;
                for (let j = 0; j < birds.length; j++) {
                    const b = birds[j];
                    if (b.isFalling) continue;

                    // Simple circular distance check between arrow tip and bird center
                    const dx = arrow.x - b.x;
                    const dy = arrow.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < (b.size / 2 + 10)) {
                        // HIT!
                        b.isFalling = true;
                        b.fallSpeedY = -3; // slight pop up when hit
                        createFeathers(b.x, b.y);
                        
                        score++;
                        document.getElementById('huntScore').innerText = score;
                        if (window.sound) {
                            window.sound.playPop();
                        }

                        hitAny = true;
                        arrows.splice(i, 1);

                        if (score >= targetScore) {
                            winGame();
                        }
                        break;
                    }
                }

                if (hitAny) continue;

                // Render arrow
                ctx.save();
                ctx.translate(arrow.x, arrow.y);
                ctx.rotate(arrow.angle);
                
                // Wooden arrow stick
                ctx.strokeStyle = '#795548';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-25, 0);
                ctx.lineTo(5, 0);
                ctx.stroke();

                // Golden arrow tip
                ctx.fillStyle = '#FFD54F';
                ctx.beginPath();
                ctx.moveTo(5, -5);
                ctx.lineTo(15, 0);
                ctx.lineTo(5, 5);
                ctx.closePath();
                ctx.fill();

                // Feathers at back
                ctx.fillStyle = '#ECEFF1';
                ctx.beginPath();
                ctx.moveTo(-25, 0);
                ctx.lineTo(-30, -5);
                ctx.lineTo(-20, 0);
                ctx.lineTo(-30, 5);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }

            // Draw Aiming Guide Line (if dragging/aiming)
            if (isAiming && arrowsRemaining > 0) {
                ctx.save();
                ctx.strokeStyle = 'rgba(2, 136, 209, 0.4)';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(bowPos.x, bowPos.y);
                ctx.lineTo(bowPos.x + Math.cos(aimAngle) * 120, bowPos.y + Math.sin(aimAngle) * 120);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Bow & Arrow at bottom center
            ctx.save();
            ctx.translate(bowPos.x, bowPos.y);
            ctx.rotate(aimAngle);

            // Draw bow arc (wooden)
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, 0, 32, -Math.PI / 2.2, Math.PI / 2.2);
            ctx.stroke();

            // Draw bowstring (elastic white line)
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const bowstringX = 32 * Math.cos(-Math.PI / 2.2);
            const bowstringY = 32 * Math.sin(-Math.PI / 2.2);
            ctx.moveTo(bowstringX, bowstringY);
            ctx.lineTo(bowstringX, -bowstringY);
            ctx.stroke();

            // Draw loaded arrow if we have ammo
            if (arrowsRemaining > 0) {
                ctx.strokeStyle = '#795548';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(25, 0);
                ctx.stroke();

                ctx.fillStyle = '#FFD54F';
                ctx.beginPath();
                ctx.moveTo(25, -4);
                ctx.lineTo(33, 0);
                ctx.lineTo(25, 4);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();

            animationId = requestAnimationFrame(update);
        }

        function winGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playSuccess();
            }
            document.getElementById('huntSuccessModal').style.display = 'flex';
        }

        function failGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playFail();
            }
            document.getElementById('huntFailModal').style.display = 'flex';
        }

        function resetGame() {
            score = 0;
            arrowsRemaining = 15;
            birds = [];
            arrows = [];
            feathers = [];
            
            document.getElementById('huntScore').innerText = score;
            document.getElementById('huntArrows').innerText = arrowsRemaining;
            document.getElementById('huntSuccessModal').style.display = 'none';
            document.getElementById('huntFailModal').style.display = 'none';
            
            gameActive = true;
            birds.push(spawnBird());
            lastBirdSpawn = performance.now();
            update(lastBirdSpawn);
        }

        function updateAim(clientX, clientY) {
            if (!gameActive || arrowsRemaining <= 0) return;
            const rect = canvas.getBoundingClientRect();
            // Calculate coordinates relative to canvas
            const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
            const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

            const dx = canvasX - bowPos.x;
            const dy = canvasY - bowPos.y;
            
            // Constrain aiming angle to sky-facing directions (mainly negative Y)
            let angle = Math.atan2(dy, dx);
            if (angle > -0.15 && angle < Math.PI / 2) {
                angle = -0.15;
            } else if (angle < -Math.PI + 0.15 || angle >= Math.PI / 2) {
                angle = -Math.PI + 0.15;
            }
            
            aimAngle = angle;
        }

        function fireArrow() {
            if (!gameActive || arrowsRemaining <= 0) return;
            
            const speed = 10;
            arrows.push({
                x: bowPos.x,
                y: bowPos.y,
                vx: Math.cos(aimAngle) * speed,
                vy: Math.sin(aimAngle) * speed,
                angle: aimAngle
            });

            arrowsRemaining--;
            document.getElementById('huntArrows').innerText = arrowsRemaining;

            if (window.sound) {
                window.sound.playFlip();
            }
        }

        // Pointer controls
        canvas.addEventListener('mousedown', (e) => {
            isAiming = true;
            updateAim(e.clientX, e.clientY);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isAiming) {
                updateAim(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isAiming) {
                isAiming = false;
                fireArrow();
            }
        });

        // Touch controls
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isAiming = true;
            updateAim(e.touches[0].clientX, e.touches[0].clientY);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isAiming) {
                updateAim(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        canvas.addEventListener('touchend', () => {
            if (isAiming) {
                isAiming = false;
                fireArrow();
            }
        });

        // Reset buttons
        document.getElementById('restartHuntWin').addEventListener('click', resetGame);
        document.getElementById('restartHuntFail').addEventListener('click', resetGame);

        // Start
        resetGame();

        // Clean up on exit
        container.addEventListener('game-exit', () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
        });
    };
})();
