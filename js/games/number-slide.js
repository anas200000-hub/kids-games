// Game: Number Sliding Puzzle (ترتيب الأرقام)
(function() {
    window.initNumberSlideGame = function(container) {
        let size = 3; // 3 for 3x3, 4 for 4x4
        let board = []; // 1D array representing grid
        let tiles = {}; // Map of tile value to DOM element
        let emptyIdx = 0;
        let moves = 0;
        let gameActive = true;

        const BOARD_PX = 300; // Fixed board size of 300px

        // Inject styles
        const styleId = 'ws-number-slide-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-numslide-layout {
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

                /* 3D Wood Container Frame */
                .numslide-board-outer {
                    position: relative;
                    width: ${BOARD_PX + 24}px;
                    height: ${BOARD_PX + 24}px;
                    background: linear-gradient(135deg, #a0522d, #5c2c0e);
                    border-radius: 24px;
                    padding: 12px;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), 
                                inset 0 3px 6px rgba(255, 255, 255, 0.3),
                                inset 0 -6px 12px rgba(0, 0, 0, 0.5);
                    box-sizing: border-box;
                    border: 4px solid #3e1e07;
                }

                .numslide-board-inner {
                    position: relative;
                    width: ${BOARD_PX}px;
                    height: ${BOARD_PX}px;
                    background-color: #3d1c02; /* dark wood base */
                    background-image: repeating-linear-gradient(45deg, #442003 0px, #442003 2px, #3a1a02 2px, #3a1a02 10px);
                    border-radius: 12px;
                    box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                /* Wood Tiles */
                .numslide-tile {
                    position: absolute;
                    background: linear-gradient(135deg, #e5c185, #c68a4c);
                    border-radius: 10px;
                    border: 2px solid #a0662d;
                    box-shadow: 0 5px 6px rgba(0, 0, 0, 0.35), 
                                inset 0 2px 0 rgba(255, 255, 255, 0.25), 
                                inset 0 -2px 0 rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4e2502;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                    box-sizing: border-box;
                    transition: left 0.22s cubic-bezier(0.25, 1, 0.5, 1), 
                                top 0.22s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .numslide-tile:active {
                    filter: brightness(0.95);
                }

                /* Inner dashed design to look like realistic wood engraving */
                .numslide-tile::before {
                    content: '';
                    position: absolute;
                    top: 5px; left: 5px; right: 5px; bottom: 5px;
                    border: 1.5px dashed rgba(60, 30, 5, 0.22);
                    border-radius: 6px;
                    pointer-events: none;
                }

                /* Mode toggle buttons */
                .numslide-toggle-container {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .numslide-toggle-btn {
                    padding: 6px 16px;
                    font-size: 14px;
                    font-weight: bold;
                    color: #8b4513;
                    background: #FFF;
                    border: 2.5px solid #c68a4c;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 3px 0 #c68a4c;
                    transition: all 0.15s ease;
                }

                .numslide-toggle-btn.active {
                    color: #FFF;
                    background: #c68a4c;
                    border-color: #8b4513;
                    box-shadow: 0 3px 0 #8b4513;
                    transform: translateY(1px);
                }
            `;
            document.head.appendChild(styleEl);
        }

        // HTML Layout template
        let html = `
            <div class="game-numslide-layout">
                <h2 class="game-title" style="color: #c68a4c; margin-bottom: 2px;">🔢 ترتيب الأرقام 🔢</h2>
                <p class="game-instructions" style="margin-bottom: 8px; font-size: 0.85rem;">قم بإزاحة البلاطات الخشبية لترتيب الأرقام تصاعدياً بشكل صحيح!</p>

                <div class="numslide-toggle-container">
                    <button class="numslide-toggle-btn active" id="wsBtn3x3">سهل (3x3)</button>
                    <button class="numslide-toggle-btn" id="wsBtn4x4">صعب (4x4)</button>
                </div>
                
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); box-sizing: border-box; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #8b4513; font-size: 15px;">الحركات: <span id="wsNumslideMoves">0</span></div>
                    <button class="hud-btn" id="wsNumslideResetBtn" style="padding: 4px 12px; font-size: 13px; background-color: #c68a4c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 3px 0 #8b4513;">إعادة 🔄</button>
                </div>

                <div class="numslide-board-outer">
                    <div class="numslide-board-inner" id="wsNumslideBoard">
                        <!-- Tiles injected here -->
                    </div>
                </div>

                <!-- Victory Modal -->
                <div id="wsNumslideWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 4px solid #4CAF50; margin: auto;">
                        <h3 style="color: #4CAF50; font-weight: 900;">🏆 بطل ذكي وممتاز! 🏆</h3>
                        <p style="margin: 8px 0;">لقد قمت بترتيب الأرقام بنجاح وبأقل عدد من الحركات!</p>
                        <div style="font-weight: bold; color: #8b4513; margin-bottom: 15px;">عدد الحركات: <span id="wsWinMoves">0</span></div>
                        <button class="menu-btn restart-btn" id="wsNumslideNextBtn" style="background-color: #4CAF50; box-shadow: 0 5px 0 #1b5e20; margin: 0 auto;">العب مجدداً 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const boardEl = document.getElementById('wsNumslideBoard');
        const movesText = document.getElementById('wsNumslideMoves');
        const resetBtn = document.getElementById('wsNumslideResetBtn');
        const winModal = document.getElementById('wsNumslideWinModal');
        const nextBtn = document.getElementById('wsNumslideNextBtn');
        const winMovesText = document.getElementById('wsWinMoves');

        const btn3x3 = document.getElementById('wsBtn3x3');
        const btn4x4 = document.getElementById('wsBtn4x4');

        // Swap difficulty size
        btn3x3.addEventListener('click', () => {
            if (size === 3) return;
            if (window.sound) window.sound.playClick();
            size = 3;
            btn3x3.classList.add('active');
            btn4x4.classList.remove('active');
            initPuzzle();
        });

        btn4x4.addEventListener('click', () => {
            if (size === 4) return;
            if (window.sound) window.sound.playClick();
            size = 4;
            btn4x4.classList.add('active');
            btn3x3.classList.remove('active');
            initPuzzle();
        });

        // Initialize / Shuffle Board
        function initPuzzle() {
            boardEl.innerHTML = '';
            tiles = {};
            board = [];
            moves = 0;
            gameActive = true;
            movesText.innerText = '0';
            winModal.style.display = 'none';

            const totalCells = size * size;
            const cellSize = BOARD_PX / size;

            // Generate solved state (1 to totalCells-1, then 0 for empty)
            for (let i = 1; i < totalCells; i++) {
                board.push(i);
            }
            board.push(0); // 0 is empty slot
            emptyIdx = totalCells - 1;

            // Shuffle by doing 120 valid reverse slides
            shuffleBoard(120);

            // Create and position DOM tile elements
            for (let i = 0; i < totalCells; i++) {
                const val = board[i];
                if (val === 0) continue; // Skip empty slot

                const el = document.createElement('div');
                el.className = 'numslide-tile';
                el.innerText = val;
                
                // Styling properties
                el.style.width = `${cellSize - 6}px`;
                el.style.height = `${cellSize - 6}px`;
                el.style.fontSize = size === 3 ? '36px' : '26px';

                // Position on screen
                const r = Math.floor(i / size);
                const c = i % size;
                el.style.top = `${r * cellSize + 3}px`;
                el.style.left = `${c * cellSize + 3}px`;

                // Handle click/tap to slide
                el.addEventListener('click', () => {
                    if (!gameActive) return;
                    // Find current index of this tile in the board array
                    const currentIdx = board.indexOf(val);
                    trySlide(currentIdx);
                });

                boardEl.appendChild(el);
                tiles[val] = el;
            }
        }

        // Shuffle by making random valid moves
        function shuffleBoard(steps) {
            let lastMoved = -1;
            for (let i = 0; i < steps; i++) {
                const neighbors = getNeighbors(emptyIdx);
                // Filter out the last moved cell to reduce back-and-forth repetitions
                const filteredNeighbors = neighbors.filter(n => n !== lastMoved);
                const finalNeighbors = filteredNeighbors.length > 0 ? filteredNeighbors : neighbors;
                
                // Pick a random neighbor and swap
                const swapIdx = finalNeighbors[Math.floor(Math.random() * finalNeighbors.length)];
                
                // Swap values
                board[emptyIdx] = board[swapIdx];
                board[swapIdx] = 0;

                lastMoved = emptyIdx;
                emptyIdx = swapIdx;
            }
        }

        // Find valid adjacent indices
        function getNeighbors(idx) {
            const r = Math.floor(idx / size);
            const c = idx % size;
            const res = [];

            if (r - 1 >= 0) res.push(idx - size); // Up
            if (r + 1 < size) res.push(idx + size); // Down
            if (c - 1 >= 0) res.push(idx - 1);    // Left
            if (c + 1 < size) res.push(idx + 1);    // Right

            return res;
        }

        // Slide tile into empty space if adjacent
        function trySlide(tileIdx) {
            const neighbors = getNeighbors(tileIdx);
            
            if (neighbors.includes(emptyIdx)) {
                // Perform swap
                const val = board[tileIdx];
                board[emptyIdx] = val;
                board[tileIdx] = 0;

                // Play sound
                if (window.sound) {
                    window.sound.playClick();
                }

                // Update visual positions
                const cellSize = BOARD_PX / size;
                const el = tiles[val];

                // Set new top/left position
                const newRow = Math.floor(emptyIdx / size);
                const newCol = emptyIdx % size;
                el.style.top = `${newRow * cellSize + 3}px`;
                el.style.left = `${newCol * cellSize + 3}px`;

                emptyIdx = tileIdx;
                moves++;
                movesText.innerText = moves;

                // Check Win
                checkWin();
            }
        }

        // Verify if tiles are in ascending order
        function checkWin() {
            const totalCells = size * size;
            for (let i = 0; i < totalCells - 1; i++) {
                if (board[i] !== i + 1) return;
            }
            // If all matched, win!
            gameActive = false;
            winMovesText.innerText = moves;

            setTimeout(() => {
                if (window.sound) {
                    window.sound.playSuccess();
                }
                winModal.style.display = 'flex';
            }, 300);
        }

        // HUD Listeners
        resetBtn.addEventListener('click', () => {
            if (window.sound) window.sound.playFlip();
            initPuzzle();
        });

        nextBtn.addEventListener('click', () => {
            if (window.sound) window.sound.playFlip();
            initPuzzle();
        });

        // Start first game
        initPuzzle();

        // Cleanup listener on exit
        container.addEventListener('game-exit', () => {
            gameActive = false;
        });
    };
})();
