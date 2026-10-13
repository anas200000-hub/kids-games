// Game 18: Arabic Letters - Full 28 letters pool, 7 random per session
window.initArabicLettersGame = function (container) {

    const allRounds = [
        { letter:'أ', prompt:'أي صورة تبدأ بحرف (أ)؟', correctWord:'أرنب!',    choices:[{emoji:'🐰',label:'أرنب',isCorrect:true},{emoji:'🐟',label:'سمكة',isCorrect:false},{emoji:'🚗',label:'سيارة',isCorrect:false}] },
        { letter:'ب', prompt:'أي صورة تبدأ بحرف (ب)؟', correctWord:'بطة!',     choices:[{emoji:'🦆',label:'بطة',isCorrect:true},{emoji:'🦁',label:'أسد',isCorrect:false},{emoji:'🍎',label:'تفاحة',isCorrect:false}] },
        { letter:'ت', prompt:'أي صورة تبدأ بحرف (ت)؟', correctWord:'تفاحة!',   choices:[{emoji:'🍎',label:'تفاحة',isCorrect:true},{emoji:'🐶',label:'كلب',isCorrect:false},{emoji:'🐒',label:'قرد',isCorrect:false}] },
        { letter:'ث', prompt:'أي صورة تبدأ بحرف (ث)؟', correctWord:'ثعلب!',    choices:[{emoji:'🦊',label:'ثعلب',isCorrect:true},{emoji:'🌸',label:'زهرة',isCorrect:false},{emoji:'🐘',label:'فيل',isCorrect:false}] },
        { letter:'ج', prompt:'أي صورة تبدأ بحرف (ج)؟', correctWord:'جمل!',     choices:[{emoji:'🐪',label:'جمل',isCorrect:true},{emoji:'🐱',label:'قطة',isCorrect:false},{emoji:'🎈',label:'بالون',isCorrect:false}] },
        { letter:'ح', prompt:'أي صورة تبدأ بحرف (ح)؟', correctWord:'حصان!',    choices:[{emoji:'🐴',label:'حصان',isCorrect:true},{emoji:'🌙',label:'قمر',isCorrect:false},{emoji:'🍓',label:'فراولة',isCorrect:false}] },
        { letter:'خ', prompt:'أي صورة تبدأ بحرف (خ)؟', correctWord:'خروف!',    choices:[{emoji:'🐑',label:'خروف',isCorrect:true},{emoji:'🌺',label:'وردة',isCorrect:false},{emoji:'🚀',label:'صاروخ',isCorrect:false}] },
        { letter:'د', prompt:'أي صورة تبدأ بحرف (د)؟', correctWord:'دجاجة!',   choices:[{emoji:'🐔',label:'دجاجة',isCorrect:true},{emoji:'🌲',label:'شجرة',isCorrect:false},{emoji:'🐘',label:'فيل',isCorrect:false}] },
        { letter:'ذ', prompt:'أي صورة تبدأ بحرف (ذ)؟', correctWord:'ذئب!',     choices:[{emoji:'🐺',label:'ذئب',isCorrect:true},{emoji:'🐬',label:'دلفين',isCorrect:false},{emoji:'🍋',label:'ليمون',isCorrect:false}] },
        { letter:'ر', prompt:'أي صورة تبدأ بحرف (ر)؟', correctWord:'رمان!',    choices:[{emoji:'🍊',label:'رمان',isCorrect:true},{emoji:'🐦',label:'طائر',isCorrect:false},{emoji:'🎂',label:'كعكة',isCorrect:false}] },
        { letter:'ز', prompt:'أي صورة تبدأ بحرف (ز)؟', correctWord:'زرافة!',   choices:[{emoji:'🦒',label:'زرافة',isCorrect:true},{emoji:'🍦',label:'آيس كريم',isCorrect:false},{emoji:'🐙',label:'أخطبوط',isCorrect:false}] },
        { letter:'س', prompt:'أي صورة تبدأ بحرف (س)؟', correctWord:'سمكة!',    choices:[{emoji:'🐟',label:'سمكة',isCorrect:true},{emoji:'🐒',label:'قرد',isCorrect:false},{emoji:'🏠',label:'بيت',isCorrect:false}] },
        { letter:'ش', prompt:'أي صورة تبدأ بحرف (ش)؟', correctWord:'شمسية!',   choices:[{emoji:'☂️',label:'شمسية',isCorrect:true},{emoji:'🌟',label:'نجمة',isCorrect:false},{emoji:'🦋',label:'فراشة',isCorrect:false}] },
        { letter:'ص', prompt:'أي صورة تبدأ بحرف (ص)؟', correctWord:'صقر!',     choices:[{emoji:'🦅',label:'صقر',isCorrect:true},{emoji:'🐸',label:'ضفدع',isCorrect:false},{emoji:'🍇',label:'عنب',isCorrect:false}] },
        { letter:'ض', prompt:'أي صورة تبدأ بحرف (ض)؟', correctWord:'ضفدع!',    choices:[{emoji:'🐸',label:'ضفدع',isCorrect:true},{emoji:'🦁',label:'أسد',isCorrect:false},{emoji:'🌸',label:'زهرة',isCorrect:false}] },
        { letter:'ط', prompt:'أي صورة تبدأ بحرف (ط)؟', correctWord:'طائر!',    choices:[{emoji:'🐦',label:'طائر',isCorrect:true},{emoji:'🐠',label:'سمكة',isCorrect:false},{emoji:'🎈',label:'بالون',isCorrect:false}] },
        { letter:'ظ', prompt:'أي صورة تبدأ بحرف (ظ)؟', correctWord:'ظبي!',     choices:[{emoji:'🦌',label:'ظبي',isCorrect:true},{emoji:'🌙',label:'قمر',isCorrect:false},{emoji:'🍎',label:'تفاحة',isCorrect:false}] },
        { letter:'ع', prompt:'أي صورة تبدأ بحرف (ع)؟', correctWord:'عصفور!',   choices:[{emoji:'🐤',label:'عصفور',isCorrect:true},{emoji:'🐘',label:'فيل',isCorrect:false},{emoji:'🏆',label:'كأس',isCorrect:false}] },
        { letter:'غ', prompt:'أي صورة تبدأ بحرف (غ)؟', correctWord:'غزال!',    choices:[{emoji:'🦌',label:'غزال',isCorrect:true},{emoji:'🎵',label:'موسيقى',isCorrect:false},{emoji:'🌊',label:'موجة',isCorrect:false}] },
        { letter:'ف', prompt:'أي صورة تبدأ بحرف (ف)؟', correctWord:'فراشة!',   choices:[{emoji:'🦋',label:'فراشة',isCorrect:true},{emoji:'🌺',label:'وردة',isCorrect:false},{emoji:'🐰',label:'أرنب',isCorrect:false}] },
        { letter:'ق', prompt:'أي صورة تبدأ بحرف (ق)؟', correctWord:'قطة!',     choices:[{emoji:'🐱',label:'قطة',isCorrect:true},{emoji:'🐶',label:'كلب',isCorrect:false},{emoji:'🌴',label:'نخلة',isCorrect:false}] },
        { letter:'ك', prompt:'أي صورة تبدأ بحرف (ك)؟', correctWord:'كلب!',     choices:[{emoji:'🐶',label:'كلب',isCorrect:true},{emoji:'🌸',label:'زهرة',isCorrect:false},{emoji:'🦅',label:'نسر',isCorrect:false}] },
        { letter:'ل', prompt:'أي صورة تبدأ بحرف (ل)؟', correctWord:'ليمون!',   choices:[{emoji:'🍋',label:'ليمون',isCorrect:true},{emoji:'🐟',label:'سمكة',isCorrect:false},{emoji:'🚗',label:'سيارة',isCorrect:false}] },
        { letter:'م', prompt:'أي صورة تبدأ بحرف (م)؟', correctWord:'موز!',      choices:[{emoji:'🍌',label:'موز',isCorrect:true},{emoji:'🐱',label:'قطة',isCorrect:false},{emoji:'🎈',label:'بالون',isCorrect:false}] },
        { letter:'ن', prompt:'أي صورة تبدأ بحرف (ن)؟', correctWord:'نجمة!',    choices:[{emoji:'🌟',label:'نجمة',isCorrect:true},{emoji:'🍎',label:'تفاحة',isCorrect:false},{emoji:'🦊',label:'ثعلب',isCorrect:false}] },
        { letter:'ه', prompt:'أي صورة تبدأ بحرف (ه)؟', correctWord:'هدية!',    choices:[{emoji:'🎁',label:'هدية',isCorrect:true},{emoji:'🌙',label:'قمر',isCorrect:false},{emoji:'🐺',label:'ذئب',isCorrect:false}] },
        { letter:'و', prompt:'أي صورة تبدأ بحرف (و)؟', correctWord:'وردة!',    choices:[{emoji:'🌹',label:'وردة',isCorrect:true},{emoji:'🦒',label:'زرافة',isCorrect:false},{emoji:'🍇',label:'عنب',isCorrect:false}] },
        { letter:'ي', prompt:'أي صورة تبدأ بحرف (ي)؟', correctWord:'يمامة!',   choices:[{emoji:'🕊️',label:'يمامة',isCorrect:true},{emoji:'🐙',label:'أخطبوط',isCorrect:false},{emoji:'🌈',label:'قوس قزح',isCorrect:false}] }
    ];

    const SESSION_SIZE = 7;

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
            <h2 class="game-title">🅰️ حروف العربية 🅰️</h2>
            <div class="level-indicator">المرحلة: <span id="araLetterLevel">1</span> / ${SESSION_SIZE}</div>
            <p class="game-instructions" id="araLetterPrompt">أي صورة تبدأ بحرف أ؟</p>

            <div class="letter-stage">
                <div class="letter-display" id="araLetterDisplay" style="font-family: 'Tajawal', sans-serif;">أ</div>
                <div class="letter-speech-bubble" id="araLetterBubble">اضغط على الشكل المطابق!</div>
            </div>

            <div class="letter-choices" id="araLetterChoices"></div>

            <div id="araLetterSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا بطل الحروف! 🎉</h3>
                    <p>لقد قمت بمطابقة ${SESSION_SIZE} حروف عربية بنجاح تام! أنت نجم حقيقي! ⭐</p>
                    <button class="menu-btn restart-btn" id="restartAraLetters">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    const letterDisplay = document.getElementById('araLetterDisplay');
    const letterBubble  = document.getElementById('araLetterBubble');
    const choicesEl     = document.getElementById('araLetterChoices');
    const promptText    = document.getElementById('araLetterPrompt');
    const levelText     = document.getElementById('araLetterLevel');

    function loadRound() {
        lockActions = false;
        const round = rounds[currentRoundIdx];
        levelText.innerText = currentRoundIdx + 1;
        promptText.innerText = round.prompt;
        letterDisplay.innerText = round.letter;
        letterBubble.innerText = 'اضغط على الشكل المطابق!';

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
            card.addEventListener('click', () => handleChoice(c.isCorrect, round.letter, round.correctWord, card));
        });
    }

    function handleChoice(isCorrect, letter, word, cardEl) {
        if (lockActions) return;
        lockActions = true;
        if (isCorrect) {
            score++;
            if (window.sound) window.sound.playSuccess();
            cardEl.classList.add('correct', 'bounce-anim');
            letterBubble.innerText = `${letter} لـ ${word} 🌟`;
            setTimeout(() => {
                currentRoundIdx++;
                currentRoundIdx < rounds.length ? loadRound() : winGame();
            }, 1800);
        } else {
            if (window.sound) window.sound.playFail();
            cardEl.classList.add('shake-anim');
            letterBubble.innerText = 'حاول مرة أخرى! 🌸';
            setTimeout(() => { cardEl.classList.remove('shake-anim'); lockActions = false; }, 800);
        }
    }

    function winGame() {
        if (window.sound) window.sound.playSuccess();
        document.getElementById('araLetterSuccessModal').classList.add('show');
    }

    document.getElementById('restartAraLetters').addEventListener('click', () => {
        rounds = pickRounds();
        currentRoundIdx = 0;
        score = 0;
        document.getElementById('araLetterSuccessModal').classList.remove('show');
        loadRound();
    });

    loadRound();
};
