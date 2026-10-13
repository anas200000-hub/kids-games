// لعبة قاذف الفقاعات - Bubble Shooter
(function() {
    window.initBubbleShooterGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .bubble-game-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
            }
            .bubble-hud {
                display: flex;
                justify-content: space-between;
                width: 100%;
                padding: 8px 16px;
                background: #FFF;
                border-radius: 14px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.06);
                box-sizing: border-box;
                margin-bottom: 8px;
            }
            .bubble-hud span {
                font-weight: bold;
                font-size: 15px;
            }
            .bubble-canvas-container {
                width: 100%;
                height: 440px;
                position: relative;
                border-radius: 20px;
                overflow: hidden;
                border: 3px solid #4DD0E1;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                background: #E0F7FA; /* Sky blue background */
            }
            canvas {
                width: 100%;
                height: 100%;
                display: block;
                touch-action: none;
            }
            .bubble-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.65);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: #FFF;
            }
            .bubble-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #4DD0E1;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .bubble-card h3 {
                color: #00838F;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .bubble-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Elements Creation
        const layout = document.createElement('div');
        layout.className = 'bubble-game-layout';
        container.appendChild(layout);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'قاذف الفقاعات 🎈';
        title.style.cssText = 'color:#00838F;margin-bottom:2px;width:100%;';
        layout.appendChild(title);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'المس واسحب لتصويب القاذف، ثم ارفع إصبعك لإطلاق الفقاعة ومطابقة 3 ألوان!';
        instr.style.cssText = 'margin-bottom:8px;width:100%;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'bubble-hud';
        layout.appendChild(hud);

        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#00838F';
        scoreSpan.innerText = 'النقاط: 0';
        const lvlSpan = document.createElement('span');
        lvlSpan.style.color = '#FF4081';
        lvlSpan.innerText = 'المرحلة: 1 / 5';
        hud.appendChild(scoreSpan);
        hud.appendChild(lvlSpan);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'bubble-canvas-container';
        layout.appendChild(canvasContainer);

        const canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);

        const overlay = document.createElement('div');
        overlay.className = 'bubble-overlay';
        overlay.style.display = 'none';
        canvasContainer.appendChild(overlay);

        const card = document.createElement('div');
        card.className = 'bubble-card bounce-anim';
        overlay.appendChild(card);

        // Canvas setup & Responsive sizing variables
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;

        const GRID_COLS = 8;
        const GRID_ROWS = 9;
        let BUBBLE_RADIUS = 16;
        let GRID_START_X = 0;
        let GRID_START_Y = 0;
        let LAUNCHER_X = 0;
        let LAUNCHER_Y = 0;

        function resizeCanvas() {
            width = canvasContainer.clientWidth;
            height = canvasContainer.clientHeight;
            canvas.width = width;
            canvas.height = height;

            // Recalculate bubble radius to perfectly fill the screen width
            // Grid columns nested honeycomb takes (GRID_COLS + 0.5) * BUBBLE_RADIUS * 2 width
            BUBBLE_RADIUS = Math.floor(width / (GRID_COLS + 0.5) / 2);

            // Center the grid and setup launcher positions
            GRID_START_X = (width - (GRID_COLS + 0.5) * BUBBLE_RADIUS * 2) / 2;
            GRID_START_Y = BUBBLE_RADIUS + 15;
            LAUNCHER_X = width / 2;
            LAUNCHER_Y = height - BUBBLE_RADIUS - 24;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Colors
        const bubbleColors = {
            'red': { main: '#FF5252', dark: '#C62828' },
            'blue': { main: '#2196F3', dark: '#0D47A1' },
            'green': { main: '#4CAF50', dark: '#2E7D32' },
            'yellow': { main: '#FFEB3B', dark: '#FBC02D' },
            'purple': { main: '#E040FB', dark: '#9C27B0' }
        };
        const colorKeys = Object.keys(bubbleColors);

        // Game state
        let isGameRunning = true;
        let score = 0;
        let currentLevel = 1;
        let grid = []; // 2D array of grid cells (color key or null)
        
        let launcherColor = 'red';
        let nextLauncherColor = 'blue';

        let flyingBubble = null; // { x, y, vx, vy, color }
        let fallingBubbles = []; // array of { x, y, vy, color }
        let poppingBubbles = []; // array of { x, y, radius, maxRadius, color }

        // Touch Input variables
        let isAiming = false;
        let aimAngle = -Math.PI / 2; // Point straight up initially

        // 3. Aiming and Shooting Pointer Events
        canvas.addEventListener('pointerdown', startAiming);
        canvas.addEventListener('pointermove', updateAiming);
        
        const releaseShot = () => {
            if (!isAiming) return;
            isAiming = false;

            if (flyingBubble) return;

            // Shoot the bubble!
            const speed = 9.5;
            flyingBubble = {
                x: LAUNCHER_X,
                y: LAUNCHER_Y,
                vx: Math.cos(aimAngle) * speed,
                vy: Math.sin(aimAngle) * speed,
                color: launcherColor
            };

            if (window.sound) window.sound.playClick();
        };
        window.addEventListener('pointerup', releaseShot);

        function startAiming(e) {
            if (!isGameRunning || flyingBubble) return;
            e.preventDefault();
            isAiming = true;
            updateAiming(e);
        }

        function updateAiming(e) {
            if (!isAiming) return;
            const rect = canvas.getBoundingClientRect();
            const touchX = e.clientX - rect.left;
            const touchY = e.clientY - rect.top;

            // Calculate angle from launcher to pointer
            const dx = touchX - LAUNCHER_X;
            const dy = touchY - LAUNCHER_Y;
            
            // Constrain shooting upward only (between -10 and -170 degrees)
            const angle = Math.atan2(dy, dx);
            if (angle < -0.1 && angle > -Math.PI + 0.1) {
                aimAngle = angle;
            }
        }

        // Initialize Level
        function initLevel(lvlNum) {
            scoreSpan.innerText = `النقاط: ${score}`;
            lvlSpan.innerText = `المرحلة: ${lvlNum} / 5`;
            overlay.style.display = 'none';

            // Setup empty grid
            grid = [];
            for (let r = 0; r < GRID_ROWS; r++) {
                grid.push(new Array(GRID_COLS).fill(null));
            }

            // Populate initial rows with bubbles
            const activeColorsCount = Math.min(3 + lvlNum, colorKeys.length);
            const activeColors = colorKeys.slice(0, activeColorsCount);

            const initialRows = 2 + lvlNum; // Level 1 = 3 rows, Level 5 = 7 rows

            for (let r = 0; r < initialRows; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (Math.random() > 0.15) {
                        grid[r][c] = activeColors[Math.floor(Math.random() * activeColors.length)];
                    }
                }
            }

            // Set launcher colors
            launcherColor = activeColors[Math.floor(Math.random() * activeColors.length)];
            nextLauncherColor = activeColors[Math.floor(Math.random() * activeColors.length)];

            flyingBubble = null;
            fallingBubbles = [];
            poppingBubbles = [];
        }

        // Honeycomb grid coordinates
        function getBubbleCenter(r, c) {
            // Even rows shift left, odd rows shift right (nesting)
            const shiftX = (r % 2 === 1) ? BUBBLE_RADIUS : 0;
            const x = GRID_START_X + c * BUBBLE_RADIUS * 2 + shiftX + BUBBLE_RADIUS;
            // Height offset of rows in hexagon nesting is radius * sqrt(3)
            const y = GRID_START_Y + r * BUBBLE_RADIUS * 1.73 + BUBBLE_RADIUS;
            return { x, y };
        }

        // Main game loop
        function gameLoop() {
            if (!isGameRunning) return;

            updatePhysics();
            drawGame();

            requestAnimationFrame(gameLoop);
        }

        function updatePhysics() {
            // 1. UPDATE FLYING BUBBLE
            if (flyingBubble) {
                flyingBubble.x += flyingBubble.vx;
                flyingBubble.y += flyingBubble.vy;

                // Wall bounces (using calculated responsive boundaries)
                const leftBoundary = GRID_START_X + BUBBLE_RADIUS;
                const rightBoundary = width - GRID_START_X - BUBBLE_RADIUS;
                if (flyingBubble.x < leftBoundary) {
                    flyingBubble.x = leftBoundary;
                    flyingBubble.vx = -flyingBubble.vx;
                    if (window.sound) window.sound.playClick();
                } else if (flyingBubble.x > rightBoundary) {
                    flyingBubble.x = rightBoundary;
                    flyingBubble.vx = -flyingBubble.vx;
                    if (window.sound) window.sound.playClick();
                }

                // Check collision with grid ceiling or existing grid bubbles
                let collided = false;

                if (flyingBubble.y <= GRID_START_Y + BUBBLE_RADIUS) {
                    collided = true;
                } else {
                    for (let r = 0; r < GRID_ROWS; r++) {
                        for (let c = 0; c < GRID_COLS; c++) {
                            if (grid[r][c]) {
                                const center = getBubbleCenter(r, c);
                                const dist = Math.hypot(flyingBubble.x - center.x, flyingBubble.y - center.y);
                                if (dist < BUBBLE_RADIUS * 1.72) {
                                    collided = true;
                                    break;
                                }
                            }
                        }
                        if (collided) break;
                    }
                }

                if (collided) {
                    snapBubble(flyingBubble);
                    flyingBubble = null;
                }
            }

            // 2. UPDATE FALLING BUBBLES
            for (let i = fallingBubbles.length - 1; i >= 0; i--) {
                const b = fallingBubbles[i];
                b.y += b.vy;
                b.vy += 0.45; // gravity

                if (b.y > height + 30) {
                    fallingBubbles.splice(i, 1);
                }
            }

            // 3. UPDATE POPPING BUBBLES
            for (let i = poppingBubbles.length - 1; i >= 0; i--) {
                const p = poppingBubbles[i];
                p.radius += 1.6;
                if (p.radius >= p.maxRadius) {
                    poppingBubbles.splice(i, 1);
                }
            }
        }

        // Helper to ensure a cell has at least one adjacent bubble or is ceiling
        function hasAdjacentBubble(r, c) {
            if (r === 0) return true; // Ceiling acts as connection
            const neighbors = getNeighbors(r, c);
            return neighbors.some(n => grid[n.r][n.c] !== null);
        }

        function snapBubble(bubble) {
            let closestR = 0;
            let closestC = 0;
            let minDist = Infinity;

            // Highly precise snap search: only consider slots connected to something
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (!grid[r][c] && hasAdjacentBubble(r, c)) {
                        const center = getBubbleCenter(r, c);
                        const dist = Math.hypot(bubble.x - center.x, bubble.y - center.y);
                        if (dist < minDist) {
                            minDist = dist;
                            closestR = r;
                            closestC = c;
                        }
                    }
                }
            }

            // Snap color to grid
            grid[closestR][closestC] = bubble.color;

            // Check matching colors
            const matches = findMatches(closestR, closestC, bubble.color);
            if (matches.length >= 3) {
                matches.forEach(cell => {
                    const center = getBubbleCenter(cell.r, cell.c);
                    poppingBubbles.push({
                        x: center.x,
                        y: center.y,
                        radius: BUBBLE_RADIUS,
                        maxRadius: BUBBLE_RADIUS * 2,
                        color: bubbleColors[bubble.color].main
                    });

                    grid[cell.r][cell.c] = null;
                    score += 10;
                });
                
                scoreSpan.innerText = `النقاط: ${score}`;
                if (window.sound) window.sound.playPop();

                // Drop floating bubbles
                dropFloatingBubbles();
            } else {
                if (window.sound) window.sound.playPop();
            }

            // Check Game Over
            if (closestR >= GRID_ROWS - 1) {
                levelGameOver();
                return;
            }

            // Check Win Condition
            let bubblesCount = 0;
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (grid[r][c]) bubblesCount++;
                }
            }

            if (bubblesCount === 0) {
                levelWin();
                return;
            }

            // Load next color
            launcherColor = nextLauncherColor;
            
            const remainingColors = [];
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (grid[r][c] && !remainingColors.includes(grid[r][c])) {
                        remainingColors.push(grid[r][c]);
                    }
                }
            }

            if (remainingColors.length > 0) {
                nextLauncherColor = remainingColors[Math.floor(Math.random() * remainingColors.length)];
            } else {
                nextLauncherColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            }
        }

        // Get adjacent cells in Honeycomb grid
        function getNeighbors(r, c) {
            const neighbors = [];
            const shift = (r % 2 === 1);

            const offsets = shift
                ? [
                    { r: r - 1, c: c }, { r: r - 1, c: c + 1 },
                    { r: r, c: c - 1 }, { r: r, c: c + 1 },
                    { r: r + 1, c: c }, { r: r + 1, c: c + 1 }
                  ]
                : [
                    { r: r - 1, c: c - 1 }, { r: r - 1, c: c },
                    { r: r, c: c - 1 }, { r: r, c: c + 1 },
                    { r: r + 1, c: c - 1 }, { r: r + 1, c: c }
                  ];

            offsets.forEach(off => {
                if (off.r >= 0 && off.r < GRID_ROWS && off.c >= 0 && off.c < GRID_COLS) {
                    neighbors.push(off);
                }
            });

            return neighbors;
        }

        // Find connected bubbles of same color
        function findMatches(startR, startC, targetColor) {
            const matches = [];
            const queue = [{ r: startR, c: startC }];
            const visited = {};
            visited[`${startR},${startC}`] = true;

            while (queue.length > 0) {
                const curr = queue.shift();
                matches.push(curr);

                const neighbors = getNeighbors(curr.r, curr.c);
                neighbors.forEach(n => {
                    const key = `${n.r},${n.c}`;
                    if (!visited[key] && grid[n.r][n.c] === targetColor) {
                        visited[key] = true;
                        queue.push(n);
                    }
                });
            }

            return matches;
        }

        // Drop floating bubbles
        function dropFloatingBubbles() {
            const queue = [];
            const visited = {};

            for (let c = 0; c < GRID_COLS; c++) {
                if (grid[0][c]) {
                    queue.push({ r: 0, c: c });
                    visited[`0,${c}`] = true;
                }
            }

            while (queue.length > 0) {
                const curr = queue.shift();
                const neighbors = getNeighbors(curr.r, curr.c);
                neighbors.forEach(n => {
                    const key = `${n.r},${n.c}`;
                    if (!visited[key] && grid[n.r][n.c]) {
                        visited[key] = true;
                        queue.push(n);
                    }
                });
            }

            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (grid[r][c] && !visited[`${r},${c}`]) {
                        const center = getBubbleCenter(r, c);
                        fallingBubbles.push({
                            x: center.x,
                            y: center.y,
                            vy: -2,
                            color: grid[r][c]
                        });
                        grid[r][c] = null;
                        score += 15;
                    }
                }
            }

            scoreSpan.innerText = `النقاط: ${score}`;
        }

        // Draw everything
        function drawGame() {
            ctx.clearRect(0, 0, width, height);

            // 1. DRAW AIMING TRAJECTORY
            if (isAiming) {
                drawAimingLine();
            }

            // 2. DRAW CEILING
            ctx.fillStyle = '#CFD8DC';
            ctx.fillRect(0, 0, width, GRID_START_Y - 4);
            ctx.fillStyle = '#90A4AE';
            ctx.fillRect(0, GRID_START_Y - 4, width, 4);

            // 3. DRAW GRID BUBBLES
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    if (grid[r][c]) {
                        const center = getBubbleCenter(r, c);
                        drawGlossyBubble(center.x, center.y, BUBBLE_RADIUS, grid[r][c]);
                    }
                }
            }

            // 4. DRAW POPPING BUBBLES
            poppingBubbles.forEach(p => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3.5 * (1 - p.radius / p.maxRadius);
                ctx.stroke();
                ctx.restore();
            });

            // 5. DRAW FALLING BUBBLES
            fallingBubbles.forEach(fb => {
                drawGlossyBubble(fb.x, fb.y, BUBBLE_RADIUS, fb.color);
            });

            // 6. DRAW FLYING BUBBLE
            if (flyingBubble) {
                drawGlossyBubble(flyingBubble.x, flyingBubble.y, BUBBLE_RADIUS, flyingBubble.color);
            }

            // 7. DRAW LAUNCHER
            ctx.save();
            ctx.beginPath();
            ctx.arc(LAUNCHER_X, LAUNCHER_Y, BUBBLE_RADIUS * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.strokeStyle = '#00838F';
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(LAUNCHER_X, LAUNCHER_Y);
            ctx.lineTo(LAUNCHER_X + Math.cos(aimAngle) * (BUBBLE_RADIUS * 2.2), LAUNCHER_Y + Math.sin(aimAngle) * (BUBBLE_RADIUS * 2.2));
            ctx.strokeStyle = '#00838F';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Current Bubble
            drawGlossyBubble(LAUNCHER_X, LAUNCHER_Y, BUBBLE_RADIUS + 1, launcherColor);

            // Next Bubble
            const nextX = LAUNCHER_X - BUBBLE_RADIUS * 2.8;
            const nextY = LAUNCHER_Y + BUBBLE_RADIUS * 0.8;
            ctx.beginPath();
            ctx.arc(nextX, nextY, BUBBLE_RADIUS * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fill();
            drawGlossyBubble(nextX, nextY, BUBBLE_RADIUS * 0.55, nextLauncherColor);

            ctx.restore();
        }

        // Vector glossy 3D ball drawer
        function drawGlossyBubble(cx, cy, r, colorName) {
            const colors = bubbleColors[colorName] || bubbleColors['red'];
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);

            const grad = ctx.createRadialGradient(cx - r/3, cy - r/3, r * 0.1, cx, cy, r);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.35, colors.main);
            grad.addColorStop(1, colors.dark);
            
            ctx.fillStyle = grad;
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        // Draw aiming line with bounce reflection
        function drawAimingLine() {
            ctx.save();

            let x = LAUNCHER_X;
            let y = LAUNCHER_Y;
            let vx = Math.cos(aimAngle);
            let vy = Math.sin(aimAngle);

            const dotsCount = 15;
            const dotSpacing = BUBBLE_RADIUS * 1.1;
            
            ctx.fillStyle = 'rgba(0, 131, 143, 0.6)';

            for (let i = 0; i < dotsCount; i++) {
                x += vx * dotSpacing;
                y += vy * dotSpacing;

                const leftBoundary = GRID_START_X + BUBBLE_RADIUS;
                const rightBoundary = width - GRID_START_X - BUBBLE_RADIUS;
                if (x < leftBoundary) {
                    x = leftBoundary;
                    vx = -vx;
                } else if (x > rightBoundary) {
                    x = rightBoundary;
                    vx = -vx;
                }

                ctx.beginPath();
                ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                ctx.fill();

                if (y <= GRID_START_Y + BUBBLE_RADIUS) {
                    break;
                }
            }

            ctx.restore();
        }

        function levelWin() {
            if (window.sound) window.sound.playSuccess();

            if (currentLevel < 5) {
                card.innerHTML = `
                    <h3>🎉 كسبت المرحلة! 🎉</h3>
                    <p>لقد فجرت كل الفقاعات! نقاطك: ${score}</p>
                    <button class="menu-btn restart-btn" id="nextBtn">المرحلة التالية ➡️</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('nextBtn').onclick = () => {
                    currentLevel++;
                    initLevel(currentLevel);
                };
            } else {
                card.innerHTML = `
                    <h3>🏆 بطل الفقاعات! 🏆</h3>
                    <p>تهانينا! لقد أنهيت جميع المراحل ببراعة! مجموع نقاطك: ${score}</p>
                    <button class="menu-btn restart-btn" id="finishBtn">العب مجدداً 🔄</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('finishBtn').onclick = () => {
                    currentLevel = 1;
                    score = 0;
                    initLevel(currentLevel);
                };
            }
        }

        function levelGameOver() {
            if (window.sound) window.sound.playFail();

            card.innerHTML = `
                <h3 style="color:#C62828;">💥 خسرت المرحلة! 💥</h3>
                <p>تجاوزت الفقاعات الخط المسموح. حاول مجدداً!</p>
                <button class="menu-btn restart-btn" id="retryBtn">إعادة المحاولة 🔄</button>
            `;
            overlay.style.display = 'flex';
            document.getElementById('retryBtn').onclick = () => {
                initLevel(currentLevel);
            };
        }

        // Clean exit listener
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('pointerup', releaseShot);
        }, { once: true });

        // Start
        initLevel(currentLevel);
        gameLoop();
    };
})();
