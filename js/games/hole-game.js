// Game: The Black Hole (الثقب الأسود)
(function() {
    window.initHoleGame = function(container) {
        let level = 1; // Stage levels: 1 to 10
        let items = [];
        let gameActive = true;
        let animationId = null;
        let timerInterval = null;
        let swirlAngle = 0; // Angle for vortex rotation
        let score = 0;
        let timeLeft = 60;

        const CANVAS_W = 380;
        const CANVAS_H = 460;

        // Hole state - Re-scaled to match physical sweets sizes
        let hole = {
            x: CANVAS_W / 2,
            y: CANVAS_H / 2,
            targetX: CANVAS_W / 2,
            targetY: CANVAS_H / 2,
            radius: 16, // Starts at diameter 32px (Eats small items <= 25px)
            targetRadius: 16,
            holeSizeLevel: 1, // Hole growth size: 1 to 5
            eatenCount: 0
        };

        // Sweets Scattered items definition
        const ITEM_TEMPLATES = [
            // Level 1: Small sweets (sizePx: 22 to 25)
            { emoji: '🍒', sizeVal: 1, sizePx: 22, name: 'كرز حلو' },
            { emoji: '🍓', sizeVal: 1, sizePx: 23, name: 'فراولة طازجة' },
            { emoji: '🍬', sizeVal: 1, sizePx: 25, name: 'حلوى ملونة' },
            { emoji: '🍫', sizeVal: 1, sizePx: 25, name: 'شوكولاتة' },
            { emoji: '🍪', sizeVal: 1, sizePx: 25, name: 'بسكويت' },
            { emoji: '🍡', sizeVal: 1, sizePx: 25, name: 'حلوى سيخ' },
            
            // Level 2: Medium sweets (sizePx: 35 to 38)
            { emoji: '🧁', sizeVal: 2, sizePx: 35, name: 'كاب كيك' },
            { emoji: '🍎', sizeVal: 2, sizePx: 36, name: 'تفاحة حمراء' },
            { emoji: '🍦', sizeVal: 2, sizePx: 38, name: 'آيس كريم' },
            { emoji: '🍩', sizeVal: 2, sizePx: 38, name: 'دونات مغطاة' },
            { emoji: '🍧', sizeVal: 2, sizePx: 38, name: 'ثلج محلى' },
            
            // Level 3: Large sweets (sizePx: 52 to 58)
            { emoji: '🍭', sizeVal: 3, sizePx: 52, name: 'مصاصة عملاقة' },
            { emoji: '🎂', sizeVal: 3, sizePx: 54, name: 'قالب كيك' },
            { emoji: '🍉', sizeVal: 3, sizePx: 54, name: 'شريحة بطيخ' },
            { emoji: '🥞', sizeVal: 3, sizePx: 58, name: 'بان كيك' },
            { emoji: '🍯', sizeVal: 3, sizePx: 58, name: 'عسل لذيذ' }
        ];

        // Progressive configuration for levels 1 to 10
        function getLevelConfig(lvl) {
            const configs = {
                1: { small: 15, medium: 0, large: 0, time: 90 },
                2: { small: 20, medium: 0, large: 0, time: 80 },
                3: { small: 20, medium: 5, large: 0, time: 75 },
                4: { small: 22, medium: 8, large: 0, time: 70 },
                5: { small: 25, medium: 10, large: 0, time: 65 },
                6: { small: 25, medium: 12, large: 3, time: 60 },
                7: { small: 25, medium: 15, large: 5, time: 60 },
                8: { small: 28, medium: 15, large: 7, time: 55 },
                9: { small: 30, medium: 17, large: 8, time: 50 },
                10: { small: 30, medium: 20, large: 10, time: 45 }
            };
            return configs[lvl] || { small: 30, medium: 20, large: 10, time: 45 };
        }

        // Generate items randomly scattered on the black background
        function initItems() {
            items = [];
            const config = getLevelConfig(level);

            // Spawn small sweets
            const smallTemplates = ITEM_TEMPLATES.filter(t => t.sizeVal === 1);
            for (let i = 0; i < config.small; i++) {
                const template = smallTemplates[Math.floor(Math.random() * smallTemplates.length)];
                spawnItem(template);
            }

            // Spawn medium sweets
            const mediumTemplates = ITEM_TEMPLATES.filter(t => t.sizeVal === 2);
            for (let i = 0; i < config.medium; i++) {
                const template = mediumTemplates[Math.floor(Math.random() * mediumTemplates.length)];
                spawnItem(template);
            }

            // Spawn large sweets
            const largeTemplates = ITEM_TEMPLATES.filter(t => t.sizeVal === 3);
            for (let i = 0; i < config.large; i++) {
                const template = largeTemplates[Math.floor(Math.random() * largeTemplates.length)];
                spawnItem(template);
            }
        }

        function spawnItem(template) {
            const margin = template.sizePx / 2 + 15;
            const x = margin + Math.random() * (CANVAS_W - margin * 2);
            const y = margin + Math.random() * (CANVAS_H - margin * 2);

            items.push({
                x,
                y,
                emoji: template.emoji,
                sizeVal: template.sizeVal,
                sizePx: template.sizePx,
                name: template.name,
                isEaten: false,
                eatProgress: 0, 
                shakeTimer: 0   
            });
        }

        // Layout HTML template with wsHoleScore restored and game title renamed to 'الثقب الأسود'
        let html = `
            <div class="game-hole-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; box-sizing: border-box; font-family: var(--font-kids); user-select: none; direction: rtl;">
                <h2 class="game-title" style="color: #FF9800; margin-bottom: 2px;">😋 الثقب الأسود 😋</h2>
                <p class="game-instructions" style="margin-bottom: 6px; font-size: 0.8rem;">التهام الحلويات المبعثرة! لا يمكن أكل الحلوى إلا إذا كانت أصغر من الثقب فيزيائياً!</p>
                
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 6px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); box-sizing: border-box; margin-bottom: 8px; gap: 4px; font-size: 13px;">
                    <div style="font-weight: bold; color: #E65100;">المستوى: <span id="wsHoleStage">1 / 10</span></div>
                    <div style="font-weight: bold; color: #E91E63;">النقاط: <span id="wsHoleScore">0</span></div>
                    <div style="font-weight: bold; color: #4CAF50;">الحجم: <span id="wsHoleLevel">1</span></div>
                    <div style="font-weight: bold; color: #E53935;">الوقت: <span id="wsHoleTime">60</span>ث</div>
                </div>

                <div class="canvas-container" style="position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.25); border: 4px solid #FFA726; background: #000000;">
                    <canvas id="wsHoleCanvas" width="${CANVAS_W}" height="${CANVAS_H}" style="display: block; touch-action: none; cursor: pointer; background: #000000;"></canvas>
                </div>

                <!-- Game Over failure Modal -->
                <div id="wsHoleFailModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-weight: 900;">⏳ انتهى الوقت! ⏳</h3>
                        <p>لقد شبع الثقب ولكن الحلويات لا زالت مبعثرة! أعد المحاولة!</p>
                        <button class="menu-btn restart-btn" id="wsHoleRestartBtn" style="background-color: #E53935; box-shadow: 0 5px 0 #b71c1c; margin: 15px auto 0;">حاول مجدداً 🔄</button>
                    </div>
                </div>

                <!-- Victory Modal -->
                <div id="wsHoleWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 4px solid #4CAF50; margin: auto;">
                        <h3 id="wsHoleWinTitle" style="color: #4CAF50; font-weight: 900;">🎉 عمل رائع يا بطل! 🎉</h3>
                        <p id="wsHoleWinMessage">لقد نجحت في التهام جميع الحلويات! استعد للمستوى التالي.</p>
                        <button class="menu-btn restart-btn" id="wsHoleNextBtn" style="background-color: #4CAF50; box-shadow: 0 5px 0 #1b5e20; margin: 15px auto 0;">المستوى التالي ➡️</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('wsHoleCanvas');
        const ctx = canvas.getContext('2d');
        const scoreText = document.getElementById('wsHoleScore');
        const levelText = document.getElementById('wsHoleLevel');
        const stageText = document.getElementById('wsHoleStage');
        const timeText = document.getElementById('wsHoleTime');
        const failModal = document.getElementById('wsHoleFailModal');
        const winModal = document.getElementById('wsHoleWinModal');
        const restartBtn = document.getElementById('wsHoleRestartBtn');
        const nextBtn = document.getElementById('wsHoleNextBtn');
        const winTitle = document.getElementById('wsHoleWinTitle');
        const winMessage = document.getElementById('wsHoleWinMessage');

        let isDragging = false;

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (CANVAS_W / rect.width),
                y: (clientY - rect.top) * (CANVAS_H / rect.height)
            };
        }

        function handleStart(e) {
            isDragging = true;
            const pos = getMousePos(e);
            hole.targetX = pos.x;
            hole.targetY = pos.y;
        }

        function handleMove(e) {
            if (!isDragging || !gameActive) return;
            e.preventDefault();
            const pos = getMousePos(e);
            hole.targetX = pos.x;
            hole.targetY = pos.y;
        }

        function handleEnd() {
            isDragging = false;
        }

        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        canvas.addEventListener('touchstart', handleStart);
        canvas.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        // Core physics and collision update
        function update() {
            if (!gameActive) return;

            // Interpolate hole position
            hole.x += (hole.targetX - hole.x) * 0.16;
            hole.y += (hole.targetY - hole.y) * 0.16;

            // Keep hole inside bounds
            hole.x = Math.max(hole.radius, Math.min(CANVAS_W - hole.radius, hole.x));
            hole.y = Math.max(hole.radius, Math.min(CANVAS_H - hole.radius, hole.y));

            // Interpolate radius changes
            hole.radius += (hole.targetRadius - hole.radius) * 0.1;

            // Update rotation angle for swirling vortex
            swirlAngle += 0.055;

            // Collision check
            items.forEach(item => {
                if (item.isEaten) {
                    if (item.eatProgress < 1.0) {
                        item.eatProgress += 0.08;
                        // 3D Pull effect: Pull towards center and DOWN towards bottom tunnel
                        const targetX = hole.x;
                        const targetY = hole.y + (hole.radius * 0.45); // Shift Y to show depth
                        item.x += (targetX - item.x) * 0.22;
                        item.y += (targetY - item.y) * 0.22;
                    }
                    return;
                }

                const dx = item.x - hole.x;
                const dy = item.y - hole.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check physical sizes! Can only be eaten if diameter (sizePx) <= hole's diameter (hole.radius * 2)
                if (distance < hole.radius - 2) {
                    if (item.sizePx <= hole.radius * 2) {
                        item.isEaten = true;
                        item.eatProgress = 0;
                        if (window.sound) {
                            window.sound.playPop();
                        }

                        setTimeout(() => {
                            score += item.sizeVal * 10;
                            scoreText.innerText = score;

                            hole.eatenCount++;
                            checkHoleGrowth();

                            items = items.filter(it => it !== item);

                            if (items.length === 0) {
                                triggerWin();
                            }
                        }, 250);
                    } else {
                        // Shake if item is physically too big to enter the hole
                        if (item.shakeTimer === 0) {
                            item.shakeTimer = 15;
                            if (window.sound) {
                                window.sound.playFail();
                            }
                        }
                    }
                }

                if (item.shakeTimer > 0) {
                    item.shakeTimer--;
                }
            });
        }

        // Check level progression thresholds (based on count to trigger physical size growth)
        function checkHoleGrowth() {
            if (hole.holeSizeLevel === 1 && hole.eatenCount >= 6) {
                growHole(2, 23); // Grow diameter to 46px (Eats medium 35-38px)
            } else if (hole.holeSizeLevel === 2 && hole.eatenCount >= 14) {
                growHole(3, 33); // Grow diameter to 66px (Eats large 52-58px)
            } else if (hole.holeSizeLevel === 3 && hole.eatenCount >= 25) {
                growHole(4, 48); // Grow diameter to 96px
            } else if (hole.holeSizeLevel === 4 && hole.eatenCount >= 35) {
                growHole(5, 65); // Grow diameter to 130px
            }
        }

        function growHole(newLvl, newRadius) {
            hole.holeSizeLevel = newLvl;
            hole.targetRadius = newRadius;
            levelText.innerText = newLvl;
            if (window.sound) {
                window.sound.playSuccess();
            }
        }

        // Draw frame with High Quality 3D Portal and Opaque items drawn on top
        function draw() {
            // Explicitly reset shadow state first to prevent leaks
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // 1. Solid Black Screen Background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // 2. Draw 3D Tunnel Depth inside the hole
            // 3D cylindrical back wall (bottom of tunnel)
            ctx.beginPath();
            ctx.arc(hole.x, hole.y + (hole.radius * 0.25), hole.radius * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = '#090c0f'; // pitch black bottom
            ctx.fill();

            // Swirling suction spiral lines
            ctx.save();
            ctx.translate(hole.x, hole.y);
            
            const glowColor = hole.holeSizeLevel === 1 ? '0, 168, 255' : 
                               hole.holeSizeLevel === 2 ? '46, 213, 115' : 
                               hole.holeSizeLevel === 3 ? '255, 165, 2' : 
                               '155, 93, 229';

            const rings = 3;
            for (let i = 0; i < rings; i++) {
                ctx.save();
                const radius = hole.radius + 5 + (i * 9);
                const rot = swirlAngle * (i % 2 === 0 ? 1 : -1) * 0.95;
                ctx.rotate(rot);

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.setLineDash([8, 10]);
                ctx.strokeStyle = `rgba(${glowColor}, ${0.45 - (i * 0.15)})`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();

            // Main black hole opening (radial gradient)
            const holeGradient = ctx.createRadialGradient(
                hole.x, hole.y, 2, 
                hole.x, hole.y, hole.radius
            );
            holeGradient.addColorStop(0, 'rgba(0,0,0,0.95)');
            holeGradient.addColorStop(0.75, 'rgba(30,39,46,0.95)');
            holeGradient.addColorStop(0.92, 'rgba(15,23,30,0.98)');
            holeGradient.addColorStop(1, '#000000');

            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = holeGradient;
            ctx.fill();

            // Glowing lip ring around hole opening
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${glowColor}, 0.85)`;
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // 3. Draw sweets items ON TOP OF THE HOLE (Swallowing is now perfectly visible!)
            items.forEach(item => {
                ctx.save();
                
                let scale = 1.0;
                let opacity = 1.0;

                if (item.isEaten) {
                    scale = Math.max(0, 1.0 - item.eatProgress);
                    opacity = Math.max(0, 1.0 - item.eatProgress);
                    ctx.translate(item.x, item.y);
                    ctx.rotate(item.eatProgress * Math.PI * 4); // spin
                    ctx.translate(-item.x, -item.y);
                } else if (item.shakeTimer > 0) {
                    const shakeVal = (Math.sin(item.shakeTimer * 1.5) * 5.5);
                    ctx.translate(shakeVal, 0);
                }

                ctx.globalAlpha = opacity;
                
                // (No dark shadows are drawn on black screen to keep sweets 100% bright and clean!)

                // Reset shadow properties of context explicitly (no blur for normal drawing)
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                // Draw red warning highlight if item is physically larger than the hole opening
                if (!item.isEaten && item.sizePx > hole.radius * 2) {
                    ctx.shadowColor = '#FF3D00';
                    ctx.shadowBlur = 12;
                }

                // Render sweet emoji with correct font parameters (Fixes 10px bug!)
                ctx.font = `bold ${Math.floor(item.sizePx * scale)}px 'Fredoka', 'Tajawal', 'Segoe UI Emoji', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji, item.x, item.y);
                
                ctx.restore();
            });
        }

        // Animation Loop
        function loop() {
            update();
            draw();
            if (gameActive) {
                animationId = requestAnimationFrame(loop);
            }
        }

        // Timer controller
        function startTimer() {
            const config = getLevelConfig(level);
            timeLeft = config.time;
            timeText.innerText = timeLeft;
            timerInterval = setInterval(() => {
                if (!gameActive) return;
                timeLeft--;
                timeText.innerText = timeLeft;
                if (timeLeft <= 0) {
                    triggerFail();
                }
            }, 1000);
        }

        // Win / Fail controllers
        function triggerFail() {
            gameActive = false;
            clearInterval(timerInterval);
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playFail();
            }
            failModal.style.display = 'flex';
        }

        function triggerWin() {
            gameActive = false;
            clearInterval(timerInterval);
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playSuccess();
            }
            
            // Check if Level 10 (Final level) is beaten
            if (level === 10) {
                winTitle.innerText = '🏆 بطل الثقب الأسود العظيم! 🏆';
                winMessage.innerText = 'تهانينا! لقد أنهيت كل مستويات الثقب الأسود بنجاح وأكلت كل الحلويات!';
                nextBtn.innerText = 'العب من جديد 🔄';
            } else {
                winTitle.innerText = '🎉 عمل رائع يا بطل! 🎉';
                winMessage.innerText = 'لقد نجحت في التهام جميع الحلويات! استعد للمستوى التالي.';
                nextBtn.innerText = 'المستوى التالي ➡️';
            }
            
            winModal.style.display = 'flex';
        }

        function resetGame() {
            score = 0;
            scoreText.innerText = '0';
            hole.holeSizeLevel = 1;
            hole.eatenCount = 0;
            hole.radius = 16;
            hole.targetRadius = 16;
            hole.x = CANVAS_W / 2;
            hole.y = CANVAS_H / 2;
            hole.targetX = CANVAS_W / 2;
            hole.targetY = CANVAS_H / 2;
            levelText.innerText = '1';
            stageText.innerText = `${level} / 10`;
            
            failModal.style.display = 'none';
            winModal.style.display = 'none';

            initItems();
            gameActive = true;
            
            clearInterval(timerInterval);
            startTimer();
            
            cancelAnimationFrame(animationId);
            loop();
        }

        restartBtn.addEventListener('click', resetGame);
        
        nextBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            if (level >= 10) {
                level = 1; // Loop back
            } else {
                level++;
            }
            resetGame();
        });

        resetGame();

        // Cleanup listener on exit
        container.addEventListener('game-exit', () => {
            gameActive = false;
            clearInterval(timerInterval);
            cancelAnimationFrame(animationId);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        });
    };
})();
