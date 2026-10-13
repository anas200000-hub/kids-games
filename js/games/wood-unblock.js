// Game: Wood Block Unblock (فك الحطب)
(function() {
    window.initWoodUnblockGame = function(container) {
        let level = 1;
        let blocks = [];
        let gameActive = true;

        const GRID_SIZE = 6;
        const CELL_SIZE = 52; // 52px per cell
        const BOARD_PX = GRID_SIZE * CELL_SIZE; // 312px

        // --- Verified Solvable Pools ---
        const EASY_POOL = [
            // Layout 1
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 3, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 1, len: 2, dir: 'v' }
            ],
            // Layout 2
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 1, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 4, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 0, c: 4, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 0, len: 2, dir: 'h' }
            ],
            // Layout 3
            [
                { id: 0, r: 2, c: 0, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 2, len: 2, dir: 'v' },
                { id: 2, r: 3, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 1, c: 4, len: 2, dir: 'v' },
                { id: 4, r: 4, c: 4, len: 2, dir: 'h' }
            ],
            // Layout 4
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 2, dir: 'v' },
                { id: 2, r: 3, c: 1, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 3, len: 2, dir: 'h' }
            ],
            // Layout 5
            [
                { id: 0, r: 2, c: 2, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 1, len: 2, dir: 'v' },
                { id: 2, r: 3, c: 1, len: 3, dir: 'h' },
                { id: 3, r: 1, c: 4, len: 2, dir: 'v' }
            ]
        ];

        const MEDIUM_POOL = [
            // Layout 1
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 3, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 2, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 1, c: 0, len: 2, dir: 'v' },
                { id: 6, r: 4, c: 5, len: 2, dir: 'v' }
            ],
            // Layout 2
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 0, len: 2, dir: 'h' },
                { id: 2, r: 0, c: 2, len: 2, dir: 'v' },
                { id: 3, r: 0, c: 3, len: 2, dir: 'h' },
                { id: 4, r: 1, c: 4, len: 3, dir: 'v' },
                { id: 5, r: 3, c: 1, len: 2, dir: 'h' },
                { id: 6, r: 4, c: 0, len: 2, dir: 'v' },
                { id: 7, r: 4, c: 2, len: 2, dir: 'h' },
                { id: 8, r: 5, c: 2, len: 2, dir: 'h' }
            ],
            // Layout 3
            [
                { id: 0, r: 2, c: 0, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 2, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 1, c: 4, len: 3, dir: 'v' },
                { id: 4, r: 4, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 0, c: 5, len: 2, dir: 'v' }
            ],
            // Layout 4
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 3, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 1, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 1, c: 0, len: 2, dir: 'v' }
            ],
            // Layout 5
            [
                { id: 0, r: 2, c: 0, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 2, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 1, c: 4, len: 3, dir: 'v' },
                { id: 4, r: 4, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 0, c: 0, len: 2, dir: 'v' }
            ]
        ];

        const HARD_POOL = [
            // Layout 1
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 3, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 2, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 4, len: 2, dir: 'v' },
                { id: 5, r: 4, c: 5, len: 2, dir: 'v' },
                { id: 6, r: 5, c: 0, len: 2, dir: 'h' },
                { id: 7, r: 0, c: 0, len: 2, dir: 'v' }
            ],
            // Layout 2
            [
                { id: 0, r: 2, c: 2, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 1, len: 3, dir: 'v' },
                { id: 2, r: 0, c: 4, len: 2, dir: 'v' },
                { id: 3, r: 3, c: 1, len: 3, dir: 'h' },
                { id: 4, r: 4, c: 0, len: 2, dir: 'v' },
                { id: 5, r: 4, c: 4, len: 2, dir: 'v' },
                { id: 6, r: 5, c: 1, len: 3, dir: 'h' }
            ],
            // Layout 3
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 1, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 1, c: 5, len: 3, dir: 'v' },
                { id: 6, r: 4, c: 4, len: 2, dir: 'v' },
                { id: 7, r: 5, c: 2, len: 2, dir: 'h' }
            ],
            // Layout 4
            [
                { id: 0, r: 2, c: 1, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 3, len: 3, dir: 'v' },
                { id: 2, r: 3, c: 2, len: 2, dir: 'h' },
                { id: 3, r: 4, c: 1, len: 2, dir: 'v' },
                { id: 4, r: 0, c: 4, len: 2, dir: 'h' },
                { id: 5, r: 1, c: 5, len: 3, dir: 'v' },
                { id: 6, r: 4, c: 4, len: 2, dir: 'v' },
                { id: 7, r: 5, c: 2, len: 2, dir: 'h' },
                { id: 8, r: 0, c: 0, len: 2, dir: 'v' }
            ],
            // Layout 5
            [
                { id: 0, r: 2, c: 0, len: 2, dir: 'h', color: 'red' },
                { id: 1, r: 0, c: 2, len: 3, dir: 'v' },
                { id: 2, r: 0, c: 3, len: 2, dir: 'h' },
                { id: 3, r: 1, c: 5, len: 2, dir: 'v' },
                { id: 4, r: 3, c: 0, len: 3, dir: 'v' },
                { id: 5, r: 3, c: 1, len: 2, dir: 'h' },
                { id: 6, r: 3, c: 3, len: 2, dir: 'v' },
                { id: 7, r: 4, c: 4, len: 2, dir: 'h' },
                { id: 8, r: 5, c: 4, len: 2, dir: 'h' }
            ]
        ];

        // Inject wood styles
        const styleId = 'ws-wood-unblock-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-wood-layout {
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

                /* 3D Wood Container */
                .wood-board-outer {
                    position: relative;
                    width: ${BOARD_PX + 24}px;
                    height: ${BOARD_PX + 24}px;
                    background: linear-gradient(135deg, #8b4513, #5c2c0e);
                    border-radius: 20px;
                    padding: 12px;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), 
                                inset 0 3px 6px rgba(255, 255, 255, 0.3),
                                inset 0 -6px 12px rgba(0, 0, 0, 0.5);
                    box-sizing: border-box;
                    border: 4px solid #3e1e07;
                }

                .wood-board-inner {
                    position: relative;
                    width: ${BOARD_PX}px;
                    height: ${BOARD_PX}px;
                    background-color: #3d1c02; /* dark wood base */
                    background-image: repeating-linear-gradient(45deg, #442003 0px, #442003 2px, #3a1a02 2px, #3a1a02 10px);
                    border-radius: 8px;
                    box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.6);
                    overflow: visible;
                }

                /* Exit arrow styling */
                .wood-exit-gate {
                    position: absolute;
                    top: ${2 * CELL_SIZE}px;
                    right: -24px;
                    width: 24px;
                    height: ${CELL_SIZE}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }

                .wood-exit-arrow {
                    color: #00FF66;
                    font-size: 24px;
                    animation: pulseArrow 1.2s infinite ease-in-out;
                    text-shadow: 0 0 10px rgba(0, 255, 102, 0.8);
                }

                @keyframes pulseArrow {
                    0%, 100% { transform: translateX(0) scale(1); opacity: 0.6; }
                    50% { transform: translateX(-4px) scale(1.15); opacity: 1; }
                }

                /* 3D Wood Logs styling */
                .wood-block {
                    position: absolute;
                    border-radius: 8px;
                    cursor: grab;
                    touch-action: none;
                    box-sizing: border-box;
                    border: 3px solid rgba(0, 0, 0, 0.18);
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.35), 
                                inset 0 3px 0 rgba(255, 255, 255, 0.25), 
                                inset 0 -3px 0 rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    user-select: none;
                }

                .wood-block:active {
                    cursor: grabbing;
                    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.45);
                    z-index: 15;
                }

                /* Normal Wood Log styles */
                .wood-block.wood-normal {
                    background: linear-gradient(135deg, #e5c185, #c68a4c);
                    border-color: #a0662d;
                }
                
                /* Decorative inner lines for normal logs */
                .wood-block.wood-normal::before {
                    content: '';
                    position: absolute;
                    top: 6px; left: 6px; right: 6px; bottom: 6px;
                    border: 1.5px dashed rgba(60, 30, 5, 0.15);
                    border-radius: 4px;
                    pointer-events: none;
                }

                /* Special Red Log styles */
                .wood-block.wood-red {
                    background: linear-gradient(135deg, #ff4d4d, #b31010);
                    border-color: #7a0000;
                    box-shadow: 0 6px 12px rgba(255, 0, 0, 0.25),
                                0 6px 10px rgba(0, 0, 0, 0.35),
                                inset 0 3px 0 rgba(255, 255, 255, 0.35), 
                                inset 0 -3px 0 rgba(0, 0, 0, 0.2);
                }

                /* Star patterns decoration on red log */
                .wood-block.wood-red::before {
                    content: '✨ 🪵 ✨';
                    color: rgba(255, 235, 59, 0.65);
                    font-size: 16px;
                    font-weight: bold;
                    pointer-events: none;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }
            `;
            document.head.appendChild(styleEl);
        }

        // HTML Layout template
        let html = `
            <div class="game-wood-layout">
                <h2 class="game-title" style="color: #c68a4c; margin-bottom: 2px;">🪵 فك الحطب 🪵</h2>
                <p class="game-instructions" style="margin-bottom: 6px; font-size: 0.85rem;">قم بإزاحة الكتل الخشبية لتحرير الحطبة الحمراء الخاصة وإخراجها من المخرج!</p>
                
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); box-sizing: border-box; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #8b4513; font-size: 15px;">المستوى: <span id="wsWoodStage">1 / 10</span></div>
                    <button class="hud-btn" id="wsWoodResetBtn" style="padding: 4px 12px; font-size: 13px; background-color: #c68a4c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 3px 0 #8b4513;">إعادة 🔄</button>
                </div>

                <div class="wood-board-outer">
                    <div class="wood-board-inner" id="wsWoodBoard">
                        <!-- Exit neon gate -->
                        <div class="wood-exit-gate">
                            <span class="wood-exit-arrow">▶</span>
                        </div>
                        <!-- Blocks added dynamically -->
                    </div>
                </div>

                <!-- Victory Modal -->
                <div id="wsWoodWinModal" class="game-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 4px solid #4CAF50; margin: auto;">
                        <h3 id="wsWoodWinTitle" style="color: #4CAF50; font-weight: 900;">🎉 عمل ذكي يا بطل! 🎉</h3>
                        <p id="wsWoodWinMessage">لقد نجحت في تحرير القطعة الحمراء!</p>
                        <button class="menu-btn restart-btn" id="wsWoodNextBtn" style="background-color: #4CAF50; box-shadow: 0 5px 0 #1b5e20; margin: 15px auto 0;">المستوى التالي ➡️</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const boardEl = document.getElementById('wsWoodBoard');
        const stageText = document.getElementById('wsWoodStage');
        const resetBtn = document.getElementById('wsWoodResetBtn');
        const winModal = document.getElementById('wsWoodWinModal');
        const nextBtn = document.getElementById('wsWoodNextBtn');
        const winTitle = document.getElementById('wsWoodWinTitle');
        const winMessage = document.getElementById('wsWoodWinMessage');

        // Initialize Level
        function initLevel() {
            boardEl.querySelectorAll('.wood-block').forEach(el => el.remove());
            blocks = [];
            gameActive = true;

            stageText.innerText = `${level} / 10`;
            winModal.style.display = 'none';

            // Pick a difficulty pool based on level
            let pool;
            if (level <= 3) {
                pool = EASY_POOL;
            } else if (level <= 6) {
                pool = MEDIUM_POOL;
            } else {
                pool = HARD_POOL;
            }

            // Pick a random solvable layout from that pool
            const randomLayout = pool[Math.floor(Math.random() * pool.length)];

            // Clone levels definition
            blocks = JSON.parse(JSON.stringify(randomLayout));

            // Render each block
            blocks.forEach(block => {
                const el = document.createElement('div');
                const isRed = block.color === 'red';
                el.className = `wood-block ${isRed ? 'wood-red' : 'wood-normal'}`;
                el.setAttribute('data-id', block.id);

                // Set Size
                if (block.dir === 'h') {
                    el.style.width = `${block.len * CELL_SIZE - 4}px`;
                    el.style.height = `${CELL_SIZE - 4}px`;
                } else {
                    el.style.width = `${CELL_SIZE - 4}px`;
                    el.style.height = `${block.len * CELL_SIZE - 4}px`;
                }

                // Set Position
                el.style.left = `${block.c * CELL_SIZE + 2}px`;
                el.style.top = `${block.r * CELL_SIZE + 2}px`;

                boardEl.appendChild(el);
                block.element = el;

                // Bind touch / mouse dragging
                bindDragEvents(block);
            });
        }

        // Drag handlers
        function bindDragEvents(block) {
            const el = block.element;
            let startPointerX = 0;
            let startPointerY = 0;
            let startLeft = 0;
            let startTop = 0;
            let isDragging = false;

            // Clamping constraints
            let minVal = 0;
            let maxVal = 0;

            function dragStart(e) {
                if (!gameActive) return;
                isDragging = true;
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                startPointerX = clientX;
                startPointerY = clientY;

                startLeft = parseInt(el.style.left);
                startTop = parseInt(el.style.top);

                // Compute bounding constraints dynamically to prevent overlaps
                const bounds = calculateBounds(block);
                minVal = bounds.min * CELL_SIZE + 2;
                maxVal = bounds.max * CELL_SIZE + 2;

                if (window.sound) {
                    window.sound.playClick();
                }

                if (e.cancelable) e.preventDefault();
            }

            function dragMove(e) {
                if (!isDragging || !gameActive) return;
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                if (block.dir === 'h') {
                    const dx = clientX - startPointerX;
                    let targetLeft = startLeft + dx;

                    // Clamp to boundaries
                    targetLeft = Math.max(minVal, Math.min(maxVal, targetLeft));
                    el.style.left = `${targetLeft}px`;
                } else {
                    const dy = clientY - startPointerY;
                    let targetTop = startTop + dy;

                    // Clamp to boundaries
                    targetTop = Math.max(minVal, Math.min(maxVal, targetTop));
                    el.style.top = `${targetTop}px`;
                }
            }

            function dragEnd() {
                if (!isDragging) return;
                isDragging = false;

                // Snap coordinates to closest cell
                if (block.dir === 'h') {
                    const currentLeft = parseInt(el.style.left) - 2;
                    let targetCol = Math.round(currentLeft / CELL_SIZE);
                    
                    // Verify boundaries
                    const bounds = calculateBounds(block);
                    targetCol = Math.max(bounds.min, Math.min(bounds.max, targetCol));

                    block.c = targetCol;
                    el.style.left = `${targetCol * CELL_SIZE + 2}px`;

                    // Check win: Red block (id 0) reached col 4 (fully touching exit)
                    if (block.id === 0 && targetCol === 4) {
                        triggerWinSlideOut();
                    } else {
                        if (window.sound) window.sound.playFlip();
                    }
                } else {
                    const currentTop = parseInt(el.style.top) - 2;
                    let targetRow = Math.round(currentTop / CELL_SIZE);
                    
                    const bounds = calculateBounds(block);
                    targetRow = Math.max(bounds.min, Math.min(bounds.max, targetRow));

                    block.r = targetRow;
                    el.style.top = `${targetRow * CELL_SIZE + 2}px`;
                    
                    if (window.sound) window.sound.playFlip();
                }
            }

            el.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', dragMove);
            window.addEventListener('mouseup', dragEnd);

            el.addEventListener('touchstart', dragStart, { passive: false });
            window.addEventListener('touchmove', dragMove, { passive: false });
            window.addEventListener('touchend', dragEnd);
        }

        // Dynamically compute movement boundary indices for a block on the grid
        function calculateBounds(targetBlock) {
            // Grid cell occupancy matrix representation
            let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

            // Mark all cells occupied by other blocks
            blocks.forEach(b => {
                if (b.id === targetBlock.id) return;
                if (b.dir === 'h') {
                    for (let c = 0; c < b.len; c++) {
                        grid[b.r][b.c + c] = true;
                    }
                } else {
                    for (let r = 0; r < b.len; r++) {
                        grid[b.r + r][b.c] = true;
                    }
                }
            });

            if (targetBlock.dir === 'h') {
                let minCol = 0;
                let maxCol = GRID_SIZE - targetBlock.len;

                // Look left
                for (let c = targetBlock.c - 1; c >= 0; c--) {
                    if (grid[targetBlock.r][c]) {
                        minCol = c + 1;
                        break;
                    }
                }
                // Look right
                for (let c = targetBlock.c + targetBlock.len; c < GRID_SIZE; c++) {
                    if (grid[targetBlock.r][c]) {
                        maxCol = c - targetBlock.len;
                        break;
                    }
                }

                return { min: minCol, max: maxCol };
            } else {
                let minRow = 0;
                let maxRow = GRID_SIZE - targetBlock.len;

                // Look up
                for (let r = targetBlock.r - 1; r >= 0; r--) {
                    if (grid[r][targetBlock.c]) {
                        minRow = r + 1;
                        break;
                    }
                }
                // Look down
                for (let r = targetBlock.r + targetBlock.len; r < GRID_SIZE; r++) {
                    if (grid[r][targetBlock.c]) {
                        maxRow = r - targetBlock.len;
                        break;
                    }
                }

                return { min: minRow, max: maxRow };
            }
        }

        // Slide the red block completely out of the gate, then show victory
        function triggerWinSlideOut() {
            gameActive = false;
            const redBlock = blocks.find(b => b.id === 0);
            const el = redBlock.element;

            // Animate sliding out to column 6 (completely out of screen)
            setTimeout(() => {
                el.style.transition = 'left 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                el.style.left = `${GRID_SIZE * CELL_SIZE + 10}px`;

                if (window.sound) {
                    window.sound.playSuccess();
                }

                setTimeout(() => {
                    triggerWinModal();
                }, 450);
            }, 100);
        }

        function triggerWinModal() {
            if (level === 10) {
                winTitle.innerText = '🏆 بطل فك الألغاز العظيم! 🏆';
                winMessage.innerText = 'تهانينا! لقد أنهيت كل مستويات فك الحطب بنجاح وحررت القطعة الحمراء!';
                nextBtn.innerText = 'العب من جديد 🔄';
            } else {
                winTitle.innerText = '🎉 عمل ذكي يا بطل! 🎉';
                winMessage.innerText = 'لقد نجحت في تحرير القطعة الحمراء! استعد للمستوى التالي.';
                nextBtn.innerText = 'المستوى التالي ➡️';
            }
            winModal.style.display = 'flex';
        }

        // HUD Listeners
        resetBtn.addEventListener('click', () => {
            if (window.sound) window.sound.playFlip();
            initLevel(); // Picks a fresh random layout of the same difficulty!
        });

        nextBtn.addEventListener('click', () => {
            if (window.sound) window.sound.playFlip();
            if (level >= 10) {
                level = 1;
            } else {
                level++;
            }
            initLevel();
        });

        // Start first level
        initLevel();

        // Cleanup listener on exit
        container.addEventListener('game-exit', () => {
            gameActive = false;
        });
    };
})();
