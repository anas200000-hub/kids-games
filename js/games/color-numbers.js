// تلوين بالأرقام - Color by Numbers Game
(function() {
    window.initColorNumbersGame = function(container) {
        container.innerHTML = "";

        // Child-friendly neon colors
        const palette = [
            { num: 1, color: '#FF1744', label: 'أحمر' },
            { num: 2, color: '#FF9100', label: 'برتقالي' },
            { num: 3, color: '#FFEA00', label: 'أصفر' },
            { num: 4, color: '#00E676', label: 'أخضر' },
            { num: 5, color: '#2979FF', label: 'أزرق' },
            { num: 6, color: '#D500F9', label: 'بنفسجي' },
            { num: 7, color: '#FF4081', label: 'وردي' },
            { num: 8, color: '#8D6E63', label: 'بني' }
        ];

        // 6 Custom drawings with exact label coordinates for 100% accuracy
        const drawings = [
            {
                name: 'المركب الشراعي ⛵',
                emoji: '⛵',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'sky', num: 5, d: 'M0,0 H200 V130 H0 Z', textX: 35, textY: 60, label: 'السماء' },
                    { id: 'sun', num: 3, cx: 160, cy: 36, r: 20, type: 'circle', textX: 160, textY: 40, label: 'الشمس' },
                    { id: 'cloud', num: 0, cx: 40, cy: 30, r: 15, type: 'circle', textX: 40, textY: 34, label: 'السحابة' },
                    { id: 'sea', num: 5, d: 'M0,130 H200 V200 H0 Z', textX: 100, textY: 182, label: 'البحر' },
                    { id: 'boat', num: 8, d: 'M30,130 L170,130 L150,165 H50 Z', textX: 100, textY: 148, label: 'القارب' },
                    { id: 'sailL', num: 1, d: 'M40,120 L95,120 L95,45 Z', textX: 76, textY: 100, label: 'الشراع الأيسر' },
                    { id: 'sailR', num: 2, d: 'M105,120 L160,120 L105,55 Z', textX: 124, textY: 100, label: 'الشراع الأيمن' },
                    { id: 'mast', num: 8, d: 'M92,45 H108 V120 H92 Z', textX: 100, textY: 82, label: 'الصاري' }
                ]
            },
            {
                name: 'بيت السعادة 🏡',
                emoji: '🏡',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'sky2', num: 5, d: 'M0,0 H200 V130 H0 Z', textX: 30, textY: 40, label: 'السماء' },
                    { id: 'lawn', num: 4, d: 'M0,130 H200 V200 H0 Z', textX: 100, textY: 175, label: 'العشب' },
                    { id: 'wall', num: 3, d: 'M40,90 H160 V150 H40 Z', textX: 100, textY: 102, label: 'الجدران' },
                    { id: 'roof', num: 1, d: 'M30,90 L100,30 L170,90 Z', textX: 100, textY: 68, label: 'السقف' },
                    { id: 'door', num: 6, d: 'M85,110 H115 V150 H85 Z', textX: 100, textY: 130, label: 'الباب' },
                    { id: 'winL', num: 2, d: 'M55,105 H75 V125 H55 Z', textX: 65, textY: 118, label: 'النافذة اليسرى' },
                    { id: 'winR', num: 2, d: 'M125,105 H145 V125 H125 Z', textX: 135, textY: 118, label: 'النافذة اليمنى' },
                    { id: 'sun2', num: 2, cx: 165, cy: 35, r: 18, type: 'circle', textX: 165, textY: 39, label: 'الشمس' }
                ]
            },
            {
                name: 'الدبدوب اللطيف 🧸',
                emoji: '🧸',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'bg', num: 7, d: 'M0,0 H200 V200 H0 Z', textX: 25, textY: 30, label: 'الخلفية' },
                    { id: 'earLO', num: 8, cx: 50, cy: 50, r: 24, type: 'circle', textX: 40, textY: 42, label: 'الأذن اليسرى' },
                    { id: 'earRO', num: 8, cx: 150, cy: 50, r: 24, type: 'circle', textX: 160, textY: 42, label: 'الأذن اليمنى' },
                    { id: 'earLI', num: 7, cx: 50, cy: 50, r: 12, type: 'circle', textX: 50, textY: 52, label: 'الأذن اليسرى الداخلية' },
                    { id: 'earRI', num: 7, cx: 150, cy: 50, r: 12, type: 'circle', textX: 150, textY: 52, label: 'الأذن اليمنى الداخلية' },
                    { id: 'face', num: 8, cx: 100, cy: 110, r: 54, type: 'circle', textX: 100, textY: 80, label: 'الوجه' },
                    { id: 'muzzle', num: 3, cx: 100, cy: 122, r: 18, type: 'circle', textX: 100, textY: 126, label: 'الفم' },
                    { id: 'nose', num: 8, cx: 100, cy: 112, r: 7, type: 'circle', textX: 100, textY: 113, label: 'الأنف' }
                ]
            },
            {
                name: 'السمكة المرحة 🐟',
                emoji: '🐟',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'seabg', num: 5, d: 'M0,0 H200 V200 H0 Z', textX: 165, textY: 45, label: 'البحر' },
                    { id: 'fishBody', num: 2, d: 'M50,100 C70,60 130,60 150,100 C130,140 70,140 50,100 Z', textX: 100, textY: 104, label: 'جسم السمكة' },
                    { id: 'tail', num: 7, d: 'M50,100 L15,70 V130 Z', textX: 30, textY: 100, label: 'الذيل' },
                    { id: 'finT', num: 3, d: 'M90,72 Q110,45 130,72 Z', textX: 110, textY: 66, label: 'الزعنفة العلوية' },
                    { id: 'finB', num: 3, d: 'M90,128 Q110,155 130,128 Z', textX: 110, textY: 136, label: 'الزعنفة السفلية' },
                    // Bubbles placed on top-left to avoid seaweed overlap
                    { id: 'bubL', num: 5, cx: 35, cy: 40, r: 10, type: 'circle', textX: 35, textY: 44, label: 'فقاعة كبيرة' },
                    { id: 'bubS', num: 5, cx: 60, cy: 28, r: 8, type: 'circle', textX: 60, textY: 32, label: 'فقاعة صغيرة' },
                    { id: 'weed', num: 4, d: 'M170,200 Q160,160 175,120 T170,80 H185 T180,120 Q190,160 185,200 Z', textX: 178, textY: 145, label: 'العشب البحري' }
                ]
            },
            {
                name: 'صاروخ الفضاء 🚀',
                emoji: '🚀',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'space', num: 6, d: 'M0,0 H200 V200 H0 Z', textX: 25, textY: 25, label: 'الفضاء' },
                    { id: 'rocket', num: 7, d: 'M75,150 V90 C75,50 125,50 125,90 V150 Z', textX: 100, textY: 136, label: 'الصاروخ' },
                    { id: 'nose', num: 1, d: 'M75,90 C75,50 125,50 125,90 Z', textX: 100, textY: 72, label: 'رأس الصاروخ' },
                    { id: 'wingL', num: 2, d: 'M75,120 L50,150 H75 Z', textX: 68, textY: 140, label: 'الجناح الأيسر' },
                    { id: 'wingR', num: 2, d: 'M125,120 L150,150 H125 Z', textX: 132, textY: 140, label: 'الجناح الأيمن' },
                    { id: 'window', num: 5, cx: 100, cy: 115, r: 14, type: 'circle', textX: 100, textY: 119, label: 'النافذة' },
                    { id: 'fire', num: 3, d: 'M85,150 L100,185 L115,150 Z', textX: 100, textY: 168, label: 'اللهب' },
                    { id: 'star', num: 3, d: 'M30,70 L34,60 L38,70 L48,70 L40,76 L43,86 L34,80 L25,86 L28,76 Z', textX: 34, textY: 74, label: 'النجمة' }
                ]
            },
            {
                name: 'أيس كريم لذيذ 🍦',
                emoji: '🍦',
                viewBox: '0 0 200 200',
                regions: [
                    { id: 'bg3', num: 5, d: 'M0,0 H200 V200 H0 Z', textX: 20, textY: 20, label: 'الخلفية' },
                    { id: 'cone', num: 8, d: 'M60,110 L100,190 L140,110 Z', textX: 100, textY: 142, label: 'البسكويت' },
                    { id: 'scoop1', num: 4, d: 'M50,110 C50,85 150,85 150,110 Z', textX: 100, textY: 102, label: 'الفراولة' },
                    { id: 'scoop2', num: 7, d: 'M60,90 C60,65 140,65 140,90 Z', textX: 100, textY: 80, label: 'الفانيليا' },
                    { id: 'scoop3', num: 3, d: 'M70,70 C70,48 130,48 130,70 Z', textX: 100, textY: 60, label: 'الليمون' },
                    { id: 'cherry', num: 1, cx: 100, cy: 40, r: 12, type: 'circle', textX: 100, textY: 44, label: 'الكرز' }
                ]
            }
        ];

        let drawIdx = 0;
        let filledMap = {};
        let totalRegions = 0;
        let filledCount = 0;
        let selectedNum = 1;
        let isCompleted = false;

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .color-numbers-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
            }
            .color-selector-row {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                width: 100%;
                max-width: 360px;
                justify-content: center;
                padding: 4px;
                box-sizing: border-box;
            }
            .draw-btn {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: 3px solid #E65100;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                background: #FFF;
                flex-shrink: 0;
            }
            .draw-btn.active {
                background: #E65100;
                transform: scale(1.1);
            }
            .current-draw-title {
                font-weight: 900;
                font-size: 16px;
                color: #E65100;
                margin-bottom: 8px;
                text-align: center;
            }
            .color-svg-container {
                background: #FFF;
                border-radius: 24px;
                padding: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                margin-bottom: 12px;
                width: 100%;
                max-width: 340px;
                box-sizing: border-box;
                border: 4px solid #FFE0B2;
            }
            .color-palette {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
                max-width: 340px;
                margin-bottom: 12px;
            }
            .palette-dot {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), border 0.15s ease;
                position: relative;
                box-shadow: 0 4px 8px rgba(0,0,0,0.18);
                border: 3px solid transparent;
            }
            .palette-dot.active {
                border: 3px solid #000;
                transform: scale(1.15);
            }
            .palette-dot.completed {
                opacity: 0.5;
                transform: scale(0.9);
                border: 3px solid transparent !important;
            }
            .palette-dot span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 15px;
                font-weight: 900;
                color: #FFF;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
            }
            .color-progress {
                font-size: 15px;
                font-weight: bold;
                color: #5D4037;
                margin-top: 4px;
            }
            .color-win-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                /* Lighter semi-transparent background with backdrop blur so the drawing is clearly visible behind */
                background: rgba(0,0,0,0.35);
                backdrop-filter: blur(3px);
                -webkit-backdrop-filter: blur(3px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                color: #FFF;
                border-radius: 20px;
            }
            .color-win-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #E65100;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .color-win-card h3 {
                color: #E65100;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .color-win-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
            svg path, svg circle {
                transition: fill 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.2), stroke 0.25s ease;
            }
            @keyframes shake-region {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Creation
        const layout = document.createElement('div');
        layout.className = 'color-numbers-layout';
        container.appendChild(layout);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'لون بالأرقام 🖍️';
        title.style.cssText = 'color:#E65100; margin-bottom:8px;';
        layout.appendChild(title);

        // Drawing selector rows
        const selectorRow = document.createElement('div');
        selectorRow.className = 'color-selector-row';
        layout.appendChild(selectorRow);

        // Subtitle display for the current selected drawing
        const subtitle = document.createElement('div');
        subtitle.className = 'current-draw-title';
        layout.appendChild(subtitle);

        function rebuildSelector() {
            selectorRow.innerHTML = "";
            drawings.forEach((d, i) => {
                const btn = document.createElement('button');
                btn.className = `draw-btn ${i === drawIdx ? 'active' : ''}`;
                btn.innerText = d.emoji; // ONLY Emoji
                btn.title = d.name;
                
                btn.addEventListener('click', () => {
                    if (isCompleted) return; // ignore during congrats delay
                    drawIdx = i;
                    filledMap = {};
                    filledCount = 0;
                    
                    const firstNum = d.regions.find(r => r.num > 0);
                    selectedNum = firstNum ? firstNum.num : 1;

                    rebuildSelector();
                    renderDrawing();
                });
                selectorRow.appendChild(btn);
            });
        }

        // SVG Drawing Canvas Area Stretched
        const svgContainer = document.createElement('div');
        svgContainer.className = 'color-svg-container';
        layout.appendChild(svgContainer);

        // Color Palette
        const paletteEl = document.createElement('div');
        paletteEl.className = 'color-palette';
        layout.appendChild(paletteEl);

        // Progress Text
        const progressEl = document.createElement('div');
        progressEl.className = 'color-progress';
        layout.appendChild(progressEl);

        const winOverlay = document.createElement('div');
        winOverlay.className = 'color-win-overlay';
        winOverlay.style.display = 'none';
        layout.appendChild(winOverlay);

        const winCard = document.createElement('div');
        winCard.className = 'color-win-card bounce-anim';
        winOverlay.appendChild(winCard);

        function getColor(num) {
            if (num === 0) return '#FFFFFF'; 
            const match = palette.find(p => p.num === num);
            return match ? match.color : '#E0E0E0';
        }

        function isColorCompleted(num) {
            const draw = drawings[drawIdx];
            const targetRegions = draw.regions.filter(r => r.num === num);
            if (targetRegions.length === 0) return true;
            return targetRegions.every(r => filledMap[r.id] === num);
        }

        function autoSelectNextColor() {
            const draw = drawings[drawIdx];
            if (isColorCompleted(selectedNum)) {
                const requiredNumbers = Array.from(new Set(draw.regions.filter(r => r.num > 0).map(r => r.num)));
                const nextUncompleted = requiredNumbers.find(num => !isColorCompleted(num));
                if (nextUncompleted) {
                    selectedNum = nextUncompleted;
                }
            }
        }

        function renderDrawing() {
            const draw = drawings[drawIdx];
            totalRegions = draw.regions.filter(r => r.num > 0).length;

            subtitle.innerText = `اللوحة: ${draw.name}`;

            // Rebuild Palette view
            paletteEl.innerHTML = "";
            palette.forEach(p => {
                const hasRegions = draw.regions.some(r => r.num === p.num);
                const completed = hasRegions && isColorCompleted(p.num);

                const dot = document.createElement('div');
                dot.id = `pal_dot_${p.num}`;
                
                if (completed) {
                    dot.className = 'palette-dot completed';
                } else {
                    dot.className = `palette-dot ${p.num === selectedNum ? 'active' : ''}`;
                }
                dot.style.backgroundColor = p.color;

                const label = document.createElement('span');
                label.innerText = completed ? '✔️' : p.num;
                dot.appendChild(label);

                if (!completed) {
                    dot.addEventListener('click', () => {
                        if (isCompleted) return;
                        selectedNum = p.num;
                        document.querySelectorAll('.palette-dot').forEach(d => d.classList.remove('active'));
                        dot.classList.add('active');
                    });
                }
                paletteEl.appendChild(dot);
            });

            // Build SVG
            let svgContent = `<svg viewBox="${draw.viewBox}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; border-radius:18px;">`;

            draw.regions.forEach(region => {
                const filled = filledMap[region.id];
                const fillColor = filled ? getColor(filled) : '#F5F5F5';
                
                const strokeColor = filled ? 'rgba(0,0,0,0.15)' : '#757575';
                const strokeWidth = filled ? '1.5' : '2.5';
                
                // If game is fully completed, hide all numbers entirely for a clean masterpiece view
                const textColor = (filled || isCompleted) ? 'transparent' : '#212121';
                
                let elementHTML = '';

                if (region.type === 'circle') {
                    elementHTML = `<circle id="region_${region.id}" cx="${region.cx}" cy="${region.cy}" r="${region.r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" style="cursor:pointer;"/>`;
                    
                    if (!filled && region.num > 0 && !isCompleted) {
                        elementHTML += `<text x="${region.textX}" y="${region.textY}" text-anchor="middle" font-size="12" font-weight="900" fill="${textColor}" style="pointer-events:none">${region.num}</text>`;
                    }
                } else {
                    elementHTML = `<path id="region_${region.id}" d="${region.d}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" style="cursor:pointer;"/>`;
                    
                    if (!filled && region.num > 0 && !isCompleted) {
                        elementHTML += `<text x="${region.textX}" y="${region.textY}" text-anchor="middle" font-size="12" font-weight="900" fill="${textColor}" style="pointer-events:none">${region.num}</text>`;
                    }
                }

                svgContent += elementHTML;
            });

            svgContent += '</svg>';
            svgContainer.innerHTML = svgContent;

            // Attach interactive listeners
            draw.regions.forEach(region => {
                const el = svgContainer.querySelector(`#region_${region.id}`);
                if (el) {
                    const handleTap = function(e) {
                        e.preventDefault();
                        if (isCompleted) return; // guard clicks during delay

                        if (region.num === 0) {
                            filledMap[region.id] = 0;
                            renderDrawing();
                            return;
                        }

                        if (selectedNum === region.num) {
                            if (!filledMap[region.id]) {
                                filledCount++;
                            }
                            filledMap[region.id] = selectedNum;
                            if (window.sound) window.sound.playClick();
                            
                            autoSelectNextColor();
                            renderDrawing();

                            if (filledCount >= totalRegions) {
                                // 1. Set isCompleted = true to hide all remaining numbers and lock canvas
                                isCompleted = true;
                                renderDrawing(); // Redraw immediately to clean all numbers!

                                // 2. Delay showWin by 2.2 seconds so the child enjoys seeing their clean colored painting first
                                setTimeout(showWin, 2200);
                            }
                        } else {
                            if (window.sound) window.sound.playFail();
                            el.style.transformOrigin = 'center';
                            el.style.animation = 'shake-region 0.3s ease';
                            setTimeout(() => el.style.animation = '', 300);
                        }
                    };

                    el.addEventListener('mousedown', handleTap);
                    el.addEventListener('touchstart', handleTap);
                }
            });

            progressEl.innerText = `الملوّن: ${filledCount} / ${totalRegions} منطقة`;
        }

        function showWin() {
            if (window.sound) window.sound.playSuccess();

            winCard.innerHTML = `
                <div style="font-size:56px">🎨</div>
                <h3>لوحة رائعة ومكتملة! 🏆</h3>
                <p>أنت فنان حقيقي وموهوب جداً!</p>
                <button class="menu-btn restart-btn" id="colorRetryBtn">لوّن لوحة أخرى 🔄</button>
            `;
            winOverlay.style.display = 'flex';

            document.getElementById('colorRetryBtn').onclick = () => {
                winOverlay.style.display = 'none';
                isCompleted = false; // Reset completed flag
                drawIdx = (drawIdx + 1) % drawings.length;
                filledMap = {};
                filledCount = 0;
                
                const nextDraw = drawings[drawIdx];
                const firstNum = nextDraw.regions.find(r => r.num > 0);
                selectedNum = firstNum ? firstNum.num : 1;

                rebuildSelector();
                renderDrawing();
            };
        }

        // Clean exit
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
        }, { once: true });

        // Start
        rebuildSelector();
        renderDrawing();
    };
})();
