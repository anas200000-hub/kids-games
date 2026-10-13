// Game 22: Build the House Puzzle (لغز بناء البيت الحقيقي)
window.initTangramPuzzleGame = function (container) {

    // Board is 290x240px. All SVG coordinates map 1:1 to board pixels.
    // boardSVG draws within the 290x240 full-board overlay.
    const pieces = [
        {
            id: 'wall',
            name: 'الجدران',
            paletteViewBox: '0 0 80 56',
            paletteSVG: `<rect x="2" y="2" width="76" height="52" rx="3" fill="#F5E6C8" stroke="#c9b48a" stroke-width="3"/>
                         <rect x="8" y="8" width="26" height="18" rx="2" fill="#ede0c0" stroke="#c9b48a" stroke-width="1.5"/>
                         <rect x="46" y="8" width="26" height="18" rx="2" fill="#ede0c0" stroke="#c9b48a" stroke-width="1.5"/>`,
            boardSVG: `<rect x="14" y="118" width="262" height="118" fill="#F5E6C8" stroke="#c9b48a" stroke-width="3"/>`,
            boardZ: 3,
            // drop zone pixels
            dTop: 115, dLeft: 10, dW: 270, dH: 125
        },
        {
            id: 'roof',
            name: 'السقف',
            paletteViewBox: '0 0 90 60',
            paletteSVG: `<polygon points="45,2 88,58 2,58" fill="#C4614A" stroke="#7D3620" stroke-width="3" stroke-linejoin="round"/>
                         <rect x="10" y="16" width="12" height="2" rx="1" fill="white" opacity="0.35"/>`,
            boardSVG: `<polygon points="145,4 289,126 1,126" fill="#C4614A" stroke="#7D3620" stroke-width="4" stroke-linejoin="round"/>
                       <rect x="30" y="60" width="28" height="5" rx="2" fill="white" opacity="0.25"/>`,
            boardZ: 5,
            dTop: 0, dLeft: 0, dW: 290, dH: 130
        },
        {
            id: 'chimney',
            name: 'المدخنة',
            paletteViewBox: '0 0 44 62',
            paletteSVG: `<rect x="2" y="2" width="40" height="58" rx="5" fill="#8B3E28" stroke="#5C2914" stroke-width="3"/>
                         <rect x="8" y="8" width="14" height="6" rx="1" fill="#a85040" opacity="0.5"/>`,
            boardSVG: `<rect x="233" y="18" width="34" height="58" rx="5" fill="#8B3E28" stroke="#5C2914" stroke-width="3"/>`,
            boardZ: 6,
            dTop: 14, dLeft: 228, dW: 44, dH: 65
        },
        {
            id: 'door',
            name: 'الباب',
            paletteViewBox: '0 0 52 62',
            paletteSVG: `<rect x="2" y="2" width="48" height="58" rx="7" fill="#8B5E3C" stroke="#5C3A1E" stroke-width="3"/>
                         <circle cx="41" cy="31" r="4.5" fill="#D4A056"/>
                         <line x1="26" y1="7" x2="26" y2="56" stroke="#5C3A1E" stroke-width="1.5" opacity="0.25"/>`,
            boardSVG: `<rect x="107" y="158" width="76" height="78" rx="7" fill="#8B5E3C" stroke="#5C3A1E" stroke-width="3"/>
                       <circle cx="173" cy="197" r="5" fill="#D4A056"/>
                       <line x1="145" y1="163" x2="145" y2="232" stroke="#5C3A1E" stroke-width="2" opacity="0.2"/>`,
            boardZ: 4,
            dTop: 154, dLeft: 103, dW: 84, dH: 84
        },
        {
            id: 'window-left',
            name: 'النافذة اليسرى',
            paletteViewBox: '0 0 62 60',
            paletteSVG: `<rect x="2" y="2" width="58" height="56" rx="4" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                         <line x1="31" y1="2" x2="31" y2="58" stroke="#3A7BD5" stroke-width="2.5"/>
                         <line x1="2" y1="30" x2="60" y2="30" stroke="#3A7BD5" stroke-width="2.5"/>
                         <rect x="4" y="4" width="24" height="23" rx="2" fill="white" opacity="0.35"/>`,
            boardSVG: `<rect x="24" y="155" width="72" height="58" rx="4" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                       <line x1="60" y1="155" x2="60" y2="213" stroke="#3A7BD5" stroke-width="2.5"/>
                       <line x1="24" y1="184" x2="96" y2="184" stroke="#3A7BD5" stroke-width="2.5"/>
                       <rect x="27" y="158" width="30" height="24" rx="2" fill="white" opacity="0.35"/>`,
            boardZ: 4,
            dTop: 151, dLeft: 20, dW: 80, dH: 66
        },
        {
            id: 'window-right',
            name: 'النافذة اليمنى',
            paletteViewBox: '0 0 62 60',
            paletteSVG: `<rect x="2" y="2" width="58" height="56" rx="4" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                         <line x1="31" y1="2" x2="31" y2="58" stroke="#3A7BD5" stroke-width="2.5"/>
                         <line x1="2" y1="30" x2="60" y2="30" stroke="#3A7BD5" stroke-width="2.5"/>
                         <rect x="4" y="4" width="24" height="23" rx="2" fill="white" opacity="0.35"/>`,
            boardSVG: `<rect x="194" y="155" width="72" height="58" rx="4" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                       <line x1="230" y1="155" x2="230" y2="213" stroke="#3A7BD5" stroke-width="2.5"/>
                       <line x1="194" y1="184" x2="266" y2="184" stroke="#3A7BD5" stroke-width="2.5"/>
                       <rect x="197" y="158" width="30" height="24" rx="2" fill="white" opacity="0.35"/>`,
            boardZ: 4,
            dTop: 151, dLeft: 190, dW: 80, dH: 66
        },
        {
            id: 'window-round',
            name: 'النافذة الدائرية',
            paletteViewBox: '0 0 62 62',
            paletteSVG: `<circle cx="31" cy="31" r="28" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                         <line x1="31" y1="3" x2="31" y2="59" stroke="#3A7BD5" stroke-width="2.5"/>
                         <line x1="3" y1="31" x2="59" y2="31" stroke="#3A7BD5" stroke-width="2.5"/>
                         <circle cx="16" cy="16" r="5" fill="white" opacity="0.3"/>`,
            boardSVG: `<circle cx="145" cy="108" r="38" fill="#87CEEB" stroke="#3A7BD5" stroke-width="3"/>
                       <line x1="145" y1="70" x2="145" y2="146" stroke="#3A7BD5" stroke-width="2.5"/>
                       <line x1="107" y1="108" x2="183" y2="108" stroke="#3A7BD5" stroke-width="2.5"/>
                       <circle cx="122" cy="87" r="7" fill="white" opacity="0.3"/>`,
            boardZ: 4,
            dTop: 68, dLeft: 105, dW: 80, dH: 80
        }
    ];

    container.innerHTML = `
        <div class="game-tangram-layout">
            <h2 class="game-title">🏠 لغز بناء البيت 🏠</h2>
            <p class="game-instructions">اسحب قطع البيت وضعها في مكانها الصحيح على الهيكل!</p>

            <div class="house-puzzle-stage">
                <div class="house-board" id="houseBoard">
                    <!-- Background outline (dashed guide) -->
                    <svg class="house-outline-svg" viewBox="0 0 290 240" xmlns="http://www.w3.org/2000/svg">
                        <!-- Chimney outline -->
                        <rect x="233" y="18" width="34" height="58" rx="5" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Roof outline -->
                        <polygon points="145,4 289,126 1,126" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Wall outline -->
                        <rect x="14" y="118" width="262" height="118" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Door outline -->
                        <rect x="107" y="158" width="76" height="78" rx="7" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Left window outline -->
                        <rect x="24" y="155" width="72" height="58" rx="4" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Right window outline -->
                        <rect x="194" y="155" width="72" height="58" rx="4" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <!-- Round window outline -->
                        <circle cx="145" cy="108" r="38" fill="rgba(200,200,200,0.18)" stroke="#ccc" stroke-width="2.5" stroke-dasharray="6,4"/>
                    </svg>

                    <!-- Full-board SVG overlay where placed pieces appear -->
                    <svg class="house-placed-svg" id="housePlacedSVG" viewBox="0 0 290 240"
                         xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;"></svg>

                    <!-- Drop zones (invisible hit targets) -->
                    ${pieces.map(p => `<div class="house-drop-zone" data-id="${p.id}"
                        style="top:${p.dTop}px;left:${p.dLeft}px;width:${p.dW}px;height:${p.dH}px;" title="${p.name}"></div>`).join('')}
                </div>

                <div class="house-palette" id="housePalette"></div>
            </div>

            <div id="houseSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 يا لك من مهندس بارع! 🎉</h3>
                    <p>لقد بنيت البيت الجميل بشكل مثالي! بيتكم جميل جداً!</p>
                    <button class="menu-btn restart-btn" id="restartHouse">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    const boardEl = document.getElementById('houseBoard');
    const paletteEl = document.getElementById('housePalette');
    const placedSVG = document.getElementById('housePlacedSVG');
    let matchedCount = 0;

    function initGame() {
        matchedCount = 0;
        placedSVG.innerHTML = '';
        document.getElementById('houseSuccessModal').classList.remove('show');
        paletteEl.innerHTML = '';

        // Shuffle pieces
        const shuffled = [...pieces].sort(() => Math.random() - 0.5);

        shuffled.forEach(p => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('house-piece-wrapper');
            wrapper.setAttribute('data-id', p.id);
            wrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="${p.paletteViewBox}" class="house-piece-svg">${p.paletteSVG}</svg>
                <div class="house-piece-label">${p.name}</div>
            `;
            paletteEl.appendChild(wrapper);
            setupPieceDrag(wrapper, p);
        });
    }

    function setupPieceDrag(wrapper, pieceData) {
        let startX, startY, origLeft, origTop, isDragging = false;
        let clone = null;

        wrapper.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            this.setPointerCapture(e.pointerId);
            isDragging = true;
            if (window.sound) window.sound.playClick();

            const rect = this.getBoundingClientRect();
            clone = document.createElement('div');
            clone.classList.add('house-drag-clone');
            clone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pieceData.paletteViewBox}" style="width:80px;height:70px;">${pieceData.paletteSVG}</svg>`;
            document.body.appendChild(clone);

            origLeft = rect.left + rect.width / 2 - 40;
            origTop  = rect.top  + rect.height / 2 - 35;
            clone.style.left = origLeft + 'px';
            clone.style.top  = origTop  + 'px';

            startX = e.clientX;
            startY = e.clientY;
            this.style.opacity = '0.35';
        });

        wrapper.addEventListener('pointermove', function (e) {
            if (!isDragging || !clone) return;
            e.preventDefault();
            clone.style.left = (origLeft + (e.clientX - startX)) + 'px';
            clone.style.top  = (origTop  + (e.clientY - startY)) + 'px';
        });

        wrapper.addEventListener('pointerup', function (e) {
            if (!isDragging || !clone) return;
            isDragging = false;
            this.style.opacity = '1';

            const cRect = clone.getBoundingClientRect();
            const cCX = cRect.left + cRect.width / 2;
            const cCY = cRect.top  + cRect.height / 2;
            clone.remove();
            clone = null;

            const dropZone = boardEl.querySelector(`.house-drop-zone[data-id="${pieceData.id}"]`);
            if (!dropZone) return;

            const dRect = dropZone.getBoundingClientRect();
            const hit = cCX >= dRect.left && cCX <= dRect.right &&
                        cCY >= dRect.top  && cCY <= dRect.bottom;

            if (hit) {
                if (window.sound) window.sound.playBubble();

                // Inject piece into the shared board SVG overlay at correct z-order
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('data-id', pieceData.id);
                g.setAttribute('data-z', pieceData.boardZ);
                g.innerHTML = pieceData.boardSVG;

                // Insert at correct z-order position
                insertSVGGroupByZ(g, pieceData.boardZ);

                // Animate (quick scale pulse via class trick)
                g.style.transformOrigin = 'center';
                g.style.animation = 'none';

                this.remove();
                matchedCount++;

                if (matchedCount === pieces.length) {
                    setTimeout(() => {
                        if (window.sound) window.sound.playSuccess();
                        document.getElementById('houseSuccessModal').classList.add('show');
                    }, 600);
                }
            } else {
                if (window.sound) window.sound.playFail();
            }
        });
    }

    // Insert SVG <g> element in the correct z-order (lower boardZ = inserted first = rendered behind)
    function insertSVGGroupByZ(newG, newZ) {
        const existing = Array.from(placedSVG.querySelectorAll('g[data-z]'));
        let insertBefore = null;
        for (const g of existing) {
            if (parseInt(g.getAttribute('data-z')) > newZ) {
                insertBefore = g;
                break;
            }
        }
        if (insertBefore) {
            placedSVG.insertBefore(newG, insertBefore);
        } else {
            placedSVG.appendChild(newG);
        }
    }

    document.getElementById('restartHouse').addEventListener('click', initGame);
    initGame();
};
