// Game: Kids Candy Match (تطابق الحلوى للأطفال)
(function() {
    window.initCandyMatchGame = function(container) {
        let score = 0;
        const targetScore = 400;
        let board = [];
        let selectedCell = null;
        let isProcessing = false; // Lock user actions during cascading/animations
        let hintTimer = null;

        const ROWS = 6;
        const COLS = 6;
        const CELL_SIZE = 55; // 55px width/height

        const CANDY_TYPES = ['🍬', '🍭', '🍩', '🍪', '🧁', '🍫'];

        // Mapping emojis to CSS class backgrounds
        const CANDY_CLASSES = {
            '🍬': 'candy-type-candy',
            '🍭': 'candy-type-lollipop',
            '🍩': 'candy-type-donut',
            '🍪': 'candy-type-cookie',
            '🧁': 'candy-type-cupcake',
            '🍫': 'candy-type-chocolate'
        };

        // Inject custom styles
        const styleId = 'ws-candy-match-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-candy-layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    font-family: var(--font-kids);
                    user-select: none;
                    direction: rtl;
                }

                .candy-board-wrapper {
                    position: relative;
                    width: 342px;
                    height: 342px;
                    background: rgba(255, 255, 255, 0.45);
                    border-radius: 20px;
                    border: 4px solid #FF8E53;
                    padding: 6px;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .candy-board {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                /* High Quality 3D Candy Capsule Item */
                .candy-item {
                    position: absolute;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.18), 
                                inset 0 3px 0 rgba(255,255,255,0.4), 
                                inset 0 -3px 0 rgba(0,0,0,0.18);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    transition: left 0.22s cubic-bezier(0.25, 1, 0.5, 1), top 0.22s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s;
                    user-select: none;
                    z-index: 2;
                    touch-action: none;
                }

                /* Specular gloss shine overlay on each candy */
                .candy-item::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    right: 2px;
                    height: 20px;
                    border-radius: 50% 50% 0 0 / 70% 70% 0 0;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%);
                    pointer-events: none;
                    z-index: 3;
                }

                /* Type-specific vibrant kids gradients */
                .candy-item.candy-type-candy { background: linear-gradient(135deg, #00d2ff, #0066eb); }
                .candy-item.candy-type-lollipop { background: linear-gradient(135deg, #ff9ff3, #f368e0); }
                .candy-item.candy-type-donut { background: linear-gradient(135deg, #ffbe76, #f0932b); }
                .candy-item.candy-type-cookie { background: linear-gradient(135deg, #ffdd59, #ffd32a); }
                .candy-item.candy-type-cupcake { background: linear-gradient(135deg, #32ff7e, #3ae374); }
                .candy-item.candy-type-chocolate { background: linear-gradient(135deg, #cd84f1, #7d5fff); }

                .candy-item.selected {
                    transform: scale(1.15);
                    box-shadow: 0 0 14px rgba(255, 235, 59, 0.7),
                                inset 0 3px 0 rgba(255,255,255,0.4), 
                                inset 0 -3px 0 rgba(0,0,0,0.18);
                    z-index: 5;
                    border-color: #FFEB3B;
                }

                .candy-item.popping {
                    transform: scale(0);
                    opacity: 0;
                    transition: transform 0.22s ease-out, opacity 0.22s ease-out;
                }

                .candy-progress-bar-container {
                    width: 100%;
                    height: 14px;
                    background: #eee;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                    margin: 8px 0;
                }

                .candy-progress-bar {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #FF6B8B, #FF8E53);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }

                /* Sparkling effects */
                .ws-sparkle {
                    position: absolute;
                    font-size: 1.3rem;
                    pointer-events: none;
                    z-index: 100;
                    animation: sparkleExplode 0.5s ease-out forwards;
                }

                @keyframes sparkleExplode {
                    0% {
                        transform: translate(0, 0) scale(0.4) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(1.15) rotate(180deg);
                        opacity: 0;
                    }
                }

                /* Hint pulse animation */
                @keyframes hintPulseEffect {
                    0%, 100% { transform: scale(1); filter: none; }
                    50% { transform: scale(1.18); filter: drop-shadow(0 0 12px #FFD700); }
                }

                .candy-item.hint-pulse {
                    animation: hintPulseEffect 1.2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(styleEl);
        }

        // HTML Layout template
        let html = `
            <div class="game-candy-layout">
                <h2 class="game-title" style="color: #FF5858; margin-bottom: 2px;">🍬 تطابق الحلوى اللذيذة 🍬</h2>
                <p class="game-instructions" style="margin-bottom: 6px;">صل 3 حلويات متشابهة لتفجرها! اجمع 400 نقطة لتفوز!</p>
                
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); box-sizing: border-box; margin-bottom: 6px;">
                    <div style="font-weight: bold; color: #E91E63; font-size: 15px;">النقاط: <span id="wsCandyScore">0</span> / 400</div>
                    <button class="hud-btn" id="wsCandyResetBtn" style="padding: 4px 10px; font-size: 13px;">إعادة 🔄</button>
                </div>

                <div class="candy-progress-bar-container">
                    <div class="candy-progress-bar" id="wsCandyProgress"></div>
                </div>

                <div class="candy-board-wrapper">
                    <div class="candy-board" id="wsCandyBoard">
                        <!-- Absolutes divs rendered dynamically -->
                    </div>
                </div>

                <!-- Win Modal -->
                <div id="wsCandyWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-weight: 900;">🏆 بطل تطابق الحلوى! 🏆</h3>
                        <p>تهانينا! لقد قمت بفرقعة كل الحلويات بنجاح وجمعت النقاط!</p>
                        <button class="menu-btn restart-btn" id="wsCandyNextBtn" style="background-color: #4CAF50; box-shadow: 0 5px 0 #1b5e20; margin: 15px auto 0;">العب مجدداً 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const boardEl = document.getElementById('wsCandyBoard');
        const scoreText = document.getElementById('wsCandyScore');
        const progressBar = document.getElementById('wsCandyProgress');
        const resetBtn = document.getElementById('wsCandyResetBtn');
        const winModal = document.getElementById('wsCandyWinModal');
        const nextBtn = document.getElementById('wsCandyNextBtn');

        let touchStartX = 0;
        let touchStartY = 0;
        let dragCell = null;

        // Initialize board logic
        function initBoard() {
            board = [];
            for (let r = 0; r < ROWS; r++) {
                board[r] = [];
                for (let c = 0; c < COLS; c++) {
                    // Prevent matches on startup
                    let allowedTypes = [...CANDY_TYPES];
                    if (c >= 2) {
                        const typeLeft1 = board[r][c-1]?.type;
                        const typeLeft2 = board[r][c-2]?.type;
                        if (typeLeft1 && typeLeft1 === typeLeft2) {
                            allowedTypes = allowedTypes.filter(t => t !== typeLeft1);
                        }
                    }
                    if (r >= 2) {
                        const typeUp1 = board[r-1][c]?.type;
                        const typeUp2 = board[r-2][c]?.type;
                        if (typeUp1 && typeUp1 === typeUp2) {
                            allowedTypes = allowedTypes.filter(t => t !== typeUp1);
                        }
                    }

                    const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
                    board[r][c] = createCandy(type, r, c);
                }
            }
            renderBoardElements();
            resetHintTimer();
        }

        // Create Candy object helper
        function createCandy(type, r, c) {
            const el = document.createElement('div');
            const typeClass = CANDY_CLASSES[type] || '';
            el.className = `candy-item ${typeClass}`;
            el.innerText = type;
            el.style.left = `${c * CELL_SIZE}px`;
            el.style.top = `${r * CELL_SIZE}px`;
            el.setAttribute('data-row', r);
            el.setAttribute('data-col', c);

            // Click listener
            el.addEventListener('mousedown', handleCellSelect);
            
            // Touch Swipe listeners
            el.addEventListener('touchstart', (e) => {
                if (isProcessing) return;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                dragCell = { r: parseInt(el.getAttribute('data-row')), c: parseInt(el.getAttribute('data-col')) };
                
                // Also trigger select
                selectCell(dragCell.r, dragCell.c);
            }, { passive: true });

            el.addEventListener('touchmove', (e) => {
                if (isProcessing || !dragCell) return;
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const diffX = touchX - touchStartX;
                const diffY = touchY - touchStartY;

                // Swipe distance threshold
                if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
                    let targetR = dragCell.r;
                    let targetC = dragCell.c;

                    if (Math.abs(diffX) > Math.abs(diffY)) {
                        targetC += diffX > 0 ? 1 : -1;
                    } else {
                        targetR += diffY > 0 ? 1 : -1;
                    }

                    // Check bounds
                    if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
                        const cellA = dragCell;
                        dragCell = null; // Lock swipe trigger once fired
                        executeSwap(cellA.r, cellA.c, targetR, targetC);
                    }
                }
            }, { passive: true });

            return { type, element: el, r, c };
        }

        // Render board DOM elements
        function renderBoardElements() {
            boardEl.innerHTML = '';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    boardEl.appendChild(board[r][c].element);
                }
            }
        }

        // Handle cell selection on click
        function handleCellSelect(e) {
            if (isProcessing) return;
            const el = e.currentTarget;
            const r = parseInt(el.getAttribute('data-row'));
            const c = parseInt(el.getAttribute('data-col'));
            selectCell(r, c);
        }

        // Perform selection highlights
        function selectCell(r, c) {
            clearHints();
            resetHintTimer();

            if (selectedCell === null) {
                selectedCell = { r, c };
                board[r][c].element.classList.add('selected');
                if (window.sound) {
                    window.sound.playClick();
                }
            } else {
                const prev = selectedCell;
                board[prev.r][prev.c].element.classList.remove('selected');
                selectedCell = null;

                // Check adjacency (distance === 1)
                const dist = Math.abs(prev.r - r) + Math.abs(prev.c - c);
                if (dist === 1) {
                    executeSwap(prev.r, prev.c, r, c);
                } else {
                    // Re-select new cell
                    selectedCell = { r, c };
                    board[r][c].element.classList.add('selected');
                    if (window.sound) {
                        window.sound.playClick();
                    }
                }
            }
        }

        // Swap execution and validation
        function executeSwap(r1, c1, r2, c2) {
            isProcessing = true;
            clearHints();

            const candy1 = board[r1][c1];
            const candy2 = board[r2][c2];

            // Animate swap visually
            candy1.element.style.left = `${c2 * CELL_SIZE}px`;
            candy1.element.style.top = `${r2 * CELL_SIZE}px`;
            candy2.element.style.left = `${c1 * CELL_SIZE}px`;
            candy2.element.style.top = `${r1 * CELL_SIZE}px`;

            candy1.element.setAttribute('data-row', r2);
            candy1.element.setAttribute('data-col', c2);
            candy2.element.setAttribute('data-row', r1);
            candy2.element.setAttribute('data-col', c1);

            // Update logical model
            board[r1][c1] = candy2;
            board[r2][c2] = candy1;

            candy1.r = r2; candy1.c = c2;
            candy2.r = r1; candy2.c = c1;

            // Wait for swap transition to finish (220ms)
            setTimeout(() => {
                const matches = checkMatches();
                if (matches.length > 0) {
                    // Match found! Process pop and cascades
                    processMatches(matches);
                } else {
                    // No matches: Swap back
                    if (window.sound) {
                        window.sound.playFail();
                    }
                    candy1.element.style.left = `${c1 * CELL_SIZE}px`;
                    candy1.element.style.top = `${r1 * CELL_SIZE}px`;
                    candy2.element.style.left = `${c2 * CELL_SIZE}px`;
                    candy2.element.style.top = `${r2 * CELL_SIZE}px`;

                    candy1.element.setAttribute('data-row', r1);
                    candy1.element.setAttribute('data-col', c1);
                    candy2.element.setAttribute('data-row', r2);
                    candy2.element.setAttribute('data-col', c2);

                    board[r1][c1] = candy1;
                    board[r2][c2] = candy2;

                    candy1.r = r1; candy1.c = c1;
                    candy2.r = r2; candy2.c = c2;

                    setTimeout(() => {
                        isProcessing = false;
                        resetHintTimer();
                    }, 220);
                }
            }, 230);
        }

        // Scan board for match-3 matches
        function checkMatches() {
            let matches = [];

            // 1. Horizontal scans
            for (let r = 0; r < ROWS; r++) {
                let matchLength = 1;
                for (let c = 0; c < COLS; c++) {
                    let isMatchEnd = false;
                    if (c === COLS - 1) {
                        isMatchEnd = true;
                    } else if (board[r][c].type !== board[r][c+1].type) {
                        isMatchEnd = true;
                    }

                    if (isMatchEnd) {
                        if (matchLength >= 3) {
                            for (let i = 0; i < matchLength; i++) {
                                matches.push({ r, c: c - i });
                            }
                        }
                        matchLength = 1;
                    } else {
                        matchLength++;
                    }
                }
            }

            // 2. Vertical scans
            for (let c = 0; c < COLS; c++) {
                let matchLength = 1;
                for (let r = 0; r < ROWS; r++) {
                    let isMatchEnd = false;
                    if (r === ROWS - 1) {
                        isMatchEnd = true;
                    } else if (board[r][c].type !== board[r+1][c].type) {
                        isMatchEnd = true;
                    }

                    if (isMatchEnd) {
                        if (matchLength >= 3) {
                            for (let i = 0; i < matchLength; i++) {
                                matches.push({ r: r - i, c });
                            }
                        }
                        matchLength = 1;
                    } else {
                        matchLength++;
                    }
                }
            }

            // Remove duplicates
            const unique = [];
            const seen = new Set();
            matches.forEach(m => {
                const key = `${m.r},${m.c}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(m);
                }
            });

            return unique;
        }

        // Emit pop particles (sparkles) when match is cleared
        function spawnPopSparkles(r, c) {
            const sparkles = ['✨', '⭐', '💥'];
            const cellCenterLeft = c * CELL_SIZE + (CELL_SIZE / 2) - 10;
            const cellCenterTop = r * CELL_SIZE + (CELL_SIZE / 2) - 10;

            for (let i = 0; i < 4; i++) {
                const sp = document.createElement('div');
                sp.className = 'ws-sparkle';
                sp.innerText = sparkles[Math.floor(Math.random() * sparkles.length)];
                sp.style.left = `${cellCenterLeft}px`;
                sp.style.top = `${cellCenterTop}px`;

                // Calculate random trajectory angles
                const angle = (Math.PI * 2 / 4) * i + (Math.random() * 0.4 - 0.2);
                const distance = Math.random() * 25 + 25; // 25px to 50px
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;

                sp.style.setProperty('--tx', `${tx}px`);
                sp.style.setProperty('--ty', `${ty}px`);

                boardEl.appendChild(sp);
                setTimeout(() => sp.remove(), 500); // Clean up sparkle
            }
        }

        // Process popping, falling, and refill cascades
        function processMatches(matches) {
            if (window.sound) {
                window.sound.playPop();
            }

            // Animate matching items shrinking and trigger sparkles
            matches.forEach(m => {
                const candy = board[m.r][m.c];
                if (candy && candy.element) {
                    candy.element.classList.add('popping');
                }
                // Emit gold stars sparkles at this cell position
                spawnPopSparkles(m.r, m.c);
            });

            // Wait for pop animation (220ms)
            setTimeout(() => {
                // Remove elements from DOM
                matches.forEach(m => {
                    const candy = board[m.r][m.c];
                    if (candy && candy.element) {
                        candy.element.remove();
                    }
                    board[m.r][m.c] = null;
                });

                // Update score
                score += matches.length * 10;
                scoreText.innerText = score;
                const pct = Math.min(100, (score / targetScore) * 100);
                progressBar.style.width = `${pct}%`;

                // Gravity fall & refill columns
                applyGravity();

            }, 220);
        }

        // Apply gravity drop and spawn replacements
        function applyGravity() {
            let maxFallRows = 0;

            for (let c = 0; c < COLS; c++) {
                let emptySpacesCount = 0;
                
                // Walk from bottom to top
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c] === null) {
                        emptySpacesCount++;
                    } else if (emptySpacesCount > 0) {
                        // Drop down existing candy logically
                        const candy = board[r][c];
                        const targetR = r + emptySpacesCount;

                        board[targetR][c] = candy;
                        board[r][c] = null;

                        candy.r = targetR;
                        candy.element.setAttribute('data-row', targetR);
                        candy.element.style.top = `${targetR * CELL_SIZE}px`;

                        maxFallRows = Math.max(maxFallRows, emptySpacesCount);
                    }
                }

                // Spawn new candies at the top
                for (let k = 0; k < emptySpacesCount; k++) {
                    const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
                    const spawnR = -1 - k; // staggered above the board
                    const targetR = emptySpacesCount - 1 - k;

                    const newCandy = createCandy(type, targetR, c);
                    
                    // Spawn above visually
                    newCandy.element.style.top = `${spawnR * CELL_SIZE}px`;
                    boardEl.appendChild(newCandy.element);

                    // Trigger drop visually in next frame
                    setTimeout(() => {
                        newCandy.element.style.top = `${targetR * CELL_SIZE}px`;
                    }, 20);

                    board[targetR][c] = newCandy;
                    maxFallRows = Math.max(maxFallRows, emptySpacesCount);
                }
            }

            // Wait for drop animation to complete (approx 250ms)
            setTimeout(() => {
                // Scan for cascades / chain reactions
                const newMatches = checkMatches();
                if (newMatches.length > 0) {
                    processMatches(newMatches);
                } else {
                    // Processing complete: unlock user actions
                    isProcessing = false;
                    resetHintTimer();

                    // Win check
                    if (score >= targetScore) {
                        triggerWin();
                    }
                }
            }, 260);
        }

        // Win handler
        function triggerWin() {
            isProcessing = true;
            clearTimeout(hintTimer);
            if (window.sound) {
                window.sound.playSuccess();
            }
            winModal.style.display = 'flex';
        }

        // --- HINT ENGINE (KIDS HELPER) ---

        // Scan board for any move that results in a match-3
        function findPotentialMove() {
            const inside = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

            const testMatch = (r1, c1, r2, c2) => {
                const temp = board[r1][c1].type;
                board[r1][c1].type = board[r2][c2].type;
                board[r2][c2].type = temp;

                const matches = checkMatches();

                board[r2][c2].type = board[r1][c1].type;
                board[r1][c1].type = temp;

                return matches.length > 0;
            };

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (inside(r, c + 1)) {
                        if (testMatch(r, c, r, c + 1)) {
                            return { r1: r, c1: c, r2: r, c2: c + 1 };
                        }
                    }
                    if (inside(r + 1, c)) {
                        if (testMatch(r, c, r + 1, c)) {
                            return { r1: r, c1: c, r2: r + 1, c2: c };
                        }
                    }
                }
            }
            return null; // No moves
        }

        // Show hints by pulsing candies
        function showHint() {
            if (isProcessing || selectedCell) return;
            const move = findPotentialMove();
            if (move) {
                const c1 = board[move.r1][move.c1];
                const c2 = board[move.r2][move.c2];
                if (c1 && c1.element) c1.element.classList.add('hint-pulse');
                if (c2 && c2.element) c2.element.classList.add('hint-pulse');
            }
        }

        function clearHints() {
            const elements = boardEl.querySelectorAll('.candy-item');
            elements.forEach(el => el.classList.remove('hint-pulse'));
        }

        function resetHintTimer() {
            clearTimeout(hintTimer);
            hintTimer = setTimeout(() => {
                showHint();
            }, 5000); // 5 seconds wait
        }

        // --- HUD ACTIONS ---

        function resetGame() {
            score = 0;
            scoreText.innerText = '0';
            progressBar.style.width = '0%';
            selectedCell = null;
            isProcessing = false;
            
            winModal.style.display = 'none';
            
            initBoard();
        }

        resetBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            resetGame();
        });

        nextBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            resetGame();
        });

        resetGame();

        // Cleanup listener on exit
        container.addEventListener('game-exit', () => {
            clearTimeout(hintTimer);
            isProcessing = false;
        });
    };
})();
