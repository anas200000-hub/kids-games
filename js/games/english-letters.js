// Game 17: English Letters - Full 26 letters pool, 7 random per session
window.initEnglishLettersGame = function (container) {

    const allRounds = [
        { letter:'A', prompt:'What starts with letter A?', correctWord:'Apple!',   choices:[{emoji:'🍎',label:'Apple',isCorrect:true},{emoji:'🐶',label:'Dog',isCorrect:false},{emoji:'🐠',label:'Fish',isCorrect:false}] },
        { letter:'B', prompt:'What starts with letter B?', correctWord:'Ball!',    choices:[{emoji:'🐱',label:'Cat',isCorrect:false},{emoji:'⚽',label:'Ball',isCorrect:true},{emoji:'🍌',label:'Banana',isCorrect:false}] },
        { letter:'C', prompt:'What starts with letter C?', correctWord:'Cat!',     choices:[{emoji:'🍎',label:'Apple',isCorrect:false},{emoji:'🐘',label:'Elephant',isCorrect:false},{emoji:'🐱',label:'Cat',isCorrect:true}] },
        { letter:'D', prompt:'What starts with letter D?', correctWord:'Dog!',     choices:[{emoji:'🐶',label:'Dog',isCorrect:true},{emoji:'🍓',label:'Strawberry',isCorrect:false},{emoji:'🚗',label:'Car',isCorrect:false}] },
        { letter:'E', prompt:'What starts with letter E?', correctWord:'Elephant!',choices:[{emoji:'🏠',label:'House',isCorrect:false},{emoji:'🐘',label:'Elephant',isCorrect:true},{emoji:'💖',label:'Heart',isCorrect:false}] },
        { letter:'F', prompt:'What starts with letter F?', correctWord:'Fish!',    choices:[{emoji:'🐠',label:'Fish',isCorrect:true},{emoji:'🎈',label:'Balloon',isCorrect:false},{emoji:'🍕',label:'Pizza',isCorrect:false}] },
        { letter:'G', prompt:'What starts with letter G?', correctWord:'Grapes!',  choices:[{emoji:'🍇',label:'Grapes',isCorrect:true},{emoji:'🌸',label:'Flower',isCorrect:false},{emoji:'🐱',label:'Cat',isCorrect:false}] },
        { letter:'H', prompt:'What starts with letter H?', correctWord:'House!',   choices:[{emoji:'🦋',label:'Butterfly',isCorrect:false},{emoji:'🏠',label:'House',isCorrect:true},{emoji:'🍦',label:'Ice Cream',isCorrect:false}] },
        { letter:'I', prompt:'What starts with letter I?', correctWord:'Ice Cream!',choices:[{emoji:'🍦',label:'Ice Cream',isCorrect:true},{emoji:'🌺',label:'Flower',isCorrect:false},{emoji:'🐸',label:'Frog',isCorrect:false}] },
        { letter:'J', prompt:'What starts with letter J?', correctWord:'Juice!',   choices:[{emoji:'🍊',label:'Orange',isCorrect:false},{emoji:'🧃',label:'Juice',isCorrect:true},{emoji:'🐦',label:'Bird',isCorrect:false}] },
        { letter:'K', prompt:'What starts with letter K?', correctWord:'Kite!',    choices:[{emoji:'🪁',label:'Kite',isCorrect:true},{emoji:'🍋',label:'Lemon',isCorrect:false},{emoji:'🌙',label:'Moon',isCorrect:false}] },
        { letter:'L', prompt:'What starts with letter L?', correctWord:'Lion!',    choices:[{emoji:'🦁',label:'Lion',isCorrect:true},{emoji:'🍉',label:'Watermelon',isCorrect:false},{emoji:'🐧',label:'Penguin',isCorrect:false}] },
        { letter:'M', prompt:'What starts with letter M?', correctWord:'Monkey!',  choices:[{emoji:'🐒',label:'Monkey',isCorrect:true},{emoji:'🍓',label:'Strawberry',isCorrect:false},{emoji:'🐢',label:'Turtle',isCorrect:false}] },
        { letter:'N', prompt:'What starts with letter N?', correctWord:'Nest!',    choices:[{emoji:'🌵',label:'Cactus',isCorrect:false},{emoji:'🪺',label:'Nest',isCorrect:true},{emoji:'🍕',label:'Pizza',isCorrect:false}] },
        { letter:'O', prompt:'What starts with letter O?', correctWord:'Orange!',  choices:[{emoji:'🍊',label:'Orange',isCorrect:true},{emoji:'🐙',label:'Octopus',isCorrect:false},{emoji:'🌊',label:'Wave',isCorrect:false}] },
        { letter:'P', prompt:'What starts with letter P?', correctWord:'Penguin!', choices:[{emoji:'🍕',label:'Pizza',isCorrect:false},{emoji:'🐧',label:'Penguin',isCorrect:true},{emoji:'🌈',label:'Rainbow',isCorrect:false}] },
        { letter:'Q', prompt:'What starts with letter Q?', correctWord:'Queen!',   choices:[{emoji:'👸',label:'Queen',isCorrect:true},{emoji:'🐠',label:'Fish',isCorrect:false},{emoji:'🎪',label:'Circus',isCorrect:false}] },
        { letter:'R', prompt:'What starts with letter R?', correctWord:'Rainbow!', choices:[{emoji:'🌈',label:'Rainbow',isCorrect:true},{emoji:'🚀',label:'Rocket',isCorrect:false},{emoji:'🍎',label:'Apple',isCorrect:false}] },
        { letter:'S', prompt:'What starts with letter S?', correctWord:'Star!',    choices:[{emoji:'🌟',label:'Star',isCorrect:true},{emoji:'🦁',label:'Lion',isCorrect:false},{emoji:'🍇',label:'Grapes',isCorrect:false}] },
        { letter:'T', prompt:'What starts with letter T?', correctWord:'Tiger!',   choices:[{emoji:'🐘',label:'Elephant',isCorrect:false},{emoji:'🐯',label:'Tiger',isCorrect:true},{emoji:'🌺',label:'Flower',isCorrect:false}] },
        { letter:'U', prompt:'What starts with letter U?', correctWord:'Umbrella!',choices:[{emoji:'🌂',label:'Umbrella',isCorrect:true},{emoji:'🦒',label:'Giraffe',isCorrect:false},{emoji:'🍓',label:'Strawberry',isCorrect:false}] },
        { letter:'V', prompt:'What starts with letter V?', correctWord:'Violin!',  choices:[{emoji:'🎻',label:'Violin',isCorrect:true},{emoji:'🍕',label:'Pizza',isCorrect:false},{emoji:'🐸',label:'Frog',isCorrect:false}] },
        { letter:'W', prompt:'What starts with letter W?', correctWord:'Whale!',   choices:[{emoji:'🐋',label:'Whale',isCorrect:true},{emoji:'🌟',label:'Star',isCorrect:false},{emoji:'🎈',label:'Balloon',isCorrect:false}] },
        { letter:'X', prompt:'What starts with letter X?', correctWord:'Xylophone!',choices:[{emoji:'🎵',label:'Xylophone',isCorrect:true},{emoji:'🐙',label:'Octopus',isCorrect:false},{emoji:'🏠',label:'House',isCorrect:false}] },
        { letter:'Y', prompt:'What starts with letter Y?', correctWord:'Yacht!',   choices:[{emoji:'⛵',label:'Yacht',isCorrect:true},{emoji:'🍊',label:'Orange',isCorrect:false},{emoji:'🐦',label:'Bird',isCorrect:false}] },
        { letter:'Z', prompt:'What starts with letter Z?', correctWord:'Zebra!',   choices:[{emoji:'🦓',label:'Zebra',isCorrect:true},{emoji:'🍌',label:'Banana',isCorrect:false},{emoji:'🌙',label:'Moon',isCorrect:false}] }
    ];

    const SESSION_SIZE = 7;

    // Pick SESSION_SIZE random rounds each game
    function pickRounds() {
        const pool = [...allRounds];
        const picked = [];
        while (picked.length < SESSION_SIZE && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            picked.push(pool.splice(idx, 1)[0]);
        }
        return picked;
    }

    let rounds = pickRounds();
    let currentRoundIdx = 0;
    let score = 0;
    let lockActions = false;

    container.innerHTML = `
        <div class="game-letters-layout">
            <h2 class="game-title">🔠 English Letters 🔠</h2>
            <div class="level-indicator">Round: <span id="engLetterLevel">1</span> / ${SESSION_SIZE}</div>
            <p class="game-instructions" id="engLetterPrompt">What starts with letter A?</p>

            <div class="letter-stage">
                <div class="letter-display" id="engLetterDisplay">A</div>
                <div class="letter-speech-bubble" id="engLetterBubble">Tap the matching card!</div>
            </div>

            <div class="letter-choices" id="engLetterChoices"></div>

            <div id="engLetterSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 Perfect Job! 🎉</h3>
                    <p>You matched all ${SESSION_SIZE} letters correctly! You are a champion! 🏆</p>
                    <button class="menu-btn restart-btn" id="restartEngLetters">Play Again 🔄</button>
                </div>
            </div>
        </div>
    `;

    const letterDisplay  = document.getElementById('engLetterDisplay');
    const letterBubble   = document.getElementById('engLetterBubble');
    const choicesEl      = document.getElementById('engLetterChoices');
    const promptText     = document.getElementById('engLetterPrompt');
    const levelText      = document.getElementById('engLetterLevel');

    function loadRound() {
        lockActions = false;
        const round = rounds[currentRoundIdx];
        levelText.innerText = currentRoundIdx + 1;
        promptText.innerText = round.prompt;
        letterDisplay.innerText = round.letter;
        letterBubble.innerText = 'Tap the matching card!';

        // Shuffle choices so correct answer isn't always in same position
        const shuffledChoices = [...round.choices].sort(() => Math.random() - 0.5);

        choicesEl.innerHTML = '';
        shuffledChoices.forEach(c => {
            const card = document.createElement('div');
            card.classList.add('letter-choice-card');
            card.innerHTML = `
                <div class="letter-choice-emoji"><img src="${window.getEmojiSVG(c.emoji)}" alt="${c.label}" class="game-svg-icon"></div>
                <div class="letter-choice-label">${c.label}</div>
            `;
            choicesEl.appendChild(card);
            card.addEventListener('click', () => handleChoice(c.isCorrect, round.letter, c.label, card));
        });
    }

    function handleChoice(isCorrect, letter, word, cardEl) {
        if (lockActions) return;
        lockActions = true;
        if (isCorrect) {
            score++;
            if (window.sound) window.sound.playSuccess();
            cardEl.classList.add('correct', 'bounce-anim');
            letterBubble.innerText = `${letter} is for ${word} 🌟`;
            setTimeout(() => {
                currentRoundIdx++;
                currentRoundIdx < rounds.length ? loadRound() : winGame();
            }, 1800);
        } else {
            if (window.sound) window.sound.playFail();
            cardEl.classList.add('shake-anim');
            letterBubble.innerText = 'Try again! 🌸';
            setTimeout(() => { cardEl.classList.remove('shake-anim'); lockActions = false; }, 800);
        }
    }

    function winGame() {
        if (window.sound) window.sound.playSuccess();
        document.getElementById('engLetterSuccessModal').classList.add('show');
    }

    document.getElementById('restartEngLetters').addEventListener('click', () => {
        rounds = pickRounds();
        currentRoundIdx = 0;
        score = 0;
        document.getElementById('engLetterSuccessModal').classList.remove('show');
        loadRound();
    });

    loadRound();
};
