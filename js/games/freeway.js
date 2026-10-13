// Game 42: Freeway Chicken (عبور الشارع)
(function() {
    window.initFreewayGame = function(container) {
        let score = 0;
        let lives = 3;
        const targetScore = 5;
        let gameActive = true;
        let animationId = null;

        let html = `
            <div class="game-freeway-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); user-select: none;">
                <h2 class="game-title" style="color: #FF9800; margin-bottom: 4px; font-weight: 900; width: 100%;">🐤 عبور الشارع 🐤</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 8px; direction: rtl;">
                    <div style="font-weight: bold; color: #E65100; font-size: 15px;">النقاط: <span id="freeScore">0</span> / 5</div>
                    <div id="freeLives" style="font-weight: bold; color: #E53935; font-size: 15px;">❤️❤️❤️</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.2); border: 3px solid #333; width: 100%;">
                    <canvas id="freeCanvas" width="400" height="500" style="display: block; background: #555; touch-action: none; width: 100%; height: auto;"></canvas>
                </div>
                
                <!-- UP and DOWN control buttons for kids -->
                <div style="display: flex; gap: 20px; margin-top: 10px; width: 100%; justify-content: center; height: 110px; align-items: center;">
                    <button id="btnFreeDown" style="width: 100px; height: 80px; font-size: 36px; border: none; border-radius: 20px; background: #FF9800; color: #FFF; box-shadow: 0 5px 0 #E65100; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;">⬇️</button>
                    <button id="btnFreeUp" style="width: 120px; height: 90px; font-size: 42px; border: none; border-radius: 20px; background: #FF5722; color: #FFF; box-shadow: 0 6px 0 #D84315; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;">⬆️</button>
                </div>

                <div id="freeWinModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 26px; margin-bottom: 10px;">🎉 بطل العبور! 🎉</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد نجحت في مساعدة الدجاجة على عبور الشارع المزدحم 5 مرات!</p>
                        <button class="menu-btn restart-btn" id="restartFree" style="background: #4CAF50; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>

                <div id="freeFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 30px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 26px; margin-bottom: 10px;">💥 انتهت المحاولات! 💥</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">حاول مرة أخرى وتجنب الاصطدام بالسيارات المسرعة!</p>
                        <button class="menu-btn restart-btn" id="retryFree" style="background: #E53935; color: #FFF; border: none; padding: 12px 30px; font-size: 18px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #B71C1C; transition: transform 0.1s;">أعد المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('freeCanvas');
        const ctx = canvas.getContext('2d');

        // Layout constants
        const SIDEWALK_H = 40;
        const ROAD_START_Y = SIDEWALK_H;
        const ROAD_END_Y = canvas.height - SIDEWALK_H;
        const NUM_LANES = 5;
        const LANE_H = (ROAD_END_Y - ROAD_START_Y) / NUM_LANES; // 84px

        // Y-coordinate mapping for lanes
        // 0: top lane, 4: bottom lane, 5: start sidewalk
        const yPositions = [
            20,  // 0: Top sidewalk
            82,  // 1: Lane 0
            166, // 2: Lane 1
            250, // 3: Lane 2
            334, // 4: Lane 3
            418, // 5: Lane 4
            480  // 6: Bottom sidewalk (Start)
        ];

        let chickenIdx = 6; // start at bottom sidewalk
        let chickenX = 200;

        // Traffic state
        let cars = [];
        const carEmojis = ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚐', '🚓'];

        // Initialize cars for the 10 lanes
        function initTraffic() {
            cars = [];
            for (let i = 0; i < NUM_LANES; i++) {
                // Alternating directions: even lanes go right, odd lanes go left
                const dir = i % 2 === 0 ? 1 : -1;
                const speed = Math.random() * 0.4 + 0.35 + (i % 3) * 0.15;
                const emoji = carEmojis[Math.floor(Math.random() * carEmojis.length)];
                
                // Spawn two cars per lane with staggered x coordinates
                cars.push({
                    x: Math.random() * 200,
                    y: yPositions[i + 1],
                    lane: i,
                    speed: speed,
                    dir: dir,
                    emoji: emoji
                });
                cars.push({
                    x: Math.random() * 200 + 240,
                    y: yPositions[i + 1],
                    lane: i,
                    speed: speed,
                    dir: dir,
                    emoji: emoji
                });
            }
        }

        initTraffic();

        // Main update loops
        function update() {
            if (!gameActive) return;

            // 1. Draw road and sidewalks
            drawRoadBackground();

            // 2. Update and draw cars
            updateAndDrawCars();

            // 3. Draw chicken player
            drawChicken();

            // 4. Collision Check
            checkCollision();

            animationId = requestAnimationFrame(update);
        }

        function drawRoadBackground() {
            // Draw gray road
            ctx.fillStyle = '#424242';
            ctx.fillRect(0, ROAD_START_Y, canvas.width, ROAD_END_Y - ROAD_START_Y);

            // Draw sidewalks
            const sideGrad = ctx.createLinearGradient(0, 0, 0, SIDEWALK_H);
            ctx.fillStyle = '#E0D0B0';
            ctx.fillRect(0, 0, canvas.width, SIDEWALK_H);
            ctx.fillRect(0, ROAD_END_Y, canvas.width, SIDEWALK_H);

            // Sidewalk lines
            ctx.strokeStyle = '#BCAAA4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, SIDEWALK_H);
            ctx.lineTo(canvas.width, SIDEWALK_H);
            ctx.moveTo(0, ROAD_END_Y);
            ctx.lineTo(canvas.width, ROAD_END_Y);
            ctx.stroke();

            // Draw dashed white lane dividers
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 18]);
            for (let i = 1; i < NUM_LANES; i++) {
                const y = ROAD_START_Y + i * LANE_H;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        function updateAndDrawCars() {
            ctx.font = '44px sans-serif'; // Larger car size
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            cars.forEach(car => {
                // Update car position
                car.x += car.dir * car.speed;

                // Loop cars when they leave boundaries (adjusted for larger size)
                if (car.dir === 1 && car.x > canvas.width + 45) {
                    car.x = -45;
                } else if (car.dir === -1 && car.x < -45) {
                    car.x = canvas.width + 45;
                }

                // Draw car emoji
                ctx.save();
                // Flip text horizontally if moving right to left
                if (car.dir === -1) {
                    ctx.translate(car.x, car.y);
                    ctx.scale(-1, 1);
                    ctx.fillText(car.emoji, 0, 0);
                } else {
                    ctx.fillText(car.emoji, car.x, car.y);
                }
                ctx.restore();
            });
        }

        function drawChicken() {
            ctx.save();
            ctx.font = '30px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐤', chickenX, yPositions[chickenIdx]);
            ctx.restore();
        }

        function checkCollision() {
            // Chicken is only on road lanes from index 1 to 5
            if (chickenIdx < 1 || chickenIdx > 5) return;

            const currentLane = chickenIdx - 1;
            const chickenY = yPositions[chickenIdx];

            for (let i = 0; i < cars.length; i++) {
                const car = cars[i];
                if (car.lane === currentLane) {
                    // Check horizontal overlap (adjusted for larger cars)
                    if (Math.abs(car.x - chickenX) < 26) {
                        handleCollision();
                        break;
                    }
                }
            }
        }

        function handleCollision() {
            lives--;
            updateLivesUI();

            if (window.sound) window.sound.playFail();

            // Flash screen red effect
            ctx.save();
            ctx.fillStyle = 'rgba(211, 47, 47, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Reset chicken position
            chickenIdx = 6;
            chickenX = 200;

            if (lives <= 0) {
                failGame();
            }
        }

        function moveUp() {
            if (!gameActive) return;
            if (chickenIdx > 0) {
                chickenIdx--;
                if (window.sound) window.sound.playClick();
                
                // Check if successfully crossed!
                if (chickenIdx === 0) {
                    score++;
                    document.getElementById('freeScore').innerText = score;
                    if (window.sound) window.sound.playSuccess();
                    
                    if (score >= targetScore) {
                        winGame();
                    } else {
                        // Reset chicken back to bottom sidewalk
                        setTimeout(() => {
                            chickenIdx = 6;
                            chickenX = 200;
                        }, 250);
                    }
                }
            }
        }

        function moveDown() {
            if (!gameActive) return;
            if (chickenIdx < 6) {
                chickenIdx++;
                if (window.sound) window.sound.playClick();
            }
        }

        function updateLivesUI() {
            const container = document.getElementById('freeLives');
            if (container) {
                container.innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
            }
        }

        function winGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) window.sound.playSuccess();
            document.getElementById('freeWinModal').style.display = 'flex';
        }

        function failGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            document.getElementById('freeFailModal').style.display = 'flex';
        }

        function resetGame() {
            score = 0;
            lives = 3;
            chickenIdx = 11;
            chickenX = 200;
            document.getElementById('freeScore').innerText = score;
            updateLivesUI();
            initTraffic();
            document.getElementById('freeWinModal').style.display = 'none';
            document.getElementById('freeFailModal').style.display = 'none';
            gameActive = true;
            update();
        }

        // D-pad controls binding
        const btnUp = document.getElementById('btnFreeUp');
        const btnDown = document.getElementById('btnFreeDown');

        btnUp.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btnUp.style.transform = 'scale(0.92) translateY(5px)';
            moveUp();
        });
        btnUp.addEventListener('mouseup', () => { btnUp.style.transform = 'none'; });
        btnUp.addEventListener('mouseleave', () => { btnUp.style.transform = 'none'; });

        btnUp.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btnUp.style.transform = 'scale(0.92) translateY(5px)';
            moveUp();
        });
        btnUp.addEventListener('touchend', () => { btnUp.style.transform = 'none'; });

        btnDown.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btnDown.style.transform = 'scale(0.92) translateY(4px)';
            moveDown();
        });
        btnDown.addEventListener('mouseup', () => { btnDown.style.transform = 'none'; });
        btnDown.addEventListener('mouseleave', () => { btnDown.style.transform = 'none'; });

        btnDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btnDown.style.transform = 'scale(0.92) translateY(4px)';
            moveDown();
        });
        btnDown.addEventListener('touchend', () => { btnDown.style.transform = 'none'; });

        // Keyboard controls support
        function handleKey(e) {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                moveUp();
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                moveDown();
            }
        }
        window.addEventListener('keydown', handleKey);

        document.getElementById('restartFree').addEventListener('click', resetGame);
        document.getElementById('retryFree').addEventListener('click', resetGame);

        // Start
        update();

        // Cleanup
        container.addEventListener('game-exit', () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKey);
        });
    };
})();
