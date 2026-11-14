// Game: Bug Hunter (صائد الحشرات)
// Fast-paced 2.5D Isometric Bug Defense & Upgrade Shooter
// Fullscreen Mobile Phone Experience with Smooth Walking Controls
(function() {
    window.initBugHunterGame = function(container) {
        // Enforce mobile-sized full screen layout (do NOT use wide-mode)
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.remove('wide-mode');
        }

        // Apply bug-hunter-mode to gameArea for complete mobile phone viewport
        const originalPadding = container.style.padding;
        const originalBorder = container.style.border;
        const originalBg = container.style.backgroundColor;
        const originalRadius = container.style.borderRadius;
        const originalHeight = container.style.height;
        const originalBoxShadow = container.style.boxShadow;
        const originalMargin = container.style.margin;
        const originalMaxWidth = container.style.maxWidth;

        container.classList.add('bug-hunter-mode');
        container.style.padding = '0';
        container.style.border = 'none';
        container.style.backgroundColor = '#090514';
        container.style.borderRadius = '24px';
        container.style.height = 'calc(100vh - 20px)';
        container.style.minHeight = '620px';
        container.style.maxHeight = '900px';
        container.style.maxWidth = '480px';
        container.style.margin = '0 auto';
        container.style.boxShadow = '0 14px 45px rgba(0,0,0,0.6)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.overflow = 'hidden';

        // Web Audio Synthesizer for rich arcade sound effects
        let audioCtx = null;
        function getAudio() {
            if (!audioCtx) {
                try {
                    audioCtx = window.sound && window.sound.ctx ? window.sound.ctx : new (window.AudioContext || window.webkitAudioContext)();
                } catch(e) {}
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playSound(type) {
            const ctx = getAudio();
            if (!ctx) return;
            const now = ctx.currentTime;
            try {
                if (type === 'laser') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.09);
                } else if (type === 'plasma') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                    osc.start(now);
                    osc.stop(now + 0.19);
                } else if (type === 'hit') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
                    osc.start(now);
                    osc.stop(now + 0.08);
                } else if (type === 'bug_death') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
                    gain.gain.setValueAtTime(0.22, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'coin') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(987.77, now); // B5
                    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
                    osc.start(now);
                    osc.stop(now + 0.23);
                } else if (type === 'upgrade') {
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                        gain.gain.setValueAtTime(0.25, now + idx * 0.07);
                        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.14);
                        osc.start(now + idx * 0.07);
                        osc.stop(now + idx * 0.07 + 0.15);
                    });
                } else if (type === 'player_hurt') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(170, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
                    osc.start(now);
                    osc.stop(now + 0.17);
                } else if (type === 'wave_clear') {
                    const chord = [440, 554.37, 659.25, 880];
                    chord.forEach(freq => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now);
                        gain.gain.setValueAtTime(0.2, now);
                        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                        osc.start(now);
                        osc.stop(now + 0.46);
                    });
                }
            } catch(e) {}
        }

        // HTML Layout matching the exact screenshot (dark top bar, full 2.5D arena canvas, controls, shop modal)
        const html = `
            <div class="bug-hunter-wrapper" style="width: 100%; height: 100%; flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; position: relative; user-select: none; -webkit-user-select: none; font-family: var(--font-kids), 'Tajawal', sans-serif; direction: ltr; overflow: hidden; background: #0F0A1C;">
                
                <!-- TOP HEADER HUD (Exact match to screenshot with home button clearance) -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 52px; flex-shrink: 0; background: #090514; padding: 0 16px 0 65px; box-sizing: border-box; border-bottom: 2px solid #23163E; z-index: 10;">
                    <!-- Health on Left (next to back button) -->
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 900; color: #FFFFFF;">
                        <span id="bhHealthText">100 / 100</span>
                        <span style="color: #FF3366; font-size: 17px; filter: drop-shadow(0 0 5px rgba(255,51,102,0.6));">❤️</span>
                    </div>

                    <!-- Wave in Center -->
                    <div style="font-size: 19px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; text-shadow: 0 2px 8px rgba(168,85,247,0.5);">
                        <span id="bhWaveTitle">الموجة 1</span>
                    </div>

                    <!-- Coins on Right -->
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 17px; font-weight: 900; color: #FCD34D;">
                        <span id="bhCoinsText">0</span>
                        <span style="font-size: 19px; filter: drop-shadow(0 0 6px rgba(251,191,36,0.8));">🪙</span>
                    </div>
                </div>

                <!-- MAIN 2.5D CANVAS CONTAINER (Fills all available mobile height) -->
                <div id="bhCanvasContainer" style="flex: 1 1 0; min-height: 0; width: 100%; position: relative; background: #180D30; overflow: hidden; touch-action: none; cursor: crosshair;">
                    <canvas id="bhCanvas" style="display: block; width: 100%; height: 100%;"></canvas>

                    <!-- Floating Action Buttons on Canvas -->
                    <!-- Upgrade Shop Button -->
                    <button id="bhOpenShopBtn" style="position: absolute; bottom: 20px; right: 20px; background: linear-gradient(135deg, #F59E0B, #D97706); color: #FFFFFF; border: 2.5px solid #FDE68A; border-radius: 18px; padding: 10px 16px; font-size: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(245,158,11,0.5); display: flex; align-items: center; gap: 6px; z-index: 15; transition: transform 0.1s;">
                        <span style="font-size: 18px;">🛒</span>
                        <span>الترقية</span>
                    </button>

                    <!-- Wave Announcement Banner -->
                    <div id="bhWaveBanner" style="display: none; position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); background: rgba(15, 10, 28, 0.92); border: 3px solid #A855F7; border-radius: 20px; padding: 14px 28px; text-align: center; color: white; box-shadow: 0 8px 30px rgba(168,85,247,0.6); z-index: 20; pointer-events: none; animation: popBounce 0.4s ease-out;">
                        <div id="bhWaveBannerTitle" style="font-size: 26px; font-weight: 900; color: #E9D5FF; margin-bottom: 4px;">🔥 الموجة 1</div>
                        <div id="bhWaveBannerSub" style="font-size: 13px; font-weight: bold; color: #C084FC;">اقضِ على الحشرات واجمع الكوينز!</div>
                    </div>

                    <!-- Virtual Joystick Area (Always visible at bottom left for touch & mouse drag) -->
                    <div id="bhJoystickContainer" style="position: absolute; bottom: 25px; left: 25px; width: 105px; height: 105px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2.5px dashed rgba(255,255,255,0.3); pointer-events: none; z-index: 12; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                        <div id="bhJoystickThumb" style="width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(circle, #FBBF24, #D97706); border: 2.5px solid #FFFFFF; box-shadow: 0 3px 12px rgba(217,119,6,0.6); transform: translate(0px, 0px); transition: transform 0.04s ease-out;"></div>
                    </div>
                </div>

                <!-- CONTROLS HINT BANNER -->
                <div style="background: #090514; height: 32px; flex-shrink: 0; padding: 0 14px; display: flex; justify-content: space-between; align-items: center; color: #94A3B8; font-size: 11px; font-weight: bold; border-top: 1.5px solid #23163E;">
                    <div>🕹️ اسحب أو انقر للتحرك (أو الأسهم / WASD)</div>
                    <div style="color: #FCD34D;">⚡ إطلاق تلقائي</div>
                </div>

                <!-- UPGRADE SHOP MODAL -->
                <div id="bhShopModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9,5,20,0.88); backdrop-filter: blur(8px); z-index: 50; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box;">
                    <div style="background: #190F2E; border: 3px solid #A855F7; border-radius: 24px; width: 100%; max-width: 440px; max-height: 90vh; padding: 18px 16px; box-sizing: border-box; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(168,85,247,0.4); overflow: hidden;">
                        
                        <!-- Shop Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1.5px solid #3B206E; padding-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 26px;">🛒</span>
                                <div>
                                    <div style="font-size: 18px; font-weight: 900; color: #F3E8FF;">متجر التطويرات</div>
                                    <div style="font-size: 11px; color: #C084FC;">طور سلاحك وسرعتك بالكوينز!</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="background: #2D1A54; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 4px 10px; font-size: 14px; font-weight: 900; color: #FCD34D; display: flex; align-items: center; gap: 4px;">
                                    <span id="bhShopCoins">0</span> 🪙
                                </div>
                                <button id="bhCloseShopBtn" style="background: #3B206E; border: none; width: 32px; height: 32px; border-radius: 50%; color: white; font-weight: 900; cursor: pointer; font-size: 15px;">✕</button>
                            </div>
                        </div>

                        <!-- Shop Items Container -->
                        <div id="bhShopItems" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 4px; max-height: 55vh;">
                            <!-- Injected dynamically -->
                        </div>

                        <!-- Shop Bottom Button -->
                        <div style="margin-top: 14px; text-align: center;">
                            <button id="bhResumeWaveBtn" style="width: 100%; background: linear-gradient(135deg, #A855F7, #7E22CE); color: white; border: none; border-radius: 16px; padding: 12px; font-size: 15px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(168,85,247,0.4);">
                                متابعة القتال ⚔️
                            </button>
                        </div>
                    </div>
                </div>

                <!-- GAME OVER MODAL -->
                <div id="bhGameOverModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9,5,20,0.92); backdrop-filter: blur(8px); z-index: 60; align-items: center; justify-content: center; padding: 18px; box-sizing: border-box;">
                    <div style="background: #190F2E; border: 3.5px solid #EF4444; border-radius: 26px; width: 100%; max-width: 360px; padding: 24px 20px; box-sizing: border-box; text-align: center; box-shadow: 0 10px 40px rgba(239,68,68,0.4); animation: popBounce 0.4s ease;">
                        <div style="font-size: 52px; margin-bottom: 6px;">💀👾</div>
                        <h2 style="color: #F87171; font-size: 24px; font-weight: 900; margin: 0 0 6px;">انتهت الجولة!</h2>
                        <p style="color: #CBD5E1; font-size: 13px; margin: 0 0 16px;">تغلبت الحشرات عليك! طور عتادك وحاول مجدداً.</p>

                        <div style="background: #261347; border-radius: 16px; padding: 12px; margin-bottom: 18px; border: 1.5px solid #3B206E; text-align: right; direction: rtl; font-size: 13.5px; color: #E2E8F0; display: flex; flex-direction: column; gap: 6px;">
                            <div>🏆 أعلى موجة وصلتها: <strong id="bhGoWave" style="color: #A855F7;">1</strong></div>
                            <div>👾 الحشرات المقضي عليها: <strong id="bhGoKills" style="color: #38BDF8;">0</strong></div>
                            <div>🪙 مجموع الكوينز المجموعة: <strong id="bhGoCoins" style="color: #FCD34D;">0</strong></div>
                        </div>

                        <button id="bhRestartBtn" style="width: 100%; background: linear-gradient(135deg, #EF4444, #B91C1C); color: white; border: none; border-radius: 16px; padding: 12px; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(239,68,68,0.4);">
                            🔄 محاولة جديدة
                        </button>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;

        // Elements
        const canvas = document.getElementById('bhCanvas');
        const ctx = canvas.getContext('2d');
        const canvasContainer = document.getElementById('bhCanvasContainer');
        const healthText = document.getElementById('bhHealthText');
        const waveTitle = document.getElementById('bhWaveTitle');
        const coinsText = document.getElementById('bhCoinsText');
        const openShopBtn = document.getElementById('bhOpenShopBtn');
        const closeShopBtn = document.getElementById('bhCloseShopBtn');
        const resumeWaveBtn = document.getElementById('bhResumeWaveBtn');
        const shopModal = document.getElementById('bhShopModal');
        const shopCoins = document.getElementById('bhShopCoins');
        const shopItems = document.getElementById('bhShopItems');
        const waveBanner = document.getElementById('bhWaveBanner');
        const waveBannerTitle = document.getElementById('bhWaveBannerTitle');
        const waveBannerSub = document.getElementById('bhWaveBannerSub');
        const gameOverModal = document.getElementById('bhGameOverModal');
        const restartBtn = document.getElementById('bhRestartBtn');
        const goWaveEl = document.getElementById('bhGoWave');
        const goKillsEl = document.getElementById('bhGoKills');
        const goCoinsEl = document.getElementById('bhGoCoins');
        const joystickContainer = document.getElementById('bhJoystickContainer');
        const joystickThumb = document.getElementById('bhJoystickThumb');

        // Arena Dimensions (Virtual Arena Space 480 x 800)
        const ARENA_W = 480;
        const ARENA_H = 800;
        const WALL_THICKNESS = 24;

        // Obstacles (Exact match to screenshot: pink rectangular blocks / tables)
        const OBSTACLES = [
            { x: 50,  y: 280, w: 135, h: 56 }, // Left top table
            { x: 310, y: 390, w: 145, h: 56 }, // Right mid table
            { x: 390, y: 190, w: 75,  h: 70 }, // Right top block
            { x: 0,   y: 520, w: 50,  h: 80 }, // Left edge block
            { x: 180, y: 640, w: 135, h: 52 }  // Bottom mid table
        ];

        // Weapon Tiers
        const WEAPON_TIERS = [
            { name: 'مسدس فردي', bullets: 1, damage: 28, speed: 680, spread: 0, color: '#FFFFFF', radius: 4 },
            { name: 'مسدس مزدوج', bullets: 2, damage: 34, speed: 720, spread: 0.16, color: '#38BDF8', radius: 4.5 },
            { name: 'إطلاق ثلاثي متفرق', bullets: 3, damage: 42, speed: 760, spread: 0.24, color: '#A855F7', radius: 5 },
            { name: 'بندقية البلازما المتفجرة', bullets: 3, damage: 65, speed: 820, spread: 0.20, explosive: true, color: '#F43F5E', radius: 6.5 },
            { name: 'مدفع الهايبر نوفا الفتاك', bullets: 5, damage: 90, speed: 900, spread: 0.35, explosive: true, color: '#FBBF24', radius: 7 }
        ];

        // Upgrades State
        let upgrades = {
            weaponLevel: 1,
            speedLevel: 1,
            fireRateLevel: 1,
            maxHpLevel: 1,
            magnetLevel: 1
        };

        // Player State (Spawn in clear open space at x: 170, y: 550)
        let player = {
            x: 170,
            y: 550,
            radius: 18,
            angle: -Math.PI / 2,
            facingAngle: -Math.PI / 2,
            hp: 100,
            maxHp: 100,
            speed: 235,
            fireCooldown: 0,
            fireRate: 3.0,
            magnetRadius: 85,
            walkCycle: 0,
            isMoving: false
        };

        // Game Entities
        let bugs = [];
        let bullets = [];
        let enemyBullets = [];
        let coins = [];
        let particles = [];
        let floatTexts = [];

        // Game Variables
        let currentWave = 1;
        let waveSpawnTimer = 0;
        let bugsToSpawn = [];
        let waveActive = false;
        let waveTransition = false;
        let totalCoins = 0;
        let totalKills = 0;
        let gameActive = true;
        let isShopOpen = false;
        let animId = null;
        let lastTime = performance.now();

        // Input Management (Keys + Unified Pointer)
        const keys = {};
        let isPointerDown = false;
        let pointerId = null;
        let pointerStart = { x: 0, y: 0 };
        let pointerCurrent = { x: 0, y: 0 };
        let moveVector = { x: 0, y: 0 };
        let clickTarget = null;

        // Handle Canvas Sizing
        function resizeCanvas() {
            const rect = canvasContainer.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Keyboard Controls (Supports English WASD, Arrow keys, and Arabic keyboard layout)
        function onKeyDown(e) {
            const k = e.key.toLowerCase();
            keys[k] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            }
        }
        function onKeyUp(e) {
            const k = e.key.toLowerCase();
            keys[k] = false;
        }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Unified Pointer Controls (Touch screen, Mouse drag, and Tap-to-walk)
        function onPointerDown(e) {
            if (isShopOpen || !gameActive) return;
            if (e.target.closest('#bhOpenShopBtn') || e.target.closest('.modal')) return;

            const rect = canvasContainer.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            isPointerDown = true;
            pointerId = e.pointerId;
            try {
                canvasContainer.setPointerCapture(e.pointerId);
            } catch(err) {}

            pointerStart = { x: px, y: py };
            pointerCurrent = { x: px, y: py };
            moveVector = { x: 0, y: 0 };

            // Dynamic joystick position near touch point (or bottom left)
            const joyX = Math.max(55, Math.min(rect.width - 55, px));
            const joyY = Math.max(55, Math.min(rect.height - 55, py));
            joystickContainer.style.left = `${joyX - 52}px`;
            joystickContainer.style.top = `${joyY - 52}px`;
            joystickContainer.style.bottom = 'auto';
            joystickThumb.style.transform = 'translate(0px, 0px)';

            // Set tap target in Arena coordinates (tap to walk)
            const arenaX = (px / rect.width) * ARENA_W;
            const arenaY = (py / rect.height) * ARENA_H;
            clickTarget = { x: arenaX, y: arenaY };
        }

        function onPointerMove(e) {
            if (!isPointerDown || e.pointerId !== pointerId) return;
            const rect = canvasContainer.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            pointerCurrent = { x: px, y: py };
            const dx = pointerCurrent.x - pointerStart.x;
            const dy = pointerCurrent.y - pointerStart.y;
            const dist = Math.hypot(dx, dy);
            const maxRadius = 42;

            if (dist > 6) {
                // Dragging detected -> cancel tap-to-move point and use directional drag
                clickTarget = null;
                const clampedDist = Math.min(dist, maxRadius);
                moveVector.x = (dx / dist) * (clampedDist / maxRadius);
                moveVector.y = (dy / dist) * (clampedDist / maxRadius);
                joystickThumb.style.transform = `translate(${moveVector.x * maxRadius}px, ${moveVector.y * maxRadius}px)`;
            } else {
                moveVector = { x: 0, y: 0 };
                joystickThumb.style.transform = 'translate(0px, 0px)';
            }
        }

        function onPointerUp(e) {
            if (e.pointerId !== pointerId) return;
            isPointerDown = false;
            pointerId = null;
            moveVector = { x: 0, y: 0 };
            joystickThumb.style.transform = 'translate(0px, 0px)';

            // Reset joystick to default bottom-left corner
            joystickContainer.style.left = '25px';
            joystickContainer.style.top = 'auto';
            joystickContainer.style.bottom = '25px';
        }

        canvasContainer.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        // Update Upgrades & Player Stats
        function recalculateStats() {
            player.speed = 235 + (upgrades.speedLevel - 1) * 32;
            player.fireRate = 3.0 + (upgrades.fireRateLevel - 1) * 0.8;
            const oldMax = player.maxHp;
            player.maxHp = 100 + (upgrades.maxHpLevel - 1) * 35;
            if (player.maxHp > oldMax) {
                player.hp = Math.min(player.maxHp, player.hp + (player.maxHp - oldMax));
            }
            player.magnetRadius = 85 + (upgrades.magnetLevel - 1) * 45;
            updateHUD();
        }

        function updateHUD() {
            healthText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
            waveTitle.textContent = `الموجة ${currentWave}`;
            coinsText.textContent = `${totalCoins}`;
            shopCoins.textContent = `${totalCoins}`;
        }

        // Particle System
        function spawnParticles(x, y, color, count = 8, speed = 140) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = (0.3 + Math.random() * 0.7) * speed;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: 2 + Math.random() * 2.5,
                    color,
                    alpha: 1,
                    decay: 1.5 + Math.random() * 2.5
                });
            }
        }

        function spawnFloatingText(x, y, text, color = '#FFFFFF', size = 15) {
            floatTexts.push({
                x, y, text, color, size,
                alpha: 1,
                vy: -35
            });
        }

        // Waves Generation System
        function prepareWave(wave) {
            currentWave = wave;
            updateHUD();

            bugsToSpawn = [];
            bugs = [];
            enemyBullets = [];

            const baseCount = 5 + wave * 3;
            const hasBoss = wave % 5 === 0;

            for (let i = 0; i < baseCount; i++) {
                const rand = Math.random();
                if (wave >= 3 && rand < 0.25) {
                    bugsToSpawn.push('spitter');
                } else if (wave >= 2 && rand < 0.45) {
                    bugsToSpawn.push('tank');
                } else {
                    bugsToSpawn.push('spider');
                }
            }

            if (hasBoss) {
                bugsToSpawn.push('boss');
            }

            bugsToSpawn.sort(() => Math.random() - 0.5);

            waveSpawnTimer = 0.5;
            waveActive = true;
            waveTransition = false;

            waveBannerTitle.textContent = hasBoss ? `🚨 زعيم الموجة ${wave}!` : `🔥 الموجة ${wave}`;
            waveBannerSub.textContent = hasBoss ? 'حشرة آلية عملاقة تقترب! احذر من ضرباتها!' : `اقضِ على ${bugsToSpawn.length} حشرة واجمع الكوينز!`;
            waveBanner.style.display = 'block';
            setTimeout(() => {
                waveBanner.style.display = 'none';
            }, 1800);
        }

        function spawnBug(type) {
            let x, y;
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { // Top
                x = WALL_THICKNESS + 20 + Math.random() * (ARENA_W - WALL_THICKNESS * 2 - 40);
                y = WALL_THICKNESS + 10;
            } else if (side === 1) { // Bottom
                x = WALL_THICKNESS + 20 + Math.random() * (ARENA_W - WALL_THICKNESS * 2 - 40);
                y = ARENA_H - WALL_THICKNESS - 10;
            } else if (side === 2) { // Left
                x = WALL_THICKNESS + 10;
                y = WALL_THICKNESS + 20 + Math.random() * (ARENA_H - WALL_THICKNESS * 2 - 40);
            } else { // Right
                x = ARENA_W - WALL_THICKNESS - 10;
                y = WALL_THICKNESS + 20 + Math.random() * (ARENA_H - WALL_THICKNESS * 2 - 40);
            }

            if (type === 'boss') {
                bugs.push({
                    type: 'boss',
                    x: ARENA_W / 2,
                    y: 75,
                    radius: 36,
                    hp: 550 + currentWave * 180,
                    maxHp: 550 + currentWave * 180,
                    speed: 70 + currentWave * 2,
                    damage: 30,
                    attackTimer: 2.0,
                    color: '#6B21A8',
                    accentColor: '#EF4444',
                    coinReward: 35 + currentWave * 5,
                    walkCycle: 0
                });
            } else if (type === 'tank') {
                bugs.push({
                    type: 'tank',
                    x, y,
                    radius: 24,
                    hp: 110 + currentWave * 30,
                    maxHp: 110 + currentWave * 30,
                    speed: 68 + currentWave * 3,
                    damage: 18,
                    attackTimer: 0,
                    color: '#4C1D95',
                    accentColor: '#FBBF24',
                    coinReward: 4,
                    walkCycle: 0
                });
            } else if (type === 'spitter') {
                bugs.push({
                    type: 'spitter',
                    x, y,
                    radius: 17,
                    hp: 50 + currentWave * 14,
                    maxHp: 50 + currentWave * 14,
                    speed: 88 + currentWave * 3,
                    damage: 12,
                    attackTimer: 1.5 + Math.random() * 1.5,
                    color: '#10B981',
                    accentColor: '#34D399',
                    coinReward: 2,
                    walkCycle: 0
                });
            } else {
                // Regular Spider / Beetle (Exact matching colors from screenshot)
                bugs.push({
                    type: 'spider',
                    x, y,
                    radius: 16,
                    hp: 35 + currentWave * 10,
                    maxHp: 35 + currentWave * 10,
                    speed: 110 + currentWave * 5,
                    damage: 10,
                    attackTimer: 0,
                    color: '#9333EA',
                    accentColor: '#FDE047',
                    coinReward: 1,
                    walkCycle: 0
                });
            }
        }

        // Robust Circle-Box Collision Helper (Prevents snagging, allows smooth sliding)
        function checkCircleBoxCollision(cx, cy, cr, box) {
            const nearestX = Math.max(box.x, Math.min(cx, box.x + box.w));
            const nearestY = Math.max(box.y, Math.min(cy, box.y + box.h));
            let dx = cx - nearestX;
            let dy = cy - nearestY;

            // If circle center is strictly inside the box
            if (dx === 0 && dy === 0) {
                const pushLeft = cx - box.x;
                const pushRight = (box.x + box.w) - cx;
                const pushTop = cy - box.y;
                const pushBottom = (box.y + box.h) - cy;
                const min = Math.min(pushLeft, pushRight, pushTop, pushBottom);
                if (min === pushLeft) return { collided: true, resolveX: -(pushLeft + cr), resolveY: 0 };
                if (min === pushRight) return { collided: true, resolveX: pushRight + cr, resolveY: 0 };
                if (min === pushTop) return { collided: true, resolveX: 0, resolveY: -(pushTop + cr) };
                return { collided: true, resolveX: 0, resolveY: pushBottom + cr };
            }

            const distSq = dx * dx + dy * dy;
            if (distSq < cr * cr) {
                const dist = Math.sqrt(distSq) || 0.001;
                const overlap = cr - dist;
                return {
                    collided: true,
                    resolveX: (dx / dist) * overlap,
                    resolveY: (dy / dist) * overlap
                };
            }
            return { collided: false, resolveX: 0, resolveY: 0 };
        }

        // Fire Bullet
        function fireWeapon() {
            const tier = WEAPON_TIERS[upgrades.weaponLevel - 1];
            playSound(tier.explosive ? 'plasma' : 'laser');

            // Find nearest bug to aim at
            let targetAngle = player.angle;
            let nearestDist = 99999;
            let nearestBug = null;

            bugs.forEach(bug => {
                const dist = Math.hypot(bug.x - player.x, bug.y - player.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestBug = bug;
                }
            });

            if (nearestBug) {
                targetAngle = Math.atan2(nearestBug.y - player.y, nearestBug.x - player.x);
                player.angle = targetAngle;
            }

            const count = tier.bullets;
            const spreadAngle = tier.spread;
            const startAngle = targetAngle - (spreadAngle * (count - 1)) / 2;

            for (let i = 0; i < count; i++) {
                const bAngle = count === 1 ? targetAngle : startAngle + i * spreadAngle;
                bullets.push({
                    x: player.x + Math.cos(targetAngle) * (player.radius + 6),
                    y: player.y + Math.sin(targetAngle) * (player.radius + 6),
                    vx: Math.cos(bAngle) * tier.speed,
                    vy: Math.sin(bAngle) * tier.speed,
                    radius: tier.radius,
                    damage: tier.damage,
                    color: tier.color,
                    explosive: tier.explosive || false,
                    life: 1.3
                });
            }

            // Muzzle flash particles
            const mx = player.x + Math.cos(targetAngle) * (player.radius + 8);
            const my = player.y + Math.sin(targetAngle) * (player.radius + 8);
            spawnParticles(mx, my, tier.color, 4, 110);
        }

        // Enemy Attack Logic
        function enemyAttack(bug, dt) {
            bug.attackTimer -= dt;
            if (bug.attackTimer <= 0) {
                if (bug.type === 'spitter') {
                    bug.attackTimer = 2.4;
                    const angle = Math.atan2(player.y - bug.y, player.x - bug.x);
                    enemyBullets.push({
                        x: bug.x + Math.cos(angle) * (bug.radius + 4),
                        y: bug.y + Math.sin(angle) * (bug.radius + 4),
                        vx: Math.cos(angle) * 260,
                        vy: Math.sin(angle) * 260,
                        radius: 5.5,
                        damage: bug.damage,
                        color: '#10B981',
                        life: 2.5
                    });
                    playSound('hit');
                } else if (bug.type === 'boss') {
                    bug.attackTimer = 2.8;
                    for (let a = 0; a < 8; a++) {
                        const angle = (a * Math.PI) / 4;
                        enemyBullets.push({
                            x: bug.x,
                            y: bug.y,
                            vx: Math.cos(angle) * 210,
                            vy: Math.sin(angle) * 210,
                            radius: 6,
                            damage: 18,
                            color: '#F43F5E',
                            life: 2.8
                        });
                    }
                    playSound('plasma');
                }
            }
        }

        // Main Update Loop
        function update(dt) {
            if (!gameActive || isShopOpen) return;

            // --- 1. Player Input & Smooth Walking Movement ---
            let moveX = 0;
            let moveY = 0;

            // Keyboard keys (English + Arabic layouts)
            if (keys['w'] || keys['arrowup'] || keys['ص'] || keys['ض']) moveY -= 1;
            if (keys['s'] || keys['arrowdown'] || keys['س']) moveY += 1;
            if (keys['a'] || keys['arrowleft'] || keys['ش'] || keys['ف']) moveX -= 1;
            if (keys['d'] || keys['arrowright'] || keys['ي'] || keys['ق']) moveX += 1;

            // Drag / Virtual Joystick
            if (moveVector.x !== 0 || moveVector.y !== 0) {
                moveX = moveVector.x;
                moveY = moveVector.y;
                clickTarget = null;
            }

            // Tap-to-walk target
            if (clickTarget && moveX === 0 && moveY === 0) {
                const tdx = clickTarget.x - player.x;
                const tdy = clickTarget.y - player.y;
                const tdist = Math.hypot(tdx, tdy);
                if (tdist > 8) {
                    moveX = tdx / tdist;
                    moveY = tdy / tdist;
                } else {
                    clickTarget = null;
                }
            }

            const len = Math.hypot(moveX, moveY);
            player.isMoving = len > 0.05;

            if (player.isMoving) {
                const normX = moveX / Math.max(1, len);
                const normY = moveY / Math.max(1, len);

                // Axis-separated movement & collision for effortless sliding
                player.x += normX * player.speed * dt;
                player.x = Math.max(WALL_THICKNESS + player.radius, Math.min(ARENA_W - WALL_THICKNESS - player.radius, player.x));
                OBSTACLES.forEach(box => {
                    const col = checkCircleBoxCollision(player.x, player.y, player.radius, box);
                    if (col.collided) {
                        player.x += col.resolveX;
                    }
                });

                player.y += normY * player.speed * dt;
                player.y = Math.max(WALL_THICKNESS + player.radius, Math.min(ARENA_H - WALL_THICKNESS - player.radius, player.y));
                OBSTACLES.forEach(box => {
                    const col = checkCircleBoxCollision(player.x, player.y, player.radius, box);
                    if (col.collided) {
                        player.y += col.resolveY;
                    }
                });

                player.facingAngle = Math.atan2(normY, normX);
                player.walkCycle += dt * 14;

                // Dust particles while walking
                if (Math.random() < 0.22) {
                    particles.push({
                        x: player.x - Math.cos(player.facingAngle) * 12 + (Math.random() - 0.5) * 8,
                        y: player.y + 12 + (Math.random() - 0.5) * 4,
                        vx: (Math.random() - 0.5) * 20,
                        vy: -15 - Math.random() * 20,
                        radius: 2,
                        color: 'rgba(255,255,255,0.4)',
                        alpha: 0.6,
                        decay: 2.5
                    });
                }
            } else {
                player.walkCycle += dt * 2.5; // Idle breathing
            }

            // Aim towards nearest bug if enemies present, otherwise look in walking direction
            if (bugs.length === 0 && player.isMoving) {
                player.angle = player.facingAngle;
            }

            // --- 2. Auto-Shoot Weapon ---
            player.fireCooldown -= dt;
            if (bugs.length > 0 && player.fireCooldown <= 0) {
                fireWeapon();
                player.fireCooldown = 1.0 / player.fireRate;
            }

            // --- 3. Update Player Bullets ---
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= dt;

                // Wall collision
                if (b.x < WALL_THICKNESS || b.x > ARENA_W - WALL_THICKNESS || b.y < WALL_THICKNESS || b.y > ARENA_H - WALL_THICKNESS) {
                    spawnParticles(b.x, b.y, b.color, 3, 70);
                    bullets.splice(i, 1);
                    continue;
                }

                // Obstacle collision
                let hitObstacle = false;
                for (const box of OBSTACLES) {
                    if (b.x > box.x && b.x < box.x + box.w && b.y > box.y && b.y < box.y + box.h) {
                        spawnParticles(b.x, b.y, '#FF8BA7', 4, 90);
                        hitObstacle = true;
                        break;
                    }
                }
                if (hitObstacle) {
                    bullets.splice(i, 1);
                    continue;
                }

                // Bug collision
                let hitBug = false;
                for (let j = bugs.length - 1; j >= 0; j--) {
                    const bug = bugs[j];
                    const dist = Math.hypot(b.x - bug.x, b.y - bug.y);
                    if (dist < b.radius + bug.radius) {
                        hitBug = true;
                        bug.hp -= b.damage;
                        spawnParticles(b.x, b.y, bug.color, 5, 120);
                        spawnFloatingText(bug.x, bug.y - 12, `-${b.damage}`, '#FDE047', 14);
                        playSound('hit');

                        // Explosive area splash damage
                        if (b.explosive) {
                            spawnParticles(b.x, b.y, '#F97316', 14, 180);
                            bugs.forEach(other => {
                                if (other !== bug) {
                                    const splashDist = Math.hypot(other.x - b.x, other.y - b.y);
                                    if (splashDist < 75) {
                                        other.hp -= b.damage * 0.6;
                                        spawnFloatingText(other.x, other.y - 10, `-${Math.round(b.damage * 0.6)}`, '#F97316', 12);
                                    }
                                }
                            });
                        }

                        // Bug Killed
                        if (bug.hp <= 0) {
                            killBug(bug, j);
                        }
                        break;
                    }
                }

                if (hitBug || b.life <= 0) {
                    bullets.splice(i, 1);
                }
            }

            // --- 4. Update Enemy Projectiles ---
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const eb = enemyBullets[i];
                eb.x += eb.vx * dt;
                eb.y += eb.vy * dt;
                eb.life -= dt;

                // Collision with player
                const pDist = Math.hypot(eb.x - player.x, eb.y - player.y);
                if (pDist < eb.radius + player.radius) {
                    damagePlayer(eb.damage);
                    spawnParticles(eb.x, eb.y, '#EF4444', 6, 120);
                    enemyBullets.splice(i, 1);
                    continue;
                }

                // Obstacle collision
                let hitObs = false;
                for (const box of OBSTACLES) {
                    if (eb.x > box.x && eb.x < box.x + box.w && eb.y > box.y && eb.y < box.y + box.h) {
                        hitObs = true;
                        break;
                    }
                }

                if (hitObs || eb.life <= 0 || eb.x < 0 || eb.x > ARENA_W || eb.y < 0 || eb.y > ARENA_H) {
                    enemyBullets.splice(i, 1);
                }
            }

            // --- 5. Spawn Queue Handler ---
            if (waveActive && bugsToSpawn.length > 0) {
                waveSpawnTimer -= dt;
                if (waveSpawnTimer <= 0) {
                    const nextType = bugsToSpawn.shift();
                    spawnBug(nextType);
                    waveSpawnTimer = Math.max(0.5, 1.4 - currentWave * 0.05);
                }
            }

            // --- 6. Update Bugs (AI, movement, collisions) ---
            bugs.forEach(bug => {
                bug.walkCycle += dt * 10;
                const angleToPlayer = Math.atan2(player.y - bug.y, player.x - bug.x);
                const distToPlayer = Math.hypot(player.x - bug.x, player.y - bug.y);

                if (bug.type === 'spitter' && distToPlayer < 200) {
                    bug.x -= Math.cos(angleToPlayer) * bug.speed * dt * 0.7;
                    bug.y -= Math.sin(angleToPlayer) * bug.speed * dt * 0.7;
                } else {
                    bug.x += Math.cos(angleToPlayer) * bug.speed * dt;
                    bug.y += Math.sin(angleToPlayer) * bug.speed * dt;
                }

                // Obstacle collision for bug
                OBSTACLES.forEach(box => {
                    const col = checkCircleBoxCollision(bug.x, bug.y, bug.radius, box);
                    if (col.collided) {
                        bug.x += col.resolveX;
                        bug.y += col.resolveY;
                    }
                });

                // Attack logic
                if (bug.type === 'spitter' || bug.type === 'boss') {
                    enemyAttack(bug, dt);
                }

                // Melee contact with player
                if (distToPlayer < bug.radius + player.radius) {
                    damagePlayer(bug.damage * dt * 1.8);
                }
            });

            // --- 7. Update Coins (Physics, magnetic pull, collection) ---
            for (let i = coins.length - 1; i >= 0; i--) {
                const c = coins[i];
                c.rotation += dt * 5;

                const dist = Math.hypot(player.x - c.x, player.y - c.y);

                // Magnetic Attraction
                if (dist < player.magnetRadius) {
                    const angle = Math.atan2(player.y - c.y, player.x - c.x);
                    const pullSpeed = 380 + (player.magnetRadius - dist) * 4;
                    c.vx += Math.cos(angle) * pullSpeed * dt;
                    c.vy += Math.sin(angle) * pullSpeed * dt;
                }

                c.x += c.vx * dt;
                c.y += c.vy * dt;
                c.vx *= 0.92;
                c.vy *= 0.92;

                // Collection
                if (dist < player.radius + 14) {
                    totalCoins += c.value;
                    playSound('coin');
                    spawnParticles(c.x, c.y, '#FCD34D', 5, 80);
                    spawnFloatingText(c.x, c.y - 10, `+${c.value} 🪙`, '#FCD34D', 13);
                    updateHUD();
                    coins.splice(i, 1);
                }
            }

            // --- 8. Update Particles ---
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.alpha -= p.decay * dt;
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                }
            }

            // --- 9. Update Floating Texts ---
            for (let i = floatTexts.length - 1; i >= 0; i--) {
                const ft = floatTexts[i];
                ft.y += ft.vy * dt;
                ft.alpha -= 0.9 * dt;
                if (ft.alpha <= 0) {
                    floatTexts.splice(i, 1);
                }
            }

            // --- 10. Wave Completion Check ---
            if (waveActive && bugsToSpawn.length === 0 && bugs.length === 0 && !waveTransition) {
                waveTransition = true;
                waveActive = false;
                playSound('wave_clear');

                const bonus = 5 + currentWave * 2;
                totalCoins += bonus;
                updateHUD();
                spawnFloatingText(ARENA_W / 2, ARENA_H / 2 - 30, `🎉 اكتملت الموجة! مكافأة +${bonus} 🪙`, '#A855F7', 18);

                setTimeout(() => {
                    if (gameActive) {
                        openShop();
                    }
                }, 1200);
            }
        }

        function damagePlayer(amount) {
            player.hp -= amount;
            playSound('player_hurt');
            updateHUD();

            if (player.hp <= 0) {
                player.hp = 0;
                updateHUD();
                gameOver();
            }
        }

        function killBug(bug, index) {
            bugs.splice(index, 1);
            totalKills++;
            playSound('bug_death');
            spawnParticles(bug.x, bug.y, bug.color, 16, 200);

            // Drop bouncing coins
            const dropCount = bug.coinReward || 1;
            for (let k = 0; k < dropCount; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 40 + Math.random() * 80;
                coins.push({
                    x: bug.x,
                    y: bug.y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    value: 1,
                    rotation: Math.random() * Math.PI
                });
            }
        }

        function gameOver() {
            gameActive = false;
            goWaveEl.textContent = currentWave;
            goKillsEl.textContent = totalKills;
            goCoinsEl.textContent = totalCoins;
            gameOverModal.style.display = 'flex';
        }

        // ==========================================
        // RENDER PIPELINE (Exact match to screenshot)
        // ==========================================
        function drawArena() {
            // Checkered Purple / Deep Indigo Floor Tiles
            const tileSize = 44;
            const cols = Math.ceil(ARENA_W / tileSize);
            const rows = Math.ceil(ARENA_H / tileSize);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const isEven = (r + c) % 2 === 0;
                    ctx.fillStyle = isEven ? '#3B2968' : '#2F1F56';
                    ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                }
            }

            // Top-down Ambient Wall Borders (matching screenshot perimeter walls)
            ctx.fillStyle = '#221442';
            ctx.fillRect(0, 0, ARENA_W, WALL_THICKNESS); // Top
            ctx.fillRect(0, ARENA_H - WALL_THICKNESS, ARENA_W, WALL_THICKNESS); // Bottom
            ctx.fillRect(0, 0, WALL_THICKNESS, ARENA_H); // Left
            ctx.fillRect(ARENA_W - WALL_THICKNESS, 0, WALL_THICKNESS, ARENA_H); // Right

            // Wall Bevel Lines
            ctx.strokeStyle = '#4A347F';
            ctx.lineWidth = 3;
            ctx.strokeRect(WALL_THICKNESS, WALL_THICKNESS, ARENA_W - WALL_THICKNESS * 2, ARENA_H - WALL_THICKNESS * 2);

            // Obstacles (Pink tables/boxes with shaded 3D top and vertical drop face)
            OBSTACLES.forEach(box => {
                const depth = 16;

                // Soft Floor Shadow
                ctx.fillStyle = 'rgba(10, 5, 20, 0.55)';
                ctx.beginPath();
                ctx.roundRect(box.x - 4, box.y + depth + 4, box.w + 8, box.h, 10);
                ctx.fill();

                // Front 3D Drop Face (Darker Pink)
                ctx.fillStyle = '#C24D70';
                ctx.beginPath();
                ctx.roundRect(box.x, box.y + depth, box.w, box.h, 8);
                ctx.fill();

                // Top Surface (Light Vibrant Pink matching screenshot)
                ctx.fillStyle = '#FF8DA1';
                ctx.beginPath();
                ctx.roundRect(box.x, box.y, box.w, box.h, 8);
                ctx.fill();

                // Top Face Highlight Border
                ctx.strokeStyle = '#FBCFE8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
            });
        }

        // Draw Player with lively walking animation and cute hero aesthetics
        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x, player.y);

            // Floor Shadow (slight pulse with walking)
            const shadowScale = player.isMoving ? 1 + Math.sin(player.walkCycle) * 0.08 : 1;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 16, player.radius * 1.1 * shadowScale, player.radius * 0.6 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Animated Walking Boots/Feet
            const footWiggle = player.isMoving ? Math.sin(player.walkCycle) * 7 : 0;
            ctx.save();
            ctx.rotate(player.facingAngle || player.angle);

            // Left Boot
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.roundRect(-8 + footWiggle, -14, 10, 6, 3);
            ctx.fill();

            // Right Boot
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.roundRect(-8 - footWiggle, 8, 10, 6, 3);
            ctx.fill();
            ctx.restore();

            // Rotate towards aim/target direction
            ctx.rotate(player.angle);

            // Body bobbing while walking
            const bob = player.isMoving ? Math.abs(Math.sin(player.walkCycle)) * 2.5 : Math.sin(player.walkCycle) * 0.8;

            // Backpack / Oxygen Tank
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.roundRect(-22, -9, 10, 18, 4);
            ctx.fill();

            // Teal Suit Body
            ctx.fillStyle = '#06B6D4';
            ctx.beginPath();
            ctx.roundRect(-12, -14 - bob * 0.2, 20, 28, 9);
            ctx.fill();

            // Yellow Round Helmet / Head (Exact match to screenshot)
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.arc(0, 0 - bob * 0.4, 13, 0, Math.PI * 2);
            ctx.fill();

            // Dark Visor / Eyes
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect(4, -6 - bob * 0.4, 7, 12, 3);
            ctx.fill();

            // Blaster Weapon
            const tier = WEAPON_TIERS[upgrades.weaponLevel - 1];
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(10, 6 - bob * 0.3, 16, 5);
            ctx.fillStyle = tier.color;
            ctx.fillRect(18, 5 - bob * 0.3, 8, 7);

            ctx.restore();
        }

        // Draw Bug (Purple crawler spider / robotic mech beetle)
        function drawBug(bug) {
            ctx.save();
            ctx.translate(bug.x, bug.y);

            // Floor Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, bug.radius * 0.8, bug.radius * 1.1, bug.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            const angleToPlayer = Math.atan2(player.y - bug.y, player.x - bug.x);
            ctx.rotate(angleToPlayer);

            const legWiggle = Math.sin(bug.walkCycle) * 0.35;

            // Draw Animated Crawling Legs
            ctx.strokeStyle = bug.color;
            ctx.lineWidth = bug.type === 'boss' ? 5 : (bug.type === 'tank' ? 4 : 2.5);
            ctx.lineCap = 'round';

            const legAngles = [-0.7, 0, 0.7];
            legAngles.forEach((la, idx) => {
                const wiggle = idx % 2 === 0 ? legWiggle : -legWiggle;
                const r = bug.radius;

                // Left Leg
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.5);
                ctx.lineTo(-r * 0.7, -r * 1.3 + wiggle * 8);
                ctx.lineTo(-r * 1.2, -r * 1.5 + wiggle * 10);
                ctx.stroke();

                // Right Leg
                ctx.beginPath();
                ctx.moveTo(0, r * 0.5);
                ctx.lineTo(-r * 0.7, r * 1.3 - wiggle * 8);
                ctx.lineTo(-r * 1.2, r * 1.5 - wiggle * 10);
                ctx.stroke();
            });

            // Bug Body
            if (bug.type === 'tank' || bug.type === 'boss') {
                // Square Mech Armor (exact match to screenshot!)
                ctx.fillStyle = bug.color;
                ctx.beginPath();
                ctx.roundRect(-bug.radius, -bug.radius, bug.radius * 2, bug.radius * 2, 8);
                ctx.fill();

                // Glowing Yellow Cyber Decals
                ctx.strokeStyle = bug.accentColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(-bug.radius * 0.6, -bug.radius * 0.6, bug.radius * 1.2, bug.radius * 1.2);

                // Optic Sensor / Eyes
                ctx.fillStyle = '#FDE047';
                ctx.beginPath();
                ctx.arc(bug.radius * 0.6, -6, 3.5, 0, Math.PI * 2);
                ctx.arc(bug.radius * 0.6, 6, 3.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Purple Spider Oval Body (as in screenshot!)
                ctx.fillStyle = bug.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, bug.radius * 1.1, bug.radius * 0.85, 0, 0, Math.PI * 2);
                ctx.fill();

                // Glowing Yellow Eyes / Fangs
                ctx.fillStyle = bug.accentColor;
                ctx.beginPath();
                ctx.arc(bug.radius * 0.65, -4.5, 2.8, 0, Math.PI * 2);
                ctx.arc(bug.radius * 0.65, 4.5, 2.8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Health Bar above Bug (matching screenshot!)
            const barW = Math.max(34, bug.radius * 2);
            const barH = 5;
            const barX = bug.x - barW / 2;
            const barY = bug.y - bug.radius - 12;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX, barY, barW, barH);
            const hpRatio = Math.max(0, bug.hp / bug.maxHp);
            ctx.fillStyle = hpRatio > 0.4 ? '#EF4444' : '#DC2626';
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
        }

        // Draw Gold Coin
        function drawCoin(c) {
            ctx.save();
            ctx.translate(c.x, c.y);

            const scaleX = Math.abs(Math.cos(c.rotation));
            ctx.scale(scaleX, 1);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 7, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Gold Outer Ring
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
            ctx.fill();

            // Gold Inner Face
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Main Render Loop
        function render() {
            // Clean frame reset
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Scale virtual arena coordinates (0..ARENA_W, 0..ARENA_H) to real canvas pixels
            ctx.setTransform(canvas.width / ARENA_W, 0, 0, canvas.height / ARENA_H, 0, 0);

            drawArena();

            // Draw Coins
            coins.forEach(drawCoin);

            // Draw Enemy Bullets
            enemyBullets.forEach(eb => {
                ctx.fillStyle = eb.color;
                ctx.beginPath();
                ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Bugs
            bugs.forEach(drawBug);

            // Draw Player
            drawPlayer();

            // Draw Player Bullets
            bullets.forEach(b => {
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();

                // Glow trail
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.arc(b.x - b.vx * 0.02, b.y - b.vy * 0.02, b.radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Particles
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw Floating Damage & Coin Texts
            floatTexts.forEach(ft => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, ft.alpha);
                ctx.font = `900 ${ft.size}px var(--font-kids), 'Tajawal', sans-serif`;
                ctx.fillStyle = ft.color;
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 6;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });
        }

        // Game Loop
        function gameLoop(timestamp) {
            if (!gameActive) return;
            const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            update(dt);
            render();

            animId = requestAnimationFrame(gameLoop);
        }

        // ==========================================
        // UPGRADE SHOP SYSTEM
        // ==========================================
        function renderShopItems() {
            shopItems.innerHTML = '';

            const items = [
                {
                    id: 'weapon',
                    title: 'ترقية السلاح 🔫',
                    desc: WEAPON_TIERS[Math.min(WEAPON_TIERS.length - 1, upgrades.weaponLevel)].name,
                    level: upgrades.weaponLevel,
                    maxLevel: WEAPON_TIERS.length,
                    cost: upgrades.weaponLevel * 15,
                    icon: '🔫',
                    color: '#38BDF8'
                },
                {
                    id: 'speed',
                    title: 'سرعة البطل ⚡',
                    desc: `زيادة السرعة إلى ${Math.round(235 + upgrades.speedLevel * 32)} وحدة`,
                    level: upgrades.speedLevel,
                    maxLevel: 8,
                    cost: 8 + upgrades.speedLevel * 6,
                    icon: '👟',
                    color: '#FBBF24'
                },
                {
                    id: 'fireRate',
                    title: 'معدل إطلاق النار 🔥',
                    desc: 'إطلاق رصاص أسرع على الحشرات',
                    level: upgrades.fireRateLevel,
                    maxLevel: 6,
                    cost: 10 + upgrades.fireRateLevel * 8,
                    icon: '⚡',
                    color: '#EF4444'
                },
                {
                    id: 'maxHp',
                    title: 'نقاط الحياة والشفاء ❤️',
                    desc: '+35 نقطة حياة مع استعادة كامل الصحة',
                    level: upgrades.maxHpLevel,
                    maxLevel: 6,
                    cost: 12 + upgrades.maxHpLevel * 8,
                    icon: '💖',
                    color: '#EC4899'
                },
                {
                    id: 'magnet',
                    title: 'مغناطيس الكوينز 🧲',
                    desc: 'جذب الكوينز الذهبية من مسافات أبعد',
                    level: upgrades.magnetLevel,
                    maxLevel: 5,
                    cost: 8 + upgrades.magnetLevel * 6,
                    icon: '🧲',
                    color: '#A855F7'
                }
            ];

            items.forEach(item => {
                const isMax = item.level >= item.maxLevel;
                const canAfford = totalCoins >= item.cost && !isMax;

                const card = document.createElement('div');
                card.style.cssText = `
                    background: #251445;
                    border: 2px solid ${item.color};
                    border-radius: 16px;
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                    direction: rtl;
                `;

                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 26px;">${item.icon}</span>
                        <div>
                            <div style="font-size: 14.5px; font-weight: 900; color: #FFFFFF;">${item.title} (مستوى ${item.level})</div>
                            <div style="font-size: 11px; color: #CBD5E1;">${item.desc}</div>
                        </div>
                    </div>
                    <button class="bh-buy-btn" style="
                        background: ${isMax ? '#475569' : (canAfford ? 'linear-gradient(135deg, #10B981, #059669)' : '#334155')};
                        color: white;
                        border: none;
                        border-radius: 12px;
                        padding: 8px 14px;
                        font-size: 13px;
                        font-weight: 900;
                        cursor: ${canAfford ? 'pointer' : 'default'};
                        opacity: ${canAfford ? '1' : '0.6'};
                        box-shadow: ${canAfford ? '0 3px 10px rgba(16,185,129,0.4)' : 'none'};
                        white-space: nowrap;
                    ">
                        ${isMax ? 'مكتمل ✅' : `${item.cost} 🪙`}
                    </button>
                `;

                if (canAfford) {
                    const btn = card.querySelector('.bh-buy-btn');
                    btn.addEventListener('click', () => {
                        buyUpgrade(item.id, item.cost);
                    });
                }

                shopItems.appendChild(card);
            });
        }

        function buyUpgrade(type, cost) {
            if (totalCoins < cost) return;
            totalCoins -= cost;
            playSound('upgrade');

            if (type === 'weapon') upgrades.weaponLevel++;
            else if (type === 'speed') upgrades.speedLevel++;
            else if (type === 'fireRate') upgrades.fireRateLevel++;
            else if (type === 'maxHp') {
                upgrades.maxHpLevel++;
                player.hp = player.maxHp;
            } else if (type === 'magnet') upgrades.magnetLevel++;

            recalculateStats();
            renderShopItems();
        }

        function openShop() {
            isShopOpen = true;
            renderShopItems();
            shopCoins.textContent = totalCoins;
            shopModal.style.display = 'flex';
        }

        function closeShop() {
            isShopOpen = false;
            shopModal.style.display = 'none';

            if (waveTransition) {
                prepareWave(currentWave + 1);
            }
        }

        openShopBtn.addEventListener('click', openShop);
        closeShopBtn.addEventListener('click', closeShop);
        resumeWaveBtn.addEventListener('click', closeShop);

        // Restart Game
        restartBtn.addEventListener('click', () => {
            gameOverModal.style.display = 'none';
            player.x = 170;
            player.y = 550;
            player.hp = player.maxHp;
            bugs = [];
            bullets = [];
            enemyBullets = [];
            coins = [];
            particles = [];
            floatTexts = [];
            currentWave = 1;
            gameActive = true;
            waveTransition = false;
            recalculateStats();
            prepareWave(1);
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        });

        // Initialize and Start Game
        recalculateStats();
        prepareWave(1);
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);

        // Cleanup on Exit
        function cleanup() {
            gameActive = false;
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            canvasContainer.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            container.removeEventListener('game-exit', cleanup);

            // Restore container original styles
            container.classList.remove('bug-hunter-mode');
            container.style.padding = originalPadding;
            container.style.border = originalBorder;
            container.style.backgroundColor = originalBg;
            container.style.borderRadius = originalRadius;
            container.style.height = originalHeight;
            container.style.minHeight = '';
            container.style.maxHeight = '';
            container.style.maxWidth = originalMaxWidth;
            container.style.margin = originalMargin;
            container.style.boxShadow = originalBoxShadow;
            container.style.display = '';
            container.style.flexDirection = '';
            container.style.overflow = '';

            if (appContainer) {
                appContainer.style.maxWidth = '';
            }
        }
        container.addEventListener('game-exit', cleanup);
    };
})();
