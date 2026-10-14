// Main coordinator script for Kids Games Suite (32 Games Version)
window.getEmojiSVG = function(emojiChar) {
    if (!emojiChar) return '';
    const codePoints = [];
    for (let char of emojiChar) {
        codePoints.push(char.codePointAt(0).toString(16));
    }
    const cleanCodePoints = codePoints.filter(cp => cp !== 'fe0f');
    const hex = cleanCodePoints.join('-');
    return `./assets/emojis/${hex}.svg`;
};

document.addEventListener('DOMContentLoaded', () => {
    const gameHub = document.getElementById('gameHub');
    const gameArea = document.getElementById('gameArea');
    const backBtn = document.getElementById('backBtn');
    
    // Definition of our 32 games
    const gamesList = [
        { id: 'animals', emoji: '🦁', title: 'أصوات الحيوانات', color: 'linear-gradient(135deg, #FF7F50, #FF6B6B)' },
        { id: 'coloring', emoji: '🎨', image: 'assets/images/coloring_card.png', title: 'كتاب التلوين', color: 'linear-gradient(135deg, #FF69B4, #EC407A)' },
        { id: 'balloons', emoji: '🎈', image: 'assets/images/balloons_card.png', title: 'فرقعة البالونات', color: 'linear-gradient(135deg, #FFD700, #FF9500)' },
        { id: 'memory', emoji: '🧠', title: 'لعبة الذاكرة', color: 'linear-gradient(135deg, #29B6F6, #0288D1)' },
        { id: 'shapes', emoji: '📐', title: 'مطابقة الأشكال', color: 'linear-gradient(135deg, #66BB6A, #388E3C)' },
        { id: 'catch', emoji: '🍎', image: 'assets/images/catch_card.png', title: 'صيد الفواكه', color: 'linear-gradient(135deg, #AB47BC, #7B1FA2)' },
        { id: 'piano', emoji: '🎹', image: 'assets/images/piano_card.png', title: 'بيانو الأطفال', color: 'linear-gradient(135deg, #26A69A, #00695C)' },
        { id: 'popit', emoji: '🟢', image: 'assets/images/popit_card.png', title: 'فقاعات البوب إت', color: 'linear-gradient(135deg, #EC407A, #FF3D00)' },
        { id: 'oddone', emoji: '🔍', title: 'أوجد المختلف', color: 'linear-gradient(135deg, #5C6BC0, #3949AB)' },
        { id: 'feed', emoji: '🍌', title: 'أطعم الحيوان', color: 'linear-gradient(135deg, #FFB74D, #FFA726)' },
        { id: 'shadow', emoji: '👥', title: 'ظلال الأشكال', color: 'linear-gradient(135deg, #78909C, #546E7A)' },
        { id: 'counting', emoji: '🔢', title: 'عد الأشياء', color: 'linear-gradient(135deg, #81C784, #4CAF50)' },
        { id: 'fireworks', emoji: '🎆', title: 'ألعاب نارية', color: 'linear-gradient(135deg, #4A148C, #1A237E)' },
        { id: 'dressup', emoji: '🧸', title: 'تلبيس الدمية', color: 'linear-gradient(135deg, #FF8A80, #FF5252)' },
        { id: 'tictactoe', emoji: '❌', title: 'لعبة إكس أو', color: 'linear-gradient(135deg, #4DD0E1, #00ACC1)' },
        { id: 'whack', emoji: '🐰', title: 'صيد الأرانب', color: 'linear-gradient(135deg, #A1887F, #8D6E63)' },
        { id: 'englishLetters', emoji: '🔠', title: 'حروف الإنجليزية', color: 'linear-gradient(135deg, #B388FF, #7C4DFF)' },
        { id: 'arabicLetters', emoji: '🅰️', title: 'حروف العربية', color: 'linear-gradient(135deg, #FF80AB, #FF4081)' },
        { id: 'numbers', emoji: '🔢', title: 'بالونات الأرقام', color: 'linear-gradient(135deg, #FFD54F, #FFB300)' },
        { id: 'fruits', emoji: '🍓', title: 'فقاعات الفواكه', color: 'linear-gradient(135deg, #A5D6A7, #66BB6A)' },
        { id: 'halvesPuzzle', emoji: '🧩', title: 'أنصاف الصور', color: 'linear-gradient(135deg, #FF7043, #D84315)' },
        { id: 'tangramPuzzle', emoji: '🏠', title: 'تركيب البيت', color: 'linear-gradient(135deg, #00ACC1, #006064)' },
        { id: 'girlsDressup', emoji: '👧', title: 'تلبيس البنات', color: 'linear-gradient(135deg, #F48FB1, #F06292)' },
        { id: 'picturePuzzle', emoji: '🖼️', title: 'تركيب الصور', color: 'linear-gradient(135deg, #7C4DFF, #651FFF)' },
        { id: 'jumpGame', emoji: '🏃', title: 'لعبة القفز', color: 'linear-gradient(135deg, #00E676, #00C853)' },
        { id: 'mathGame', emoji: '➕', title: 'جمع وطرح', color: 'linear-gradient(135deg, #FF6F00, #E65100)' },
        { id: 'missingItem', emoji: '👁️', title: 'ما الذي اختفى؟', color: 'linear-gradient(135deg, #7B1FA2, #4A148C)' },
        { id: 'sizeOrder', emoji: '📏', title: 'الأصغر للأكبر', color: 'linear-gradient(135deg, #1565C0, #0D47A1)' },
        { id: 'wordScramble', emoji: '🔤', title: 'رتب الكلمة', color: 'linear-gradient(135deg, #6A1B9A, #4A148C)' },
        { id: 'colorNumbers', emoji: '🖍️', title: 'لون بالأرقام', color: 'linear-gradient(135deg, #E65100, #BF360C)' },
        { id: 'cooking', emoji: '🍳', title: 'الطبخ السحري', color: 'linear-gradient(135deg, #BF360C, #7F0000)' },
        { id: 'connectDots', emoji: '✏️', title: 'صل النقاط', color: 'linear-gradient(135deg, #00695C, #004D40)' },
        { id: 'birdHunting', emoji: '🐤', title: 'صيد الطيور', color: 'linear-gradient(135deg, #4FC3F7, #0288D1)' },
        { id: 'fishing', emoji: '🐟', title: 'صيد السمك', color: 'linear-gradient(135deg, #00D2FF, #0066EB)' },
        { id: 'blockBlast', emoji: '🧩', image: 'assets/images/block_blast_card.png', title: 'بلوك بلاست', color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' },
        { id: 'matchWords', emoji: '🔗', title: 'صل الكلمات', color: 'linear-gradient(135deg, #A88BEB, #F18F01)' },
        { id: 'drums', emoji: '🥁', image: 'assets/images/drums_card.png', title: 'طبلة وموسيقى', color: 'linear-gradient(135deg, #F857A6, #FF5858)' },
        { id: 'carRace', emoji: '🚗', image: 'assets/images/car_race_card.png', title: 'سباق السيارات', color: 'linear-gradient(135deg, #11998E, #38EF7D)' },
        { id: 'brickBreaker', emoji: '🧱', image: 'assets/images/brick_breaker_card.png', title: 'تحطيم الكتل', color: 'linear-gradient(135deg, #FF2E93, #FF8A00)' },
        { id: 'pacman', emoji: '🐣', image: 'assets/images/pacman_card.png', title: 'الباكمان الفرح', color: 'linear-gradient(135deg, #FFEB3B, #F57F17)' },
        { id: 'soccer', emoji: '⚽', image: 'assets/images/soccer_card.png', title: 'كرة القدم السريعة', color: 'linear-gradient(135deg, #4CAF50, #2E7D32)' },
        { id: 'freeway', emoji: '🐔', title: 'عبور الشارع', color: 'linear-gradient(135deg, #78909C, #D84315)' },
        { id: 'colorSortWater', emoji: '💧', image: 'assets/images/water_sort_card.png', title: 'فرز ألوان الماء', color: 'linear-gradient(135deg, #00C6FF, #0072FF)' },
        { id: 'holeGame', emoji: '😋', title: 'الثقب الأسود', color: 'linear-gradient(135deg, #FFB74D, #FF9800)' },
        { id: 'candyMatch', emoji: '🍭', title: 'تطابق الحلوى', color: 'linear-gradient(135deg, #FF6B8B, #FF8E53)' },
        { id: 'woodUnblock', emoji: '🪵', title: 'فك الحطب', color: 'linear-gradient(135deg, #A1887F, #8D6E63)' },
        { id: 'numberSlide', emoji: '🔢', title: 'ترتيب الأرقام', color: 'linear-gradient(135deg, #FFD54F, #FFB300)' },
        { id: 'ringStacker', emoji: '🍩', title: 'حلقات الأرقام', color: 'linear-gradient(135deg, #FF69B4, #BA68C8)' },
        { id: 'littleBigSnake', emoji: '🐍', image: 'assets/images/snake_card.png', title: 'الثعبان الكبير', color: 'linear-gradient(135deg, #4CAF50, #81C784)' },
        { id: 'bubbleShooter', emoji: '🎈', image: 'assets/images/bubble_shooter_card.png', title: 'قاذف الفقاعات', color: 'linear-gradient(135deg, #00BCD4, #4DD0E1)' },
        { id: 'busJam', emoji: '🚌', image: 'assets/images/bus_card.png', title: 'موقف الحافلات', color: 'linear-gradient(135deg, #FF9800, #FF5722)' },
        { id: 'pool', emoji: '🎱', image: 'assets/images/pool_card.png', title: 'البلياردو', color: 'linear-gradient(135deg, #2E7D32, #4CAF50)' },
        { id: 'busShapes', emoji: '🚌', image: 'assets/images/bus_shapes_card.png', title: 'تطابق أشكال الحافلة', color: 'linear-gradient(135deg, #FFB74D, #FFA726)' },
        { id: 'laundrySort', emoji: '🧺', image: 'assets/images/laundry_sort_card.png', title: 'فرز الملابس الملونة', color: 'linear-gradient(135deg, #81C784, #4CAF50)' },
        { id: 'coinSort', emoji: '🪙', image: 'assets/images/coin_sort_card.png', title: 'فرز ودمج العملات', color: 'linear-gradient(135deg, #FFD700, #FFA726)' },
        { id: 'loopDrive', emoji: '🚗', image: 'assets/images/loop_drive_card.png', title: 'تحدي الدوران', color: 'linear-gradient(135deg, #FFD54F, #FF8F00)' },
        { id: 'hammerNails', emoji: '🔨', image: 'assets/images/hammer_nails_card.png', title: 'مطرقة المسامير', color: 'linear-gradient(135deg, #A1887F, #6D4C41)' },
        { id: 'arrowTarget', emoji: '🏹', image: 'assets/images/arrow_target_card.png', title: 'قناص السهام', color: 'linear-gradient(135deg, #FFF59D, #D84315)' },
        { id: 'spaceShooter', emoji: '🚀', image: 'assets/images/space_shooter_card.png', title: 'حارس المجرة', color: 'linear-gradient(135deg, #1A237E, #4A148C)' },
        { id: 'game2048', emoji: '🔢', title: 'لعبة 2048 للأبطال', color: 'linear-gradient(135deg, #FF9800, #F44336)' }
    ];

    // Render the Game Hub
    function renderHub() {
        const grid = document.createElement('div');
        grid.classList.add('game-grid');

        gamesList.forEach(g => {
            const card = document.createElement('div');
            card.classList.add('game-card');
            card.style.background = g.color;
            const previewHTML = g.image 
                ? `<img src="${g.image}" class="game-card-preview-img" style="width: 1.3em; height: 1.3em; border-radius: 12px; border: 2.5px solid #FFF; object-fit: cover; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">`
                : `<img src="${window.getEmojiSVG(g.emoji)}" class="game-card-preview-img" style="width: 1.3em; height: 1.3em; border-radius: 12px; border: 2.5px solid #FFF; background-color: rgba(255, 255, 255, 0.95); padding: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); box-sizing: border-box; object-fit: contain;">`;

            card.innerHTML = `
                <div class="game-card-emoji">${previewHTML}</div>
                <div class="game-card-title">${g.title}</div>
            `;
            card.addEventListener('click', () => {
                if (window.sound) {
                    window.sound.resume();
                }
                loadGame(g.id);
            });
            grid.appendChild(card);
        });

        gameHub.appendChild(grid);
    }

    // Load selected game
    function loadGame(gameId) {
        if (window.sound) {
            window.sound.playClick();
        }

        // Hide Hub, show Game Area
        gameHub.style.display = 'none';
        gameArea.style.display = 'block';
        backBtn.style.display = 'flex';
        
        // Hide app header during game
        const appHeader = document.getElementById('appHeader');
        if (appHeader) appHeader.style.display = 'none';

        // Initialize the appropriate game
        switch (gameId) {
            case 'animals':
                if (window.initAnimalsGame) window.initAnimalsGame(gameArea);
                break;
            case 'coloring':
                if (window.initColoringGame) window.initColoringGame(gameArea);
                break;
            case 'balloons':
                if (window.initBalloonsGame) window.initBalloonsGame(gameArea);
                break;
            case 'memory':
                if (window.initMemoryGame) window.initMemoryGame(gameArea);
                break;
            case 'shapes':
                if (window.initShapesGame) window.initShapesGame(gameArea);
                break;
            case 'catch':
                if (window.initCatchGame) window.initCatchGame(gameArea);
                break;
            case 'piano':
                if (window.initPianoGame) window.initPianoGame(gameArea);
                break;
            case 'popit':
                if (window.initPopitGame) window.initPopitGame(gameArea);
                break;
            case 'oddone':
                if (window.initOddOneGame) window.initOddOneGame(gameArea);
                break;
            case 'feed':
                if (window.initFeedGame) window.initFeedGame(gameArea);
                break;
            case 'shadow':
                if (window.initShadowGame) window.initShadowGame(gameArea);
                break;
            case 'counting':
                if (window.initCountingGame) window.initCountingGame(gameArea);
                break;
            case 'fireworks':
                if (window.initFireworksGame) window.initFireworksGame(gameArea);
                break;
            case 'dressup':
                if (window.initDressupGame) window.initDressupGame(gameArea);
                break;
            case 'tictactoe':
                if (window.initTictactoeGame) window.initTictactoeGame(gameArea);
                break;
            case 'whack':
                if (window.initWhackGame) window.initWhackGame(gameArea);
                break;
            case 'englishLetters':
                if (window.initEnglishLettersGame) window.initEnglishLettersGame(gameArea);
                break;
            case 'arabicLetters':
                if (window.initArabicLettersGame) window.initArabicLettersGame(gameArea);
                break;
            case 'numbers':
                if (window.initNumbersGame) window.initNumbersGame(gameArea);
                break;
            case 'fruits':
                if (window.initFruitsGame) window.initFruitsGame(gameArea);
                break;
            case 'halvesPuzzle':
                if (window.initHalvesPuzzleGame) window.initHalvesPuzzleGame(gameArea);
                break;
            case 'tangramPuzzle':
                if (window.initTangramPuzzleGame) window.initTangramPuzzleGame(gameArea);
                break;
            case 'girlsDressup':
                document.querySelector('.app-container').classList.add('wide-mode');
                if (window.initGirlsDressupGame) window.initGirlsDressupGame(gameArea);
                break;
            case 'picturePuzzle':
                if (window.initPicturePuzzleGame) window.initPicturePuzzleGame(gameArea);
                break;
            case 'jumpGame':
                if (window.initJumpGame) window.initJumpGame(gameArea);
                break;
            case 'mathGame':
                if (window.initMathGame) window.initMathGame(gameArea);
                break;
            case 'missingItem':
                if (window.initMissingItemGame) window.initMissingItemGame(gameArea);
                break;
            case 'sizeOrder':
                if (window.initSizeOrderGame) window.initSizeOrderGame(gameArea);
                break;
            case 'wordScramble':
                if (window.initWordScrambleGame) window.initWordScrambleGame(gameArea);
                break;
            case 'colorNumbers':
                if (window.initColorNumbersGame) window.initColorNumbersGame(gameArea);
                break;
            case 'cooking':
                if (window.initCookingGame) window.initCookingGame(gameArea);
                break;
            case 'connectDots':
                if (window.initConnectDotsGame) window.initConnectDotsGame(gameArea);
                break;
            case 'birdHunting':
                if (window.initBirdHuntingGame) window.initBirdHuntingGame(gameArea);
                break;
            case 'fishing':
                if (window.initFishingGame) window.initFishingGame(gameArea);
                break;
            case 'blockBlast':
                if (window.initBlockBlastGame) window.initBlockBlastGame(gameArea);
                break;
            case 'matchWords':
                if (window.initMatchWordsGame) window.initMatchWordsGame(gameArea);
                break;
            case 'drums':
                if (window.initDrumsGame) window.initDrumsGame(gameArea);
                break;
            case 'carRace':
                if (window.initCarRaceGame) window.initCarRaceGame(gameArea);
                break;
            case 'brickBreaker':
                if (window.initBrickBreakerGame) window.initBrickBreakerGame(gameArea);
                break;
            case 'pacman':
                if (window.initPacmanGame) window.initPacmanGame(gameArea);
                break;
            case 'soccer':
                if (window.initSoccerGame) window.initSoccerGame(gameArea);
                break;
            case 'freeway':
                if (window.initFreewayGame) window.initFreewayGame(gameArea);
                break;
            case 'colorSortWater':
                if (window.initColorSortWaterGame) window.initColorSortWaterGame(gameArea);
                break;
            case 'holeGame':
                if (window.initHoleGame) window.initHoleGame(gameArea);
                break;
            case 'candyMatch':
                if (window.initCandyMatchGame) window.initCandyMatchGame(gameArea);
                break;
            case 'woodUnblock':
                if (window.initWoodUnblockGame) window.initWoodUnblockGame(gameArea);
                break;
            case 'numberSlide':
                if (window.initNumberSlideGame) window.initNumberSlideGame(gameArea);
                break;
            case 'ringStacker':
                if (window.initRingStackerGame) window.initRingStackerGame(gameArea);
                break;
            case 'littleBigSnake':
                if (window.initLittleBigSnakeGame) window.initLittleBigSnakeGame(gameArea);
                break;
            case 'bubbleShooter':
                if (window.initBubbleShooterGame) window.initBubbleShooterGame(gameArea);
                break;
            case 'busJam':
                if (window.initBusJamGame) window.initBusJamGame(gameArea);
                break;
            case 'pool':
                if (window.initPoolGame) window.initPoolGame(gameArea);
                break;
            case 'busShapes':
                if (window.initBusShapesGame) window.initBusShapesGame(gameArea);
                break;
            case 'laundrySort':
                if (window.initLaundrySortGame) window.initLaundrySortGame(gameArea);
                break;
            case 'coinSort':
                if (window.initCoinSortGame) window.initCoinSortGame(gameArea);
                break;
            case 'loopDrive':
                if (window.initLoopDriveGame) window.initLoopDriveGame(gameArea);
                break;
            case 'hammerNails':
                if (window.initHammerNailsGame) window.initHammerNailsGame(gameArea);
                break;
            case 'arrowTarget':
                if (window.initArrowTargetGame) window.initArrowTargetGame(gameArea);
                break;
            case 'spaceShooter':
                if (window.initSpaceShooterGame) window.initSpaceShooterGame(gameArea);
                break;
            case 'game2048':
                if (window.initGame2048) window.initGame2048(gameArea);
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Back to Game Hub
    function returnToHub() {
        if (window.sound) {
            window.sound.playFlip();
        }

        const exitEvent = new CustomEvent('game-exit');
        gameArea.dispatchEvent(exitEvent);

        document.querySelector('.app-container').classList.remove('wide-mode');
        gameArea.innerHTML = '';
        
        gameArea.style.display = 'none';
        backBtn.style.display = 'none';
        gameHub.style.display = 'flex';

        // Show app header again on main menu
        const appHeader = document.getElementById('appHeader');
        if (appHeader) appHeader.style.display = 'block';
    }

    backBtn.addEventListener('click', returnToHub);

    document.body.addEventListener('click', () => {
        if (window.sound) {
            window.sound.resume();
        }
    }, { once: true });

    renderHub();
});
