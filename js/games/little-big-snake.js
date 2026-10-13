// لعبة الثعبان الكبير واللطيف - Little Big Snake
(function() {
    window.initLittleBigSnakeGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .snake-game-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
            }
            .snake-logo-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-bottom: 6px;
            }
            .snake-hud {
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
            .snake-hud span {
                font-weight: bold;
                font-size: 15px;
            }
            .snake-canvas-container {
                width: 100%;
                height: 400px;
                position: relative;
                border-radius: 20px;
                overflow: hidden;
                border: 3px solid #81C784;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                background: #111;
            }
            canvas {
                width: 100%;
                height: 100%;
                display: block;
                touch-action: none;
            }
            .speed-btn {
                position: absolute;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.35);
                border: 3px solid #81C784;
                border-radius: 50%;
                color: #FFF;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                backdrop-filter: blur(5px);
                z-index: 100;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            .speed-btn:active {
                background: rgba(129, 199, 132, 0.75);
                transform: scale(0.95);
            }
            .respawn-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.75);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: #FFF;
            }
            .respawn-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #81C784;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                width: 80%;
                max-width: 280px;
                color: #333;
            }
            .respawn-card h3 {
                color: #C62828;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .respawn-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Elements Creation
        const layout = document.createElement('div');
        layout.className = 'snake-game-layout';
        container.appendChild(layout);

        // Beautiful SVG Logo Header
        const logoContainer = document.createElement('div');
        logoContainer.className = 'snake-logo-container';
        logoContainer.innerHTML = `
            <svg viewBox="0 0 320 60" style="width: 100%; max-width: 320px; height: auto;">
                <!-- Cute Snake Body behind/above text -->
                <path d="M 20,30 Q 40,10 70,22 T 130,32 T 190,20 T 250,32 T 290,22" fill="none" stroke="#81C784" stroke-width="8" stroke-linecap="round" />
                <path d="M 20,30 Q 40,10 70,22 T 130,32 T 190,20 T 250,32 T 290,22" fill="none" stroke="#4CAF50" stroke-width="4" stroke-linecap="round" />
                <!-- Snake Head on the right -->
                <circle cx="290" cy="22" r="8" fill="#4CAF50" />
                <!-- Cute Eyes on Head -->
                <circle cx="288" cy="20" r="2" fill="#FFF" />
                <circle cx="288" cy="20" r="0.8" fill="#000" />
                <circle cx="292" cy="22" r="2" fill="#FFF" />
                <circle cx="292" cy="22" r="0.8" fill="#000" />
                <!-- Tongue -->
                <path d="M 298,22 Q 303,20 306,22 M 298,22 Q 303,24 306,22" fill="none" stroke="#FF5252" stroke-width="1.5" />
                <!-- Text with thick outline -->
                <text x="150" y="44" font-family="'Fredoka One', 'Tajawal', sans-serif" font-size="20" font-weight="900" text-anchor="middle" fill="#2E7D32" stroke="#FFF" stroke-width="4" paint-order="stroke fill">الثعبان الكبير 🐍</text>
            </svg>
        `;
        layout.appendChild(logoContainer);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'المس واسحب إصبعك في أي مكان على الشاشة لتوجيه الثعبان! تجنب البوتات والحدود!';
        instr.style.cssText = 'margin-bottom:8px; width:100%;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'snake-hud';
        layout.appendChild(hud);

        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#2E7D32';
        scoreSpan.innerText = 'النقاط: 0';
        const lengthSpan = document.createElement('span');
        lengthSpan.style.color = '#1565C0';
        lengthSpan.innerText = 'الطول: 5';
        hud.appendChild(scoreSpan);
        hud.appendChild(lengthSpan);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'snake-canvas-container';
        layout.appendChild(canvasContainer);

        const canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);

        const speedBtn = document.createElement('div');
        speedBtn.className = 'speed-btn';
        speedBtn.innerText = '⚡';
        speedBtn.title = 'زيادة السرعة';
        canvasContainer.appendChild(speedBtn);

        const respawnOverlay = document.createElement('div');
        respawnOverlay.className = 'respawn-overlay';
        respawnOverlay.style.display = 'none';
        canvasContainer.appendChild(respawnOverlay);

        const respawnCard = document.createElement('div');
        respawnCard.className = 'respawn-card bounce-anim';
        respawnOverlay.appendChild(respawnCard);

        // Game Configuration
        const MAP_SIZE = 1600;
        let isGameRunning = true;
        let score = 0;
        let speedBoost = false;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;

        function resizeCanvas() {
            width = canvasContainer.clientWidth;
            height = canvasContainer.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // 3. Relative Virtual Joystick Steering Input
        let joystickActive = false;
        let joystickStartX = 0;
        let joystickStartY = 0;
        let joystickCurrentX = 0;
        let joystickCurrentY = 0;

        canvas.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touchX = e.clientX - rect.left;
            const touchY = e.clientY - rect.top;

            joystickActive = true;
            joystickStartX = touchX;
            joystickStartY = touchY;
            joystickCurrentX = touchX;
            joystickCurrentY = touchY;
        });

        canvas.addEventListener('pointermove', function(e) {
            if (!joystickActive) return;
            e.preventDefault();
            
            const rect = canvas.getBoundingClientRect();
            joystickCurrentX = e.clientX - rect.left;
            joystickCurrentY = e.clientY - rect.top;

            const dx = joystickCurrentX - joystickStartX;
            const dy = joystickCurrentY - joystickStartY;
            const dist = Math.hypot(dx, dy);

            // If dragged enough (deadzone), update snake's target angle
            if (dist > 8 && player) {
                player.targetAngle = Math.atan2(dy, dx);
            }
        });

        const handlePointerUp = () => {
            joystickActive = false;
            speedBoost = false;
        };
        window.addEventListener('pointerup', handlePointerUp);

        speedBtn.addEventListener('pointerdown', () => speedBoost = true);

        // Game Entities
        let player = null;
        let bots = [];
        let foods = [];

        class Snake {
            constructor(x, y, color, name, isBot = false) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.name = name;
                this.isBot = isBot;
                this.angle = Math.random() * Math.PI * 2;
                this.targetAngle = this.angle;
                this.speed = 2.8;
                this.size = 12;
                this.segments = [];
                for (let i = 0; i < 15; i++) {
                    this.segments.push({ x: x, y: y });
                }
                this.targetLength = 15;
                this.botTimer = 0;
                this.isDead = false;
            }

            update() {
                if (this.isDead) return;

                // Smooth turning limit
                let angleDiff = this.targetAngle - this.angle;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                this.angle += angleDiff * 0.12;

                // Adjust speed based on boost
                const currentSpeed = speedBoost && !this.isBot ? this.speed * 2 : this.speed;

                // Move Head
                this.x += Math.cos(this.angle) * currentSpeed;
                this.y += Math.sin(this.angle) * currentSpeed;

                // Keep in map bounds
                if (this.x < 10) this.x = 10;
                if (this.x > MAP_SIZE - 10) this.x = MAP_SIZE - 10;
                if (this.y < 10) this.y = 10;
                if (this.y > MAP_SIZE - 10) this.y = MAP_SIZE - 10;

                // Lead segment updating
                this.segments.unshift({ x: this.x, y: this.y });

                // Control snake segment length
                while (this.segments.length > this.targetLength) {
                    this.segments.pop();
                }

                // If Bot, update angle automatically
                if (this.isBot) {
                    this.botTimer--;
                    if (this.botTimer <= 0) {
                        this.targetAngle = Math.random() * Math.PI * 2;
                        this.botTimer = Math.floor(Math.random() * 80) + 40;
                    }
                }
            }

            draw(ctx, camX, camY) {
                if (this.isDead) return;

                // Draw segments from tail to head
                ctx.save();
                for (let i = this.segments.length - 1; i >= 0; i--) {
                    const seg = this.segments[i];
                    const screenX = seg.x - camX + width / 2;
                    const screenY = seg.y - camY + height / 2;

                    // Skip drawing if offscreen
                    if (screenX < -50 || screenX > width + 50 || screenY < -50 || screenY > height + 50) {
                        continue;
                    }

                    // Size decreases slightly towards tail
                    const r = this.size * (1 - (i / this.segments.length) * 0.45);

                    // Body Segment fill
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
                    const grad = ctx.createRadialGradient(screenX - r/3, screenY - r/3, r*0.1, screenX, screenY, r);
                    grad.addColorStop(0, '#FFF');
                    grad.addColorStop(0.3, this.color);
                    grad.addColorStop(1, getDarkerColor(this.color));
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Outline
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1.8;
                    ctx.stroke();
                }

                // Draw Head Eyes & Expression
                const head = this.segments[0];
                const headX = head.x - camX + width / 2;
                const headY = head.y - camY + height / 2;

                // Eye 1 & 2 relative offset based on angle
                const eyeOffsetAngle = 0.5; // Offset angle
                const eyeDist = this.size * 0.7;
                
                const eye1X = headX + Math.cos(this.angle - eyeOffsetAngle) * eyeDist;
                const eye1Y = headY + Math.sin(this.angle - eyeOffsetAngle) * eyeDist;
                const eye2X = headX + Math.cos(this.angle + eyeOffsetAngle) * eyeDist;
                const eye2Y = headY + Math.sin(this.angle + eyeOffsetAngle) * eyeDist;

                // White of eyes
                ctx.beginPath();
                ctx.arc(eye1X, eye1Y, this.size * 0.4, 0, Math.PI * 2);
                ctx.arc(eye2X, eye2Y, this.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFF';
                ctx.fill();
                ctx.stroke();

                // Black pupils
                const pupilOffsetAngle = this.angle;
                const pupilDist = this.size * 0.15;
                ctx.beginPath();
                ctx.arc(eye1X + Math.cos(pupilOffsetAngle) * pupilDist, eye1Y + Math.sin(pupilOffsetAngle) * pupilDist, this.size * 0.2, 0, Math.PI * 2);
                ctx.arc(eye2X + Math.cos(pupilOffsetAngle) * pupilDist, eye2Y + Math.sin(pupilOffsetAngle) * pupilDist, this.size * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();

                // Draw Name
                ctx.fillStyle = this.isBot ? 'rgba(255,255,255,0.7)' : '#FFF';
                ctx.font = 'bold 11px Fredoka, Tajawal';
                ctx.textAlign = 'center';
                ctx.fillText(this.name, headX, headY - this.size * 1.6);

                ctx.restore();
            }

            checkCollision(otherSnake) {
                if (this.isDead || otherSnake.isDead || this === otherSnake) return false;

                const head = this.segments[0];
                const startIndex = 0;

                for (let i = startIndex; i < otherSnake.segments.length; i++) {
                    const seg = otherSnake.segments[i];
                    const dist = Math.hypot(head.x - seg.x, head.y - seg.y);
                    const threshold = this.size + otherSnake.size * 0.8;
                    if (dist < threshold) {
                        return true;
                    }
                }
                return false;
            }

            explode() {
                this.isDead = true;
                // Turn segments into food
                for (let i = 0; i < this.segments.length; i += 2) {
                    const seg = this.segments[i];
                    foods.push({
                        x: seg.x + (Math.random() - 0.5) * 15,
                        y: seg.y + (Math.random() - 0.5) * 15,
                        val: 2,
                        size: Math.random() * 3 + 4,
                        color: getRandomColor()
                    });
                }
            }
        }

        // Color Helpers
        function getDarkerColor(hex) {
            const darks = {
                '#FF5252': '#C62828',
                '#EC407A': '#AD1457',
                '#AB47BC': '#6A1B9A',
                '#2196F3': '#0D47A1',
                '#00E676': '#00A152',
                '#FFEB3B': '#FBC02D',
                '#FF9100': '#D84315'
            };
            return darks[hex] || '#333';
        }

        function getRandomColor() {
            const colors = ['#FF5252', '#EC407A', '#AB47BC', '#2196F3', '#00E676', '#FFEB3B', '#FF9100'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        const botNames = ['سريع ⚡', 'روبوت 🤖', 'ماكر 🦊', 'رعد ⚡', 'نحلة 🐝', 'لطيف 🧸', 'بطل 🏆'];

        function initEntities() {
            // Reset player
            player = new Snake(MAP_SIZE / 2, MAP_SIZE / 2, '#2196F3', 'أنت 👑');

            // Reset bots
            bots = [];
            for (let i = 0; i < 7; i++) {
                spawnBot();
            }

            // Spawn Food
            foods = [];
            for (let i = 0; i < 80; i++) {
                spawnFood();
            }
        }

        function spawnBot() {
            const x = Math.random() * (MAP_SIZE - 200) + 100;
            const y = Math.random() * (MAP_SIZE - 200) + 100;
            const color = getRandomColor();
            const name = botNames[Math.floor(Math.random() * botNames.length)];
            bots.push(new Snake(x, y, color, name, true));
        }

        function spawnFood() {
            foods.push({
                x: Math.random() * MAP_SIZE,
                y: Math.random() * MAP_SIZE,
                val: 1,
                size: Math.random() * 2 + 3.5,
                color: getRandomColor()
            });
        }

        // Gameplay Loop
        function gameLoop() {
            if (!isGameRunning) return;

            // 1. UPDATE PLAYER
            if (!player.isDead) {
                player.update();

                // Eat food check
                for (let i = foods.length - 1; i >= 0; i--) {
                    const f = foods[i];
                    const dist = Math.hypot(player.x - f.x, player.y - f.y);
                    if (dist < player.size + f.size) {
                        // Eat!
                        player.targetLength += f.val * 0.4;
                        score += f.val * 10;
                        scoreSpan.innerText = `النقاط: ${score}`;
                        lengthSpan.innerText = `الطول: ${Math.floor(player.targetLength)}`;
                        
                        if (window.sound) window.sound.playClick();
                        
                        foods.splice(i, 1);
                        spawnFood();
                    }
                }

                // Check boundary crash
                if (player.x <= 12 || player.x >= MAP_SIZE - 12 || player.y <= 12 || player.y >= MAP_SIZE - 12) {
                    playerDeath();
                }
            }

            // Camera smoothly follows player
            const camX = player.x;
            const camY = player.y;

            // 2. UPDATE BOTS
            bots.forEach(bot => {
                bot.update();

                // Eat food
                for (let i = foods.length - 1; i >= 0; i--) {
                    const f = foods[i];
                    const dist = Math.hypot(bot.x - f.x, bot.y - f.y);
                    if (dist < bot.size + f.size) {
                        bot.targetLength += f.val * 0.3;
                        foods.splice(i, 1);
                        spawnFood();
                    }
                }

                // Bot crash bounds
                if (bot.x <= 12 || bot.x >= MAP_SIZE - 12 || bot.y <= 12 || bot.y >= MAP_SIZE - 12) {
                    bot.explode();
                }
            });

            // Clean dead bots
            for (let i = bots.length - 1; i >= 0; i--) {
                if (bots[i].isDead) {
                    bots.splice(i, 1);
                    spawnBot();
                }
            }

            // 3. COLLISION CHECKS (HEAD TO BODY)
            if (!player.isDead) {
                // Check if player crashes into any bot
                for (let bot of bots) {
                    if (player.checkCollision(bot)) {
                        playerDeath();
                        break;
                    }
                }
            }

            // Check if bots crash into player, or bots crash into each other
            bots.forEach(bot => {
                // Hits player?
                if (!player.isDead && bot.checkCollision(player)) {
                    bot.explode();
                    if (window.sound) window.sound.playBubble();
                    score += 50; // Bonus for killing bot
                    scoreSpan.innerText = `النقاط: ${score}`;
                    return;
                }

                // Hits other bot?
                for (let otherBot of bots) {
                    if (bot.checkCollision(otherBot)) {
                        bot.explode();
                        break;
                    }
                }
            });

            // 4. DRAW EVERYTHING
            ctx.clearRect(0, 0, width, height);

            // Draw grid lines relative to camera
            ctx.save();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            const gridSize = 80;
            const startGridX = Math.floor((camX - width / 2) / gridSize) * gridSize;
            const startGridY = Math.floor((camY - height / 2) / gridSize) * gridSize;

            // Vertical grid lines
            for (let x = startGridX; x < camX + width / 2 + gridSize; x += gridSize) {
                const screenX = x - camX + width / 2;
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, height);
                ctx.stroke();
            }

            // Horizontal grid lines
            for (let y = startGridY; y < camY + height / 2 + gridSize; y += gridSize) {
                const screenY = y - camY + height / 2;
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(width, screenY);
                ctx.stroke();
            }

            // Draw MAP Arena borders
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 8;
            ctx.strokeRect(0 - camX + width / 2, 0 - camY + height / 2, MAP_SIZE, MAP_SIZE);
            ctx.restore();

            // Draw Foods
            foods.forEach(f => {
                const screenX = f.x - camX + width / 2;
                const screenY = f.y - camY + height / 2;

                if (screenX > -10 && screenX < width + 10 && screenY > -10 && screenY < height + 10) {
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, f.size, 0, Math.PI * 2);
                    ctx.fillStyle = f.color;
                    ctx.shadowColor = f.color;
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0; // reset
                }
            });

            // Draw Bots
            bots.forEach(bot => bot.draw(ctx, camX, camY));

            // Draw Player
            if (!player.isDead) {
                player.draw(ctx, camX, camY);
            }

            // Draw Virtual Steering Joystick if active
            if (joystickActive) {
                ctx.save();
                
                // Draw Base
                ctx.beginPath();
                ctx.arc(joystickStartX, joystickStartY, 40, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 3;
                ctx.fill();
                ctx.stroke();

                // Calculate capped stick coordinates
                const dx = joystickCurrentX - joystickStartX;
                const dy = joystickCurrentY - joystickStartY;
                const dist = Math.hypot(dx, dy);
                const maxDist = 40;
                let stickX = joystickStartX;
                let stickY = joystickStartY;

                if (dist > 0) {
                    const angle = Math.atan2(dy, dx);
                    const cappedDist = Math.min(dist, maxDist);
                    stickX = joystickStartX + Math.cos(angle) * cappedDist;
                    stickY = joystickStartY + Math.sin(angle) * cappedDist;
                }

                // Draw Handle
                ctx.beginPath();
                ctx.arc(stickX, stickY, 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(129, 199, 132, 0.7)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                
                ctx.restore();
            }

            // Request next frame
            requestAnimationFrame(gameLoop);
        }

        function playerDeath() {
            player.explode();
            if (window.sound) window.sound.playFail();

            // Show respawn screen
            respawnCard.innerHTML = `
                <h3>💥 اصطدمت بالثعبان! 💥</h3>
                <p>لقد خسرت. نقاطك: ${score}</p>
                <button class="menu-btn restart-btn" id="respawnBtn">العب مجدداً 🔄</button>
            `;
            respawnOverlay.style.display = 'flex';
            
            document.getElementById('respawnBtn').onclick = () => {
                respawnOverlay.style.display = 'none';
                score = 0;
                scoreSpan.innerText = 'النقاط: 0';
                lengthSpan.innerText = 'الطول: 5';
                initEntities();
            };
        }

        // Clean exit listener
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('pointerup', handlePointerUp);
        }, { once: true });

        // Start
        initEntities();
        gameLoop();
    };
})();
