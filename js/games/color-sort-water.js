// Game: Color Sort Water (فرز ألوان الماء)
(function() {
    window.initColorSortWaterGame = function(container) {
        let level = 1;
        let tubes = [];
        let selectedTubeIndex = null;
        let isAnimating = false;
        let history = []; // Stack for undo functionality

        // Vibrant, semi-transparent gradients for realistic liquid look
        const COLORS = {
            red: 'linear-gradient(to right, rgba(255, 78, 80, 0.95), rgba(255, 100, 100, 0.98))',
            blue: 'linear-gradient(to right, rgba(0, 198, 255, 0.95), rgba(0, 114, 255, 0.98))',
            green: 'linear-gradient(to right, rgba(17, 153, 142, 0.95), rgba(56, 239, 125, 0.98))',
            yellow: 'linear-gradient(to right, rgba(255, 226, 89, 0.95), rgba(255, 167, 81, 0.98))',
            purple: 'linear-gradient(to right, rgba(239, 50, 217, 0.95), rgba(137, 255, 253, 0.98))',
            orange: 'linear-gradient(to right, rgba(255, 65, 108, 0.95), rgba(255, 75, 43, 0.98))',
            pink: 'linear-gradient(to right, rgba(255, 117, 140, 0.95), rgba(255, 126, 179, 0.98))',
            teal: 'linear-gradient(to right, rgba(23, 235, 231, 0.95), rgba(7, 118, 160, 0.98))'
        };

        // Create style block and inject it
        const styleId = 'color-sort-water-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-water-sort-layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    font-family: var(--font-kids);
                    user-select: none;
                    direction: rtl;
                }

                .water-sort-instructions {
                    text-align: center;
                    font-size: 0.85rem;
                    color: #546E7A;
                    margin: 5px 0 12px;
                    padding: 0 10px;
                    font-weight: 500;
                }

                .water-sort-hud {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 8px 12px;
                    background: #FFF;
                    border-radius: 14px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
                    box-sizing: border-box;
                    margin-bottom: 10px;
                }

                .hud-level {
                    font-weight: bold;
                    color: #0288D1;
                    font-size: 1rem;
                }

                .hud-actions {
                    display: flex;
                    gap: 8px;
                }

                .hud-btn {
                    border: none;
                    background: #e1f5fe;
                    color: #0288D1;
                    font-family: var(--font-kids);
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    box-shadow: 0 3px 0 #b3e5fc;
                    transition: transform 0.1s, box-shadow 0.1s;
                    outline: none;
                }

                .hud-btn:active {
                    transform: translateY(2px);
                    box-shadow: none;
                }

                .hud-btn.disabled {
                    background: #eeeeee;
                    color: #999999;
                    box-shadow: 0 3px 0 #cccccc;
                    pointer-events: none;
                    opacity: 0.6;
                }

                .tubes-outer-wrapper {
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 10px 0;
                    min-height: 280px;
                }

                .tubes-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: flex-end;
                    gap: 20px 12px; /* 20px vertical row gap, 12px horizontal tube gap */
                    width: 100%;
                    position: relative;
                    max-width: 380px;
                    padding: 10px 0;
                }

                /* High Quality Glass Test Tube representation */
                .test-tube {
                    position: relative;
                    background: rgba(255, 255, 255, 0.15);
                    border: 3px solid rgba(255, 255, 255, 0.75);
                    border-radius: 0 0 24px 24px;
                    box-shadow: inset -5px 0 10px rgba(255,255,255,0.3), 
                                inset 5px 0 10px rgba(0,0,0,0.1), 
                                0 8px 16px rgba(0,0,0,0.12);
                    cursor: pointer;
                    transform-origin: 50% 12px; /* Rotation happens precisely around the lip! */
                    transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s, border-color 0.25s;
                    z-index: 2;
                }

                /* 3D Glass Gloss Overlay over liquid */
                .test-tube::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: inherit;
                    background: linear-gradient(105deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.02) 45%, rgba(0,0,0,0.07) 100%);
                    pointer-events: none;
                    z-index: 5;
                }

                /* Selected Tube status */
                .test-tube.selected {
                    transform: translateY(-22px);
                    box-shadow: inset -5px 0 10px rgba(255,255,255,0.3), 
                                inset 5px 0 10px rgba(0,0,0,0.1), 
                                0 14px 25px rgba(255, 235, 59, 0.45), 
                                0 0 18px rgba(255, 235, 59, 0.6);
                    border-color: #FFEB3B;
                }

                /* Tilting/Pouring status */
                .test-tube.pouring {
                    z-index: 20;
                    transform: translate(var(--pour-x), var(--pour-y)) rotate(var(--pour-angle));
                    box-shadow: 0 12px 25px rgba(0,0,0,0.25);
                    pointer-events: none;
                }

                /* Shake Animation for incorrect actions */
                .test-tube.shake-error {
                    animation: tubeShake 0.4s ease-in-out;
                }

                @keyframes tubeShake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px); }
                    40%, 80% { transform: translateX(6px); }
                }

                /* Chem Tube Lip styling */
                .tube-lip {
                    position: absolute;
                    top: -4px;
                    left: -6px;
                    right: -6px;
                    height: 8px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid rgba(255, 255, 255, 0.75);
                    z-index: 6;
                }

                /* Glass reflections shine */
                .tube-shine-left {
                    position: absolute;
                    top: 10px;
                    left: 5px;
                    width: 3.5px;
                    bottom: 15px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    z-index: 4;
                    pointer-events: none;
                }

                .tube-shine-right {
                    position: absolute;
                    top: 10px;
                    right: 5px;
                    width: 2px;
                    bottom: 15px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 1px;
                    z-index: 4;
                    pointer-events: none;
                }

                /* Liquid Container inside tube */
                .tube-liquid-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column-reverse;
                    z-index: 1;
                }

                /* Liquid Segment */
                .liquid-segment {
                    width: 100%;
                    box-sizing: border-box;
                    box-shadow: inset 0 3px 6px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.15);
                    transition: height 0.45s ease, opacity 0.45s ease;
                }

                /* Meniscus top water surface curved effect */
                .liquid-segment:last-child {
                    border-radius: 10px 10px 0 0;
                }

                /* Animated Liquid Bubbles inside target tube */
                .liquid-bubble {
                    position: absolute;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 4;
                    animation: bubbleUp 0.65s ease-out forwards;
                }

                @keyframes bubbleUp {
                    0% {
                        transform: translateY(0) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-90px) scale(1.15);
                        opacity: 0;
                    }
                }

                /* Pouring Stream element */
                .water-stream {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 7px;
                    z-index: 10;
                    border-radius: 3.5px;
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
                    animation: streamPulse 0.15s linear infinite;
                }

                @keyframes streamPulse {
                    0% { opacity: 0.85; width: 6.5px; }
                    50% { opacity: 1; width: 8px; }
                    100% { opacity: 0.85; width: 6.5px; }
                }

                /* Responsive Tube Sizing classes */
                .test-tube.size-large {
                    width: 50px;
                    height: 180px;
                }
                .test-tube.size-small {
                    width: 42px;
                    height: 145px;
                }

                /* Victory Celebration effect */
                .victory-particle {
                    position: absolute;
                    bottom: 0;
                    font-size: 1.6rem;
                    pointer-events: none;
                    z-index: 100;
                    animation: floatUpParticle 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }

                @keyframes floatUpParticle {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-480px) rotate(var(--rot)) scale(1.2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        // HTML Layout skeleton
        let html = `
            <div class="game-water-sort-layout">
                <h2 class="game-title">💧 فرز ألوان الماء 💧</h2>
                <p class="water-sort-instructions">رتب الألوان! اجعل كل أنبوب يحتوي على لون واحد فقط.</p>
                
                <div class="water-sort-hud">
                    <div class="hud-level" id="wsLevelText">المستوى: 1 / 15</div>
                    <div class="hud-actions">
                        <button class="hud-btn disabled" id="wsUndoBtn">تراجع ↩️</button>
                        <button class="hud-btn" id="wsResetBtn">إعادة 🔄</button>
                    </div>
                </div>

                <div class="tubes-outer-wrapper">
                    <div class="tubes-container" id="wsTubesContainer">
                        <!-- Rendered test tubes -->
                    </div>
                </div>

                <!-- Custom Win Modal -->
                <div id="wsWinModal" class="game-modal">
                    <div class="modal-content bounce-anim">
                        <h3 id="wsWinTitle">🎉 عمل رائع يا بطل! 🎉</h3>
                        <p id="wsWinMessage">لقد نجحت في فرز جميع ألوان الماء بذكاء!</p>
                        <button class="menu-btn restart-btn" id="wsNextLevelBtn" style="margin: 20px auto 0;">المستوى التالي ➡️</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const tubesContainer = document.getElementById('wsTubesContainer');
        const undoBtn = document.getElementById('wsUndoBtn');
        const resetBtn = document.getElementById('wsResetBtn');
        const winModal = document.getElementById('wsWinModal');
        const nextLevelBtn = document.getElementById('wsNextLevelBtn');
        const levelText = document.getElementById('wsLevelText');
        const winTitle = document.getElementById('wsWinTitle');
        const winMessage = document.getElementById('wsWinMessage');

        // Shuffle utility
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Get Configuration for Levels 1 to 15
        function getLevelConfig(lvl) {
            const configs = {
                1: { colors: 2, empty: 1 },  // 3 tubes (2 full, 1 empty)
                2: { colors: 2, empty: 2 },  // 4 tubes (2 full, 2 empty)
                3: { colors: 3, empty: 1 },  // 4 tubes (3 full, 1 empty)
                4: { colors: 3, empty: 2 },  // 5 tubes (3 full, 2 empty)
                5: { colors: 4, empty: 1 },  // 5 tubes (4 full, 1 empty)
                6: { colors: 4, empty: 2 },  // 6 tubes (4 full, 2 empty)
                7: { colors: 5, empty: 1 },  // 6 tubes (5 full, 1 empty)
                8: { colors: 5, empty: 2 },  // 7 tubes (5 full, 2 empty)
                9: { colors: 6, empty: 1 },  // 7 tubes (6 full, 1 empty)
                10: { colors: 6, empty: 2 }, // 8 tubes (6 full, 2 empty)
                11: { colors: 7, empty: 1 }, // 8 tubes (7 full, 1 empty)
                12: { colors: 7, empty: 2 }, // 9 tubes (7 full, 2 empty)
                13: { colors: 8, empty: 1 }, // 9 tubes (8 full, 1 empty)
                14: { colors: 8, empty: 2 }, // 10 tubes (8 full, 2 empty)
                15: { colors: 8, empty: 3 }  // 11 tubes (8 full, 3 empty)
            };
            return configs[lvl] || { colors: 8, empty: 3 };
        }

        // Generate Solvable Level
        function generateLevel(lvl) {
            const config = getLevelConfig(lvl);
            const numColors = config.colors;
            const numEmpty = config.empty;

            const colorKeys = Object.keys(COLORS).slice(0, numColors);
            
            // Pool of colors (4 segments of each color)
            let pool = [];
            colorKeys.forEach(col => {
                for (let i = 0; i < 4; i++) {
                    pool.push(col);
                }
            });

            shuffleArray(pool);

            // Populate tubes
            let newTubes = [];
            for (let i = 0; i < numColors; i++) {
                const tubeSegments = pool.slice(i * 4, (i + 1) * 4);
                newTubes.push(tubeSegments);
            }

            // Append empty tubes
            for (let i = 0; i < numEmpty; i++) {
                newTubes.push([]);
            }

            // Prevent already solved combinations
            let isAlreadySolved = true;
            for (let i = 0; i < numColors; i++) {
                const tube = newTubes[i];
                if (tube.length !== 4 || !tube.every(c => c === tube[0])) {
                    isAlreadySolved = false;
                    break;
                }
            }
            if (isAlreadySolved) {
                return generateLevel(lvl); // Regenerate
            }

            return newTubes;
        }

        // Initialize Level
        function startLevel() {
            tubes = generateLevel(level);
            selectedTubeIndex = null;
            history = [];
            isAnimating = false;

            levelText.innerText = `المستوى: ${level} / 15`;
            undoBtn.classList.add('disabled');
            winModal.style.display = 'none';

            renderTubes();
        }

        // Render test tubes on the stage
        function renderTubes() {
            tubesContainer.innerHTML = '';
            
            // Use size-large for 5 or fewer tubes, size-small for > 5 tubes to wrap cleanly
            const sizeClass = tubes.length <= 5 ? 'size-large' : 'size-small';

            tubes.forEach((tube, idx) => {
                const tubeEl = document.createElement('div');
                tubeEl.className = `test-tube ${sizeClass}`;
                tubeEl.setAttribute('data-index', idx);

                if (selectedTubeIndex === idx) {
                    tubeEl.classList.add('selected');
                }

                // Inner tube components
                tubeEl.innerHTML = `
                    <div class="tube-lip"></div>
                    <div class="tube-shine-left"></div>
                    <div class="tube-shine-right"></div>
                    <div class="tube-liquid-container"></div>
                `;

                const liquidContainer = tubeEl.querySelector('.tube-liquid-container');
                tube.forEach(colorName => {
                    const segment = document.createElement('div');
                    segment.className = 'liquid-segment';
                    segment.style.background = COLORS[colorName];
                    segment.style.height = '25%'; // 4 segments max = 25% height each
                    liquidContainer.appendChild(segment);
                });

                tubesContainer.appendChild(tubeEl);
            });
        }

        // Save state to history for undo functionality
        function pushHistory() {
            const copy = tubes.map(t => [...t]);
            history.push(copy);
            undoBtn.classList.remove('disabled');
        }

        // Check if level is fully sorted
        function checkVictory() {
            return tubes.every(tube => {
                if (tube.length === 0) return true;
                if (tube.length !== 4) return false;
                const baseColor = tube[0];
                return tube.every(col => col === baseColor);
            });
        }

        // Celebrate success with particles
        function spawnCelebration() {
            const emojis = ['⭐', '🎈', '🫧', '✨', '💧'];
            for (let i = 0; i < 25; i++) {
                setTimeout(() => {
                    if (winModal.style.display === 'none') return; // Cancel if moved
                    const p = document.createElement('div');
                    p.className = 'victory-particle';
                    p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                    p.style.left = `${Math.floor(Math.random() * 85) + 5}%`;
                    p.style.setProperty('--rot', `${Math.floor(Math.random() * 360) - 180}deg`);
                    
                    const layout = container.querySelector('.game-water-sort-layout');
                    if (layout) {
                        layout.appendChild(p);
                        setTimeout(() => p.remove(), 2200);
                    }
                }, i * 80);
            }
        }

        // Spawn bubbles during pouring phase inside target tube
        function spawnPourBubbles(targetEl, count) {
            const container = targetEl.querySelector('.tube-liquid-container');
            if (!container) return;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (!isAnimating) return;
                    const bubble = document.createElement('div');
                    bubble.className = 'liquid-bubble';
                    bubble.style.left = `${Math.random() * 60 + 20}%`;
                    
                    const size = Math.random() * 4 + 3; // 3px to 7px size
                    bubble.style.width = `${size}px`;
                    bubble.style.height = `${size}px`;
                    
                    container.appendChild(bubble);
                    setTimeout(() => bubble.remove(), 650);
                }, i * 65);
            }
        }

        // Pour liquid animation and logic
        function executePour(srcIdx, destIdx) {
            const srcTube = tubes[srcIdx];
            const destTube = tubes[destIdx];

            // 1. Pour validation
            if (srcTube.length === 0) return; // Source empty
            if (destTube.length >= 4) {
                shakeTube(destIdx);
                return; // Target full
            }

            // (Relaxed rule: Pour any color block!)
            const srcTopColor = srcTube[srcTube.length - 1];

            // 2. Count pouring segments of the top color
            let consecutiveCount = 0;
            for (let k = srcTube.length - 1; k >= 0; k--) {
                if (srcTube[k] === srcTopColor) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }

            const destAvailableSpace = 4 - destTube.length;
            const pourAmount = Math.min(consecutiveCount, destAvailableSpace);

            if (pourAmount <= 0) return;

            // 3. Lock user input during animation
            isAnimating = true;
            pushHistory(); // Save state before change

            // 4. Retrieve DOM elements
            const tubeElements = tubesContainer.querySelectorAll('.test-tube');
            const srcEl = tubeElements[srcIdx];
            const destEl = tubeElements[destIdx];

            // 5. Calculate tilt offset (Precise alignment on the lip 50% 12px)
            const srcRect = srcEl.getBoundingClientRect();
            const destRect = destEl.getBoundingClientRect();
            
            const isRight = destRect.left > srcRect.left;
            const srcOriginX = srcRect.left + srcRect.width / 2;
            const srcOriginY = srcRect.top + 12;
            const destOriginX = destRect.left + destRect.width / 2;
            const destOriginY = destRect.top + 12;

            const offsetX = isRight ? -18 : 18;
            const offsetY = 35; // Hover 35px above the target lip

            const dx = destOriginX - srcOriginX + offsetX;
            const dy = destOriginY - srcOriginY - offsetY;
            const tiltAngle = isRight ? 75 : -75;

            if (window.sound) {
                window.sound.playClick();
            }

            // 6. Tilt Animation start
            srcEl.style.setProperty('--pour-x', `${dx}px`);
            srcEl.style.setProperty('--pour-y', `${dy}px`);
            srcEl.style.setProperty('--pour-angle', `${tiltAngle}deg`);
            
            srcEl.classList.remove('selected');
            srcEl.classList.add('pouring');

            // 7. Middle of animation: Pouring liquid stream and segment shrinking/growing
            setTimeout(() => {
                if (!isAnimating) return; // Safety check

                if (window.sound) {
                    window.sound.playBubble();
                }

                // Spawn micro-bubbles inside target tube to show physical reaction
                spawnPourBubbles(destEl, 8);

                // Show vertical pouring stream inside target tube
                const streamColor = COLORS[srcTopColor];
                const stream = document.createElement('div');
                stream.className = 'water-stream';
                
                // Stream goes from top lip of target down to the target's current liquid level
                const currentDestSegments = destTube.length;
                const streamHeightPct = 100 - (currentDestSegments * 25);
                stream.style.height = `${streamHeightPct}%`;
                stream.style.background = streamColor;
                destEl.appendChild(stream);

                // Animate source segments shrinking
                const srcLiquids = srcEl.querySelectorAll('.liquid-segment');
                for (let i = 0; i < pourAmount; i++) {
                    const segEl = srcLiquids[srcLiquids.length - 1 - i];
                    if (segEl) {
                        segEl.style.height = '0%';
                        segEl.style.opacity = '0';
                    }
                }

                // Animate target segments growing
                const destLiquidContainer = destEl.querySelector('.tube-liquid-container');
                for (let i = 0; i < pourAmount; i++) {
                    const tempSeg = document.createElement('div');
                    tempSeg.className = 'liquid-segment';
                    tempSeg.style.background = streamColor;
                    tempSeg.style.height = '0%';
                    tempSeg.style.opacity = '0';
                    destLiquidContainer.appendChild(tempSeg);

                    // Trigger transition in next cycle
                    setTimeout(() => {
                        tempSeg.style.height = '25%';
                        tempSeg.style.opacity = '1';
                    }, 20);
                }

                // 8. Pour complete: clean up stream and start untilting
                setTimeout(() => {
                    if (!isAnimating) return;

                    stream.remove();
                    srcEl.classList.remove('pouring');

                    // 9. Return animation finishes, update model & check victory
                    setTimeout(() => {
                        // Apply state changes to logical model
                        const pouredColors = srcTube.splice(srcTube.length - pourAmount, pourAmount);
                        destTube.push(...pouredColors);

                        selectedTubeIndex = null;
                        renderTubes(); // Force fresh render to clean inline styles

                        if (checkVictory()) {
                            // Win condition achieved!
                            if (window.sound) {
                                window.sound.playSuccess();
                            }
                            
                            // Check if final level 15 is beaten
                            if (level === 15) {
                                winTitle.innerText = '🏆 تهانينا يا بطل الألوان! 🏆';
                                winMessage.innerText = 'لقد انتصرت في جميع المستويات الـ 15! أنت عبقري فرز الألوان ومبدع حقيقي!';
                                nextLevelBtn.innerText = 'العب من جديد 🔄';
                            } else {
                                winTitle.innerText = '🎉 عمل رائع يا بطل! 🎉';
                                winMessage.innerText = 'لقد نجحت في فرز جميع ألوان الماء بذكاء!';
                                nextLevelBtn.innerText = 'المستوى التالي ➡️';
                            }

                            winModal.style.display = 'flex';
                            spawnCelebration();
                        }

                        isAnimating = false;
                    }, 400); // Untilting transition wait

                }, 520); // Pouring water wait

            }, 450); // Tilting transition wait
        }

        // Shake tube on error
        function shakeTube(idx) {
            if (window.sound) {
                window.sound.playFail();
            }
            const tubeEl = tubesContainer.querySelector(`[data-index="${idx}"]`);
            if (tubeEl) {
                tubeEl.classList.add('shake-error');
                setTimeout(() => tubeEl.classList.remove('shake-error'), 400);
            }
        }

        // Tubes click handler
        tubesContainer.addEventListener('click', (e) => {
            if (isAnimating) return; // Lock click interactions

            const tubeEl = e.target.closest('.test-tube');
            if (!tubeEl) return;

            const clickedIdx = parseInt(tubeEl.getAttribute('data-index'));

            if (selectedTubeIndex === null) {
                // Select first tube
                if (tubes[clickedIdx].length > 0) {
                    selectedTubeIndex = clickedIdx;
                    if (window.sound) {
                        window.sound.playClick();
                    }
                    renderTubes();
                } else {
                    shakeTube(clickedIdx);
                }
            } else {
                // Perform actions on second click
                if (selectedTubeIndex === clickedIdx) {
                    // Deselect tube
                    selectedTubeIndex = null;
                    if (window.sound) {
                        window.sound.playClick();
                    }
                    renderTubes();
                } else {
                    // Execute pour
                    executePour(selectedTubeIndex, clickedIdx);
                }
            }
        });

        // Reset level
        resetBtn.addEventListener('click', () => {
            if (isAnimating) return;
            if (window.sound) {
                window.sound.playFlip();
            }
            startLevel();
        });

        // Undo last action
        undoBtn.addEventListener('click', () => {
            if (isAnimating || history.length === 0) return;
            if (window.sound) {
                window.sound.playClick();
            }
            tubes = history.pop();
            selectedTubeIndex = null;
            if (history.length === 0) {
                undoBtn.classList.add('disabled');
            }
            renderTubes();
        });

        // Advance to next level / Restart on level 15 completion
        nextLevelBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            if (level >= 15) {
                level = 1;
            } else {
                level++;
            }
            startLevel();
        });

        // Start initial level
        startLevel();

        // Cleanup listener on exit
        container.addEventListener('game-exit', () => {
            isAnimating = false;
            // Clean up style element if exiting
            const activeStyle = document.getElementById(styleId);
            if (activeStyle) {
                activeStyle.remove();
            }
        });
    };
})();
