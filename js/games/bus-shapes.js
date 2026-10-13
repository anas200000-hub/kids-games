// لعبة تطابق أشكال الحافلة - Bus Shape Match
(function() {
    window.initBusShapesGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .bus-shapes-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
                background: linear-gradient(to bottom, #E0F7FA 0%, #E8F5E9 100%);
                padding: 12px;
                border-radius: 20px;
                overflow: hidden;
            }
            .bus-shapes-hud {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 340px;
                padding: 8px 16px;
                background: #FFF;
                border-radius: 14px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.06);
                box-sizing: border-box;
                margin-bottom: 12px;
                font-weight: bold;
                font-size: 15px;
                color: #FF5722;
            }
            .bus-scene-area {
                width: 100%;
                max-width: 440px;
                height: 280px;
                position: relative;
                background: linear-gradient(to bottom, #B3E5FC 0%, #E8F5E9 75%, #C8E6C9 100%);
                border-radius: 24px;
                border: 4px solid #FFF;
                box-shadow: 0 6px 15px rgba(0,0,0,0.08);
                overflow: hidden;
            }
            /* Clouds and city background */
            .bus-bg-cloud {
                position: absolute;
                background: #FFF;
                border-radius: 20px;
                opacity: 0.85;
            }
            .bus-bg-cloud::before, .bus-bg-cloud::after {
                content: '';
                position: absolute;
                background: #FFF;
                border-radius: 50%;
            }
            /* Road */
            .bus-road {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 60px;
                background: #B0BEC5;
                border-top: 6px solid #90A4AE;
            }
            .bus-road-line {
                position: absolute;
                top: 26px;
                left: 0;
                width: 100%;
                height: 6px;
                background: repeating-linear-gradient(90deg, #FFF, #FFF 20px, transparent 20px, transparent 40px);
            }
            /* Shapes Dock (top of scene) */
            .shapes-dock {
                position: absolute;
                top: 15px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 30px;
                z-index: 200;
            }
            .draggable-shape-wrapper {
                width: 54px;
                height: 54px;
                position: relative;
                cursor: grab;
                touch-action: none;
            }
            /* Bus styles */
            .bus-vehicle {
                position: absolute;
                bottom: 15px;
                left: 30px;
                width: 250px;
                height: 120px;
                background: #FFD54F; /* yellow bus */
                border-radius: 24px 40px 16px 16px;
                box-shadow: 0 6px 0 #F5B041, 0 8px 12px rgba(0,0,0,0.15);
                transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), left 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 100;
                border: 3px solid #F5B041;
            }
            .bus-vehicle.driving-away {
                left: -320px !important;
            }
            .bus-vehicle.driving-in {
                left: 440px !important;
            }
            /* Bus components */
            .bus-window-slot {
                position: absolute;
                width: 44px;
                height: 44px;
                background: #546E7A;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                border: 2px dashed rgba(255,255,255,0.7);
            }
            .bus-window-slot::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 6px;
                background: rgba(0,0,0,0.25);
            }
            .bus-window-slot.matched::after {
                background: transparent;
            }
            .bus-wheel {
                position: absolute;
                bottom: -15px;
                width: 44px;
                height: 44px;
                background: #37474F;
                border-radius: 50%;
                border: 4px solid #CFD8DC;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bus-wheel-rim {
                width: 18px;
                height: 18px;
                background: #78909C;
                border-radius: 50%;
                position: relative;
            }
            .bus-wheel-rim::before {
                content: '';
                position: absolute;
                top: 8px;
                left: 0;
                width: 18px;
                height: 2px;
                background: #ECEFF1;
            }
            .bus-wheel-rim::after {
                content: '';
                position: absolute;
                top: 0;
                left: 8px;
                width: 2px;
                height: 18px;
                background: #ECEFF1;
            }
            .bus-wheel.spin-anim {
                animation: spin-wheels 1.2s infinite linear;
            }
            @keyframes spin-wheels {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
            }
            /* Driver window & Cute Cat driver */
            .bus-driver-window {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 48px;
                height: 48px;
                background: #80DEEA;
                border-radius: 8px 20px 8px 8px;
                border: 3px solid #F5B041;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                overflow: hidden;
            }
            /* SVG Shapes Visuals */
            .shape-svg {
                width: 100%;
                height: 100%;
                filter: drop-shadow(0 3px 3px rgba(0,0,0,0.15));
            }
            .shape-silhouette {
                width: 100%;
                height: 100%;
                opacity: 0.45;
                fill: #FFF;
            }
            /* Overlay Win Card */
            .win-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                color: #FFF;
            }
            .win-card {
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
            .win-card h3 {
                color: #2E7D32;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .win-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Setup
        const layout = document.createElement('div');
        layout.className = 'bus-shapes-layout';
        container.appendChild(layout);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'تطابق أشكال الحافلة 🚌';
        title.style.cssText = 'color:#FF9800; margin-bottom:2px;';
        layout.appendChild(title);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'اسحب كل شكل هندسي ملون وضعه في النافذة المطابقة له على الحافلة الصفراء!';
        instr.style.cssText = 'margin-bottom:8px; width:100%; text-align:center;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'bus-shapes-hud';
        layout.appendChild(hud);

        const scoreSpan = document.createElement('span');
        scoreSpan.innerText = 'المستوى: 1 / 5';
        const attemptsSpan = document.createElement('span');
        attemptsSpan.innerText = 'الأشكال المطابقة: 0 / 3';
        hud.appendChild(scoreSpan);
        hud.appendChild(attemptsSpan);

        const scene = document.createElement('div');
        scene.className = 'bus-scene-area';
        layout.appendChild(scene);

        // Background Clouds
        for (let i = 0; i < 3; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'bus-bg-cloud';
            cloud.style.cssText = `
                width: ${60 + i*20}px; height: ${20 + i*5}px;
                top: ${25 + i*15}px; left: ${40 + i*120}px;
            `;
            scene.appendChild(cloud);
        }

        // Road
        const road = document.createElement('div');
        road.className = 'bus-road';
        const roadLine = document.createElement('div');
        roadLine.className = 'bus-road-line';
        road.appendChild(roadLine);
        scene.appendChild(road);

        // Shapes Dock
        const shapesDock = document.createElement('div');
        shapesDock.className = 'shapes-dock';
        scene.appendChild(shapesDock);

        // Bus Vehicle
        const bus = document.createElement('div');
        bus.className = 'bus-vehicle';
        scene.appendChild(bus);

        // Driver Window & Cat
        const driverWin = document.createElement('div');
        driverWin.className = 'bus-driver-window';
        driverWin.innerText = '🐱';
        bus.appendChild(driverWin);

        // Bus Wheels
        const wheelL = document.createElement('div');
        wheelL.className = 'bus-wheel';
        wheelL.style.left = '40px';
        const rimL = document.createElement('div');
        rimL.className = 'bus-wheel-rim';
        wheelL.appendChild(rimL);
        bus.appendChild(wheelL);

        const wheelR = document.createElement('div');
        wheelR.className = 'bus-wheel';
        wheelR.style.right = '40px';
        const rimR = document.createElement('div');
        rimR.className = 'bus-wheel-rim';
        wheelR.appendChild(rimR);
        bus.appendChild(wheelR);

        // Game Configuration
        let isGameRunning = true;
        let currentLevel = 1;
        let matchedCount = 0;

        // Shape Sets for different levels (Circle, Triangle, Square, Star, Heart, Pentagon, Moon, Diamond)
        const shapesData = {
            circle: {
                id: 'circle',
                color: '#4CAF50', // green
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><circle cx="50" cy="50" r="42" fill="#4CAF50" stroke="#FFF" stroke-width="6"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><circle cx="50" cy="50" r="42"/></svg>`
            },
            triangle: {
                id: 'triangle',
                color: '#2196F3', // blue
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,10 90,85 10,85" fill="#2196F3" stroke="#FFF" stroke-width="6" stroke-linejoin="round"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><polygon points="50,10 90,85 10,85"/></svg>`
            },
            square: {
                id: 'square',
                color: '#E91E63', // pink
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="12" y="12" width="76" height="76" rx="12" fill="#E91E63" stroke="#FFF" stroke-width="6"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><rect x="12" y="12" width="76" height="76" rx="12"/></svg>`
            },
            star: {
                id: 'star',
                color: '#FFEB3B', // yellow
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="#FFD54F" stroke="#FFF" stroke-width="5" stroke-linejoin="round"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"/></svg>`
            },
            heart: {
                id: 'heart',
                color: '#FF1744', // red
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><path d="M12,38 C12,18 38,10 50,28 C62,10 88,18 88,38 C88,64 50,90 50,90 C50,90 12,64 12,38 Z" fill="#FF1744" stroke="#FFF" stroke-width="5" stroke-linejoin="round"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><path d="M12,38 C12,18 38,10 50,28 C62,10 88,18 88,38 C88,64 50,90 50,90 C50,90 12,64 12,38 Z"/></svg>`
            },
            pentagon: {
                id: 'pentagon',
                color: '#9C27B0', // purple
                svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,10 92,42 76,90 24,90 8,42" fill="#9C27B0" stroke="#FFF" stroke-width="6" stroke-linejoin="round"/></svg>`,
                svgSil: `<svg viewBox="0 0 100 100" class="shape-silhouette"><polygon points="50,10 92,42 76,90 24,90 8,42"/></svg>`
            }
        };

        const levelsConfig = [
            ['circle', 'triangle', 'square'], // Level 1
            ['star', 'circle', 'heart'],    // Level 2
            ['pentagon', 'square', 'triangle'], // Level 3
            ['heart', 'star', 'pentagon'],   // Level 4
            ['circle', 'star', 'square']     // Level 5
        ];

        // Animals to pop inside slots when matched
        const kidsEmojis = ['🐶', '🐰', '🐼', '🦊', '🐨', '🐯', '🦁', '🐻'];

        // Track active shape objects and slots
        let activeShapes = [];
        let slotElements = [];

        function setupLevel() {
            // Clear old slots and dock
            slotElements.forEach(s => s.remove());
            slotElements = [];
            shapesDock.innerHTML = "";
            activeShapes = [];
            matchedCount = 0;

            attemptsSpan.innerText = 'الأشكال المطابقة: 0 / 3';
            scoreSpan.innerText = `المستوى: ${currentLevel} / 5`;

            // Spin wheels while driving in
            wheelL.classList.add('spin-anim');
            wheelR.classList.add('spin-anim');
            bus.classList.remove('driving-away');
            bus.classList.add('driving-in');

            // Trigger entrance delay animation
            setTimeout(() => {
                bus.classList.remove('driving-in');
                // Stop spinning wheels
                setTimeout(() => {
                    wheelL.classList.remove('spin-anim');
                    wheelR.classList.remove('spin-anim');
                }, 1200);
            }, 50);

            // Get level configs
            const levelShapesKeys = levelsConfig[currentLevel - 1];
            
            // 3 slots on the bus body
            const slotPositions = [
                { left: '20px', top: '55px' },
                { left: '80px', top: '55px' },
                { left: '140px', top: '55px' }
            ];

            // Create target slots
            levelShapesKeys.forEach((key, index) => {
                const shapeData = shapesData[key];
                
                const slot = document.createElement('div');
                slot.className = 'bus-window-slot';
                slot.style.left = slotPositions[index].left;
                slot.style.top = slotPositions[index].top;
                slot.innerHTML = shapeData.svgSil;
                
                bus.appendChild(slot);
                slotElements.push(slot);

                // Add data to shape object
                activeShapes.push({
                    id: shapeData.id,
                    key: key,
                    slotEl: slot,
                    matched: false,
                    targetX: 0, // set on runtime
                    targetY: 0
                });
            });

            // Shuffle keys for the dock so they aren't in same order as the slots
            const dockKeys = [...levelShapesKeys].sort(() => Math.random() - 0.5);

            // Populate the draggable blocks in the dock
            dockKeys.forEach((key) => {
                const shapeData = shapesData[key];

                const wrapper = document.createElement('div');
                wrapper.className = 'draggable-shape-wrapper';
                wrapper.innerHTML = shapeData.svg;
                wrapper.setAttribute('data-id', shapeData.id);

                shapesDock.appendChild(wrapper);

                // Initialize dragging helper
                makeDraggable(wrapper);
            });
        }

        // Draggable Handler using Pointer Events
        function makeDraggable(el) {
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

                // Lock element to absolute position relative to scene
                el.style.position = "absolute";
                
                // Track start client coordinates
                startX = e.clientX;
                startY = e.clientY;

                // Current absolute position
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
                el.style.zIndex = "200";

                el.releasePointerCapture(e.pointerId);

                // Check overlap
                const shapeId = el.getAttribute('data-id');
                const shapeObj = activeShapes.find(s => s.id === shapeId);
                
                if (shapeObj) {
                    const elRect = el.getBoundingClientRect();
                    const slotRect = shapeObj.slotEl.getBoundingClientRect();

                    const dist = Math.hypot(
                        (elRect.left + elRect.width/2) - (slotRect.left + slotRect.width/2),
                        (elRect.top + elRect.height/2) - (slotRect.top + slotRect.height/2)
                    );

                    // Overlap threshold (approx. 32px)
                    if (dist < 32) {
                        // Success matching!
                        if (window.sound) window.sound.playPop();

                        shapeObj.matched = true;
                        matchedCount++;
                        attemptsSpan.innerText = `الأشكال المطابقة: ${matchedCount} / 3`;

                        // Remove draggable block
                        el.remove();

                        // Fill the bus slot window with animal emoji and matched shape styling
                        shapeObj.slotEl.classList.add('matched');
                        shapeObj.slotEl.innerHTML = "";
                        
                        const animalSpan = document.createElement('div');
                        animalSpan.innerText = kidsEmojis[Math.floor(Math.random() * kidsEmojis.length)];
                        animalSpan.style.cssText = `
                            font-size: 26px; z-index: 5;
                            animation: pop-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        `;
                        shapeObj.slotEl.appendChild(animalSpan);

                        // Trigger keyframe pop animation
                        shapeObj.slotEl.style.backgroundColor = shapesData[shapeObj.key].color;

                        // Check Win
                        if (matchedCount === 3) {
                            triggerLevelComplete();
                        }
                        return;
                    }
                }

                // Snap back to dock if wrong / missed
                if (window.sound) window.sound.playFail();

                el.style.transition = "all 0.3s ease";
                el.style.left = "";
                el.style.top = "";
                el.style.position = "";
                setTimeout(() => el.style.transition = "", 300);
            };

            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerup', onPointerUp);
        }

        function triggerLevelComplete() {
            if (window.sound) window.sound.playSuccess();

            // Make bus drive away
            setTimeout(() => {
                // Spin wheels
                wheelL.classList.add('spin-anim');
                wheelR.classList.add('spin-anim');
                bus.classList.add('driving-away');
                
                // Load next level or total victory
                setTimeout(() => {
                    if (currentLevel < 5) {
                        currentLevel++;
                        setupLevel();
                    } else {
                        showVictoryScreen();
                    }
                }, 1300);
            }, 800);
        }

        function showVictoryScreen() {
            const winOverlay = document.createElement('div');
            winOverlay.className = 'win-overlay';
            scene.appendChild(winOverlay);

            const winCard = document.createElement('div');
            winCard.className = 'win-card bounce-anim';
            winCard.innerHTML = `
                <h3>🏆 بطل الأشكال السوبر! 🏆</h3>
                <p>لقد قمت بمطابقة كافة الأشكال الهندسية بنجاح وسافر الأصدقاء بالحافلة!</p>
                <button class="menu-btn restart-btn" id="busShapesResetBtn">العب مجدداً 🔄</button>
            `;
            winOverlay.appendChild(winCard);

            document.getElementById('busShapesResetBtn').onclick = () => {
                currentLevel = 1;
                winOverlay.remove();
                setupLevel();
            };
        }

        // Clean exit
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
        }, { once: true });

        // Start Level 1
        setupLevel();
    };
})();
