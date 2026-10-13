// Game 5: Shape Matcher (مطابقة الأشكال)
window.initShapesGame = function (container) {
    const shapePool = [
        { id: 'circle_red', char: '🔴', name: 'دائرة حمراء' },
        { id: 'square_blue', char: '🟦', name: 'مربع أزرق' },
        { id: 'triangle_red', char: '🔺', name: 'مثلث أحمر' },
        { id: 'star', char: '⭐', name: 'نجمة صفراء' },
        { id: 'heart', char: '💖', name: 'قلب وردي' },
        { id: 'circle_green', char: '🟢', name: 'دائرة خضراء' },
        { id: 'moon', char: '🌙', name: 'هلال أصفر' },
        { id: 'diamond', char: '💎', name: 'ماس أزرق' },
        { id: 'sun', char: '☀️', name: 'شمس مشرقة' },
        { id: 'clover', char: '🍀', name: 'ورقة برسيم' },
        { id: 'water', char: '💧', name: 'قطرة ماء' }
    ];

    let activeShapes = [];

    let html = `
        <div class="game-shapes-layout">
            <h2 class="game-title">📐 مطابقة الأشكال 📐</h2>
            <p class="game-instructions">اسحب الشكل الملون وضعه في الظل المناسب له!</p>
            <div class="shapes-game-container">
                <div class="shapes-palette" id="draggableContainer"></div>
                <div class="shapes-slots" id="slotsContainer"></div>
            </div>
            <div id="shapesSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 عمل رائع يا ذكي! 🎉</h3>
                    <p>لقد قمت بمطابقة كل الأشكال بنجاح!</p>
                    <button class="menu-btn restart-btn" id="restartShapes">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const dragContainer = document.getElementById('draggableContainer');
    const slotsContainer = document.getElementById('slotsContainer');
    let matchedCount = 0;

    function initGame() {
        matchedCount = 0;
        dragContainer.innerHTML = '';
        slotsContainer.innerHTML = '';
        document.getElementById('shapesSuccessModal').classList.remove('show');

        // Select 5 random shapes from the pool
        activeShapes = [];
        const poolCopy = [...shapePool];
        while (activeShapes.length < 5 && poolCopy.length > 0) {
            const idx = Math.floor(Math.random() * poolCopy.length);
            activeShapes.push(poolCopy.splice(idx, 1)[0]);
        }

        // Shuffle draggable shapes
        const shuffledDraggables = [...activeShapes].sort(() => Math.random() - 0.5);
        // Shuffle slots targets
        const shuffledSlots = [...activeShapes].sort(() => Math.random() - 0.5);

        // Render slots
        shuffledSlots.forEach(s => {
            const slot = document.createElement('div');
            slot.classList.add('shape-slot');
            slot.setAttribute('data-shape', s.id);
            slot.innerHTML = `
                <div class="shape-slot-silhouette"><img src="${window.getEmojiSVG(s.char)}" class="game-svg-icon" style="filter: brightness(0); opacity: 0.15;"></div>
                <div class="shape-slot-label">${s.name}</div>
            `;
            slotsContainer.appendChild(slot);
        });

        // Render draggables
        shuffledDraggables.forEach(s => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('draggable-wrapper');

            const item = document.createElement('div');
            item.classList.add('draggable-shape');
            item.setAttribute('data-shape', s.id);
            item.innerHTML = `
                <span class="shape-char"><img src="${window.getEmojiSVG(s.char)}" class="game-svg-icon"></span>
            `;

            wrapper.appendChild(item);
            dragContainer.appendChild(wrapper);

            setupDragging(item);
        });
    }

    function setupDragging(el) {
        let startX = 0, startY = 0;
        let originalLeft = 0, originalTop = 0;
        let isDragging = false;

        el.addEventListener('pointerdown', function (e) {
            if (this.classList.contains('matched-shape')) return;
            e.preventDefault();
            this.setPointerCapture(e.pointerId);
            isDragging = true;
            this.classList.add('dragging');

            if (window.sound) window.sound.playClick();

            // Record initial pointer and element position
            const rect = this.getBoundingClientRect();
            const parentRect = this.parentElement.getBoundingClientRect();

            originalLeft = rect.left - parentRect.left;
            originalTop = rect.top - parentRect.top;

            startX = e.clientX;
            startY = e.clientY;

            // Apply absolute styling to drag relative to its wrapper parent
            this.style.position = 'absolute';
            this.style.left = originalLeft + 'px';
            this.style.top = originalTop + 'px';
            this.style.width = parentRect.width + 'px';
            this.style.height = parentRect.height + 'px';
            this.style.zIndex = '1000';
        });

        el.addEventListener('pointermove', function (e) {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            this.style.left = (originalLeft + dx) + 'px';
            this.style.top = (originalTop + dy) + 'px';
        });

        el.addEventListener('pointerup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            this.releasePointerCapture(e.pointerId);
            this.classList.remove('dragging');

            const shapeId = this.getAttribute('data-shape');
            const targetSlot = slotsContainer.querySelector(`.shape-slot[data-shape="${shapeId}"]`);

            const myRect = this.getBoundingClientRect();
            const slotRect = targetSlot.getBoundingClientRect();

            // Check overlap distance between center points
            const myCenterX = myRect.left + myRect.width / 2;
            const myCenterY = myRect.top + myRect.height / 2;
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height / 2;

            const dist = Math.hypot(myCenterX - slotCenterX, myCenterY - slotCenterY);

            if (dist < 80) {
                // MATCHED!
                if (window.sound) window.sound.playBubble();
                this.classList.add('matched-shape');
                this.style.position = 'static';
                this.style.width = '100%';
                this.style.height = '100%';
                this.style.zIndex = '1';
                
                // Put inside slot
                targetSlot.innerHTML = '';
                targetSlot.appendChild(this);
                targetSlot.classList.add('slot-filled');

                matchedCount++;
                if (matchedCount === activeShapes.length) {
                    setTimeout(() => {
                        if (window.sound) window.sound.playSuccess();
                        document.getElementById('shapesSuccessModal').classList.add('show');
                    }, 500);
                }
            } else {
                // MISMATCHED - bounce back
                if (window.sound) window.sound.playFail();
                this.style.transition = 'all 0.3s ease-out';
                this.style.left = originalLeft + 'px';
                this.style.top = originalTop + 'px';

                setTimeout(() => {
                    this.style.transition = 'none';
                    this.style.position = 'static';
                    this.style.width = '100%';
                    this.style.height = '100%';
                    this.style.zIndex = '1';
                }, 300);
            }
        });
    }

    document.getElementById('restartShapes').addEventListener('click', initGame);

    initGame();
};
