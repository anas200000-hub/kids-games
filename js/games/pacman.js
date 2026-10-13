// Game 40: Pacman Kids Arcade (أكل النقاط الكلاسيكية)
(function() {
    window.initPacmanGame = function(container) {
        let score = 0;
        let lives = 3;
        let gameActive = true;
        let animationId = null;
        let level = 1;

        const CANVAS_W = 400;
        const CANVAS_H = 500;
        const GRID_SIZE = 20;
        const COLS = CANVAS_W / GRID_SIZE; // 20
        const ROWS = CANVAS_H / GRID_SIZE; // 25

        // Pacman state
        let pacman = {
            x: 9 * GRID_SIZE + GRID_SIZE/2,
            y: 15 * GRID_SIZE + GRID_SIZE/2,
            dirX: 0,
            dirY: 0,
            nextDirX: 0,
            nextDirY: 0,
            speed: 2.5,
            angle: 0
        };

        // Ghosts state
        let ghosts = [
            { x: 9 * GRID_SIZE + GRID_SIZE/2, y: 10 * GRID_SIZE + GRID_SIZE/2, dirX: 1, dirY: 0, color: '#FF0000', speed: 2, spawnX: 9 * GRID_SIZE + GRID_SIZE/2, spawnY: 10 * GRID_SIZE + GRID_SIZE/2 },
            { x: 10 * GRID_SIZE + GRID_SIZE/2, y: 10 * GRID_SIZE + GRID_SIZE/2, dirX: -1, dirY: 0, color: '#FFB8FF', speed: 2, spawnX: 10 * GRID_SIZE + GRID_SIZE/2, spawnY: 10 * GRID_SIZE + GRID_SIZE/2 },
            { x: 9 * GRID_SIZE + GRID_SIZE/2, y: 11 * GRID_SIZE + GRID_SIZE/2, dirX: 0, dirY: -1, color: '#00FFFF', speed: 2, spawnX: 9 * GRID_SIZE + GRID_SIZE/2, spawnY: 11 * GRID_SIZE + GRID_SIZE/2 }
        ];

        let powerModeActive = false;
        let powerModeTimer = 0;

        // 1 = wall, 0 = dot, 2 = empty space, 3 = gate (passable by ghosts only)
        let map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,4,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,4,1],
            [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,1,3,3,1,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,1,0,0,0,0,0,2,2,0,0,0,0,0,1,0,0,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
            [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let initialMap = map.map(row => [...row]);

        let html = `
            <div class="game-pacman-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: ltr;">
                <h2 class="game-title" style="color: #FFEB3B; margin-bottom: 8px; font-weight: 900;">🐤 الباكمان الفرح 🐤</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #F57F17; font-size: 15px;">🏆 <span id="pacScore">0</span></div>
                    <div id="pacLives" style="font-weight: bold; color: #E53935; font-size: 15px;">❤️❤️❤️</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.4); border: 4px solid #333;">
                    <canvas id="pacCanvas" width="${CANVAS_W}" height="${CANVAS_H}" style="display: block; background: #111; touch-action: none; cursor: pointer;"></canvas>
                </div>
                
                <!-- Virtual Joystick Control Area -->
                <div style="display: flex; flex-direction: column; align-items: center; margin-top: 8px; width: 100%;">
                    <div style="font-size: 11px; color: #757575; font-weight: bold; margin-bottom: 2px;">استخدم عصا التحكم لتوجيه الباكمان 👇</div>
                    <canvas id="pacJoystick" width="400" height="140" style="display: block; background: #FFF; border: 3px dashed #BDBDBD; border-radius: 16px; touch-action: none; cursor: grab; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); width: 100%; height: auto;"></canvas>
                </div>

                <div id="pacWinModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 26px; margin-bottom: 10px;">🏆 بطل حقيقي! 🏆</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد أكلت كل النقاط! استعد للتحدي القادم.</p>
                        <button class="menu-btn restart-btn" id="pacNextLevel" style="background: #4CAF50; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">المستوى التالي 🎮</button>
                    </div>
                </div>

                <div id="pacFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 26px; margin-bottom: 10px;">💥 انتهى اللعب! 💥</h3>
                        <p style="font-size: 18px; margin-bottom: 5px; color: #555;">مجموع النقاط: <span id="pacFinalScore" style="font-weight: bold; color: #E53935; font-size: 22px;">0</span></p>
                        <button class="menu-btn restart-btn" id="restartPac" style="background: #E53935; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #C62828; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('pacCanvas');
        const ctx = canvas.getContext('2d');

        // ============ DRAWING FUNCTIONS ============
        function drawMap() {
            for (let r = 0; r < map.length; r++) {
                for (let c = 0; c < map[0].length; c++) {
                    const tile = map[r][c];
                    if (tile === 1) {
                        ctx.fillStyle = '#1A237E'; // Dark blue walls
                        ctx.fillRect(c * GRID_SIZE + 1, r * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                    } else if (tile === 0) {
                        ctx.fillStyle = '#FFEB3B'; // Food dots
                        ctx.beginPath();
                        ctx.arc(c * GRID_SIZE + GRID_SIZE/2, r * GRID_SIZE + GRID_SIZE/2, 3, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (tile === 4) {
                        // Flashing power pellets
                        if (Math.floor(frameCount / 12) % 2 === 0) {
                            ctx.fillStyle = '#FFD54F'; // Flash light yellow
                        } else {
                            ctx.fillStyle = '#FF6D00'; // Flash orange
                        }
                        ctx.beginPath();
                        ctx.arc(c * GRID_SIZE + GRID_SIZE/2, r * GRID_SIZE + GRID_SIZE/2, 7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        function drawPacman() {
            ctx.save();
            ctx.translate(pacman.x, pacman.y);
            ctx.rotate(pacman.angle);

            // Mouth animation phase
            const mouthSize = 0.2 + 0.15 * Math.sin(frameCount * 0.3);

            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(0, 0, GRID_SIZE/2 - 1, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.restore();
        }

        function drawGhosts() {
            ghosts.forEach(g => {
                ctx.save();
                
                // Set color based on power mode status
                if (powerModeActive) {
                    if (powerModeTimer < 120 && Math.floor(frameCount / 10) % 2 === 0) {
                        ctx.fillStyle = '#FFFFFF'; // Flashing white
                    } else {
                        ctx.fillStyle = '#1976D2'; // Vulnerable blue
                    }
                } else {
                    ctx.fillStyle = g.color;
                }

                const gx = g.x - GRID_SIZE/2;
                const gy = g.y - GRID_SIZE/2;

                ctx.beginPath();
                ctx.arc(g.x, g.y - 1, GRID_SIZE/2 - 1, Math.PI, 0, false);
                ctx.lineTo(g.x + GRID_SIZE/2 - 1, g.y + GRID_SIZE/2 - 1);

                // Wave bottom
                const waveCount = 3;
                const step = (GRID_SIZE - 2) / waveCount;
                for (let i = 0; i <= waveCount; i++) {
                    const wx = g.x + GRID_SIZE/2 - 1 - i * step;
                    const wy = g.y + GRID_SIZE/2 - 1 + (i % 2 === 0 ? 2 : -2);
                    ctx.lineTo(wx, wy);
                }

                ctx.lineTo(g.x - GRID_SIZE/2 + 1, g.y + GRID_SIZE/2 - 1);
                ctx.closePath();
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(g.x - 3, g.y - 2, 2.5, 0, Math.PI * 2);
                ctx.arc(g.x + 3, g.y - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Pupils
                ctx.fillStyle = powerModeActive ? '#FF1744' : '#000'; // red pupils when vulnerable
                ctx.beginPath();
                ctx.arc(g.x - 3 + g.dirX, g.y - 2 + g.dirY, 1, 0, Math.PI * 2);
                ctx.arc(g.x + 3 + g.dirX, g.y - 2 + g.dirY, 1, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });
        }

        // ============ PACMAN MOVEMENT & INPUT ============
        function updatePacman() {
            // Check if center of grid cell
            const currCol = Math.floor(pacman.x / GRID_SIZE);
            const currRow = Math.floor(pacman.y / GRID_SIZE);
            const inCenter = (Math.floor(pacman.x) % GRID_SIZE === GRID_SIZE/2) && (Math.floor(pacman.y) % GRID_SIZE === GRID_SIZE/2);

            if (inCenter) {
                // Change direction to next input if possible
                if (pacman.nextDirX !== 0 || pacman.nextDirY !== 0) {
                    if (canMoveTo(currCol + pacman.nextDirX, currRow + pacman.nextDirY)) {
                        pacman.dirX = pacman.nextDirX;
                        pacman.dirY = pacman.nextDirY;
                        pacman.nextDirX = 0;
                        pacman.nextDirY = 0;

                        // Set rotation angle
                        if (pacman.dirX === 1) pacman.angle = 0;
                        else if (pacman.dirX === -1) pacman.angle = Math.PI;
                        else if (pacman.dirY === 1) pacman.angle = Math.PI / 2;
                        else if (pacman.dirY === -1) pacman.angle = -Math.PI / 2;
                    }
                }

                // Check wall collision for current direction
                if (!canMoveTo(currCol + pacman.dirX, currRow + pacman.dirY)) {
                    pacman.dirX = 0;
                    pacman.dirY = 0;
                }

                // Eat dot
                if (map[currRow][currCol] === 0) {
                    map[currRow][currCol] = 2; // set to empty
                    score += 10;
                    document.getElementById('pacScore').innerText = score;
                    if (window.sound) window.sound.playBubble();
                    checkLevelProgress();
                }

                // Eat power pellet
                if (map[currRow][currCol] === 4) {
                    map[currRow][currCol] = 2; // set to empty
                    score += 50;
                    document.getElementById('pacScore').innerText = score;
                    if (window.sound) window.sound.playSuccess();
                    activatePowerMode();
                    checkLevelProgress();
                }
            }

            // Move
            pacman.x += pacman.dirX * pacman.speed;
            pacman.y += pacman.dirY * pacman.speed;
        }

        function activatePowerMode() {
            powerModeActive = true;
            powerModeTimer = 360; // 6 seconds at 60 FPS
            ghosts.forEach(g => g.speed = 1); // slow down ghosts
        }

        function canMoveTo(col, row) {
            if (col < 0 || col >= COLS || row < 0 || row >= map.length) return false;
            return map[row][col] !== 1 && map[row][col] !== 3; // Block if wall or gate
        }

        // ============ GHOST MOVEMENT & AI ============
        function updateGhosts() {
            ghosts.forEach(g => {
                const inCenter = (Math.floor(g.x) % GRID_SIZE === GRID_SIZE/2) && (Math.floor(g.y) % GRID_SIZE === GRID_SIZE/2);
                const currCol = Math.floor(g.x / GRID_SIZE);
                const currRow = Math.floor(g.y / GRID_SIZE);

                if (inCenter) {
                    // Find all possible direction choices
                    const dirs = [
                        {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
                    ];
                    const validDirs = dirs.filter(d => {
                        // Prevent backtracking directly if possible
                        if (d.x === -g.dirX && d.y === -g.dirY) return false;
                        const nextCol = currCol + d.x;
                        const nextRow = currRow + d.y;
                        if (nextCol < 0 || nextCol >= COLS || nextRow < 0 || nextRow >= map.length) return false;
                        return map[nextRow][nextCol] !== 1; // Can pass through ghost gates (3)
                    });

                    if (validDirs.length > 0) {
                        const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
                        g.dirX = chosen.x;
                        g.dirY = chosen.y;
                    } else {
                        // Backtrack if no other choice
                        g.dirX = -g.dirX;
                        g.dirY = -g.dirY;
                    }
                }

                g.x += g.dirX * g.speed;
                g.y += g.dirY * g.speed;

                // Collide with Pacman
                const dx = Math.abs(g.x - pacman.x);
                const dy = Math.abs(g.y - pacman.y);
                if (dx < GRID_SIZE - 2 && dy < GRID_SIZE - 2) {
                    if (powerModeActive) {
                        // Eat ghost!
                        score += 200;
                        document.getElementById('pacScore').innerText = score;
                        if (window.sound) window.sound.playFlip();
                        
                        // Send ghost back to starting cage
                        g.x = g.spawnX;
                        g.y = g.spawnY;
                        g.speed = 2; // Restore speed
                    } else {
                        lives--;
                        updateLivesUI();
                        if (window.sound) window.sound.playFail();

                        if (lives <= 0) {
                            endGame();
                        } else {
                            respawnPacman();
                        }
                    }
                }
            });
        }

        function respawnPacman() {
            pacman.x = 9 * GRID_SIZE + GRID_SIZE/2;
            pacman.y = 15 * GRID_SIZE + GRID_SIZE/2;
            pacman.dirX = 0;
            pacman.dirY = 0;
            pacman.nextDirX = 0;
            pacman.nextDirY = 0;
            
            // Deactivate power mode
            powerModeActive = false;
            powerModeTimer = 0;

            ghosts.forEach(g => {
                g.x = g.spawnX;
                g.y = g.spawnY;
                g.speed = 2;
            });
        }

        function checkLevelProgress() {
            let win = true;
            for (let r = 0; r < map.length; r++) {
                for (let c = 0; c < map[0].length; c++) {
                    if (map[r][c] === 0 || map[r][c] === 4) { // check both food and power pellets
                        win = false;
                        break;
                    }
                }
            }
            if (win) {
                gameActive = false;
                cancelAnimationFrame(animationId);
                document.getElementById('pacWinModal').style.display = 'flex';
            }
        }

        function updateLivesUI() {
            let hearts = '';
            for (let i = 0; i < lives; i++) hearts += '❤️';
            for (let i = lives; i < 3; i++) hearts += '🖤';
            document.getElementById('pacLives').innerText = hearts;
        }

        // ============ MAIN GAME LOOP ============
        let frameCount = 0;
        function loop() {
            if (!gameActive) return;

            frameCount++;
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // Handle Power Mode Timer
            if (powerModeActive) {
                powerModeTimer--;
                if (powerModeTimer <= 0) {
                    powerModeActive = false;
                    ghosts.forEach(g => g.speed = 2); // Restore speed
                }
            }

            drawMap();
            updatePacman();
            updateGhosts();
            drawPacman();
            drawGhosts();

            // Draw Virtual Joystick
            drawJoystick();

            animationId = requestAnimationFrame(loop);
        }

        // ============ INPUT TRIGGERS ============
        function changeDirection(dx, dy) {
            pacman.nextDirX = dx;
            pacman.nextDirY = dy;
        }

        // ============ VIRTUAL JOYSTICK IMPLEMENTATION ============
        const joyCanvas = document.getElementById('pacJoystick');
        const joyCtx = joyCanvas.getContext('2d');
        const joyCenterX = 200;
        const joyCenterY = 70;
        let joyHandleX = 200;
        let joyHandleY = 70;
        const joyOuterRadius = 45;
        const joyKnobRadius = 22;
        let joyDragging = false;

        function drawJoystick() {
            joyCtx.clearRect(0, 0, joyCanvas.width, joyCanvas.height);

            // Outer Ring
            joyCtx.beginPath();
            joyCtx.arc(joyCenterX, joyCenterY, joyOuterRadius, 0, Math.PI * 2);
            joyCtx.strokeStyle = '#E0E0E0';
            joyCtx.lineWidth = 6;
            joyCtx.stroke();
            joyCtx.fillStyle = 'rgba(255, 235, 59, 0.03)';
            joyCtx.fill();

            // Inner Knob Shadow
            joyCtx.save();
            joyCtx.translate(joyHandleX, joyHandleY);
            joyCtx.beginPath();
            joyCtx.arc(1, 2, joyKnobRadius, 0, Math.PI * 2);
            joyCtx.fillStyle = 'rgba(0,0,0,0.15)';
            joyCtx.fill();

            // Inner Knob Body (Yellow radial gradient)
            const knobGrad = joyCtx.createRadialGradient(-3, -3, 2, 0, 0, joyKnobRadius);
            knobGrad.addColorStop(0, '#FFF59D');
            knobGrad.addColorStop(0.8, '#FBC02D');
            knobGrad.addColorStop(1, '#F57F17');
            joyCtx.beginPath();
            joyCtx.arc(0, 0, joyKnobRadius, 0, Math.PI * 2);
            joyCtx.fillStyle = knobGrad;
            joyCtx.fill();

            // Grip ridge
            joyCtx.beginPath();
            joyCtx.arc(0, 0, 8, 0, Math.PI * 2);
            joyCtx.strokeStyle = 'rgba(255,255,255,0.4)';
            joyCtx.lineWidth = 2;
            joyCtx.stroke();
            joyCtx.restore();
        }

        function handleJoystickInput(clientX, clientY, isStart) {
            const rect = joyCanvas.getBoundingClientRect();
            const x = (clientX - rect.left) * (joyCanvas.width / rect.width);
            const y = (clientY - rect.top) * (joyCanvas.height / rect.height);

            if (isStart) {
                const distToCenter = Math.hypot(x - joyCenterX, y - joyCenterY);
                if (distToCenter < joyOuterRadius + 20) {
                    joyDragging = true;
                    joyCanvas.style.cursor = 'grabbing';
                }
            }

            if (joyDragging) {
                const dx = x - joyCenterX;
                const dy = y - joyCenterY;
                const dist = Math.hypot(dx, dy);

                if (dist > joyOuterRadius) {
                    joyHandleX = joyCenterX + (dx / dist) * joyOuterRadius;
                    joyHandleY = joyCenterY + (dy / dist) * joyOuterRadius;
                } else {
                    joyHandleX = x;
                    joyHandleY = y;
                }

                // Trigger Pacman direction change
                const minDragDist = 15;
                if (dist > minDragDist) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        if (dx > 0) changeDirection(1, 0);
                        else changeDirection(-1, 0);
                    } else {
                        if (dy > 0) changeDirection(0, 1);
                        else changeDirection(0, -1);
                    }
                }
            }
        }

        function releaseJoystick() {
            joyDragging = false;
            joyCanvas.style.cursor = 'grab';
            joyHandleX = joyCenterX;
            joyHandleY = joyCenterY;
        }

        joyCanvas.addEventListener('mousedown', (e) => handleJoystickInput(e.clientX, e.clientY, true));
        window.addEventListener('mousemove', (e) => { if (joyDragging) handleJoystickInput(e.clientX, e.clientY, false); });
        window.addEventListener('mouseup', releaseJoystick);

        joyCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleJoystickInput(e.touches[0].clientX, e.touches[0].clientY, true);
        });
        window.addEventListener('touchmove', (e) => {
            if (joyDragging) handleJoystickInput(e.touches[0].clientX, e.touches[0].clientY, false);
        });
        window.addEventListener('touchend', releaseJoystick);

        function endGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            document.getElementById('pacFinalScore').innerText = score;
            document.getElementById('pacFailModal').style.display = 'flex';
        }

        function startNextLevel() {
            level++;
            document.getElementById('brickLevel').innerText = level;
            document.getElementById('pacWinModal').style.display = 'none';
            map = initialMap.map(row => [...row]); // reset dots
            respawnPacman();
            gameActive = true;
            loop();
        }

        function resetGame() {
            score = 0;
            lives = 3;
            level = 1;
            document.getElementById('pacScore').innerText = '0';
            document.getElementById('pacFailModal').style.display = 'none';
            document.getElementById('pacWinModal').style.display = 'none';
            updateLivesUI();
            map = initialMap.map(row => [...row]);
            respawnPacman();
            gameActive = true;
            loop();
        }

        document.getElementById('pacNextLevel').addEventListener('click', startNextLevel);
        document.getElementById('restartPac').addEventListener('click', resetGame);

        resetGame();

        container.addEventListener('game-exit', () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', handleKeydown);
        });
    };
})();
