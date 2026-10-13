// لعبة البوب إت المضيء - Glowing Pop It
(function() {
    window.initPopitGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .popit-game-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
            }
            .popit-hud {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 300px;
                padding: 10px 16px;
                background: #FFF;
                border-radius: 14px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.06);
                box-sizing: border-box;
                margin-bottom: 12px;
                font-weight: bold;
                font-size: 16px;
                color: #C2185B;
            }
            .popit-hud span {
                font-weight: 900;
            }
            .popit-board-wrapper {
                background: #FF8A80; /* Pinkish board frame */
                padding: 16px;
                border-radius: 28px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.15), inset 0 -6px 0 rgba(0,0,0,0.12);
                border: 4px solid #FF5252;
                margin-bottom: 20px;
                box-sizing: border-box;
            }
            .popit-board {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .popit-row {
                display: flex;
                gap: 12px;
            }
            .popit-bubble {
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background-color: #FAFAFA; /* Unlit white bubble */
                border: 2px solid #E0E0E0;
                box-shadow: inset 0 -4px 0 rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.1s ease, background-color 0.2s ease, box-shadow 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-sizing: border-box;
            }
            .popit-bubble:active {
                transform: scale(0.94);
            }
            .popit-bubble.popped {
                background-color: #ECEFF1 !important;
                box-shadow: inset 0 4px 6px rgba(0,0,0,0.2) !important;
                transform: scale(0.92);
                border-color: #CFD8DC !important;
            }
            .glowing-active {
                animation: popit-glow-pulse 0.5s infinite alternate ease-in-out;
                z-index: 10;
                border-color: rgba(255,255,255,0.8) !important;
            }
            @keyframes popit-glow-pulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.14); }
            }
            .pop-shake {
                animation: popit-shake 0.3s ease;
            }
            @keyframes popit-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-6px) rotate(-3deg); }
                75% { transform: translateX(6px) rotate(3deg); }
            }
            .popit-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.65);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: #FFF;
                border-radius: 20px;
            }
            .popit-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #FF5252;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .popit-card h3 {
                color: #D32F2F;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .popit-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Elements Creation
        const layout = document.createElement('div');
        layout.className = 'popit-game-layout';
        container.appendChild(layout);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'البوب إت المضيء 💡';
        title.style.cssText = 'color:#C2185B; margin-bottom:2px; width:100%;';
        layout.appendChild(title);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'فرقع جميع الفقاعات الملونة المضيئة للانتقال للجولة التالية!';
        instr.style.cssText = 'margin-bottom:8px; width:100%;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'popit-hud';
        layout.appendChild(hud);

        const lvlSpan = document.createElement('span');
        lvlSpan.innerText = 'المرحلة: 1 / 5';
        const roundSpan = document.createElement('span');
        roundSpan.innerText = 'الجولة: 1 / 5';
        hud.appendChild(lvlSpan);
        hud.appendChild(roundSpan);

        const boardWrapper = document.createElement('div');
        boardWrapper.className = 'popit-board-wrapper';
        layout.appendChild(boardWrapper);

        const board = document.createElement('div');
        board.className = 'popit-board';
        boardWrapper.appendChild(board);

        const overlay = document.createElement('div');
        overlay.className = 'popit-overlay';
        overlay.style.display = 'none';
        layout.appendChild(overlay);

        const card = document.createElement('div');
        card.className = 'popit-card bounce-anim';
        overlay.appendChild(card);

        // Grid setup (5x5)
        const rows = 5;
        const cols = 5;
        const bubbles = []; // 2D array of bubble elements

        for (let r = 0; r < rows; r++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'popit-row';
            const rowArr = [];

            for (let c = 0; c < cols; c++) {
                const bubble = document.createElement('div');
                bubble.className = 'popit-bubble';
                bubble.setAttribute('data-row', r);
                bubble.setAttribute('data-col', c);
                
                const inner = document.createElement('div');
                inner.className = 'bubble-inner';
                bubble.appendChild(inner);

                rowEl.appendChild(bubble);
                rowArr.push(bubble);

                // Click / Touch events
                const handleTap = function(e) {
                    e.preventDefault();
                    onBubbleTap(r, c, bubble);
                };
                bubble.addEventListener('mousedown', handleTap);
                bubble.addEventListener('touchstart', handleTap);
            }
            board.appendChild(rowEl);
            bubbles.push(rowArr);
        }

        // Neon Glow Colors
        const glowColors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00B0FF', '#D500F9'];

        // Game state
        let isGameRunning = true;
        let currentLevel = 1; // 1 to 5
        let currentRound = 1; // 1 to 5 (rounds per level)
        const ROUNDS_PER_LEVEL = 5;

        let glowingActiveList = []; // Array of active glowing bubbles: { r, c, element, color, popped }

        function startRound() {
            if (!isGameRunning) return;

            // Clear all bubbles back to white/unpopped state
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const bubble = bubbles[r][c];
                    bubble.className = 'popit-bubble';
                    bubble.style.backgroundColor = '';
                    bubble.style.boxShadow = '';
                }
            }

            glowingActiveList = [];
            
            // Number of glowing bubbles equals the current level number (e.g. Level 3 glows 3 bubbles)
            const numGlowing = currentLevel;

            // Find unique coordinates
            const coordinates = [];
            while (coordinates.length < numGlowing) {
                const r = Math.floor(Math.random() * rows);
                const c = Math.floor(Math.random() * cols);
                const exists = coordinates.some(coord => coord.r === r && coord.c === c);
                if (!exists) {
                    coordinates.push({ r, c });
                }
            }

            // Light them up!
            coordinates.forEach(coord => {
                const targetBubble = bubbles[coord.r][coord.c];
                const color = glowColors[Math.floor(Math.random() * glowColors.length)];

                targetBubble.classList.add('glowing-active');
                targetBubble.style.backgroundColor = color;
                targetBubble.style.boxShadow = `0 0 16px ${color}, inset 0 -4px 0 rgba(0,0,0,0.15)`;

                glowingActiveList.push({
                    r: coord.r,
                    c: coord.c,
                    element: targetBubble,
                    color: color,
                    popped: false
                });
            });

            lvlSpan.innerText = `المرحلة: ${currentLevel} / 5`;
            roundSpan.innerText = `الجولة: ${currentRound} / 5`;
        }

        function onBubbleTap(r, c, element) {
            if (!isGameRunning) return;

            // Check if tapped bubble is in active glowing list and is not yet popped
            const activeMatch = glowingActiveList.find(b => b.r === r && b.c === c && !b.popped);

            if (activeMatch) {
                if (window.sound) window.sound.playPop();

                // Trigger pop styling
                element.classList.add('popped');
                element.classList.remove('glowing-active');
                element.style.backgroundColor = '';
                element.style.boxShadow = '';

                activeMatch.popped = true;

                // Check if all glowing bubbles in the current round are popped
                const allPopped = glowingActiveList.every(b => b.popped);
                if (allPopped) {
                    currentRound++;
                    
                    if (currentRound > ROUNDS_PER_LEVEL) {
                        levelWin();
                    } else {
                        // Play success micro sound/transition and start next round after short delay
                        setTimeout(startRound, 450);
                    }
                }
            } else {
                // Wrong Bubble tapped (or already popped)
                if (window.sound) window.sound.playFail();

                // Shake animation on clicked bubble
                element.classList.add('pop-shake');
                setTimeout(() => element.classList.remove('pop-shake'), 300);
            }
        }

        function levelWin() {
            if (window.sound) window.sound.playSuccess();

            if (currentLevel < 5) {
                card.innerHTML = `
                    <h3>🎉 كسبت المرحلة ${currentLevel}! 🎉</h3>
                    <p>لقد فرقعت كل الفقاعات المضيئة بذكاء وسرعة!</p>
                    <button class="menu-btn restart-btn" id="popitNextBtn">المرحلة التالية ➡️</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('popitNextBtn').onclick = () => {
                    currentLevel++;
                    currentRound = 1;
                    overlay.style.display = 'none';
                    startRound();
                };
            } else {
                card.innerHTML = `
                    <h3>🏆 بطل البوب إت المضيء! 🏆</h3>
                    <p>تهانينا! لقد أنهيت جميع المراحل الخمس بنجاح تام!</p>
                    <button class="menu-btn restart-btn" id="popitResetBtn">العب مجدداً 🔄</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('popitResetBtn').onclick = () => {
                    currentLevel = 1;
                    currentRound = 1;
                    overlay.style.display = 'none';
                    startRound();
                };
            }
        }

        // Clean exit listener
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
        }, { once: true });

        // Start gameplay
        startRound();
    };
})();
