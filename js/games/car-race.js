// Game 38: Road Racer (سباق السيارات - كلاسيكي)
(function() {
    window.initCarRaceGame = function(container) {
        let score = 0;
        let gameActive = true;
        let animationId = null;
        let speed = 4;
        let frameCount = 0;
        let gameOver = false;

        const CANVAS_W = 400;
        const CANVAS_H = 480;
        const ROAD_LEFT = 40;
        const ROAD_RIGHT = CANVAS_W - 40;
        const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
        const CAR_W = 36;
        const CAR_H = 60;
        const ENEMY_W = 36;
        const ENEMY_H = 60;

        // Player state
        let playerX = CANVAS_W / 2;
        const playerY = CANVAS_H - 90;
        let targetX = playerX;
        let isDragging = false;
        let lives = 3;
        let isInvincible = false;
        let invincibleTimer = 0;

        // Enemies & Stars
        let enemies = [];
        let stars = [];
        let roadOffset = 0;
        let passedCars = 0;
        let starsCollected = 0;

        // Joystick Area (the control rectangle)
        let joystickActive = false;
        let joystickX = 200; // center of joystick panel
        let joystickY = 75; // center of joystick panel
        let joystickRadius = 30; // size of the control dot

        let html = `
            <div class="game-car-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none;">
                <h2 class="game-title" style="color: #00C853; margin-bottom: 4px; font-weight: 900; width: 100%;">🏎️ Road Racer 🏎️</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 8px; direction: ltr;">
                    <div style="font-weight: bold; color: #00C853; font-size: 15px;">🏆 <span id="raceScore">0</span></div>
                    <div style="font-weight: bold; color: #FFD600; font-size: 15px;">⭐ <span id="raceStars">0</span></div>
                    <div id="raceLives" style="font-weight: bold; color: #E53935; font-size: 15px;">❤️❤️❤️</div>
                    <div style="font-weight: bold; color: #FF6D00; font-size: 15px;">⚡ <span id="raceSpeed">1</span></div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.25); border: 3px solid #333; width: 100%;">
                    <canvas id="raceCanvas" width="${CANVAS_W}" height="${CANVAS_H}" style="display: block; background: #555; touch-action: none; cursor: pointer; width: 100%; height: auto;"></canvas>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin-top: 8px; width: 100%;">
                    <div style="font-size: 11px; color: #757575; font-weight: bold; margin-bottom: 2px;">حرك إصبعك داخل المستطيل للتوجيه 👇</div>
                    <canvas id="joystickArea" width="400" height="150" style="display: block; background: #FFF; border: 3px dashed #BDBDBD; border-radius: 16px; touch-action: none; cursor: grab; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); width: 100%; height: auto;"></canvas>
                </div>

                <div id="raceFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 26px; margin-bottom: 10px;">💥 GAME OVER 💥</h3>
                        <p style="font-size: 18px; margin-bottom: 5px; color: #555;">النقاط: <span id="raceFinalScore" style="font-weight: bold; color: #E53935; font-size: 22px;">0</span></p>
                        <p style="font-size: 14px; margin-bottom: 5px; color: #888;">⭐ النجوم: <span id="raceFinalStars" style="font-weight: bold;">0</span></p>
                        <p style="font-size: 14px; margin-bottom: 20px; color: #888;">🚗 السيارات المتجاوزة: <span id="raceFinalPassed" style="font-weight: bold;">0</span></p>
                        <button class="menu-btn restart-btn" id="restartRace" style="background: linear-gradient(135deg, #11998E, #38EF7D); color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #0d7a70; transition: transform 0.1s;">أعد المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('raceCanvas');
        const ctx = canvas.getContext('2d');
        const joyCanvas = document.getElementById('joystickArea');
        const joyCtx = joyCanvas.getContext('2d');

        // Colors for enemy cars
        const enemyColors = ['#E53935', '#1E88E5', '#FDD835', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1'];

        // ============ JOYSTICK AREA DRAWING ============
        function drawJoystick() {
            joyCtx.clearRect(0, 0, joyCanvas.width, joyCanvas.height);

            // Draw horizontal track line
            joyCtx.beginPath();
            joyCtx.moveTo(20, joyCanvas.height / 2);
            joyCtx.lineTo(joyCanvas.width - 20, joyCanvas.height / 2);
            joyCtx.strokeStyle = '#E0E0E0';
            joyCtx.lineWidth = 12;
            joyCtx.lineCap = 'round';
            joyCtx.stroke();

            // Draw inner active track highlights
            joyCtx.beginPath();
            joyCtx.moveTo(30, joyCanvas.height / 2);
            joyCtx.lineTo(joyCanvas.width - 30, joyCanvas.height / 2);
            joyCtx.strokeStyle = '#EEEEEE';
            joyCtx.lineWidth = 6;
            joyCtx.stroke();

            // Draw the draggable handle knob
            joyCtx.save();
            joyCtx.translate(joystickX, joystickY);

            // Knob shadow
            joyCtx.beginPath();
            joyCtx.arc(1, 2, joystickRadius, 0, Math.PI * 2);
            joyCtx.fillStyle = 'rgba(0,0,0,0.15)';
            joyCtx.fill();

            // Knob body
            const knobGrad = joyCtx.createRadialGradient(-3, -3, 2, 0, 0, joystickRadius);
            knobGrad.addColorStop(0, '#64B5F6');
            knobGrad.addColorStop(0.8, '#1E88E5');
            knobGrad.addColorStop(1, '#1565C0');
            joyCtx.beginPath();
            joyCtx.arc(0, 0, joystickRadius, 0, Math.PI * 2);
            joyCtx.fillStyle = knobGrad;
            joyCtx.fill();

            // Grip ridges
            joyCtx.beginPath();
            joyCtx.arc(0, 0, 10, 0, Math.PI * 2);
            joyCtx.strokeStyle = 'rgba(255,255,255,0.4)';
            joyCtx.lineWidth = 2;
            joyCtx.stroke();

            joyCtx.restore();
        }

        // ============ JOYSTICK INTERACTION ============
        function joystickInteraction(clientX, action) {
            const rect = joyCanvas.getBoundingClientRect();
            let x = clientX - rect.left;

            if (action === 'start') {
                joystickActive = true;
                joyCanvas.style.cursor = 'grabbing';
                joystickX = Math.max(30, Math.min(joyCanvas.width - 30, x));
            } else if (action === 'move' && joystickActive) {
                joystickX = Math.max(30, Math.min(joyCanvas.width - 30, x));

                const usableWidth = joyCanvas.width - 60;
                const ratio = (joystickX - 30) / usableWidth; // 0 to 1
                targetX = ROAD_LEFT + (CAR_W / 2) + ratio * (ROAD_WIDTH - CAR_W - 10);
            } else if (action === 'end') {
                joystickActive = false;
                joyCanvas.style.cursor = 'grab';
            }
        }

        // Mouse events on joystick
        joyCanvas.addEventListener('mousedown', (e) => joystickInteraction(e.clientX, 'start'));
        window.addEventListener('mousemove', (e) => { if (joystickActive) joystickInteraction(e.clientX, 'move'); });
        window.addEventListener('mouseup', () => joystickInteraction(0, 'end'));

        // Touch events on joystick
        joyCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            joystickInteraction(e.touches[0].clientX, 'start');
        });
        window.addEventListener('touchmove', (e) => {
            if (joystickActive) joystickInteraction(e.touches[0].clientX, 'move');
        });
        window.addEventListener('touchend', () => joystickInteraction(0, 'end'));

        function centerJoystick() {
            joystickX = joyCanvas.width / 2;
            joystickY = joyCanvas.height / 2;
        }

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            updateTargetFromCanvas(e.touches[0].clientX);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging || !gameActive) return;
            updateTargetFromCanvas(e.touches[0].clientX);
        });
        canvas.addEventListener('touchend', () => { isDragging = false; });

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateTargetFromCanvas(e.clientX);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !gameActive) return;
            updateTargetFromCanvas(e.clientX);
        });
        canvas.addEventListener('mouseup', () => { isDragging = false; });

        function updateTargetFromCanvas(clientX) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (clientX - rect.left) * (CANVAS_W / rect.width);
            targetX = mouseX;

            const ratio = (targetX - ROAD_LEFT - CAR_W / 2) / (ROAD_WIDTH - CAR_W - 10);
            const clampedRatio = Math.max(0, Math.min(1, ratio));
            joystickX = 30 + clampedRatio * (joyCanvas.width - 60);
        }

        // Keyboard controls
        const keysDown = {};
        function handleKeydown(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') keysDown.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') keysDown.right = true;
        }
        function handleKeyup(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') keysDown.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') keysDown.right = false;
        }
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);

        const keyboardTick = setInterval(() => {
            if (!gameActive) return;
            if (keysDown.left) {
                targetX -= 5;
                syncJoystickFromCar();
            }
            if (keysDown.right) {
                targetX += 5;
                syncJoystickFromCar();
            }
        }, 16);

        function syncJoystickFromCar() {
            const ratio = (targetX - ROAD_LEFT - CAR_W / 2) / (ROAD_WIDTH - CAR_W - 10);
            const clampedRatio = Math.max(0, Math.min(1, ratio));
            joystickX = 30 + clampedRatio * (joyCanvas.width - 60);
        }

        // ============ GAME OBJECTS ============
        function spawnEnemy() {
            const minX = ROAD_LEFT + ENEMY_W / 2 + 8;
            const maxX = ROAD_RIGHT - ENEMY_W / 2 - 8;
            const x = minX + Math.random() * (maxX - minX);
            const color = enemyColors[Math.floor(Math.random() * enemyColors.length)];

            const tooClose = enemies.some(e => e.y < 80 && Math.abs(e.x - x) < ENEMY_W + 10);
            if (tooClose) return;

            enemies.push({ x, y: -ENEMY_H, color, passed: false });
        }

        function spawnStar() {
            const minX = ROAD_LEFT + 25;
            const maxX = ROAD_RIGHT - 25;
            const x = minX + Math.random() * (maxX - minX);

            const blocked = enemies.some(e => e.y < 60 && Math.abs(e.x - x) < 50);
            if (blocked) return;

            stars.push({ x, y: -20, size: 18, glow: 0 });
        }

        // ============ DRAWING FUNCTIONS ============
        function drawRoad() {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            ctx.fillStyle = '#424242';
            ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_H);

            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(ROAD_LEFT, 0); ctx.lineTo(ROAD_LEFT, CANVAS_H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ROAD_RIGHT, 0); ctx.lineTo(ROAD_RIGHT, CANVAS_H); ctx.stroke();

            const curbW = 8;
            for (let y = 0; y < CANVAS_H; y += 20) {
                const adjustedY = (y + roadOffset) % 40;
                ctx.fillStyle = adjustedY < 20 ? '#F44336' : '#FFF';
                ctx.fillRect(ROAD_LEFT - curbW, y, curbW, 20);
                ctx.fillStyle = adjustedY < 20 ? '#FFF' : '#F44336';
                ctx.fillRect(ROAD_RIGHT, y, curbW, 20);
            }

            ctx.strokeStyle = '#FFD600';
            ctx.lineWidth = 3;
            ctx.setLineDash([25, 20]);
            ctx.lineDashOffset = -roadOffset;
            ctx.beginPath();
            ctx.moveTo(ROAD_LEFT + ROAD_WIDTH / 2, 0);
            ctx.lineTo(ROAD_LEFT + ROAD_WIDTH / 2, CANVAS_H);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function drawCar(x, y, w, h, color, isPlayer) {
            ctx.save();
            ctx.translate(x, y);

            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(2, h / 2 + 4, w / 2 - 2, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            const bodyGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
            bodyGrad.addColorStop(0, color);
            bodyGrad.addColorStop(1, shadeColor(color, -30));
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.roundRect(-w/2, -h/2, w, h, 6);
            ctx.fill();

            const cabinW = w * 0.6;
            const cabinH = h * 0.3;
            if (isPlayer) {
                ctx.fillStyle = '#90CAF9';
                ctx.beginPath(); ctx.roundRect(-cabinW/2, -h/2 + h * 0.2, cabinW, cabinH, 4); ctx.fill();
                ctx.fillStyle = '#64B5F6';
                ctx.beginPath(); ctx.roundRect(-cabinW/2 + 2, -h/2 + 4, cabinW - 4, h * 0.12, 3); ctx.fill();
            } else {
                ctx.fillStyle = '#90CAF9';
                ctx.beginPath(); ctx.roundRect(-cabinW/2, -h/2 + h * 0.45, cabinW, cabinH, 4); ctx.fill();
                ctx.fillStyle = '#64B5F6';
                ctx.beginPath(); ctx.roundRect(-cabinW/2 + 2, h/2 - h * 0.16, cabinW - 4, h * 0.12, 3); ctx.fill();
            }

            ctx.fillStyle = '#212121';
            ctx.fillRect(-w/2 - 2, -h/2 + 6, 6, 12);
            ctx.fillRect(w/2 - 4, -h/2 + 6, 6, 12);
            ctx.fillRect(-w/2 - 2, h/2 - 18, 6, 12);
            ctx.fillRect(w/2 - 4, h/2 - 18, 6, 12);

            if (isPlayer) {
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath(); ctx.arc(-w/4, -h/2 + 2, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(w/4, -h/2 + 2, 3, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#F44336';
                ctx.beginPath(); ctx.arc(-w/4, h/2 - 2, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(w/4, h/2 - 2, 3, 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
        }

        function drawStar(x, y, size, glowPhase) {
            ctx.save();
            ctx.translate(x, y);

            const glowSize = size + 6 + Math.sin(glowPhase) * 4;
            ctx.beginPath(); ctx.arc(0, 0, glowSize, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 215, 0, 0.25)'; ctx.fill();

            const spikes = 5;
            const outerRadius = size;
            const innerRadius = size * 0.45;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI / spikes) - Math.PI / 2;
                const sx = Math.cos(angle) * r;
                const sy = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();

            const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, outerRadius);
            starGrad.addColorStop(0, '#FFF9C4');
            starGrad.addColorStop(0.4, '#FFD600');
            starGrad.addColorStop(1, '#FF8F00');
            ctx.fillStyle = starGrad;
            ctx.fill();
            ctx.strokeStyle = '#F57F17';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#FFF';
            ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function drawExplosion(x, y) {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
            ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 235, 59, 0.9)';
            ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💥', 0, 0);
            ctx.restore();
        }

        function shadeColor(color, amount) {
            let r = parseInt(color.slice(1,3), 16) + amount;
            let g = parseInt(color.slice(3,5), 16) + amount;
            let b = parseInt(color.slice(5,7), 16) + amount;
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
        }

        let collectAnims = [];
        function showCollectAnim(x, y) {
            collectAnims.push({ x, y, alpha: 1, scale: 1, text: '+10 ⭐' });
        }

        function drawCollectAnims() {
            for (let i = collectAnims.length - 1; i >= 0; i--) {
                const a = collectAnims[i];
                ctx.save();
                ctx.globalAlpha = a.alpha;
                ctx.font = `bold ${14 * a.scale}px var(--font-kids)`;
                ctx.fillStyle = '#FFD600';
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 3;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeText(a.text, a.x, a.y);
                ctx.fillText(a.text, a.x, a.y);
                ctx.restore();

                a.y -= 2;
                a.alpha -= 0.025;
                a.scale += 0.02;
                if (a.alpha <= 0) collectAnims.splice(i, 1);
            }
        }

        function updateLivesUI() {
            let hearts = '';
            for (let i = 0; i < lives; i++) hearts += '❤️';
            for (let i = lives; i < 3; i++) hearts += '🖤';
            document.getElementById('raceLives').innerText = hearts;
        }

        // ============ MAIN GAME LOOP ============
        function update() {
            if (!gameActive) return;

            frameCount++;
            roadOffset = (roadOffset + speed) % 40;

            if (frameCount % 3 === 0) {
                score++;
                document.getElementById('raceScore').innerText = score;
            }

            if (frameCount % 400 === 0 && speed < 12) {
                speed += 0.4;
                document.getElementById('raceSpeed').innerText = Math.floor(speed - 3);
            }

            // Smooth player movement
            if (Math.abs(playerX - targetX) > 1) {
                playerX += (targetX - playerX) * 0.2;
            } else {
                playerX = targetX;
            }

            playerX = Math.max(ROAD_LEFT + CAR_W / 2 + 5, Math.min(ROAD_RIGHT - CAR_W / 2 - 5, playerX));
            targetX = Math.max(ROAD_LEFT + CAR_W / 2 + 5, Math.min(ROAD_RIGHT - CAR_W / 2 - 5, targetX));

            const spawnRate = Math.max(35, 70 - Math.floor(score / 30));
            if (frameCount % spawnRate === 0) spawnEnemy();
            if (frameCount % 120 === 0) spawnStar();

            // Invincibility frame timer
            if (isInvincible) {
                invincibleTimer--;
                if (invincibleTimer <= 0) {
                    isInvincible = false;
                }
            }

            drawRoad();

            // Stars
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                star.y += speed;
                star.glow += 0.1;

                if (star.y > CANVAS_H + 30) {
                    stars.splice(i, 1);
                    continue;
                }

                drawStar(star.x, star.y, star.size, star.glow);

                const dx = Math.abs(star.x - playerX);
                const dy = Math.abs(star.y - playerY);
                if (dx < (CAR_W / 2 + star.size) && dy < (CAR_H / 2 + star.size)) {
                    score += 10;
                    starsCollected++;
                    document.getElementById('raceScore').innerText = score;
                    document.getElementById('raceStars').innerText = starsCollected;
                    showCollectAnim(star.x, star.y);
                    if (window.sound) window.sound.playBubble();
                    stars.splice(i, 1);
                }
            }

            // Enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.y += speed;

                if (!enemy.passed && enemy.y > playerY + CAR_H) {
                    enemy.passed = true;
                    passedCars++;
                    score += 5;
                    document.getElementById('raceScore').innerText = score;
                }

                if (enemy.y > CANVAS_H + ENEMY_H) {
                    enemies.splice(i, 1);
                    continue;
                }

                drawCar(enemy.x, enemy.y, ENEMY_W, ENEMY_H, enemy.color, false);

                // Collision
                if (!isInvincible) {
                    const dx = Math.abs(enemy.x - playerX);
                    const dy = Math.abs(enemy.y - playerY);
                    if (dx < (CAR_W / 2 + ENEMY_W / 2 - 6) && dy < (CAR_H / 2 + ENEMY_H / 2 - 6)) {
                        lives--;
                        updateLivesUI();
                        
                        if (window.sound) window.sound.playFail();
                        drawExplosion(playerX, playerY);

                        if (lives <= 0) {
                            drawCar(playerX, playerY, CAR_W, CAR_H, '#2196F3', true);
                            endGame();
                            return;
                        } else {
                            // Hit response: remove colliding enemy and set temporary invincibility
                            enemies.splice(i, 1);
                            isInvincible = true;
                            invincibleTimer = 90; // Invincible for ~1.5 seconds (90 frames)
                            continue;
                        }
                    }
                }
            }

            // Draw player car with blinking visual feedback when invincible
            if (!isInvincible || Math.floor(frameCount / 5) % 2 === 0) {
                drawCar(playerX, playerY, CAR_W, CAR_H, '#2196F3', true);
            }
            drawCollectAnims();

            if (speed > 6) {
                ctx.save();
                ctx.globalAlpha = 0.15;
                for (let i = 0; i < 3; i++) {
                    const lx = ROAD_LEFT + Math.random() * ROAD_WIDTH;
                    const ly = Math.random() * CANVAS_H;
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 20 + speed * 3); ctx.stroke();
                }
                ctx.restore();
            }

            // Render joystick track
            drawJoystick();

            animationId = requestAnimationFrame(update);
        }

        function endGame() {
            gameActive = false;
            gameOver = true;
            cancelAnimationFrame(animationId);
            if (window.sound) window.sound.playFail();
            document.getElementById('raceFinalScore').innerText = score;
            document.getElementById('raceFinalStars').innerText = starsCollected;
            document.getElementById('raceFinalPassed').innerText = passedCars;
            setTimeout(() => {
                document.getElementById('raceFailModal').style.display = 'flex';
            }, 600);
        }

        function resetGame() {
            score = 0;
            speed = 4;
            frameCount = 0;
            playerX = CANVAS_W / 2;
            targetX = playerX;
            enemies = [];
            stars = [];
            collectAnims = [];
            passedCars = 0;
            starsCollected = 0;
            lives = 3;
            isInvincible = false;
            invincibleTimer = 0;
            gameActive = true;
            gameOver = false;
            roadOffset = 0;

            document.getElementById('raceScore').innerText = '0';
            document.getElementById('raceStars').innerText = '0';
            document.getElementById('raceSpeed').innerText = '1';
            document.getElementById('raceFailModal').style.display = 'none';

            updateLivesUI();
            centerJoystick();
            drawJoystick();
            update();
        }

        document.getElementById('restartRace').addEventListener('click', resetGame);

        resetGame();

        container.addEventListener('game-exit', () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
            clearInterval(keyboardTick);
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('keyup', handleKeyup);
        });
    };
})();
