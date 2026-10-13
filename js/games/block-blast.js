// Game: Block Blast (بلوك بلاست - إصدار المحترفين المطابق للألعاب الأصلية)
(function() {
    window.initBlockBlastGame = function(container) {
        let score = 0;
        let gameActive = true;
        const boardSize = 8; // Standard 8x8 Block Blast grid
        let board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
        let shapes = [];
        let comboCount = 0; // Consecutive placement clears
        let lastCleared = false; // Flag to track if the last placement cleared any lines

        // Neon Glow Colors for shapes
        const colors = [
            '#FF2E93', // Neon Pink / Red
            '#FF8A00', // Neon Orange
            '#FFEB3B', // Neon Yellow
            '#39FF14', // Neon Green
            '#00E5FF', // Neon Cyan / Blue
            '#D500F9', // Neon Purple
            '#FF2A6D'  // Neon Rose
        ];

        // Diverse Shape templates (standard Block Blast set)
        const shapeTemplates = [
            { grid: [[1]], color: 0 }, // 1x1 Dot
            { grid: [[1, 1]], color: 1 }, // 2x1 Horizontal
            { grid: [[1], [1]], color: 1 }, // 1x2 Vertical
            { grid: [[1, 1], [1, 1]], color: 2 }, // 2x2 Block
            { grid: [[1, 1, 1]], color: 3 }, // 3x1 Horizontal
            { grid: [[1], [1], [1]], color: 3 }, // 1x3 Vertical
            { grid: [[1, 1, 1, 1]], color: 4 }, // 4x1 Tetromino Horizontal
            { grid: [[1], [1], [1], [1]], color: 4 }, // 1x4 Tetromino Vertical
            { grid: [[1, 1, 1, 1, 1]], color: 6 }, // 5x1 Horizontal line
            { grid: [[1], [1], [1], [1], [1]], color: 6 }, // 1x5 Vertical line
            
            // L and J Shapes
            { grid: [[1, 0], [1, 0], [1, 1]], color: 5 }, // L 3x2
            { grid: [[0, 1], [0, 1], [1, 1]], color: 5 }, // J 3x2
            { grid: [[1, 1, 1], [1, 0, 0]], color: 5 },
            { grid: [[1, 1, 1], [0, 0, 1]], color: 5 },

            // Small Corner L Shapes (2x2)
            { grid: [[1, 1], [1, 0]], color: 0 },
            { grid: [[1, 1], [0, 1]], color: 0 },
            { grid: [[1, 0], [1, 1]], color: 0 },
            { grid: [[0, 1], [1, 1]], color: 0 },

            // Giant Corner L Shapes (3x3)
            { grid: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: 2 },
            { grid: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 2 },
            
            // T Shapes
            { grid: [[1, 1, 1], [0, 1, 0]], color: 1 },
            { grid: [[0, 1], [1, 1], [0, 1]], color: 1 },
            { grid: [[0, 1, 0], [1, 1, 1]], color: 1 },

            // Z & S Shapes
            { grid: [[1, 1, 0], [0, 1, 1]], color: 6 },
            { grid: [[0, 1, 1], [1, 1, 0]], color: 6 }
        ];

        // Inject Styles dynamically
        const styleId = 'block-blast-premium-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-block-blast-layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    font-family: var(--font-kids);
                    user-select: none;
                    direction: ltr;
                    background: linear-gradient(to bottom, #0F172A 0%, #1E1B4B 100%); /* Ultra premium dark cosmic theme */
                    border-radius: 20px;
                    padding: 8px;
                    overflow: hidden;
                }

                .bb-hud {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    max-width: 380px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2.5px solid rgba(255, 255, 255, 0.09);
                    border-radius: 16px;
                    box-sizing: border-box;
                    margin-bottom: 8px;
                    backdrop-filter: blur(8px);
                }

                .bb-score-box {
                    display: flex;
                    flex-direction: column;
                }

                .bb-score-label {
                    font-size: 0.65rem;
                    color: #94A3B8;
                    text-transform: uppercase;
                    font-weight: bold;
                    letter-spacing: 1px;
                }

                .bb-score-val {
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: #00E5FF;
                    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
                }

                .bb-high-box {
                    text-align: right;
                }

                .bb-high-val {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #FFB74D;
                }

                /* Block Blast Grid Board */
                .bb-board-container {
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 6px 0;
                }

                .bb-board {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 5px;
                    width: 100%;
                    max-width: 360px;
                    aspect-ratio: 1/1;
                    background: #1E293B; /* Deep slate background */
                    padding: 8px;
                    border-radius: 18px;
                    border: 4px solid #334155;
                    box-shadow: 
                        inset 0 4px 10px rgba(0,0,0,0.6),
                        0 8px 24px rgba(0,0,0,0.5);
                    box-sizing: border-box;
                    position: relative;
                }

                /* Board Cell slots */
                .bb-cell {
                    background: #0F172A; /* Dark sunken base slot */
                    border-radius: 6px;
                    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5);
                    transition: transform 0.12s, filter 0.15s, opacity 0.15s;
                    box-sizing: border-box;
                }

                /* Active tile cells placed on board */
                .bb-tile {
                    border-radius: 6px;
                    box-shadow: 
                        inset 0 2px 3px rgba(255,255,255,0.4),
                        inset 0 -2px 3px rgba(0,0,0,0.3),
                        0 2px 4px rgba(0,0,0,0.4);
                }

                /* Available Choices Dock */
                .bb-choices-dock {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    width: 100%;
                    max-width: 380px;
                    height: 120px;
                    background: rgba(15, 23, 42, 0.6);
                    border: 2px solid #334155;
                    border-radius: 18px;
                    padding: 8px;
                    box-sizing: border-box;
                    margin-top: 8px;
                }

                /* Drag blocks containers inside choices dock */
                .bb-choice-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100px;
                    height: 100px;
                    cursor: grab;
                    touch-action: none;
                    transition: transform 0.15s ease-out;
                }

                .bb-choice-container:active {
                    cursor: grabbing;
                }

                .bb-choice-grid {
                    display: grid;
                    gap: 3px;
                }

                .bb-choice-cell {
                    border-radius: 4px;
                }

                /* Combo floating text popup */
                .bb-combo-popup {
                    position: absolute;
                    font-family: var(--font-kids);
                    font-weight: 900;
                    font-size: 1.8rem;
                    text-align: center;
                    pointer-events: none;
                    z-index: 100;
                    animation: bbPopupFloat 1.0s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes bbPopupFloat {
                    0% { transform: translate(-50%, 0) scale(0.3); opacity: 0; }
                    20% { transform: translate(-50%, -20px) scale(1.2); opacity: 1; }
                    40% { transform: translate(-50%, -25px) scale(1.0); }
                    100% { transform: translate(-50%, -70px) scale(0.8); opacity: 0; }
                }

                /* Glowing grid particles */
                .bb-particle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                    pointer-events: none;
                    z-index: 101;
                    animation: bbParticleOut 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }

                @keyframes bbParticleOut {
                    0% {
                        transform: translate(-50%, -50%) scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.1) rotate(270deg);
                        opacity: 0;
                    }
                }

                /* Action bar */
                .bb-actions {
                    display: flex;
                    justify-content: flex-end;
                    width: 100%;
                    max-width: 380px;
                    margin-top: 6px;
                }

                .bb-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1.5px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    font-family: var(--font-kids);
                    font-size: 0.75rem;
                    padding: 5px 12px;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.1s;
                }

                .bb-btn:active {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(0.95);
                }
            `;
            document.head.appendChild(styleEl);
        }

        // Setup HTML Skeleton Layout
        let html = `
            <div class="game-block-blast-layout">
                <h2 class="game-title" style="color: #FF2E93; font-weight: 900; margin-bottom: 6px;">🧩 بلوك بلاست 🧩</h2>
                
                <div class="bb-hud">
                    <div class="bb-score-box">
                        <span class="bb-score-label">النقاط SCORE</span>
                        <span class="bb-score-val" id="bbScore">0</span>
                    </div>
                    
                    <div class="bb-high-box">
                        <span class="bb-score-label">أعلى درجة HIGH</span>
                        <div class="bb-high-val" id="bbHighScore">0</div>
                    </div>
                </div>

                <div class="bb-board-container">
                    <div class="bb-board" id="bbBoard">
                        <!-- Grid cells injected dynamically -->
                    </div>
                </div>

                <div class="bb-choices-dock" id="bbChoices">
                    <!-- 3 choice shapes -->
                </div>

                <div class="bb-actions">
                    <button class="bb-btn" id="bbResetBtn">إعادة اللعب 🔄</button>
                </div>

                <!-- Fail Modal -->
                <div id="bbFailModal" class="game-modal" style="display: none;">
                    <div class="modal-content bounce-anim" style="border-color: #FF2E93; background-color: #0F172A; color: white;">
                        <h3 style="color: #FF2E93; font-size: 1.6rem; margin-bottom: 8px;">😢 انتهت الحركات! 😢</h3>
                        <p style="font-size: 0.95rem; margin-bottom: 20px; color: #94A3B8;">لم يعد هناك متسع كافٍ للأشكال المتبقية على اللوحة.</p>
                        <div style="font-size: 1.1rem; font-weight: 800; color: #00E5FF; margin-bottom: 20px;">مجموع النقاط: <span id="bbFinalScore">0</span></div>
                        <button class="menu-btn restart-btn" id="bbFailRestart" style="margin: 0 auto; background-color: #FF2E93; box-shadow: 0 5px 0 #C2185B;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const boardEl = document.getElementById('bbBoard');
        const choicesEl = document.getElementById('bbChoices');
        const scoreEl = document.getElementById('bbScore');
        const highScoreEl = document.getElementById('bbHighScore');
        const resetBtn = document.getElementById('bbResetBtn');
        const failModal = document.getElementById('bbFailModal');
        const finalScoreEl = document.getElementById('bbFinalScore');
        const failRestartBtn = document.getElementById('bbFailRestart');

        // Load high score
        let highScore = parseInt(localStorage.getItem('kids_block_blast_premium_high') || '0');
        highScoreEl.innerText = highScore;

        // Render board layout
        function drawBoard() {
            boardEl.innerHTML = '';
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'bb-cell';
                    cell.setAttribute('data-r', r);
                    cell.setAttribute('data-c', c);

                    const tileColor = board[r][c];
                    if (tileColor) {
                        cell.classList.add('bb-tile');
                        cell.style.backgroundColor = tileColor;
                        cell.style.border = `1px solid rgba(255,255,255,0.15)`;
                        cell.style.boxShadow = `
                            inset 0 2px 3px rgba(255,255,255,0.4),
                            inset 0 -2px 3px rgba(0,0,0,0.3),
                            0 2px 4px rgba(0,0,0,0.4)
                        `;
                    }

                    boardEl.appendChild(cell);
                }
            }
        }

        // Spawn a group of 3 random shapes
        function generateShapes() {
            choicesEl.innerHTML = '';
            shapes = [];

            for (let i = 0; i < 3; i++) {
                const randTemplate = shapeTemplates[Math.floor(Math.random() * shapeTemplates.length)];
                const shapeGrid = randTemplate.grid.map(row => [...row]);
                const shapeColor = colors[randTemplate.color];

                const shapeObj = {
                    id: i,
                    grid: shapeGrid,
                    color: shapeColor,
                    placed: false
                };
                shapes.push(shapeObj);

                renderShapeUI(shapeObj, i);
            }

            checkGameOver();
        }

        // Render one shape inside the choices drawer
        function renderShapeUI(shape, index) {
            const containerBox = document.createElement('div');
            containerBox.className = 'bb-choice-container';
            containerBox.setAttribute('data-id', index);

            const gridEl = document.createElement('div');
            gridEl.className = 'bb-choice-grid';
            gridEl.style.gridTemplateRows = `repeat(${shape.grid.length}, 1fr)`;
            gridEl.style.gridTemplateColumns = `repeat(${shape.grid[0].length}, 1fr)`;

            // Cell sizing in bottom tray (scaled down slightly for layout fit)
            const cellW = 16;
            const cellH = 16;

            for (let r = 0; r < shape.grid.length; r++) {
                for (let c = 0; c < shape.grid[0].length; c++) {
                    const block = document.createElement('div');
                    block.className = 'bb-choice-cell';
                    block.style.width = `${cellW}px`;
                    block.style.height = `${cellH}px`;

                    if (shape.grid[r][c]) {
                        block.style.backgroundColor = shape.color;
                        block.style.border = `1.5px solid rgba(255,255,255,0.25)`;
                        block.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)';
                    } else {
                        block.style.backgroundColor = 'transparent';
                    }
                    gridEl.appendChild(block);
                }
            }

            containerBox.appendChild(gridEl);
            choicesEl.appendChild(containerBox);

            initDragAndDrop(containerBox, shape);
        }

        // Drag and Drop implementation supporting multi-touch and mouse (Fully mathematical alignment)
        function initDragAndDrop(element, shape) {
            let active = false;
            let dragShadow = null;
            let cellW = 0;
            let cellH = 0;

            const boardPadding = 8; // Padding of the board (.bb-board)
            const cellGap = 5;      // Gap between cells

            function dragStart(e) {
                if (!gameActive || shape.placed) return;
                active = true;
                element.style.opacity = '0.25';

                // Prevent pointer events on the container while dragging its shadow
                element.style.pointerEvents = 'none';

                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                // Fetch original cell sizes from board for correct matching
                const sampleCell = boardEl.querySelector('.bb-cell');
                const sampleRect = sampleCell.getBoundingClientRect();
                cellW = sampleRect.width;
                cellH = sampleRect.height;

                // Create floating drag shadow
                dragShadow = document.createElement('div');
                dragShadow.style.position = 'fixed';
                dragShadow.style.zIndex = '9999';
                dragShadow.style.display = 'grid';
                dragShadow.style.gridTemplateRows = `repeat(${shape.grid.length}, 1fr)`;
                dragShadow.style.gridTemplateColumns = `repeat(${shape.grid[0].length}, 1fr)`;
                dragShadow.style.gap = `${cellGap}px`;
                dragShadow.style.pointerEvents = 'none';
                dragShadow.style.direction = 'ltr';

                // Shadow size including gaps
                const shadowW = shape.grid[0].length * cellW + (shape.grid[0].length - 1) * cellGap;
                const shadowH = shape.grid.length * cellH + (shape.grid.length - 1) * cellGap;

                dragShadow.style.width = `${shadowW}px`;
                dragShadow.style.height = `${shadowH}px`;

                for (let r = 0; r < shape.grid.length; r++) {
                    for (let c = 0; c < shape.grid[0].length; c++) {
                        const block = document.createElement('div');
                        block.style.borderRadius = '6px';
                        if (shape.grid[r][c]) {
                            block.style.backgroundColor = shape.color;
                            block.style.border = '1px solid rgba(255,255,255,0.2)';
                            block.style.boxShadow = `
                                inset 0 2px 3px rgba(255,255,255,0.4),
                                inset 0 -2px 3px rgba(0,0,0,0.3),
                                0 3px 6px rgba(0,0,0,0.4)
                            `;
                        } else {
                            block.style.backgroundColor = 'transparent';
                        }
                        dragShadow.appendChild(block);
                    }
                }

                // Vertical offset so the shape displays above finger on mobile
                const dragOffset = e.type === 'touchstart' ? -90 : -35;
                dragShadow.style.left = `${clientX - shadowW / 2}px`;
                dragShadow.style.top = `${clientY - shadowH / 2 + dragOffset}px`;

                document.body.appendChild(dragShadow);

                if (window.sound) {
                    window.sound.playClick();
                }

                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
            }

            function drag(e) {
                if (!active || !dragShadow) return;

                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                const dragOffset = e.type === 'touchmove' ? -90 : -35;
                const shadowW = shape.grid[0].length * cellW + (shape.grid[0].length - 1) * cellGap;
                const shadowH = shape.grid.length * cellH + (shape.grid.length - 1) * cellGap;

                // Move visual shadow
                const shadowLeft = clientX - shadowW / 2;
                const shadowTop = clientY - shadowH / 2 + dragOffset;
                dragShadow.style.left = `${shadowLeft}px`;
                dragShadow.style.top = `${shadowTop}px`;

                // Board relative calculations
                const boardRect = boardEl.getBoundingClientRect();

                // Calculate relative starting point (first cell of shape) inside board
                const relX = shadowLeft - boardRect.left - boardPadding;
                const relY = shadowTop - boardRect.top - boardPadding;

                // Get exact hover Row and Column based on top-left corner of the shape!
                const hoverCol = Math.round(relX / (cellW + cellGap));
                const hoverRow = Math.round(relY / (cellH + cellGap));

                clearHighlights();

                if (canPlaceShape(shape.grid, hoverRow, hoverCol)) {
                    highlightCells(shape.grid, hoverRow, hoverCol, shape.color);
                }
            }

            function dragEnd(e) {
                if (!active) return;
                active = false;
                element.style.opacity = '1.0';
                element.style.pointerEvents = 'auto';

                const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
                const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;

                const dragOffset = e.type === 'touchend' ? -90 : -35;
                const shadowW = shape.grid[0].length * cellW + (shape.grid[0].length - 1) * cellGap;
                const shadowH = shape.grid.length * cellH + (shape.grid.length - 1) * cellGap;

                const shadowLeft = clientX - shadowW / 2;
                const shadowTop = clientY - shadowH / 2 + dragOffset;

                if (dragShadow) {
                    dragShadow.remove();
                    dragShadow = null;
                }

                const boardRect = boardEl.getBoundingClientRect();
                const relX = shadowLeft - boardRect.left - boardPadding;
                const relY = shadowTop - boardRect.top - boardPadding;

                const hoverCol = Math.round(relX / (cellW + cellGap));
                const hoverRow = Math.round(relY / (cellH + cellGap));

                clearHighlights();

                if (canPlaceShape(shape.grid, hoverRow, hoverCol)) {
                    placeShape(shape, hoverRow, hoverCol);
                } else {
                    if (window.sound) {
                        window.sound.playFail();
                    }
                }
            }

            element.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', dragEnd);

            element.addEventListener('touchstart', dragStart, { passive: false });
            window.addEventListener('touchmove', drag, { passive: false });
            window.addEventListener('touchend', dragEnd, { passive: false });
        }

        // Shape placement validation
        function canPlaceShape(shapeGrid, startRow, startCol) {
            const h = shapeGrid.length;
            const w = shapeGrid[0].length;

            if (startRow < 0 || startRow + h > boardSize || startCol < 0 || startCol + w > boardSize) {
                return false;
            }

            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    if (shapeGrid[r][c] && board[startRow + r][startCol + c] !== 0) {
                        return false;
                    }
                }
            }

            return true;
        }

        // Glow hover cells
        function highlightCells(shapeGrid, startRow, startCol, color) {
            const h = shapeGrid.length;
            const w = shapeGrid[0].length;

            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    if (shapeGrid[r][c]) {
                        const cell = boardEl.querySelector(`[data-r="${startRow + r}"][data-c="${startCol + c}"]`);
                        if (cell) {
                            cell.style.backgroundColor = color;
                            cell.style.opacity = '0.55';
                            cell.style.transform = 'scale(0.92)';
                        }
                    }
                }
            }
        }

        // Reset hover styling
        function clearHighlights() {
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    const cell = boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
                    if (cell) {
                        const tileColor = board[r][c];
                        cell.style.backgroundColor = tileColor ? tileColor : '#0F172A';
                        cell.style.opacity = '1.0';
                        cell.style.transform = 'none';
                    }
                }
            }
        }

        // Draw explosion particles when cells clear
        function spawnCellParticles(r, c, color) {
            const cell = boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
            if (!cell) return;

            const rect = cell.getBoundingClientRect();
            const boardRect = boardEl.getBoundingClientRect();
            const px = rect.left - boardRect.left + rect.width / 2;
            const py = rect.top - boardRect.top + rect.height / 2;

            for (let i = 0; i < 6; i++) {
                const p = document.createElement('div');
                p.className = 'bb-particle';
                p.style.backgroundColor = color;
                p.style.left = `${px}px`;
                p.style.top = `${py}px`;

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 32 + 10;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;

                p.style.setProperty('--dx', `${dx}px`);
                p.style.setProperty('--dy', `${dy}px`);

                boardEl.appendChild(p);
                setTimeout(() => p.remove(), 800);
            }
        }

        // Spawn combo/praise popups
        function spawnTextPopup(text, isCombo) {
            const popup = document.createElement('div');
            popup.className = 'bb-combo-popup';
            popup.innerText = text;
            popup.style.left = '50%';
            popup.style.top = '40%';
            popup.style.color = isCombo ? '#00E5FF' : '#FFD54F';
            popup.style.textShadow = isCombo 
                ? '0 0 15px rgba(0, 229, 255, 0.8), 0 4px 6px rgba(0,0,0,0.5)'
                : '0 0 15px rgba(255, 213, 79, 0.8), 0 4px 6px rgba(0,0,0,0.5)';

            boardEl.appendChild(popup);
            setTimeout(() => popup.remove(), 1000);
        }

        // Place selected shape on board
        function placeShape(shape, startRow, startCol) {
            const h = shape.grid.length;
            const w = shape.grid[0].length;

            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    if (shape.grid[r][c]) {
                        board[startRow + r][startCol + c] = shape.color;
                    }
                }
            }

            shape.placed = true;
            score += 15; // 15 points per placed piece

            // Remove shape element from Choices Dock
            const choiceEl = choicesEl.querySelector(`.bb-choice-container[data-id="${shape.id}"]`);
            if (choiceEl) {
                choiceEl.style.visibility = 'hidden';
            }

            if (window.sound) {
                window.sound.playClick();
            }

            drawBoard();
            checkLineClears();

            // Spawn new set of shapes if all placed
            if (shapes.every(s => s.placed)) {
                setTimeout(generateShapes, 250);
            } else {
                checkGameOver();
            }
        }

        // Search and clear completed rows & columns (with combo multiplication)
        function checkLineClears() {
            let fullRows = [];
            let fullCols = [];

            // Find completed rows
            for (let r = 0; r < boardSize; r++) {
                if (board[r].every(cell => cell !== 0)) {
                    fullRows.push(r);
                }
            }

            // Find completed columns
            for (let c = 0; c < boardSize; c++) {
                let isFull = true;
                for (let r = 0; r < boardSize; r++) {
                    if (board[r][c] === 0) {
                        isFull = false;
                        break;
                    }
                }
                if (isFull) {
                    fullCols.push(c);
                }
            }

            const totalClears = fullRows.length + fullCols.length;

            if (totalClears > 0) {
                if (lastCleared) {
                    comboCount++; // increase consecutive combo count!
                } else {
                    comboCount = 1;
                    lastCleared = true;
                }

                // Points calculation
                const basePoints = totalClears * boardSize * 10;
                const comboBonus = comboCount * 30;
                score += basePoints + comboBonus;
                scoreEl.innerText = score;

                // Multi chimes sound effect based on combo height
                if (window.sound) {
                    const ctx = window.sound.ctx || new (window.AudioContext || window.webkitAudioContext)();
                    // Custom chime sequence for block clears
                    for (let step = 0; step < totalClears + comboCount; step++) {
                        setTimeout(() => {
                            try {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                
                                osc.type = 'triangle';
                                const pitch = 523.25 * Math.pow(1.12, step + comboCount); // high pitch sequence
                                osc.frequency.setValueAtTime(pitch, ctx.currentTime);
                                
                                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                                
                                osc.start();
                                osc.stop(ctx.currentTime + 0.4);
                            } catch(e) {}
                        }, step * 80);
                    }
                }

                // Show visual praise popups for multi-line blasts
                if (totalClears === 2) {
                    spawnTextPopup('Double Blast! 💥', false);
                } else if (totalClears === 3) {
                    spawnTextPopup('Triple Blast! 🔥', false);
                } else if (totalClears >= 4) {
                    spawnTextPopup('Mega Blast! 👑', false);
                }

                // Show combo banner
                if (comboCount > 1) {
                    setTimeout(() => {
                        spawnTextPopup(`Combo x${comboCount} ⚡`, true);
                    }, 280);
                }

                // Flash and trigger particle effects
                let cellsToClear = [];
                fullRows.forEach(r => {
                    for (let c = 0; c < boardSize; c++) {
                        cellsToClear.push({ r, c, color: board[r][c] });
                    }
                });

                fullCols.forEach(c => {
                    for (let r = 0; r < boardSize; r++) {
                        cellsToClear.push({ r, c, color: board[r][c] });
                    }
                });

                // Trigger animations
                cellsToClear.forEach(item => {
                    const cell = boardEl.querySelector(`[data-r="${item.r}"][data-c="${item.c}"]`);
                    if (cell) {
                        cell.style.transform = 'scale(0.0) rotate(180deg)';
                        cell.style.filter = 'brightness(2.0)';
                        spawnCellParticles(item.r, item.c, item.color);
                    }
                });

                // Apply clear logic to grid after particle animations finish
                setTimeout(() => {
                    fullRows.forEach(r => {
                        for (let c = 0; c < boardSize; c++) {
                            board[r][c] = 0;
                        }
                    });

                    fullCols.forEach(c => {
                        for (let r = 0; r < boardSize; r++) {
                            board[r][c] = 0;
                        }
                    });

                    drawBoard();

                    if (score > highScore) {
                        highScore = score;
                        highScoreEl.innerText = highScore;
                        localStorage.setItem('kids_block_blast_premium_high', highScore);
                    }

                    checkGameOver();
                }, 220);

            } else {
                lastCleared = false;
                comboCount = 0;

                if (score > highScore) {
                    highScore = score;
                    highScoreEl.innerText = highScore;
                    localStorage.setItem('kids_block_blast_premium_high', highScore);
                }
            }
        }

        // Game Over logic
        function checkGameOver() {
            if (shapes.every(s => s.placed)) return;

            let anyMovePossible = false;

            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                if (shape.placed) continue;

                // Scan all available coordinates
                for (let r = 0; r < boardSize; r++) {
                    for (let c = 0; c < boardSize; c++) {
                        if (canPlaceShape(shape.grid, r, c)) {
                            anyMovePossible = true;
                            break;
                        }
                    }
                    if (anyMovePossible) break;
                }
                if (anyMovePossible) break;
            }

            if (!anyMovePossible) {
                gameActive = false;
                setTimeout(() => {
                    if (window.sound) {
                        window.sound.playFail();
                    }
                    finalScoreEl.innerText = score;
                    failModal.style.display = 'flex';
                }, 750);
            }
        }

        // Restart
        function resetGame() {
            score = 0;
            scoreEl.innerText = score;
            comboCount = 0;
            lastCleared = false;
            board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
            failModal.style.display = 'none';
            gameActive = true;
            drawBoard();
            generateShapes();
        }

        resetBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            resetGame();
        });

        failRestartBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            resetGame();
        });

        // Initialize Level 1
        resetGame();

        container.addEventListener('game-exit', () => {
            gameActive = false;
        });
    };
})();
