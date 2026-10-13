// Game 9: Odd One Out (أوجد المختلف)
window.initOddOneGame = function (container) {
    const levels = [
        {
            instruction: 'أوجد الحيوان المختلف! 🦁',
            items: [
                { emoji: '🦁', isOdd: false },
                { emoji: '🦁', isOdd: false },
                { emoji: '🐱', isOdd: true },
                { emoji: '🦁', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الفاكهة المختلفة! 🍎',
            items: [
                { emoji: '🍎', isOdd: false },
                { emoji: '🍌', isOdd: true },
                { emoji: '🍎', isOdd: false },
                { emoji: '🍎', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد اللعبة المختلفة! 🧸',
            items: [
                { emoji: '🎈', isOdd: true },
                { emoji: '🧸', isOdd: false },
                { emoji: '🧸', isOdd: false },
                { emoji: '🧸', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد المركبة المختلفة! 🚗',
            items: [
                { emoji: '🚗', isOdd: false },
                { emoji: '🚗', isOdd: false },
                { emoji: '🚗', isOdd: false },
                { emoji: '✈️', isOdd: true }
            ]
        },
        {
            instruction: 'أوجد الطائر المختلف! 🐔',
            items: [
                { emoji: '🦆', isOdd: true },
                { emoji: '🐔', isOdd: false },
                { emoji: '🐔', isOdd: false },
                { emoji: '🐔', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الشيء المختلف! ⚽',
            items: [
                { emoji: '⚽', isOdd: false },
                { emoji: '⚽', isOdd: false },
                { emoji: '🎨', isOdd: true },
                { emoji: '⚽', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الحشرة المختلفة! 🦋',
            items: [
                { emoji: '🦋', isOdd: false },
                { emoji: '🐸', isOdd: true },
                { emoji: '🦋', isOdd: false },
                { emoji: '🦋', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الحلوى المختلفة! 🧁',
            items: [
                { emoji: '🧁', isOdd: false },
                { emoji: '🧁', isOdd: false },
                { emoji: '🍩', isOdd: true },
                { emoji: '🧁', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الفاكهة المختلفة! 🍉',
            items: [
                { emoji: '🍉', isOdd: false },
                { emoji: '🍇', isOdd: true },
                { emoji: '🍉', isOdd: false },
                { emoji: '🍉', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الشيء المختلف! 🍌',
            items: [
                { emoji: '🥕', isOdd: true },
                { emoji: '🍌', isOdd: false },
                { emoji: '🍌', isOdd: false },
                { emoji: '🍌', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الحيوان المختلف! 🐱',
            items: [
                { emoji: '🐱', isOdd: false },
                { emoji: '🐱', isOdd: false },
                { emoji: '🐱', isOdd: false },
                { emoji: '🐶', isOdd: true }
            ]
        },
        {
            instruction: 'أوجد الحيوان المختلف! 🐒',
            items: [
                { emoji: '🐘', isOdd: true },
                { emoji: '🐒', isOdd: false },
                { emoji: '🐒', isOdd: false },
                { emoji: '🐒', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الحيوان المختلف! 🐑',
            items: [
                { emoji: '🐑', isOdd: false },
                { emoji: '🐴', isOdd: true },
                { emoji: '🐑', isOdd: false },
                { emoji: '🐑', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد الحلوى المختلفة! 🧁',
            items: [
                { emoji: '🧁', isOdd: false },
                { emoji: '🍦', isOdd: true },
                { emoji: '🧁', isOdd: false },
                { emoji: '🧁', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد المركبة المختلفة! ✈️',
            items: [
                { emoji: '✈️', isOdd: false },
                { emoji: '✈️', isOdd: false },
                { emoji: '🏠', isOdd: true },
                { emoji: '✈️', isOdd: false }
            ]
        },
        {
            instruction: 'أوجد المركبة المختلفة! 🚗',
            items: [
                { emoji: '🚀', isOdd: true },
                { emoji: '🚗', isOdd: false },
                { emoji: '🚗', isOdd: false },
                { emoji: '🚗', isOdd: false }
            ]
        }
    ];

    let activeLevels = [];
    let currentLevelIdx = 0;
    let lockSelection = false;

    let html = `
        <div class="game-oddone-layout">
            <h2 class="game-title">🔍 أوجد المختلف 🔍</h2>
            <div class="level-indicator">المرحلة: <span id="oddLevel">1</span> / 5</div>
            <p class="game-instructions" id="oddInstruction">جار التحميل...</p>
            
            <div class="oddone-grid" id="oddoneGrid"></div>

            <div id="oddoneSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 بطل الملاحظة الخارق! 🎉</h3>
                    <p>لقد اجتزت جميع المراحل الخمسة بنجاح تام!</p>
                    <button class="menu-btn restart-btn" id="restartOddone">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const grid = document.getElementById('oddoneGrid');
    const instructionText = document.getElementById('oddInstruction');
    const levelText = document.getElementById('oddLevel');

    function selectRandomLevels() {
        const poolCopy = [...levels];
        activeLevels = [];
        while (activeLevels.length < 5 && poolCopy.length > 0) {
            const idx = Math.floor(Math.random() * poolCopy.length);
            activeLevels.push(poolCopy.splice(idx, 1)[0]);
        }
    }

    function loadLevel() {
        lockSelection = false;
        const level = activeLevels[currentLevelIdx];
        
        // Shuffle current level items randomly
        const shuffledItems = [...level.items].sort(() => Math.random() - 0.5);
        
        // Update UI info
        levelText.innerText = currentLevelIdx + 1;
        instructionText.innerText = level.instruction;
        grid.innerHTML = '';

        // Render cards
        shuffledItems.forEach((item, idx) => {
            const card = document.createElement('div');
            card.classList.add('oddone-card');
            card.setAttribute('data-index', idx);
            card.innerHTML = `<span class="oddone-emoji"><img src="${window.getEmojiSVG(item.emoji)}" class="game-svg-icon"></span>`;
            grid.appendChild(card);
            
            card.addEventListener('click', () => handleCardSelect(card, item.isOdd));
        });
    }

    function handleCardSelect(cardEl, isOdd) {
        if (lockSelection) return;

        if (isOdd) {
            lockSelection = true;
            cardEl.classList.add('correct');
            
            if (window.sound) {
                window.sound.playBubble();
            }

            // Bounce correct card
            cardEl.classList.add('bounce-anim');

            setTimeout(() => {
                currentLevelIdx++;
                if (currentLevelIdx < activeLevels.length) {
                    loadLevel();
                } else {
                    winGame();
                }
            }, 1200);

        } else {
            // Incorrect selection
            if (window.sound) {
                window.sound.playFail();
            }

            // Shake incorrect card
            cardEl.classList.add('shake-anim');
            setTimeout(() => cardEl.classList.remove('shake-anim'), 500);
        }
    }

    function winGame() {
        if (window.sound) {
            window.sound.playSuccess();
        }
        document.getElementById('oddoneSuccessModal').classList.add('show');
    }

    function restartGame() {
        currentLevelIdx = 0;
        document.getElementById('oddoneSuccessModal').classList.remove('show');
        selectRandomLevels();
        loadLevel();
    }

    document.getElementById('restartOddone').addEventListener('click', restartGame);

    // Initial setup and load
    selectRandomLevels();
    loadLevel();
};
