// Game 34: Fishing Game (صيد السمك)
(function() {
    window.initFishingGame = function (container) {
        let score = 0;
        const targetScore = 10;
        let lives = 3;
        let gameActive = true;
        let animationId = null;

        let html = `
            <div class="game-fish-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids);">
                <h2 class="game-title" style="color: #0086EB; margin-bottom: 8px;">🎣 صيد السمك 🎣</h2>
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 10px;">
                    <div class="hud-score" style="font-weight: bold; color: #0066EB; font-size: 15px;">الأسماك المصطادة: <span id="fishScore">0</span> / 10</div>
                    <div class="hud-lives" id="fishLives" style="font-weight: bold; color: #E53935; font-size: 15px;">❤️❤️❤️</div>
                </div>
                <div class="canvas-container" style="position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.15); border: 4px solid #FFF;">
                    <canvas id="fishCanvas" width="400" height="450" style="display: block; background: #E0F7FA; touch-action: none; cursor: pointer;"></canvas>
                </div>
                <div id="fishSuccessModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-size: 24px; margin-bottom: 10px;">🎉 صياد ماهر! 🎉</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد جمعت 10 أسماك ملونة رائعة!</p>
                        <button class="menu-btn restart-btn" id="restartFishWin" style="background: #4CAF50; color: #FFF; border: none; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #388E3C; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
                <div id="fishFailModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid #E53935; margin: auto;">
                        <h3 style="color: #E53935; font-size: 24px; margin-bottom: 10px;">😢 حاول مرة أخرى! 😢</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">احذر من القنابل والنفايات في قاع البحر!</p>
                        <button class="menu-btn restart-btn" id="restartFishFail" style="background: #E53935; color: #FFF; border: none; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #C62828; transition: transform 0.1s;">أعد المحاولة 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const canvas = document.getElementById('fishCanvas');
        const ctx = canvas.getContext('2d');

        const fishTemplates = [
            { char: '🐟', type: 'fish', points: 1, size: 34 },
            { char: '🐠', type: 'fish', points: 1, size: 34 },
            { char: '🐙', type: 'fish', points: 1, size: 36 }
        ];

        const junkTemplates = [
            { char: '💣', type: 'junk', size: 32 }, // bomb SVG exists
            { char: '🥾', type: 'junk', size: 30 },
            { char: '🥫', type: 'junk', size: 28 }
        ];

        const allTemplates = [...fishTemplates, ...junkTemplates];

        // Cache SVGs
        const imageCache = {};
        allTemplates.forEach(item => {
            const img = new Image();
            img.src = window.getEmojiSVG(item.char);
            imageCache[item.char] = img;
        });

        // Boat Emoji (26f5.svg exists)
        const boatImg = new Image();
        boatImg.src = window.getEmojiSVG('⛵');

        // Game objects
        let seaItems = [];
        let bubbles = [];
        
        // Hook state
        // states: 'swinging', 'dropping', 'reeling', 'caught'
        let hookState = 'swinging'; 
        let hookPos = { x: canvas.width / 2, y: 55 };
        let hookSpeed = 4.5;
        let caughtItem = null;

        // Generate water bubbles
        for (let i = 0; i < 15; i++) {
            bubbles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height - 80) + 80,
                size: Math.random() * 4 + 2,
                speed: Math.random() * 0.4 + 0.2
            });
        }

        function spawnSeaItem() {
            const isJunk = Math.random() < 0.3; // 30% chance of junk/bomb
            const templates = isJunk ? junkTemplates : fishTemplates;
            const template = templates[Math.floor(Math.random() * templates.length)];
            const fromLeft = Math.random() < 0.5;

            return {
                x: fromLeft ? -40 : canvas.width + 40,
                y: Math.random() * 260 + 130, // Between y=130 and y=390 (deep water)
                size: template.size,
                char: template.char,
                type: template.type,
                speed: (Math.random() * 1.0 + 0.8) * (fromLeft ? 1 : -1),
                wobbleSpeed: Math.random() * 0.03 + 0.015,
                wobbleAmplitude: Math.random() * 0.8 + 0.4
            };
        }

        // Spawn initial items
        for (let i = 0; i < 5; i++) {
            seaItems.push(spawnSeaItem());
        }
        let lastItemSpawn = 0;

        function update(timestamp) {
            if (!gameActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Water Gradient Background
            let waterGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            waterGrad.addColorStop(0, '#E0F7FA'); // Very light blue at top
            waterGrad.addColorStop(0.18, '#80DEEA');
            waterGrad.addColorStop(0.5, '#26C6DA'); // Medium blue
            waterGrad.addColorStop(1, '#00838F'); // Deep dark teal/blue at bottom
            ctx.fillStyle = waterGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Sandy Floor
            ctx.fillStyle = '#FFE082';
            ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

            // Update & Draw Bubbles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            bubbles.forEach(b => {
                b.y -= b.speed;
                if (b.y < 80) {
                    b.y = canvas.height - 30;
                    b.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Spawn sea items over time
            if (timestamp - lastItemSpawn > 2000 && seaItems.length < 7) {
                seaItems.push(spawnSeaItem());
                lastItemSpawn = timestamp;
            }

            // Update & Draw Swimming Fish and Junk
            for (let i = seaItems.length - 1; i >= 0; i--) {
                const item = seaItems[i];

                if (caughtItem === item) {
                    // Update caught item position to follow hook
                    item.x = hookPos.x;
                    item.y = hookPos.y + 15;
                } else {
                    // Normal swim movement
                    item.x += item.speed;
                    item.y += Math.sin(timestamp * item.wobbleSpeed) * item.wobbleAmplitude;

                    // Remove if off-screen
                    if ((item.speed > 0 && item.x > canvas.width + 50) || (item.speed < 0 && item.x < -50)) {
                        seaItems.splice(i, 1);
                        continue;
                    }
                }

                // Render item
                ctx.save();
                ctx.translate(item.x, item.y);
                // Flip fish horizontally based on direction (only if swimming)
                if (caughtItem !== item && item.speed > 0 && item.type === 'fish') {
                    ctx.scale(-1, 1);
                }
                
                // Rotated drawing for caught item
                if (caughtItem === item) {
                    ctx.rotate(Math.PI / 2); // Hang head-downwards
                }

                const img = imageCache[item.char];
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, -item.size / 2, -item.size / 2, item.size, item.size);
                } else {
                    ctx.font = `${item.size}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.char, 0, 0);
                }
                ctx.restore();
            }

            // Hook state updates
            if (hookState === 'swinging') {
                // Hook swings back and forth at the surface
                hookPos.x = canvas.width / 2 + Math.sin(timestamp * 0.0018) * 135;
                hookPos.y = 55;
            } else if (hookState === 'dropping') {
                hookPos.y += hookSpeed;

                // Hit bottom boundary
                if (hookPos.y > canvas.height - 45) {
                    hookState = 'reeling';
                }

                // Collision detection with fish or junk
                for (let i = 0; i < seaItems.length; i++) {
                    const item = seaItems[i];
                    if (caughtItem) continue;

                    const dx = hookPos.x - item.x;
                    const dy = (hookPos.y + 10) - item.y; // collision point near hook tip
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < (item.size / 2 + 8)) {
                        // Caught!
                        caughtItem = item;
                        hookState = 'reeling';
                        
                        if (window.sound) {
                            if (item.type === 'fish') {
                                window.sound.playBubble();
                            } else {
                                window.sound.playFail();
                            }
                        }
                        break;
                    }
                }
            } else if (hookState === 'reeling') {
                // Reel up speed: slower if carrying heavy junk/bomb
                const speedMod = (caughtItem && caughtItem.type === 'junk') ? 2.0 : 4.0;
                hookPos.y -= speedMod;

                // Reached the boat
                if (hookPos.y <= 55) {
                    hookPos.y = 55;
                    hookState = 'swinging';

                    if (caughtItem) {
                        if (caughtItem.type === 'fish') {
                            score++;
                            document.getElementById('fishScore').innerText = score;
                            if (window.sound) {
                                window.sound.playSuccess();
                            }
                            if (score >= targetScore) {
                                winGame();
                            }
                        } else {
                            lives--;
                            updateLives();
                            flashScreenRed();
                            if (lives <= 0) {
                                failGame();
                            }
                        }
                        
                        // Remove caught item
                        seaItems = seaItems.filter(item => item !== caughtItem);
                        caughtItem = null;
                    }
                }
            }

            // Draw Fishing Line (thin grey/white string)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(hookPos.x, 35); // boat position
            ctx.lineTo(hookPos.x, hookPos.y);
            ctx.stroke();

            // Draw Hook (metal grey curves)
            ctx.strokeStyle = '#78909C';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(hookPos.x, hookPos.y);
            ctx.lineTo(hookPos.x, hookPos.y + 12);
            ctx.arc(hookPos.x - 4, hookPos.y + 12, 4, 0, Math.PI);
            ctx.lineTo(hookPos.x - 8, hookPos.y + 8); // barb
            ctx.stroke();

            // Draw Boat at the surface
            ctx.save();
            ctx.translate(hookPos.x, 26);
            if (boatImg && boatImg.complete && boatImg.naturalWidth !== 0) {
                // Draw sailboat emoji
                ctx.drawImage(boatImg, -20, -20, 40, 40);
            } else {
                ctx.font = '36px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⛵', 0, 0);
            }
            ctx.restore();

            animationId = requestAnimationFrame(update);
        }

        function updateLives() {
            let heartStr = '';
            for (let i = 0; i < lives; i++) heartStr += '❤️';
            for (let i = lives; i < 3; i++) heartStr += '🖤';
            document.getElementById('fishLives').innerText = heartStr;
        }

        function flashScreenRed() {
            canvas.classList.add('shake-anim');
            setTimeout(() => canvas.classList.remove('shake-anim'), 500);
        }

        function winGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playSuccess();
            }
            document.getElementById('fishSuccessModal').style.display = 'flex';
        }

        function failGame() {
            gameActive = false;
            cancelAnimationFrame(animationId);
            if (window.sound) {
                window.sound.playFail();
            }
            document.getElementById('fishFailModal').style.display = 'flex';
        }

        function resetGame() {
            score = 0;
            lives = 3;
            seaItems = [];
            caughtItem = null;
            hookState = 'swinging';
            
            document.getElementById('fishScore').innerText = score;
            updateLives();
            document.getElementById('fishSuccessModal').style.display = 'none';
            document.getElementById('fishFailModal').style.display = 'none';
            
            gameActive = true;
            // Spawn initial items
            for (let i = 0; i < 5; i++) {
                seaItems.push(spawnSeaItem());
            }
            lastItemSpawn = performance.now();
            update(lastItemSpawn);
        }

        function dropHook() {
            if (!gameActive) return;
            if (hookState === 'swinging') {
                hookState = 'dropping';
                if (window.sound) {
                    window.sound.playClick();
                }
            }
        }

        // Click/Touch to drop hook
        canvas.addEventListener('mousedown', dropHook);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            dropHook();
        });

        // Modal buttons
        document.getElementById('restartFishWin').addEventListener('click', resetGame);
        document.getElementById('restartFishFail').addEventListener('click', resetGame);

        // Start
        resetGame();

        // Clean up on exit
        container.addEventListener('game-exit', () => {
            gameActive = false;
            cancelAnimationFrame(animationId);
        });
    };
})();
