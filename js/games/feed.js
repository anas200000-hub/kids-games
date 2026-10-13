// Game 10: Feed the Animal (أطعم الحيوان)
window.initFeedGame = function (container) {
    const animalsPool = [
        { id: 'monkey', emoji: '🐒', happyEmoji: '🐵', food: 'banana', name: 'القرد اللطيف', foodName: 'موزة' },
        { id: 'rabbit', emoji: '🐰', happyEmoji: '🐰', food: 'carrot', name: 'الأرنب الصغير', foodName: 'جزرة' },
        { id: 'cat', emoji: '🐱', happyEmoji: '😸', food: 'fish', name: 'القطة الجميلة', foodName: 'سمكة' },
        { id: 'cow', emoji: '🐮', happyEmoji: '🐮', food: 'grass', name: 'البقرة الجميلة', foodName: 'عشباً' },
        { id: 'dog', emoji: '🐶', happyEmoji: '🐶', food: 'bone', name: 'الكلب المطيع', foodName: 'عظمة' },
        { id: 'lion', emoji: '🦁', happyEmoji: '🦁', food: 'meat', name: 'الأسد القوي', foodName: 'قطعة لحم' }
    ];

    const foodsPool = [
        { id: 'banana', emoji: '🍌', label: 'موز' },
        { id: 'carrot', emoji: '🥕', label: 'جزر' },
        { id: 'fish', emoji: '🐟', label: 'سمك' },
        { id: 'grass', emoji: '🌿', label: 'عشب' },
        { id: 'bone', emoji: '🍖', label: 'عظمة' },
        { id: 'meat', emoji: '🥩', label: 'لحم' }
    ];

    let activeAnimal = null;
    let score = 0;
    const targetScore = 5;
    let lockActions = false;

    let html = `
        <div class="game-feed-layout">
            <h2 class="game-title">🍌 أطعم الحيوان الجائع 🍌</h2>
            <div class="level-indicator">الإطعام الناجح: <span id="feedScore">0</span> / 5</div>
            <p class="game-instructions" id="feedPrompt">من جائع الآن؟</p>
            
            <div class="animal-stage">
                <div class="animal-display" id="animalDisplay"></div>
                <div class="feed-speech-bubble" id="feedBubble">أنا جائع جداً!</div>
            </div>

            <div class="food-container" id="foodContainer"></div>

            <div id="feedSuccessModal" class="game-modal">
                <div class="modal-content bounce-anim">
                    <h3>🎉 أحسنت يا صديق الحيوانات! 🎉</h3>
                    <p>لقد أطعمت الحيوانات الجائعة كلها وشعرت بالسعادة!</p>
                    <button class="menu-btn restart-btn" id="restartFeed">العب مرة أخرى 🔄</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const animalDisplay = document.getElementById('animalDisplay');
    const feedBubble = document.getElementById('feedBubble');
    const foodContainer = document.getElementById('foodContainer');
    const feedPrompt = document.getElementById('feedPrompt');

    function loadRound() {
        lockActions = false;
        
        // Pick random animal from pool
        const prevAnimal = activeAnimal;
        do {
            activeAnimal = animalsPool[Math.floor(Math.random() * animalsPool.length)];
        } while (prevAnimal && activeAnimal.id === prevAnimal.id && animalsPool.length > 1);

        // Update UI
        animalDisplay.innerHTML = `<img src="${window.getEmojiSVG(activeAnimal.emoji)}" class="game-svg-icon">`;
        animalDisplay.style.transform = 'scale(1)';
        feedBubble.innerText = `أنا ${activeAnimal.name}، أين طعامي المفضّل؟`;
        feedPrompt.innerText = `ساعد ${activeAnimal.name} واضغط على طعامه المفضل!`;
        
        // Generate choices: 1 correct + 2 random incorrect
        const correctFood = foodsPool.find(f => f.id === activeAnimal.food);
        const incorrectFoods = [];
        const otherFoods = foodsPool.filter(f => f.id !== activeAnimal.food);
        const tempCopy = [...otherFoods];
        while (incorrectFoods.length < 2 && tempCopy.length > 0) {
            const idx = Math.floor(Math.random() * tempCopy.length);
            incorrectFoods.push(tempCopy.splice(idx, 1)[0]);
        }
        const roundFoods = [correctFood, ...incorrectFoods].sort(() => Math.random() - 0.5);

        // Render food choices
        foodContainer.innerHTML = '';
        roundFoods.forEach(f => {
            if (!f) return;
            const foodCard = document.createElement('div');
            foodCard.classList.add('food-card');
            foodCard.setAttribute('data-food', f.id);
            foodCard.innerHTML = `
                <div class="food-emoji"><img src="${window.getEmojiSVG(f.emoji)}" class="game-svg-icon"></div>
                <div class="food-label">${f.label}</div>
            `;
            foodContainer.appendChild(foodCard);

            // Add click listener
            foodCard.addEventListener('click', () => feedAnimal(f.id, foodCard));
        });
    }

    function feedAnimal(foodId, cardEl) {
        if (lockActions) return;
        lockActions = true;

        if (foodId === activeAnimal.food) {
            // Correct food!
            score++;
            document.getElementById('feedScore').innerText = score;
            
            if (window.sound) {
                window.sound.playSuccess();
            }

            // Animate feeding
            cardEl.classList.add('bounce-anim');
            animalDisplay.innerHTML = `<img src="${window.getEmojiSVG('😋')}" class="game-svg-icon">`; // eating face
            feedBubble.innerText = `ممممم! لذيذ جداً! شكراً لك على الـ ${activeAnimal.foodName}! ❤️`;
            
            setTimeout(() => {
                animalDisplay.innerHTML = `<img src="${window.getEmojiSVG(activeAnimal.happyEmoji)}" class="game-svg-icon">`;
                animalDisplay.classList.add('bounce-anim');
            }, 600);

            setTimeout(() => {
                animalDisplay.classList.remove('bounce-anim');
                if (score >= targetScore) {
                    winGame();
                } else {
                    loadRound();
                }
            }, 1800);

        } else {
            // Incorrect food
            if (window.sound) {
                window.sound.playFail();
            }

            cardEl.classList.add('shake-anim');
            animalDisplay.classList.add('shake-anim'); // Shake the animal display instead of changing it

            // Create wrong indicator X element
            const errorX = document.createElement('div');
            errorX.classList.add('wrong-indicator-x');
            errorX.innerHTML = `<img src="${window.getEmojiSVG('❌')}" class="game-svg-icon" style="width: 100%; height: 100%;">`;
            cardEl.appendChild(errorX);

            feedBubble.innerText = 'كلا، هذا ليس طعامي المفضل! 😣';

            setTimeout(() => {
                cardEl.classList.remove('shake-anim');
                animalDisplay.classList.remove('shake-anim');
                errorX.remove();
                animalDisplay.innerHTML = `<img src="${window.getEmojiSVG(activeAnimal.emoji)}" class="game-svg-icon">`;
                feedBubble.innerText = 'هل يمكنك البحث عن طعام آخر؟';
                lockActions = false;
            }, 1200);
        }
    }

    function winGame() {
        if (window.sound) {
            window.sound.playSuccess();
        }
        document.getElementById('feedSuccessModal').classList.add('show');
    }

    function restartGame() {
        score = 0;
        document.getElementById('feedScore').innerText = score;
        document.getElementById('feedSuccessModal').classList.remove('show');
        loadRound();
    }

    document.getElementById('restartFeed').addEventListener('click', restartGame);

    // Start game
    loadRound();
};
