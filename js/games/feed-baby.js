// Game 24: Feed the Baby (إرضاع البيبي)
window.initFeedBabyGame = function (container) {
    let score = 0;
    let lockActions = false;
    let lullabyTimer = null;
    let babyState = 'crying';

    let html = `
        <div class="game-feed-baby-layout">
            <h2 class="game-title">🍼 إرضاع البيبي اللطيف 🍼</h2>
            <p class="game-instructions" id="babyInstructions">اسحب قنينة الحليب وضعها في فم البيبي لإرضاعه!</p>

            <div class="baby-stage">
                <div class="baby-display" id="babyDisplay"></div>
                <div class="baby-speech-bubble" id="babyBubble">أنا جائع! وااااع! 😭</div>
            </div>

            <div class="baby-feeding-zone">
                <div class="baby-mouth-target" id="babyMouth"></div>
            </div>

            <div class="bottle-palette" id="bottlePalette">
                <div class="bottle-wrapper">
                    <div class="draggable-bottle" id="babyBottle"></div>
                </div>
            </div>

            <div id="babySuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>😴 هاش.. نام الرضيع بسلام! 😴</h3>
                    <p>لقد أطعمت البيبي وشعر بالشبع والراحة ونام بهدوء!</p>
                    <button class="menu-btn restart-btn" id="restartBabyFeed">أعد إرضاعه 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const babyDisplay = document.getElementById('babyDisplay');
    const babyBubble = document.getElementById('babyBubble');
    const babyMouth = document.getElementById('babyMouth');
    const bottle = document.getElementById('babyBottle');
    const babyInstructions = document.getElementById('babyInstructions');

    function resetGame() {
        lockActions = false;
        if (lullabyTimer) clearTimeout(lullabyTimer);
        
        babyDisplay.innerHTML = `<img src="${window.getEmojiSVG('😭')}" class="game-svg-icon">`;
        babyDisplay.style.transform = 'scale(1)';
        babyBubble.innerText = 'أنا جائع! وااااع! 😭';
        bottle.innerHTML = `<img src="${window.getEmojiSVG('🍼')}" class="game-svg-icon">`;
        babyState = 'crying';
        babyInstructions.innerText = 'اسحب قنينة الحليب وضعها في فم البيبي لإرضاعه!';
        
        bottle.style.position = 'static';
        bottle.style.transform = 'scale(1) rotate(0deg)';
        bottle.style.left = 'auto';
        bottle.style.top = 'auto';
        
        document.getElementById('babySuccessModal').classList.remove('show');
        
        setupDragging();
    }

    function setupDragging() {
        let startX = 0, startY = 0;
        let originalLeft = 0, originalTop = 0;
        let isDragging = false;

        const el = bottle;

        el.addEventListener('pointerdown', function (e) {
            if (lockActions) return;
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

            // Real-time check of mouth overlap
            const myRect = this.getBoundingClientRect();
            const mouthRect = babyMouth.getBoundingClientRect();

            const myCenterX = myRect.left + myRect.width / 2;
            const myCenterY = myRect.top + myRect.height / 2;
            const mouthCenterX = mouthRect.left + mouthRect.width / 2;
            const mouthCenterY = mouthRect.top + mouthRect.height / 2;

            const dist = Math.hypot(myCenterX - mouthCenterX, myCenterY - mouthCenterY);

            if (dist < 60 && !lockActions) {
                // Fed!
                lockActions = true;
                isDragging = false;
                this.releasePointerCapture(e.pointerId);
                this.classList.remove('dragging');
                
                feedSuccess();
            }
        });

        el.addEventListener('pointerup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            this.releasePointerCapture(e.pointerId);
            this.classList.remove('dragging');

            // Bounce back if released not in mouth
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
        });
    }

    function feedSuccess() {
        // Tilt the bottle like feeding
        bottle.style.transition = 'transform 0.4s ease-out';
        bottle.style.transform = 'translate(-20px, -20px) rotate(-45deg) scale(1.1)';
        
        // Gulping sound loops
        if (window.sound) {
            let gulpCount = 0;
            const gulpInterval = setInterval(() => {
                if (gulpCount < 6) {
                    window.sound.playBubble(); // Gulping simulation
                    gulpCount++;
                } else {
                    clearInterval(gulpInterval);
                }
            }, 300);
        }

        // Change baby state to eating
        babyState = 'eating';
        babyDisplay.innerHTML = `<img src="${window.getEmojiSVG('😋')}" class="game-svg-icon">`;
        babyBubble.innerText = 'همم! حليب دافئ ولذيذ! 😋';
        babyInstructions.innerText = 'البيبي يشرب الحليب الآن...';

        // Sweet Sleep Lullaby after eating
        setTimeout(() => {
            babyState = 'sleeping';
            babyDisplay.innerHTML = `<img src="${window.getEmojiSVG('😴')}" class="game-svg-icon">`;
            babyBubble.innerText = 'هااااش.. طفلي ينام بسلام.. 💤';
            babyInstructions.innerText = 'لقد نام البيبي الصغير!';
            bottle.style.transform = 'scale(0.8) rotate(0deg)';
            bottle.style.opacity = '0.5';

            // Play lullaby notes
            playLullaby();

            lullabyTimer = setTimeout(() => {
                document.getElementById('babySuccessModal').classList.add('show');
            }, 3000);

        }, 2200);
    }

    function playLullaby() {
        if (!window.sound) return;
        const notes = [
            { f: 293.66, d: 0.4 }, // D4
            { f: 349.23, d: 0.4 }, // F4
            { f: 440.00, d: 0.4 }, // A4
            { f: 523.25, d: 0.8 }, // C5
            { f: 440.00, d: 0.4 }, // A4
            { f: 349.23, d: 0.4 }, // F4
            { f: 293.66, d: 1.2 }  // D4
        ];

        let timeOffset = 0;
        notes.forEach(n => {
            setTimeout(() => {
                if (babyState === 'sleeping') { // only play if still sleeping
                    window.sound.playPianoNote(n.f);
                }
            }, timeOffset);
            timeOffset += n.d * 1000;
        });
    }

    document.getElementById('restartBabyFeed').addEventListener('click', () => {
        resetGame();
    });

    // Start game
    resetGame();

    // Clean up
    container.addEventListener('game-exit', () => {
        if (lullabyTimer) clearTimeout(lullabyTimer);
    });
};
