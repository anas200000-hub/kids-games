// لعبة برج الحلقات - Stacking Rings Game (نسخة الجرافيك العالي والحركة الدقيقة)
(function() {
    window.initRingStackerGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles dynamically to keep the game self-contained and modular
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .ring-stacker-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
            }
            .stacker-header {
                display: flex;
                justify-content: space-between;
                width: 100%;
                padding: 10px 18px;
                background: #FFF;
                border-radius: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                box-sizing: border-box;
                margin-bottom: 10px;
                border: 2px solid #E2E8F0;
            }
            .stacker-header span {
                font-weight: bold;
                font-size: 16px;
            }
            .stacker-board {
                width: 100%;
                height: 330px;
                background: radial-gradient(circle at center, #E0F7FA 0%, #B2EBF2 60%, #80DEEA 100%);
                border-radius: 24px;
                position: relative;
                box-shadow: inset 0 5px 15px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1);
                border: 3px solid #80DEEA;
                margin-bottom: 12px;
                overflow: hidden;
            }
            /* Realistic polished wood base */
            .peg-base {
                width: 220px;
                height: 24px;
                background: linear-gradient(to bottom, #A1887F 0%, #8D6E63 40%, #5D4037 80%, #3E2723 100%);
                border-radius: 12px;
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: 0 8px 16px rgba(0,0,0,0.35), inset 0 2px 2px rgba(255,255,255,0.25);
                z-index: 1;
                border-top: 1px solid rgba(255,255,255,0.15);
            }
            /* Cylindrical wood shaded peg shaft */
            .peg-shaft {
                width: 24px;
                height: 230px;
                background: linear-gradient(to right, 
                    #8D6E63 0%, 
                    #A1887F 25%, 
                    #BCAAA4 45%, 
                    #8D6E63 75%, 
                    #5D4037 100%
                );
                border-radius: 12px 12px 0 0;
                position: absolute;
                bottom: 35px;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: inset -2px 0 5px rgba(0,0,0,0.15), 4px 0 8px rgba(0,0,0,0.15);
                z-index: 1;
            }
            .peg-tip {
                width: 24px;
                height: 12px;
                background: linear-gradient(to right, #FF8F00, #FFB300, #FF8F00);
                border-radius: 12px 12px 0 0;
                position: absolute;
                top: 0;
                left: 0;
                box-shadow: inset 0 2px 2px rgba(255,255,255,0.4);
            }
            .rings-pool {
                width: 100%;
                min-height: 150px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 24px;
                border: 3px dashed #A0AEC0;
                padding: 16px;
                box-sizing: border-box;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 14px;
                position: relative;
            }
            /* High Graphics 3D Glossy Ring */
            .ring-element {
                height: 32px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #FFF;
                font-weight: 900;
                font-size: 20px;
                text-shadow: 2px 2px 3px rgba(0,0,0,0.5);
                cursor: grab;
                box-shadow: 
                    inset 0 5px 0 rgba(255,255,255,0.5), 
                    inset 0 -5px 0 rgba(0,0,0,0.3), 
                    0 5px 10px rgba(0,0,0,0.18);
                border: 2px solid rgba(255,255,255,0.35);
                touch-action: none;
                position: relative;
                user-select: none;
                transition: transform 0.1s ease;
            }
            /* 3D Ring Hole */
            .ring-hole {
                width: 26px;
                height: 12px;
                background: linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.2));
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.7);
                border: 1.5px solid rgba(255,255,255,0.15);
                z-index: 1;
            }
            /* Offset number when in pool to avoid overlapping the hole */
            .ring-element:not(.stacked) .ring-number {
                position: absolute;
                right: 18px;
                z-index: 2;
                pointer-events: none;
            }
            /* Center number when stacked on the peg */
            .ring-element.stacked .ring-number {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2;
                pointer-events: none;
            }
            /* Hide the hole when stacked since the peg fills it */
            .ring-element.stacked .ring-hole {
                display: none;
            }
            /* Lifting visual cues during manual dragging */
            .ring-element.dragging {
                cursor: grabbing;
                transform: rotate(-3deg) scale(1.08); /* Dangling tilt */
                box-shadow: 
                    inset 0 5px 0 rgba(255,255,255,0.5), 
                    inset 0 -5px 0 rgba(0,0,0,0.3), 
                    0 15px 25px rgba(0,0,0,0.3); /* Higher shadow */
                z-index: 1000;
            }
            .ring-element.stacked {
                cursor: default;
                touch-action: none;
                z-index: 2;
            }
            /* Bouncy gravity drop keyframes generated dynamically in JS to prevent WebView bugs */
            @keyframes error-shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .error-shake {
                animation: error-shake 0.4s ease-in-out;
            }
            .success-overlay {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.45);
                z-index: 2000;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                border-radius: 22px;
            }
            .success-overlay.show {
                display: flex;
            }
            .success-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #FFD54F;
                box-shadow: 0 10px 30px rgba(0,0,0,0.35);
                width: 100%;
                max-width: 300px;
                box-sizing: border-box;
            }
            .success-card h3 {
                color: #2E7D32;
                margin-bottom: 8px;
                font-size: 22px;
                font-weight: 900;
            }
            .success-card p {
                color: #546e7a;
                margin-bottom: 16px;
                font-size: 15px;
                font-weight: bold;
            }
        `;
        container.appendChild(styleEl);

        // 2. Setup progression rounds (3 to 7 rings)
        const rounds = [
            { count: 3, colors: ['#FF5252', '#FFA726', '#FFEB3B'] }, // Red, Orange, Yellow
            { count: 4, colors: ['#FF5252', '#FFA726', '#FFEB3B', '#66BB6A'] }, // Red, Orange, Yellow, Green
            { count: 5, colors: ['#FF5252', '#FFA726', '#FFEB3B', '#66BB6A', '#29B6F6'] }, // Red, Orange, Yellow, Green, Blue
            { count: 6, colors: ['#FF5252', '#FFA726', '#FFEB3B', '#66BB6A', '#29B6F6', '#EC407A'] }, // Red, Orange, Yellow, Green, Blue, Pink (Matches user picture)
            { count: 7, colors: ['#FF5252', '#FFA726', '#FFEB3B', '#66BB6A', '#29B6F6', '#EC407A', '#AB47BC'] } // Red, Orange, Yellow, Green, Blue, Pink, Purple
        ];

        let rIdx = 0; // Current round index
        let score = 0;
        let nextCorrectNumber = 1;
        let stackedRings = [];

        // 3. Stacking Arena Layout
        const layout = document.createElement('div');
        layout.className = 'ring-stacker-layout';
        container.appendChild(layout);

        // Title
        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'حلقات الأرقام 🍩';
        title.style.cssText = 'color:#EC407A;margin-bottom:2px;width:100%;';
        layout.appendChild(title);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'احمل الحلقات يدوياً واسحبها ورتبها على العمود من الرقم 1 في الأسفل للأصغر في الأعلى!';
        instr.style.cssText = 'margin-bottom:8px;width:100%;';
        layout.appendChild(instr);

        // Header statistics
        const header = document.createElement('div');
        header.className = 'stacker-header';
        layout.appendChild(header);

        const progressSpan = document.createElement('span');
        progressSpan.style.color = '#EC407A';
        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#2E7D32';
        header.appendChild(progressSpan);
        header.appendChild(scoreSpan);

        // Play board (peg container)
        const board = document.createElement('div');
        board.className = 'stacker-board';
        layout.appendChild(board);

        // Wooden Base
        const base = document.createElement('div');
        base.className = 'peg-base';
        board.appendChild(base);

        // Wooden Shaft
        const shaft = document.createElement('div');
        shaft.className = 'peg-shaft';
        board.appendChild(shaft);

        const tip = document.createElement('div');
        tip.className = 'peg-tip';
        shaft.appendChild(tip);

        // Rings Pool
        const pool = document.createElement('div');
        pool.className = 'rings-pool';
        layout.appendChild(pool);

        // Success Overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        layout.appendChild(overlay);

        const successCard = document.createElement('div');
        successCard.className = 'success-card bounce-anim';
        overlay.appendChild(successCard);

        function updateInfo() {
            progressSpan.innerText = `المرحلة: ${rIdx + 1} / ${rounds.length}`;
            scoreSpan.innerText = `النقاط: ${score}`;
        }

        // Initialize / Load Round
        function loadRound() {
            if (rIdx >= rounds.length) {
                rIdx = 0;
                score = 0;
            }

            // Clean up temporary animation styles
            document.querySelectorAll('.temp-ring-animation').forEach(el => el.remove());

            updateInfo();
            nextCorrectNumber = 1;
            stackedRings = [];

            // Clear previous stacked rings from board
            board.querySelectorAll('.ring-element').forEach(el => el.remove());

            // Clear pool
            pool.innerHTML = '';

            const currentRound = rounds[rIdx];
            const maxRings = currentRound.count;

            // Generate rings
            const ringsData = [];
            for (let i = 1; i <= maxRings; i++) {
                ringsData.push({
                    number: i,
                    color: currentRound.colors[i - 1]
                });
            }

            // In the last stage (Stage 5), add the 8th item: the duck
            if (rIdx === 4) {
                ringsData.push({
                    number: 8,
                    color: '#FFD54F',
                    isDuck: true,
                    emoji: '🐤'
                });
            }

            // Shuffle rings data for the pool layout
            const shuffledRings = [...ringsData].sort(() => Math.random() - 0.5);

            // Render rings in the pool
            shuffledRings.forEach(item => {
                const ringEl = document.createElement('div');
                ringEl.dataset.number = item.number;

                if (item.isDuck) {
                    ringEl.className = 'ring-element duck-element';
                    ringEl.style.width = '64px';
                    ringEl.style.height = '64px';
                    ringEl.style.background = 'transparent';
                    ringEl.style.boxShadow = 'none';
                    ringEl.style.border = 'none';
                    ringEl.style.cursor = 'grab';
                    ringEl.style.touchAction = 'none';
                    ringEl.style.display = 'flex';
                    ringEl.style.alignItems = 'center';
                    ringEl.style.justifyContent = 'center';
                    ringEl.style.filter = 'drop-shadow(0px 3px 5px rgba(0,0,0,0.15))';
                    
                    // Direct SVG insertion of the custom yellow rubber duck matching user image
                    ringEl.innerHTML = `
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                            <!-- Main Body & Head Outline -->
                            <path d="M 45,13 C 57,13 67,23 67,35 C 67,45 60,52 65,58 C 72,62 85,62 92,68 C 95,71 95,73 91,78 C 85,88 75,95 55,95 C 35,95 18,92 14,80 C 11,70 18,60 28,54 C 25,48 23,43 23,35 C 23,23 33,13 45,13 Z" 
                                  fill="#FFEB3B" stroke="#000000" stroke-width="3.5" stroke-linejoin="round" />
                            <!-- Eye -->
                            <ellipse cx="40" cy="28" rx="6" ry="8" fill="#FFFFFF" stroke="#000000" stroke-width="2.5" />
                            <ellipse cx="42" cy="28" rx="3.5" ry="5" fill="#000000" />
                            <!-- Beak open mouth background -->
                            <path d="M 12,41 C 15,40 17,42 17,44 C 15,46 13,44 12,41 Z" fill="#D84315" />
                            <!-- Top Beak -->
                            <path d="M 23,34 C 13,31 8,34 9,38 C 10,42 18,44 23,41 Z" 
                                  fill="#FF9100" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
                            <!-- Bottom Beak -->
                            <path d="M 21,43 C 14,44 11,46 12,49 C 13,52 19,50 21,46 Z" 
                                  fill="#FF9100" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
                            <!-- Wing -->
                            <path d="M 42,66 C 47,76 72,76 78,64" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
                        </svg>
                    `;
                } else {
                    ringEl.className = 'ring-element';
                    
                    // Width sizing in the pool (smaller, compact fit)
                    // Width ranges from 125px (1) down to 65px (highest ring)
                    const poolWidth = maxRings > 1 
                        ? 125 - (item.number - 1) * (60 / (maxRings - 1)) 
                        : 125;
                    
                    ringEl.style.width = `${poolWidth}px`;
                    ringEl.dataset.poolWidth = poolWidth;
                    
                    // Color Palettes mapping for glossy linear gradient
                    const palette = getColorPalette(item.color);
                    ringEl.style.background = `linear-gradient(135deg, ${palette.light} 0%, ${palette.main} 50%, ${palette.dark} 100%)`;
                    
                    // 3D Hole inside ring
                    const hole = document.createElement('div');
                    hole.className = 'ring-hole';
                    ringEl.appendChild(hole);

                    // Number
                    const numSpan = document.createElement('span');
                    numSpan.className = 'ring-number';
                    numSpan.innerText = item.number;
                    ringEl.appendChild(numSpan);
                }

                pool.appendChild(ringEl);
                setupDragging(ringEl, item);
            });
        }

        // Get glossy 3D color palettes
        function getColorPalette(hex) {
            const colorPalettes = {
                '#FF5252': { light: '#FF8A80', main: '#FF5252', dark: '#C62828' }, // Red
                '#FFA726': { light: '#FFE082', main: '#FFA726', dark: '#E65100' }, // Orange
                '#FFEB3B': { light: '#FFF9C4', main: '#FFEB3B', dark: '#FBC02D' }, // Yellow
                '#66BB6A': { light: '#C8E6C9', main: '#66BB6A', dark: '#2E7D32' }, // Green
                '#29B6F6': { light: '#B3E5FC', main: '#29B6F6', dark: '#0288D1' }, // Blue
                '#EC407A': { light: '#F8BBD0', main: '#EC407A', dark: '#C2185B' }, // Pink
                '#AB47BC': { light: '#E1BEE7', main: '#AB47BC', dark: '#7B1FA2' }  // Purple
            };
            return colorPalettes[hex] || { light: '#FFFFFF', main: hex, dark: '#000000' };
        }

        // Setup strictly manual drag & drop carrying
        function setupDragging(ringEl, item) {
            let isDragging = false;
            let dragThresholdPassed = false;
            let startX = 0, startY = 0;
            let originalLeft = 0, originalTop = 0;
            let initialParent = ringEl.parentElement;

            ringEl.addEventListener('pointerdown', function(e) {
                if (ringEl.classList.contains('stacked')) return;
                e.preventDefault();
                ringEl.setPointerCapture(e.pointerId);

                isDragging = true;
                dragThresholdPassed = false;
                startX = e.clientX;
                startY = e.clientY;
            });

            ringEl.addEventListener('pointermove', function(e) {
                if (!isDragging) return;
                e.preventDefault();

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                // Threshold to avoid false drag triggers on simple taps
                if (!dragThresholdPassed) {
                    if (Math.hypot(dx, dy) > 8) {
                        dragThresholdPassed = true;
                        ringEl.classList.add('dragging');
                        if (window.sound) window.sound.playClick();

                        const rect = ringEl.getBoundingClientRect();
                        const poolRect = pool.getBoundingClientRect();
                        originalLeft = rect.left - poolRect.left;
                        originalTop = rect.top - poolRect.top;

                        ringEl.style.position = 'absolute';
                        ringEl.style.left = originalLeft + 'px';
                        ringEl.style.top = originalTop + 'px';
                        ringEl.style.width = rect.width + 'px';
                        ringEl.style.height = rect.height + 'px';
                        ringEl.style.zIndex = '1000';
                        if (item.isDuck) {
                             ringEl.style.filter = 'drop-shadow(0px 12px 15px rgba(0,0,0,0.35))';
                             ringEl.style.transform = 'rotate(-5deg) scale(1.1)';
                        }
                    }
                } else {
                    ringEl.style.left = (originalLeft + dx) + 'px';
                    ringEl.style.top = (originalTop + dy) + 'px';
                }
            });

            ringEl.addEventListener('pointerup', function(e) {
                if (!isDragging) return;
                isDragging = false;
                ringEl.releasePointerCapture(e.pointerId);

                if (!dragThresholdPassed) {
                    // Clicking alone does not stack now! (Must be carried manually as requested)
                    if (window.sound) window.sound.playFail();
                    ringEl.classList.add('error-shake');
                    setTimeout(() => ringEl.classList.remove('error-shake'), 500);
                } else {
                    ringEl.classList.remove('dragging');
                    
                    const boardRect = board.getBoundingClientRect();
                    const ringRect = ringEl.getBoundingClientRect();
                    const ringCenterX = ringRect.left + ringRect.width / 2;
                    const ringCenterY = ringRect.top + ringRect.height / 2;
                    const boardCenterX = boardRect.left + boardRect.width / 2;

                    // Precise target verification: must be aligned horizontally and lifted to the top of the peg
                    const isXAligned = Math.abs(ringCenterX - boardCenterX) < 80;
                    const isHighEnough = ringCenterY < (boardRect.bottom - 225); // Lifted above the top of the peg shaft
                    const isNearPeg = isXAligned && isHighEnough;

                    if (isNearPeg && item.number === nextCorrectNumber) {
                        stackRing(ringEl, item);
                    } else {
                        // Fail drop
                        if (window.sound) window.sound.playFail();
                        ringEl.classList.add('error-shake');

                        // Provide visual educational instruction hints
                        if (item.number !== nextCorrectNumber) {
                            instr.innerText = `❌ الترتيب خاطئ! يجب وضع الرقم ${nextCorrectNumber} الآن!`;
                            instr.style.color = '#E53935';
                            instr.style.fontWeight = 'bold';
                        } else if (isXAligned && !isHighEnough) {
                            instr.innerText = '❌ يجب رفع الحلقة لأعلى قمة العمود لكي تدخل!';
                            instr.style.color = '#E53935';
                            instr.style.fontWeight = 'bold';
                        }

                        // Restore original instruction after delay
                        setTimeout(() => {
                            instr.innerText = 'احمل الحلقات يدوياً واسحبها ورتبها على العمود من الرقم 1 في الأسفل للأصغر في الأعلى!';
                            instr.style.color = '';
                            instr.style.fontWeight = '';
                        }, 2500);
                        
                        ringEl.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                        ringEl.style.left = originalLeft + 'px';
                        ringEl.style.top = originalTop + 'px';

                        setTimeout(() => {
                            ringEl.classList.remove('error-shake');
                            ringEl.style.transition = 'none';
                            ringEl.style.position = '';
                            ringEl.style.left = '';
                            ringEl.style.top = '';
                            if (item.isDuck) {
                                ringEl.style.width = '64px';
                                ringEl.style.height = '64px';
                                ringEl.style.filter = 'drop-shadow(0px 3px 5px rgba(0,0,0,0.15))';
                                ringEl.style.transform = '';
                            } else {
                                ringEl.style.width = `${ringEl.dataset.poolWidth}px`;
                                ringEl.style.height = '';
                            }
                            ringEl.style.zIndex = '';
                        }, 300);
                    }
                }
            });
        }

        // Animate and Stack Ring with gravity bounce
        function stackRing(ringEl, item) {
            const currentRound = rounds[rIdx];
            const maxRings = currentRound.count;
            const index = stackedRings.length; // 0 is bottom ring

            stackedRings.push(item);
            nextCorrectNumber++;

            // Precise stacked width scaling
            // Widest 180px, narrowest 80px
            const stackedWidth = maxRings > 1 
                ? 180 - (item.number - 1) * (100 / (maxRings - 1)) 
                : 180;

            // Final bottom coordinate calculation
            // Base bottom is 15px. Base height is 24px. Top of base is 39px.
            // Stack increments by 28px (slight 3D overlapping overlap)
            const finalBottom = 39 + index * 28;

            ringEl.classList.add('stacked');
            ringEl.style.pointerEvents = 'none'; // Disable pointer actions on stacked rings

            const rect = ringEl.getBoundingClientRect();
            const boardRect = board.getBoundingClientRect();
            const dropLeft = rect.left - boardRect.left;
            const dropBottom = boardRect.bottom - rect.bottom;

            board.appendChild(ringEl);

            ringEl.style.position = 'absolute';
            ringEl.style.left = `${dropLeft}px`;
            ringEl.style.bottom = `${dropBottom}px`;
            ringEl.style.top = '';
            ringEl.style.transform = 'none';
            ringEl.style.transition = 'none';

            // Force reflow
            ringEl.offsetHeight;

            // Dynamically generate cross-browser compatible drop-bounce keyframes
            const animName = `slide-down-bounce-${item.number}`;
            const animStyle = document.createElement('style');
            animStyle.className = 'temp-ring-animation';
            animStyle.innerHTML = `
                @keyframes ${animName} {
                    0% { bottom: 255px; }
                    70% { bottom: ${finalBottom}px; }
                    85% { bottom: ${finalBottom + 12}px; }
                    100% { bottom: ${finalBottom}px; }
                }
            `;
            document.head.appendChild(animStyle);

             if (item.isDuck) {
                 ringEl.style.width = '64px';
                 ringEl.style.height = '64px';
                 ringEl.style.filter = 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))';
             } else {
                 ringEl.style.width = `${stackedWidth}px`;
             }
            
            // Move horizontally instantly to the peg and trigger realistic drop physics
            ringEl.style.left = '50%';
            ringEl.style.transform = 'translateX(-50%)';
            ringEl.style.animation = `${animName} 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

            if (window.sound) {
                // Play pop sound at impact time (~0.4s)
                setTimeout(() => window.sound.playPop(), 350);
            }

            // Check if all items stacked successfully
            const totalTarget = rIdx === 4 ? 8 : maxRings;
            if (stackedRings.length === totalTarget) {
                score += 10;
                setTimeout(() => {
                    showRoundSuccess();
                }, 850);
            }
        }

        // Show round success modal
        function showRoundSuccess() {
            if (window.sound) window.sound.playSuccess();

            const isGameCompleted = rIdx === rounds.length - 1;

            successCard.innerHTML = `
                <h3>🎉 ${isGameCompleted ? 'ممتاز يا ذكي! 🏆' : 'أحسنت يا بطل! 🌟'}</h3>
                <p>${isGameCompleted ? 'لقد أكملت جميع مراحل برج الحلقات بنجاح!' : 'لقد قمت بتركيب برج الحلقات بنجاح!'}</p>
                <button class="menu-btn restart-btn" id="nextRoundBtn">
                    ${isGameCompleted ? 'العب مجدداً 🔄' : 'المرحلة التالية ➡️'}
                </button>
            `;

            overlay.classList.add('show');

            document.getElementById('nextRoundBtn').addEventListener('click', () => {
                overlay.classList.remove('show');
                if (isGameCompleted) {
                    rIdx = 0;
                    score = 0;
                } else {
                    rIdx++;
                }
                loadRound();
            });
        }

        loadRound();
    };
})();
