// Game: Coin Sort & Merge (فرز ودمج العملات - إصدار الأبعاد الثنائية والنصف 2.5D المطابق تماماً للجرافيك ثلاثي الأبعاد)
(function() {
    window.initCoinSortGame = function(container) {
        let level = 1;
        let plates = []; // 15 slots (3 rows x 5 columns), each containing arrays of {value, hidden}
        let selectedPlateIdx = null;
        let isAnimating = false;
        let history = []; // Undo history stack
        let levelScore = 0;
        let completedTargets = {}; // Targets checklist map

        // Level Configurations with denominations: 1, 2, 5, 10, 20, 100
        const levelConfigs = [
            {
                level: 1,
                rows: 3,
                cols: 5,
                targets: [2],
                initialChips: [
                    { val: 1, count: 5, hidden: false },
                    { val: 1, count: 5, hidden: true }
                ],
                title: 'بداية المغامرة 🪙',
                instruction: 'ادمج 10 رقاقات فضية فئة 1 لتصنع رقاقة برتقالية فئة 2!'
            },
            {
                level: 2,
                rows: 3,
                cols: 5,
                targets: [5],
                initialChips: [
                    { val: 1, count: 5, hidden: true },
                    { val: 2, count: 5, hidden: false },
                    { val: 2, count: 5, hidden: true }
                ],
                title: 'العملة الحمراء 🌟',
                instruction: 'ادمج رقاقات فئة 2 لتصنع الرقاقة الحمراء فئة 5!'
            },
            {
                level: 3,
                rows: 3,
                cols: 5,
                targets: [2, 5],
                initialChips: [
                    { val: 1, count: 5, hidden: false },
                    { val: 1, count: 5, hidden: true },
                    { val: 2, count: 5, hidden: false },
                    { val: 2, count: 5, hidden: true }
                ],
                title: 'الفرز الثنائي 💎',
                instruction: 'رتب واكشف الرقاقات المخفية لتصنع الفئة البرتقالية 2 والحمراء 5!'
            },
            {
                level: 4,
                rows: 3,
                cols: 5,
                targets: [10],
                initialChips: [
                    { val: 2, count: 6, hidden: true },
                    { val: 5, count: 5, hidden: false },
                    { val: 5, count: 5, hidden: true }
                ],
                title: 'العملة الزرقاء 💙',
                instruction: 'ادمج رقاقات فئة 5 لتصنع الرقاقة الزرقاء فئة 10!'
            },
            {
                level: 5,
                rows: 3,
                cols: 5,
                targets: [5, 10],
                initialChips: [
                    { val: 1, count: 5, hidden: true },
                    { val: 2, count: 5, hidden: true },
                    { val: 5, count: 5, hidden: false },
                    { val: 5, count: 5, hidden: true }
                ],
                title: 'المزيج الثلاثي 🧩',
                instruction: 'ادمج الفئات المختلفة لتصنع رقاقة 5 ورقاقة 10!'
            },
            {
                level: 6,
                rows: 3,
                cols: 5,
                targets: [20],
                initialChips: [
                    { val: 5, count: 6, hidden: true },
                    { val: 10, count: 5, hidden: false },
                    { val: 10, count: 5, hidden: true }
                ],
                title: 'العملة الخضراء الكبرى 💚',
                instruction: 'ادمج رقاقات فئة 10 لتصنع الرقاقة الخضراء فئة 20!'
            },
            {
                level: 7,
                rows: 3,
                cols: 5,
                targets: [10, 20],
                initialChips: [
                    { val: 2, count: 8, hidden: true },
                    { val: 5, count: 5, hidden: false },
                    { val: 5, count: 5, hidden: true },
                    { val: 10, count: 5, hidden: false },
                    { val: 10, count: 5, hidden: true }
                ],
                title: 'تحدي المحترفين ⚡',
                instruction: 'رتب العملات المختلفة لتصنع الفئة الزرقاء 10 والخضراء 20!'
            },
            {
                level: 8,
                rows: 3,
                cols: 5,
                targets: [100],
                initialChips: [
                    { val: 10, count: 5, hidden: true },
                    { val: 20, count: 5, hidden: false },
                    { val: 20, count: 5, hidden: true }
                ],
                title: 'الكنز الذهبي العملاق 👑',
                instruction: 'ادمج رقاقات فئة 20 لتصنع الكنز الذهبي العملاق فئة 100!'
            },
            {
                level: 9,
                rows: 3,
                cols: 5,
                targets: [20, 100],
                initialChips: [
                    { val: 5, count: 8, hidden: true },
                    { val: 10, count: 6, hidden: true },
                    { val: 20, count: 5, hidden: false },
                    { val: 20, count: 5, hidden: true }
                ],
                title: 'الحصن المغلق 🏰',
                instruction: 'افتح الرقاقات السرية لتصنع فئة 20 والرقاقة الذهبية 100!'
            },
            {
                level: 10,
                rows: 3,
                cols: 5,
                targets: [100],
                initialChips: [
                    { val: 5, count: 10, hidden: true },
                    { val: 10, count: 8, hidden: true },
                    { val: 20, count: 6, hidden: false },
                    { val: 20, count: 6, hidden: true }
                ],
                title: 'كأس فرز العباقرة 🏆',
                instruction: 'التحدي النهائي! ادمج العملات لتصنع الرقاقة الذهبية 100 وتفوز بالكأس الكبيرة!'
            }
        ];

        // Dynamic 2.5D Style Injection
        const styleId = 'coin-sort-grid-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                .game-coin-sort-layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    font-family: var(--font-kids);
                    user-select: none;
                    direction: rtl;
                    background: linear-gradient(to bottom, #3E2723 0%, #1A0F0D 100%); /* Premium dark mahogany table background */
                    border-radius: 20px;
                    padding: 8px;
                    overflow: hidden;
                }

                /* HUD styles */
                .coin-sort-hud {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 6px 10px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 2px solid rgba(255, 255, 255, 0.12);
                    border-radius: 16px;
                    box-sizing: border-box;
                    margin-bottom: 6px;
                    backdrop-filter: blur(5px);
                }

                .hud-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .hud-level-title {
                    font-weight: 800;
                    color: #FFB74D;
                    font-size: 0.95rem;
                }

                /* Target checkmarks container */
                .hud-targets-list {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                    margin-top: 2px;
                }

                .target-chip-badge {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    background: rgba(0,0,0,0.45);
                    padding: 2px 6px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    color: #FFF;
                    border: 1px solid rgba(255,255,255,0.15);
                }

                .target-chip-circle {
                    width: 13px;
                    height: 13px;
                    border-radius: 50%;
                    display: inline-block;
                    border: 1px solid #FFF;
                }

                .target-chip-badge.completed {
                    background: #2E7D32;
                    border-color: #4CAF50;
                }

                .target-chip-badge.completed::after {
                    content: ' ✓';
                    color: #81C784;
                }

                .hud-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .score-badge {
                    background: #FF8F00;
                    border: 2px solid #FFB300;
                    color: #FFF;
                    font-weight: 800;
                    font-size: 0.85rem;
                    padding: 3px 8px;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.25);
                }

                .coin-sort-instructions {
                    text-align: center;
                    font-size: 0.75rem;
                    color: #D7CCC8;
                    margin: 0px 0 6px;
                    padding: 0 6px;
                    font-weight: 500;
                    line-height: 1.25;
                }

                /* Play board tray - Grid Layout 3x5 with 3D Perspective */
                .board-tray-wrapper {
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 8px 0;
                    perspective: 1200px; /* Perspective for 2.5D */
                }

                .board-tray {
                    background: radial-gradient(circle, #A1887F 10%, #5D4037 100%); /* Rich wood board */
                    border: 5px solid #3E2723;
                    border-radius: 24px;
                    box-shadow: 
                        inset 0 3px 8px rgba(255,255,255,0.3),
                        0 12px 0 #2D1A17, /* 3D Tray wooden edge thickness */
                        0 18px 25px rgba(0, 0, 0, 0.75); /* Soft table shadow */
                    padding: 14px;
                    width: 100%;
                    max-width: 375px;
                    box-sizing: border-box;
                    transform: rotateX(25deg); /* Tilted 2.5D board */
                    transform-style: preserve-3d;
                    position: relative;
                }

                .slots-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-template-rows: repeat(3, 90px); /* 90px slots */
                    gap: 12px 8px; /* row-gap, col-gap */
                    width: 100%;
                    transform-style: preserve-3d;
                }

                /* Sunken Slot Channel - No Flexbox to prevent horizontal alignment bugs */
                .slot-channel {
                    background: #150B0A; /* Sunken dark space */
                    border-radius: 12px;
                    border: 2px solid #2A1715;
                    box-shadow: 
                        inset 2px 4px 6px rgba(0,0,0,0.95),
                        0.5px 0.5px 0.5px rgba(255,255,255,0.1);
                    position: relative;
                    height: 100%;
                    cursor: pointer;
                    box-sizing: border-box;
                    transition: transform 0.15s;
                    transform-style: preserve-3d;
                }

                /* Glowing selection border */
                .slot-channel.selected {
                    outline: 3px solid #39FF14; /* neon green selection outline */
                    box-shadow: 
                        inset 2px 4px 6px rgba(0,0,0,0.95),
                        0 0 16px #39FF14;
                    transform: translateZ(10px) scale(1.02); /* push forward in 3D */
                    z-index: 10;
                }

                /* Shake error animation */
                .slot-channel.shake-error {
                    animation: slotShake 0.4s ease-in-out;
                }

                @keyframes slotShake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-4px); }
                    40%, 80% { transform: translateX(4px); }
                }

                /* 3D cylindrical coin styling matching the user's close-up graphic */
                .chip {
                    position: absolute;
                    width: 86%;
                    height: 22px; /* total cylinder thickness height (larger for 3D depth) */
                    border-radius: 50% / 25%; /* elliptical bottom radius matching cylinder perspective */
                    left: 7%;
                    box-shadow: 
                        inset 0 -3px 5px rgba(0,0,0,0.4),
                        0 4px 6px rgba(0, 0, 0, 0.4);
                    transition: bottom 0.22s cubic-bezier(0.25, 1, 0.5, 1), transform 0.22s, opacity 0.22s;
                    z-index: 2;
                    cursor: pointer;
                    transform-style: preserve-3d;
                }

                /* 2.5D Coin Top Surface Ellipse */
                .chip-top {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 11px; /* surface ellipse height */
                    border-radius: 50%; /* perfect circle/oval projection */
                    border: 1.5px solid rgba(255, 255, 255, 0.9); /* white circular border */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-kids);
                    font-size: 10px;
                    font-weight: 900;
                    color: #FFF;
                    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
                    box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.5);
                    box-sizing: border-box;
                }

                /* Selected/floating animation */
                .chip.floating {
                    animation: chipBob 1.2s infinite ease-in-out;
                }

                @keyframes chipBob {
                    0%, 100% { transform: scale(1.0); }
                    50% { transform: scale(1.06) translateY(-2px); }
                }

                /* Chip merging shake and glow */
                .chip.merging {
                    animation: coinMergeGlow 0.45s ease-in-out infinite;
                }

                @keyframes coinMergeGlow {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.08) translateY(-2px); filter: brightness(1.3); }
                }

                /* Mystery/Hidden Chip styling */
                .chip.hidden-chip {
                    background: #455A64 !important; /* dark side wall */
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4) !important;
                }

                .chip.hidden-chip .chip-top {
                    background: linear-gradient(to bottom, #78909C, #546E7A) !important;
                    border: 1.5px solid #37474F !important;
                    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.2);
                    color: #ECEFF1 !important;
                }

                /* Deal and actions dock */
                .actions-dock {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    max-width: 375px;
                    padding: 8px 6px;
                    box-sizing: border-box;
                    gap: 12px;
                }

                /* Big green Deal button matching screenshot */
                .deal-btn {
                    flex-grow: 2;
                    background: linear-gradient(to bottom, #4CAF50, #2E7D32);
                    border: 2px solid #1B5E20;
                    border-bottom: 5px solid #1B5E20;
                    border-radius: 25px;
                    color: white;
                    font-family: var(--font-kids);
                    font-size: 1.05rem;
                    font-weight: 900;
                    padding: 10px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    transition: transform 0.1s, border-bottom-width 0.1s;
                    outline: none;
                }

                .deal-btn:active {
                    transform: translateY(3px);
                    border-bottom-width: 2px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }

                .deal-btn.disabled {
                    background: linear-gradient(to bottom, #9E9E9E, #616161);
                    border-color: #424242;
                    border-bottom-width: 2px;
                    box-shadow: none;
                    pointer-events: none;
                    opacity: 0.7;
                }

                .control-btn {
                    flex-grow: 1;
                    background: linear-gradient(to bottom, #795548, #4E342E);
                    border: 2px solid #3E2723;
                    border-bottom: 4px solid #3E2723;
                    border-radius: 20px;
                    color: white;
                    font-family: var(--font-kids);
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 8px 12px;
                    cursor: pointer;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                    outline: none;
                    transition: transform 0.1s;
                }

                .control-btn:active {
                    transform: translateY(2px);
                    border-bottom-width: 2px;
                }

                .control-btn.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Floating Text Popup (Cool!, Amazing!) */
                .merge-popup-text {
                    position: absolute;
                    font-family: var(--font-kids);
                    font-weight: 900;
                    font-size: 1.6rem;
                    color: #FFEB3B;
                    text-shadow: 0 4px 0 #E65100, 0 8px 12px rgba(0,0,0,0.4);
                    pointer-events: none;
                    z-index: 100;
                    animation: popupFloat 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes popupFloat {
                    0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
                    40% { transform: translate(-50%, -5px) scale(1); }
                    100% { transform: translate(-50%, -50px) scale(0.8); opacity: 0; }
                }

                /* Particles */
                .chip-particle {
                    position: absolute;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 101;
                    animation: particleFloat 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }

                @keyframes particleFloat {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2);
                        opacity: 0;
                    }
                }

                /* Falling Victory Star */
                .cs-victory-star {
                    position: absolute;
                    bottom: 0;
                    font-size: 1.8rem;
                    pointer-events: none;
                    z-index: 100;
                    animation: floatUpStar 2.0s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }

                @keyframes floatUpStar {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-460px) rotate(var(--rot)) scale(1.3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        // Setup HTML Layout Skeleton
        let html = `
            <div class="game-coin-sort-layout">
                <h2 class="game-title" style="color: #FFB74D;">🪙 فرز ودمج العملات 🪙</h2>
                <p class="coin-sort-instructions" id="csInstructionText">رتب العملات! ادمج 10 عملات متشابهة لتندمج وتصنع فئة أعلى.</p>
                
                <div class="coin-sort-hud">
                    <div class="hud-info">
                        <div class="hud-level-title" id="csLevelTitle">مستوى 1</div>
                        <div class="hud-targets-list" id="csTargetsList">
                            <!-- Targets list generated here -->
                        </div>
                    </div>
                    
                    <div class="hud-right">
                        <div class="score-badge" id="csScoreBadge">النقاط: 0</div>
                    </div>
                </div>

                <div class="board-tray-wrapper">
                    <div class="board-tray">
                        <div class="slots-grid" id="csSlotsGrid">
                            <!-- 15 slots generated dynamically -->
                        </div>
                    </div>
                </div>

                <div class="actions-dock">
                    <button class="control-btn disabled" id="csUndoBtn">تراجع ↩️</button>
                    <button class="deal-btn" id="csDealBtn">
                        Deal 🪙 توزيع
                    </button>
                    <button class="control-btn" id="csResetBtn">إعادة 🔄</button>
                </div>

                <!-- Win Modal -->
                <div id="csWinModal" class="game-modal">
                    <div class="modal-content bounce-anim" style="border-color: #FFB74D;">
                        <h3 id="csWinTitle" style="color: #E65100;">🎉 عمل رائع يا بطل! 🎉</h3>
                        <p id="csWinMessage">لقد نجحت في دمج العملات المطلوبة بذكاء!</p>
                        <button class="menu-btn restart-btn" id="csNextLevelBtn" style="margin: 20px auto 0; background-color: #4CAF50; box-shadow: 0 5px 0 #2E7D32;">المستوى التالي ➡️</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const slotsGrid = document.getElementById('csSlotsGrid');
        const undoBtn = document.getElementById('csUndoBtn');
        const dealBtn = document.getElementById('csDealBtn');
        const resetBtn = document.getElementById('csResetBtn');
        const winModal = document.getElementById('csWinModal');
        const nextLevelBtn = document.getElementById('csNextLevelBtn');
        const levelTitle = document.getElementById('csLevelTitle');
        const targetsList = document.getElementById('csTargetsList');
        const instructionText = document.getElementById('csInstructionText');
        const scoreBadge = document.getElementById('csScoreBadge');
        const winTitle = document.getElementById('csWinTitle');
        const winMessage = document.getElementById('csWinMessage');

        // Helper: Shuffle
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Apply 3D Cylinder colors (surface light and side wall dark) matching user graphic
        function applyChipColor(el, val, topEl) {
            let bg, baseColor;
            if (val === 1) {
                bg = 'linear-gradient(to bottom, #CFD8DC, #90A4AE)'; // Silver top
                baseColor = '#455A64'; // slate grey base
            } else if (val === 2) {
                bg = 'linear-gradient(to bottom, #FFA726, #FB8C00)'; // Orange top
                baseColor = '#E65100'; // dark orange base
            } else if (val === 5) {
                bg = 'linear-gradient(to bottom, #EF5350, #E53935)'; // Red top
                baseColor = '#B71C1C'; // dark red base
            } else if (val === 10) {
                bg = 'linear-gradient(to bottom, #4FC3F7, #29B6F6)'; // Blue top
                baseColor = '#01579B'; // dark blue base
            } else if (val === 20) {
                bg = 'linear-gradient(to bottom, #81C784, #66BB6A)'; // Green top
                baseColor = '#1B5E20'; // dark green base
            } else if (val === 100) {
                bg = 'linear-gradient(to bottom, #FFE082, #FFC107)'; // Gold top
                baseColor = '#FF8F00'; // dark gold base
            } else {
                bg = 'linear-gradient(to bottom, #E040FB, #D500F9)';
                baseColor = '#4A148C';
            }
            
            el.style.background = baseColor;
            if (topEl) {
                topEl.style.background = bg;
            }
        }

        function getChipColor(val) {
            if (val === 1) return '#CFD8DC';
            if (val === 2) return '#FFA726';
            if (val === 5) return '#EF5350';
            if (val === 10) return '#4FC3F7';
            if (val === 20) return '#81C784';
            if (val === 100) return '#FFE082';
            return '#E040FB';
        }

        function getNextChipValue(val) {
            if (val === 1) return 2;
            if (val === 2) return 5;
            if (val === 5) return 10;
            if (val === 10) return 20;
            if (val === 20) return 100;
            return 100;
        }

        // Save State for Undo
        function pushHistory() {
            const platesCopy = plates.map(p => p.map(c => ({ ...c })));
            history.push({
                plates: platesCopy,
                score: levelScore,
                targets: { ...completedTargets }
            });
            undoBtn.classList.remove('disabled');
        }

        // Generate Level Setup
        function generateLevelSetup(config) {
            const numSlots = 15;
            let setup = Array.from({ length: numSlots }, () => []);

            // Pool of chips defined in configs
            let pool = [];
            config.initialChips.forEach(grp => {
                for (let i = 0; i < grp.count; i++) {
                    pool.push({ value: grp.val, hidden: grp.hidden });
                }
            });

            shuffleArray(pool);

            // Place in the first 10 slots, leaving 5 slots empty for moves
            const fillableSlots = 10;
            let slotIdx = 0;
            pool.forEach(chip => {
                setup[slotIdx].push(chip);
                slotIdx = (slotIdx + 1) % fillableSlots;
            });

            return setup;
        }

        // Initialize Level
        function startLevel() {
            const config = levelConfigs[level - 1];
            plates = generateLevelSetup(config);
            selectedPlateIdx = null;
            levelScore = 0;
            completedTargets = {};
            history = [];
            isAnimating = false;

            config.targets.forEach(t => {
                completedTargets[t] = false;
            });

            levelTitle.innerText = `مستوى ${level}: ${config.title}`;
            instructionText.innerText = config.instruction;
            winModal.style.display = 'none';
            undoBtn.classList.add('disabled');
            dealBtn.classList.remove('disabled');

            updateHUD();
            renderPlates();
        }

        // Update HUD
        function updateHUD() {
            const config = levelConfigs[level - 1];
            scoreBadge.innerText = `النقاط: ${levelScore}`;

            // Draw target checkboxes
            targetsList.innerHTML = '';
            config.targets.forEach(t => {
                const badge = document.createElement('div');
                badge.className = `target-chip-badge ${completedTargets[t] ? 'completed' : ''}`;
                
                const dot = document.createElement('span');
                dot.className = 'target-chip-circle';
                dot.style.backgroundColor = getChipColor(t);
                
                badge.appendChild(dot);
                badge.appendChild(document.createTextNode(` فئة ${t}`));
                
                targetsList.appendChild(badge);
            });
        }

        // Reveal hidden top chips
        function revealHiddenChips() {
            let revealedAny = false;
            plates.forEach((plate, idx) => {
                if (plate.length > 0) {
                    const topChip = plate[plate.length - 1];
                    if (topChip.hidden) {
                        topChip.hidden = false;
                        revealedAny = true;
                        
                        // Small animation on top revealed chip
                        setTimeout(() => {
                            const slotEl = slotsGrid.querySelector(`[data-index="${idx}"]`);
                            if (slotEl) {
                                const chipEls = slotEl.querySelectorAll('.chip');
                                const topChipEl = chipEls[chipEls.length - 1];
                                if (topChipEl) {
                                    topChipEl.style.transform = 'scale(1.2)';
                                    setTimeout(() => {
                                        topChipEl.style.transform = 'scale(1)';
                                    }, 180);
                                }
                            }
                        }, 40);
                    }
                }
            });

            if (revealedAny) {
                if (window.sound) {
                    window.sound.playPop();
                }
                renderPlates();
            }
        }

        // Render slots and stacks - PLATES ARE FULLY ALIGNED WITHOUT FLEX CONSTRAINTS
        function renderPlates() {
            slotsGrid.innerHTML = '';

            plates.forEach((plateChips, idx) => {
                const slotEl = document.createElement('div');
                slotEl.className = 'slot-channel';
                slotEl.setAttribute('data-index', idx);

                if (selectedPlateIdx === idx) {
                    slotEl.classList.add('selected');
                }

                // If selected, figure out which top chips bob/float
                let floatCount = 0;
                let topVal = null;
                if (selectedPlateIdx === idx && plateChips.length > 0) {
                    const lastChip = plateChips[plateChips.length - 1];
                    if (!lastChip.hidden) {
                        topVal = lastChip.value;
                        for (let k = plateChips.length - 1; k >= 0; k--) {
                            if (!plateChips[k].hidden && plateChips[k].value === topVal) {
                                floatCount++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                plateChips.forEach((chip, cIdx) => {
                    const chipEl = document.createElement('div');
                    chipEl.className = 'chip';

                    const chipTopEl = document.createElement('div');
                    chipTopEl.className = 'chip-top';
                    chipEl.appendChild(chipTopEl);

                    if (chip.hidden) {
                        chipEl.classList.add('hidden-chip');
                        chipTopEl.innerText = '?';
                    } else {
                        applyChipColor(chipEl, chip.value, chipTopEl);
                        
                        // ONLY print the value on the TOP-MOST coin in the slot, matching the user graphic!
                        const isTopMostInSlot = (cIdx === plateChips.length - 1);
                        if (isTopMostInSlot) {
                            chipTopEl.innerText = chip.value;
                        } else {
                            chipTopEl.innerText = ''; // Hide value for covered coins
                        }
                    }

                    // Calculate bottom positioning (overlapping)
                    let bottomVal = 4 + cIdx * 7; 

                    const isFloating = (selectedPlateIdx === idx && cIdx >= plateChips.length - floatCount);
                    if (isFloating) {
                        bottomVal += 12; // lift up
                        chipEl.classList.add('floating');
                    }

                    chipEl.style.bottom = `${bottomVal}px`;
                    slotEl.appendChild(chipEl);
                });

                slotsGrid.appendChild(slotEl);
            });
        }

        // Particle sparks
        function spawnSparks(x, y, color, count) {
            const layout = container.querySelector('.game-coin-sort-layout');
            if (!layout) return;

            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'chip-particle';
                p.style.background = color || '#FFD700';
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;

                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 40 + 12;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist - 18;

                p.style.setProperty('--dx', `${dx}px`);
                p.style.setProperty('--dy', `${dy}px`);

                layout.appendChild(p);
                setTimeout(() => p.remove(), 700);
            }
        }

        // Visual text popup ("Cool!", "Combo x2!")
        function spawnTextPopup(x, y, text) {
            const layout = container.querySelector('.game-coin-sort-layout');
            if (!layout) return;

            const pop = document.createElement('div');
            pop.className = 'merge-popup-text';
            pop.innerText = text;
            pop.style.left = `${x}px`;
            pop.style.top = `${y}px`;

            const colors = ['#FFEB3B', '#39FF14', '#FF4081', '#00E5FF'];
            pop.style.color = colors[Math.floor(Math.random() * colors.length)];

            layout.appendChild(pop);
            setTimeout(() => pop.remove(), 1200);
        }

        // Helper: Calculate positions relative to board-tray for 3D perspective animation alignment
        function getRelativePos(element, parent) {
            let x = 0, y = 0;
            let el = element;
            while (el && el !== parent) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }
            return { x, y };
        }

        // Slide animation for moving chips inside the 3D tilted board tray (Fully fixed to avoid horizontal jumping!)
        function animateChipMove(srcIdx, destIdx, chipValue, count, callback) {
            const trayEl = container.querySelector('.board-tray');
            const srcEl = slotsGrid.querySelector(`[data-index="${srcIdx}"]`);
            const destEl = slotsGrid.querySelector(`[data-index="${destIdx}"]`);
            if (!srcEl || !destEl || !trayEl) {
                callback();
                return;
            }

            const srcPos = getRelativePos(srcEl, trayEl);
            const destPos = getRelativePos(destEl, trayEl);

            // Create temporary block container identical in size to the slots
            const animBlock = document.createElement('div');
            animBlock.style.position = 'absolute';
            animBlock.style.left = `${srcPos.x}px`;
            animBlock.style.top = `${srcPos.y}px`;
            animBlock.style.width = `${srcEl.offsetWidth}px`;
            animBlock.style.height = `${srcEl.offsetHeight}px`;
            animBlock.style.zIndex = '100';
            animBlock.style.pointerEvents = 'none';
            animBlock.style.transition = 'all 0.32s cubic-bezier(0.25, 1, 0.4, 1)';
            animBlock.style.transformStyle = 'preserve-3d';

            const srcCount = plates[srcIdx].length;
            const destCount = plates[destIdx].length;

            for (let i = 0; i < count; i++) {
                const dummy = document.createElement('div');
                dummy.className = 'chip';

                const dummyTop = document.createElement('div');
                dummyTop.className = 'chip-top';
                dummy.appendChild(dummyTop);

                applyChipColor(dummy, chipValue, dummyTop);
                
                // Show number on the top-most flying coin
                if (i === count - 1) {
                    dummyTop.innerText = chipValue;
                } else {
                    dummyTop.innerText = '';
                }
                
                // Inherits left: 7% and width: 86% from the .chip style sheet (no manual translation offsets!)
                const startBottom = 4 + (srcCount - count + i) * 7;
                dummy.style.bottom = `${startBottom + 12}px`; // lifted
                dummy.style.transition = 'bottom 0.32s cubic-bezier(0.25, 1, 0.4, 1)';
                
                animBlock.appendChild(dummy);
            }

            trayEl.appendChild(animBlock);

            // Reflow
            animBlock.offsetHeight;

            // Move the tray block to destination slot
            animBlock.style.left = `${destPos.x}px`;
            animBlock.style.top = `${destPos.y}px`;

            // Animate each dummy chip down to its stacked height in the destination slot
            const dummies = animBlock.querySelectorAll('.chip');
            for (let i = 0; i < count; i++) {
                const endBottom = 4 + (destCount + i) * 7;
                dummies[i].style.bottom = `${endBottom}px`;
            }

            if (window.sound) {
                window.sound.playClick();
            }

            setTimeout(() => {
                animBlock.remove();
                callback();
            }, 330);
        }

        // Deal Button handler
        function executeDeal() {
            if (isAnimating) return;

            pushHistory();

            let emptySlots = [];
            plates.forEach((p, idx) => {
                if (p.length === 0) emptySlots.push(idx);
            });

            const config = levelConfigs[level - 1];
            const dealValues = config.initialChips.map(c => c.val);

            isAnimating = true;

            const dealBtnRect = dealBtn.getBoundingClientRect();
            const layoutRect = container.querySelector('.game-coin-sort-layout').getBoundingClientRect();
            const startX = dealBtnRect.left - layoutRect.left + dealBtnRect.width / 2;
            const startY = dealBtnRect.top - layoutRect.top + dealBtnRect.height / 2;

            let dealPlatesList = [];
            if (emptySlots.length > 0) {
                shuffleArray(emptySlots);
                const count = Math.min(emptySlots.length, 3);
                for (let i = 0; i < count; i++) {
                    const val = dealValues[Math.floor(Math.random() * dealValues.length)];
                    dealPlatesList.push({ plateIdx: emptySlots[i], val: val, count: 4 });
                }
            } else {
                let nonFullSlots = [];
                plates.forEach((p, idx) => {
                    if (p.length > 0 && p.length <= 6 && !p[p.length - 1].hidden) {
                        nonFullSlots.push(idx);
                    }
                });

                if (nonFullSlots.length > 0) {
                    shuffleArray(nonFullSlots);
                    const count = Math.min(nonFullSlots.length, 3);
                    for (let i = 0; i < count; i++) {
                        const idx = nonFullSlots[i];
                        const topVal = plates[idx][plates[idx].length - 1].value;
                        dealPlatesList.push({ plateIdx: idx, val: topVal, count: 2 });
                    }
                }
            }

            if (dealPlatesList.length === 0) {
                isAnimating = false;
                triggerPlateError(null);
                return;
            }

            let dealAnimCount = dealPlatesList.length;
            dealPlatesList.forEach((deal, idx) => {
                setTimeout(() => {
                    const slotEl = slotsGrid.querySelector(`[data-index="${deal.plateIdx}"]`);
                    if (!slotEl) return;
                    const slotRect = slotEl.getBoundingClientRect();
                    const endX = slotRect.left - layoutRect.left + slotRect.width / 2;
                    const endY = slotRect.top - layoutRect.top + slotRect.height / 2;

                    const dummy = document.createElement('div');
                    dummy.className = 'chip';

                    const dummyTop = document.createElement('div');
                    dummyTop.className = 'chip-top';
                    dummy.appendChild(dummyTop);

                    applyChipColor(dummy, deal.val, dummyTop);
                    dummyTop.innerText = deal.val;
                    
                    dummy.style.position = 'absolute';
                    dummy.style.left = `${startX}px`;
                    dummy.style.top = `${startY}px`;
                    dummy.style.transform = 'translate(-50%, -50%) scale(0.6)';
                    dummy.style.zIndex = '100';
                    dummy.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

                    const layout = container.querySelector('.game-coin-sort-layout');
                    layout.appendChild(dummy);

                    // Reflow
                    dummy.offsetHeight;

                    dummy.style.left = `${endX}px`;
                    dummy.style.top = `${endY}px`;
                    dummy.style.transform = 'translate(-50%, -50%) scale(1.0)';

                    if (window.sound) {
                        window.sound.playPop();
                    }

                    setTimeout(() => {
                        dummy.remove();
                        for (let k = 0; k < deal.count; k++) {
                            plates[deal.plateIdx].push({ value: deal.val, hidden: false });
                        }
                        renderPlates();

                        dealAnimCount--;
                        if (dealAnimCount === 0) {
                            checkAndRunMerges(() => {
                                evaluateLevelState();
                                isAnimating = false;
                            });
                        }
                    }, 410);

                }, idx * 100);
            });
        }

        // Cascading Merge scanner
        function checkAndRunMerges(callback) {
            let mergePlateIdx = -1;
            let mergeValue = -1;

            for (let i = 0; i < plates.length; i++) {
                const p = plates[i];
                if (p.length >= 10) {
                    const lastChip = p[p.length - 1];
                    if (!lastChip.hidden) {
                        const topVal = lastChip.value;
                        let count = 0;
                        for (let k = p.length - 1; k >= 0; k--) {
                            if (!p[k].hidden && p[k].value === topVal) count++;
                            else break;
                        }
                        if (count >= 10) {
                            mergePlateIdx = i;
                            mergeValue = topVal;
                            break;
                        }
                    }
                }
            }

            if (mergePlateIdx === -1) {
                callback();
                return;
            }

            isAnimating = true;
            runMergeSequence(mergePlateIdx, mergeValue, () => {
                checkAndRunMerges(callback);
            });
        }

        // Run merge animations
        function runMergeSequence(plateIdx, chipValue, callback) {
            const slotEl = slotsGrid.querySelector(`[data-index="${plateIdx}"]`);
            const chipEls = Array.from(slotEl.querySelectorAll('.chip')).slice(-10);

            if (window.sound) {
                window.sound.playPop();
            }

            chipEls.forEach(el => el.classList.add('merging'));

            const slotRect = slotEl.getBoundingClientRect();
            const layoutRect = container.querySelector('.game-coin-sort-layout').getBoundingClientRect();
            const px = slotRect.left - layoutRect.left + slotRect.width / 2;
            const py = slotRect.top - layoutRect.top + slotRect.height / 2;

            const praiseWords = ['Cool!', 'Amazing!', 'Super!', 'Perfect!', 'Great!'];
            const txt = praiseWords[Math.floor(Math.random() * praiseWords.length)];
            spawnTextPopup(px, py - 30, txt);

            setTimeout(() => {
                chipEls.forEach((el) => {
                    el.style.transition = 'all 0.22s ease-in';
                    el.style.bottom = '4px';
                    el.style.transform = 'scale(0.1)';
                    el.style.opacity = '0';
                });

                setTimeout(() => {
                    const p = plates[plateIdx];
                    p.splice(p.length - 10, 10);

                    const nextVal = getNextChipValue(chipValue);
                    p.push({ value: nextVal, hidden: false });

                    levelScore += (chipValue * 10);
                    
                    if (nextVal in completedTargets) {
                        completedTargets[nextVal] = true;
                    }

                    updateHUD();
                    renderPlates();

                    // Sparks at merge point
                    spawnSparks(px, py + 10, getChipColor(nextVal), 12);

                    if (window.sound) {
                        window.sound.playSuccess();
                    }

                    revealHiddenChips();
                    callback();

                }, 230);

            }, 420);
        }

        // Check victory
        function evaluateLevelState() {
            let allDone = true;
            for (let t in completedTargets) {
                if (!completedTargets[t]) {
                    allDone = false;
                    break;
                }
            }

            if (allDone) {
                if (window.sound) {
                    window.sound.playSuccess();
                }
                const config = levelConfigs[level - 1];
                if (level === 10) {
                    winTitle.innerText = '🏆 بطل فرز العملات الأسطوري! 🏆';
                    winMessage.innerText = 'تهانينا يا بطل الأذكياء! لقد تفوقت في جميع المستويات وحققت الكأس الذهبية الكبرى!';
                    nextLevelBtn.innerText = 'العب من جديد 🔄';
                } else {
                    winTitle.innerText = '🎉 عمل رائع يا بطل! 🎉';
                    winMessage.innerText = `لقد نجحت في فتح الرقاقات ودمج الفئات المطلوبة بذكاء خارق!`;
                    nextLevelBtn.innerText = 'المستوى التالي ➡️';
                }
                winModal.style.display = 'flex';
                spawnVictoryStars();
            }
        }

        function spawnVictoryStars() {
            const emojis = ['⭐', '✨', '🪙', '🏆', '🎉'];
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    if (winModal.style.display === 'none') return;
                    const p = document.createElement('div');
                    p.className = 'cs-victory-star';
                    p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                    p.style.left = `${Math.floor(Math.random() * 85) + 8}%`;
                    p.style.setProperty('--rot', `${Math.floor(Math.random() * 360) - 180}deg`);

                    const layout = container.querySelector('.game-coin-sort-layout');
                    if (layout) {
                        layout.appendChild(p);
                        setTimeout(() => p.remove(), 2000);
                    }
                }, i * 90);
            }
        }

        function triggerPlateError(idx) {
            if (window.sound) {
                window.sound.playFail();
            }
            if (idx !== null) {
                const slotEl = slotsGrid.querySelector(`[data-index="${idx}"]`);
                if (slotEl) {
                    slotEl.classList.add('shake-error');
                    setTimeout(() => slotEl.classList.remove('shake-error'), 400);
                }
            }
        }

        // Tap interactions
        slotsGrid.addEventListener('click', (e) => {
            if (isAnimating) return;

            const slotEl = e.target.closest('.slot-channel');
            if (!slotEl) return;

            const clickedIdx = parseInt(slotEl.getAttribute('data-index'));
            const plateChips = plates[clickedIdx];

            if (selectedPlateIdx === null) {
                // 1. Select
                if (plateChips.length > 0) {
                    const lastChip = plateChips[plateChips.length - 1];
                    if (lastChip.hidden) {
                        triggerPlateError(clickedIdx);
                    } else {
                        selectedPlateIdx = clickedIdx;
                        if (window.sound) {
                            window.sound.playClick();
                        }
                        renderPlates();
                    }
                } else {
                    triggerPlateError(clickedIdx);
                }
            } else {
                // 2. Move or Deselect
                if (selectedPlateIdx === clickedIdx) {
                    selectedPlateIdx = null;
                    if (window.sound) {
                        window.sound.playClick();
                    }
                    renderPlates();
                } else {
                    const srcPlate = plates[selectedPlateIdx];
                    const destPlate = plates[clickedIdx];

                    const chipValue = srcPlate[srcPlate.length - 1].value;
                    let selectCount = 0;
                    for (let k = srcPlate.length - 1; k >= 0; k--) {
                        if (!srcPlate[k].hidden && srcPlate[k].value === chipValue) {
                            selectCount++;
                        } else {
                            break;
                        }
                    }

                    const destCapacity = 10 - destPlate.length;
                    const destTopVal = destPlate.length > 0 ? destPlate[destPlate.length - 1].value : null;
                    const destTopHidden = destPlate.length > 0 ? destPlate[destPlate.length - 1].hidden : false;

                    const isValidMove = (destTopVal === null || (!destTopHidden && destTopVal === chipValue));

                    if (isValidMove && destCapacity > 0) {
                        const moveAmount = Math.min(selectCount, destCapacity);

                        isAnimating = true;
                        pushHistory();

                        const oldSrcIdx = selectedPlateIdx;
                        selectedPlateIdx = null;
                        renderPlates();

                        // Slide inside 2.5D plane
                        animateChipMove(oldSrcIdx, clickedIdx, chipValue, moveAmount, () => {
                            const popped = srcPlate.splice(srcPlate.length - moveAmount, moveAmount);
                            destPlate.push(...popped);

                            renderPlates();

                            checkAndRunMerges(() => {
                                revealHiddenChips();
                                evaluateLevelState();
                                isAnimating = false;
                            });
                        });

                    } else {
                        triggerPlateError(clickedIdx);
                        selectedPlateIdx = null;
                        renderPlates();
                    }
                }
            }
        });

        // Undo
        undoBtn.addEventListener('click', () => {
            if (isAnimating || history.length === 0) return;

            if (window.sound) {
                window.sound.playClick();
            }

            const prevState = history.pop();
            plates = prevState.plates;
            levelScore = prevState.score;
            completedTargets = prevState.targets;
            selectedPlateIdx = null;

            if (history.length === 0) {
                undoBtn.classList.add('disabled');
            }

            updateHUD();
            renderPlates();
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            if (isAnimating) return;
            if (window.sound) {
                window.sound.playFlip();
            }
            startLevel();
        });

        // Deal Button
        dealBtn.addEventListener('click', executeDeal);

        // Next Level
        nextLevelBtn.addEventListener('click', () => {
            if (window.sound) {
                window.sound.playFlip();
            }
            if (level >= 10) {
                level = 1;
            } else {
                level++;
            }
            startLevel();
        });

        // Load level 1 to begin
        startLevel();
    };
})();
