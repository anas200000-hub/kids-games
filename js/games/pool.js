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

        // Standard 8-Ball setup (1-7 solids, 8 black, 9-15 stripes)
        const ballDefs = [
            { num: 1, color: '#FBC02D', stripe: false }, // Yellow solid (Apex)
            { num: 2, color: '#1976D2', stripe: false }, // Blue solid
            { num: 3, color: '#D32F2F', stripe: false }, // Red solid
            { num: 11, color: '#D32F2F', stripe: true },  // Red stripe
            { num: 8, color: '#212121', stripe: false }, // 8-Ball (Black center of row 3)
            { num: 4, color: '#7B1FA2', stripe: false }, // Purple solid
            { num: 14, color: '#388E3C', stripe: true }, // Green stripe
            { num: 5, color: '#F57C00', stripe: false }, // Orange solid
            { num: 9, color: '#FBC02D', stripe: true },  // Yellow stripe
            { num: 10, color: '#1976D2', stripe: true }, // Blue stripe
            { num: 7, color: '#5D4037', stripe: false }, // Maroon solid
            { num: 12, color: '#7B1FA2', stripe: true }, // Purple stripe
            { num: 6, color: '#388E3C', stripe: false }, // Green solid
            { num: 15, color: '#5D4037', stripe: true }, // Maroon stripe
            { num: 13, color: '#F57C00', stripe: true }  // Orange stripe
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
                num: 0,
                stripe: false,
                targetRadius: BALL_RADIUS,
                isPocketing: false
            });

            // Triangle setup for 15 colored balls at the top (pointing downwards)
            const triangleCenterX = width * 0.5;
            const triangleCenterY = height * 0.38;

            const hSpacing = BALL_RADIUS * 2 + 0.5;
            const vSpacing = BALL_RADIUS * 1.732;

            // Row 1 (1 ball at apex)
            balls.push(createTargetBall(triangleCenterX, triangleCenterY, ballDefs[0]));
            
            // Row 2 (2 balls)
            balls.push(createTargetBall(triangleCenterX - hSpacing/2, triangleCenterY - vSpacing, ballDefs[1]));
            balls.push(createTargetBall(triangleCenterX + hSpacing/2, triangleCenterY - vSpacing, ballDefs[2]));
            
            // Row 3 (3 balls - center is 8-ball)
            balls.push(createTargetBall(triangleCenterX - hSpacing, triangleCenterY - vSpacing * 2, ballDefs[3]));
            balls.push(createTargetBall(triangleCenterX, triangleCenterY - vSpacing * 2, ballDefs[4]));
            balls.push(createTargetBall(triangleCenterX + hSpacing, triangleCenterY - vSpacing * 2, ballDefs[5]));

            // Row 4 (4 balls)
            balls.push(createTargetBall(triangleCenterX - hSpacing * 1.5, triangleCenterY - vSpacing * 3, ballDefs[6]));
            balls.push(createTargetBall(triangleCenterX - hSpacing * 0.5, triangleCenterY - vSpacing * 3, ballDefs[7]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 0.5, triangleCenterY - vSpacing * 3, ballDefs[8]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 1.5, triangleCenterY - vSpacing * 3, ballDefs[9]));

            // Row 5 (5 balls at top)
            balls.push(createTargetBall(triangleCenterX - hSpacing * 2, triangleCenterY - vSpacing * 4, ballDefs[10]));
            balls.push(createTargetBall(triangleCenterX - hSpacing, triangleCenterY - vSpacing * 4, ballDefs[11]));
            balls.push(createTargetBall(triangleCenterX, triangleCenterY - vSpacing * 4, ballDefs[12]));
            balls.push(createTargetBall(triangleCenterX + hSpacing, triangleCenterY - vSpacing * 4, ballDefs[13]));
            balls.push(createTargetBall(triangleCenterX + hSpacing * 2, triangleCenterY - vSpacing * 4, ballDefs[14]));
        }

        function createTargetBall(x, y, def) {
            return {
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                color: def.color,
                num: def.num,
                stripe: def.stripe,
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

            // 1. DRAW REALISTIC WOODEN BORDER & RAIL
            // Mahogany outer wood rail
            const woodGrad = ctx.createLinearGradient(0, 0, width, height);
            woodGrad.addColorStop(0, '#3E2723');
            woodGrad.addColorStop(0.5, '#4E342E');
            woodGrad.addColorStop(1, '#2D1D19');
            ctx.fillStyle = woodGrad;
            ctx.fillRect(0, 0, width, height);

            // Wood inner bevel / trim
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(2, 2, width - 4, height - 4);
            ctx.fillStyle = woodGrad;
            ctx.fillRect(4, 4, width - 8, height - 8);

            // Inlaid Mother-of-Pearl Diamond Sights on the rails
            ctx.fillStyle = '#E0E0E0';
            const drawDiamond = (dx, dy) => {
                ctx.beginPath();
                ctx.moveTo(dx, dy - 2.5);
                ctx.lineTo(dx + 2.5, dy);
                ctx.lineTo(dx, dy + 2.5);
                ctx.lineTo(dx - 2.5, dy);
                ctx.closePath();
                ctx.fill();
            };
            // Horizontal rails diamonds
            [0.25, 0.5, 0.75].forEach(ratio => {
                drawDiamond(width * ratio, TABLE_MARGIN * 0.45);
                drawDiamond(width * ratio, height - TABLE_MARGIN * 0.45);
            });
            // Vertical rails diamonds
            [0.25, 0.75].forEach(ratio => {
                drawDiamond(TABLE_MARGIN * 0.45, height * ratio);
                drawDiamond(width - TABLE_MARGIN * 0.45, height * ratio);
            });

            // 2. REALISTIC CLOTH / FELT
            // Main baize green with realistic center illumination
            const feltGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.1, width * 0.5, height * 0.5, height * 0.65);
            feltGrad.addColorStop(0, '#2E7D32'); // lively tournament green
            feltGrad.addColorStop(0.7, '#1B5E20'); // deep forest green
            feltGrad.addColorStop(1, '#0E3B13'); // shadowed edge felt
            ctx.fillStyle = feltGrad;
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, width - TABLE_MARGIN * 2, height - TABLE_MARGIN * 2);

            // Table Head String Line (Dotted subtle white line)
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.moveTo(TABLE_MARGIN + 6, height * 0.75);
            ctx.lineTo(width - TABLE_MARGIN - 6, height * 0.75);
            ctx.stroke();
            ctx.restore();

            // Head spot
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.75, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fill();

            // Cushions (Rubber bumper shadow & highlight)
            // Inner rubber cushion bevel
            ctx.fillStyle = '#0D4114';
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, width - TABLE_MARGIN * 2, 6); // Top cushion
            ctx.fillRect(TABLE_MARGIN, height - TABLE_MARGIN - 6, width - TABLE_MARGIN * 2, 6); // Bottom
            ctx.fillRect(TABLE_MARGIN, TABLE_MARGIN, 6, height - TABLE_MARGIN * 2); // Left
            ctx.fillRect(width - TABLE_MARGIN - 6, TABLE_MARGIN, 6, height - TABLE_MARGIN * 2); // Right

            // Cushion highlight lip
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(TABLE_MARGIN + 6, TABLE_MARGIN + 5, width - (TABLE_MARGIN + 6) * 2, 1.5);
            ctx.fillRect(TABLE_MARGIN + 6, height - TABLE_MARGIN - 6.5, width - (TABLE_MARGIN + 6) * 2, 1.5);
            ctx.fillRect(TABLE_MARGIN + 5, TABLE_MARGIN + 6, 1.5, height - (TABLE_MARGIN + 6) * 2);
            ctx.fillRect(width - TABLE_MARGIN - 6.5, TABLE_MARGIN + 6, 1.5, height - (TABLE_MARGIN + 6) * 2);

            // 3. DRAW REALISTIC RECESSED POCKETS
            pockets.forEach(p => {
                // Brass / Golden Pocket Bracket
                ctx.beginPath();
                ctx.arc(p.x, p.y, POCKET_RADIUS + 3.5, 0, Math.PI * 2);
                const brassGrad = ctx.createRadialGradient(p.x - 2, p.y - 2, 2, p.x, p.y, POCKET_RADIUS + 3.5);
                brassGrad.addColorStop(0, '#FFF59D');
                brassGrad.addColorStop(0.5, '#FBC02D');
                brassGrad.addColorStop(1, '#825A00');
                ctx.fillStyle = brassGrad;
                ctx.fill();

                // Leather pocket rim
                ctx.beginPath();
                ctx.arc(p.x, p.y, POCKET_RADIUS + 1, 0, Math.PI * 2);
                ctx.fillStyle = '#3E2723';
                ctx.fill();

                // Deep Dark Hole with soft falloff shadow
                ctx.beginPath();
                ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
                const holeGrad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, POCKET_RADIUS);
                holeGrad.addColorStop(0, '#000000');
                holeGrad.addColorStop(0.85, '#050505');
                holeGrad.addColorStop(1, '#1a1a1a');
                ctx.fillStyle = holeGrad;
                ctx.fill();
            });

            // 3. DRAW SLINGSHOT CUE GUIDELINE & REALISTIC TAPERED CUE STICK
            if (isAiming) {
                const cueBall = balls.find(b => b.isCue);
                if (cueBall) {
                    const dx = dragStartX - dragCurrentX;
                    const dy = dragStartY - dragCurrentY;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 8) {
                        const angle = Math.atan2(dy, dx);
                        const aimDist = Math.min(dist * 3.0, 220);
                        const targetX = cueBall.x + Math.cos(angle) * aimDist;
                        const targetY = cueBall.y + Math.sin(angle) * aimDist;

                        // Draw Aiming Guide Line (crisp laser path with soft glow)
                        ctx.save();
                        ctx.beginPath();
                        ctx.setLineDash([6, 5]);
                        ctx.moveTo(cueBall.x, cueBall.y);
                        ctx.lineTo(targetX, targetY);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.lineWidth = 1.8;
                        ctx.stroke();

                        // Target ghost circle at the end of line
                        ctx.beginPath();
                        ctx.arc(targetX, targetY, BALL_RADIUS * 0.8, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.lineWidth = 1.2;
                        ctx.setLineDash([3, 3]);
                        ctx.stroke();
                        ctx.restore();

                        // Draw Realistic Tapered Wood Cue Stick behind cue ball
                        ctx.save();
                        ctx.translate(cueBall.x, cueBall.y);
                        ctx.rotate(angle);
                        
                        const pullBack = Math.min(dist * 0.7, 55);
                        const tipX = -BALL_RADIUS - 6 - pullBack;
                        const stickLen = Math.max(160, width * 0.48);
                        const buttX = tipX - stickLen;

                        // Cue shadow on felt
                        ctx.save();
                        ctx.translate(3, 4);
                        ctx.beginPath();
                        ctx.moveTo(tipX, -1.5);
                        ctx.lineTo(buttX, -4.5);
                        ctx.lineTo(buttX, 4.5);
                        ctx.lineTo(tipX, 1.5);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                        ctx.fill();
                        ctx.restore();

                        // Cue Maple Shaft (tapered)
                        ctx.beginPath();
                        ctx.moveTo(tipX, -1.8);
                        ctx.lineTo(buttX, -4.5);
                        ctx.lineTo(buttX, 4.5);
                        ctx.lineTo(tipX, 1.8);
                        ctx.closePath();
                        
                        const cueWoodGrad = ctx.createLinearGradient(buttX, 0, tipX, 0);
                        cueWoodGrad.addColorStop(0, '#2D1B10'); // Dark mahogany butt
                        cueWoodGrad.addColorStop(0.35, '#4E342E'); // Grip section
                        cueWoodGrad.addColorStop(0.4, '#D7CCC8'); // Inlaid decorative ring
                        cueWoodGrad.addColorStop(0.42, '#5D4037');
                        cueWoodGrad.addColorStop(0.55, '#D7A768'); // Hard rock maple shaft
                        cueWoodGrad.addColorStop(0.96, '#ECD0A8');
                        cueWoodGrad.addColorStop(1, '#FFF9C4'); // White ferrule
                        ctx.fillStyle = cueWoodGrad;
                        ctx.fill();

                        // Blue chalk tip
                        ctx.fillStyle = '#1976D2';
                        ctx.fillRect(tipX - 1.5, -1.6, 2.5, 3.2);

                        // Highlight sheen along cue spine
                        ctx.beginPath();
                        ctx.moveTo(tipX - 2, -0.6);
                        ctx.lineTo(buttX, -1.5);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.restore();
                    }
                }
            }

            // 4. DRAW BALLS (Glossy 3D Spheres)
            balls.forEach(b => {
                if (b.targetRadius <= 0) return;
                drawGlossyBall(b);
            });
        }

        // Draw hyper-realistic 3D billiard spheres
        function drawGlossyBall(b) {
            const cx = b.x;
            const cy = b.y;
            const r = b.targetRadius;
            const color = b.color;
            const isCue = b.isCue;
            const num = b.num;
            const stripe = b.stripe;

            if (r <= 0) return;

            // 1. SOFT CONTACT DROP SHADOW UNDER BALL
            if (!b.isPocketing) {
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(cx + r * 0.12, cy + r * 0.78, r * 0.88, r * 0.35, 0, 0, Math.PI * 2);
                const shadowGrad = ctx.createRadialGradient(cx + r * 0.12, cy + r * 0.78, 0, cx + r * 0.12, cy + r * 0.78, r * 0.88);
                shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
                shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
                shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = shadowGrad;
                ctx.fill();
                ctx.restore();
            }

            // 2. BALL SPHERE BASE
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip(); // Clip everything to the spherical circumference

            if (isCue) {
                // Realistic Cue Ball (Pristine resin ivory with spherical lighting)
                const cueGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r * 1.05);
                cueGrad.addColorStop(0, '#FFFFFF');
                cueGrad.addColorStop(0.45, '#F9FAFB');
                cueGrad.addColorStop(0.8, '#D1D5DB');
                cueGrad.addColorStop(1, '#6B7280');
                ctx.fillStyle = cueGrad;
                ctx.fill();

                // Authentic Aramith red dot on cue ball
                ctx.beginPath();
                ctx.arc(cx, cy, Math.max(1.8, r * 0.12), 0, Math.PI * 2);
                ctx.fillStyle = '#D32F2F';
                ctx.fill();
            } else if (stripe) {
                // Striped Ball (Ivory base + colored middle band)
                // First: Ivory base sphere
                const ivoryGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r * 1.05);
                ivoryGrad.addColorStop(0, '#FFFFFF');
                ivoryGrad.addColorStop(0.45, '#F3F4F6');
                ivoryGrad.addColorStop(0.8, '#D1D5DB');
                ivoryGrad.addColorStop(1, '#6B7280');
                ctx.fillStyle = ivoryGrad;
                ctx.fill();

                // Second: Colored middle band / stripe
                const stripeThickness = r * 0.95;
                ctx.beginPath();
                ctx.rect(cx - r * 1.1, cy - stripeThickness / 2, r * 2.2, stripeThickness);
                
                // Realistic gradient for stripe matching the sphere curvature
                const stripeGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r * 1.05);
                stripeGrad.addColorStop(0, adjustColorBrightness(color, 25));
                stripeGrad.addColorStop(0.4, color);
                stripeGrad.addColorStop(0.82, adjustColorBrightness(color, -40));
                stripeGrad.addColorStop(1, adjustColorBrightness(color, -65));
                ctx.fillStyle = stripeGrad;
                ctx.fill();

                // Stripe border lines
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(cx - r, cy - stripeThickness / 2);
                ctx.lineTo(cx + r, cy - stripeThickness / 2);
                ctx.moveTo(cx - r, cy + stripeThickness / 2);
                ctx.lineTo(cx + r, cy + stripeThickness / 2);
                ctx.stroke();
            } else {
                // Solid Ball (Full color with deep 3D volume shading)
                const solidGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r * 1.05);
                solidGrad.addColorStop(0, adjustColorBrightness(color, 35));
                solidGrad.addColorStop(0.35, color);
                solidGrad.addColorStop(0.8, adjustColorBrightness(color, -40));
                solidGrad.addColorStop(1, adjustColorBrightness(color, -65));
                ctx.fillStyle = solidGrad;
                ctx.fill();
            }

            // 3. NUMBER BADGE (White circle with clear ball number for 1-15)
            if (!isCue && r > 7) {
                const badgeR = r * 0.42;
                
                // White badge disc with subtle 3D depth
                ctx.beginPath();
                ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
                const badgeGrad = ctx.createRadialGradient(cx - badgeR * 0.3, cy - badgeR * 0.3, 0, cx, cy, badgeR);
                badgeGrad.addColorStop(0, '#FFFFFF');
                badgeGrad.addColorStop(0.8, '#F0F0F0');
                badgeGrad.addColorStop(1, '#D6D6D6');
                ctx.fillStyle = badgeGrad;
                ctx.fill();

                // Subtle badge rim
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Number text
                ctx.fillStyle = '#1A1A1A';
                const fontSize = Math.max(7, Math.round(r * 0.46));
                ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(num, cx, cy + 0.5);

                // Underline standard for numbers 6 and 9
                if (num === 6 || num === 9) {
                    ctx.beginPath();
                    const lineW = fontSize * 0.45;
                    ctx.moveTo(cx - lineW / 2, cy + fontSize * 0.42);
                    ctx.lineTo(cx + lineW / 2, cy + fontSize * 0.42);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#1A1A1A';
                    ctx.stroke();
                }
            }

            // 4. REFLECTION & GLOSS (Billiard ball specular highlights & bounce light)
            // A. Primary crisp bright hot-spot specular highlight
            ctx.beginPath();
            ctx.ellipse(cx - r * 0.32, cy - r * 0.34, r * 0.28, r * 0.18, -Math.PI / 6, 0, Math.PI * 2);
            const specGrad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.34, 0, cx - r * 0.32, cy - r * 0.34, r * 0.28);
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = specGrad;
            ctx.fill();

            // B. Secondary soft ambient reflection highlight
            ctx.beginPath();
            ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.45, 0, Math.PI * 2);
            const softGlow = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx - r * 0.25, cy - r * 0.25, r * 0.45);
            softGlow.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
            softGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = softGlow;
            ctx.fill();

            // C. Bottom rim felt bounce light (Fresnel-like green reflection from the baize cloth)
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
            const rimBounceGrad = ctx.createRadialGradient(cx + r * 0.3, cy + r * 0.45, r * 0.4, cx, cy, r);
            rimBounceGrad.addColorStop(0, 'rgba(46, 125, 50, 0)');
            rimBounceGrad.addColorStop(0.85, 'rgba(76, 175, 80, 0.18)');
            rimBounceGrad.addColorStop(1, 'rgba(129, 199, 132, 0.35)');
            ctx.fillStyle = rimBounceGrad;
            ctx.fill();

            ctx.restore(); // restores clip

            // 5. CRISP OUTER SPHERE RIM (Dark ambient occlusion outline)
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.lineWidth = 0.75;
            ctx.stroke();
            ctx.restore();
        }

        // Helper to adjust color shade for radial gradient shadow and highlight
        function adjustColorBrightness(hex, percent) {
            let R = parseInt(hex.substring(1, 3), 16);
            let G = parseInt(hex.substring(3, 5), 16);
            let B = parseInt(hex.substring(5, 7), 16);

            if (percent > 0) {
                // Blend towards white for realistic highlights
                const factor = percent / 100;
                R = Math.round(R + (255 - R) * factor);
                G = Math.round(G + (255 - G) * factor);
                B = Math.round(B + (255 - B) * factor);
            } else {
                // Blend towards black for realistic shadows
                const factor = (100 + percent) / 100;
                R = Math.round(R * factor);
                G = Math.round(G * factor);
                B = Math.round(B * factor);
            }

            R = Math.min(255, Math.max(0, R));
            G = Math.min(255, Math.max(0, G));
            B = Math.min(255, Math.max(0, B));

            const rHex = R.toString(16).padStart(2, '0');
            const gHex = G.toString(16).padStart(2, '0');
            const bHex = B.toString(16).padStart(2, '0');

            return '#' + rHex + gHex + bHex;
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
