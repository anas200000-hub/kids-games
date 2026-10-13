// Game 15: Kids Tic-Tac-Toe (لعبة إكس أو للأطفال)
window.initTictactoeGame = function (container) {
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let playerSymbol = '❌'; // Red X
    let robotSymbol = '⭕';  // Red/Blue O
    let matchesCount = 0;

    let html = `
        <div class="game-xo-layout">
            <h2 class="game-title">❌ لعبة إكس أو ⭕</h2>
            <p class="game-instructions">ضع الـ ❌ في المربع وحاول أن تصنع خطاً مستقيماً للفوز على الروبوت!</p>

            <div class="xo-board" id="xoBoard"></div>

            <div id="xoWinModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 مبروك الفوز! 🎉</h3>
                    <p>لقد هزمت الروبوت اللطيف بذكائك الخارق!</p>
                    <button class="menu-btn restart-btn" id="restartXoWin">العب مرة أخرى 🔄</button>
                </div>
            </div>
            
            <div id="xoLoseModal" class="game-modal">
                <div class="modal-content bounce-anim" style="border-color: var(--color-orange);">
                    <h3>🤖 لعب رائع من الروبوت! 🤖</h3>
                    <p>فاز الروبوت هذه المرة، أعد المحاولة لتفوز عليه!</p>
                    <button class="menu-btn restart-btn" id="restartXoLose">أعد المحاولة 🔄</button>
                </div>
            </div>

            <div id="xoDrawModal" class="game-modal">
                <div class="modal-content bounce-anim" style="border-color: var(--color-blue);">
                    <h3>🤝 تعادل جميل! 🤝</h3>
                    <p>أنتم متعادلون في الذكاء! حاول مرة أخرى.</p>
                    <button class="menu-btn restart-btn" id="restartXoDraw">العب مجدداً 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const boardContainer = document.getElementById('xoBoard');

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function createBoard() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        boardContainer.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('xo-cell');
            cell.setAttribute('data-index', i);
            boardContainer.appendChild(cell);

            cell.addEventListener('click', () => handleCellClick(cell, i));
        }
    }

    function handleCellClick(cellEl, idx) {
        if (!gameActive || board[idx] !== '') return;

        // Player Turn
        board[idx] = playerSymbol;
        cellEl.innerHTML = `<img src="${window.getEmojiSVG(playerSymbol)}" class="game-svg-icon" style="width: 1.5em; height: 1.5em;">`;
        cellEl.classList.add('player-cell');
        cellEl.classList.add('bounce-anim');
        
        if (window.sound) window.sound.playClick();

        if (checkWin(playerSymbol)) {
            endGame('win');
            return;
        }

        if (checkDraw()) {
            endGame('draw');
            return;
        }

        // Robot Turn (with delay)
        gameActive = false; // lock player moves
        setTimeout(robotTurn, 600);
    }

    function robotTurn() {
        // Collect empty cell indices
        const emptyCells = [];
        board.forEach((val, idx) => {
            if (val === '') emptyCells.push(idx);
        });

        if (emptyCells.length === 0) return;

        // Simple Random AI
        const randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        board[randomIdx] = robotSymbol;
        
        const cellEl = boardContainer.querySelector(`.xo-cell[data-index="${randomIdx}"]`);
        cellEl.innerHTML = `<img src="${window.getEmojiSVG(robotSymbol)}" class="game-svg-icon" style="width: 1.5em; height: 1.5em;">`;
        cellEl.classList.add('robot-cell');
        cellEl.classList.add('bounce-anim');

        if (window.sound) window.sound.playFlip();

        if (checkWin(robotSymbol)) {
            endGame('lose');
            return;
        }

        if (checkDraw()) {
            endGame('draw');
            return;
        }

        gameActive = true; // unlock player moves
    }

    function checkWin(symbol) {
        return winningConditions.some(condition => {
            return condition.every(index => board[index] === symbol);
        });
    }

    function checkDraw() {
        return board.every(cell => cell !== '');
    }

    function endGame(result) {
        gameActive = false;
        setTimeout(() => {
            if (result === 'win') {
                if (window.sound) window.sound.playSuccess();
                document.getElementById('xoWinModal').classList.add('show');
            } else if (result === 'lose') {
                if (window.sound) window.sound.playFail();
                document.getElementById('xoLoseModal').classList.add('show');
            } else {
                if (window.sound) window.sound.playFlip();
                document.getElementById('xoDrawModal').classList.add('show');
            }
        }, 500);
    }

    function resetGame() {
        document.getElementById('xoWinModal').classList.remove('show');
        document.getElementById('xoLoseModal').classList.remove('show');
        document.getElementById('xoDrawModal').classList.remove('show');
        createBoard();
    }

    document.getElementById('restartXoWin').addEventListener('click', resetGame);
    document.getElementById('restartXoLose').addEventListener('click', resetGame);
    document.getElementById('restartXoDraw').addEventListener('click', resetGame);

    createBoard();
};
