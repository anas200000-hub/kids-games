// Game: Walkers Attack (هجوم الموتى السائرين)
// Inspired by YouTube Playables "Walkers Attack" by Homie Bear Studio & Voodoo
(function() {
    window.initWalkersAttackGame = function(container) {
        // Enforce wide-mode for optimal combat view
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.add('wide-mode');
        }

        let canvas, ctx;
        let animationFrameId = null;
        let gameActive = true;
        let isPaused = false;

        // Polyfill for roundRect
        if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                if (typeof r === 'undefined') r = 0;
                if (typeof r === 'number') r = {tl: r, tr: r, br: r, bl: r};
                else {
                    var def = {tl: 0, tr: 0, br: 0, bl: 0};
                    for (var s in def) r[s] = r[s] || def[s];
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

        // Web Audio Synthesizer
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
                if (type === 'shoot_pistol') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(650, now);
                    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.09);
                } else if (type === 'shoot_shotgun') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.16);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
                    osc.start(now);
                    osc.stop(now + 0.17);
                } else if (type === 'shoot_rifle') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(520, now);
                    osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                    osc.start(now);
                    osc.stop(now + 0.07);
                } else if (type === 'shoot_rocket') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.linearRampToValueAtTime(450, now + 0.12);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'shoot_laser') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1100, now);
                    osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'explosion') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, now);
                    osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
                    gain.gain.setValueAtTime(0.6, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.45);
                } else if (type === 'zombie_hit') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
                    osc.start(now);
                    osc.stop(now + 0.08);
                } else if (type === 'zombie_die') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(240, now);
                    osc.frequency.linearRampToValueAtTime(80, now + 0.15);
                    gain.gain.setValueAtTime(0.22, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.16);
                } else if (type === 'gem_pickup') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.09);
                } else if (type === 'coin_pickup') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(987.77, now);
                    osc.frequency.setValueAtTime(1318.51, now + 0.05);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.13);
                } else if (type === 'level_up') {
                    const notes = [440, 554.37, 659.25, 880];
                    notes.forEach((freq, idx) => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.connect(g);
                        g.connect(ctx.destination);
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(freq, now + idx * 0.09);
                        g.gain.setValueAtTime(0.3, now + idx * 0.09);
                        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.2);
                        o.start(now + idx * 0.09);
                        o.stop(now + idx * 0.09 + 0.22);
                    });
                } else if (type === 'boss_warning') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.linearRampToValueAtTime(330, now + 0.2);
                    osc.frequency.linearRampToValueAtTime(220, now + 0.4);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                    osc.start(now);
                    osc.stop(now + 0.46);
                } else if (type === 'player_hurt') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.13);
                }
            } catch(e) {}
        }

        // Persistent stats
        let highScore = parseInt(localStorage.getItem('walkers_attack_high_score') || '0');
        let totalCoins = parseInt(localStorage.getItem('walkers_attack_coins') || '0');

        // Map & Arena Setup
        const MAP_WIDTH = 2200;
        const MAP_HEIGHT = 2200;
        let currentTheme = 'urban'; // urban, scifi, ruins, frozen

        // Themes Config
        const THEMES = {
            urban: {
                name: 'المدينة المنكوبة',
                bgColor: '#2b2d42',
                gridColor: '#363954',
                floorColor: '#1f2030',
                border: '#ef233c',
                accent: '#e63946',
                obstacles: ['car', 'barrier', 'cone', 'hydrant']
            },
            scifi: {
                name: 'المختبر السري',
                bgColor: '#0f172a',
                gridColor: '#1e293b',
                floorColor: '#0b1120',
                border: '#06b6d4',
                accent: '#38bdf8',
                obstacles: ['terminal', 'crate_sci', 'capsule']
            },
            ruins: {
                name: 'الأطلال القديمة',
                bgColor: '#28201a',
                gridColor: '#3d3128',
                floorColor: '#1c1612',
                border: '#d97706',
                accent: '#f59e0b',
                obstacles: ['pillar', 'tomb', 'rubble']
            },
            frozen: {
                name: 'الأرض الجليدية',
                bgColor: '#1e293b',
                gridColor: '#334155',
                floorColor: '#0f172a',
                border: '#38bdf8',
                accent: '#e0f2fe',
                obstacles: ['ice_rock', 'snowman', 'crystal']
            }
        };

        // Game State Variables
        let score = 0;
        let killCount = 0;
        let wave = 1;
        let waveTimer = 0;
        let stageProgress = 0;
        let exp = 0;
        let expToNextLevel = 100;
        let playerLevel = 1;
        let coinsCollected = 0;

        // Player Entity
        const player = {
            x: MAP_WIDTH / 2,
            y: MAP_HEIGHT / 2,
            radius: 20,
            angle: 0,
            targetAngle: 0,
            vx: 0,
            vy: 0,
            speed: 4.2,
            hp: 120,
            maxHp: 120,
            invulnerableTime: 0,
            walkCycle: 0,
            isMoving: false,

            // Weapon & Upgrades
            currentWeapon: 'pistol', // pistol, shotgun, rifle, rocket, laser
            damageMultiplier: 1.0,
            fireRateMultiplier: 1.0,
            multishot: 1,
            pickupRadius: 90,

            // Orbiting blades
            orbitBlades: 0, // 0 to 4
            bladeAngle: 0,

            // Support Drone
            hasDrone: false,
            droneAngle: 0,
            droneLastShot: 0,

            // Cooldowns
            lastShotTime: 0,
            frenzyUntil: 0
        };

        // Weapons Config
        const WEAPONS = {
            pistol: {
                name: 'مسدس مزدوج',
                fireInterval: 280, // ms
                damage: 28,
                speed: 12,
                range: 480,
                color: '#facc15',
                size: 4,
                spread: 0.08,
                sound: 'shoot_pistol'
            },
            shotgun: {
                name: 'شوزن ثنائي',
                fireInterval: 650,
                damage: 22, // per pellet
                speed: 13,
                range: 360,
                color: '#fb923c',
                size: 4,
                pellets: 5,
                spread: 0.45,
                sound: 'shoot_shotgun'
            },
            rifle: {
                name: 'رشاش سريع',
                fireInterval: 120,
                damage: 20,
                speed: 15,
                range: 520,
                color: '#38bdf8',
                size: 3.5,
                spread: 0.12,
                sound: 'shoot_rifle'
            },
            rocket: {
                name: 'قاذف صواريخ',
                fireInterval: 950,
                damage: 110,
                speed: 8.5,
                range: 580,
                color: '#ef4444',
                size: 7,
                isExplosive: true,
                explosionRadius: 100,
                sound: 'shoot_rocket'
            },
            laser: {
                name: 'مدفع ليزر',
                fireInterval: 420,
                damage: 48,
                speed: 18,
                range: 600,
                color: '#c084fc',
                size: 5,
                isPiercing: true,
                sound: 'shoot_laser'
            }
        };

        // Game Entities Arrays
        let bullets = [];
        let walkers = [];
        let items = []; // exp gems, coins, medkits, crates, barrels
        let particles = [];
        let floatingTexts = [];
        let obstacles = [];
        let boss = null;
        let screenShake = 0;

        // Controls
        const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
        const joystick = {
            active: false,
            touchId: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            dx: 0,
            dy: 0,
            distance: 0,
            maxRadius: 55
        };

        // Camera
        const camera = {
            x: player.x,
            y: player.y,
            width: 760,
            height: 520
        };

        // HTML Layout Assembly
        const html = `
            <div class="walkers-attack-game-wrapper" style="width: 100%; max-width: 800px; margin: 0 auto; user-select: none; font-family: var(--font-kids); direction: ltr; position: relative; overflow: hidden; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); background: #111827;">
                <!-- Top HUD Bar -->
                <div class="wa-hud" style="position: absolute; top: 0; left: 0; width: 100%; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; z-index: 20; background: linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0) 100%); pointer-events: none; box-sizing: border-box;">
                    <!-- Left: Health & Level -->
                    <div style="display: flex; flex-direction: column; gap: 5px; min-width: 180px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 16px;">❤️</span>
                            <div style="width: 130px; height: 14px; background: rgba(0,0,0,0.6); border-radius: 8px; border: 1.5px solid #ef4444; overflow: hidden; position: relative;">
                                <div id="waHpBar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #ef4444, #f87171); transition: width 0.15s ease;"></div>
                                <span id="waHpText" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 10px; font-weight: bold; color: white; display: flex; align-items: center; justify-content: center; text-shadow: 0 1px 2px black;">120/120</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 14px; color: #38bdf8; font-weight: 900;">LV<span id="waLevel">1</span></span>
                            <div style="width: 130px; height: 10px; background: rgba(0,0,0,0.6); border-radius: 6px; border: 1.5px solid #0284c7; overflow: hidden;">
                                <div id="waExpBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8); transition: width 0.1s ease;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Center: Stage / Theme & Wave -->
                    <div style="text-align: center;">
                        <div id="waThemeName" style="color: #facc15; font-size: 14px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">المدينة المنكوبة (المرحلة 1)</div>
                        <div style="color: #94a3b8; font-size: 11px; font-weight: bold;">الموجة: <span id="waWave" style="color: #ef4444; font-size: 13px;">1</span> | القتلى: <span id="waKills" style="color: #4ade80;">0</span> 💀</div>
                    </div>

                    <!-- Right: Coins, Weapon & Pause -->
                    <div style="display: flex; align-items: center; gap: 10px; pointer-events: auto;">
                        <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 20px; border: 1px solid #eab308;">
                            <span style="font-size: 14px;">🪙</span>
                            <span id="waCoins" style="color: #facc15; font-size: 13px; font-weight: 900;">0</span>
                        </div>
                        <button id="waPauseBtn" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; width: 32px; height: 32px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">⏸️</button>
                    </div>
                </div>

                <!-- Boss HP Bar (Visible during boss fight) -->
                <div id="waBossBarContainer" style="display: none; position: absolute; top: 60px; left: 50%; transform: translateX(-50%); width: 280px; z-index: 20; background: rgba(0,0,0,0.7); padding: 5px 12px; border-radius: 12px; border: 1.5px solid #dc2626; text-align: center;">
                    <div style="color: #f87171; font-weight: 900; font-size: 12px; margin-bottom: 3px;">⚠️ الزعيم العملاق (Goliath Walker) ⚠️</div>
                    <div style="width: 100%; height: 12px; background: #374151; border-radius: 6px; overflow: hidden;">
                        <div id="waBossHpBar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #dc2626, #f87171); transition: width 0.1s ease;"></div>
                    </div>
                </div>

                <!-- Main Canvas -->
                <canvas id="waCanvas" width="760" height="520" style="display: block; width: 100%; height: auto; background: #0f172a; cursor: crosshair;"></canvas>

                <!-- Touch Joystick Area (Active on Touch / Mouse Drag) -->
                <div id="waJoystickContainer" style="position: absolute; bottom: 20px; left: 20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px dashed rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; touch-action: none; z-index: 15;">
                    <div id="waJoystickKnob" style="width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle, #38bdf8 0%, #0284c7 100%); box-shadow: 0 4px 10px rgba(2,132,199,0.5); border: 2px solid #ffffff; transform: translate(0px, 0px); transition: transform 0.05s ease-out; pointer-events: none;"></div>
                </div>

                <!-- Mobile / Desktop Controls Tip -->
                <div style="position: absolute; bottom: 10px; right: 15px; color: rgba(255,255,255,0.45); font-size: 11px; font-weight: bold; pointer-events: none; z-index: 10; direction: rtl;">
                    ⌨️ تحرك بـ WASD أو الأسهم | 🎯 إطلاق تلقائي
                </div>

                <!-- Level Up Choice Modal -->
                <div id="waUpgradeModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.85); z-index: 30; backdrop-filter: blur(6px); align-items: center; justify-content: center; flex-direction: column; padding: 15px; box-sizing: border-box;">
                    <h2 style="color: #facc15; font-size: 26px; font-weight: 900; margin-bottom: 5px; text-shadow: 0 3px 6px rgba(0,0,0,0.6); text-align: center;">🎉 ترقية البطل (LEVEL UP!) 🎉</h2>
                    <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px; text-align: center;">اختر ترقية واحدة لتعزيز قوتك في مواجهة الموتى السائرين:</p>
                    <div id="waUpgradeCards" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 650px;">
                        <!-- Upgrade cards dynamically populated -->
                    </div>
                </div>

                <!-- Game Over Modal -->
                <div id="waGameOverModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.9); z-index: 30; backdrop-filter: blur(8px); align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
                    <div style="background: #1e293b; border: 3px solid #ef4444; border-radius: 24px; padding: 25px; max-width: 340px; width: 90%; text-align: center; box-shadow: 0 10px 25px rgba(239,68,68,0.3);">
                        <div style="font-size: 42px; margin-bottom: 8px;">🧟‍♂️💀</div>
                        <h3 style="color: #ef4444; font-size: 24px; font-weight: 900; margin-bottom: 8px;">سقط البطل في المعركة!</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">لقد صمدت بشجاعة أمام حشود الموتى السائرين!</p>
                        
                        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 18px; text-align: right; direction: rtl;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; color: #cbd5e1;">
                                <span>النتيجة الإجمالية:</span>
                                <span id="waFinalScore" style="color: #facc15; font-weight: 900;">0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; color: #cbd5e1;">
                                <span>عدد القتلى (Kills):</span>
                                <span id="waFinalKills" style="color: #4ade80; font-weight: 900;">0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; color: #cbd5e1;">
                                <span>العملات المجمعة:</span>
                                <span id="waFinalCoins" style="color: #facc15; font-weight: 900;">0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px; margin-top: 6px;">
                                <span>أعلى رقم قياسي:</span>
                                <span id="waFinalHighScore" style="color: #38bdf8; font-weight: 900;">0</span>
                            </div>
                        </div>

                        <button id="waRestartBtn" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px 28px; font-size: 16px; font-weight: 900; border-radius: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(239,68,68,0.4); width: 100%;">إعادة المحاولة 🔄</button>
                    </div>
                </div>

                <!-- Victory Modal -->
                <div id="waVictoryModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.9); z-index: 30; backdrop-filter: blur(8px); align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
                    <div style="background: #1e293b; border: 3px solid #22c55e; border-radius: 24px; padding: 25px; max-width: 340px; width: 90%; text-align: center; box-shadow: 0 10px 25px rgba(34,197,94,0.3);">
                        <div style="font-size: 46px; margin-bottom: 8px;">🏆🎖️</div>
                        <h3 style="color: #22c55e; font-size: 24px; font-weight: 900; margin-bottom: 8px;">انتصار أسطوري!</h3>
                        <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">تم تطهير جميع المناطق وهزيمة كل الزعماء بنجاح!</p>
                        
                        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 18px; text-align: right; direction: rtl;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; color: #cbd5e1;">
                                <span>النتيجة النهائية:</span>
                                <span id="waVictoryScore" style="color: #facc15; font-weight: 900;">0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #cbd5e1;">
                                <span>إجمالي القتلى:</span>
                                <span id="waVictoryKills" style="color: #4ade80; font-weight: 900;">0</span>
                            </div>
                        </div>

                        <button id="waVictoryNextBtn" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 12px 28px; font-size: 16px; font-weight: 900; border-radius: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(34,197,94,0.4); width: 100%;">متابعة القتال ⚔️</button>
                    </div>
                </div>

                <!-- Pause Menu -->
                <div id="waPauseModal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.85); z-index: 30; backdrop-filter: blur(6px); align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
                    <div style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 20px; padding: 25px; max-width: 280px; width: 85%; text-align: center;">
                        <h3 style="color: #38bdf8; font-size: 22px; font-weight: 900; margin-bottom: 16px;">اللعبة متوقفة ⏸️</h3>
                        <button id="waResumeBtn" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-size: 15px; font-weight: 900; border-radius: 12px; cursor: pointer; width: 100%; margin-bottom: 10px;">استئناف اللعب ▶️</button>
                        <button id="waPauseRestartBtn" style="background: #475569; color: white; border: none; padding: 10px 20px; font-size: 15px; font-weight: bold; border-radius: 12px; cursor: pointer; width: 100%;">إعادة البدء 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Element references
        canvas = document.getElementById('waCanvas');
        ctx = canvas.getContext('2d');
        const hpBar = document.getElementById('waHpBar');
        const hpText = document.getElementById('waHpText');
        const expBar = document.getElementById('waExpBar');
        const levelEl = document.getElementById('waLevel');
        const waveEl = document.getElementById('waWave');
        const themeNameEl = document.getElementById('waThemeName');
        const killsEl = document.getElementById('waKills');
        const coinsEl = document.getElementById('waCoins');
        const pauseBtn = document.getElementById('waPauseBtn');
        const bossBarContainer = document.getElementById('waBossBarContainer');
        const bossHpBar = document.getElementById('waBossHpBar');
        const upgradeModal = document.getElementById('waUpgradeModal');
        const upgradeCardsContainer = document.getElementById('waUpgradeCards');
        const gameOverModal = document.getElementById('waGameOverModal');
        const victoryModal = document.getElementById('waVictoryModal');
        const pauseModal = document.getElementById('waPauseModal');
        const restartBtn = document.getElementById('waRestartBtn');
        const resumeBtn = document.getElementById('waResumeBtn');
        const pauseRestartBtn = document.getElementById('waPauseRestartBtn');
        const victoryNextBtn = document.getElementById('waVictoryNextBtn');
        const joystickContainer = document.getElementById('waJoystickContainer');
        const joystickKnob = document.getElementById('waJoystickKnob');

        // Generate Map Obstacles & Barrels
        function initMapObstacles() {
            obstacles = [];
            // Random crates and explosive barrels around the map
            for (let i = 0; i < 35; i++) {
                const ox = 150 + Math.random() * (MAP_WIDTH - 300);
                const oy = 150 + Math.random() * (MAP_HEIGHT - 300);
                // Keep center clear
                if (Math.hypot(ox - MAP_WIDTH / 2, oy - MAP_HEIGHT / 2) < 250) continue;

                const isBarrel = Math.random() < 0.45;
                obstacles.push({
                    x: ox,
                    y: oy,
                    radius: isBarrel ? 18 : 22,
                    type: isBarrel ? 'barrel' : 'crate',
                    hp: isBarrel ? 30 : 50,
                    maxHp: isBarrel ? 30 : 50
                });
            }
        }

        // Initialize Level & Theme
        function setupStage(newWave) {
            wave = newWave;
            waveTimer = 0;
            boss = null;
            bossBarContainer.style.display = 'none';

            // Cycle themes every 3 waves
            if (wave <= 3) currentTheme = 'urban';
            else if (wave <= 6) currentTheme = 'scifi';
            else if (wave <= 9) currentTheme = 'ruins';
            else currentTheme = 'frozen';

            const theme = THEMES[currentTheme];
            themeNameEl.textContent = `${theme.name} (المرحلة ${Math.ceil(wave / 3)})`;
            waveEl.textContent = wave;

            initMapObstacles();
        }

        // Spawn Walkers (Zombies)
        let lastSpawnTime = 0;
        function updateZombieSpawns(now) {
            const spawnInterval = Math.max(350, 1400 - (wave * 90));
            const maxZombies = Math.min(100, 20 + wave * 8);

            // Check if boss should spawn
            if (wave % 3 === 0 && !boss && waveTimer > 15000) {
                spawnBoss();
            }

            if (now - lastSpawnTime > spawnInterval && walkers.length < maxZombies) {
                lastSpawnTime = now;
                spawnWalker();
            }
        }

        function spawnWalker() {
            // Spawn in a perimeter around player outside screen viewport
            const angle = Math.random() * Math.PI * 2;
            const dist = 480 + Math.random() * 200;
            let wx = player.x + Math.cos(angle) * dist;
            let wy = player.y + Math.sin(angle) * dist;

            // Clamp inside map boundaries
            wx = Math.max(60, Math.min(MAP_WIDTH - 60, wx));
            wy = Math.max(60, Math.min(MAP_HEIGHT - 60, wy));

            // Determine walker variant
            const rand = Math.random();
            let type = 'normal';
            let hp = 45 + wave * 14;
            let speed = 1.6 + Math.random() * 0.4;
            let radius = 18;
            let color = '#4ade80';

            if (rand < 0.25 && wave >= 2) {
                // Fast Runner
                type = 'runner';
                hp = 30 + wave * 8;
                speed = 2.8 + Math.random() * 0.5;
                radius = 15;
                color = '#f87171';
            } else if (rand < 0.45 && wave >= 3) {
                // Toxic Spitter
                type = 'spitter';
                hp = 50 + wave * 12;
                speed = 1.3;
                radius = 17;
                color = '#a3e635';
            } else if (rand < 0.60 && wave >= 4) {
                // Brute Tank
                type = 'brute';
                hp = 180 + wave * 40;
                speed = 0.9;
                radius = 28;
                color = '#78716c';
            }

            walkers.push({
                x: wx,
                y: wy,
                radius: radius,
                type: type,
                hp: hp,
                maxHp: hp,
                speed: speed,
                color: color,
                hitFlash: 0,
                walkCycle: Math.random() * Math.PI * 2,
                lastAttack: 0,
                lastSpit: 0
            });
        }

        function spawnBoss() {
            playSound('boss_warning');
            floatingTexts.push({
                x: player.x,
                y: player.y - 80,
                text: '⚠️ الزعيم العملاق قادم! ⚠️',
                color: '#ef4444',
                size: 20,
                life: 90
            });

            const angle = Math.random() * Math.PI * 2;
            const dist = 500;
            const bx = Math.max(100, Math.min(MAP_WIDTH - 100, player.x + Math.cos(angle) * dist));
            const by = Math.max(100, Math.min(MAP_HEIGHT - 100, player.y + Math.sin(angle) * dist));

            const maxHp = 800 + wave * 250;
            boss = {
                x: bx,
                y: by,
                radius: 45,
                hp: maxHp,
                maxHp: maxHp,
                speed: 1.2,
                color: '#dc2626',
                hitFlash: 0,
                walkCycle: 0,
                state: 'chase', // chase, stomp, charge
                stateTimer: 0,
                chargeTarget: null,
                lastAttack: 0
            };

            bossBarContainer.style.display = 'block';
            updateBossBar();
        }

        function updateBossBar() {
            if (!boss) {
                bossBarContainer.style.display = 'none';
                return;
            }
            const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            bossHpBar.style.width = pct + '%';
        }

        // Drop Items on walker death
        function dropLoot(x, y, isBoss = false) {
            // Drop EXP Gem
            items.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y + (Math.random() - 0.5) * 15,
                type: 'gem',
                value: isBoss ? 60 : 15,
                radius: isBoss ? 12 : 7,
                color: isBoss ? '#c084fc' : '#38bdf8'
            });

            // Random Coin Drop
            if (Math.random() < 0.35 || isBoss) {
                const count = isBoss ? 5 : 1;
                for (let i = 0; i < count; i++) {
                    items.push({
                        x: x + (Math.random() - 0.5) * 25,
                        y: y + (Math.random() - 0.5) * 25,
                        type: 'coin',
                        value: 1,
                        radius: 8,
                        color: '#facc15'
                    });
                }
            }

            // Rare Medkit Drop
            if (Math.random() < 0.08 || (isBoss && Math.random() < 0.5)) {
                items.push({
                    x: x,
                    y: y,
                    type: 'medkit',
                    heal: 45,
                    radius: 12,
                    color: '#ef4444'
                });
            }

            // Very Rare Nuke / Magnet / Frenzy Drop
            const powerRand = Math.random();
            if (powerRand < 0.035) {
                items.push({
                    x: x,
                    y: y,
                    type: 'nuke',
                    radius: 14,
                    color: '#f97316'
                });
            } else if (powerRand < 0.07) {
                items.push({
                    x: x,
                    y: y,
                    type: 'magnet',
                    radius: 14,
                    color: '#3b82f6'
                });
            } else if (powerRand < 0.10) {
                items.push({
                    x: x,
                    y: y,
                    type: 'frenzy',
                    radius: 14,
                    color: '#e11d48'
                });
            }
        }

        // Particle System
        function createExplosion(x, y, radius, color = '#f97316') {
            screenShake = Math.max(screenShake, 12);
            playSound('explosion');

            for (let i = 0; i < 28; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 6;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: 3 + Math.random() * 5,
                    color: Math.random() < 0.5 ? '#f97316' : (Math.random() < 0.5 ? '#facc15' : '#ef4444'),
                    life: 25 + Math.random() * 20,
                    maxLife: 45
                });
            }

            // Damage nearby enemies & obstacles
            walkers.forEach(w => {
                const dist = Math.hypot(w.x - x, w.y - y);
                if (dist < radius + w.radius) {
                    const dmg = 120 * (1 - dist / (radius + w.radius));
                    damageWalker(w, dmg, true);
                }
            });

            if (boss) {
                const dist = Math.hypot(boss.x - x, boss.y - y);
                if (dist < radius + boss.radius) {
                    damageBoss(160);
                }
            }

            obstacles.forEach(o => {
                const dist = Math.hypot(o.x - x, o.y - y);
                if (dist < radius + o.radius) {
                    o.hp -= 80;
                }
            });
        }

        function createHitSparks(x, y, color = '#facc15', count = 5) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1.5 + Math.random() * 3.5;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: 2 + Math.random() * 2,
                    color: color,
                    life: 12 + Math.random() * 10,
                    maxLife: 22
                });
            }
        }

        function createShellCasing(x, y, angle) {
            const ejectAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            const spd = 2.5 + Math.random() * 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(ejectAngle) * spd,
                vy: Math.sin(ejectAngle) * spd,
                isShell: true,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.4,
                life: 40,
                maxLife: 40
            });
        }

        // Damage Walkers & Boss
        function damageWalker(w, amount, isExplosive = false) {
            w.hp -= amount;
            w.hitFlash = 4;
            createHitSparks(w.x, w.y, w.color, 4);

            floatingTexts.push({
                x: w.x + (Math.random() - 0.5) * 20,
                y: w.y - 15,
                text: '-' + Math.round(amount),
                color: isExplosive ? '#ef4444' : '#facc15',
                size: isExplosive ? 16 : 12,
                life: 30
            });

            if (w.hp <= 0) {
                killWalker(w);
            } else {
                playSound('zombie_hit');
            }
        }

        function killWalker(w) {
            playSound('zombie_die');
            killCount++;
            killsEl.textContent = killCount;
            score += 25 * wave;

            dropLoot(w.x, w.y, false);

            // Blood/splatter particles
            for (let i = 0; i < 12; i++) {
                const a = Math.random() * Math.PI * 2;
                const spd = 1 + Math.random() * 3;
                particles.push({
                    x: w.x,
                    y: w.y,
                    vx: Math.cos(a) * spd,
                    vy: Math.sin(a) * spd,
                    radius: 2.5 + Math.random() * 3,
                    color: '#15803d',
                    life: 35 + Math.random() * 25,
                    maxLife: 60
                });
            }

            const idx = walkers.indexOf(w);
            if (idx !== -1) walkers.splice(idx, 1);
        }

        function damageBoss(amount) {
            if (!boss) return;
            boss.hp -= amount;
            boss.hitFlash = 5;
            createHitSparks(boss.x, boss.y, '#f87171', 8);
            updateBossBar();

            floatingTexts.push({
                x: boss.x + (Math.random() - 0.5) * 40,
                y: boss.y - 35,
                text: '-' + Math.round(amount),
                color: '#ef4444',
                size: 18,
                life: 35
            });

            if (boss.hp <= 0) {
                // Boss Defeated!
                createExplosion(boss.x, boss.y, 140, '#dc2626');
                dropLoot(boss.x, boss.y, true);
                score += 1000 * wave;
                boss = null;
                bossBarContainer.style.display = 'none';

                floatingTexts.push({
                    x: player.x,
                    y: player.y - 60,
                    text: '🏆 تم سحق الزعيم! 🏆',
                    color: '#22c55e',
                    size: 22,
                    life: 90
                });

                // Next Wave or Victory
                setTimeout(() => {
                    if (wave >= 12) {
                        showVictory();
                    } else {
                        setupStage(wave + 1);
                    }
                }, 2000);
            } else {
                playSound('zombie_hit');
            }
        }

        // Hero Auto-Aim & Shooting Logic (Walkers Attack Core)
        function updatePlayerShooting(now) {
            const weapon = WEAPONS[player.currentWeapon];
            const isFrenzy = now < player.frenzyUntil;
            const fireInterval = isFrenzy ? weapon.fireInterval * 0.5 : weapon.fireInterval / player.fireRateMultiplier;

            // Find closest target
            let target = null;
            let minDist = weapon.range;

            // Check Boss first
            if (boss) {
                const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
                if (dist < minDist) {
                    minDist = dist;
                    target = boss;
                }
            }

            // Check normal walkers
            for (let w of walkers) {
                const dist = Math.hypot(w.x - player.x, w.y - player.y);
                if (dist < minDist) {
                    minDist = dist;
                    target = w;
                }
            }

            if (target) {
                // Smoothly aim at target
                const targetAngle = Math.atan2(target.y - player.y, target.x - player.x);
                let diff = targetAngle - player.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                player.angle += diff * 0.25;

                // Fire weapon when cooldown elapsed
                if (now - player.lastShotTime >= fireInterval) {
                    player.lastShotTime = now;
                    fireWeapon(weapon, targetAngle, isFrenzy);
                }
            } else if (player.isMoving) {
                // Point in direction of movement
                player.angle = Math.atan2(player.vy, player.vx);
            }

            // Support Drone firing
            if (player.hasDrone && now - player.droneLastShot > 450) {
                player.droneLastShot = now;
                fireDrone(target);
            }
        }

        function fireWeapon(weapon, baseAngle, isFrenzy) {
            playSound(weapon.sound);

            // Shell casing & Muzzle flash
            const muzzleX = player.x + Math.cos(player.angle) * 26;
            const muzzleY = player.y + Math.sin(player.angle) * 26;
            createHitSparks(muzzleX, muzzleY, weapon.color, 3);
            createShellCasing(player.x, player.y, player.angle);

            const count = weapon.pellets ? weapon.pellets : player.multishot;
            const damage = weapon.damage * player.damageMultiplier * (isFrenzy ? 1.5 : 1.0);

            for (let i = 0; i < count; i++) {
                const spreadOffset = (i - (count - 1) / 2) * (weapon.spread || 0.12);
                const angle = baseAngle + spreadOffset + (Math.random() - 0.5) * 0.05;

                bullets.push({
                    x: muzzleX,
                    y: muzzleY,
                    vx: Math.cos(angle) * weapon.speed,
                    vy: Math.sin(angle) * weapon.speed,
                    radius: weapon.size,
                    color: weapon.color,
                    damage: damage,
                    range: weapon.range,
                    distTravelled: 0,
                    isExplosive: weapon.isExplosive || false,
                    isPiercing: weapon.isPiercing || false,
                    hitEntities: []
                });
            }
        }

        function fireDrone(target) {
            if (!target) return;
            const droneX = player.x + Math.cos(player.droneAngle) * 35;
            const droneY = player.y + Math.sin(player.droneAngle) * 35;
            const angle = Math.atan2(target.y - droneY, target.x - droneX);

            bullets.push({
                x: droneX,
                y: droneY,
                vx: Math.cos(angle) * 14,
                vy: Math.sin(angle) * 14,
                radius: 3.5,
                color: '#38bdf8',
                damage: 16 * player.damageMultiplier,
                range: 400,
                distTravelled: 0,
                hitEntities: []
            });
            playSound('shoot_rifle');
        }

        // EXP & Level Up System
        function addExp(amount) {
            exp += amount;
            playSound('gem_pickup');

            if (exp >= expToNextLevel) {
                exp -= expToNextLevel;
                expToNextLevel = Math.round(expToNextLevel * 1.35);
                playerLevel++;
                levelEl.textContent = playerLevel;
                playSound('level_up');
                showUpgradeModal();
            }

            const pct = Math.min(100, (exp / expToNextLevel) * 100);
            expBar.style.width = pct + '%';
        }

        // Upgrades Deck
        const ALL_UPGRADES = [
            {
                id: 'multishot',
                name: 'طلقة إضافية 🎯',
                desc: 'إطلاق رصاصة إضافية في كل دفعة نيران!',
                icon: '💥',
                apply: () => { player.multishot += 1; }
            },
            {
                id: 'damage',
                name: 'زيادة قوة الرصاص 🗡️',
                desc: 'زيادة ضرر جميع الأسلحة بنسبة 25%',
                icon: '⚡',
                apply: () => { player.damageMultiplier += 0.25; }
            },
            {
                id: 'firerate',
                name: 'سرعة إطلاق النار ⚡',
                desc: 'معدل إطلاق نار أسرع بنسبة 20%',
                icon: '🔥',
                apply: () => { player.fireRateMultiplier += 0.20; }
            },
            {
                id: 'speed',
                name: 'سرعة الحركة 🏃',
                desc: 'زيادة سرعة الجري لتفادي هجمات الزومبي',
                icon: '👟',
                apply: () => { player.speed += 0.6; }
            },
            {
                id: 'heal',
                name: 'زيادة الصحة والشفاء 💖',
                desc: 'زيادة الحد الأقصى للصحة +30 واستعادة كامل الصحة',
                icon: '❤️',
                apply: () => {
                    player.maxHp += 30;
                    player.hp = player.maxHp;
                    updateHpUI();
                }
            },
            {
                id: 'drone',
                name: 'درون حربي مرافق 🛸',
                desc: 'درون آلي يحوم حولك ويقنص الموتى السائرين',
                icon: '🛰️',
                apply: () => { player.hasDrone = true; }
            },
            {
                id: 'blade',
                name: 'شفرة الحماية الدوارة 🌪️',
                desc: 'شفرات طاقة تدور حولك وتمزق كل من يقترب',
                icon: '🌀',
                apply: () => { player.orbitBlades = Math.min(4, player.orbitBlades + 1); }
            },
            {
                id: 'shotgun',
                name: 'سلاح الشوزن 💥',
                desc: 'استبدل سلاحك بشوزن قوي يطلق 5 كرات نارية',
                icon: '🔫',
                apply: () => { player.currentWeapon = 'shotgun'; }
            },
            {
                id: 'rifle',
                name: 'البندقية الآلية 🔫',
                desc: 'سلاح رشاش آلي خارق بسرعة إطلاق فائقة',
                icon: '🎯',
                apply: () => { player.currentWeapon = 'rifle'; }
            },
            {
                id: 'rocket',
                name: 'قاذف الصواريخ 🚀',
                desc: 'صواريخ حارقة تحدث انفجارات هائلة في الحشود',
                icon: '💣',
                apply: () => { player.currentWeapon = 'rocket'; }
            },
            {
                id: 'laser',
                name: 'مدفع الليزر الخارق ⚡',
                desc: 'أشعة طاقة تخترق صفوف الأعداء دفعة واحدة',
                icon: '✨',
                apply: () => { player.currentWeapon = 'laser'; }
            },
            {
                id: 'magnet_upgrade',
                name: 'مغناطيس جمع الموارد 🧲',
                desc: 'مضاعفة مدى التقاط البلورات والعملات',
                icon: '🧲',
                apply: () => { player.pickupRadius += 50; }
            }
        ];

        function showUpgradeModal() {
            isPaused = true;
            upgradeCardsContainer.innerHTML = '';

            // Pick 3 random distinct upgrades
            const pool = [...ALL_UPGRADES];
            const choices = [];
            for (let i = 0; i < 3 && pool.length > 0; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                choices.push(pool.splice(idx, 1)[0]);
            }

            choices.forEach(c => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 2px solid #38bdf8;
                    border-radius: 16px;
                    padding: 16px;
                    width: 170px;
                    cursor: pointer;
                    text-align: center;
                    transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                `;
                card.innerHTML = `
                    <div style="font-size: 34px; margin-bottom: 8px;">${c.icon}</div>
                    <div style="color: #facc15; font-size: 14px; font-weight: 900; margin-bottom: 6px;">${c.name}</div>
                    <div style="color: #94a3b8; font-size: 11px; line-height: 1.4;">${c.desc}</div>
                `;

                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-4px)';
                    card.style.borderColor = '#facc15';
                    card.style.boxShadow = '0 8px 20px rgba(250,204,21,0.3)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.borderColor = '#38bdf8';
                    card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
                });

                card.addEventListener('click', () => {
                    playSound('coin_pickup');
                    c.apply();
                    upgradeModal.style.display = 'none';
                    isPaused = false;
                });

                upgradeCardsContainer.appendChild(card);
            });

            upgradeModal.style.display = 'flex';
        }

        function updateHpUI() {
            const pct = Math.max(0, (player.hp / player.maxHp) * 100);
            hpBar.style.width = pct + '%';
            hpText.textContent = `${Math.round(player.hp)}/${player.maxHp}`;
        }

        // Player Hurt
        function damagePlayer(amount) {
            if (player.invulnerableTime > 0 || !gameActive) return;

            player.hp -= amount;
            player.invulnerableTime = 25; // frames of iframe
            screenShake = Math.max(screenShake, 8);
            playSound('player_hurt');
            updateHpUI();

            createHitSparks(player.x, player.y, '#ef4444', 6);

            floatingTexts.push({
                x: player.x,
                y: player.y - 20,
                text: '-' + Math.round(amount),
                color: '#ef4444',
                size: 16,
                life: 30
            });

            if (player.hp <= 0) {
                gameOver();
            }
        }

        function gameOver() {
            gameActive = false;
            playSound('player_hurt');

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('walkers_attack_high_score', highScore);
            }
            totalCoins += coinsCollected;
            localStorage.setItem('walkers_attack_coins', totalCoins);

            document.getElementById('waFinalScore').textContent = score;
            document.getElementById('waFinalKills').textContent = killCount;
            document.getElementById('waFinalCoins').textContent = coinsCollected;
            document.getElementById('waFinalHighScore').textContent = highScore;

            gameOverModal.style.display = 'flex';
        }

        function showVictory() {
            gameActive = false;
            playSound('level_up');

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('walkers_attack_high_score', highScore);
            }
            totalCoins += coinsCollected;
            localStorage.setItem('walkers_attack_coins', totalCoins);

            document.getElementById('waVictoryScore').textContent = score;
            document.getElementById('waVictoryKills').textContent = killCount;
            victoryModal.style.display = 'flex';
        }

        // Reset Game
        function resetGame() {
            gameActive = true;
            isPaused = false;
            score = 0;
            killCount = 0;
            wave = 1;
            waveTimer = 0;
            exp = 0;
            expToNextLevel = 100;
            playerLevel = 1;
            coinsCollected = 0;

            player.x = MAP_WIDTH / 2;
            player.y = MAP_HEIGHT / 2;
            player.hp = 120;
            player.maxHp = 120;
            player.speed = 4.2;
            player.damageMultiplier = 1.0;
            player.fireRateMultiplier = 1.0;
            player.multishot = 1;
            player.currentWeapon = 'pistol';
            player.orbitBlades = 0;
            player.hasDrone = false;
            player.pickupRadius = 90;
            player.invulnerableTime = 0;
            player.frenzyUntil = 0;

            bullets = [];
            walkers = [];
            items = [];
            particles = [];
            floatingTexts = [];
            boss = null;
            screenShake = 0;

            levelEl.textContent = '1';
            killsEl.textContent = '0';
            coinsEl.textContent = '0';
            expBar.style.width = '0%';
            updateHpUI();

            gameOverModal.style.display = 'none';
            victoryModal.style.display = 'none';
            pauseModal.style.display = 'none';
            upgradeModal.style.display = 'none';
            bossBarContainer.style.display = 'none';

            setupStage(1);
        }

        // Input Listeners
        function onKeyDown(e) {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
            }
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                togglePause();
            }
        }

        function onKeyUp(e) {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Joystick Event Listeners
        function startJoystick(clientX, clientY, identifier = null) {
            const rect = joystickContainer.getBoundingClientRect();
            joystick.active = true;
            joystick.touchId = identifier;
            joystick.startX = rect.left + rect.width / 2;
            joystick.startY = rect.top + rect.height / 2;
            updateJoystick(clientX, clientY);
        }

        function updateJoystick(clientX, clientY) {
            if (!joystick.active) return;
            let dx = clientX - joystick.startX;
            let dy = clientY - joystick.startY;
            let dist = Math.hypot(dx, dy);

            if (dist > joystick.maxRadius) {
                dx = (dx / dist) * joystick.maxRadius;
                dy = (dy / dist) * joystick.maxRadius;
                dist = joystick.maxRadius;
            }

            joystick.dx = dx / joystick.maxRadius;
            joystick.dy = dy / joystick.maxRadius;
            joystick.distance = dist;

            joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
        }

        function endJoystick() {
            joystick.active = false;
            joystick.touchId = null;
            joystick.dx = 0;
            joystick.dy = 0;
            joystick.distance = 0;
            joystickKnob.style.transform = 'translate(0px, 0px)';
        }

        joystickContainer.addEventListener('pointerdown', (e) => {
            joystickContainer.setPointerCapture(e.pointerId);
            startJoystick(e.clientX, e.clientY, e.pointerId);
        });

        joystickContainer.addEventListener('pointermove', (e) => {
            if (joystick.active && joystick.touchId === e.pointerId) {
                updateJoystick(e.clientX, e.clientY);
            }
        });

        joystickContainer.addEventListener('pointerup', (e) => {
            if (joystick.touchId === e.pointerId) {
                endJoystick();
            }
        });

        joystickContainer.addEventListener('pointercancel', (e) => {
            if (joystick.touchId === e.pointerId) {
                endJoystick();
            }
        });

        // Pause Menu Listeners
        function togglePause() {
            if (!gameActive) return;
            isPaused = !isPaused;
            pauseModal.style.display = isPaused ? 'flex' : 'none';
        }

        pauseBtn.addEventListener('click', togglePause);
        resumeBtn.addEventListener('click', () => {
            isPaused = false;
            pauseModal.style.display = 'none';
        });
        pauseRestartBtn.addEventListener('click', resetGame);
        restartBtn.addEventListener('click', resetGame);
        victoryNextBtn.addEventListener('click', () => {
            victoryModal.style.display = 'none';
            setupStage(wave + 1);
            gameActive = true;
        });

        // Primary Game Update Loop
        let lastFrameTime = performance.now();
        function gameLoop(currentTime) {
            if (!gameActive && !gameOverModal.style.display && !victoryModal.style.display) {
                return;
            }

            const dt = Math.min(32, currentTime - lastFrameTime);
            lastFrameTime = currentTime;

            if (!isPaused && gameActive) {
                update(dt, currentTime);
            }

            render();

            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function update(dt, now) {
            waveTimer += dt;
            score += Math.round(dt * 0.05);

            // 1. Player Movement Input
            let moveX = 0;
            let moveY = 0;

            if (keys.w || keys.ArrowUp) moveY -= 1;
            if (keys.s || keys.ArrowDown) moveY += 1;
            if (keys.a || keys.ArrowLeft) moveX -= 1;
            if (keys.d || keys.ArrowRight) moveX += 1;

            if (joystick.active && joystick.distance > 5) {
                moveX = joystick.dx;
                moveY = joystick.dy;
            }

            const len = Math.hypot(moveX, moveY);
            if (len > 0.05) {
                player.isMoving = true;
                const normX = moveX / (len > 1 ? len : 1);
                const normY = moveY / (len > 1 ? len : 1);
                player.vx = normX * player.speed;
                player.vy = normY * player.speed;
                player.walkCycle += 0.22;
            } else {
                player.isMoving = false;
                player.vx = 0;
                player.vy = 0;
            }

            // Move & Clamp Player
            player.x += player.vx;
            player.y += player.vy;
            player.x = Math.max(player.radius + 20, Math.min(MAP_WIDTH - player.radius - 20, player.x));
            player.y = Math.max(player.radius + 20, Math.min(MAP_HEIGHT - player.radius - 20, player.y));

            // Obstacle collisions
            obstacles.forEach(o => {
                const dist = Math.hypot(player.x - o.x, player.y - o.y);
                const minDist = player.radius + o.radius;
                if (dist < minDist) {
                    const angle = Math.atan2(player.y - o.y, player.x - o.x);
                    player.x = o.x + Math.cos(angle) * minDist;
                    player.y = o.y + Math.sin(angle) * minDist;
                }
            });

            // Invulnerability frame countdown
            if (player.invulnerableTime > 0) {
                player.invulnerableTime--;
            }

            // Orbiting Blades & Drone rotations
            if (player.orbitBlades > 0) {
                player.bladeAngle += 0.06;
                // Check blade collision with zombies
                for (let b = 0; b < player.orbitBlades; b++) {
                    const bAngle = player.bladeAngle + (b * (Math.PI * 2 / player.orbitBlades));
                    const bx = player.x + Math.cos(bAngle) * 55;
                    const by = player.y + Math.sin(bAngle) * 55;

                    walkers.forEach(w => {
                        if (Math.hypot(w.x - bx, w.y - by) < 18 + w.radius) {
                            damageWalker(w, 4.5 * player.damageMultiplier);
                        }
                    });

                    if (boss && Math.hypot(boss.x - bx, boss.y - by) < 18 + boss.radius) {
                        damageBoss(6 * player.damageMultiplier);
                    }
                }
            }

            if (player.hasDrone) {
                player.droneAngle += 0.04;
            }

            // 2. Auto-Shooting
            updatePlayerShooting(now);

            // 3. Bullets update
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx;
                b.y += b.vy;
                b.distTravelled += Math.hypot(b.vx, b.vy);

                let bulletRemoved = false;

                // Obstacle hits
                for (let o of obstacles) {
                    if (Math.hypot(b.x - o.x, b.y - o.y) < b.radius + o.radius) {
                        o.hp -= b.damage;
                        if (b.isExplosive) {
                            createExplosion(b.x, b.y, b.explosionRadius || 80);
                        } else {
                            createHitSparks(b.x, b.y, b.color, 3);
                        }
                        if (o.hp <= 0 && o.type === 'barrel') {
                            createExplosion(o.x, o.y, 110, '#f97316');
                        }
                        bullets.splice(i, 1);
                        bulletRemoved = true;
                        break;
                    }
                }
                if (bulletRemoved) continue;

                // Boss hits
                if (boss && !bulletRemoved) {
                    if (Math.hypot(b.x - boss.x, b.y - boss.y) < b.radius + boss.radius) {
                        if (!b.hitEntities.includes(boss)) {
                            b.hitEntities.push(boss);
                            damageBoss(b.damage);

                            if (b.isExplosive) {
                                createExplosion(b.x, b.y, b.explosionRadius || 90);
                                bullets.splice(i, 1);
                                bulletRemoved = true;
                            } else if (!b.isPiercing) {
                                createHitSparks(b.x, b.y, b.color, 4);
                                bullets.splice(i, 1);
                                bulletRemoved = true;
                            }
                        }
                    }
                }
                if (bulletRemoved) continue;

                // Walker hits
                for (let w of walkers) {
                    if (Math.hypot(b.x - w.x, b.y - w.y) < b.radius + w.radius) {
                        if (!b.hitEntities.includes(w)) {
                            b.hitEntities.push(w);
                            damageWalker(w, b.damage, b.isExplosive);

                            if (b.isExplosive) {
                                createExplosion(b.x, b.y, b.explosionRadius || 80);
                                bullets.splice(i, 1);
                                bulletRemoved = true;
                                break;
                            } else if (!b.isPiercing) {
                                bullets.splice(i, 1);
                                bulletRemoved = true;
                                break;
                            }
                        }
                    }
                }
                if (bulletRemoved) continue;

                // Max range or out of bounds
                if (b.distTravelled >= b.range || b.x < 0 || b.x > MAP_WIDTH || b.y < 0 || b.y > MAP_HEIGHT) {
                    bullets.splice(i, 1);
                }
            }

            // 4. Update Spawns & Walkers
            updateZombieSpawns(now);

            for (let i = walkers.length - 1; i >= 0; i--) {
                const w = walkers[i];
                if (w.hitFlash > 0) w.hitFlash--;

                const angleToPlayer = Math.atan2(player.y - w.y, player.x - w.x);
                const distToPlayer = Math.hypot(player.x - w.x, player.y - w.y);

                // Walker Movement Behaviors
                if (w.type === 'spitter' && distToPlayer < 240) {
                    // Spitter retreats or keeps distance
                    w.x -= Math.cos(angleToPlayer) * (w.speed * 0.7);
                    w.y -= Math.sin(angleToPlayer) * (w.speed * 0.7);

                    // Spit acid
                    if (now - w.lastSpit > 2400) {
                        w.lastSpit = now;
                        bullets.push({
                            x: w.x,
                            y: w.y,
                            vx: Math.cos(angleToPlayer) * 6,
                            vy: Math.sin(angleToPlayer) * 6,
                            radius: 6,
                            color: '#84cc16',
                            damage: 18,
                            range: 300,
                            distTravelled: 0,
                            isEnemy: true
                        });
                    }
                } else {
                    w.x += Math.cos(angleToPlayer) * w.speed;
                    w.y += Math.sin(angleToPlayer) * w.speed;
                }

                w.walkCycle += 0.15;

                // Push apart overlapping zombies
                for (let j = i - 1; j >= 0; j--) {
                    const w2 = walkers[j];
                    const d = Math.hypot(w.x - w2.x, w.y - w2.y);
                    const minD = w.radius + w2.radius;
                    if (d < minD && d > 0) {
                        const push = (minD - d) * 0.2;
                        const pushA = Math.atan2(w.y - w2.y, w.x - w2.x);
                        w.x += Math.cos(pushA) * push;
                        w.y += Math.sin(pushA) * push;
                        w2.x -= Math.cos(pushA) * push;
                        w2.y -= Math.sin(pushA) * push;
                    }
                }

                // Attack Player
                if (distToPlayer < player.radius + w.radius) {
                    if (now - w.lastAttack > 600) {
                        w.lastAttack = now;
                        const dmg = w.type === 'brute' ? 32 : (w.type === 'runner' ? 14 : 18);
                        damagePlayer(dmg);
                    }
                }
            }

            // 5. Boss AI Update
            if (boss) {
                if (boss.hitFlash > 0) boss.hitFlash--;
                boss.stateTimer += dt;

                const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
                const distToPlayer = Math.hypot(player.x - boss.x, player.y - boss.y);

                if (boss.state === 'chase') {
                    boss.x += Math.cos(angleToPlayer) * boss.speed;
                    boss.y += Math.sin(angleToPlayer) * boss.speed;
                    boss.walkCycle += 0.08;

                    // Periodic Stomp Attack
                    if (boss.stateTimer > 7000 && distToPlayer < 260) {
                        boss.state = 'stomp';
                        boss.stateTimer = 0;
                    } else if (boss.stateTimer > 12000) {
                        boss.state = 'charge';
                        boss.chargeTarget = { x: player.x, y: player.y };
                        boss.stateTimer = 0;
                    }
                } else if (boss.state === 'stomp') {
                    // Stomp ground shockwave
                    if (boss.stateTimer > 800) {
                        createExplosion(boss.x, boss.y, 160, '#ef4444');
                        floatingTexts.push({
                            x: boss.x,
                            y: boss.y - 45,
                            text: '💥 زلزال هادر! 💥',
                            color: '#ef4444',
                            size: 16,
                            life: 45
                        });
                        boss.state = 'chase';
                        boss.stateTimer = 0;
                    }
                } else if (boss.state === 'charge') {
                    // Charge fast toward target
                    const cAngle = Math.atan2(boss.chargeTarget.y - boss.y, boss.chargeTarget.x - boss.chargeTarget.x);
                    boss.x += Math.cos(cAngle) * (boss.speed * 3.5);
                    boss.y += Math.sin(cAngle) * (boss.speed * 3.5);

                    if (boss.stateTimer > 2000 || Math.hypot(boss.x - boss.chargeTarget.x, boss.y - boss.chargeTarget.y) < 30) {
                        boss.state = 'chase';
                        boss.stateTimer = 0;
                    }
                }

                // Boss Contact Damage
                if (distToPlayer < player.radius + boss.radius) {
                    if (now - boss.lastAttack > 800) {
                        boss.lastAttack = now;
                        damagePlayer(45);
                    }
                }
            }

            // 6. Update Items & Loot collection
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                const dist = Math.hypot(player.x - item.x, player.y - item.y);

                // Magnet attraction
                if (dist < player.pickupRadius) {
                    const angle = Math.atan2(player.y - item.y, player.x - item.x);
                    const spd = 6 + (1 - dist / player.pickupRadius) * 8;
                    item.x += Math.cos(angle) * spd;
                    item.y += Math.sin(angle) * spd;
                }

                // Collection
                if (dist < player.radius + item.radius) {
                    if (item.type === 'gem') {
                        addExp(item.value);
                    } else if (item.type === 'coin') {
                        coinsCollected += item.value;
                        coinsEl.textContent = coinsCollected;
                        playSound('coin_pickup');
                    } else if (item.type === 'medkit') {
                        player.hp = Math.min(player.maxHp, player.hp + item.heal);
                        updateHpUI();
                        playSound('level_up');
                        floatingTexts.push({ x: player.x, y: player.y - 30, text: '+' + item.heal + ' HP', color: '#4ade80', size: 16, life: 35 });
                    } else if (item.type === 'nuke') {
                        // Tactical Nuke!
                        playSound('explosion');
                        screenShake = 20;
                        createExplosion(player.x, player.y, 400, '#f97316');
                        walkers.forEach(w => damageWalker(w, 500, true));
                        floatingTexts.push({ x: player.x, y: player.y - 50, text: '💣 تفجير نووي شامل! 💣', color: '#f97316', size: 22, life: 60 });
                    } else if (item.type === 'magnet') {
                        // Magnet all items
                        playSound('coin_pickup');
                        items.forEach(it => {
                            it.x = player.x + (Math.random() - 0.5) * 40;
                            it.y = player.y + (Math.random() - 0.5) * 40;
                        });
                        floatingTexts.push({ x: player.x, y: player.y - 40, text: '🧲 مغناطيس فائق! 🧲', color: '#38bdf8', size: 18, life: 40 });
                    } else if (item.type === 'frenzy') {
                        // Frenzy Mode!
                        player.frenzyUntil = now + 9000;
                        playSound('level_up');
                        floatingTexts.push({ x: player.x, y: player.y - 40, text: '⚡ وضع الهيجان (FRENZY)! ⚡', color: '#e11d48', size: 20, life: 60 });
                    }

                    items.splice(i, 1);
                }
            }

            // Remove destroyed obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if (obstacles[i].hp <= 0) {
                    dropLoot(obstacles[i].x, obstacles[i].y, false);
                    obstacles.splice(i, 1);
                }
            }

            // 7. Update Particles & Floating Text
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.isShell) {
                    p.angle += p.rotSpeed;
                    p.vx *= 0.94;
                    p.vy *= 0.94;
                } else {
                    p.vx *= 0.96;
                    p.vy *= 0.96;
                }

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i];
                ft.y -= 0.8;
                ft.life--;
                if (ft.life <= 0) {
                    floatingTexts.splice(i, 1);
                }
            }

            // Screen Shake Decay
            if (screenShake > 0) screenShake *= 0.9;
            if (screenShake < 0.2) screenShake = 0;

            // Camera smoothly tracks player
            camera.x += (player.x - camera.width / 2 - camera.x) * 0.12;
            camera.y += (player.y - camera.height / 2 - camera.y) * 0.12;
            camera.x = Math.max(0, Math.min(MAP_WIDTH - camera.width, camera.x));
            camera.y = Math.max(0, Math.min(MAP_HEIGHT - camera.height, camera.y));
        }

        // Render Canvas
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();

            // Screen Shake
            if (screenShake > 0) {
                const sx = (Math.random() - 0.5) * screenShake;
                const sy = (Math.random() - 0.5) * screenShake;
                ctx.translate(sx, sy);
            }

            // Camera Viewport Translation
            ctx.translate(-camera.x, -camera.y);

            // Draw Background Tiles & Grid
            const theme = THEMES[currentTheme];
            ctx.fillStyle = theme.floorColor;
            ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

            // Subtle Grid
            ctx.strokeStyle = theme.gridColor;
            ctx.lineWidth = 1.5;
            const gridSize = 100;
            const startX = Math.floor(camera.x / gridSize) * gridSize;
            const startY = Math.floor(camera.y / gridSize) * gridSize;

            ctx.beginPath();
            for (let x = startX; x <= camera.x + camera.width + gridSize; x += gridSize) {
                ctx.moveTo(x, camera.y);
                ctx.lineTo(x, camera.y + camera.height);
            }
            for (let y = startY; y <= camera.y + camera.height + gridSize; y += gridSize) {
                ctx.moveTo(camera.x, y);
                ctx.lineTo(camera.x + camera.width, y);
            }
            ctx.stroke();

            // Arena Outer Border
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = 12;
            ctx.strokeRect(10, 10, MAP_WIDTH - 20, MAP_HEIGHT - 20);

            // Draw Obstacles (Crates & Barrels)
            obstacles.forEach(o => {
                ctx.save();
                ctx.translate(o.x, o.y);

                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(0, o.radius * 0.7, o.radius, o.radius * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();

                if (o.type === 'barrel') {
                    // Red Explosive Barrel
                    ctx.fillStyle = '#dc2626';
                    ctx.beginPath();
                    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#991b1b';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Hazard lines
                    ctx.fillStyle = '#facc15';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('☣️', 0, 0);
                } else {
                    // Wooden Crate
                    ctx.fillStyle = '#854d0e';
                    ctx.fillRect(-o.radius, -o.radius, o.radius * 2, o.radius * 2);
                    ctx.strokeStyle = '#ca8a04';
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(-o.radius, -o.radius, o.radius * 2, o.radius * 2);

                    // X cross on crate
                    ctx.beginPath();
                    ctx.moveTo(-o.radius, -o.radius);
                    ctx.lineTo(o.radius, o.radius);
                    ctx.moveTo(o.radius, -o.radius);
                    ctx.lineTo(-o.radius, o.radius);
                    ctx.stroke();
                }

                ctx.restore();
            });

            // Draw Dead Remains / Blood Splatters
            particles.filter(p => p.color === '#15803d').forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            // Draw Items & Loot
            items.forEach(it => {
                ctx.save();
                ctx.translate(it.x, it.y);

                // Glow aura
                ctx.fillStyle = it.color;
                ctx.globalAlpha = 0.25;
                ctx.beginPath();
                ctx.arc(0, 0, it.radius * 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                if (it.type === 'gem') {
                    // Crystal diamond
                    ctx.fillStyle = it.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -it.radius);
                    ctx.lineTo(it.radius, 0);
                    ctx.lineTo(0, it.radius);
                    ctx.lineTo(-it.radius, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else if (it.type === 'coin') {
                    // Gold Coin
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ca8a04';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = '#713f12';
                    ctx.font = 'bold 9px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('$', 0, 0);
                } else if (it.type === 'medkit') {
                    // Medkit
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-it.radius, -it.radius * 0.7, it.radius * 2, it.radius * 1.4);
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-it.radius, -it.radius * 0.7, it.radius * 2, it.radius * 1.4);
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(-2, -6, 4, 12);
                    ctx.fillRect(-6, -2, 12, 4);
                } else {
                    // Powerup icons (Nuke, Magnet, Frenzy)
                    ctx.font = `${it.radius * 1.5}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const icon = it.type === 'nuke' ? '💣' : (it.type === 'magnet' ? '🧲' : '⚡');
                    ctx.fillText(icon, 0, 0);
                }

                ctx.restore();
            });

            // Draw Shell Casings
            particles.filter(p => p.isShell).forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = '#facc15';
                ctx.fillRect(-3, -1.5, 6, 3);
                ctx.restore();
            });

            // Draw Walkers (Zombies)
            walkers.forEach(w => {
                ctx.save();
                ctx.translate(w.x, w.y);

                // Walker Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(0, w.radius * 0.8, w.radius * 0.9, w.radius * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();

                // Hit flash white
                const bodyColor = w.hitFlash > 0 ? '#ffffff' : w.color;

                // Rotate toward player
                const faceAngle = Math.atan2(player.y - w.y, player.x - w.x);
                ctx.rotate(faceAngle);

                // Zombie Legs with walking animation
                const legOffset = Math.sin(w.walkCycle) * 6;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-w.radius * 0.5, -w.radius * 0.8 + legOffset, 7, 5);
                ctx.fillRect(-w.radius * 0.5, w.radius * 0.4 - legOffset, 7, 5);

                // Zombie Body
                ctx.fillStyle = bodyColor;
                ctx.beginPath();
                ctx.arc(0, 0, w.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#14532d';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Zombie Arms reaching out towards hero
                ctx.fillStyle = bodyColor;
                ctx.fillRect(w.radius * 0.4, -w.radius * 0.6, w.radius * 0.8, 5);
                ctx.fillRect(w.radius * 0.4, w.radius * 0.2, w.radius * 0.8, 5);

                // Zombie Glowing Eyes
                ctx.fillStyle = w.type === 'runner' ? '#dc2626' : (w.type === 'spitter' ? '#facc15' : '#ffffff');
                ctx.beginPath();
                ctx.arc(w.radius * 0.45, -w.radius * 0.35, 3.5, 0, Math.PI * 2);
                ctx.arc(w.radius * 0.45, w.radius * 0.35, 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                // Overhead Health Bar if damaged
                if (w.hp < w.maxHp) {
                    const barW = w.radius * 2;
                    const barH = 4;
                    const pct = Math.max(0, w.hp / w.maxHp);
                    ctx.fillStyle = '#374151';
                    ctx.fillRect(w.x - barW / 2, w.y - w.radius - 8, barW, barH);
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(w.x - barW / 2, w.y - w.radius - 8, barW * pct, barH);
                }
            });

            // Draw Boss Walker
            if (boss) {
                ctx.save();
                ctx.translate(boss.x, boss.y);

                // Boss Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.beginPath();
                ctx.ellipse(0, boss.radius * 0.8, boss.radius * 1.1, boss.radius * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();

                const faceAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                ctx.rotate(faceAngle);

                const bColor = boss.hitFlash > 0 ? '#ffffff' : (boss.state === 'charge' ? '#ef4444' : '#7f1d1d');

                // Giant Hulk Arms
                ctx.fillStyle = bColor;
                ctx.fillRect(boss.radius * 0.3, -boss.radius * 0.9, boss.radius * 1.1, 16);
                ctx.fillRect(boss.radius * 0.3, boss.radius * 0.3, boss.radius * 1.1, 16);

                // Giant Body
                ctx.fillStyle = bColor;
                ctx.beginPath();
                ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#450a0a';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Spikes / Armor on shoulders
                ctx.fillStyle = '#1c1917';
                ctx.beginPath();
                ctx.arc(-boss.radius * 0.4, -boss.radius * 0.7, 10, 0, Math.PI * 2);
                ctx.arc(-boss.radius * 0.4, boss.radius * 0.7, 10, 0, Math.PI * 2);
                ctx.fill();

                // Glowing Menacing Eyes
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(boss.radius * 0.5, -boss.radius * 0.3, 6, 0, Math.PI * 2);
                ctx.arc(boss.radius * 0.5, boss.radius * 0.3, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // Draw Player Hero Character
            ctx.save();
            ctx.translate(player.x, player.y);

            // Hero Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(0, player.radius * 0.85, player.radius, player.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Frenzy / Invulnerable Aura
            if (Date.now() < player.frenzyUntil) {
                ctx.strokeStyle = '#f43f5e';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, player.radius + 12 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Rotate in facing/aiming direction
            ctx.rotate(player.angle);

            // Legs with running animation
            const legWalk = Math.sin(player.walkCycle) * 7;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-player.radius * 0.6, -player.radius * 0.7 + legWalk, 8, 6);
            ctx.fillRect(-player.radius * 0.6, player.radius * 0.3 - legWalk, 8, 6);

            // Hero Body / Armor
            ctx.fillStyle = player.invulnerableTime % 4 > 1 ? '#ffffff' : '#0284c7';
            ctx.beginPath();
            ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0369a1';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Military Vest
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(-2, 0, player.radius * 0.75, -Math.PI / 2, Math.PI / 2);
            ctx.fill();

            // Tactical Helmet / Cap
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, player.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Weapons in Hand
            const weaponColor = WEAPONS[player.currentWeapon].color;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(player.radius * 0.4, -player.radius * 0.65, 16, 5);
            ctx.fillRect(player.radius * 0.4, player.radius * 0.3, 16, 5);
            // Gun barrels
            ctx.fillStyle = weaponColor;
            ctx.fillRect(player.radius * 0.4 + 14, -player.radius * 0.65, 6, 5);
            ctx.fillRect(player.radius * 0.4 + 14, player.radius * 0.3, 6, 5);

            ctx.restore();

            // Draw Targeting Laser Beam (Walkers Attack style visual indicator)
            let closestEnemy = boss;
            let closestDist = boss ? Math.hypot(boss.x - player.x, boss.y - player.y) : 9999;
            for (let w of walkers) {
                const d = Math.hypot(w.x - player.x, w.y - player.y);
                if (d < closestDist && d < WEAPONS[player.currentWeapon].range) {
                    closestDist = d;
                    closestEnemy = w;
                }
            }
            if (closestEnemy && closestDist < WEAPONS[player.currentWeapon].range) {
                ctx.save();
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.setLineDash([4, 6]);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(player.x, player.y);
                ctx.lineTo(closestEnemy.x, closestEnemy.y);
                ctx.stroke();

                // Target crosshair
                ctx.strokeStyle = '#ef4444';
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(closestEnemy.x, closestEnemy.y, closestEnemy.radius + 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Orbiting Guardian Blades
            if (player.orbitBlades > 0) {
                for (let b = 0; b < player.orbitBlades; b++) {
                    const bAngle = player.bladeAngle + (b * (Math.PI * 2 / player.orbitBlades));
                    const bx = player.x + Math.cos(bAngle) * 55;
                    const by = player.y + Math.sin(bAngle) * 55;

                    ctx.save();
                    ctx.translate(bx, by);
                    ctx.rotate(bAngle + Math.PI / 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Draw Support Drone
            if (player.hasDrone) {
                const dx = player.x + Math.cos(player.droneAngle) * 38;
                const dy = player.y + Math.sin(player.droneAngle) * 38;

                ctx.save();
                ctx.translate(dx, dy);
                ctx.fillStyle = '#0284c7';
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();
                // Drone Eye
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Draw Bullets & Lasers
            bullets.forEach(b => {
                ctx.save();
                ctx.translate(b.x, b.y);

                if (b.isExplosive) {
                    // Rocket projectile with smoke
                    const angle = Math.atan2(b.vy, b.vx);
                    ctx.rotate(angle);
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(-8, -4, 16, 8);
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.moveTo(-8, -3);
                    ctx.lineTo(-14, 0);
                    ctx.lineTo(-8, 3);
                    ctx.fill();
                } else if (b.isPiercing) {
                    // Laser Beam
                    const angle = Math.atan2(b.vy, b.vx);
                    ctx.rotate(angle);
                    ctx.fillStyle = '#c084fc';
                    ctx.fillRect(-12, -3, 24, 6);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-8, -1.5, 16, 3);
                } else {
                    // Regular Bullet
                    ctx.fillStyle = b.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.restore();
            });

            // Draw Particles
            particles.filter(p => !p.isShell && p.color !== '#15803d').forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            // Draw Floating Combat Texts
            floatingTexts.forEach(ft => {
                ctx.save();
                ctx.fillStyle = ft.color;
                ctx.font = `bold ${ft.size}px var(--font-kids), sans-serif`;
                ctx.textAlign = 'center';
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 4;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });

            ctx.restore();
        }

        // Setup & Start
        setupStage(1);
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);

        // Cleanup on Game Exit
        function cleanup() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            container.removeEventListener('game-exit', cleanup);
        }

        container.addEventListener('game-exit', cleanup);
    };
})();
