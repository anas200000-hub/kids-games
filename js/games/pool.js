// لعبة البلياردو المبسطة - Simplified 8 Ball Pool
(function() {
    window.initPoolGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .pool-game-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
            }
            .pool-hud {
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
            .pool-hud span {
                font-weight: bold;
                font-size: 15px;
            }
            .pool-canvas-container {
                width: 100%;
                max-width: 480px;
                height: 440px; /* Fallback height, overridden dynamically by JS */
                position: relative;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 6px 18px rgba(0,0,0,0.2);
                background: #1B5E20; /* Dark forest green felt table */
            }
            canvas {
                width: 100%;
                height: 100%;
                display: block;
                touch-action: none;
            }
            .pool-overlay {
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
            .pool-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #4CAF50;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .pool-card h3 {
                color: #2E7D32;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .pool-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Elements Creation
        const layout = document.createElement('div');
        layout.className = 'pool-game-layout';
        container.appendChild(layout);

        // Beautiful SVG Logo Header
        const logoContainer = document.createElement('div');
        logoContainer.className = 'pool-logo-container';
        logoContainer.style.cssText = 'width: 100%; display: flex; justify-content: center; margin-bottom: 4px;';
        logoContainer.innerHTML = `
            <svg viewBox="0 0 320 60" style="width: 100%; max-width: 320px; height: auto;">
                <!-- Crossed cue sticks -->
                <line x1="20" y1="48" x2="100" y2="8" stroke="#8D6E63" stroke-width="3" stroke-linecap="round" />
                <line x1="100" y1="48" x2="20" y2="8" stroke="#8D6E63" stroke-width="3" stroke-linecap="round" />
                <!-- Stylized 8-ball in center of crossing -->
                <circle cx="60" cy="28" r="13" fill="#212121" stroke="#FFF" stroke-width="1" />
                <circle cx="60" cy="28" r="6" fill="#FFF" />
                <text x="60" y="32" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#000">8</text>
                <!-- Logo text -->
                <text x="195" y="38" font-family="'Fredoka', 'Tajawal', sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#2E7D32" stroke="#FFF" stroke-width="4.5" paint-order="stroke fill">البلياردو الذكية 8️⃣</text>
            </svg>
        `;
        layout.appendChild(logoContainer);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'اسحب الكرة البيضاء للخلف (كالنباطة) لتحديد الاتجاه والقوة، ثم ارفع إصبعك لضرب الكرات الملونة!';
        instr.style.cssText = 'margin-bottom:8px; width:100%;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'pool-hud';
        layout.appendChild(hud);

        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#2E7D32';
        scoreSpan.innerText = 'الكرات المدخلة: 0 / 15';
        const levelSpan = document.createElement('span');
        levelSpan.style.color = '#1565C0';
        levelSpan.innerText = 'المحاولات: 0';
        hud.appendChild(scoreSpan);
        hud.appendChild(levelSpan);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'pool-canvas-container';
        layout.appendChild(canvasContainer);

        const canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);

        const overlay = document.createElement('div');
        overlay.className = 'pool-overlay';
        overlay.style.display = 'none';
        canvasContainer.appendChild(overlay);

        const card = document.createElement('div');
        card.className = 'pool-card bounce-anim';
        overlay.appendChild(card);

        // Canvas & Physics Config
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;

        let TABLE_MARGIN = 16;
        let BALL_RADIUS = 9;
        let POCKET_RADIUS = 16;

        let isGameRunning = true;
        let score = 0;
        let shotsCount = 0;

        let balls = []; // array of { x, y, vx, vy, color, isCue, targetRadius, isPocketing }
        let pockets = []; // array of { x, y }

        // Touch Input
        let isAiming = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragCurrentX = 0;
        let dragCurrentY = 0;

        function resizeCanvas() {
            width = canvasContainer.clientWidth;
            height = Math.floor(width * 1.48); // Force portrait (vertical) ratio
            canvasContainer.style.height = height + 'px';
            canvas.width = width;
            canvas.height = height;

            TABLE_MARGIN = Math.max(14, Math.floor(width * 0.05)); // wooden border thickness
            BALL_RADIUS = Math.max(9, Math.floor(width / 24)); // slightly larger ball radius for portrait
            POCKET_RADIUS = Math.floor(BALL_RADIUS * 1.6);

            // Re-setup pockets positions (middle pockets on left and right sides)
            pockets = [
                // Corners
                { x: TABLE_MARGIN, y: TABLE_MARGIN },
                { x: width - TABLE_MARGIN, y: TABLE_MARGIN },
                { x: TABLE_MARGIN, y: height - TABLE_MARGIN },
                { x: width - TABLE_MARGIN, y: height - TABLE_MARGIN },
                // Middles (on left and right sides)
                { x: TABLE_MARGIN - 2, y: height / 2 },
                { x: width - TABLE_MARGIN + 2, y: height / 2 }
            ];

            // If balls are already initialized, scale their coordinates proportionally
            if (balls.length > 0) {
                // simple reset to prevent balls getting stuck in boundaries
                resetBallsPosition();
            }
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Target colored ball colors (15 balls: solids and stripes styling)
        // Index 4 is the middle of Row 3, which is the Black 8-ball (#212121)
        const ballColors = [
            '#FFEB3B', '#1E88E5', '#E53935', '#8E24AA', '#212121', 
            '#FB8C00', '#4CAF50', '#8D6E63', '#FFEB3B', '#1E88E5', 
            '#E53935', '#FB8C00', '#4CAF50', '#8D6E63', '#8E24AA'
        ];

        function resetBallsPosition() {
            balls = [];
            
            // White cue ball at the bottom center
            balls.push({
                x: width * 0.5,
                y: height * 0.75,
                vx: 0,
                vy: 0,
                color: '#FFFFFF',
                isCue: true,
                targetRadius: BALL_RADIUS,
                isPocketing: false
            });

            // Triangle setup for 15 colored balls at the top (pointing downwards)
            const triangleCenterX = width * 0.5;
            const triangleCenterY = height * 0.38;

            const hSpacing = BALL_RADIUS * 2 + 0.5;
            const vSpacing = BALL_RADIUS * 1.732;

            // Row 1 (1 ball at bottom)
            balls.push(createTargetBall(triangleCenterX, triangleCenterY, ballColors[0]));
            
            // Row 2 (2 balls above)
            balls.push(createTargetBall(triangleCenterX - hSpacing/2, triangleCenterY - vSpacing, ballColors[1]));
            balls.push(createTargetBall(triangleCenterX + hSpacing/2, triangleCenterY - vSpacing, ballColors[2]));
            
            // Row 3 (3 balls above - middle ball index 4 is Black 8-ball)
            balls.push(createTargetBall(triangleCenterX - hSpacing, triangleCenterY - vSpacing * 2, ballColors[3]));
            balls.push(createTargetBall(triangleCenterX, triangleCenterY - vSpacing * 2, ballColors[4]));
            balls.push(createTargetBall(triangleCenterX + hSpacing, triangleCenterY - vSpacing * 2, ballColors[5]));

            // Row 4 (4 balls above)
            balls.push(createTargetBall(triangleCenterX - hSpacing * 1.5, triangleCenterY - vSpacing * 3, ballColors[6]));
            balls.push(createTargetBall(triangleCenterX - hSpacing * 0.5, triangleCenterY - vSpacing * 3, ballColors[7]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 0.5, triangleCenterY - vSpacing * 3, ballColors[8]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 1.5, triangleCenterY - vSpacing * 3, ballColors[9]));

            // Row 5 (5 balls above)
            balls.push(createTargetBall(triangleCenterX - hSpacing * 2, triangleCenterY - vSpacing * 4, ballColors[10]));
            balls.push(createTargetBall(triangleCenterX - hSpacing, triangleCenterY - vSpacing * 4, ballColors[11]));
            balls.push(createTargetBall(triangleCenterX, triangleCenterY - vSpacing * 4, ballColors[12]));
            balls.push(createTargetBall(triangleCenterX + hSpacing, triangleCenterY - vSpacing * 4, ballColors[13]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 2, triangleCenterY - vSpacing * 4, ballColors[14]));
        }

        function createTargetBall(x, y, color) {
            return {
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                color: color,
                isCue: false,
                targetRadius: BALL_RADIUS,
                isPocketing: false
            };
        }

        // Check if all balls are currently stationary
        function areBallsStationary() {
            return balls.every(b => b.vx === 0 && b.vy === 0);
        }

        // Pointer Event Handlers
        canvas.addEventListener('pointerdown', function(e) {
            if (!isGameRunning || !areBallsStationary()) return;
            
            const rect = canvas.getBoundingClientRect();
            const touchX = e.clientX - rect.left;
            const touchY = e.clientY - rect.top;

            const cueBall = balls.find(b => b.isCue);
            if (!cueBall) return;

            // Touch anywhere to start aiming
            isAiming = true;
            dragStartX = touchX;
            dragStartY = touchY;
            dragCurrentX = touchX;
            dragCurrentY = touchY;
        });

        canvas.addEventListener('pointermove', function(e) {
            if (!isAiming) return;
            const rect = canvas.getBoundingClientRect();
            dragCurrentX = e.clientX - rect.left;
            dragCurrentY = e.clientY - rect.top;
        });

        window.addEventListener('pointerup', function() {
            if (!isAiming) return;
            isAiming = false;

            const cueBall = balls.find(b => b.isCue);
            if (!cueBall) return;

            // Slingshot shot vector (firing in the OPPOSITE direction of drag)
            const dx = dragStartX - dragCurrentX;
            const dy = dragStartY - dragCurrentY;
            const dist = Math.hypot(dx, dy);

            if (dist > 8) {
                // Calculate shot force (capped)
                const maxDrag = Math.min(dist, 100);
                const powerRatio = maxDrag / 100;
                const speed = 2.0 + powerRatio * 16.0; // Stronger speed scale

                const angle = Math.atan2(dy, dx);
                cueBall.vx = Math.cos(angle) * speed;
                cueBall.vy = Math.sin(angle) * speed;

                shotsCount++;
                levelSpan.innerText = `المحاولات: ${shotsCount}`;
                if (window.sound) window.sound.playClick();
            }
        });

        // Main game loops
        function gameLoop() {
            if (!isGameRunning) return;

            updatePhysics();
            drawGame();

            requestAnimationFrame(gameLoop);
        }

        function updatePhysics() {
            // Apply velocities & friction
            balls.forEach(b => {
                if (b.isPocketing) {
                    // shrink effect
                    b.targetRadius -= 0.8;
                    if (b.targetRadius <= 0) {
                        b.targetRadius = 0;
                    }
                    return;
                }

                b.x += b.vx;
                b.y += b.vy;

                // table friction
                b.vx *= 0.982;
                b.vy *= 0.982;

                // Stop if extremely slow
                if (Math.hypot(b.vx, b.vy) < 0.1) {
                    b.vx = 0;
                    b.vy = 0;
                }

                // Table felt limits
                const minX = TABLE_MARGIN + BALL_RADIUS;
                const maxX = width - TABLE_MARGIN - BALL_RADIUS;
                const minY = TABLE_MARGIN + BALL_RADIUS;
                const maxY = height - TABLE_MARGIN - BALL_RADIUS;

                // Wall bounces
                if (b.x < minX) {
                    b.x = minX;
                    b.vx = -b.vx * 0.75;
                    if (Math.abs(b.vx) > 0.5 && window.sound) window.sound.playClick();
                } else if (b.x > maxX) {
                    b.x = maxX;
                    b.vx = -b.vx * 0.75;
                    if (Math.abs(b.vx) > 0.5 && window.sound) window.sound.playClick();
                }

                if (b.y < minY) {
                    b.y = minY;
                    b.vy = -b.vy * 0.75;
                    if (Math.abs(b.vy) > 0.5 && window.sound) window.sound.playClick();
                } else if (b.y > maxY) {
                    b.y = maxY;
                    b.vy = -b.vy * 0.75;
                    if (Math.abs(b.vy) > 0.5 && window.sound) window.sound.playClick();
                }
            });

            // Ball-to-ball collisions
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const bi = balls[i];
                    const bj = balls[j];

                    if (bi.isPocketing || bj.isPocketing) continue;

                    const dist = Math.hypot(bj.x - bi.x, bj.y - bi.y);
                    const minDist = BALL_RADIUS * 2;

                    if (dist < minDist) {
                        // resolve overlap
                        const overlap = minDist - dist;
                        const nx = (bj.x - bi.x) / dist;
                        const ny = (bj.y - bi.y) / dist;

                        bi.x -= nx * overlap * 0.5;
                        bi.y -= ny * overlap * 0.5;
                        bj.x += nx * overlap * 0.5;
                        bj.y += ny * overlap * 0.5;

                        // elastic collision physics
                        const kx = bi.vx - bj.vx;
                        const ky = bi.vy - bj.vy;
                        const p = 2 * (nx * kx + ny * ky) / 2; // relative speed normal projection

                        bi.vx -= p * nx;
                        bi.vy -= p * ny;
                        bj.vx += p * nx;
                        bj.vy += p * ny;

                        if (Math.hypot(bi.vx, bi.vy) > 0.4 && window.sound) {
                            window.sound.playClick();
                        }
                    }
                }
            }

            // Pocketing checks
            for (let i = balls.length - 1; i >= 0; i--) {
                const b = balls[i];
                if (b.isPocketing) {
                    if (b.targetRadius <= 0) {
                        // Fully pocketed!
                        if (b.isCue) {
                            // Cue Ball Foul: reset to bottom center
                            b.isPocketing = false;
                            b.targetRadius = BALL_RADIUS;
                            b.x = width * 0.5;
                            b.y = height * 0.75;
                            b.vx = 0;
                            b.vy = 0;
                        } else {
                            // Target Ball: remove
                            balls.splice(i, 1);
                            score++;
                            scoreSpan.innerText = `الكرات المدخلة: ${score} / 15`;
                            
                            // Check Win
                            if (score >= 15) {
                                levelWin();
                            }
                        }
                    }
                    continue;
                }

                pockets.forEach(p => {
                    const distToPocket = Math.hypot(b.x - p.x, b.y - p.y);
                    if (distToPocket < POCKET_RADIUS) {
                        b.isPocketing = true;
                        b.vx *= 0.15; // slow down instantly
                        b.vy *= 0.15;
                        if (window.sound) window.sound.playPop();
                    }
                });
            }
        }

        // Draw everything
        function drawGame() {
            ctx.clearRect(0, 0, width, height);

            // 1. DRAW WOODEN BORDER (Table)
            ctx.fillStyle = '#5D4037'; // brown wood
            ctx.fillRect(0, 0, width, height);

            // felt area
            ctx.fillStyle = '#2E7D32'; // felt green
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, width - TABLE_MARGIN * 2, height - TABLE_MARGIN * 2);

            // cushion borders
            ctx.fillStyle = '#1B5E20';
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, width - TABLE_MARGIN * 2, 4); // top
            ctx.fillRect(TABLE_MARGIN, height - TABLE_MARGIN - 4, width - TABLE_MARGIN * 2, 4); // bottom
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, 4, height - TABLE_MARGIN * 2); // left
            ctx.fillRect(width - TABLE_MARGIN - 4, TABLE_MARGIN, 4, height - TABLE_MARGIN * 2); // right

            // 2. DRAW POCKETS (black circles with gold rims)
            pockets.forEach(p => {
                // Gold Rim
                ctx.beginPath();
                ctx.arc(p.x, p.y, POCKET_RADIUS + 2, 0, Math.PI * 2);
                ctx.fillStyle = '#D4AF37'; // gold
                ctx.fill();

                // Pocket hole
                ctx.beginPath();
                ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = '#111111'; // hole black
                ctx.fill();
            });

            // 3. DRAW SLINGSHOT CUE GUIDELINE
            if (isAiming) {
                const cueBall = balls.find(b => b.isCue);
                if (cueBall) {
                    const dx = dragStartX - dragCurrentX;
                    const dy = dragStartY - dragCurrentY;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 8) {
                        const angle = Math.atan2(dy, dx);
                        
                        // Draw Aiming Guide Line (dotted)
                        ctx.save();
                        ctx.beginPath();
                        ctx.setLineDash([5, 5]);
                        ctx.moveTo(cueBall.x, cueBall.y);
                        // Extend guide line forward
                        ctx.lineTo(cueBall.x + Math.cos(angle) * Math.min(dist * 2.5, 140), cueBall.y + Math.sin(angle) * Math.min(dist * 2.5, 140));
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.lineWidth = 2.5;
                        ctx.stroke();
                        ctx.restore();

                        // Draw Wooden Cue Stick behind cue ball
                        ctx.save();
                        ctx.translate(cueBall.x, cueBall.y);
                        ctx.rotate(angle);
                        
                        // The pull-back retraction amount
                        const pullBackAmount = Math.min(dist * 0.7, 50);

                        // Draw Cue Stick
                        ctx.beginPath();
                        // Cue tip starts behind cue ball, offset by pullback amount
                        const stickStart = -BALL_RADIUS - 6 - pullBackAmount;
                        ctx.moveTo(stickStart, 0);
                        ctx.lineTo(stickStart - width * 0.45, 0);
                        
                        // Wooden gradient for cue stick
                        const cueGrad = ctx.createLinearGradient(stickStart, 0, stickStart - width * 0.45, 0);
                        cueGrad.addColorStop(0, '#FFE0B2'); // white cue tip
                        cueGrad.addColorStop(0.04, '#FFE0B2');
                        cueGrad.addColorStop(0.05, '#8D6E63'); // brown stick
                        cueGrad.addColorStop(1, '#5D4037'); // dark wood handle
                        
                        ctx.strokeStyle = cueGrad;
                        ctx.lineWidth = 4.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }

            // 4. DRAW BALLS (Glossy 3D)
            balls.forEach(b => {
                if (b.targetRadius <= 0) return;
                drawGlossyBall(b.x, b.y, b.targetRadius, b.color, b.isCue);
            });
        }

        // Draw glossy 3D spheres
        function drawGlossyBall(cx, cy, r, color, isCue) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);

            const grad = ctx.createRadialGradient(cx - r/3, cy - r/3, r * 0.1, cx, cy, r);
            grad.addColorStop(0, '#FFFFFF'); // Specular light highlight
            grad.addColorStop(0.3, color);
            grad.addColorStop(1, adjustColorBrightness(color, -40)); // shadow core
            
            ctx.fillStyle = grad;
            ctx.fill();

            // Draw cue ball core circle or standard target ball numbers for 8 Ball feel!
            if (!isCue && r > BALL_RADIUS * 0.8) {
                // small white circle inside colored ball
                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
            }

            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
        }

        // Helper to adjust color shade for radial gradient shadow
        function adjustColorBrightness(hex, percent) {
            let R = parseInt(hex.substring(1, 3), 16);
            let G = parseInt(hex.substring(3, 5), 16);
            let B = parseInt(hex.substring(5, 7), 16);

            R = parseInt(R * (100 + percent) / 100);
            G = parseInt(G * (100 + percent) / 100);
            B = parseInt(B * (100 + percent) / 100);

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            const rHex = (R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16);
            const gHex = (G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16);
            const bHex = (B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16);

            return "#" + rHex + gHex + bHex;
        }

        function levelWin() {
            if (window.sound) window.sound.playSuccess();

            card.innerHTML = `
                <h3>🏆 فوز رائع! 🏆</h3>
                <p>لقد أسقطت جميع الكرات بنجاح! عدد المحاولات: ${shotsCount}</p>
                <button class="menu-btn restart-btn" id="poolRetryBtn">العب مجدداً 🔄</button>
            `;
            overlay.style.display = 'flex';
            document.getElementById('poolRetryBtn').onclick = () => {
                score = 0;
                shotsCount = 0;
                scoreSpan.innerText = 'الكرات المدخلة: 0 / 15';
                levelSpan.innerText = 'المحاولات: 0';
                overlay.style.display = 'none';
                resetBallsPosition();
            };
        }

        // Clean exit listener
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
            window.removeEventListener('resize', resizeCanvas);
        }, { once: true });

        // Start
        resetBallsPosition();
        gameLoop();
    };
})();
