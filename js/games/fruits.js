// Game 20: Fruits Bubble Pop (فقاعات الفواكه)
window.initFruitsGame = function (container) {
    const fruitsList = [
        { emoji: '🍎', name: 'تفاح', color: '#FF3B30' },
        { emoji: '🍌', name: 'موز', color: '#FFCC00' },
        { emoji: '🍊', name: 'برتقال', color: '#FF9500' },
        { emoji: '🍓', name: 'فراولة', color: '#FF2D55' },
        { emoji: '🍇', name: 'عنب', color: '#AF52DE' },
        { emoji: '🍉', name: 'بطيخ', color: '#4CD964' },
        { emoji: '🍒', name: 'كرز', color: '#FF3B30' },
        { emoji: '🍍', name: 'أناناس', color: '#FFCC00' }
    ];

    let score = 0;
    const targetScore = 5;
    let activeFruit = null;
    let lockActions = false;

    let html = `
        <div class="game-fruits-bubble-layout">
            <h2 class="game-title">🍓 فقاعات الفواكه 🍓</h2>
            <div class="level-indicator">النقاط: <span id="fruitBubbleScore">0</span> / 5</div>
            <p class="game-instructions" id="fruitPrompt">أين الفراولة؟</p>

            <div class="fruit-bubble-stage">
                <div class="fruit-target-prompt" id="fruitTargetDisplay"></div>
            </div>

            <div class="fruit-bubble-choices" id="fruitBubbleChoices"></div>

            <div id="fruitSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا خبير الفواكه! 🎉</h3>
                    <p>لقد تعرفت على كل الفواكه اللذيذة بنجاح!</p>
                    <button class="menu-btn restart-btn" id="restartFruits">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const targetDisplay = document.getElementById('fruitTargetDisplay');
    const promptText = document.getElementById('fruitPrompt');
    const choicesContainer = document.getElementById('fruitBubbleChoices');

    function loadRound() {
        lockActions = false;
        
        // Pick random target fruit
        const prevFruit = activeFruit;
        do {
            activeFruit = fruitsList[Math.floor(Math.random() * fruitsList.length)];
        } while (prevFruit && activeFruit.emoji === prevFruit.emoji);

        // Update target prompt
        targetDisplay.innerHTML = `<img src="${window.getEmojiSVG(activeFruit.emoji)}" alt="${activeFruit.name}" class="game-svg-icon">`;
        promptText.innerText = `أين فاكهة (${activeFruit.name})؟ 🧐`;

        // Select 3 incorrect fruits
        const incorrects = fruitsList.filter(f => f.emoji !== activeFruit.emoji);
        const shuffledIncorrects = incorrects.sort(() => Math.random() - 0.5).slice(0, 3);

        // Merge and shuffle choice list
        const choices = [activeFruit, ...shuffledIncorrects].sort(() => Math.random() - 0.5);

        // Render choice bubbles
        choicesContainer.innerHTML = '';
        choices.forEach(f => {
            const bubble = document.createElement('div');
            bubble.classList.add('fruit-pop-bubble');
            bubble.style.backgroundColor = f.color + '22'; // Light pastel fill
            bubble.style.borderColor = f.color;
            bubble.innerHTML = `
                <div class="fruit-bubble-emoji"><img src="${window.getEmojiSVG(f.emoji)}" alt="${f.name}" class="game-svg-icon"></div>
            `;
            choicesContainer.appendChild(bubble);

            // Add events
            const handleBubblePop = function (e) {
                e.preventDefault();
                checkChoice(f.emoji, bubble);
            };
            bubble.addEventListener('mousedown', handleBubblePop);
            bubble.addEventListener('touchstart', handleBubblePop);
        });
    }

    function checkChoice(emoji, bubbleEl) {
        if (lockActions) return;
        lockActions = true;

        if (emoji === activeFruit.emoji) {
            // Correct choice!
            score++;
            document.getElementById('fruitBubbleScore').innerText = score;

            if (window.sound) window.sound.playBubble();

            // Explode bubble pop animation
            bubbleEl.classList.add('popped');
            bubbleEl.classList.add('pop-active');

            setTimeout(() => {
                if (score >= targetScore) {
                    winGame();
                } else {
                    loadRound();
                }
            }, 1200);

        } else {
            // Incorrect choice
            if (window.sound) window.sound.playFail();

            bubbleEl.classList.add('shake-anim');
            setTimeout(() => {
                bubbleEl.classList.remove('shake-anim');
                lockActions = false;
            }, 600);
        }
    }

    function winGame() {
        if (window.sound) window.sound.playSuccess();
        document.getElementById('fruitSuccessModal').classList.add('show');
    }

    function restartGame() {
        score = 0;
        document.getElementById('fruitBubbleScore').innerText = score;
        document.getElementById('fruitSuccessModal').classList.remove('show');
        loadRound();
    }

    document.getElementById('restartFruits').addEventListener('click', restartGame);

    loadRound();
};
