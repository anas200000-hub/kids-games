// Game 11: Shadow Matcher (ظلال الأشكال)
window.initShadowGame = function (container) {
    const items = [
        { emoji: '🍎', name: 'تفاحة' },
        { emoji: '🚀', name: 'صاروخ' },
        { emoji: '🦋', name: 'فراشة' },
        { emoji: '🚗', name: 'سيارة' },
        { emoji: '🌲', name: 'شجرة' },
        { emoji: '🐟', name: 'سمكة' },
        { emoji: '🏠', name: 'بيت' },
        { emoji: '⭐', name: 'نجمة' },
        { emoji: '🐘', name: 'فيل' },
        { emoji: '🍦', name: 'آيس كريم' }
    ];

    let score = 0;
    const targetScore = 5;
    let activeItem = null;
    let lockActions = false;

    let html = `
        <div class="game-shadow-layout">
            <h2 class="game-title">👥 لعبة ظلال الأشكال 👥</h2>
            <div class="level-indicator">النقاط: <span id="shadowScore">0</span> / 5</div>
            <p class="game-instructions">انظر للظل في الوسط، واختر الشكل الصحيح المطابق له!</p>

            <div class="shadow-stage">
                <div class="shadow-display" id="shadowDisplay">❓</div>
            </div>

            <div class="shadow-choices" id="shadowChoices"></div>

            <div id="shadowSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا ذكي! 🎉</h3>
                    <p>لقد قمت بمطابقة ظلال الأشكال بدقة ممتازة!</p>
                    <button class="menu-btn restart-btn" id="restartShadow">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const shadowDisplay = document.getElementById('shadowDisplay');
    const choicesContainer = document.getElementById('shadowChoices');

    function loadRound() {
        lockActions = false;
        
        // Pick target item
        const prevItem = activeItem;
        do {
            activeItem = items[Math.floor(Math.random() * items.length)];
        } while (prevItem && activeItem.emoji === prevItem.emoji);

        // Render black shadow
        shadowDisplay.innerHTML = `<img src="${window.getEmojiSVG(activeItem.emoji)}" class="game-svg-icon">`;
        shadowDisplay.style.filter = 'brightness(0)'; // Apply pure black shadow
        shadowDisplay.style.transform = 'scale(1)';

        // Select 3 incorrect items
        const wrongItems = items.filter(i => i.emoji !== activeItem.emoji);
        const shuffledWrongs = wrongItems.sort(() => Math.random() - 0.5).slice(0, 3);

        // Combine target + incorrects, then shuffle
        const choices = [activeItem, ...shuffledWrongs].sort(() => Math.random() - 0.5);

        // Render cards
        choicesContainer.innerHTML = '';
        choices.forEach(c => {
            const card = document.createElement('div');
            card.classList.add('shadow-card');
            card.setAttribute('data-emoji', c.emoji);
            card.innerHTML = `<span class="shadow-choice-emoji"><img src="${window.getEmojiSVG(c.emoji)}" class="game-svg-icon"></span>`;
            choicesContainer.appendChild(card);

            card.addEventListener('click', () => handleChoice(c.emoji, card));
        });
    }

    function handleChoice(chosenEmoji, cardEl) {
        if (lockActions) return;
        lockActions = true;

        if (chosenEmoji === activeItem.emoji) {
            // Correct choice!
            score++;
            document.getElementById('shadowScore').innerText = score;

            if (window.sound) {
                window.sound.playSuccess();
            }

            // Animate card and reveal shadow
            cardEl.classList.add('correct');
            cardEl.classList.add('bounce-anim');
            
            shadowDisplay.style.transition = 'filter 0.5s ease-out, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            shadowDisplay.style.filter = 'none'; // Reveal color
            shadowDisplay.style.transform = 'scale(1.25)';

            setTimeout(() => {
                shadowDisplay.style.transition = 'none';
                if (score >= targetScore) {
                    winGame();
                } else {
                    loadRound();
                }
            }, 1800);

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
        document.getElementById('shadowSuccessModal').classList.add('show');
    }

    function restartGame() {
        score = 0;
        document.getElementById('shadowScore').innerText = score;
        document.getElementById('shadowSuccessModal').classList.remove('show');
        loadRound();
    }

    document.getElementById('restartShadow').addEventListener('click', restartGame);

    loadRound();
};
