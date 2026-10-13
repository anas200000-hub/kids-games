// لعبة فرز الملابس - Laundry Color Sort
(function() {
    window.initLaundrySortGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .laundry-sort-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
                background: linear-gradient(to bottom, #E0F7FA 0%, #FFF9C4 100%);
                padding: 10px;
                border-radius: 20px;
                overflow: hidden;
            }
            .laundry-hud {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 360px;
                padding: 8px 16px;
                background: #FFF;
                border-radius: 14px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.06);
                box-sizing: border-box;
                margin-bottom: 8px;
                font-weight: bold;
                font-size: 15px;
                color: #2E7D32;
            }
            .laundry-scene {
                width: 100%;
                max-width: 440px;
                height: 420px; /* Fullscreen expanded height */
                position: relative;
                background: linear-gradient(to bottom, #80DEEA 0%, #E8F5E9 70%, #C8E6C9 100%);
                border-radius: 24px;
                border: 4px solid #FFF;
                box-shadow: 0 6px 15px rgba(0,0,0,0.08);
                overflow: hidden;
            }
            /* Clothesline */
            .laundry-line {
                position: absolute;
                top: 60px;
                left: 0;
                width: 100%;
                height: 5px;
                background: #FFF;
                box-shadow: 0 2px 2px rgba(0,0,0,0.1);
                z-index: 10;
            }
            /* Clothesline hanger pegs */
            .laundry-peg {
                position: absolute;
                top: 50px;
                width: 6px;
                height: 16px;
                background: #FFD54F;
                border-radius: 2px;
                border: 1px solid #F5B041;
                z-index: 12;
            }
            /* Draggable clothes wrapper - Enlarged */
            .draggable-cloth {
                position: absolute;
                width: 80px; /* Enlarged clothes */
                height: 80px;
                cursor: grab;
                touch-action: none;
                z-index: 50;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            /* Baskets container */
            .baskets-dock {
                position: absolute;
                bottom: 12px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: space-around;
                padding: 0 8px;
                box-sizing: border-box;
                z-index: 20;
            }
            /* Laundry Basket design - responsive width set dynamically */
            .laundry-basket {
                height: 76px;
                border-radius: 12px 12px 18px 18px;
                position: relative;
                box-shadow: inset 0 -6px 0 rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.15);
                border: 3px solid #FFF;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                transition: transform 0.2s ease;
            }
            /* Woven holes pattern inside basket */
            .basket-holes {
                width: 85%;
                height: 60%;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 3px;
                margin-top: 4px;
            }
            .basket-hole {
                background: rgba(255,255,255,0.4);
                border-radius: 4px;
                height: 9px;
            }
            /* Clothes SVGs */
            .cloth-svg {
                width: 100%;
                height: 100%;
                display: block;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.18));
            }
            /* Animation for dropping in basket */
            .cloth-drop-anim {
                animation: cloth-drop-suck 0.4s forwards cubic-bezier(0.55, 0.085, 0.68, 0.53);
            }
            @keyframes cloth-drop-suck {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.1) translateY(60px); opacity: 0; }
            }
            /* Overlay Win Card */
            .laundry-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.65);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                color: #FFF;
                border-radius: 20px;
            }
            .laundry-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #4CAF50;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .laundry-card h3 {
                color: #2E7D32;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .laundry-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Setup
        const layout = document.createElement('div');
        layout.className = 'laundry-sort-layout';
        container.appendChild(layout);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'فرز الملابس 🧺';
        title.style.cssText = 'color:#2E7D32; margin-bottom:2px;';
        layout.appendChild(title);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'اسحب كل قطة ملابس من حبل الغسيل وضعها في السلة المطابقة للونها!';
        instr.style.cssText = 'margin-bottom:8px; width:100%; text-align:center;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'laundry-hud';
        layout.appendChild(hud);

        const lvlSpan = document.createElement('span');
        lvlSpan.innerText = 'المرحلة: 1 / 5';
        const scoreSpan = document.createElement('span');
        scoreSpan.innerText = 'الملابس المفرزة: 0 / 3';
        hud.appendChild(lvlSpan);
        hud.appendChild(scoreSpan);

        const scene = document.createElement('div');
        scene.className = 'laundry-scene';
        layout.appendChild(scene);

        // Clothesline
        const line = document.createElement('div');
        line.className = 'laundry-line';
        scene.appendChild(line);

        // Baskets Container
        const basketsDock = document.createElement('div');
        basketsDock.className = 'baskets-dock';
        scene.appendChild(basketsDock);

        const overlay = document.createElement('div');
        overlay.className = 'laundry-overlay';
        overlay.style.display = 'none';
        scene.appendChild(overlay);

        const card = document.createElement('div');
        card.className = 'laundry-card bounce-anim';
        overlay.appendChild(card);

        // Colors configurations
        const colorConfig = {
            orange: { id: 'orange', name: 'برتقالي', hex: '#FF9800', border: '#E65100' },
            purple: { id: 'purple', name: 'بنفسجي', hex: '#9C27B0', border: '#4A148C' },
            green: { id: 'green', name: 'أخضر', hex: '#4CAF50', border: '#1B5E20' },
            red: { id: 'red', name: 'أحمر', hex: '#F44336', border: '#B71C1C' },
            blue: { id: 'blue', name: 'أزرق', hex: '#2196F3', border: '#0D47A1' },
            yellow: { id: 'yellow', name: 'أصفر', hex: '#FFEB3B', border: '#F57F17' }
        };

        const levelsConfig = [
            // Level 1: 3 baskets, 3 clothes
            { baskets: ['orange', 'purple', 'green'], clothes: ['orange', 'purple', 'green'] },
            // Level 2: 4 baskets, 4 clothes
            { baskets: ['red', 'blue', 'yellow', 'green'], clothes: ['red', 'blue', 'yellow', 'green'] },
            // Level 3: 5 baskets, 5 clothes
            { baskets: ['green', 'red', 'purple', 'blue', 'orange'], clothes: ['green', 'red', 'purple', 'blue', 'orange'] },
            // Level 4: 6 baskets, 6 clothes
            { baskets: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'], clothes: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'] },
            // Level 5: 6 baskets, 8 clothes (with duplicates!)
            { baskets: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'], clothes: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'red', 'blue'] }
        ];

        // Highly detailed SVG generators for clothes (Shirt, Sock, Pants)
        function getShirtSVG(color) {
            return `
            <svg viewBox="0 0 100 100" class="cloth-svg">
                <!-- Drop shadow -->
                <path d="M 25,20 L 75,20 L 92,34 L 82,50 L 72,42 L 72,88 L 28,88 L 28,42 L 18,50 L 8,34 Z" fill="rgba(0,0,0,0.1)" transform="translate(2, 3)" />
                <!-- Shirt Body -->
                <path d="M 25,20 L 75,20 L 92,34 L 82,50 L 72,42 L 72,88 H 28 V 42 L 18,50 L 8,34 Z" fill="${color}" stroke="#FFF" stroke-width="4.5" stroke-linejoin="round" />
                <!-- Neck collar highlight -->
                <path d="M 40,20 C 40,28 60,28 60,20" fill="none" stroke="#FFF" stroke-width="4" />
                <path d="M 40,20 C 40,28 60,28 60,20 Z" fill="#FFF" opacity="0.9" />
                <!-- Crease folds -->
                <path d="M 32,50 Q 50,55 68,50" fill="none" stroke="#000" stroke-width="2.5" opacity="0.12" />
                <path d="M 35,68 Q 50,73 65,68" fill="none" stroke="#000" stroke-width="2.5" opacity="0.12" />
                <!-- Glowing star print -->
                <circle cx="50" cy="42" r="10" fill="#FFF" opacity="0.3" />
                <polygon points="50,35 53,41 59,41 54,45 56,51 50,47 44,51 46,45 41,41 47,41" fill="#FFF" opacity="0.9" />
            </svg>`;
        }

        function getSockSVG(color) {
            return `
            <svg viewBox="0 0 100 100" class="cloth-svg">
                <!-- Drop shadow -->
                <path d="M 32,15 H 62 V 45 L 78,65 C 83,72 78,88 62,88 H 50 C 36,88 32,76 32,60 Z" fill="rgba(0,0,0,0.1)" transform="translate(2, 3)" />
                <!-- Sock body -->
                <path d="M 32,15 H 62 V 45 L 78,65 C 83,72 78,88 62,88 H 50 C 36,88 32,76 32,60 Z" fill="${color}" stroke="#FFF" stroke-width="4.5" stroke-linejoin="round" />
                <!-- Heel and toe patches -->
                <path d="M 62,88 C 55,88 50,83 50,76 C 50,69 55,64 62,64" fill="none" stroke="#FFF" stroke-width="3" opacity="0.4" />
                <!-- Toe -->
                <path d="M 68,68 C 74,74 74,80 68,84" fill="none" stroke="#FFF" stroke-width="3.5" opacity="0.4" />
                <!-- Double stripes -->
                <rect x="32" y="22" width="30" height="6" fill="#FFF" opacity="0.85" />
                <rect x="32" y="32" width="30" height="6" fill="#FFF" opacity="0.85" />
                <!-- Ribbed texture -->
                <line x1="38" y1="15" x2="38" y2="40" stroke="#000" stroke-width="2.5" opacity="0.08" />
                <line x1="44" y1="15" x2="44" y2="40" stroke="#000" stroke-width="2.5" opacity="0.08" />
                <line x1="50" y1="15" x2="50" y2="40" stroke="#000" stroke-width="2.5" opacity="0.08" />
                <line x1="56" y1="15" x2="56" y2="40" stroke="#000" stroke-width="2.5" opacity="0.08" />
            </svg>`;
        }

        function getPantsSVG(color) {
            return `
            <svg viewBox="0 0 100 100" class="cloth-svg">
                <!-- Drop shadow -->
                <path d="M 22,15 H 78 V 45 L 62,88 H 48 L 48,50 L 38,88 H 24 Z" fill="rgba(0,0,0,0.1)" transform="translate(2, 3)" />
                <!-- Pants body -->
                <path d="M 22,15 H 78 V 45 L 62,88 H 48 L 48,50 L 38,88 H 24 Z" fill="${color}" stroke="#FFF" stroke-width="4.5" stroke-linejoin="round" />
                <!-- Pocket stitchings -->
                <path d="M 24,30 Q 34,30 34,22" fill="none" stroke="#FFF" stroke-width="3" opacity="0.5" />
                <path d="M 76,30 Q 66,30 66,22" fill="none" stroke="#FFF" stroke-width="3" opacity="0.5" />
                <!-- Fly seam -->
                <line x1="50" y1="22" x2="50" y2="45" stroke="#FFF" stroke-width="2.5" stroke-dasharray="3,3" opacity="0.7" />
                <!-- Waistband -->
                <rect x="22" y="15" width="56" height="8" fill="#FFF" opacity="0.3" />
                <rect x="22" y="15" width="56" height="8" fill="none" stroke="#FFF" stroke-width="3.5" />
                <!-- Leg cuffs -->
                <rect x="24" y="82" width="14" height="6" fill="#FFF" opacity="0.3" />
                <rect x="48" y="82" width="14" height="6" fill="#FFF" opacity="0.3" />
            </svg>`;
        }

        // Active State
        let isGameRunning = true;
        let currentLevel = 1;
        let sortedCount = 0;
        let totalClothesToSort = 3;
        let activeClothes = [];
        let basketElements = [];

        function setupLevel() {
            // Reset old elements
            activeClothes.forEach(c => {
                c.element.remove();
                if (c.pegElement) c.pegElement.remove();
            });

            sortedCount = 0;
            activeClothes = [];
            basketElements.forEach(b => b.remove());
            basketElements = [];

            // Get configs for this level
            const config = levelsConfig[currentLevel - 1];
            const levelBaskets = config.baskets;
            const levelClothes = config.clothes;
            
            totalClothesToSort = levelClothes.length;
            scoreSpan.innerText = `الملابس المفرزة: 0 / ${totalClothesToSort}`;
            lvlSpan.innerText = `المرحلة: ${currentLevel} / 5`;

            // 1. Create Baskets with dynamic responsive width based on count (fits 3 to 6 baskets perfectly!)
            const numBaskets = levelBaskets.length;
            const sceneWidth = scene.clientWidth || 380;
            const basketWidth = Math.floor((sceneWidth - 16) / numBaskets) - 6;

            levelBaskets.forEach(colorId => {
                const colData = colorConfig[colorId];

                const basket = document.createElement('div');
                basket.className = 'laundry-basket';
                basket.style.backgroundColor = colData.hex;
                basket.style.borderColor = colData.border;
                basket.style.width = basketWidth + 'px';
                basket.setAttribute('data-color', colorId);

                // Grid of holes
                const holes = document.createElement('div');
                holes.className = 'basket-holes';
                for (let h = 0; h < 8; h++) {
                    const hole = document.createElement('div');
                    hole.className = 'basket-hole';
                    holes.appendChild(hole);
                }
                basket.appendChild(holes);
                
                basketsDock.appendChild(basket);
                basketElements.push(basket);
            });

            // 2. Create Clothes with dynamic horizontal percentages to fit any number (up to 8!) without overflow
            const numClothes = levelClothes.length;
            const clothesTypes = ['shirt', 'sock', 'pants'];

            // Shuffle clothes colors for random order
            const shuffledClothes = [...levelClothes].sort(() => Math.random() - 0.5);

            shuffledClothes.forEach((colorId, index) => {
                const colData = colorConfig[colorId];

                // Calculate percentage position
                const leftPercent = numClothes === 1 ? 42 : 5 + (index * 76) / (numClothes - 1);
                const pegOffset = Math.floor(basketWidth / 2) + 4; // center peg over clothes

                // Hanger Peg
                const peg = document.createElement('div');
                peg.className = 'laundry-peg';
                peg.style.left = `calc(${leftPercent}% + 37px)`;
                scene.appendChild(peg);

                // Cloth block
                const cloth = document.createElement('div');
                cloth.className = 'draggable-cloth';
                cloth.style.left = `${leftPercent}%`;
                cloth.style.top = '54px';
                cloth.setAttribute('data-color', colorId);

                // Select cloth design type sequentially
                const type = clothesTypes[index % clothesTypes.length];
                let svgContent = '';
                if (type === 'shirt') svgContent = getShirtSVG(colData.hex);
                else if (type === 'sock') svgContent = getSockSVG(colData.hex);
                else svgContent = getPantsSVG(colData.hex);

                cloth.innerHTML = svgContent;
                scene.appendChild(cloth);

                activeClothes.push({
                    element: cloth,
                    pegElement: peg,
                    color: colorId,
                    type: type,
                    popped: false
                });

                // Make draggable
                makeDraggable(cloth, peg);
            });
        }

        function makeDraggable(el, peg) {
            let startX = 0, startY = 0;
            let currentX = 0, currentY = 0;
            let isDragging = false;

            const onPointerDown = function(e) {
                if (!isGameRunning) return;
                isDragging = true;
                el.style.zIndex = "1000";
                el.style.cursor = "grabbing";

                const rect = el.getBoundingClientRect();
                const parentRect = scene.getBoundingClientRect();

                startX = e.clientX;
                startY = e.clientY;

                currentX = rect.left - parentRect.left;
                currentY = rect.top - parentRect.top;

                el.style.left = currentX + 'px';
                el.style.top = currentY + 'px';

                el.setPointerCapture(e.pointerId);
            };

            const onPointerMove = function(e) {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                el.style.left = (currentX + dx) + 'px';
                el.style.top = (currentY + dy) + 'px';
            };

            const onPointerUp = function(e) {
                if (!isDragging) return;
                isDragging = false;
                el.style.cursor = "grab";
                el.style.zIndex = "50";

                el.releasePointerCapture(e.pointerId);

                const elRect = el.getBoundingClientRect();
                const targetColor = el.getAttribute('data-color');

                // Center of cloth element
                const elCX = elRect.left + elRect.width / 2;
                const elCY = elRect.top + elRect.height / 2;

                let matchedBasket = null;

                basketElements.forEach(basket => {
                    const bRect = basket.getBoundingClientRect();
                    
                    // Match center of cloth inside basket bounding box with generous hit zone margins
                    const hitMarginX = 8;
                    const hitMarginY = 30; // generous vertical buffer
                    
                    const isInside = (
                        elCX >= bRect.left - hitMarginX && 
                        elCX <= bRect.right + hitMarginX && 
                        elCY >= bRect.top - hitMarginY && 
                        elCY <= bRect.bottom + hitMarginY
                    );

                    if (isInside) {
                        matchedBasket = basket;
                    }
                });

                if (matchedBasket) {
                    const basketColor = matchedBasket.getAttribute('data-color');
                    
                    if (basketColor === targetColor) {
                        // Correct sort
                        if (window.sound) window.sound.playPop();

                        sortedCount++;
                        scoreSpan.innerText = `الملابس المفرزة: ${sortedCount} / ${totalClothesToSort}`;

                        // Drop animation
                        el.classList.add('cloth-drop-anim');
                        if (peg) peg.remove();

                        // Mark as sorted
                        const idx = activeClothes.findIndex(c => c.element === el);
                        if (idx !== -1) {
                            activeClothes[idx].popped = true;
                        }

                        setTimeout(() => {
                            el.remove();
                        }, 400);

                        // Check Win Level
                        if (sortedCount === totalClothesToSort) {
                            setTimeout(triggerLevelComplete, 600);
                        }
                        return;
                    }
                }

                // Snap back on incorrect/missed
                if (window.sound) window.sound.playFail();

                el.style.transition = "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                el.style.left = "";
                el.style.top = "54px";
                setTimeout(() => el.style.transition = "", 350);
            };

            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerup', onPointerUp);
        }

        function triggerLevelComplete() {
            // Remove remaining pegs
            activeClothes.forEach(c => {
                if (c.pegElement) c.pegElement.remove();
            });

            if (window.sound) window.sound.playSuccess();

            if (currentLevel < 5) {
                currentLevel++;
                setupLevel();
            } else {
                showVictoryScreen();
            }
        }

        function showVictoryScreen() {
            card.innerHTML = `
                <h3>🧺 بطل الغسيل الخارق! 🏆</h3>
                <p>تهانينا! لقد فرزت كل الملابس بنجاح في السلال المناسبة!</p>
                <button class="menu-btn restart-btn" id="laundryResetBtn">العب مجدداً 🔄</button>
            `;
            overlay.style.display = 'flex';

            document.getElementById('laundryResetBtn').onclick = () => {
                currentLevel = 1;
                overlay.style.display = 'none';
                setupLevel();
            };
        }

        // Clean exit
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
        }, { once: true });

        // Start
        setupLevel();
    };
})();
