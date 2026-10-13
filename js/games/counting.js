// Game 12: Counting Game (عد الأشياء)
window.initCountingGame = function (container) {
    const itemsPool = [
        { emoji: '🍎', name: 'تفاح' },
        { emoji: '🚗', name: 'سيارات' },
        { emoji: '⭐', name: 'نجوم' },
        { emoji: '🐶', name: 'جراء' },
        { emoji: '🦆', name: 'بطات' },
        { emoji: '🎈', name: 'بالونات' },
        { emoji: '🍭', name: 'مصاصات' }
    ];

    let score = 0;
    const targetScore = 5;
    let currentCount = 0;
    let lockActions = false;

    let html = `
        <div class="game-counting-layout">
            <h2 class="game-title">🔢 لعبة عد الأشياء 🔢</h2>
            <div class="level-indicator">النقاط: <span id="countScore">0</span> / 5</div>
            <p class="game-instructions">عد الأشياء اللطيفة في الوسط، ثم اضغط على الرقم الصحيح!</p>

            <div class="counting-stage" id="countingStage"></div>

            <div class="counting-numbers" id="countingNumbers"></div>

            <div id="countingSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا بطل الأرقام! 🎉</h3>
                    <p>أنت تعد الأرقام بشكل ممتاز وسريع!</p>
                    <button class="menu-btn restart-btn" id="restartCounting">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const stage = document.getElementById('countingStage');
    const numbersContainer = document.getElementById('countingNumbers');

    function loadRound() {
        lockActions = false;
        
        // Pick a random count between 1 and 5
        currentCount = Math.floor(Math.random() * 5) + 1;
        
        // Pick a random item type
        const itemType = itemsPool[Math.floor(Math.random() * itemsPool.length)];

        // Render items on stage
        stage.innerHTML = '';
        const itemsGrid = document.createElement('div');
        itemsGrid.classList.add('counting-items-grid');
        
        // Set column class depending on count for neat layout
        itemsGrid.classList.add(`count-${currentCount}`);

        for (let i = 0; i < currentCount; i++) {
            const el = document.createElement('div');
            el.classList.add('counting-item');
            el.classList.add('bounce-anim');
            el.innerHTML = `<img src="${window.getEmojiSVG(itemType.emoji)}" class="game-svg-icon">`;
            itemsGrid.appendChild(el);
        }
        stage.appendChild(itemsGrid);

        // Generate number choices (including the correct count and 3 wrong ones from 1 to 5)
        const choicesSet = new Set([currentCount]);
        while (choicesSet.size < 4) {
            choicesSet.add(Math.floor(Math.random() * 5) + 1);
        }
        
        const choices = Array.from(choicesSet).sort((a, b) => a - b); // Sorted look

        // Render number buttons
        numbersContainer.innerHTML = '';
        choices.forEach(num => {
            const card = document.createElement('div');
            card.classList.add('number-card');
            card.setAttribute('data-num', num);
            card.innerText = num;
            numbersContainer.appendChild(card);

            card.addEventListener('click', () => handleNumberClick(num, card));
        });
    }

    function handleNumberClick(chosenNum, cardEl) {
        if (lockActions) return;
        lockActions = true;

        if (chosenNum === currentCount) {
            // Correct!
            score++;
            document.getElementById('countScore').innerText = score;

            if (window.sound) {
                window.sound.playSuccess();
            }

            cardEl.classList.add('correct');
            cardEl.classList.add('bounce-anim');

            // Bounce all items on stage to celebrate
            stage.querySelectorAll('.counting-item').forEach(item => {
                item.classList.add('bounce-anim');
            });

            setTimeout(() => {
                if (score >= targetScore) {
                    winGame();
                } else {
                    loadRound();
                }
            }, 1500);

        } else {
            // Incorrect choice
            if (window.sound) {
                window.sound.playFail();
            }

            cardEl.classList.add('shake-anim');
            setTimeout(() => {
                cardEl.classList.remove('shake-anim');
                lockActions = false;
            }, 600);
        }
    }

    function winGame() {
        if (window.sound) {
            window.sound.playSuccess();
        }
        document.getElementById('countingSuccessModal').classList.add('show');
    }

    function restartGame() {
        score = 0;
        document.getElementById('countScore').innerText = score;
        document.getElementById('countingSuccessModal').classList.remove('show');
        loadRound();
    }

    document.getElementById('restartCounting').addEventListener('click', restartGame);

    loadRound();
};
