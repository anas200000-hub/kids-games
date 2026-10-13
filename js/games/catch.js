// Game 6: Fruit Catcher (صيد الفواكه)
window.initCatchGame = function (container) {
    let score = 0;
    const targetScore = 15;
    let lives = 3;
    let gameActive = true;
    let animationId = null;

    let html = `
        <div class="game-catch-layout">
            <h2 class="game-title">🍎 صيد الفواكه 🍎</h2>
            <div class="game-hud">
                <div class="hud-score">الفواكه المصطادة: <span id="catchScore">0</span> / 15</div>
                <div class="hud-lives" id="catchLives">❤️❤️❤️</div>
            </div>
            <div class="canvas-container">
                <canvas id="catchCanvas" width="400" height="450"></canvas>
            </div>
            <div id="catchSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 رائع يا صياد الفواكه! 🎉</h3>
                    <p>لقد جمعت 15 حبة فاكهة طازجة ولذيذة!</p>
                    <button class="menu-btn restart-btn" id="restartCatchWin">العب مرة أخرى 🔄</button>
                </div>
            </div>
            <div id="catchFailModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>😢 حاول مرة أخرى! 😢</h3>
                    <p>لقد انتهت المحاولات بسبب القنابل أو الصخور!</p>
                    <button class="menu-btn restart-btn" id="restartCatchFail">أعد المحاولة 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const canvas = document.getElementById('catchCanvas');
    const ctx = canvas.getContext('2d');

    const fruits = [
        { char: '🍎', type: 'fruit' },
        { char: '🍊', type: 'fruit' },
        { char: '🍌', type: 'fruit' },
        { char: '🍓', type: 'fruit' }
    ];
    
    const obstacles = [
        { char: '💣', type: 'bomb' }
    ];

    const imageCache = {};
    const allChars = ['🍎', '🍊', '🍌', '🍓', '💣'];
    allChars.forEach(char => {
        const img = new Image();
        img.src = window.getEmojiSVG(char);
        imageCache[char] = img;
    });

    let items = [];
    let basket = {
        x: canvas.width / 2 - 40,
        y: canvas.height - 50,
        width: 80,
        height: 35
    };

    function spawnItem() {
        const isObstacle = Math.random() < 0.25; // 25% chance of spawning bomb/rock
        const list = isObstacle ? obstacles : fruits;
        const template = list[Math.floor(Math.random() * list.length)];
        
        return {
            x: Math.random() * (canvas.width - 40) + 20,
            y: -30,
            size: 32,
            char: template.char,
            type: template.type,
            speed: Math.random() * 2 + 1.8
        };
    }

    // Spawn first item
    items.push(spawnItem());
    let lastSpawnTime = 0;

    function update(timestamp) {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background graphics (clouds / grass)
        ctx.fillStyle = '#E0F7FA'; // sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grass at the bottom
        ctx.fillStyle = '#81C784';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

        // Spawn items over time
        if (timestamp - lastSpawnTime > 1500) {
            items.push(spawnItem());
            lastSpawnTime = timestamp;
        }

        // Draw Basket (cute wooden styling)
        ctx.fillStyle = '#8D6E63'; // Brown basket
        ctx.beginPath();
        ctx.roundRect(basket.x, basket.y, basket.width, basket.height, [0, 0, 15, 15]);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5D4037';
        ctx.stroke();

        // Draw basket weaving lines
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(basket.x + 20, basket.y);
        ctx.lineTo(basket.x + 20, basket.y + basket.height);
        ctx.moveTo(basket.x + 40, basket.y);
        ctx.lineTo(basket.x + 40, basket.y + basket.height);
        ctx.moveTo(basket.x + 60, basket.y);
        ctx.lineTo(basket.x + 60, basket.y + basket.height);
        ctx.moveTo(basket.x, basket.y + 12);
        ctx.lineTo(basket.x + basket.width, basket.y + 12);
        ctx.moveTo(basket.x, basket.y + 24);
        ctx.lineTo(basket.x + basket.width, basket.y + 24);
        ctx.stroke();

        // Update and draw items
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speed;

            // Draw SVG image item
            const img = imageCache[item.char];
            if (img && img.complete) {
                ctx.drawImage(img, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
            } else {
                ctx.font = `${item.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.char, item.x, item.y);
            }

            // Collision with bottom
            if (item.y > canvas.height + 20) {
                items.splice(i, 1);
                continue;
            }

            // Collision with basket
            if (
                item.y + item.size / 2 >= basket.y &&
                item.y - item.size / 2 <= basket.y + basket.height &&
                item.x >= basket.x &&
                item.x <= basket.x + basket.width
            ) {
                // Collided!
                if (item.type === 'fruit') {
                    score++;
                    document.getElementById('catchScore').innerText = score;
                    if (window.sound) {
                        window.sound.playBubble();
                    }
                    if (score >= targetScore) {
                        winGame();
                    }
                } else {
                    // Obstacle caught
                    lives--;
                    updateHearts();
                    if (window.sound) {
                        window.sound.playFail();
                    }
                    // Flash basket red or screen shake
                    flashBasketRed();
                    if (lives <= 0) {
                        failGame();
                    }
                }
                items.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(update);
    }

    function updateHearts() {
        let heartStr = '';
        for (let i = 0; i < lives; i++) heartStr += '❤️';
        for (let i = lives; i < 3; i++) heartStr += '🖤';
        document.getElementById('catchLives').innerText = heartStr;
    }

    function flashBasketRed() {
        const el = document.getElementById('catchCanvas');
        el.classList.add('shake-anim');
        setTimeout(() => el.classList.remove('shake-anim'), 500);
    }

    function winGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        if (window.sound) {
            window.sound.playSuccess();
        }
        document.getElementById('catchSuccessModal').classList.add('show');
    }

    function failGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        document.getElementById('catchFailModal').classList.add('show');
    }

    function resetGame() {
        score = 0;
        lives = 3;
        items = [];
        updateHearts();
        document.getElementById('catchScore').innerText = score;
        document.getElementById('catchSuccessModal').classList.remove('show');
        document.getElementById('catchFailModal').classList.remove('show');
        basket.x = canvas.width / 2 - 40;
        gameActive = true;
        lastSpawnTime = performance.now();
        update(lastSpawnTime);
    }

    // Move basket by tracking touch/mouse coordinate
    function moveBasket(clientX) {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
        
        // Center basket on cursor X
        basket.x = canvasX - basket.width / 2;
        
        // Clamp bounds
        if (basket.x < 0) basket.x = 0;
        if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
    }

    canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        moveBasket(e.touches[0].clientX);
    });

    document.getElementById('restartCatchWin').addEventListener('click', resetGame);
    document.getElementById('restartCatchFail').addEventListener('click', resetGame);

    // Start game loop
    resetGame();

    // Clean up animation on exit
    container.addEventListener('game-exit', () => {
        cancelAnimationFrame(animationId);
    });
};
