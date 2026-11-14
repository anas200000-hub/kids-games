// Game: Bug Hunter (صائد الحشرات)
// Fast-paced 2.5D Isometric Bug Defense & Upgrade Shooter
(function() {
    window.initBugHunterGame = function(container) {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.add('wide-mode');
        }

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
                    osc.frequency.setValueAtTime(850, now);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
                    osc.start(now);
                    osc.stop(now + 0.1);
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
                    osc.frequency.setValueAtTime(190, now);
                    osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
                    gain.gain.setValueAtTime(0.25, now);
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
                    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
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
                    osc.frequency.setValueAtTime(160, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                    osc.start(now);
                    osc.stop(now + 0.19);
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

        // HTML Layout matching the exact screenshot (dark top bar, 2.5D arena canvas, controls, shop modal)
        const html = `
            <div class="bug-hunter-wrapper" style="width: 100%; max-width: 520px; margin: 0 auto; user-select: none; -webkit-user-select: none; font-family: var(--font-kids), 'Tajawal', sans-serif; direction: ltr; position: relative; overflow: hidden; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); background: #0F0A1C;">
                
                <!-- TOP HEADER HUD (Exact match to screenshot) -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 50px; background: #090514; padding: 0 16px; box-sizing: border-box; border-bottom: 2px solid #23163E; z-index: 10;">
                    <!-- Health on Left -->
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

                <!-- MAIN 2.5D CANVAS CONTAINER -->
                <div id="bhCanvasContainer" style="position: relative; width: 100%; aspect-ratio: 9/15; background: #180D30; overflow: hidden; touch-action: none;">
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

                    <!-- Virtual Joystick Area (Touch devices) -->
                    <div id="bhJoystickContainer" style="position: absolute; bottom: 30px; left: 30px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.2); pointer-events: none; display: none; z-index: 12;">
                        <div id="bhJoystickThumb" style="position: absolute; top: 35px; left: 35px; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, #FBBF24, #D97706); box-shadow: 0 2px 10px rgba(0,0,0,0.5);"></div>
                    </div>
                </div>

                <!-- CONTROLS HINT BANNER -->
                <div style="background: #090514; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; color: #94A3B8; font-size: 11.5px; font-weight: bold; border-top: 1.5px solid #23163E;">
                    <div>🎮 تحكم بالأسهم / WASD أو اللمس والسحب</div>
                    <div style="color: #FCD34D;">⚡ إطلاق النار تلقائي على أقرب حشرة</div>
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

        // Arena Dimensions (Virtual Arena Space 500 x 800)
        const ARENA_W = 500;
        const ARENA_H = 800;
        const WALL_THICKNESS = 24;

        // Obstacles (Exact match to screenshot: pink rectangular blocks / tables)
        const OBSTACLES = [
            { x: 50,  y: 280, w: 135, h: 56 }, // Left top table
            { x: 310, y: 390, w: 145, h: 56 }, // Right mid table
            { x: 400, y: 190, w: 75,  h: 70 }, // Right top block
            { x: 0,   y: 520, w: 50,  h: 80 }, // Left edge block
            { x: 180, y: 630, w: 135, h: 52 }  // Bottom mid table
        ];

        // Weapon Tiers
        const WEAPON_TIERS = [
            { name: 'مسدس فردي', bullets: 1, damage: 25, speed: 650, spread: 0, color: '#FFFFFF', radius: 4 },
            { name: 'مسدس مزدوج', bullets: 2, damage: 32, speed: 700, spread: 14, color: '#38BDF8', radius: 4.5 },
            { name: 'إطلاق ثلاثي متفرق', bullets: 3, damage: 40, speed: 750, spread: 0.22, color: '#A855F7', radius: 5 },
            { name: 'بندقية البلازما المتفجرة', bullets: 3, damage: 60, speed: 820, spread: 0.18, explosive: true, color: '#F43F5E', radius: 6.5 },
            { name: 'مدفع الهايبر نوفا الفتاك', bullets: 5, damage: 85, speed: 900, spread: 0.35, explosive: true, color: '#FBBF24', radius: 7 }
        ];

        // Upgrades State
        let upgrades = {
            weaponLevel: 1,
            speedLevel: 1,
            fireRateLevel: 1,
            maxHpLevel: 1,
            magnetLevel: 1
        };

        // Player State
        let player = {
            x: ARENA_W / 2 - 30,
            y: ARENA_H - 180,
            radius: 18,
            vx: 0,
            vy: 0,
            angle: -Math.PI / 2,
            hp: 100,
            maxHp: 100,
            speed: 210,
            fireCooldown: 0,
            fireRate: 3.0, // Shots per second
            magnetRadius: 75,
            walkCycle: 0
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

        // Input Management
        const keys = {};
        let touchActive = false;
        let touchOrigin = { x: 0, y: 0 };
        let touchCurrent = { x: 0, y: 0 };
        let joystickVector = { x: 0, y: 0 };

        // Handle Canvas Sizing
        function resizeCanvas() {
            const rect = canvasContainer.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.resetTransform();
            ctx.scale(canvas.width / ARENA_W, canvas.height / ARENA_H);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Keyboard Controls
        window.addEventListener('keydown', e => {
            keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
        });

        // Touch & Virtual Joystick Controls
        function onTouchStart(e) {
            if (isShopOpen || !gameActive) return;
            const touch = e.touches[0];
            const rect = canvasContainer.getBoundingClientRect();
            const clientX = touch.clientX - rect.left;
            const clientY = touch.clientY - rect.top;

            touchActive = true;
            touchOrigin = { x: clientX, y: clientY };
            touchCurrent = { x: clientX, y: clientY };
            joystickVector = { x: 0, y: 0 };

            joystickContainer.style.display = 'block';
            joystickContainer.style.left = `${clientX - 55}px`;
            joystickContainer.style.top = `${clientY - 55}px`;
            joystickThumb.style.transform = `translate(0px, 0px)`;
        }

        function onTouchMove(e) {
            if (!touchActive) return;
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvasContainer.getBoundingClientRect();
            const clientX = touch.clientX - rect.left;
            const clientY = touch.clientY - rect.top;

            touchCurrent = { x: clientX, y: clientY };
            const dx = touchCurrent.x - touchOrigin.x;
            const dy = touchCurrent.y - touchOrigin.y;
            const dist = Math.hypot(dx, dy);
            const maxRadius = 45;

            if (dist > 0) {
                const clampedDist = Math.min(dist, maxRadius);
                joystickVector.x = (dx / dist) * (clampedDist / maxRadius);
                joystickVector.y = (dy / dist) * (clampedDist / maxRadius);
                joystickThumb.style.transform = `translate(${joystickVector.x * maxRadius}px, ${joystickVector.y * maxRadius}px)`;
            }
        }

        function onTouchEnd() {
            touchActive = false;
            joystickVector = { x: 0, y: 0 };
            joystickContainer.style.display = 'none';
        }

        canvasContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: false });
        window.addEventListener('touchcancel', onTouchEnd, { passive: false });

        // Update Upgrades & Player Stats
        function recalculateStats() {
            // Player Speed: 210 -> +25 per level
            player.speed = 210 + (upgrades.speedLevel - 1) * 28;
            // Fire Rate: 3.0 -> +0.7 per level
            player.fireRate = 3.0 + (upgrades.fireRateLevel - 1) * 0.75;
            // Max HP: 100 -> +30 per level
            const oldMax = player.maxHp;
            player.maxHp = 100 + (upgrades.maxHpLevel - 1) * 35;
            if (player.maxHp > oldMax) {
                player.hp = Math.min(player.maxHp, player.hp + (player.maxHp - oldMax));
            }
            // Magnet: 75 -> +35 per level
            player.magnetRadius = 75 + (upgrades.magnetLevel - 1) * 45;

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
                    radius: 2 + Math.random() * 3.5,
                    color,
                    alpha: 1,
                    life: 0.35 + Math.random() * 0.25
                });
            }
        }

        function spawnFloatingText(x, y, text, color = '#FCD34D') {
            floatTexts.push({
                x, y,
                text,
                color,
                alpha: 1,
                vy: -35,
                life: 0.65
            });
        }

        // Drop Gold Coin
        function spawnCoin(x, y, val = 1) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 50;
            coins.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                val,
                bounce: 1,
                radius: 10,
                rotation: Math.random() * Math.PI,
                life: 18.0
            });
        }

        // Waves Generator
        function prepareWave(wave) {
            bugsToSpawn = [];
            currentWave = wave;
            updateHUD();

            // Calculate wave composition
            const baseCount = 8 + wave * 4;
            const hasBoss = (wave % 5 === 0);

            // Bug Distribution
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

            // Shuffle spawn queue
            bugsToSpawn.sort(() => Math.random() - 0.5);

            waveSpawnTimer = 0.5;
            waveActive = true;
            waveTransition = false;

            // Show Wave Banner
            waveBannerTitle.textContent = hasBoss ? `🚨 زعيم الموجة ${wave}!` : `🔥 الموجة ${wave}`;
            waveBannerSub.textContent = hasBoss ? 'حشرة آلية عملاقة تقترب! احذر من ضرباتها!' : `اقضِ على ${bugsToSpawn.length} حشرة واجمع الكوينز!`;
            waveBanner.style.display = 'block';
            setTimeout(() => {
                waveBanner.style.display = 'none';
            }, 1800);
        }

        function spawnBug(type) {
            // Spawn location around perimeter walls
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
                    y: 70,
                    radius: 36,
                    hp: 550 + currentWave * 180,
                    maxHp: 550 + currentWave * 180,
                    speed: 68 + currentWave * 2,
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
                    speed: 65 + currentWave * 3,
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
                    speed: 85 + currentWave * 3,
                    damage: 12,
                    attackTimer: 1.5 + Math.random() * 1.5,
                    color: '#10B981',
                    accentColor: '#34D399',
                    coinReward: 2,
                    walkCycle: 0
                });
            } else {
                // Regular Spider / Beetle
                bugs.push({
                    type: 'spider',
                    x, y,
                    radius: 16,
                    hp: 35 + currentWave * 10,
                    maxHp: 35 + currentWave * 10,
                    speed: 105 + currentWave * 5,
                    damage: 10,
                    attackTimer: 0,
                    color: '#9333EA',
                    accentColor: '#FDE047',
                    coinReward: 1,
                    walkCycle: 0
                });
            }
        }

        // Collision Helper for Box / Circle
        function checkCircleBoxCollision(cx, cy, cr, box) {
            const nearestX = Math.max(box.x, Math.min(cx, box.x + box.w));
            const nearestY = Math.max(box.y, Math.min(cy, box.y + box.h));
            const dx = cx - nearestX;
            const dy = cy - nearestY;
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
            return { collided: false };
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

            // Gun Recoil muzzle flash particles
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
                    // Fire 8-directional projectile ring
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

            // --- 1. Player Input & Movement ---
            let moveX = 0;
            let moveY = 0;

            if (keys['w'] || keys['arrowup']) moveY -= 1;
            if (keys['s'] || keys['arrowdown']) moveY += 1;
            if (keys['a'] || keys['arrowleft']) moveX -= 1;
            if (keys['d'] || keys['arrowright']) moveX += 1;

            if (touchActive && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
                moveX = joystickVector.x;
                moveY = joystickVector.y;
            }

            const len = Math.hypot(moveX, moveY);
            if (len > 0) {
                const normX = moveX / Math.max(1, len);
                const normY = moveY / Math.max(1, len);
                player.x += normX * player.speed * dt;
                player.y += normY * player.speed * dt;
                player.angle = Math.atan2(normY, normX);
                player.walkCycle += dt * 14;
            }

            // Boundary collision
            player.x = Math.max(WALL_THICKNESS + player.radius, Math.min(ARENA_W - WALL_THICKNESS - player.radius, player.x));
            player.y = Math.max(WALL_THICKNESS + player.radius, Math.min(ARENA_H - WALL_THICKNESS - player.radius, player.y));

            // Obstacle collision for player
            OBSTACLES.forEach(box => {
                const col = checkCircleBoxCollision(player.x, player.y, player.radius, box);
                if (col.collided) {
                    player.x += col.resolveX;
                    player.y += col.resolveY;
                }
            });

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
                    const dist = Math.hypot(bug.x - b.x, bug.y - b.y);
                    if (dist < bug.radius + b.radius) {
                        hitBug = true;
                        bug.hp -= b.damage;
                        playSound('hit');
                        spawnParticles(b.x, b.y, b.color, 4, 110);
                        spawnFloatingText(bug.x, bug.y - 12, `-${b.damage}`, '#FFFFFF');

                        // Explosive splash damage
                        if (b.explosive) {
                            playSound('plasma');
                            spawnParticles(b.x, b.y, '#F43F5E', 12, 180);
                            bugs.forEach(otherBug => {
                                if (otherBug !== bug) {
                                    const d2 = Math.hypot(otherBug.x - b.x, otherBug.y - b.y);
                                    if (d2 < 70) {
                                        otherBug.hp -= b.damage * 0.6;
                                        spawnFloatingText(otherBug.x, otherBug.y - 10, `-${Math.round(b.damage * 0.6)}`, '#F43F5E');
                                    }
                                }
                            });
                        }

                        // Bug Death
                        if (bug.hp <= 0) {
                            playSound('bug_death');
                            totalKills++;
                            spawnParticles(bug.x, bug.y, bug.color, 16, 170);
                            for (let c = 0; c < bug.coinReward; c++) {
                                spawnCoin(bug.x, bug.y, 1);
                            }
                            bugs.splice(j, 1);
                        }
                        break;
                    }
                }

                if (hitBug || b.life <= 0) {
                    bullets.splice(i, 1);
                }
            }

            // --- 4. Update Enemy Bullets ---
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const eb = enemyBullets[i];
                eb.x += eb.vx * dt;
                eb.y += eb.vy * dt;
                eb.life -= dt;

                // Player collision
                const pDist = Math.hypot(player.x - eb.x, player.y - eb.y);
                if (pDist < player.radius + eb.radius) {
                    player.hp = Math.max(0, player.hp - eb.damage);
                    playSound('player_hurt');
                    spawnParticles(player.x, player.y, '#EF4444', 8, 140);
                    spawnFloatingText(player.x, player.y - 15, `-${eb.damage}`, '#EF4444');
                    updateHUD();
                    enemyBullets.splice(i, 1);

                    if (player.hp <= 0) {
                        handleGameOver();
                        return;
                    }
                    continue;
                }

                if (eb.life <= 0 || eb.x < WALL_THICKNESS || eb.x > ARENA_W - WALL_THICKNESS || eb.y < WALL_THICKNESS || eb.y > ARENA_H - WALL_THICKNESS) {
                    enemyBullets.splice(i, 1);
                }
            }

            // --- 5. Update Bugs (Movement & Attacks) ---
            bugs.forEach(bug => {
                bug.walkCycle += dt * 10;
                const angleToPlayer = Math.atan2(player.y - bug.y, player.x - bug.x);
                const distToPlayer = Math.hypot(player.x - bug.x, player.y - bug.y);

                // Spitter stays at distance, others charge
                if (bug.type === 'spitter' && distToPlayer < 200) {
                    // Back away slightly
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

                // Bug attack logic
                if (bug.type === 'spitter' || bug.type === 'boss') {
                    enemyAttack(bug, dt);
                }

                // Melee contact with player
                if (distToPlayer < bug.radius + player.radius) {
                    player.hp = Math.max(0, player.hp - bug.damage * dt * 1.5);
                    updateHUD();
                    if (Math.random() < 0.12) {
                        playSound('player_hurt');
                        spawnParticles(player.x, player.y, '#EF4444', 3, 90);
                    }
                    if (player.hp <= 0) {
                        handleGameOver();
                        return;
                    }
                }
            });

            // --- 6. Update Coins (Physics & Magnet) ---
            for (let i = coins.length - 1; i >= 0; i--) {
                const c = coins[i];
                c.rotation += dt * 5;
                c.x += c.vx * dt;
                c.y += c.vy * dt;
                c.vx *= 0.92;
                c.vy *= 0.92;
                c.life -= dt;

                // Magnet effect towards player
                const dist = Math.hypot(player.x - c.x, player.y - c.y);
                if (dist < player.magnetRadius) {
                    const pullSpeed = 450 + (1 - dist / player.magnetRadius) * 350;
                    const angle = Math.atan2(player.y - c.y, player.x - c.x);
                    c.x += Math.cos(angle) * pullSpeed * dt;
                    c.y += Math.sin(angle) * pullSpeed * dt;
                }

                // Coin collected
                if (dist < player.radius + c.radius) {
                    totalCoins += c.val;
                    playSound('coin');
                    spawnParticles(c.x, c.y, '#FCD34D', 5, 90);
                    spawnFloatingText(player.x, player.y - 12, `+${c.val} 🪙`, '#FCD34D');
                    updateHUD();
                    coins.splice(i, 1);
                    continue;
                }

                if (c.life <= 0) {
                    coins.splice(i, 1);
                }
            }

            // --- 7. Spawn Wave Queue ---
            if (waveActive && bugsToSpawn.length > 0) {
                waveSpawnTimer -= dt;
                if (waveSpawnTimer <= 0) {
                    spawnBug(bugsToSpawn.pop());
                    waveSpawnTimer = 0.45 + Math.random() * 0.4;
                }
            }

            // --- 8. Check Wave Clear ---
            if (waveActive && bugsToSpawn.length === 0 && bugs.length === 0 && !waveTransition) {
                waveTransition = true;
                playSound('wave_clear');
                const waveBonus = 10 + currentWave * 4;
                totalCoins += waveBonus;
                spawnFloatingText(ARENA_W / 2, ARENA_H / 2, `🎉 اكتملت الموجة! +${waveBonus} 🪙`, '#A855F7');
                updateHUD();

                setTimeout(() => {
                    openShop();
                }, 900);
            }

            // --- 9. Update Particles & Float Texts ---
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.alpha -= dt / p.life;
                if (p.alpha <= 0) particles.splice(i, 1);
            }

            for (let i = floatTexts.length - 1; i >= 0; i--) {
                const ft = floatTexts[i];
                ft.y += ft.vy * dt;
                ft.alpha -= dt / ft.life;
                if (ft.alpha <= 0) floatTexts.splice(i, 1);
            }
        }

        // Render Functions (Exact visual match to screenshot: Checkered purple floor, 3D pink tables, cyber bugs)
        function drawArena() {
            // Background / Floor Checkered Pattern
            const tileSize = 42;
            const cols = Math.ceil(ARENA_W / tileSize);
            const rows = Math.ceil(ARENA_H / tileSize);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const isEven = (r + c) % 2 === 0;
                    ctx.fillStyle = isEven ? '#2C1B4D' : '#35215A';
                    ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                }
            }

            // Perimeter 3D Walls
            ctx.fillStyle = '#1A0E32';
            ctx.fillRect(0, 0, ARENA_W, WALL_THICKNESS); // Top
            ctx.fillRect(0, ARENA_H - WALL_THICKNESS, ARENA_W, WALL_THICKNESS); // Bottom
            ctx.fillRect(0, 0, WALL_THICKNESS, ARENA_H); // Left
            ctx.fillRect(ARENA_W - WALL_THICKNESS, 0, WALL_THICKNESS, ARENA_H); // Right

            // Wall Bevel Lines
            ctx.strokeStyle = '#4A2A7E';
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

                // Top 3D Face (Bright Cute Pink matching screenshot)
                ctx.fillStyle = '#F472B6';
                ctx.beginPath();
                ctx.roundRect(box.x, box.y, box.w, box.h, 8);
                ctx.fill();

                // Top Face Highlight Border
                ctx.strokeStyle = '#FBCFE8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
            });
        }

        // Draw Player (Cute hero matching screenshot: Yellow helmet, teal suit, blaster gun)
        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x, player.y);

            // Floor Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 16, player.radius * 1.1, player.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rotate towards aim direction
            ctx.rotate(player.angle);

            // Backpack / Oxygen Tank
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.roundRect(-22, -9, 10, 18, 4);
            ctx.fill();

            // Teal Suit Body
            ctx.fillStyle = '#06B6D4';
            ctx.beginPath();
            ctx.roundRect(-12, -14, 20, 28, 9);
            ctx.fill();

            // Yellow Round Helmet / Head
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();

            // Dark Visor / Eyes
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect(4, -6, 7, 12, 3);
            ctx.fill();

            // Blaster Weapon
            const tier = WEAPON_TIERS[upgrades.weaponLevel - 1];
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(10, 6, 16, 5);
            ctx.fillStyle = tier.color;
            ctx.fillRect(18, 5, 8, 7);

            ctx.restore();
        }

        // Draw Bug (Purple spider / crawler / mech tank)
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

            // 6-8 Spider Legs
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
                // Square Mech Armor (as in screenshot!)
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

            // Rotating Oval 3D Illusion
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
            ctx.clearRect(0, 0, ARENA_W, ARENA_H);

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
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // Draw Floating Text
            ctx.font = 'bold 13px Tajawal, sans-serif';
            ctx.textAlign = 'center';
            floatTexts.forEach(ft => {
                ctx.fillStyle = ft.color;
                ctx.globalAlpha = Math.max(0, ft.alpha);
                ctx.fillText(ft.text, ft.x, ft.y);
            });
            ctx.globalAlpha = 1.0;
        }

        // Animation Loop
        function gameLoop(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.08);
            lastTime = now;

            update(dt);
            render();

            if (gameActive) {
                animId = requestAnimationFrame(gameLoop);
            }
        }

        // Game Over Handler
        function handleGameOver() {
            gameActive = false;
            playSound('player_hurt');
            goWaveEl.textContent = currentWave;
            goKillsEl.textContent = totalKills;
            goCoinsEl.textContent = totalCoins;
            gameOverModal.style.display = 'flex';
        }

        // Upgrade Shop UI & Purchasing
        function renderShopItems() {
            shopItems.innerHTML = '';

            const items = [
                {
                    id: 'weapon',
                    title: '🔫 سلاح البلازما (Weapon Tier)',
                    curr: upgrades.weaponLevel,
                    max: WEAPON_TIERS.length,
                    desc: WEAPON_TIERS[upgrades.weaponLevel - 1].name,
                    nextDesc: upgrades.weaponLevel < WEAPON_TIERS.length ? `التالي: ${WEAPON_TIERS[upgrades.weaponLevel].name}` : 'الحد الأقصى (MAX)!',
                    cost: upgrades.weaponLevel < WEAPON_TIERS.length ? (upgrades.weaponLevel * 25 + 15) : null
                },
                {
                    id: 'speed',
                    title: '⚡ سرعة حركة البطل (Hero Speed)',
                    curr: upgrades.speedLevel,
                    max: 6,
                    desc: `السرعة: ${Math.round(player.speed)} px/s`,
                    nextDesc: upgrades.speedLevel < 6 ? `زيادة سرعة الحركة (+15%)` : 'الحد الأقصى (MAX)!',
                    cost: upgrades.speedLevel < 6 ? (upgrades.speedLevel * 15 + 10) : null
                },
                {
                    id: 'fireRate',
                    title: '⏱️ سرعة إطلاق النار (Fire Rate)',
                    curr: upgrades.fireRateLevel,
                    max: 6,
                    desc: `المعدل: ${player.fireRate.toFixed(1)} طلقة/ثانية`,
                    nextDesc: upgrades.fireRateLevel < 6 ? `زيادة سرعة الرمي (+25%)` : 'الحد الأقصى (MAX)!',
                    cost: upgrades.fireRateLevel < 6 ? (upgrades.fireRateLevel * 18 + 12) : null
                },
                {
                    id: 'maxHp',
                    title: '💖 الصحة والدروع (Health & Heal)',
                    curr: upgrades.maxHpLevel,
                    max: 6,
                    desc: `الصحة القصوى: ${player.maxHp} HP`,
                    nextDesc: upgrades.maxHpLevel < 6 ? `زيادة الصحة (+35 HP) وشفاء كامل` : 'الحد الأقصى (MAX)!',
                    cost: upgrades.maxHpLevel < 6 ? (upgrades.maxHpLevel * 14 + 10) : null
                },
                {
                    id: 'magnet',
                    title: '🧲 مغناطيس الكوينز (Coin Magnet)',
                    curr: upgrades.magnetLevel,
                    max: 5,
                    desc: `مدى الجذب: ${player.magnetRadius}px`,
                    nextDesc: upgrades.magnetLevel < 5 ? `جذب الكوينز من مسافات أبعد (+45px)` : 'الحد الأقصى (MAX)!',
                    cost: upgrades.magnetLevel < 5 ? (upgrades.magnetLevel * 12 + 8) : null
                }
            ];

            items.forEach(item => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: #23143F;
                    border: 1.5px solid #3B206E;
                    border-radius: 16px;
                    padding: 10px 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-sizing: border-box;
                    direction: rtl;
                `;

                const canAfford = item.cost !== null && totalCoins >= item.cost;
                const isMax = item.cost === null;

                card.innerHTML = `
                    <div style="flex: 1; text-align: right;">
                        <div style="font-size: 13.5px; font-weight: 900; color: #F3E8FF; margin-bottom: 2px;">
                            ${item.title} <span style="font-size: 11px; color: #C084FC;">(${item.curr}/${item.max})</span>
                        </div>
                        <div style="font-size: 11.5px; color: #94A3B8;">
                            ${item.desc} • <span style="color: #38BDF8;">${item.nextDesc}</span>
                        </div>
                    </div>

                    <div style="margin-right: 10px;">
                        <button class="bh-buy-btn" data-id="${item.id}" style="
                            background: ${isMax ? '#4B5563' : (canAfford ? 'linear-gradient(135deg, #10B981, #059669)' : '#374151')};
                            color: white;
                            border: none;
                            border-radius: 12px;
                            padding: 6px 12px;
                            font-size: 12px;
                            font-weight: 900;
                            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            box-shadow: ${canAfford ? '0 2px 8px rgba(16,185,129,0.4)' : 'none'};
                        ">
                            ${isMax ? 'مكتمل ✅' : `<span>${item.cost}</span> 🪙`}
                        </button>
                    </div>
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
                player.hp = player.maxHp; // Full heal on health upgrade!
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

            // If wave was cleared, start next wave
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
            player.x = ARENA_W / 2 - 30;
            player.y = ARENA_H - 180;
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
            if (animId) cancelAnimationFrame(animId);
            window.removeEventListener('resize', resizeCanvas);
            canvasContainer.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            container.removeEventListener('game-exit', cleanup);
        }
        container.addEventListener('game-exit', cleanup);
    };
})();
