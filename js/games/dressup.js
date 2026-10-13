// Game 14: Dress Up Teddy (تلبيس الدمية)
window.initDressupGame = function (container) {
    const hats = [
        { char: '', label: 'بدون قبعة' },
        { char: '👑', label: 'تاج الملوك', offset: '-56px' },
        { char: '🎩', label: 'قبعة أنيقة', offset: '-52px' },
        { char: '🧢', label: 'قبعة رياضية', offset: '-36px' },
        { char: '👒', label: 'قبعة القش', offset: '-36px' }
    ];

    const glasses = [
        { char: '', label: 'بدون نظارة' },
        { char: '🕶️', label: 'نظارة شمسية', offset: '12px' },
        { char: '👓', label: 'نظارة القراءة', offset: '12px' }
    ];

    const necks = [
        { char: '', label: 'بدون إضافات' },
        { char: '🎀', label: 'ربطة عنق حمراء', offset: '68px' },
        { char: '🧣', label: 'شال شتوي', offset: '72px' },
        { char: '🥇', label: 'ميدالية الفوز', offset: '72px' }
    ];

    let currentHatIdx = 0;
    let currentGlassIdx = 0;
    let currentNeckIdx = 0;

    let html = `
        <div class="game-dressup-layout">
            <h2 class="game-title">🧸 تلبيس الدمية اللطيفة 🧸</h2>
            <p class="game-instructions">اضغط على الأزرار لتلبيس الدبدوب قبعات ونظارات وربطات ملونة!</p>

            <div class="dressup-stage">
                <div class="teddy-container">
                    <div class="accessory-overlay hat-overlay" id="hatOverlay"></div>
                    <div class="accessory-overlay glass-overlay" id="glassOverlay"></div>
                    <div class="teddy-body"><img src="${window.getEmojiSVG('🧸')}" class="game-svg-icon"></div>
                    <div class="accessory-overlay neck-overlay" id="neckOverlay"></div>
                </div>
            </div>

            <div class="dressup-controls">
                <div class="control-row">
                    <button class="dress-btn" id="hatBtn">🧢 القبعات</button>
                    <span class="dress-label" id="hatLabel">بدون قبعة</span>
                </div>
                <div class="control-row">
                    <button class="dress-btn" id="glassBtn">🕶️ النظارات</button>
                    <span class="dress-label" id="glassLabel">بدون نظارة</span>
                </div>
                <div class="control-row">
                    <button class="dress-btn" id="neckBtn">🎀 الرقبة</button>
                    <span class="dress-label" id="neckLabel">بدون إضافات</span>
                </div>
            </div>

            <button class="clear-btn" id="resetTeddy" style="margin-top: 20px; font-size: 1rem; padding: 10px 20px;">🗑️ إزالة الكل</button>
        </div>
    `;

    container.innerHTML = html;

    const hatOverlay = document.getElementById('hatOverlay');
    const glassOverlay = document.getElementById('glassOverlay');
    const neckOverlay = document.getElementById('neckOverlay');

    const hatLabel = document.getElementById('hatLabel');
    const glassLabel = document.getElementById('glassLabel');
    const neckLabel = document.getElementById('neckLabel');

    function updateTeddy() {
        // Update Hat
        const hat = hats[currentHatIdx];
        hatOverlay.innerHTML = hat.char ? `<img src="${window.getEmojiSVG(hat.char)}" class="game-svg-icon">` : '';
        hatOverlay.style.top = hat.char ? hat.offset : '0';
        hatLabel.innerText = hat.label;

        // Update Glasses
        const glass = glasses[currentGlassIdx];
        glassOverlay.innerHTML = glass.char ? `<img src="${window.getEmojiSVG(glass.char)}" class="game-svg-icon">` : '';
        glassOverlay.style.top = glass.char ? glass.offset : '0';
        glassLabel.innerText = glass.label;

        // Update Neck
        const neck = necks[currentNeckIdx];
        neckOverlay.innerHTML = neck.char ? `<img src="${window.getEmojiSVG(neck.char)}" class="game-svg-icon">` : '';
        neckOverlay.style.top = neck.char ? neck.offset : '0';
        neckLabel.innerText = neck.label;
    }

    // Button event listeners
    document.getElementById('hatBtn').addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        currentHatIdx = (currentHatIdx + 1) % hats.length;
        updateTeddy();
        triggerBounce();
    });

    document.getElementById('glassBtn').addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        currentGlassIdx = (currentGlassIdx + 1) % glasses.length;
        updateTeddy();
        triggerBounce();
    });

    document.getElementById('neckBtn').addEventListener('click', () => {
        if (window.sound) window.sound.playClick();
        currentNeckIdx = (currentNeckIdx + 1) % necks.length;
        updateTeddy();
        triggerBounce();
    });

    document.getElementById('resetTeddy').addEventListener('click', () => {
        if (window.sound) window.sound.playFail();
        currentHatIdx = 0;
        currentGlassIdx = 0;
        currentNeckIdx = 0;
        updateTeddy();
    });

    function triggerBounce() {
        const teddy = container.querySelector('.teddy-container');
        teddy.classList.add('bounce-anim');
        setTimeout(() => teddy.classList.remove('bounce-anim'), 600);
    }

    // Initial draw
    updateTeddy();
};
