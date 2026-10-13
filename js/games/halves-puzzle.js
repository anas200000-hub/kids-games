// Game 21: Halves Match Puzzle (لغز أنصاف الصور)
window.initHalvesPuzzleGame = function (container) {
    const itemsPool = [
        { id: 'apple', char: '🍎', name: 'تفاحة' },
        { id: 'dog', char: '🐶', name: 'كلب' },
        { id: 'car', char: '🚗', name: 'سيارة' },
        { id: 'cat', char: '🐱', name: 'قطة' },
        { id: 'rabbit', char: '🐰', name: 'أرنب' },
        { id: 'lion', char: '🦁', name: 'أسد' },
        { id: 'fish', char: '🐟', name: 'سمكة' },
        { id: 'butterfly', char: '🦋', name: 'فراشة' },
        { id: 'house', char: '🏠', name: 'بيت' },
        { id: 'balloon', char: '🎈', name: 'بالون' },
        { id: 'strawberry', char: '🍓', name: 'فراولة' },
        { id: 'sun', char: '☀️', name: 'شمس' }
    ];

    let activeItems = [];
    let matchedCount = 0;

    let html = `
        <div class="game-halves-layout">
            <h2 class="game-title">🧩 لغز أنصاف الصور 🧩</h2>
            <p class="game-instructions">اسحب النصف الأيمن من الأسفل وضعه بجانب النصف الأيسر المطابق له في الأعلى لتكتمل الصورة!</p>

            <div class="halves-game-container">
                <!-- Top Section: 2x2 Grid of Left Halves + Drop Targets -->
                <div class="halves-slots" id="halvesSlots"></div>
                
                <!-- Bottom Section: Draggable Right Halves Scrambled -->
                <div class="halves-palette" id="halvesPalette"></div>
            </div>

            <div id="halvesSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 عمل رائع وممتاز يا ذكي! 🎉</h3>
                    <p>لقد قمت بتركيب كل أنصاف الصور بنجاح تام!</p>
                    <button class="menu-btn restart-btn" id="restartHalves">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const slotsContainer = document.getElementById('halvesSlots');
    const paletteContainer = document.getElementById('halvesPalette');

    function initGame() {
        matchedCount = 0;
        slotsContainer.innerHTML = '';
        paletteContainer.innerHTML = '';
        document.getElementById('halvesSuccessModal').classList.remove('show');

        // Select 4 random items from the pool
        activeItems = [];
        const poolCopy = [...itemsPool];
        while (activeItems.length < 4 && poolCopy.length > 0) {
            const idx = Math.floor(Math.random() * poolCopy.length);
            activeItems.push(poolCopy.splice(idx, 1)[0]);
        }

        // Shuffle right halves for dragging
        const shuffledRights = [...activeItems].sort(() => Math.random() - 0.5);

        // Render left slots
        activeItems.forEach(item => {
            const slotWrapper = document.createElement('div');
            slotWrapper.classList.add('half-slot-row');

            // Left half card
            const leftHalf = document.createElement('div');
            leftHalf.classList.add('half-part', 'left-part');
            leftHalf.innerHTML = `<div class="half-emoji-content left-align"><img src="${window.getEmojiSVG(item.char)}" class="game-svg-icon"></div>`;

            // Empty target slot for right half
            const rightSlot = document.createElement('div');
            rightSlot.classList.add('half-slot-target');
            rightSlot.setAttribute('data-id', item.id);
            rightSlot.innerHTML = `<div class="slot-dotted-outline">?</div>`;

            slotWrapper.appendChild(leftHalf);
            slotWrapper.appendChild(rightSlot);
            slotsContainer.appendChild(slotWrapper);
        });

        // Render draggable right halves at the bottom
        shuffledRights.forEach(item => {
            const dragWrapper = document.createElement('div');
            dragWrapper.classList.add('half-drag-wrapper');

            const rightHalf = document.createElement('div');
            rightHalf.classList.add('half-part', 'right-part', 'draggable-half');
            rightHalf.setAttribute('data-id', item.id);
            rightHalf.innerHTML = `<div class="half-emoji-content right-align"><img src="${window.getEmojiSVG(item.char)}" class="game-svg-icon"></div>`;

            dragWrapper.appendChild(rightHalf);
            paletteContainer.appendChild(dragWrapper);

            setupDragging(rightHalf);
        });
    }

    function setupDragging(el) {
        let startX = 0, startY = 0;
        let originalLeft = 0, originalTop = 0;
        let isDragging = false;

        el.addEventListener('pointerdown', function (e) {
            if (this.classList.contains('matched-half')) return;
            e.preventDefault();
            this.setPointerCapture(e.pointerId);
            isDragging = true;
            this.classList.add('dragging');

            if (window.sound) window.sound.playClick();

            const rect = this.getBoundingClientRect();
            const parentRect = this.parentElement.getBoundingClientRect();

            originalLeft = rect.left - parentRect.left;
            originalTop = rect.top - parentRect.top;

            startX = e.clientX;
            startY = e.clientY;

            this.style.position = 'absolute';
            this.style.left = originalLeft + 'px';
            this.style.top = originalTop + 'px';
            this.style.width = rect.width + 'px';
            this.style.height = rect.height + 'px';
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

            const itemId = this.getAttribute('data-id');
            const targetSlot = slotsContainer.querySelector(`.half-slot-target[data-id="${itemId}"]`);

            const myRect = this.getBoundingClientRect();
            const slotRect = targetSlot.getBoundingClientRect();

            // Center points overlap check
            const myCenterX = myRect.left + myRect.width / 2;
            const myCenterY = myRect.top + myRect.height / 2;
            const slotCenterX = slotRect.left + slotRect.width / 2;
            const slotCenterY = slotRect.top + slotRect.height / 2;

            const dist = Math.hypot(myCenterX - slotCenterX, myCenterY - slotCenterY);

            if (dist < 80) {
                // MATCHED! Replace both halves with a single complete image card
                if (window.sound) window.sound.playBubble();

                // Find the matched item from activeItems
                const matchedItem = activeItems.find(i => i.id === itemId);
                const slotRow = targetSlot.parentElement;

                // Replace the entire row with a completed card showing full image
                const completedCard = document.createElement('div');
                completedCard.classList.add('half-part-completed');
                completedCard.innerHTML = `<img src="${window.getEmojiSVG(matchedItem.char)}" class="game-svg-icon" style="width: 70px; height: 70px;">`;

                slotRow.innerHTML = '';
                slotRow.appendChild(completedCard);
                slotRow.classList.add('bounce-anim');
                setTimeout(() => slotRow.classList.remove('bounce-anim'), 600);

                // Also remove the dragged piece from the palette
                el.parentElement.remove();

                matchedCount++;
                if (matchedCount === activeItems.length) {
                    setTimeout(() => {
                        if (window.sound) window.sound.playSuccess();
                        document.getElementById('halvesSuccessModal').classList.add('show');
                    }, 800);
                }
            } else {
                // Bounce back
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

    document.getElementById('restartHalves').addEventListener('click', initGame);

    initGame();
};
