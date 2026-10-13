// Game 4: Memory Matching (لعبة الذاكرة)
window.initMemoryGame = function (container) {
    const emojis = ['🐶', '🐱', '🦁', '🐴', '🐸', '🐔'];
    let cards = [];
    let flippedCards = [];
    let matchesCount = 0;
    let lockBoard = false;

    let html = `
        <div class="game-memory-layout">
            <h2 class="game-title">🧠 لعبة الذاكرة 🧠</h2>
            <p class="game-instructions">اقلب البطاقات وابحث عن الحيوانات المتطابقة!</p>
            <div class="memory-grid"></div>
            <div id="memorySuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 رائع يا بطل! 🎉</h3>
                    <p>لقد وجدت كل الحيوانات المتطابقة بالكامل!</p>
                    <button class="menu-btn restart-btn" id="restartMemory">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    const gridContainer = container.querySelector('.memory-grid');

    function createBoard() {
        gridContainer.innerHTML = '';
        matchesCount = 0;
        flippedCards = [];
        lockBoard = false;
        
        // Duplicate emojis to make pairs
        const cardValues = [...emojis, ...emojis];
        
        // Shuffle card values (Fisher-Yates)
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }

        // Render card elements
        cardValues.forEach((val, idx) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.setAttribute('data-value', val);
            card.setAttribute('data-id', idx);
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">❓</div>
                    <div class="card-back"><img src="${window.getEmojiSVG(val)}" class="game-svg-icon"></div>
                </div>
            `;
            gridContainer.appendChild(card);
            card.addEventListener('click', flipCard);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this.classList.contains('flip')) return; // Already flipped
        
        if (window.sound) {
            window.sound.playFlip();
        }

        this.classList.add('flip');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        
        const isMatch = card1.getAttribute('data-value') === card2.getAttribute('data-value');

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        setTimeout(() => {
            if (window.sound) {
                window.sound.playBubble();
            }
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
            
            flippedCards = [];
            matchesCount++;
            
            if (matchesCount === emojis.length) {
                winGame();
            } else {
                lockBoard = false;
            }
        }, 500);
    }

    function unflipCards() {
        setTimeout(() => {
            flippedCards[0].classList.remove('flip');
            flippedCards[1].classList.remove('flip');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }

    function winGame() {
        setTimeout(() => {
            if (window.sound) {
                window.sound.playSuccess();
            }
            document.getElementById('memorySuccessModal').classList.add('show');
        }, 600);
    }

    document.getElementById('restartMemory').addEventListener('click', () => {
        createBoard();
        document.getElementById('memorySuccessModal').classList.remove('show');
    });

    createBoard();
};
