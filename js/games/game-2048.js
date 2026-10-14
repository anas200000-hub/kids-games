// Game: 2048 (دمج الأرقام للأطفال والمحترفين)
window.initGame2048 = function (container) {
    let board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('kids_2048_best') || '0', 10);
    let won = false;
    let gameOver = false;
    let keepPlaying = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isMoving = false;

    // Tile definition: background color, font color, and friendly kids emoji
    const tileConfig = {
        2:    { bg: '#eee4da', text: '#776e65', emoji: '🐣' },
        4:    { bg: '#ede0c8', text: '#776e65', emoji: '🐥' },
        8:    { bg: '#f2b179', text: '#f9f6f2', emoji: '🐰' },
        16:   { bg: '#f59563', text: '#f9f6f2', emoji: '🦊' },
        32:   { bg: '#f67c5f', text: '#f9f6f2', emoji: '🐼' },
        64:   { bg: '#f65e3b', text: '#f9f6f2', emoji: '🐯' },
        128:  { bg: '#edcf72', text: '#f9f6f2', emoji: '🦁' },
        256:  { bg: '#edcc61', text: '#f9f6f2', emoji: '🦄' },
        512:  { bg: '#edc850', text: '#f9f6f2', emoji: '🐲' },
        1024: { bg: '#edc53f', text: '#f9f6f2', emoji: '👑' },
        2048: { bg: '#edc22e', text: '#f9f6f2', emoji: '🏆' },
        4096: { bg: '#3c3a32', text: '#f9f6f2', emoji: '⭐' }
    };

    const html = `
        <div class="game-2048-container" id="game2048Container">
            <!-- Header bar with scores & restart -->
            <div class="g2048-header">
                <div class="g2048-title-wrap">
                    <h2 class="g2048-title">2048</h2>
                    <span class="g2048-subtitle">اجمع الأرقام وطابقها!</span>
                </div>
                <div class="g2048-scores">
                    <div class="g2048-score-box">
                        <span class="g2048-score-label">النقاط</span>
                        <span class="g2048-score-val" id="g2048Score">0</span>
                    </div>
                    <div class="g2048-score-box">
                        <span class="g2048-score-label">أفضل رقم</span>
                        <span class="g2048-score-val" id="g2048Best">${bestScore}</span>
                    </div>
                    <button class="g2048-btn g2048-restart-btn" id="g2048RestartBtn" title="لعبة جديدة">🔄</button>
                </div>
            </div>

            <!-- 4x4 Grid Board -->
            <div class="g2048-board-wrapper" id="g2048BoardWrap">
                <div class="g2048-board" id="g2048Board">
                    <!-- Background cells -->
                    <div class="g2048-grid-bg">
                        ${Array(16).fill('<div class="g2048-cell-bg"></div>').join('')}
                    </div>
                    <!-- Active Tile Container -->
                    <div class="g2048-tile-container" id="g2048Tiles"></div>
                </div>

                <!-- Game Over / Win Overlay -->
                <div class="g2048-overlay" id="g2048Overlay" style="display: none;">
                    <div class="g2048-message" id="g2048Msg"></div>
                    <div class="g2048-overlay-actions">
                        <button class="g2048-btn g2048-action-btn" id="g2048OverlayBtn">إعادة المحاولة</button>
                        <button class="g2048-btn g2048-action-btn secondary" id="g2048KeepPlayingBtn" style="display: none;">متابعة اللعب</button>
                    </div>
                </div>
            </div>

            <!-- Touch / Virtual D-pad for easy mobile and kid play -->
            <div class="g2048-controls">
                <div class="g2048-hint">اسحب بإصبعك على اللوحة أو استخدم الأسهم:</div>
                <div class="g2048-dpad">
                    <button class="g2048-arrow-btn up" data-dir="up">⬆️</button>
                    <div class="g2048-dpad-row">
                        <button class="g2048-arrow-btn left" data-dir="left">⬅️</button>
                        <button class="g2048-arrow-btn down" data-dir="down">⬇️</button>
                        <button class="g2048-arrow-btn right" data-dir="right">➡️</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const boardWrap = document.getElementById('g2048BoardWrap');
    const tileContainer = document.getElementById('g2048Tiles');
    const scoreVal = document.getElementById('g2048Score');
    const bestVal = document.getElementById('g2048Best');
    const restartBtn = document.getElementById('g2048RestartBtn');
    const overlay = document.getElementById('g2048Overlay');
    const overlayMsg = document.getElementById('g2048Msg');
    const overlayBtn = document.getElementById('g2048OverlayBtn');
    const keepPlayingBtn = document.getElementById('g2048KeepPlayingBtn');

    // Add initial tiles
    function startNewGame() {
        board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
        won = false;
        gameOver = false;
        keepPlaying = false;
        overlay.style.display = 'none';
        keepPlayingBtn.style.display = 'none';
        scoreVal.innerText = '0';
        addRandomTile();
        addRandomTile();
        renderBoard();
    }

    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length === 0) return null;
        const spot = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const val = Math.random() < 0.9 ? 2 : 4;
        board[spot.r][spot.c] = val;
        return { r: spot.r, c: spot.c, val };
    }

    // Render Board Tiles
    function renderBoard(mergedCoords = [], newCoords = null) {
        tileContainer.innerHTML = '';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = board[r][c];
                if (val > 0) {
                    const tile = document.createElement('div');
                    tile.className = `g2048-tile g2048-tile-${val}`;
                    
                    // Position calculations in percentage
                    tile.style.top = `${r * 25}%`;
                    tile.style.left = `${c * 25}%`;

                    const conf = tileConfig[val] || { bg: '#3c3a32', text: '#f9f6f2', emoji: '🌟' };
                    tile.style.backgroundColor = conf.bg;
                    tile.style.color = conf.text;

                    // Kids font size scaling for 3/4 digits
                    if (val >= 1024) {
                        tile.classList.add('small-font');
                    } else if (val >= 128) {
                        tile.classList.add('mid-font');
                    }

                    // Merged or New pop animations
                    const isMerged = mergedCoords.some(m => m.r === r && m.c === c);
                    const isNew = newCoords && newCoords.r === r && newCoords.c === c;
                    if (isMerged) tile.classList.add('tile-merged');
                    if (isNew) tile.classList.add('tile-new');

                    tile.innerHTML = `
                        <div class="g2048-tile-emoji">${conf.emoji}</div>
                        <div class="g2048-tile-val">${val}</div>
                    `;
                    tileContainer.appendChild(tile);
                }
            }
        }
        scoreVal.innerText = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('kids_2048_best', bestScore);
            bestVal.innerText = bestScore;
        }
    }

    // Move & Merge Algorithms
    function move(dir) {
        if (gameOver) return;
        if (isMoving) return;
        isMoving = true;

        let moved = false;
        let scoreGain = 0;
        const mergedList = [];

        // Slide row left
        function slide(row, rIdx, isCol, reverse) {
            // Filter non-zero
            let arr = row.filter(x => x !== 0);
            let newRow = [];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === arr[i + 1]) {
                    const combined = arr[i] * 2;
                    newRow.push(combined);
                    scoreGain += combined;
                    
                    // Record merge coordinate for pop animation
                    const targetIdx = newRow.length - 1;
                    const finalIdx = reverse ? 3 - targetIdx : targetIdx;
                    if (isCol) {
                        mergedList.push({ r: finalIdx, c: rIdx });
                    } else {
                        mergedList.push({ r: rIdx, c: finalIdx });
                    }

                    if (combined === 2048 && !won && !keepPlaying) {
                        won = true;
                    }
                    i++; // skip next merged
                } else {
                    newRow.push(arr[i]);
                }
            }
            while (newRow.length < 4) {
                newRow.push(0);
            }
            return newRow;
        }

        const oldBoard = JSON.stringify(board);

        if (dir === 'left') {
            for (let r = 0; r < 4; r++) {
                board[r] = slide(board[r], r, false, false);
            }
        } else if (dir === 'right') {
            for (let r = 0; r < 4; r++) {
                const reversed = [...board[r]].reverse();
                board[r] = slide(reversed, r, false, true).reverse();
            }
        } else if (dir === 'up') {
            for (let c = 0; c < 4; c++) {
                const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
                const newCol = slide(col, c, true, false);
                for (let r = 0; r < 4; r++) board[r][c] = newCol[r];
            }
        } else if (dir === 'down') {
            for (let c = 0; c < 4; c++) {
                const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
                const newCol = slide(col, c, true, true).reverse();
                for (let r = 0; r < 4; r++) board[r][c] = newCol[r];
            }
        }

        if (oldBoard !== JSON.stringify(board)) {
            moved = true;
            score += scoreGain;
            if (scoreGain > 0) {
                if (window.sound) window.sound.playSuccess();
            } else {
                if (window.sound) window.sound.playBubble();
            }

            const newTile = addRandomTile();
            renderBoard(mergedList, newTile);

            if (won && !keepPlaying) {
                setTimeout(showWinScreen, 300);
            } else if (!hasMovesLeft()) {
                gameOver = true;
                setTimeout(showGameOverScreen, 300);
            }
        }

        setTimeout(() => {
            isMoving = false;
        }, 120);
    }

    function hasMovesLeft() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) return true;
                if (r < 3 && board[r][c] === board[r + 1][c]) return true;
                if (c < 3 && board[r][c] === board[r][c + 1]) return true;
            }
        }
        return false;
    }

    function showWinScreen() {
        if (window.sound) window.sound.playSuccess();
        overlayMsg.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 8px;">🏆🎉</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #2e7d32;">أحسنت صنعاً!</div>
            <div style="font-size: 1rem; color: #555; margin-top: 5px;">وصلت إلى الرقم 2048 بنجاح!</div>
        `;
        overlayBtn.innerText = 'لعبة جديدة';
        keepPlayingBtn.style.display = 'inline-block';
        overlay.style.display = 'flex';
    }

    function showGameOverScreen() {
        if (window.sound) window.sound.playFail();
        overlayMsg.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 8px;">😢👏</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #d32f2f;">انتهت الحركات!</div>
            <div style="font-size: 1rem; color: #555; margin-top: 5px;">نقاطك: ${score}</div>
        `;
        overlayBtn.innerText = 'حاول ثانية';
        keepPlayingBtn.style.display = 'none';
        overlay.style.display = 'flex';
    }

    // Keyboard controls
    function handleKeyDown(e) {
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            move('up');
        } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            move('down');
        } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            move('left');
        } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            move('right');
        }
    }

    // Touch swipe controls
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }

    function handleTouchEnd(e) {
        if (e.changedTouches.length === 1) {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Minimum swipe threshold
            if (Math.max(absX, absY) > 25) {
                if (absX > absY) {
                    move(deltaX > 0 ? 'right' : 'left');
                } else {
                    move(deltaY > 0 ? 'down' : 'up');
                }
            }
        }
    }

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    boardWrap.addEventListener('touchstart', handleTouchStart, { passive: true });
    boardWrap.addEventListener('touchend', handleTouchEnd, { passive: true });

    // D-Pad buttons
    container.querySelectorAll('.g2048-arrow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-dir');
            move(dir);
        });
    });

    restartBtn.addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        startNewGame();
    });

    overlayBtn.addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        startNewGame();
    });

    keepPlayingBtn.addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        keepPlaying = true;
        overlay.style.display = 'none';
    });

    // Cleanup when user exits game
    container.addEventListener('game-exit', () => {
        window.removeEventListener('keydown', handleKeyDown);
        boardWrap.removeEventListener('touchstart', handleTouchStart);
        boardWrap.removeEventListener('touchend', handleTouchEnd);
    });

    // Start initial game
    startNewGame();
};
