// Game 16: Whack-a-Mole (اضرب الأرانب للأطفال)
window.initWhackGame = function (container) {
    let score = 0;
    const targetScore = 15;
    let gameActive = true;
    let currentHoleIdx = -1;
    let moleTimeout = null;
    let moleInterval = null;

    let html = `
        <div class="game-whack-layout">
            <h2 class="game-title">🐰 لعبة صيد الأرانب 🐰</h2>
            <div class="game-hud">
                <div class="hud-score">الأرانب المصطادة: <span id="whackScore">0</span> / 15</div>
            </div>
            <p class="game-instructions">اضغط بسرعة على الأرنب اللطيف بمجرد خروجه من الحفرة!</p>

            <div class="whack-grid" id="whackGrid">
    `;

    for (let i = 0; i < 6; i++) {
        html += `
            <div class="whack-hole" data-index="${i}">
                <div class="whack-mole"><img src="${window.getEmojiSVG('🐰')}" class="game-svg-icon"></div>
            </div>
        `;
    }

    html += `
            </div>

            <div id="whackSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 بطل الصيد السريع! 🎉</h3>
                    <p>لقد أمسكت بـ 15 أرنباً سريعاً بنجاح تام!</p>
                    <button class="menu-btn restart-btn" id="restartWhack">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const holes = container.querySelectorAll('.whack-hole');

    function startGame() {
        score = 0;
        document.getElementById('whackScore').innerText = score;
        document.getElementById('whackSuccessModal').classList.remove('show');
        
        // Reset all holes
        holes.forEach(h => h.querySelector('.whack-mole').classList.remove('up'));
        
        gameActive = true;
        
        // Start spawn loop
        nextMole();
    }

    function nextMole() {
        if (!gameActive) return;

        // Hide current mole
        if (currentHoleIdx !== -1) {
            holes[currentHoleIdx].querySelector('.whack-mole').classList.remove('up');
        }

        // Pick new random hole (different from last one)
        let nextHoleIdx;
        do {
            nextHoleIdx = Math.floor(Math.random() * holes.length);
        } while (nextHoleIdx === currentHoleIdx);
        
        currentHoleIdx = nextHoleIdx;

        // Show new mole
        const mole = holes[currentHoleIdx].querySelector('.whack-mole');
        mole.classList.add('up');

        // Set stay time (e.g. 1.2 seconds, moderate for kids)
        moleTimeout = setTimeout(() => {
            if (gameActive) {
                nextMole();
            }
        }, 1300);
    }

    // Attach click events
    holes.forEach(hole => {
        const mole = hole.querySelector('.whack-mole');
        
        const hit = function (e) {
            e.preventDefault();
            if (!gameActive) return;
            if (!mole.classList.contains('up')) return; // Missed

            // Success hit!
            score++;
            document.getElementById('whackScore').innerText = score;

            if (window.sound) window.sound.playPop();

            // Hit animation
            mole.classList.remove('up');
            
            // Spark effect or bubble
            hole.classList.add('pop-active');
            setTimeout(() => hole.classList.remove('pop-active'), 200);

            // Check Win
            if (score >= targetScore) {
                winGame();
            } else {
                // Instantly spawn next mole
                clearTimeout(moleTimeout);
                nextMole();
            }
        };

        mole.addEventListener('mousedown', hit);
        mole.addEventListener('touchstart', hit);
    });

    function winGame() {
        gameActive = false;
        clearTimeout(moleTimeout);
        
        // Hide all moles
        holes.forEach(h => h.querySelector('.whack-mole').classList.remove('up'));

        if (window.sound) window.sound.playSuccess();
        document.getElementById('whackSuccessModal').classList.add('show');
    }

    document.getElementById('restartWhack').addEventListener('click', startGame);

    // Clean up timers on game exit
    container.addEventListener('game-exit', () => {
        gameActive = false;
        clearTimeout(moleTimeout);
    });

    startGame();
};
