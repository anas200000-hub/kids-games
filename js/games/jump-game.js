// Super Mario style Kids Jump Game
// Canvas-based platform running and jumping game with 5 levels and 3 lives

(function() {
    window.initJumpGame = function(container) {
        container.innerHTML = "";

        // Game state variables
        let level = 1;
        let score = 0;
        let lives = 5;
        let timeRemaining = 30; // 30 seconds per level
        let gameActive = false;
        let gameTimerInterval = null;
        let animationFrameId = null;

        // Colors for levels - all beautiful light blue / cyan sky variants
        const levelThemes = [
            { sky: "#80D8FF", ground: "#81C784", name: "المرحلة الأولى: حديقة المغامرات" },
            { sky: "#90CAF9", ground: "#AED581", name: "المرحلة الثانية: الوادي الأخضر" },
            { sky: "#81D4FA", ground: "#D4E157", name: "المرحلة الثالثة: السماء الزرقاء" },
            { sky: "#E0F7FA", ground: "#FFD54F", name: "المرحلة الرابعة: شروق الشمس" },
            { sky: "#B3E5FC", ground: "#FF8A65", name: "المرحلة الخامسة: أرض الأحلام" }
        ];

        // Container structure with 50px top margin to avoid Home button overlap
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.position = "relative";
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "400px";
        wrapper.style.margin = "50px auto 0 auto";
        container.appendChild(wrapper);

        // Header controls (Level, Lives, Timer, Score)
        const header = document.createElement("div");
        header.style.width = "100%";
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "10px";
        header.style.padding = "5px 10px";
        header.style.background = "#FFF";
        header.style.borderRadius = "12px";
        header.style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)";
        header.style.boxSizing = "border-box";
        wrapper.appendChild(header);

        const levelInfo = document.createElement("div");
        levelInfo.style.fontSize = "14px";
        levelInfo.style.fontWeight = "bold";
        levelInfo.style.color = "#311B92";
        levelInfo.style.flex = "1";
        levelInfo.style.textAlign = "center";
        header.appendChild(levelInfo);

        const livesInfo = document.createElement("div");
        livesInfo.style.fontSize = "16px";
        livesInfo.style.flex = "1";
        livesInfo.style.textAlign = "center";
        header.appendChild(livesInfo);

        const timerInfo = document.createElement("div");
        timerInfo.style.fontSize = "14px";
        timerInfo.style.fontWeight = "bold";
        timerInfo.style.color = "#D84315";
        timerInfo.style.flex = "1";
        timerInfo.style.textAlign = "center";
        header.appendChild(timerInfo);

        const scoreInfo = document.createElement("div");
        scoreInfo.style.fontSize = "14px";
        scoreInfo.style.fontWeight = "bold";
        scoreInfo.style.color = "#2E7D32";
        scoreInfo.style.flex = "1";
        scoreInfo.style.textAlign = "center";
        header.appendChild(scoreInfo);

        // Canvas element
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 500;
        canvas.style.borderRadius = "16px";
        canvas.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
        canvas.style.cursor = "pointer";
        canvas.style.background = "#FFF";
        canvas.style.display = "block";
        wrapper.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        // Game Instructions Label
        const instr = document.createElement("div");
        instr.innerText = "اضغط على الشاشة للقفز وتجنب العقبات! 🏃‍♂️💨";
        instr.style.marginTop = "10px";
        instr.style.fontSize = "14px";
        instr.style.color = "#555";
        instr.style.fontWeight = "bold";
        wrapper.appendChild(instr);

        // Restart button
        const restartBtn = document.createElement("button");
        restartBtn.className = "menu-btn restart-btn";
        restartBtn.innerText = "إعادة اللعب 🔄";
        restartBtn.style.marginTop = "10px";
        restartBtn.style.padding = "8px 16px";
        restartBtn.style.fontSize = "14px";
        restartBtn.style.background = "#FF9800";
        restartBtn.style.color = "#FFF";
        restartBtn.style.border = "none";
        restartBtn.style.borderRadius = "20px";
        restartBtn.style.cursor = "pointer";
        restartBtn.style.boxShadow = "0 3px 6px rgba(0,0,0,0.15)";
        restartBtn.addEventListener("click", () => {
            if (window.sound) window.sound.playClick();
            // Clear any modal if present
            const modals = wrapper.querySelectorAll(".game-modal");
            modals.forEach(m => m.remove());
            // Reset state
            level = 1;
            score = 0;
            lives = 5;
            startLevel();
        });
        wrapper.appendChild(restartBtn);

        // Physics constants
        const groundY = canvas.height - 60;
        const gravity = 0.52;

        // Game Objects
        const player = {
            x: 40,
            y: groundY,
            vy: 0,
            width: 25,
            height: 45,
            isGrounded: true,
            jumpForce: -12.5,
            invincible: 0, // flashing timer
            runFrame: 0
        };

        let obstacles = [];
        let coins = [];
        let bgClouds = [
            { x: 50, y: 40, size: 20 },
            { x: 180, y: 60, size: 15 },
            { x: 280, y: 30, size: 25 }
        ];

        // Start level parameters
        function getLevelSpeed() {
            return 1.5 + level * 0.4;
        }

        // Tap to jump
        function handleJump(e) {
            if (e) {
                // Ignore clicks on buttons (like restartBtn or level navigation buttons)
                if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === "button") return;
                e.preventDefault();
            }
            if (!gameActive) return;

            if (player.isGrounded) {
                player.vy = player.jumpForce;
                player.isGrounded = false;
                if (window.sound) window.sound.playClick();
            }
        }

        // Attach to wrapper instead of canvas to trigger jump from anywhere on screen
        wrapper.addEventListener("pointerdown", handleJump);

        // Update levels parameters
        function spawnObstacle() {
            if (!gameActive) return;
            // Spacing depends on speed
            const minSpacing = 160;
            const lastObstacle = obstacles[obstacles.length - 1];
            if (!lastObstacle || (canvas.width - lastObstacle.x > minSpacing + Math.random() * 100)) {
                // Different shapes
                const type = Math.random() > 0.5 ? "spike" : "box";
                obstacles.push({
                    x: canvas.width + 20,
                    y: groundY,
                    width: type === "spike" ? 18 : 16,
                    height: type === "spike" ? 22 : 18,
                    type: type,
                    color: type === "spike" ? "#D50000" : "#E65100"
                });
            }
        }

        function spawnCoin() {
            if (!gameActive) return;
            const minSpacing = 120;
            const lastCoin = coins[coins.length - 1];
            if (!lastCoin || (canvas.width - lastCoin.x > minSpacing + Math.random() * 80)) {
                // Height can be high or low
                const heightChoice = Math.random() > 0.4 ? groundY - 45 : groundY - 80;
                coins.push({
                    x: canvas.width + 20,
                    y: heightChoice,
                    width: 14,
                    height: 14,
                    collected: false
                });
            }
        }

        function updateUI() {
            levelInfo.innerText = `المرحلة: ${level}/5`;
            livesInfo.innerText = "❤️".repeat(lives) + "🖤".repeat(5 - lives);
            timerInfo.innerText = `الوقت: ${timeRemaining}ث`;
            scoreInfo.innerText = `النقاط: ${score}`;
        }

        // Timer interval
        function startTimer() {
            clearInterval(gameTimerInterval);
            gameTimerInterval = setInterval(() => {
                if (!gameActive) return;
                timeRemaining--;
                updateUI();

                if (timeRemaining <= 0) {
                    // Level cleared!
                    clearInterval(gameTimerInterval);
                    levelCleared();
                }
            }, 1000);
        }

        function levelCleared() {
            gameActive = false;
            cancelAnimationFrame(animationFrameId);

            if (window.sound) window.sound.playSuccess();

            if (level >= 5) {
                showVictory();
            } else {
                showLevelTransition();
            }
        }

        function showLevelTransition() {
            const modal = document.createElement("div");
            modal.className = "game-modal show";

            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 22px;">تم اجتياز المرحلة ${level}! 🎉</h3>
                    <p style="color: #666; margin: 0 0 20px 0; font-size: 15px;">استعد للمرحلة التالية بسرعة أكبر!</p>
                    <button class="menu-btn" style="background:#4CAF50; color:#FFF; border:none; padding:10px 20px; font-size:16px; border-radius:25px; cursor:pointer;">ابدأ المرحلة ${level+1} ➡️</button>
                </div>
            `;

            modal.querySelector("button").addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                modal.remove();
                level++;
                startLevel();
            });

            wrapper.appendChild(modal);
        }

        function showVictory() {
            const modal = document.createElement("div");
            modal.className = "game-modal show";

            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="color: #FFD700; margin: 0 0 10px 0; font-size: 24px;">بطل المغامرة! 🏆</h3>
                    <p style="color: #555; margin: 0 0 10px 0; font-size: 16px;">لقد فزت بجميع المراحل الخمسة!</p>
                    <p style="color: #2E7D32; font-weight: bold; font-size: 18px; margin: 0 0 20px 0;">نقاطك النهائية: ${score}</p>
                    <button class="menu-btn restart-btn" style="background:#7C4DFF; color:#FFF; border:none; padding:10px 20px; font-size:16px; border-radius:25px; cursor:pointer;">العب مجدداً 🔄</button>
                </div>
            `;

            modal.querySelector("button").addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                modal.remove();
                level = 1;
                score = 0;
                lives = 5;
                startLevel();
            });

            wrapper.appendChild(modal);
        }

        function showGameOver() {
            gameActive = false;
            cancelAnimationFrame(animationFrameId);
            clearInterval(gameTimerInterval);

            if (window.sound) window.sound.playFail();

            const modal = document.createElement("div");
            modal.className = "game-modal show";

            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="color: #F44336; margin: 0 0 10px 0; font-size: 24px;">حاول مرة أخرى! 😢</h3>
                    <p style="color: #555; margin: 0 0 10px 0; font-size: 16px;">انتهت جميع أرواحك.</p>
                    <p style="color: #2E7D32; font-weight: bold; font-size: 16px; margin: 0 0 20px 0;">نقاطك: ${score}</p>
                    <button class="menu-btn restart-btn" style="background:#FF9800; color:#FFF; border:none; padding:10px 20px; font-size:16px; border-radius:25px; cursor:pointer;">إعادة المحاولة 🔄</button>
                </div>
            `;

            modal.querySelector("button").addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                modal.remove();
                level = 1;
                score = 0;
                lives = 5;
                startLevel();
            });

            wrapper.appendChild(modal);
        }

        function startLevel() {
            timeRemaining = 30;
            obstacles = [];
            coins = [];
            player.y = groundY;
            player.vy = 0;
            player.isGrounded = true;
            player.invincible = 0;
            gameActive = true;

            updateUI();
            startTimer();
            gameLoop();
        }

        // Core game loop
        function gameLoop() {
            if (!gameActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background sky
            const theme = levelThemes[level - 1];
            ctx.fillStyle = theme.sky;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Scroll & Draw Clouds
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            bgClouds.forEach(c => {
                c.x -= 0.5;
                if (c.x < -40) c.x = canvas.width + 40;
                
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.size, 0, Math.PI*2);
                ctx.arc(c.x + c.size*0.7, c.y - c.size*0.3, c.size*0.8, 0, Math.PI*2);
                ctx.arc(c.x - c.size*0.7, c.y - c.size*0.2, c.size*0.7, 0, Math.PI*2);
                ctx.fill();
            });

            // Draw Level Name Overlay at top left
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText(theme.name, 10, 20);

            // Draw Ground Platform
            ctx.fillStyle = theme.ground;
            ctx.fillRect(0, groundY, canvas.width, 10);
            ctx.fillStyle = "#8D6E63"; // dirt underneath
            ctx.fillRect(0, groundY + 10, canvas.width, canvas.height - groundY - 10);
            // Draw brick outline cracks on the dirt to look like classic Mario blocks!
            ctx.strokeStyle = "#5D4037";
            ctx.lineWidth = 1;
            for (let bx = 0; bx < canvas.width; bx += 40) {
                ctx.strokeRect(bx, groundY + 10, 40, 25);
                ctx.strokeRect(bx - 20, groundY + 35, 40, 25);
            }

            // Spawns
            spawnObstacle();
            spawnCoin();

            const speed = getLevelSpeed();

            // Handle player physics
            if (!player.isGrounded) {
                player.vy += gravity;
                player.y += player.vy;
                if (player.y >= groundY) {
                    player.y = groundY;
                    player.vy = 0;
                    player.isGrounded = true;
                }
            } else {
                // Running legs animation timer
                player.runFrame = Math.floor(Date.now() / 80) % 4;
            }

            // Invincible flicker timer
            if (player.invincible > 0) {
                player.invincible--;
            }

            // Draw obstacles
            obstacles.forEach((obs, idx) => {
                obs.x -= speed;

                // Draw based on level
                if (level === 1) {
                    if (obs.type === "spike") {
                        // Green spiky plant
                        ctx.fillStyle = "#2E7D32";
                        ctx.beginPath();
                        ctx.moveTo(obs.x, obs.y);
                        ctx.lineTo(obs.x + obs.width / 2, obs.y - obs.height);
                        ctx.lineTo(obs.x + obs.width, obs.y);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.fillStyle = "#FFD54F";
                        ctx.beginPath();
                        ctx.arc(obs.x + obs.width / 2, obs.y - obs.height, 4, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Green Mario Pipe
                        ctx.fillStyle = "#2E7D32";
                        ctx.fillRect(obs.x + 2, obs.y - obs.height, obs.width - 4, obs.height);
                        ctx.fillStyle = "#4CAF50";
                        ctx.fillRect(obs.x + 3, obs.y - obs.height, 3, obs.height);
                        
                        ctx.fillStyle = "#1B5E20";
                        ctx.strokeRect(obs.x, obs.y - obs.height, obs.width, 8);
                        ctx.fillStyle = "#4CAF50";
                        ctx.fillRect(obs.x + 1, obs.y - obs.height + 1, obs.width - 2, 6);
                    }
                } else if (level === 2) {
                    if (obs.type === "spike") {
                        // Goomba Mushroom
                        const cx = obs.x + obs.width / 2;
                        const cy = obs.y;
                        ctx.fillStyle = "#8D6E63"; // Brown cap
                        ctx.beginPath();
                        ctx.arc(cx, cy - 10, 9, Math.PI, 0);
                        ctx.fill();
                        // Stem
                        ctx.fillStyle = "#FFE082";
                        ctx.fillRect(cx - 3, cy - 10, 6, 10);
                        // Eyes
                        ctx.fillStyle = "#000";
                        ctx.fillRect(cx - 2, cy - 8, 1, 3);
                        ctx.fillRect(cx + 1, cy - 8, 1, 3);
                    } else {
                        // Yellow Question Block
                        ctx.fillStyle = "#FFB300";
                        ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        ctx.strokeStyle = "#E65100";
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        // Question mark "?"
                        ctx.fillStyle = "#FFF";
                        ctx.font = "bold 13px sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText("?", obs.x + obs.width / 2, obs.y - obs.height / 2);
                    }
                } else if (level === 3) {
                    if (obs.type === "spike") {
                        // Spiky Red Shell
                        const cx = obs.x + obs.width / 2;
                        const cy = obs.y;
                        ctx.fillStyle = "#E53935"; // Red shell
                        ctx.beginPath();
                        ctx.arc(cx, cy - 7, 8, Math.PI, 0);
                        ctx.fill();
                        ctx.fillRect(cx - 8, cy - 7, 16, 7);
                        // Spikes
                        ctx.fillStyle = "#FFF";
                        ctx.beginPath();
                        ctx.moveTo(cx - 5, cy - 7); ctx.lineTo(cx - 7, cy - 12); ctx.lineTo(cx - 2, cy - 7);
                        ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy - 15); ctx.lineTo(cx + 2, cy - 7);
                        ctx.moveTo(cx + 5, cy - 7); ctx.lineTo(cx + 7, cy - 12); ctx.lineTo(cx + 2, cy - 7);
                        ctx.fill();
                    } else {
                        // Cloud Block
                        ctx.fillStyle = "#FFF";
                        ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        ctx.strokeStyle = "#81D4FA";
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        // cloud detail puffs
                        ctx.fillStyle = "#FFF";
                        ctx.beginPath();
                        ctx.arc(obs.x + 3, obs.y - obs.height / 2, 4, 0, Math.PI * 2);
                        ctx.arc(obs.x + obs.width - 3, obs.y - obs.height / 2, 4, 0, Math.PI * 2);
                        ctx.arc(obs.x + obs.width / 2, obs.y - obs.height, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (level === 4) {
                    if (obs.type === "spike") {
                        // Desert Cactus
                        ctx.fillStyle = "#4CAF50";
                        ctx.fillRect(obs.x + 6, obs.y - obs.height, 6, obs.height); // main trunk
                        ctx.fillRect(obs.x, obs.y - obs.height + 6, 6, 4); // left arm joint
                        ctx.fillRect(obs.x, obs.y - obs.height + 1, 4, 6); // left arm up
                        ctx.fillRect(obs.x + 12, obs.y - obs.height + 10, 6, 4); // right arm joint
                        ctx.fillRect(obs.x + 14, obs.y - obs.height + 5, 4, 6); // right arm up
                    } else {
                        // Sandy Brick Block
                        ctx.fillStyle = "#FFE082";
                        ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        ctx.strokeStyle = "#FF8F00";
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        // Brick outlines
                        ctx.beginPath();
                        ctx.moveTo(obs.x, obs.y - obs.height / 2);
                        ctx.lineTo(obs.x + obs.width, obs.y - obs.height / 2);
                        ctx.moveTo(obs.x + obs.width / 2, obs.y - obs.height);
                        ctx.lineTo(obs.x + obs.width / 2, obs.y - obs.height / 2);
                        ctx.moveTo(obs.x + obs.width / 4, obs.y - obs.height / 2);
                        ctx.lineTo(obs.x + obs.width / 4, obs.y);
                        ctx.stroke();
                    }
                } else {
                    // Level 5
                    if (obs.type === "spike") {
                        // Fireball
                        const cx = obs.x + obs.width / 2;
                        const cy = obs.y - obs.height / 2;
                        ctx.fillStyle = "#FF5722";
                        ctx.beginPath();
                        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "#FFEB3B";
                        ctx.beginPath();
                        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Grey Castle Brick
                        ctx.fillStyle = "#B0BEC5";
                        ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        ctx.strokeStyle = "#37474F";
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(obs.x, obs.y - obs.height, obs.width, obs.height);
                        // Bolt points in corners
                        ctx.fillStyle = "#78909C";
                        ctx.beginPath();
                        ctx.arc(obs.x + 3, obs.y - obs.height + 3, 1, 0, Math.PI * 2);
                        ctx.arc(obs.x + obs.width - 3, obs.y - obs.height + 3, 1, 0, Math.PI * 2);
                        ctx.arc(obs.x + 3, obs.y - 3, 1, 0, Math.PI * 2);
                        ctx.arc(obs.x + obs.width - 3, obs.y - 3, 1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Check collision
                if (player.invincible === 0 && checkCollision(player, obs)) {
                    // Collision! Lose life
                    lives--;
                    player.invincible = 90; // invincibility frames (1.5s)
                    if (window.sound) window.sound.playFail();

                    // Snap player
                    player.y = groundY;
                    player.vy = 0;
                    player.isGrounded = true;

                    updateUI();

                    if (lives <= 0) {
                        showGameOver();
                    }
                }
            });

            // Clean offscreen obstacles
            obstacles = obstacles.filter(obs => obs.x > -30);

            // Draw coins
            coins.forEach(c => {
                c.x -= speed;

                if (!c.collected) {
                    // Yellow shiny coin
                    ctx.fillStyle = "#FFD54F";
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#FF8F00";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Star symbol inside
                    ctx.fillStyle = "#FFF";
                    ctx.font = "9px sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("★", c.x, c.y);

                    // Check collision
                    if (checkCollision(player, { x: c.x - c.width/2, y: c.y + c.height/2, width: c.width, height: c.height })) {
                        c.collected = true;
                        score += 10;
                        if (window.sound) window.sound.playPop();
                        updateUI();
                    }
                }
            });

            // Clean offscreen/collected coins
            coins = coins.filter(c => c.x > -20 && !c.collected);

            // Draw Player Character
            if (player.invincible === 0 || Math.floor(player.invincible / 5) % 2 === 0) {
                drawPlayer(player.x, player.y);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function drawPlayer(x, y) {
            // 1. Hair (back/side)
            ctx.fillStyle = "#5D4037"; // Brown hair
            ctx.beginPath();
            ctx.arc(x - 6, y - 36, 5, 0, Math.PI * 2);
            ctx.fill();

            // 2. Face (Skin tone)
            ctx.fillStyle = "#FFD54F"; // Peach/skin color
            ctx.beginPath();
            ctx.arc(x, y - 36, 11, 0, Math.PI * 2);
            ctx.fill();

            // 3. Nose (Big Mario nose)
            ctx.fillStyle = "#FFCA28";
            ctx.beginPath();
            ctx.arc(x + 8, y - 36, 4, 0, Math.PI * 2);
            ctx.fill();

            // 4. Eyes
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(x + 2, y - 39, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 5. Mustache (Mario signature!)
            ctx.fillStyle = "#3E2723"; // Dark brown mustache
            ctx.fillRect(x + 3, y - 35, 8, 3.5);
            ctx.beginPath();
            ctx.arc(x + 10, y - 33.5, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // 6. Mario Red Cap
            ctx.fillStyle = "#E53935"; // Red cap body
            ctx.beginPath();
            ctx.arc(x - 1, y - 41, 11, Math.PI, 0);
            ctx.fill();
            // cap visor pointing forward (right)
            ctx.fillRect(x - 2, y - 43, 16, 3.5);

            // Cap 'M' Badge
            ctx.fillStyle = "#FFF"; // White circle
            ctx.beginPath();
            ctx.arc(x + 1, y - 45, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#E53935"; // Red M
            ctx.font = "bold 5px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("M", x + 1, y - 45);

            // 7. Body - Red Shirt
            ctx.fillStyle = "#E53935"; // Red shirt
            ctx.fillRect(x - 8, y - 27, 16, 16);

            // 8. Blue Overalls (straps and pants)
            ctx.fillStyle = "#1E88E5"; // Blue overalls
            ctx.fillRect(x - 8, y - 21, 16, 10); // overalls pants part
            ctx.fillRect(x - 7, y - 27, 4, 6); // left strap
            ctx.fillRect(x + 3, y - 27, 4, 6); // right strap

            // Yellow buttons
            ctx.fillStyle = "#FFEB3B";
            ctx.beginPath();
            ctx.arc(x - 5, y - 22, 1.5, 0, Math.PI * 2);
            ctx.arc(x + 5, y - 22, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Hands (Skin color)
            ctx.fillStyle = "#FFD54F";
            ctx.beginPath();
            ctx.arc(x - 9, y - 18, 3, 0, Math.PI * 2);
            ctx.arc(x + 9, y - 18, 3, 0, Math.PI * 2);
            ctx.fill();

            // 9. Legs & Brown Shoes
            ctx.strokeStyle = "#1E88E5"; // blue pants legs
            ctx.lineWidth = 4;
            
            // Left shoe / right shoe color
            const shoeColor = "#5D4037"; // Brown shoes

            if (player.isGrounded) {
                const frame = player.runFrame;
                if (frame === 0) {
                    // Left leg forward, right leg back
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 11); ctx.lineTo(x - 10, y - 3);
                    ctx.moveTo(x + 4, y - 11); ctx.lineTo(x + 8, y - 3);
                    ctx.stroke();

                    // Shoes
                    ctx.fillStyle = shoeColor;
                    ctx.fillRect(x - 13, y - 3, 6, 4);
                    ctx.fillRect(x + 5, y - 3, 6, 4);
                } else if (frame === 1) {
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 11); ctx.lineTo(x - 4, y - 3);
                    ctx.moveTo(x + 4, y - 11); ctx.lineTo(x + 4, y - 3);
                    ctx.stroke();

                    // Shoes
                    ctx.fillStyle = shoeColor;
                    ctx.fillRect(x - 7, y - 3, 6, 4);
                    ctx.fillRect(x + 1, y - 3, 6, 4);
                } else if (frame === 2) {
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 11); ctx.lineTo(x + 2, y - 3);
                    ctx.moveTo(x + 4, y - 11); ctx.lineTo(x - 4, y - 3);
                    ctx.stroke();

                    // Shoes
                    ctx.fillStyle = shoeColor;
                    ctx.fillRect(x - 1, y - 3, 6, 4);
                    ctx.fillRect(x - 7, y - 3, 6, 4);
                } else {
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 11); ctx.lineTo(x - 2, y - 3);
                    ctx.moveTo(x + 4, y - 11); ctx.lineTo(x + 6, y - 3);
                    ctx.stroke();

                    // Shoes
                    ctx.fillStyle = shoeColor;
                    ctx.fillRect(x - 5, y - 3, 6, 4);
                    ctx.fillRect(x + 3, y - 3, 6, 4);
                }
            } else {
                // Jumping legs bent
                ctx.beginPath();
                ctx.moveTo(x - 4, y - 11); ctx.lineTo(x - 8, y - 5);
                ctx.moveTo(x + 4, y - 11); ctx.lineTo(x + 8, y - 5);
                ctx.stroke();

                ctx.fillStyle = shoeColor;
                ctx.fillRect(x - 11, y - 5, 6, 4);
                ctx.fillRect(x + 5, y - 5, 6, 4);
            }
        }

        // Standard bounding box collision check
        function checkCollision(p, obj) {
            // Player box
            const pxLeft = p.x - 10;
            const pxRight = p.x + 10;
            const pyTop = p.y - 45; // top of head
            const pyBottom = p.y;   // ground level feet

            // Object box
            const oxLeft = obj.x;
            const oxRight = obj.x + obj.width;
            const oyTop = obj.y - obj.height;
            const oyBottom = obj.y;

            return (pxLeft < oxRight &&
                    pxRight > oxLeft &&
                    pyTop < oyBottom &&
                    pyBottom > oyTop);
        }

        // Exiting cleanup
        container.addEventListener("game-exit", () => {
            gameActive = false;
            cancelAnimationFrame(animationFrameId);
            clearInterval(gameTimerInterval);
        }, { once: true });

        // First launch
        startLevel();
    };
})();
