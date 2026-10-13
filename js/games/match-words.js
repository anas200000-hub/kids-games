// Game 36: Connect Words & Pairs (صل الكلمات)
(function() {
    window.initMatchWordsGame = function(container) {
        let score = 0;
        let currentLevel = 0;
        let gameActive = true;
        let activeLeftNode = null;
        let connections = []; // List of successful connections: { leftId, rightId, color }
        let dragStartNode = null;
        let currentDragPos = null;

        const levels = [
            {
                title: 'مستوى الحيوانات 🦁',
                pairs: [
                    { id: 'lion', emoji: '🦁', word: 'أسد' },
                    { id: 'elephant', emoji: '🐘', word: 'فيل' },
                    { id: 'monkey', emoji: '🐵', word: 'قرد' },
                    { id: 'giraffe', emoji: '🦒', word: 'زرافة' }
                ]
            },
            {
                title: 'مستوى الأشكال والهندسة 📐',
                pairs: [
                    { id: 'triangle', emoji: '🔺', word: 'مثلث' },
                    { id: 'circle', emoji: '🟡', word: 'دائرة' },
                    { id: 'square', emoji: '🟩', word: 'مربع' },
                    { id: 'star', emoji: '⭐', word: 'نجمة' }
                ]
            },
            {
                title: 'مستوى الفواكه اللذيذة 🍎',
                pairs: [
                    { id: 'apple', emoji: '🍎', word: 'تفاح' },
                    { id: 'banana', emoji: '🍌', word: 'موز' },
                    { id: 'strawberry', emoji: '🍓', word: 'فراولة' },
                    { id: 'grapes', emoji: '🍇', word: 'عنب' }
                ]
            },
            {
                title: 'مستوى المركبات 🚀',
                pairs: [
                    { id: 'car', emoji: '🚗', word: 'سيارة' },
                    { id: 'rocket', emoji: '🚀', word: 'صاروخ' },
                    { id: 'plane', emoji: '✈️', word: 'طائرة' },
                    { id: 'boat', emoji: '⛵', word: 'قارب' }
                ]
            }
        ];

        const lineColors = ['#FF5252', '#4CAF50', '#2196F3', '#9C27B0'];

        let html = `
            <div class="game-match-layout" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 420px; margin: 0 auto; box-sizing: border-box; font-family: var(--font-kids); position: relative; user-select: none;">
                <h2 class="game-title" style="color: #AB47BC; margin-bottom: 5px; font-weight: 900;">🔗 صل الكلمات 🔗</h2>
                <div style="font-size: 15px; color: #7B1FA2; font-weight: bold; margin-bottom: 12px;" id="matchLevelTitle">مستوى الحيوانات 🦁</div>
                
                <div class="game-hud" style="display: flex; justify-content: space-between; width: 100%; padding: 8px 15px; background: #FFF; border-radius: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); box-sizing: border-box; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #8E24AA; font-size: 15px;">المستوى: <span id="matchLevelNum">1</span> / 4</div>
                    <div style="font-weight: bold; color: #4CAF50; font-size: 15px;">التوصيلات الصحيحة: <span id="matchSuccessCount">0</span> / 4</div>
                </div>

                <!-- Match board container containing columns and drawing canvas overlay -->
                <div id="matchBoard" style="display: flex; justify-content: space-between; width: 100%; position: relative; padding: 10px 0; box-sizing: border-box;">
                    <!-- Left Column (Emojis) -->
                    <div id="leftColumn" style="display: flex; flex-direction: column; gap: 15px; width: 42%; z-index: 10;">
                        <!-- Cards will render here -->
                    </div>

                    <!-- Right Column (Words) -->
                    <div id="rightColumn" style="display: flex; flex-direction: column; gap: 15px; width: 42%; z-index: 10;">
                        <!-- Cards will render here -->
                    </div>

                    <!-- Canvas overlay for lines drawing -->
                    <canvas id="matchCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none;"></canvas>
                </div>

                <div style="font-size: 13px; color: #888; text-align: center; margin-top: 15px; font-weight: bold;">
                    انقر على الرمز ثم الاسم لتوصيلهما، أو اسحب إصبعك مباشرة للربط بينهما!
                </div>

                <!-- Modal for winning -->
                <div id="matchSuccessModal" class="game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content bounce-anim" style="background: #FFF; padding: 25px; border-radius: 25px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid #AB47BC; margin: auto;">
                        <h3 style="color: #AB47BC; font-size: 24px; margin-bottom: 10px;">🎉 رائع ومذهل! 🎉</h3>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #555;">لقد نجحت في ربط جميع الكلمات بصورها الصحيحة بنجاح!</p>
                        <button class="menu-btn restart-btn" id="restartMatch" style="background: #AB47BC; color: #FFF; border: none; padding: 10px 20px; font-size: 16px; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 0 #7B1FA2; transition: transform 0.1s;">العب مرة أخرى 🔄</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const leftColEl = document.getElementById('leftColumn');
        const rightColEl = document.getElementById('rightColumn');
        const canvas = document.getElementById('matchCanvas');
        const ctx = canvas.getContext('2d');
        const levelTitleEl = document.getElementById('matchLevelTitle');
        const levelNumEl = document.getElementById('matchLevelNum');
        const successCountEl = document.getElementById('matchSuccessCount');

        // Setup resize handling for lines mapping
        function resizeCanvas() {
            const board = document.getElementById('matchBoard');
            canvas.width = board.clientWidth;
            canvas.height = board.clientHeight;
            drawLines();
        }
        
        window.addEventListener('resize', resizeCanvas);
        setTimeout(resizeCanvas, 150); // delay to let cards render

        function startLevel(levelIdx) {
            currentLevel = levelIdx;
            connections = [];
            activeLeftNode = null;
            dragStartNode = null;
            currentDragPos = null;

            const levelData = levels[currentLevel];
            levelTitleEl.innerText = levelData.title;
            levelNumEl.innerText = currentLevel + 1;
            successCountEl.innerText = '0';

            // Generate card structures
            // Left cards (Emojis) - kept in sorted pairs order or random
            const leftPairs = [...levelData.pairs].sort(() => Math.random() - 0.5);
            leftColEl.innerHTML = '';
            leftPairs.forEach(pair => {
                const card = document.createElement('div');
                card.classList.add('match-card', 'left-card');
                card.setAttribute('data-id', pair.id);
                card.style.cssText = `
                    background: transparent;
                    border: none;
                    border-radius: 15px;
                    padding: 12px 10px;
                    text-align: center;
                    font-size: 42px;
                    cursor: pointer;
                    position: relative;
                    transition: transform 0.15s, background 0.2s;
                `;
                card.innerHTML = `<div>${pair.emoji}</div>`;
                leftColEl.appendChild(card);

                // Add mouse/touch interactions
                setupCardInteractions(card, 'left');
            });

            // Right cards (Words) - shuffled
            const rightPairs = [...levelData.pairs].sort(() => Math.random() - 0.5);
            rightColEl.innerHTML = '';
            rightPairs.forEach(pair => {
                const card = document.createElement('div');
                card.classList.add('match-card', 'right-card');
                card.setAttribute('data-id', pair.id);
                card.style.cssText = `
                    background: transparent;
                    border: none;
                    border-radius: 15px;
                    padding: 15px 10px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: #2E7D32;
                    cursor: pointer;
                    position: relative;
                    transition: transform 0.15s, background 0.2s;
                `;
                card.innerHTML = `<div>${pair.word}</div>`;
                rightColEl.appendChild(card);

                setupCardInteractions(card, 'right');
            });

            // Resize canvas to adjust for new heights
            setTimeout(resizeCanvas, 100);
        }

        // Draw connections
        function drawLines() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw existing locked lines
            connections.forEach(conn => {
                const leftCard = leftColEl.querySelector(`[data-id="${conn.leftId}"]`);
                const rightCard = rightColEl.querySelector(`[data-id="${conn.rightId}"]`);

                if (leftCard && rightCard) {
                    const lPos = getElementCenterPos(leftCard);
                    const rPos = getElementCenterPos(rightCard);

                    ctx.beginPath();
                    ctx.strokeStyle = conn.color;
                    ctx.lineWidth = 5;
                    ctx.lineCap = 'round';
                    
                    // Draw curved line for kid aesthetics
                    ctx.moveTo(lPos.x, lPos.y);
                    ctx.bezierCurveTo(
                        lPos.x + 40, lPos.y,
                        rPos.x - 40, rPos.y,
                        rPos.x, rPos.y
                    );
                    ctx.stroke();
                }
            });

            // Draw current active dragging line
            if (dragStartNode && currentDragPos) {
                if (dragStartNode) {
                    const pos = getElementCenterPos(dragStartNode);
                    ctx.beginPath();
                    ctx.strokeStyle = '#FFAB40'; // drag orange
                    ctx.lineWidth = 5;
                    ctx.lineCap = 'round';
                    ctx.setLineDash([5, 5]);

                    ctx.moveTo(pos.x, pos.y);
                    ctx.bezierCurveTo(
                        pos.x + 30, pos.y,
                        currentDragPos.x - 30, currentDragPos.y,
                        currentDragPos.x, currentDragPos.y
                    );
                    ctx.stroke();
                    ctx.setLineDash([]); // Reset
                }
            }
        }

        // Helper to get element coordinates relative to canvas
        function getElementCenterPos(el) {
            const elRect = el.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            return {
                x: elRect.left - canvasRect.left + elRect.width / 2,
                y: elRect.top - canvasRect.top + elRect.height / 2
            };
        }

        function setupCardInteractions(card, side) {
            // Tap Select matching
            card.addEventListener('click', () => {
                if (!gameActive) return;
                const cardId = card.getAttribute('data-id');

                // Check if card already connected
                const isConnected = connections.some(c => 
                    side === 'left' ? c.leftId === cardId : c.rightId === cardId
                );
                if (isConnected) return;

                if (side === 'left') {
                    // Deselect previous left card if tapped again, or select new
                    if (activeLeftNode === card) {
                        deselectCard(card, 'left');
                        activeLeftNode = null;
                    } else {
                        if (activeLeftNode) deselectCard(activeLeftNode, 'left');
                        activeLeftNode = card;
                        selectCard(card, 'left');
                        if (window.sound) window.sound.playClick();
                    }
                } else {
                    // Tapped right card
                    if (activeLeftNode) {
                        const leftId = activeLeftNode.getAttribute('data-id');
                        const rightId = cardId;

                        if (leftId === rightId) {
                            // CORRECT MATCH!
                            connectPairs(leftId, rightId);
                        } else {
                            // INCORRECT MATCH
                            if (window.sound) window.sound.playFail();
                            shakeCard(card);
                            shakeCard(activeLeftNode);
                            deselectCard(activeLeftNode, 'left');
                            activeLeftNode = null;
                        }
                    }
                }
            });

            // Drag-to-connect logic
            let activeDrag = false;

            function onDragStart(e) {
                if (!gameActive || side === 'right') return; // only drag left to right
                const cardId = card.getAttribute('data-id');
                const isConnected = connections.some(c => c.leftId === cardId);
                if (isConnected) return;

                activeDrag = true;
                dragStartNode = card;
                selectCard(card, 'left');

                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
            }

            function onDragMove(e) {
                if (!activeDrag) return;
                const canvasRect = canvas.getBoundingClientRect();
                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                currentDragPos = {
                    x: clientX - canvasRect.left,
                    y: clientY - canvasRect.top
                };

                drawLines();

                // Detect hovering right card
                const hoveredRight = detectHoveredRightCard(clientX, clientY);
                clearRightCardHovers();
                if (hoveredRight) {
                    hoveredRight.style.background = 'rgba(76,175,80,0.15)';
                    hoveredRight.style.transform = 'scale(1.05)';
                }
            }

            function onDragEnd(e) {
                if (!activeDrag) return;
                activeDrag = false;

                const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
                const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;

                const hoveredRight = detectHoveredRightCard(clientX, clientY);
                clearRightCardHovers();

                deselectCard(dragStartNode, 'left');

                if (hoveredRight) {
                    const leftId = dragStartNode.getAttribute('data-id');
                    const rightId = hoveredRight.getAttribute('data-id');

                    if (leftId === rightId) {
                        connectPairs(leftId, rightId);
                    } else {
                        if (window.sound) window.sound.playFail();
                        shakeCard(hoveredRight);
                        shakeCard(dragStartNode);
                    }
                }

                dragStartNode = null;
                currentDragPos = null;
                drawLines();
            }

            card.addEventListener('mousedown', onDragStart);
            window.addEventListener('mousemove', onDragMove);
            window.addEventListener('mouseup', onDragEnd);

            card.addEventListener('touchstart', onDragStart, { passive: false });
            window.addEventListener('touchmove', onDragMove, { passive: false });
            window.addEventListener('touchend', onDragEnd, { passive: false });
        }

        function detectHoveredRightCard(clientX, clientY) {
            const cards = rightColEl.querySelectorAll('.right-card');
            for (let i = 0; i < cards.length; i++) {
                const r = cards[i].getBoundingClientRect();
                if (
                    clientX >= r.left &&
                    clientX <= r.right &&
                    clientY >= r.top &&
                    clientY <= r.bottom
                ) {
                    // Check if already connected
                    const isConnected = connections.some(c => c.rightId === cards[i].getAttribute('data-id'));
                    if (!isConnected) {
                        return cards[i];
                    }
                }
            }
            return null;
        }

        function clearRightCardHovers() {
            rightColEl.querySelectorAll('.right-card').forEach(card => {
                const isConnected = connections.some(c => c.rightId === card.getAttribute('data-id'));
                if (!isConnected) {
                    card.style.background = 'transparent';
                    card.style.transform = 'none';
                }
            });
        }

        function selectCard(node, side) {
            node.style.background = side === 'left' ? 'rgba(171,71,188,0.15)' : 'rgba(76,175,80,0.15)';
            node.style.transform = 'scale(1.1)';
        }

        function deselectCard(node, side) {
            if (!node) return;
            node.style.background = 'transparent';
            node.style.transform = 'none';
        }

        function shakeCard(node) {
            node.classList.add('shake-anim');
            setTimeout(() => node.classList.remove('shake-anim'), 500);
        }

        // Successfully connect left and right elements
        function connectPairs(leftId, rightId) {
            const color = lineColors[connections.length % lineColors.length];
            connections.push({ leftId, rightId, color });

            // Update UI card elements
            const leftCard = leftColEl.querySelector(`[data-id="${leftId}"]`);
            const rightCard = rightColEl.querySelector(`[data-id="${rightId}"]`);

            if (leftCard && rightCard) {
                leftCard.style.background = 'rgba(76,175,80,0.15)';
                leftCard.style.opacity = '0.7';

                rightCard.style.background = 'rgba(76,175,80,0.15)';
                rightCard.style.opacity = '0.7';
            }

            if (window.sound) window.sound.playBubble();

            activeLeftNode = null;
            successCountEl.innerText = connections.length;

            drawLines();

            // Check if level complete
            if (connections.length === 4) {
                setTimeout(completeLevel, 500);
            }
        }

        function completeLevel() {
            if (currentLevel < levels.length - 1) {
                // Advance to next level
                if (window.sound) window.sound.playSuccess();
                
                // Temporary nice animation flash
                container.style.opacity = '0.3';
                setTimeout(() => {
                    container.style.opacity = '1.0';
                    startLevel(currentLevel + 1);
                }, 300);
            } else {
                // Game Won!
                gameActive = false;
                if (window.sound) window.sound.playSuccess();
                document.getElementById('matchSuccessModal').style.display = 'flex';
            }
        }

        function resetGame() {
            document.getElementById('matchSuccessModal').style.display = 'none';
            gameActive = true;
            startLevel(0);
        }

        // Modal reset button
        document.getElementById('restartMatch').addEventListener('click', resetGame);

        // Start
        resetGame();

        // Exit clean up
        container.addEventListener('game-exit', () => {
            window.removeEventListener('resize', resizeCanvas);
        });
    };
})();
