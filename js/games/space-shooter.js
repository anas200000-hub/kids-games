// Game: Space Shooter - Galaxy Guardian (حارس المجرة)
(function() {
    window.initSpaceShooterGame = function(container) {
        let canvas, ctx;
        let animationFrameId;
        let gameActive = true;
        let isPaused = false;
        
        // Polyfill for CanvasRenderingContext2D.prototype.roundRect for older devices
        if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                if (typeof r === 'undefined') {
                    r = 0;
                }
                if (typeof r === 'number') {
                    r = {tl: r, tr: r, br: r, bl: r};
                } else {
                    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
                    for (var side in defaultRadius) {
                        r[side] = r[side] || defaultRadius[side];
                    }
                }
                this.beginPath();
                this.moveTo(x + r.tl, y);
                this.lineTo(x + w - r.tr, y);
                this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
                this.lineTo(x + w, y + h - r.br);
                this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
                this.lineTo(x + r.bl, y + h);
                this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
                this.lineTo(x, y + r.tl);
                this.quadraticCurveTo(x, y, x + r.tl, y);
                this.closePath();
                return this;
            };
        }

        // Game States
        let score = 0;
        let highScore = parseInt(localStorage.getItem('space_high_score') || '0');
        let wave = 1;
        let playerShield = 100; // max 100
        let maxShield = 100;
        let playerLevel = 1; // weapons level
        let playerShipStyle = 'striker'; // striker, stalker, bomber, interceptor
        
        // Stars background
        let stars = [];
        const numStars = 60;
        
        // Game Entities
        let player = {
            x: 225,
            y: 700,
            width: 100,
            height: 100,
            targetX: 225,
            targetY: 700,
            speed: 0.15, // LERP speed
            lastShot: 0,
            shootInterval: 500, // ms (slower rate of fire)
            invulnerableUntil: 0
        };
        
        let playerLasers = [];
        let enemyLasers = [];
        let enemies = [];
        let particles = [];
        let powerups = [];
        let floatingTexts = [];
        let screenShake = 0;
        
        // Boss State
        let boss = null; // { x, y, width, height, hp, maxHp, vx, lastShot, state }
        
        // Synth Audio Generator
        let audioCtx = null;
        function initAudio() {
            if (audioCtx) return;
            try {
                audioCtx = window.sound && window.sound.ctx ? window.sound.ctx : new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Audio Context failed to initialize: ", e);
            }
        }
        
        function playSynthSound(type) {
            initAudio();
            if (!audioCtx) return;
            
            // Resume if suspended
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            const now = audioCtx.currentTime;
            
            if (type === 'laser') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                
                osc.start(now);
                osc.stop(now + 0.13);
            } else if (type === 'hit') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.08);
                
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                
                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'explosion') {
                // Synthesize a white noise crash/explosion
                const bufferSize = audioCtx.sampleRate * 0.35; // 0.35 seconds
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noiseNode = audioCtx.createBufferSource();
                noiseNode.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                
                noiseNode.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                noiseNode.start(now);
                noiseNode.stop(now + 0.4);
            } else if (type === 'powerup') {
                // Double note sweep
                const notes = [440, 554, 659, 880];
                notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                    
                    gain.gain.setValueAtTime(0.2, now + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);
                    
                    osc.start(now + idx * 0.05);
                    osc.stop(now + idx * 0.05 + 0.16);
                });
            } else if (type === 'damage') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(40, now + 0.25);
                
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                
                osc.start(now);
                osc.stop(now + 0.26);
            }
        }
        
        // Setup HTML Layout and Styles
        let html = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Tajawal:wght@700;900&display=swap');
                
                .space-game-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 450px;
                    margin: 0 auto;
                    box-sizing: border-box;
                    font-family: 'Tajawal', 'Outfit', sans-serif;
                    user-select: none;
                    direction: rtl;
                    border-radius: 24px;
                    padding: 10px;
                    overflow: hidden;
                    position: relative;
                    background: #02020a;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                }
                
                .space-canvas-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 9/16;
                    border-radius: 20px;
                    border: 3.5px solid #3f51b5;
                    box-sizing: border-box;
                    overflow: hidden;
                    box-shadow: inset 0 0 30px rgba(63, 81, 181, 0.4);
                }
                
                .space-canvas {
                    display: block;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    cursor: crosshair;
                }
                
                /* HUD Overlays */
                .space-btn-pause {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(13, 71, 161, 0.7);
                    border: 2px solid #00d2ff;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    cursor: pointer;
                    z-index: 5;
                    box-shadow: 0 4px 10px rgba(0,210,255,0.3);
                    transition: all 0.2s ease;
                }
                .space-btn-pause:active {
                    transform: scale(0.9);
                    background: #00d2ff;
                    color: #000;
                }
                
                /* Modal Screens */
                .space-modal {
                    display: none;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(2, 2, 10, 0.85);
                    z-index: 10;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    padding: 20px;
                }
                
                .space-modal-content {
                    background: linear-gradient(135deg, #0d47a1 0%, #1a237e 100%);
                    border: 4px solid #00d2ff;
                    border-radius: 28px;
                    padding: 30px 20px;
                    text-align: center;
                    width: 100%;
                    max-width: 320px;
                    color: #fff;
                    box-shadow: 0 15px 40px rgba(0, 210, 255, 0.4);
                    animation: spaceBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                @keyframes spaceBounce {
                    0% { transform: scale(0.6); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .space-modal-title {
                    font-size: 28px;
                    font-weight: 900;
                    margin-bottom: 12px;
                    text-shadow: 0 3px 6px rgba(0,210,255,0.5);
                    letter-spacing: 1px;
                }
                
                .space-modal-score {
                    font-size: 18px;
                    color: #e0f7fa;
                    margin-bottom: 25px;
                }
                
                .space-btn {
                    width: 100%;
                    padding: 12px 24px;
                    margin: 8px 0;
                    font-size: 18px;
                    font-weight: bold;
                    border: none;
                    border-radius: 16px;
                    cursor: pointer;
                    color: #fff;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                
                .space-btn-primary {
                    background: linear-gradient(to bottom, #00e676, #00c853);
                    box-shadow: 0 5px 0 #007e33, 0 8px 15px rgba(0,230,118,0.3);
                }
                .space-btn-primary:active {
                    transform: translateY(3px);
                    box-shadow: 0 2px 0 #007e33, 0 4px 8px rgba(0,230,118,0.3);
                }
                
                .space-btn-secondary {
                    background: linear-gradient(to bottom, #00b0ff, #0091ea);
                    box-shadow: 0 5px 0 #00609f, 0 8px 15px rgba(0,176,255,0.3);
                }
                .space-btn-secondary:active {
                    transform: translateY(3px);
                    box-shadow: 0 2px 0 #00609f, 0 4px 8px rgba(0,176,255,0.3);
                }
                
                .space-btn-exit {
                    background: linear-gradient(to bottom, #ff5252, #ff1744);
                    box-shadow: 0 5px 0 #b30026, 0 8px 15px rgba(255,82,82,0.3);
                }
                .space-btn-exit:active {
                    transform: translateY(3px);
                    box-shadow: 0 2px 0 #b30026, 0 4px 8px rgba(255,82,82,0.3);
                }
                
                .ship-select-card {
                    border: 2.5px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 8px;
                    cursor: pointer;
                    width: 116px;
                    height: 116px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }
                .ship-select-card.active {
                    border: 3px solid #00d2ff !important;
                    background: rgba(0,210,255,0.18) !important;
                    transform: scale(1.06);
                    box-shadow: 0 0 15px rgba(0,210,255,0.45);
                }
            </style>
            
            <div class="space-game-wrapper">
                <div class="space-canvas-container" id="spaceGameContainer">
                    <!-- Pause button -->
                    <button class="space-btn-pause" id="spacePauseBtn" title="إيقاف مؤقت">⏸️</button>
                    
                    <canvas class="space-canvas" id="spaceCanvas" width="450" height="800"></canvas>
                    
                    <!-- Pause Modal -->
                    <div id="spacePauseModal" class="space-modal">
                        <div class="space-modal-content">
                            <div class="space-modal-title" style="color: #00b0ff;">اللعبة متوقفة</div>
                            <div class="space-modal-score">المستوى الحالي: <span class="wave-display">1</span></div>
                            <button class="space-btn space-btn-primary" id="spaceResumeBtn">استئناف اللعب ▶️</button>
                            <button class="space-btn space-btn-secondary" id="spaceRestartBtnPause">إعادة المحاولة 🔄</button>
                            <button class="space-btn space-btn-exit" id="spaceExitBtnPause">القائمة الرئيسية 🏠</button>
                        </div>
                    </div>
                    
                    <!-- Game Over Modal -->
                    <div id="spaceFailModal" class="space-modal">
                        <div class="space-modal-content">
                            <div class="space-modal-title" style="color: #ff5252; font-size: 32px;">تحطم السفينة!</div>
                            <div class="space-modal-score" style="margin-bottom: 12px;">مجموع النقاط: <span id="spaceFinalScore">0</span></div>
                            <div class="space-modal-score" style="margin-top: 0; color: #ffeb3b; font-weight: bold;">الرقم القياسي: <span id="spaceHighScore">0</span></div>
                            <button class="space-btn space-btn-primary" id="spaceRestartBtnFail">إعادة اللعب 🔄</button>
                            <button class="space-btn space-btn-exit" id="spaceExitBtnFail">القائمة الرئيسية 🏠</button>
                        </div>
                    </div>
                    
                    <!-- Wave Victory Modal -->
                    <div id="spaceWinModal" class="space-modal">
                        <div class="space-modal-content">
                            <div class="space-modal-title" style="color: #00e676;">اكتملت الموجة! 🎉</div>
                            <div class="space-modal-score">تم القضاء على التهديد بنجاح!</div>
                            <button class="space-btn space-btn-primary" id="spaceNextWaveBtn">الموجة التالية ➡️</button>
                        </div>
                    </div>
                    
                    <!-- Ship Selection Modal -->
                    <div id="spaceShipSelectModal" class="space-modal" style="display: flex;">
                        <div class="space-modal-content" style="max-width: 300px; border-color: #e040fb; box-shadow: 0 15px 40px rgba(224, 64, 251, 0.4);">
                            <div class="space-modal-title" style="color: #ffeb3b; font-size: 26px;">اختر سفينتك الفضائية 🚀</div>
                            <p style="font-size: 13px; color: #e0f7fa; margin: 0 0 20px 0; line-height: 1.4;">اختر سفينتك المفضلة لبدء مغامرة حماية المجرة!</p>
                            
                            <!-- Ships list (Grid View) -->
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; justify-items: center; direction: ltr;">
                                <div class="ship-select-card active" data-ship="striker">
                                    <canvas id="canvasShipStriker" width="100" height="100"></canvas>
                                </div>
                                <div class="ship-select-card" data-ship="stalker">
                                    <canvas id="canvasShipStalker" width="100" height="100"></canvas>
                                </div>
                                <div class="ship-select-card" data-ship="bomber">
                                    <canvas id="canvasShipBomber" width="100" height="100"></canvas>
                                </div>
                                <div class="ship-select-card" data-ship="interceptor">
                                    <canvas id="canvasShipInterceptor" width="100" height="100"></canvas>
                                </div>
                            </div>
                            
                            <button class="space-btn space-btn-primary" id="spaceStartGameBtn" style="font-size: 18px; margin: 0;">انطلاق 🚀</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Element Hooks
        canvas = document.getElementById('spaceCanvas');
        ctx = canvas.getContext('2d');
        const pauseBtn = document.getElementById('spacePauseBtn');
        const pauseModal = document.getElementById('spacePauseModal');
        const failModal = document.getElementById('spaceFailModal');
        const winModal = document.getElementById('spaceWinModal');
        
        const resumeBtn = document.getElementById('spaceResumeBtn');
        const restartBtnPause = document.getElementById('spaceRestartBtnPause');
        const exitBtnPause = document.getElementById('spaceExitBtnPause');
        
        const restartBtnFail = document.getElementById('spaceRestartBtnFail');
        const exitBtnFail = document.getElementById('spaceExitBtnFail');
        const nextWaveBtn = document.getElementById('spaceNextWaveBtn');
        
        const finalScoreEl = document.getElementById('spaceFinalScore');
        const highScoreEl = document.getElementById('spaceHighScore');
        const waveDisplays = document.querySelectorAll('.wave-display');
        
        // Initialize Stars
        function initStars() {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.6 + 0.2,
                    alpha: Math.random() * 0.7 + 0.3,
                    twinkleDir: Math.random() > 0.5 ? 0.02 : -0.02
                });
            }
        }
        
        // Initialize Wave Enemies
        function initWave() {
            enemies = [];
            enemyLasers = [];
            playerLasers = [];
            powerups = [];
            floatingTexts = [];
            boss = null;
            
            // Reset player position to bottom center on wave start
            player.x = canvas.width / 2;
            player.y = 700;
            player.targetX = canvas.width / 2;
            player.targetY = 700;
            player.invulnerableUntil = Date.now() + 5000; // 5s temporary shield bubble on wave start
            
            // Increment display
            waveDisplays.forEach(el => el.innerText = wave);
            
            // Check if Boss Wave (every 5 waves)
            if (wave % 5 === 0) {
                initBoss();
                return;
            }
            
            // Generate alien grid dynamically scaling with waves
            const cols = Math.min(5 + Math.floor(wave / 2), 8);
            const rows = Math.min(3 + Math.floor(wave / 2), 7);
            const xSpacing = Math.min(60, 320 / (cols - 1 || 1));
            const ySpacing = 42;
            const startX = (canvas.width - (cols - 1) * xSpacing) / 2;
            const startY = 80;
            
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    let type = 'green';
                    let hp = 1;
                    let pts = 100;
                    
                    // Higher waves introduce tougher aliens in back rows
                    if (r === 0) {
                        type = 'blue';
                        hp = 3;
                        pts = 300;
                    } else if (r === 1 || (r === 2 && wave > 2)) {
                        type = 'purple';
                        hp = 2;
                        pts = 200;
                    }
                    
                    enemies.push({
                        x: startX + c * xSpacing,
                        y: startY + r * ySpacing,
                        type: type,
                        width: 38,
                        height: 38,
                        hp: hp,
                        maxHp: hp,
                        points: pts,
                        originalX: startX + c * xSpacing,
                        animOffset: Math.random() * 100, // random animation start
                        shootCooldown: Math.random() * 12000 + 8000 / (1 + wave * 0.1) // firing cooldown
                    });
                }
            }
        }
        
        function initBoss() {
            boss = {
                x: canvas.width / 2,
                y: -100, // enter from top
                targetY: 160,
                width: 140,
                height: 100,
                hp: 15 + wave * 8,
                maxHp: 15 + wave * 8,
                vx: 2,
                lastShot: 0,
                shootCooldown: 1200 - wave * 40,
                state: 'entering' // entering, active
            };
        }
        
        function spawnFloatingText(text, x, y, color = '#ffeb3b') {
            floatingTexts.push({
                text: text,
                x: x,
                y: y,
                alpha: 1.0,
                color: color,
                speedY: -1
            });
        }
        
        function spawnExplosion(x, y, colorPalette = ['#ff9800', '#ff5722', '#ffeb3b']) {
            playSynthSound('explosion');
            
            // Exploding sparks
            const sparkCount = 20;
            for (let i = 0; i < sparkCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                    alpha: 1.0,
                    decay: Math.random() * 0.03 + 0.015
                });
            }
        }
        
        // Spawn Powerups
        function maybeSpawnPowerup(x, y) {
            const roll = Math.random();
            // 10% chance to drop powerup
            if (roll < 0.10) {
                let type = 'shield'; // default shield recovery
                let color = '#00d2ff'; // cyan
                let icon = '🛡️';
                
                const typeRoll = Math.random();
                if (typeRoll < 0.45) {
                    type = 'weapon'; // weapon upgrade
                    color = '#ff9800'; // orange
                    icon = '⚡';
                }
                
                powerups.push({
                    x: x,
                    y: y,
                    width: 25,
                    height: 25,
                    type: type,
                    color: color,
                    icon: icon,
                    speedY: 2
                });
            }
        }
        
        // Player shoots lasers
        function playerShoot() {
            const now = Date.now();
            if (now - player.lastShot < player.shootInterval) return;
            
            player.lastShot = now;
            playSynthSound('laser');
            
            // Firing configuration based on playerLevel
            if (playerLevel === 1) {
                // Double Laser (Parallel, as in image)
                playerLasers.push({ x: player.x - 12, y: player.y - 15, width: 4, height: 18, speed: 7 });
                playerLasers.push({ x: player.x + 12, y: player.y - 15, width: 4, height: 18, speed: 7 });
            } else if (playerLevel === 2) {
                // Triple laser (spread)
                playerLasers.push({ x: player.x - 15, y: player.y - 10, width: 4, height: 18, speed: 7, vx: -0.8 });
                playerLasers.push({ x: player.x,     y: player.y - 18, width: 4, height: 18, speed: 7.5, vx: 0 });
                playerLasers.push({ x: player.x + 15, y: player.y - 10, width: 4, height: 18, speed: 7, vx: 0.8 });
            } else {
                // Quadruple rapid fire
                playerLasers.push({ x: player.x - 16, y: player.y - 5, width: 4, height: 18, speed: 8, vx: -0.6 });
                playerLasers.push({ x: player.x - 6,  y: player.y - 15, width: 4, height: 18, speed: 8, vx: -0.1 });
                playerLasers.push({ x: player.x + 6,  y: player.y - 15, width: 4, height: 18, speed: 8, vx: 0.1 });
                playerLasers.push({ x: player.x + 16, y: player.y - 5, width: 4, height: 18, speed: 8, vx: 0.6 });
            }
        }
        
        // Touch & Drag Controls
        function setupControls() {
            let dragStartX = 0;
            let dragStartY = 0;
            let shipStartX = 0;
            let shipStartY = 0;
            let isDragging = false;
            
            function handleStart(clientX, clientY) {
                if (!gameActive || isPaused) return;
                
                dragStartX = clientX;
                dragStartY = clientY;
                shipStartX = player.targetX;
                shipStartY = player.targetY;
                isDragging = true;
            }
            
            function handleMove(clientX, clientY) {
                if (!gameActive || isPaused || !isDragging) return;
                
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                const dx = (clientX - dragStartX) * scaleX;
                const dy = (clientY - dragStartY) * scaleY;
                
                player.targetX = shipStartX + dx;
                player.targetY = shipStartY + dy;
                
                // Restrict boundaries
                player.targetX = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.targetX));
                player.targetY = Math.max(canvas.height * 0.25, Math.min(canvas.height - player.height/2 - 20, player.targetY));
            }
            
            // Touch Move (mobile)
            canvas.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    handleMove(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });
            
            canvas.addEventListener('touchstart', (e) => {
                initAudio();
                if (e.touches.length > 0) {
                    handleStart(e.touches[0].clientX, e.touches[0].clientY);
                }
                e.preventDefault();
            }, { passive: false });
            
            canvas.addEventListener('touchend', () => {
                isDragging = false;
            });
            
            // Mouse Drag (desktop)
            canvas.addEventListener('mousedown', (e) => {
                initAudio();
                handleStart(e.clientX, e.clientY);
            });
            
            canvas.addEventListener('mousemove', (e) => {
                handleMove(e.clientX, e.clientY);
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Keyboard Controls
            window.addEventListener('keydown', (e) => {
                initAudio();
                if (!gameActive || isPaused) return;
                const speed = 15;
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    player.targetX = Math.max(player.width/2, player.x - speed);
                }
                if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    player.targetX = Math.min(canvas.width - player.width/2, player.x + speed);
                }
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                    player.targetY = Math.max(canvas.height * 0.25, player.y - speed);
                }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                    player.targetY = Math.min(canvas.height - player.height/2 - 20, player.y + speed);
                }
            });
        }
        
        // Start game loop
        function startGame() {
            gameActive = true;
            isPaused = false;
            score = 0;
            wave = 1;
            playerShield = maxShield;
            playerLevel = 1;
            player.x = canvas.width / 2;
            player.y = 700;
            player.targetX = canvas.width / 2;
            player.targetY = 700;
            player.invulnerableUntil = 0;
            
            // Hide Modals
            failModal.style.display = 'none';
            winModal.style.display = 'none';
            pauseModal.style.display = 'none';
            
            initStars();
            initWave();
        }
        
        // Update Game Entities
        function update() {
            if (!gameActive || isPaused) return;
            
            // Screen shake decay
            if (screenShake > 0) screenShake -= 0.3;
            
            // LERP player ship position for smooth drag trailing
            player.x += (player.targetX - player.x) * player.speed;
            player.y += (player.targetY - player.y) * player.speed;
            
            // Automatic shooting
            playerShoot();
            
            // Twinkle and move stars
            stars.forEach(s => {
                s.y += s.speed;
                if (s.y > canvas.height) {
                    s.y = 0;
                    s.x = Math.random() * canvas.width;
                }
                // Twinkle
                s.alpha += s.twinkleDir;
                if (s.alpha >= 1.0 || s.alpha <= 0.2) {
                    s.twinkleDir *= -1;
                }
            });
            
            // Update Player Lasers
            for (let i = playerLasers.length - 1; i >= 0; i--) {
                let l = playerLasers[i];
                l.y -= l.speed;
                if (l.vx) l.x += l.vx;
                
                // Remove out of bounds lasers
                if (l.y < 0 || l.x < 0 || l.x > canvas.width) {
                    playerLasers.splice(i, 1);
                }
            }
            
            // Update Enemy Lasers
            for (let i = enemyLasers.length - 1; i >= 0; i--) {
                let l = enemyLasers[i];
                l.y += l.speed;
                if (l.vx) l.x += l.vx;
                
                // Remove out of bounds
                if (l.y > canvas.height) {
                    enemyLasers.splice(i, 1);
                    continue;
                }
                
                // Hit player?
                const isInvulnerable = Date.now() < player.invulnerableUntil;
                if (!isInvulnerable && Math.hypot(l.x - player.x, l.y - player.y) < 48) { // adjusted for double size ship
                    enemyLasers.splice(i, 1);
                    playerTakeDamage(15);
                }
            }
            
            // Update Floating Texts
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                let t = floatingTexts[i];
                t.y += t.speedY;
                t.alpha -= 0.02;
                if (t.alpha <= 0) {
                    floatingTexts.splice(i, 1);
                }
            }
            
            // Update Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                }
            }
            
            // Update Powerups
            for (let i = powerups.length - 1; i >= 0; i--) {
                let pw = powerups[i];
                pw.y += pw.speedY;
                
                // Remove if out of bounds
                if (pw.y > canvas.height) {
                    powerups.splice(i, 1);
                    continue;
                }
                
                // Collision with player ship
                if (Math.hypot(pw.x - player.x, pw.y - player.y) < 50) { // adjusted for double size ship
                    powerups.splice(i, 1);
                    collectPowerup(pw);
                }
            }
            
            // Update Boss logic
            if (boss) {
                if (boss.state === 'entering') {
                    boss.y += 1.2;
                    if (boss.y >= boss.targetY) {
                        boss.state = 'active';
                    }
                } else if (boss.state === 'active') {
                    // move side to side
                    boss.x += boss.vx;
                    if (boss.x - boss.width/2 < 10 || boss.x + boss.width/2 > canvas.width - 10) {
                        boss.vx *= -1;
                    }
                    
                    // Firing patterns
                    const now = Date.now();
                    if (now - boss.lastShot > boss.shootCooldown) {
                        boss.lastShot = now;
                        playSynthSound('laser');
                        
                        // Fire 3-spread red lasers
                        enemyLasers.push({ x: boss.x - 30, y: boss.y + 40, width: 5, height: 18, speed: 3.2, vx: -0.8 });
                        enemyLasers.push({ x: boss.x,      y: boss.y + 50, width: 5, height: 18, speed: 3.8, vx: 0 });
                        enemyLasers.push({ x: boss.x + 30, y: boss.y + 40, width: 5, height: 18, speed: 3.2, vx: 0.8 });
                    }
                }
                
                // Player lasers hitting boss
                for (let i = playerLasers.length - 1; i >= 0; i--) {
                    let l = playerLasers[i];
                    
                    const left = boss.x - boss.width/2;
                    const right = boss.x + boss.width/2;
                    const top = boss.y - boss.height/2;
                    const bottom = boss.y + boss.height/2;
                    
                    if (l.x > left && l.x < right && l.y > top && l.y < bottom) {
                        playerLasers.splice(i, 1);
                        boss.hp--;
                        score += 50;
                        playSynthSound('hit');
                        
                        // Flash particles
                        particles.push({
                            x: l.x,
                            y: l.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            size: Math.random() * 3 + 1,
                            color: '#00d2ff',
                            alpha: 1.0,
                            decay: 0.05
                        });
                        
                        if (boss.hp <= 0) {
                            spawnExplosion(boss.x, boss.y, ['#ffeb3b', '#ff5722', '#e040fb', '#00d2ff']);
                            score += 5000;
                            spawnFloatingText('+5000', boss.x, boss.y, '#e040fb');
                            boss = null;
                            
                            // Check wave win
                            triggerWaveWin();
                            break;
                        }
                    }
                }
                
                // Boss hitting player directly
                if (boss) {
                    const isInvulnerable = Date.now() < player.invulnerableUntil;
                    if (!isInvulnerable && Math.hypot(boss.x - player.x, boss.y - player.y) < 95) { // adjusted for double size ship
                        playerTakeDamage(40);
                    }
                }
            }
            
            // Update regular enemies
            let reachedBottom = false;
            
            // Grid level animation movement variables
            const wiggleAmp = 4; // reduced wiggle for kids
            const horizontalSpeed = 0.001 + wave * 0.00015; // half speed side-to-side drift
            const verticalDrop = 0.008 + wave * 0.0015; // much slower descent
            
            enemies.forEach(e => {
                // Wiggle and slowly drift down
                const wiggle = Math.sin((Date.now() / 200) + e.animOffset) * wiggleAmp;
                e.x = e.originalX + wiggle + Math.sin(Date.now() * horizontalSpeed) * 35;
                e.y += verticalDrop;
                
                if (e.y > canvas.height - 110) {
                    reachedBottom = true;
                }
                
                // Firing logic
                e.shootCooldown -= 16.67; // approx ms per frame (60fps)
                if (e.shootCooldown <= 0) {
                    e.shootCooldown = Math.random() * 12000 + 8000 / (1 + wave * 0.15);
                    // Fire plasma ball
                    enemyLasers.push({
                        x: e.x,
                        y: e.y + 15,
                        width: 6,
                        height: 6,
                        speed: 2.2 + Math.min(wave * 0.15, 1.5), // much slower projectile speed for kids
                        isPlasma: true
                    });
                }
                
                // Collision with player lasers
                for (let i = playerLasers.length - 1; i >= 0; i--) {
                    let l = playerLasers[i];
                    if (Math.abs(l.x - e.x) < 22 && Math.abs(l.y - e.y) < 22) {
                        playerLasers.splice(i, 1);
                        e.hp--;
                        playSynthSound('hit');
                        
                        // Spawn hit particles
                        for (let p = 0; p < 4; p++) {
                            particles.push({
                                x: l.x,
                                y: l.y,
                                vx: (Math.random() - 0.5) * 4,
                                vy: (Math.random() - 0.5) * 4,
                                size: Math.random() * 2 + 1,
                                color: '#00e676',
                                alpha: 1.0,
                                decay: 0.08
                            });
                        }
                        
                        if (e.hp <= 0) {
                            // Destroy enemy
                            enemies = enemies.filter(alien => alien !== e);
                            spawnExplosion(e.x, e.y, e.type === 'blue' ? ['#00b0ff','#00e5ff'] : (e.type==='purple'? ['#e040fb','#ea80fc'] : ['#ffeb3b','#ff9800']));
                            
                            score += e.points;
                            spawnFloatingText(`+${e.points}`, e.x, e.y, '#e0f7fa');
                            
                            maybeSpawnPowerup(e.x, e.y);
                        }
                    }
                }
                
                // Enemy colliding directly with player ship
                const isInvulnerable = Date.now() < player.invulnerableUntil;
                if (!isInvulnerable && Math.hypot(e.x - player.x, e.y - player.y) < 55) { // adjusted for double size ship
                    enemies = enemies.filter(alien => alien !== e);
                    spawnExplosion(e.x, e.y);
                    playerTakeDamage(25);
                }
            });
            
            if (reachedBottom) {
                playerTakeDamage(100); // instant death if aliens land
            }
            
            // Check regular wave victory
            if (enemies.length === 0 && !boss) {
                triggerWaveWin();
            }
        }
        
        function playerTakeDamage(amount) {
            playerShield -= amount;
            playSynthSound('damage');
            
            player.invulnerableUntil = Date.now() + 1500; // 1.5 seconds invulnerable
            
            if (playerShield <= 0) {
                playerShield = 0;
                gameActive = false;
                screenShake = 25; // Shake screen on losing
                
                // Explode player
                spawnExplosion(player.x, player.y, ['#ff1744', '#ff8a80', '#ffeb3b']);
                
                // Save high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('space_high_score', highScore);
                }
                
                // Delay game over modal
                setTimeout(() => {
                    finalScoreEl.innerText = score;
                    highScoreEl.innerText = highScore;
                    failModal.style.display = 'flex';
                }, 1000);
            }
        }
        
        function collectPowerup(pw) {
            playSynthSound('powerup');
            
            if (pw.type === 'shield') {
                playerShield = Math.min(maxShield, playerShield + 30);
                spawnFloatingText('+30 درع', pw.x, pw.y, '#00d2ff');
                player.invulnerableUntil = Date.now() + 5000; // 5s shield bubble protection
            } else if (pw.type === 'weapon') {
                playerLevel = Math.min(3, playerLevel + 1);
                spawnFloatingText('سلاح ترقية!', pw.x, pw.y, '#ff9800');
            } else if (pw.type === 'bomb') {
                // Clear all regular enemies
                spawnFloatingText('قنبلة ذكية!', pw.x, pw.y, '#e040fb');
                
                enemies.forEach(e => {
                    score += e.points;
                    setTimeout(() => {
                        spawnExplosion(e.x, e.y, ['#e040fb', '#ea80fc', '#ffeb3b']);
                    }, Math.random() * 300);
                });
                
                enemies = [];
                
                if (boss) {
                    boss.hp = Math.max(1, boss.hp - 10);
                }
            }
        }
        
        function triggerWaveWin() {
            gameActive = false;
            setTimeout(() => {
                if (window.sound) {
                    window.sound.playSuccess();
                }
                winModal.style.display = 'flex';
            }, 600);
        }
        
        // Drawing Utilities
        function drawPlayerShipGraphics(cCtx, x, y, style, isInvulnerable) {
            cCtx.save();
            cCtx.translate(x, y);
            
            // Invulnerability flashing
            if (isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
                cCtx.globalAlpha = 0.3;
            }
            
            // Draw cockpit glass reflection helper
            function drawCockpitVisor(ctx, cx, cy, rx, ry, c1, c2) {
                const grad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
                grad.addColorStop(0, '#fff');
                grad.addColorStop(0.3, c1);
                grad.addColorStop(1, c2);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight glare
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.ellipse(cx - rx*0.3, cy - ry*0.3, rx*0.4, ry*0.4, Math.PI/4, -Math.PI*0.8, -Math.PI*0.2);
                ctx.stroke();
            }
            
            // 1. ADVANCED STRIKER (Green/Cyan Jet)
            if (style === 'striker') {
                // Thruster
                const flameLen = Math.random() * 12 + 10;
                const gradFlame = cCtx.createLinearGradient(0, 12, 0, 12 + flameLen);
                gradFlame.addColorStop(0, '#fff');
                gradFlame.addColorStop(0.3, '#00e5ff');
                gradFlame.addColorStop(0.7, '#1a237e');
                gradFlame.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlame;
                cCtx.beginPath();
                cCtx.moveTo(-6, 12);
                cCtx.lineTo(0, 12 + flameLen);
                cCtx.lineTo(6, 12);
                cCtx.closePath();
                cCtx.fill();
                
                // Nose needle
                cCtx.strokeStyle = '#cfd8dc';
                cCtx.lineWidth = 2.5;
                cCtx.beginPath();
                cCtx.moveTo(0, -25);
                cCtx.lineTo(0, -35);
                cCtx.stroke();
                
                // Nose energy tip glow
                cCtx.shadowColor = '#00e5ff';
                cCtx.shadowBlur = 10;
                cCtx.fillStyle = '#00e5ff';
                cCtx.beginPath();
                cCtx.arc(0, -35, 2.5, 0, Math.PI*2);
                cCtx.fill();
                cCtx.shadowBlur = 0; // reset
                
                // Left Wing Panel (Green metallic)
                let gradL = cCtx.createLinearGradient(-26, 8, -12, -12);
                gradL.addColorStop(0, '#1b5e20');
                gradL.addColorStop(0.5, '#4caf50');
                gradL.addColorStop(1, '#a5d6a7');
                cCtx.fillStyle = gradL;
                cCtx.beginPath();
                cCtx.moveTo(-26, 8);
                cCtx.lineTo(-12, -12);
                cCtx.lineTo(-6, -4);
                cCtx.lineTo(-20, 14);
                cCtx.closePath();
                cCtx.fill();
                
                // Right Wing Panel (Green metallic)
                let gradR = cCtx.createLinearGradient(26, 8, 12, -12);
                gradR.addColorStop(0, '#1b5e20');
                gradR.addColorStop(0.5, '#4caf50');
                gradR.addColorStop(1, '#a5d6a7');
                cCtx.fillStyle = gradR;
                cCtx.beginPath();
                cCtx.moveTo(26, 8);
                cCtx.lineTo(12, -12);
                cCtx.lineTo(6, -4);
                cCtx.lineTo(20, 14);
                cCtx.closePath();
                cCtx.fill();
                
                // Wing energy lines (Cyan/Neon glow)
                cCtx.strokeStyle = '#00e5ff';
                cCtx.lineWidth = 2;
                cCtx.beginPath();
                cCtx.moveTo(-24, 7);
                cCtx.lineTo(-12, -8);
                cCtx.moveTo(24, 7);
                cCtx.lineTo(12, -8);
                cCtx.stroke();
                
                // Missile tubes (under wings)
                cCtx.fillStyle = '#37474f';
                cCtx.fillRect(-23, 0, 4, 10);
                cCtx.fillRect(-19, 3, 4, 10);
                cCtx.fillRect(19, 0, 4, 10);
                cCtx.fillRect(15, 3, 4, 10);
                
                // Missile warheads (Red tips)
                cCtx.fillStyle = '#ff1744';
                cCtx.fillRect(-23, 10, 4, 2);
                cCtx.fillRect(-19, 13, 4, 2);
                cCtx.fillRect(19, 10, 4, 2);
                cCtx.fillRect(15, 13, 4, 2);
                
                // Center fuselage (Silver/Green)
                let gradFus = cCtx.createLinearGradient(-9, 0, 9, 0);
                gradFus.addColorStop(0, '#66bb6a');
                gradFus.addColorStop(0.5, '#e8f5e9');
                gradFus.addColorStop(1, '#66bb6a');
                cCtx.fillStyle = gradFus;
                cCtx.beginPath();
                cCtx.moveTo(0, -25);
                cCtx.lineTo(-9, 4);
                cCtx.lineTo(-4, 12);
                cCtx.lineTo(4, 12);
                cCtx.lineTo(9, 4);
                cCtx.closePath();
                cCtx.fill();
                
                // Cockpit Visor
                drawCockpitVisor(cCtx, 0, -6, 5, 11, '#00e676', '#004d40');
            }
            
            // 2. VOID STALKER (Charcoal/Bronze Interceptor)
            else if (style === 'stalker') {
                // Thruster
                const flameLen = Math.random() * 12 + 10;
                const gradFlame = cCtx.createLinearGradient(0, 14, 0, 14 + flameLen);
                gradFlame.addColorStop(0, '#fff');
                gradFlame.addColorStop(0.3, '#2979ff');
                gradFlame.addColorStop(0.7, '#0d47a1');
                gradFlame.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlame;
                cCtx.beginPath();
                cCtx.moveTo(-5, 14);
                cCtx.lineTo(0, 14 + flameLen);
                cCtx.lineTo(5, 14);
                cCtx.closePath();
                cCtx.fill();
                
                // Double nose forks (Bronze metallic)
                let gradFork = cCtx.createLinearGradient(-8, -26, 8, -26);
                gradFork.addColorStop(0, '#4e342e');
                gradFork.addColorStop(0.5, '#d7ccc8');
                gradFork.addColorStop(1, '#4e342e');
                cCtx.fillStyle = gradFork;
                // Left fork
                cCtx.beginPath();
                cCtx.moveTo(-8, -12);
                cCtx.lineTo(-8, -26);
                cCtx.lineTo(-5, -12);
                cCtx.closePath();
                cCtx.fill();
                // Right fork
                cCtx.beginPath();
                cCtx.moveTo(8, -12);
                cCtx.lineTo(8, -26);
                cCtx.lineTo(5, -12);
                cCtx.closePath();
                cCtx.fill();
                
                // Shaded layered wings (Charcoal metallic)
                let gradWingL = cCtx.createLinearGradient(-28, 12, -12, -8);
                gradWingL.addColorStop(0, '#212121');
                gradWingL.addColorStop(0.5, '#455a64');
                gradWingL.addColorStop(1, '#cfd8dc');
                cCtx.fillStyle = gradWingL;
                cCtx.beginPath();
                cCtx.moveTo(-28, 12);
                cCtx.lineTo(-12, -8);
                cCtx.lineTo(0, -2);
                cCtx.lineTo(-24, 15);
                cCtx.closePath();
                cCtx.fill();
                
                let gradWingR = cCtx.createLinearGradient(28, 12, 12, -8);
                gradWingR.addColorStop(0, '#212121');
                gradWingR.addColorStop(0.5, '#455a64');
                gradWingR.addColorStop(1, '#cfd8dc');
                cCtx.fillStyle = gradWingR;
                cCtx.beginPath();
                cCtx.moveTo(28, 12);
                cCtx.lineTo(12, -8);
                cCtx.lineTo(0, -2);
                cCtx.lineTo(24, 15);
                cCtx.closePath();
                cCtx.fill();
                
                // Bronze wing tip highlights
                cCtx.fillStyle = '#8d6e63';
                cCtx.beginPath();
                cCtx.moveTo(-28, 12);
                cCtx.lineTo(-20, 0);
                cCtx.lineTo(-24, 14);
                cCtx.closePath();
                cCtx.beginPath();
                cCtx.moveTo(28, 12);
                cCtx.lineTo(20, 0);
                cCtx.lineTo(24, 14);
                cCtx.closePath();
                cCtx.fill();
                
                // Center fuselage
                let gradFus = cCtx.createLinearGradient(-9, 0, 9, 0);
                gradFus.addColorStop(0, '#263238');
                gradFus.addColorStop(0.5, '#b0bec5');
                gradFus.addColorStop(1, '#263238');
                cCtx.fillStyle = gradFus;
                cCtx.beginPath();
                cCtx.moveTo(0, -18);
                cCtx.lineTo(-9, 5);
                cCtx.lineTo(-5, 12);
                cCtx.lineTo(5, 12);
                cCtx.lineTo(9, 5);
                cCtx.closePath();
                cCtx.fill();
                
                // Bronze center strip
                cCtx.fillStyle = '#8d6e63';
                cCtx.fillRect(-2, -5, 4, 15);
                
                // Cockpit Visor (Cyan/Blue)
                drawCockpitVisor(cCtx, 0, -6, 4.5, 9, '#00b0ff', '#0d47a1');
            }
            
            // 3. OMEGA BOMBER (Heavy Orange/Grey Mech)
            else if (style === 'bomber') {
                // Double Engine Fire (Orange/Red)
                const flameLen = Math.random() * 12 + 10;
                const gradFlameL = cCtx.createLinearGradient(-12, 12, -12, 12 + flameLen);
                gradFlameL.addColorStop(0, '#fff');
                gradFlameL.addColorStop(0.3, '#ff9100');
                gradFlameL.addColorStop(0.7, '#ff3d00');
                gradFlameL.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlameL;
                cCtx.beginPath();
                cCtx.moveTo(-15, 12);
                cCtx.lineTo(-12, 12 + flameLen);
                cCtx.lineTo(-9, 12);
                cCtx.closePath();
                cCtx.fill();
                
                const gradFlameR = cCtx.createLinearGradient(12, 12, 12, 12 + flameLen);
                gradFlameR.addColorStop(0, '#fff');
                gradFlameR.addColorStop(0.3, '#ff9100');
                gradFlameR.addColorStop(0.7, '#ff3d00');
                gradFlameR.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlameR;
                cCtx.beginPath();
                cCtx.moveTo(9, 12);
                cCtx.lineTo(12, 12 + flameLen);
                cCtx.lineTo(15, 12);
                cCtx.closePath();
                cCtx.fill();
                
                // Triple hulls with shaded charcoal/silver metallic look
                let gradHullSide = cCtx.createLinearGradient(-15, 0, -9, 0);
                gradHullSide.addColorStop(0, '#212121');
                gradHullSide.addColorStop(0.5, '#757575');
                gradHullSide.addColorStop(1, '#212121');
                
                // Left hull
                cCtx.fillStyle = gradHullSide;
                cCtx.fillRect(-15, -12, 6, 24);
                // Right hull
                let gradHullR = cCtx.createLinearGradient(9, 0, 15, 0);
                gradHullR.addColorStop(0, '#212121');
                gradHullR.addColorStop(0.5, '#757575');
                gradHullR.addColorStop(1, '#212121');
                cCtx.fillStyle = gradHullR;
                cCtx.fillRect(9, -12, 6, 24);
                
                // Center hull
                let gradHullC = cCtx.createLinearGradient(-5, 0, 5, 0);
                gradHullC.addColorStop(0, '#111');
                gradHullC.addColorStop(0.5, '#bdbdbd');
                gradHullC.addColorStop(1, '#111');
                cCtx.fillStyle = gradHullC;
                cCtx.fillRect(-5, -20, 10, 32);
                
                // Orange highlight panels (Industrial Warning colors)
                let gradOrange = cCtx.createLinearGradient(-5, 0, 5, 0);
                gradOrange.addColorStop(0, '#d84315');
                gradOrange.addColorStop(0.5, '#ffb74d');
                gradOrange.addColorStop(1, '#d84315');
                cCtx.fillStyle = gradOrange;
                cCtx.fillRect(-15, -6, 6, 12);
                cCtx.fillRect(9, -6, 6, 12);
                cCtx.fillRect(-5, -14, 10, 6);
                
                // Front gatling gun barrels
                cCtx.fillStyle = '#424242';
                cCtx.fillRect(-14, -20, 4, 8);
                cCtx.fillRect(10, -20, 4, 8);
                
                // Rotating gatling tip detail
                cCtx.fillStyle = '#212121';
                cCtx.fillRect(-15, -22, 6, 2);
                cCtx.fillRect(9, -22, 6, 2);
                
                // Gatling gun tip heat glow (tiny orange sparks)
                cCtx.fillStyle = '#ff3d00';
                cCtx.fillRect(-13, -23, 2, 1);
                cCtx.fillRect(11, -23, 2, 1);
                
                // Rear thruster plate
                cCtx.fillStyle = '#37474f';
                cCtx.fillRect(-17, 12, 34, 4);
                
                // Cockpit Glass reflection (Gold visor)
                drawCockpitVisor(cCtx, 0, -5, 3.5, 5, '#ffeb3b', '#ff6d00');
            }
            
            // 4. CHRONOS INTERCEPTOR (Purple/Gold Fighter)
            else if (style === 'interceptor') {
                // Dual thrusters (Magenta/Purple fire)
                const flameLen = Math.random() * 12 + 10;
                const gradFlameL = cCtx.createLinearGradient(-14, 12, -14, 12 + flameLen);
                gradFlameL.addColorStop(0, '#fff');
                gradFlameL.addColorStop(0.3, '#d500f9');
                gradFlameL.addColorStop(0.7, '#4a148c');
                gradFlameL.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlameL;
                cCtx.beginPath();
                cCtx.moveTo(-17, 12);
                cCtx.lineTo(-14, 12 + flameLen);
                cCtx.lineTo(-11, 12);
                cCtx.closePath();
                cCtx.fill();
                
                const gradFlameR = cCtx.createLinearGradient(14, 12, 14, 12 + flameLen);
                gradFlameR.addColorStop(0, '#fff');
                gradFlameR.addColorStop(0.3, '#d500f9');
                gradFlameR.addColorStop(0.7, '#4a148c');
                gradFlameR.addColorStop(1, 'rgba(0,0,0,0)');
                cCtx.fillStyle = gradFlameR;
                cCtx.beginPath();
                cCtx.moveTo(11, 12);
                cCtx.lineTo(14, 12 + flameLen);
                cCtx.lineTo(17, 12);
                cCtx.closePath();
                cCtx.fill();
                
                // Sleek curved purple wings
                let gradWing = cCtx.createLinearGradient(-26, 0, 26, 0);
                gradWing.addColorStop(0, '#4a148c');
                gradWing.addColorStop(0.5, '#ab47bc');
                gradWing.addColorStop(1, '#4a148c');
                cCtx.fillStyle = gradWing;
                cCtx.beginPath();
                cCtx.moveTo(-26, -5);
                cCtx.quadraticCurveTo(-15, -15, 0, -8);
                cCtx.quadraticCurveTo(15, -15, 26, -5);
                cCtx.lineTo(20, 12);
                cCtx.lineTo(-20, 12);
                cCtx.closePath();
                cCtx.fill();
                
                // Yellow wing borders
                cCtx.strokeStyle = '#fbc02d'; // Yellow gold
                cCtx.lineWidth = 3;
                cCtx.beginPath();
                cCtx.moveTo(-26, -5);
                cCtx.quadraticCurveTo(-15, -15, 0, -8);
                cCtx.quadraticCurveTo(15, -15, 26, -5);
                cCtx.stroke();
                
                // Side engine pods (Intakes with yellow caps)
                cCtx.fillStyle = '#fbc02d'; // Yellow intake cowls
                cCtx.fillRect(-16, -10, 4, 3);
                cCtx.fillRect(12, -10, 4, 3);
                
                let gradPod = cCtx.createLinearGradient(-17, 0, -11, 0);
                gradPod.addColorStop(0, '#78909c');
                gradPod.addColorStop(0.5, '#eceff1');
                gradPod.addColorStop(1, '#78909c');
                cCtx.fillStyle = gradPod;
                cCtx.fillRect(-17, -7, 6, 19);
                
                let gradPodR = cCtx.createLinearGradient(11, 0, 17, 0);
                gradPodR.addColorStop(0, '#78909c');
                gradPodR.addColorStop(0.5, '#eceff1');
                gradPodR.addColorStop(1, '#78909c');
                cCtx.fillStyle = gradPodR;
                cCtx.fillRect(11, -7, 6, 19);
                
                // Main hull (Royal purple)
                let gradFus = cCtx.createLinearGradient(-7, 0, 7, 0);
                gradFus.addColorStop(0, '#4a148c');
                gradFus.addColorStop(0.5, '#e1bee7');
                gradFus.addColorStop(1, '#4a148c');
                cCtx.fillStyle = gradFus;
                cCtx.beginPath();
                cCtx.moveTo(0, -24); // nose
                cCtx.lineTo(-7, 2);
                cCtx.lineTo(-4, 12);
                cCtx.lineTo(4, 12);
                cCtx.lineTo(7, 2);
                cCtx.closePath();
                cCtx.fill();
                
                // Nose gold trim detail
                cCtx.fillStyle = '#fbc02d';
                cCtx.beginPath();
                cCtx.moveTo(0, -24);
                cCtx.lineTo(-3, -12);
                cCtx.lineTo(3, -12);
                cCtx.closePath();
                cCtx.fill();
                
                // Cockpit bubble (purple glass glow)
                drawCockpitVisor(cCtx, 0, -4, 4, 8.5, '#e040fb', '#4a148c');
            }
            
            cCtx.restore();
        }
        
        function drawPlayerShip(x, y) {
            const isInvulnerable = Date.now() < player.invulnerableUntil;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(2.0, 2.0); // Make player ship and shield bubble twice as large!
            
            // Draw Glowing Blue Shield Bubble around ship
            if (isInvulnerable) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.85)';
                ctx.lineWidth = 2.0; // scaled width
                ctx.shadowColor = '#00d2ff';
                ctx.shadowBlur = 8;
                
                // Pulsing animation
                const pulse = Math.sin(Date.now() / 100) * 1.5;
                
                ctx.beginPath();
                ctx.arc(0, -6, 32 + pulse, 0, Math.PI * 2);
                ctx.stroke();
                
                // Light inner glow
                ctx.fillStyle = 'rgba(0, 210, 255, 0.08)';
                ctx.fill();
                ctx.restore();
            }
            
            // Draw ship graphics centered at (0, 0)
            drawPlayerShipGraphics(ctx, 0, 0, playerShipStyle, isInvulnerable);
            ctx.restore();
        }
        
        function drawAlienShip(e) {
            ctx.save();
            ctx.translate(e.x, e.y);
            
            // Animate wings flapping
            const flap = Math.sin((Date.now() / 150) + e.animOffset) * 5;
            
            if (e.type === 'green') {
                // Green insectoid alien
                // Wings
                ctx.fillStyle = '#00c853';
                ctx.beginPath();
                ctx.ellipse(-14 - flap/2, -3, 11, 7 + flap/4, Math.PI/6, 0, Math.PI*2);
                ctx.ellipse(14 + flap/2, -3, 11, 7 + flap/4, -Math.PI/6, 0, Math.PI*2);
                ctx.fill();
                
                // Wing orange stripes
                ctx.fillStyle = '#ff9800';
                ctx.beginPath();
                ctx.ellipse(-14 - flap/2, -3, 6, 3, Math.PI/6, 0, Math.PI*2);
                ctx.ellipse(14 + flap/2, -3, 6, 3, -Math.PI/6, 0, Math.PI*2);
                ctx.fill();
                
                // Head/Body
                ctx.fillStyle = '#81c784';
                ctx.beginPath();
                ctx.arc(0, 4, 11, 0, Math.PI*2);
                ctx.fill();
                
                // Antennae
                ctx.strokeStyle = '#00c853';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-5, -6);
                ctx.quadraticCurveTo(-10, -14, -14, -13);
                ctx.moveTo(5, -6);
                ctx.quadraticCurveTo(10, -14, 14, -13);
                ctx.stroke();
                
                // Eyes (glowing orange)
                ctx.fillStyle = '#ff3d00';
                ctx.beginPath();
                ctx.arc(-4, 2, 2.5, 0, Math.PI*2);
                ctx.arc(4, 2, 2.5, 0, Math.PI*2);
                ctx.fill();
                
            } else if (e.type === 'purple') {
                // Purple crab-like alien (2hp)
                // Legs/Wings
                ctx.fillStyle = '#ab47bc';
                ctx.beginPath();
                ctx.ellipse(-15, flap/2, 12, 6, Math.PI/4, 0, Math.PI*2);
                ctx.ellipse(15, flap/2, 12, 6, -Math.PI/4, 0, Math.PI*2);
                ctx.fill();
                
                // Main chassis
                ctx.fillStyle = '#ea80fc';
                ctx.beginPath();
                ctx.moveTo(-11, -8);
                ctx.lineTo(11, -8);
                ctx.lineTo(15, 6);
                ctx.lineTo(0, 15);
                ctx.lineTo(-15, 6);
                ctx.closePath();
                ctx.fill();
                
                // Core light
                ctx.fillStyle = '#00e5ff';
                ctx.beginPath();
                ctx.arc(0, 1, 4, 0, Math.PI*2);
                ctx.fill();
                
            } else if (e.type === 'blue') {
                // Blue beetle-like boss-guard alien (3hp)
                ctx.fillStyle = '#0288d1';
                ctx.beginPath();
                // Outer shell
                ctx.arc(0, 0, 14, 0, Math.PI*2);
                ctx.fill();
                
                // Shell split
                ctx.strokeStyle = '#e1f5fe';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -14);
                ctx.lineTo(0, 14);
                ctx.stroke();
                
                // Side wing shields
                ctx.fillStyle = '#00d2ff';
                ctx.beginPath();
                ctx.ellipse(-16 - flap/3, -4, 9, 13, Math.PI/10, 0, Math.PI*2);
                ctx.ellipse(16 + flap/3, -4, 9, 13, -Math.PI/10, 0, Math.PI*2);
                ctx.fill();
                
                // Eyes (Red)
                ctx.fillStyle = '#ff1744';
                ctx.beginPath();
                ctx.arc(-6, -7, 3, 0, Math.PI*2);
                ctx.arc(6, -7, 3, 0, Math.PI*2);
                ctx.fill();
            }
            
            // Health Bar for damaged aliens
            if (e.hp < e.maxHp) {
                const barW = 26;
                const barH = 3.5;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(-barW/2, -22, barW, barH);
                
                ctx.fillStyle = '#00e676';
                ctx.fillRect(-barW/2, -22, barW * (e.hp / e.maxHp), barH);
            }
            
            ctx.restore();
        }
        
        function drawBoss() {
            if (!boss) return;
            
            ctx.save();
            ctx.translate(boss.x, boss.y);
            
            const pulse = Math.sin(Date.now() / 100) * 4;
            
            // Thrusters
            ctx.fillStyle = '#ff3d00';
            ctx.fillRect(-45, -50, 12, 10 + pulse);
            ctx.fillRect(33, -50, 12, 10 + pulse);
            
            // Giant metal wings
            ctx.fillStyle = '#3f51b5';
            ctx.beginPath();
            ctx.moveTo(-70, -30);
            ctx.lineTo(-50, 20);
            ctx.lineTo(0, 10);
            ctx.lineTo(50, 20);
            ctx.lineTo(70, -30);
            ctx.lineTo(0, -40);
            ctx.closePath();
            ctx.fill();
            
            // Glowing core reactor
            ctx.fillStyle = '#00d2ff';
            ctx.shadowColor = '#00d2ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, 18 + pulse/2, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
            
            // Top Shield Dome (Transparent Magenta)
            ctx.fillStyle = 'rgba(224, 64, 251, 0.4)';
            ctx.beginPath();
            ctx.arc(0, -20, 30, Math.PI, Math.PI * 2);
            ctx.fill();
            
            // Cannons
            ctx.fillStyle = '#757de8';
            ctx.fillRect(-35, 10, 10, 20);
            ctx.fillRect(25, 10, 10, 20);
            
            ctx.restore();
            
            // Draw Boss Health Bar at the top of the screen
            const barW = 300;
            const barH = 12;
            const barX = (canvas.width - barW) / 2;
            const barY = 65;
            
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX, barY, barW, barH);
            
            ctx.fillStyle = 'linear-gradient(to right, #f44336, #ff9800)';
            const gradHp = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            gradHp.addColorStop(0, '#ff1744');
            gradHp.addColorStop(1, '#ffeb3b');
            ctx.fillStyle = gradHp;
            ctx.fillRect(barX, barY, barW * (boss.hp / boss.maxHp), barH);
            
            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            
            // Boss Title
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px Tajawal';
            ctx.textAlign = 'center';
            ctx.fillText('مستعمر المجرة الأكبر - الغازي', canvas.width / 2, 53);
        }
        
        function drawHUD() {
            // Draw Score and High Score at top
            ctx.fillStyle = '#fff';
            ctx.font = '900 20px Outfit, Tajawal';
            ctx.textAlign = 'right';
            ctx.fillText(score, canvas.width - 20, 38);
            
            ctx.fillStyle = '#00d2ff';
            ctx.font = 'bold 11px Outfit, Tajawal';
            ctx.fillText('HIGH: ' + highScore, canvas.width - 20, 52);
            
            // Bottom HUD (Level triangle and shield progress bar matching mockup)
            const bottomY = canvas.height - 35;
            
            // Triangle Wave display at bottom left
            ctx.save();
            ctx.translate(35, bottomY);
            
            // Outer triangle border
            ctx.fillStyle = 'rgba(0,210,255,0.1)';
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, -25); // peak
            ctx.lineTo(-24, 15);
            ctx.lineTo(24, 15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Wave number inside triangle
            ctx.fillStyle = '#fff';
            ctx.font = '900 18px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(wave, 0, 0);
            
            ctx.restore();
            
            // Progress shield bar next to triangle
            const barX = 72;
            const barW = 140;
            const barH = 14;
            const barY = bottomY - 3;
            
            // Draw bar background
            ctx.fillStyle = 'rgba(13, 71, 161, 0.4)';
            ctx.strokeStyle = '#3f51b5';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 6);
            ctx.fill();
            ctx.stroke();
            
            // Draw shield fill (Cyan/Blue gradient)
            if (playerShield > 0) {
                const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
                fillGrad.addColorStop(0, '#0091ea');
                fillGrad.addColorStop(1, '#00e5ff');
                ctx.fillStyle = fillGrad;
                
                ctx.beginPath();
                ctx.roundRect(barX, barY, barW * (playerShield / maxShield), barH, 6);
                ctx.fill();
            }
            
            // Power icon (purple hexagon at the end of progress bar)
            ctx.save();
            ctx.translate(barX + barW + 15, bottomY + 4);
            const hexRadius = 12;
            ctx.fillStyle = '#e040fb'; // purple
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                ctx.lineTo(Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Inner lightning bolt icon in hexagon
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', 0, 0);
            
            ctx.restore();
        }
        
        // Render Game Frame
        function draw() {
            ctx.save();
            // Apply screen shake
            if (screenShake > 0) {
                const dx = (Math.random() - 0.5) * screenShake;
                const dy = (Math.random() - 0.5) * screenShake;
                ctx.translate(dx, dy);
            }
            
            // Clean black space
            ctx.fillStyle = '#02020f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Soft galactic nebulas (large circles)
            ctx.fillStyle = 'rgba(92, 107, 192, 0.08)'; // Purple wash
            ctx.beginPath();
            ctx.arc(300, 200, 250, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(236, 64, 122, 0.06)'; // Pink wash
            ctx.beginPath();
            ctx.arc(100, 450, 200, 0, Math.PI*2);
            ctx.fill();
            
            // Giant Cosmic Planet (Upper central area, matching screenshot)
            const planetX = 225;
            const planetY = 160;
            const planetR = 85;
            
            // Planet shadow gradient
            const pGrad = ctx.createRadialGradient(planetX - 25, planetY - 20, 10, planetX, planetY, planetR);
            pGrad.addColorStop(0, '#5e35b1'); // Purple planet crust
            pGrad.addColorStop(0.6, '#311b92');
            pGrad.addColorStop(1, '#05001c'); // Shadow edge
            
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(planetX, planetY, planetR, 0, Math.PI*2);
            ctx.fill();
            
            // Concentric planet crater/surface lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(planetX, planetY, planetR - 20, planetR - 60, Math.PI/8, 0, Math.PI*2);
            ctx.ellipse(planetX, planetY, planetR - 40, planetR - 75, Math.PI/8, 0, Math.PI*2);
            ctx.stroke();
            
            // Draw Stars
            stars.forEach(s => {
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = s.alpha;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0; // reset
            
            // Draw Powerups
            powerups.forEach(pw => {
                ctx.save();
                ctx.translate(pw.x, pw.y);
                
                // Pulse size
                const pulse = Math.sin(Date.now() / 120) * 1.5;
                const r = pw.width / 2 + pulse;
                
                // Glowing background
                ctx.shadowColor = pw.color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = pw.color;
                
                // Draw hexagon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fill();
                
                // Draw white borders
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                // Draw icon inside
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Outfit';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pw.icon, 0, 0);
                
                ctx.restore();
            });
            
            // Draw Player Lasers (Green Double Chevrons)
            playerLasers.forEach(l => {
                ctx.save();
                ctx.translate(l.x, l.y);
                
                // Neon glow
                ctx.shadowColor = '#00e676';
                ctx.shadowBlur = 8;
                
                // Draw Chevron arrow (^)
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(-7, 6);
                ctx.lineTo(0, -6);
                ctx.lineTo(7, 6);
                ctx.stroke();
                
                ctx.restore();
            });
            
            // Draw Enemy Lasers (Orange Plasma Orbs or Red beams)
            enemyLasers.forEach(l => {
                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.scale(2.0, 2.0); // Make them twice as large!
                
                // Rocket shape pointing down
                ctx.shadowColor = '#ff3d00';
                ctx.shadowBlur = 8;
                
                // Engine flame at the top
                const flameLen = Math.random() * 5 + 3;
                const gradFlame = ctx.createLinearGradient(0, -5, 0, -5 - flameLen);
                gradFlame.addColorStop(0, '#ffeb3b');
                gradFlame.addColorStop(1, 'rgba(255,87,34,0)');
                ctx.fillStyle = gradFlame;
                ctx.beginPath();
                ctx.moveTo(-2.5, -4);
                ctx.lineTo(0, -4 - flameLen);
                ctx.lineTo(2.5, -4);
                ctx.closePath();
                ctx.fill();
                
                // Rocket body (Red capsule)
                ctx.fillStyle = '#ff1744';
                ctx.beginPath();
                ctx.roundRect(-2.5, -4, 5, 8, 1.5);
                ctx.fill();
                
                // Rocket pointed nose at the bottom (pointed down)
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.moveTo(-2.5, 4);
                ctx.lineTo(0, 9);
                ctx.lineTo(2.5, 4);
                ctx.closePath();
                ctx.fill();
                
                // Side fins at the top
                ctx.fillStyle = '#ff9800';
                ctx.beginPath();
                ctx.moveTo(-2.5, -2);
                ctx.lineTo(-4.5, -5);
                ctx.lineTo(-2.5, -5);
                ctx.moveTo(2.5, -2);
                ctx.lineTo(4.5, -5);
                ctx.lineTo(2.5, -5);
                ctx.fill();
                
                ctx.restore();
            });
            
            // Draw Regular Aliens
            enemies.forEach(e => {
                drawAlienShip(e);
            });
            
            // Draw Boss Alien
            drawBoss();
            
            // Draw Player Spaceship
            if (playerShield > 0) {
                drawPlayerShip(player.x, player.y);
            }
            
            // Draw Particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
            
            // Draw Floating Combat Texts
            floatingTexts.forEach(t => {
                ctx.fillStyle = t.color;
                ctx.globalAlpha = t.alpha;
                ctx.font = '900 15px Outfit, Tajawal';
                ctx.textAlign = 'center';
                ctx.fillText(t.text, t.x, t.y);
            });
            ctx.globalAlpha = 1.0;
            
            // Draw HUD Info overlay
            drawHUD();
            
            ctx.restore();
        }
        
        // Loop Runner
        function loop() {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        }
        
        // Controls Events
        setupControls();
        
        // Pause trigger
        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!gameActive) return;
            isPaused = true;
            pauseModal.style.display = 'flex';
        });
        
        resumeBtn.addEventListener('click', () => {
            isPaused = false;
            pauseModal.style.display = 'none';
        });
        
        restartBtnPause.addEventListener('click', () => {
            startGame();
        });
        
        exitBtnPause.addEventListener('click', () => {
            // Trigger exit
            const backBtn = document.getElementById('backBtn');
            if (backBtn) backBtn.click();
        });
        
        restartBtnFail.addEventListener('click', () => {
            startGame();
        });
        
        exitBtnFail.addEventListener('click', () => {
            const backBtn = document.getElementById('backBtn');
            if (backBtn) backBtn.click();
        });
        
        nextWaveBtn.addEventListener('click', () => {
            wave++;
            gameActive = true;
            winModal.style.display = 'none';
            initWave();
        });
        
        // Setup ship select cards click handlers
        const selectCards = document.querySelectorAll('.ship-select-card');
        selectCards.forEach(card => {
            card.addEventListener('click', () => {
                selectCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                playerShipStyle = card.dataset.ship;
            });
        });
        
        // Render preview ships inside select cards
        function drawShipPreview(canvasId, type) {
            const previewCanvas = document.getElementById(canvasId);
            if (!previewCanvas) return;
            const pCtx = previewCanvas.getContext('2d');
            pCtx.clearRect(0, 0, 100, 100);
            
            pCtx.save();
            pCtx.translate(50, 50);
            pCtx.scale(1.5, 1.5); // scaled up for larger grid card preview
            drawPlayerShipGraphics(pCtx, 0, 0, type, false);
            pCtx.restore();
        }
        
        setTimeout(() => {
            drawShipPreview('canvasShipStriker', 'striker');
            drawShipPreview('canvasShipStalker', 'stalker');
            drawShipPreview('canvasShipBomber', 'bomber');
            drawShipPreview('canvasShipInterceptor', 'interceptor');
        }, 120);
        
        const startBtn = document.getElementById('spaceStartGameBtn');
        const selectModal = document.getElementById('spaceShipSelectModal');
        
        startBtn.addEventListener('click', () => {
            selectModal.style.display = 'none';
            startGame();
            loop();
        });
        
        // Cleanup onExit
        container.addEventListener('game-exit', () => {
            cancelAnimationFrame(animationFrameId);
            gameActive = false;
        });
    };
})();
