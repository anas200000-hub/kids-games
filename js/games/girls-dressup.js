// Game 23: Girls Dress Up (عالم الموضة للأميرات - تصميم مطابقة الكاروهات والألوان الستة)
window.initGirlsDressupGame = function (container) {
    // Game State
    let state = {
        activeCategory: 'tops', // shoes, bottoms, tops, hair, eyes
        activeSubCategory: 'sub1', // sub1, sub2 (index-based to avoid selector crashes)
        selections: {
            body: 'skin_default',
            eyes: 'eyes1',
            hair: 'hair3', // Curly hair with gold headband by default
            tops: 'top1',  // Pink T-shirt by default
            bottoms: 'bottom1', // White shorts by default
            shoes: 'shoe1'  // Slipper by default
        },
        colors: {
            eyes: '#0073b7',  // Blue eyes default
            hair: '#fcd37f',  // Golden blonde default
            tops: '#dd4b39',  // Red/Pink top default
            bottoms: '#ffffff', // White bottoms default
            shoes: '#dd4b39'  // Red shoes default
        },
        soundOn: true
    };

    // The 6 Flat colors specified by user
    const flatColorsList = [
        '#ffffff', // White
        '#00a65a', // Green
        '#f39c12', // Yellow
        '#111111', // Black
        '#dd4b39', // Red
        '#0073b7'  // Blue
    ];

    // Fixed Warm Tan skin color (No skin color selection)
    const fixedSkinColor = '#be8b6f';

    // Database of items (8 items per category matching the rules)
    const database = {
        eyes: [
            { 
                id: 'eyes1', 
                name: 'عيون حيوية زرقاء', 
                svg: (color) => `<g>
                    <!-- White Scleras -->
                    <ellipse cx="79" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    
                    <!-- Irises -->
                    <ellipse cx="79" cy="88" rx="7.5" ry="7.5" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="7.5" ry="7.5" fill="${color}"/>
                    <path d="M 72.5,90 A 6.5,6.5 0 0,0 84.5,90 A 6.5,6.5 0 0,1 72.5,90 Z" fill="#ffffff" opacity="0.45"/>
                    <path d="M 115.5,90 A 6.5,6.5 0 0,0 126.5,90 A 6.5,6.5 0 0,1 115.5,90 Z" fill="#ffffff" opacity="0.45"/>
                    
                    <!-- Pupils -->
                    <ellipse cx="79" cy="87.5" rx="4" ry="4" fill="#111111"/>
                    <ellipse cx="121" cy="87.5" rx="4" ry="4" fill="#111111"/>
                    <circle cx="76.5" cy="84.5" r="2.2" fill="#ffffff"/>
                    <circle cx="118.5" cy="84.5" r="2.2" fill="#ffffff"/>
                    
                    <!-- Eyelashes -->
                    <path d="M 66,88 C 70,77 88,77 92,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M 108,88 C 112,77 130,77 134,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M 67,74 Q 80,68 91,74" stroke="#4a2d1b" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M 109,74 Q 122,67 133,74" stroke="#4a2d1b" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>` 
            },
            { 
                id: 'eyes2', 
                name: 'عيون حالمة خجولة', 
                svg: (color) => `<g>
                    <ellipse cx="79" cy="88" rx="9" ry="9" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="9" ry="9" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="79" cy="88" rx="6.8" ry="6.8" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="6.8" ry="6.8" fill="${color}"/>
                    <circle cx="77" cy="85.5" r="2" fill="#ffffff"/>
                    <circle cx="119" cy="85.5" r="2" fill="#ffffff"/>
                    <path d="M 67,87 C 72,80 86,80 91,87" stroke="#1c2024" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M 109,87 C 114,80 128,80 133,87" stroke="#1c2024" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>` 
            },
            { 
                id: 'eyes3', 
                name: 'عيون مغلقة ضاحكة', 
                svg: () => `<g>
                    <path d="M 66,88 Q 80,98 94,88" stroke="#1c2024" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <path d="M 106,88 Q 120,98 134,88" stroke="#1c2024" stroke-width="3" fill="none" stroke-linecap="round"/>
                </g>` 
            },
            { 
                id: 'eyes4', 
                name: 'غمزة حيوية مرحة', 
                svg: (color) => `<g>
                    <!-- Left eye closed -->
                    <path d="M 66,88 Q 80,98 94,88" stroke="#1c2024" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <!-- Right eye open -->
                    <ellipse cx="121" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="7.5" ry="7.5" fill="${color}"/>
                    <ellipse cx="121" cy="87.5" rx="4" ry="4" fill="#111111"/>
                    <circle cx="118.5" cy="84.5" r="2.2" fill="#ffffff"/>
                    <path d="M 108,88 C 112,77 130,77 134,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>` 
            },
            { 
                id: 'eyes5', 
                name: 'عيون النجمة البراقة', 
                svg: (color) => `<g>
                    <ellipse cx="79" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="79" cy="88" rx="8.2" ry="8.2" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="8.2" ry="8.2" fill="${color}"/>
                    <!-- Stars highlights -->
                    <text x="75" y="92" font-size="9" fill="#ffffff" font-weight="bold">★</text>
                    <text x="117" y="92" font-size="9" fill="#ffffff" font-weight="bold">★</text>
                    <path d="M 66,88 C 70,77 88,77 92,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M 108,88 C 112,77 130,77 134,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>`
            },
            { 
                id: 'eyes6', 
                name: 'عيون القلب اللطيفة', 
                svg: (color) => `<g>
                    <ellipse cx="79" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="79" cy="88" rx="8.2" ry="8.2" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="8.2" ry="8.2" fill="${color}"/>
                    <!-- Heart highlights -->
                    <text x="75" y="92" font-size="9" fill="#ffffff">❤</text>
                    <text x="117" y="92" font-size="9" fill="#ffffff">❤</text>
                    <path d="M 66,88 C 70,77 88,77 92,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M 108,88 C 112,77 130,77 134,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>`
            },
            { 
                id: 'eyes7', 
                name: 'عيون حاسمة غاضبة لطيفة', 
                svg: (color) => `<g>
                    <ellipse cx="79" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="10" ry="10" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="79" cy="88" rx="7.8" ry="7.8" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="7.8" ry="7.8" fill="${color}"/>
                    <circle cx="76.5" cy="84.5" r="2.2" fill="#ffffff"/>
                    <circle cx="118.5" cy="84.5" r="2.2" fill="#ffffff"/>
                    <!-- Angled sharp eyebrows for determined look -->
                    <path d="M 66,85 L 90,89" stroke="#1c2024" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 134,85 L 110,89" stroke="#1c2024" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 66,72 L 90,78" stroke="#4a2d1b" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M 134,72 L 110,78" stroke="#4a2d1b" stroke-width="2.5" stroke-linecap="round"/>
                </g>`
            },
            { 
                id: 'eyes8', 
                name: 'عيون الفرح الدائرية', 
                svg: (color) => `<g>
                    <ellipse cx="79" cy="88" rx="10.5" ry="10.5" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="121" cy="88" rx="10.5" ry="10.5" fill="#ffffff" stroke="#222" stroke-width="0.5"/>
                    <ellipse cx="79" cy="88" rx="8.5" ry="8.5" fill="${color}"/>
                    <ellipse cx="121" cy="88" rx="8.5" ry="8.5" fill="${color}"/>
                    <circle cx="79" cy="87.5" rx="5" ry="5" fill="#1c2024"/>
                    <circle cx="121" cy="87.5" rx="5" ry="5" fill="#1c2024"/>
                    <circle cx="76.5" cy="84.5" r="2.8" fill="#ffffff"/>
                    <circle cx="81.5" cy="91.5" r="1.3" fill="#ffffff"/>
                    <circle cx="118.5" cy="84.5" r="2.8" fill="#ffffff"/>
                    <circle cx="123.5" cy="91.5" r="1.3" fill="#ffffff"/>
                    <path d="M 65,88 C 70,76 88,76 93,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M 107,88 C 112,76 130,76 135,88" stroke="#1c2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>`
            }
        ],
        hair: [
            {
                id: 'hair1',
                name: 'شعر منسدل طويل ناعم',
                // Back layer: full hair body behind head
                backSvg: (color) => `<g>
                    <!-- Long straight back hair falling behind body -->
                    <path d="M 67,62 C 55,55 50,70 52,90 C 48,100 44,130 46,155 C 48,170 56,178 62,180 L 68,180 C 64,165 56,140 58,115 C 60,90 62,68 67,62 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 133,62 C 145,55 150,70 148,90 C 152,100 156,130 154,155 C 152,170 144,178 138,180 L 132,180 C 136,165 144,140 142,115 C 140,90 138,68 133,62 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <!-- Crown cap behind -->
                    <path d="M 67,62 C 70,46 80,38 100,38 C 120,38 130,46 133,62 C 130,54 118,50 100,50 C 82,50 70,54 67,62 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                </g>`,
                // Front layer: fringe/bang over forehead
                frontSvg: (color) => `<g>
                    <!-- Side strands in front of ears -->
                    <path d="M 66,70 C 60,80 58,100 60,115 C 62,108 64,90 66,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 134,70 C 140,80 142,100 140,115 C 138,108 136,90 134,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Bang across forehead -->
                    <path d="M 68,68 C 74,56 88,56 93,68 C 93,68 96,58 100,56 C 104,58 107,68 107,68 C 112,56 126,56 132,68 Q 100,78 68,68 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 72,64 Q 100,54 128,64 Q 100,58 72,64 Z" fill="white" opacity="0.3"/>
                </g>`
            },
            {
                id: 'hair2',
                name: 'تسريحة كعكتين (بانز)',
                backSvg: (color) => `<g>
                    <!-- Left bun -->
                    <circle cx="67" cy="56" r="17" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <circle cx="67" cy="56" r="17" fill="url(#shadowOverlay)" opacity="0.4"/>
                    <!-- Right bun -->
                    <circle cx="133" cy="56" r="17" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <circle cx="133" cy="56" r="17" fill="url(#shadowOverlay)" opacity="0.4"/>
                    <!-- Crown base connecting buns -->
                    <path d="M 67,65 C 72,55 82,52 100,52 C 118,52 128,55 133,65 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Bow ribbons -->
                    <path d="M 58,50 Q 67,58 60,58 Q 56,55 58,50 Z" fill="#ff4081"/>
                    <path d="M 76,50 Q 67,58 74,58 Q 78,55 76,50 Z" fill="#ff4081"/>
                    <path d="M 124,50 Q 133,58 126,58 Q 122,55 124,50 Z" fill="#ff4081"/>
                    <path d="M 142,50 Q 133,58 140,58 Q 144,55 142,50 Z" fill="#ff4081"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <!-- Side pieces in front of ears -->
                    <path d="M 66,72 C 60,82 58,100 60,112 C 62,106 64,88 66,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 134,72 C 140,82 142,100 140,112 C 138,106 136,88 134,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Forehead band -->
                    <path d="M 68,70 Q 100,60 132,70 Q 118,74 100,74 Q 82,74 68,70 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                </g>`
            },
            {
                id: 'hair3',
                name: 'شعر كيرلي منفوش (بطاقة ذهبية)',
                backSvg: (color) => `<g>
                    <!-- Big fluffy curly mass behind head -->
                    <path d="M 64,68 C 44,55 36,78 40,100 C 30,110 28,138 42,155 C 55,170 145,170 158,155 C 172,138 170,110 160,100 C 164,78 156,55 136,68 C 120,46 80,46 64,68 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 64,68 C 44,55 36,78 40,100 C 30,110 28,138 42,155 C 55,170 145,170 158,155 C 172,138 170,110 160,100 C 164,78 156,55 136,68 C 120,46 80,46 64,68 Z" fill="url(#shadowOverlay)" opacity="0.35"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <!-- Curly side pieces -->
                    <path d="M 65,72 C 58,80 55,95 58,108 C 60,100 63,86 66,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 135,72 C 142,80 145,95 142,108 C 140,100 137,86 134,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Wavy curly bang -->
                    <path d="M 67,70 Q 76,62 85,70 Q 94,62 100,60 Q 106,62 115,70 Q 124,62 133,70 Q 100,80 67,70 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 67,70 Q 76,62 85,70 Q 94,62 100,60 Q 106,62 115,70 Q 124,62 133,70 Q 100,80 67,70 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                    <!-- Gold headband / tiara -->
                    <path d="M 74,68 L 100,54 L 126,68 L 100,62 Z" fill="url(#goldGrad)" stroke="#5a4020" stroke-width="1"/>
                    <circle cx="100" cy="54" r="3" fill="#ff4081"/>
                    <circle cx="82" cy="62" r="2" fill="url(#goldGrad)"/>
                    <circle cx="118" cy="62" r="2" fill="url(#goldGrad)"/>
                </g>`
            },
            {
                id: 'hair4',
                name: 'شعر بوب مستقيم ناعم',
                backSvg: (color) => `<g>
                    <!-- Bob back — covers head sides and ends at jaw level -->
                    <path d="M 65,65 C 50,62 44,80 44,100 C 44,118 50,132 58,140 L 68,145 L 132,145 L 142,140 C 150,132 156,118 156,100 C 156,80 150,62 135,65 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 65,65 C 50,62 44,80 44,100 C 44,118 50,132 58,140 L 68,145 L 132,145 L 142,140 C 150,132 156,118 156,100 C 156,80 150,62 135,65 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                    <!-- Top cap -->
                    <path d="M 65,65 C 72,48 85,42 100,42 C 115,42 128,48 135,65 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <!-- Side strands in front of ears -->
                    <path d="M 65,70 C 60,82 58,105 60,120 C 62,110 64,90 66,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 135,70 C 140,82 142,105 140,120 C 138,110 136,90 134,78 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Straight bang across forehead -->
                    <path d="M 67,70 Q 100,60 133,70 L 128,76 L 100,73 L 72,76 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 70,66 Q 100,58 130,66 Q 100,62 70,66 Z" fill="white" opacity="0.25"/>
                </g>`
            },
            {
                id: 'hair5',
                name: 'شعر ذيل الحصان العالي',
                backSvg: (color) => `<g>
                    <!-- Ponytail flowing down the back -->
                    <path d="M 114,60 C 128,56 148,72 148,100 C 148,128 136,158 128,175 C 124,168 130,140 132,115 C 134,90 128,66 118,62 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 114,60 C 128,56 148,72 148,100 C 148,128 136,158 128,175 C 124,168 130,140 132,115 C 134,90 128,66 118,62 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                    <!-- Hair cap over head -->
                    <path d="M 66,66 C 56,65 48,78 48,100 C 48,115 54,126 62,130 L 138,130 C 146,126 152,115 152,100 C 152,78 144,65 134,66 C 120,46 80,46 66,66 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <!-- Scrunchie / band -->
                    <ellipse cx="118" cy="62" rx="7" ry="5" fill="#ff4081" stroke="#c0005a" stroke-width="1"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <path d="M 65,72 C 60,84 58,104 60,118 C 62,108 64,90 66,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 135,72 C 140,84 142,104 140,118 C 138,108 136,90 134,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 67,70 Q 100,58 133,70 Q 116,76 100,76 Q 84,76 67,70 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                </g>`
            },
            {
                id: 'hair6',
                name: 'ضفائر طويلة جانبية',
                backSvg: (color) => `<g>
                    <!-- Left braid -->
                    <path d="M 62,88 C 52,100 44,122 42,148 C 40,160 44,168 48,165 C 46,150 50,128 56,108 C 60,94 64,82 62,88 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 52,108 C 44,122 42,148 46,162 C 50,158 50,138 56,118 Z" fill="${color}" stroke="#3a2a18" stroke-width="0.8" opacity="0.7"/>
                    <!-- Right braid -->
                    <path d="M 138,88 C 148,100 156,122 158,148 C 160,160 156,168 152,165 C 154,150 150,128 144,108 C 140,94 136,82 138,88 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 148,108 C 156,122 158,148 154,162 C 150,158 150,138 144,118 Z" fill="${color}" stroke="#3a2a18" stroke-width="0.8" opacity="0.7"/>
                    <!-- Crown cap -->
                    <path d="M 66,66 C 52,64 46,80 46,100 C 46,114 52,124 60,128 L 140,128 C 148,124 154,114 154,100 C 154,80 148,64 134,66 C 118,48 82,48 66,66 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <path d="M 65,72 C 58,82 56,100 58,114 C 60,106 62,90 65,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 135,72 C 142,82 144,100 142,114 C 140,106 138,90 135,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 67,70 Q 100,58 133,70 Q 100,74 67,70 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                </g>`
            },
            {
                id: 'hair7',
                name: 'قصة بوي قصيرة كاجوال',
                backSvg: (color) => `<g>
                    <!-- Short back cap ending above shoulders -->
                    <path d="M 66,66 C 52,64 46,80 46,100 C 46,110 50,118 56,120 L 144,120 C 150,118 154,110 154,100 C 154,80 148,64 134,66 C 118,48 82,48 66,66 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 66,66 C 52,64 46,80 46,100 C 46,110 50,118 56,120 L 144,120 C 150,118 154,110 154,100 C 154,80 148,64 134,66 C 118,48 82,48 66,66 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <!-- Short spiky / tousled front bang -->
                    <path d="M 67,70 C 72,58 82,56 88,66 C 90,58 96,54 100,54 C 104,54 110,58 112,66 C 118,56 128,58 133,70 Q 118,80 100,78 Q 82,80 67,70 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 70,66 Q 100,56 130,66 Q 100,60 70,66 Z" fill="white" opacity="0.25"/>
                </g>`
            },
            {
                id: 'hair8',
                name: 'جدائل تاج (ضفيرة دائرية)',
                backSvg: (color) => `<g>
                    <!-- Back hair cap -->
                    <path d="M 66,66 C 50,64 44,82 44,102 C 44,116 50,126 58,130 L 142,130 C 150,126 156,116 156,102 C 156,82 150,64 134,66 C 118,48 82,48 66,66 Z" fill="${color}" stroke="#3a2a18" stroke-width="1.2"/>
                    <path d="M 66,66 C 50,64 44,82 44,102 C 44,116 50,126 58,130 L 142,130 C 150,126 156,116 156,102 C 156,82 150,64 134,66 C 118,48 82,48 66,66 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                </g>`,
                frontSvg: (color) => `<g>
                    <!-- Crown braid band across top of head -->
                    <path d="M 68,68 Q 100,56 132,68 Q 100,62 68,68 Z" fill="${color}" stroke="#3a2a18" stroke-width="2"/>
                    <!-- Braid segments texture -->
                    <path d="M 72,67 Q 78,62 84,67 Q 90,62 96,67 Q 102,62 108,67 Q 114,62 120,67 Q 126,62 132,67" stroke="#3a2a18" stroke-width="1.2" fill="none" opacity="0.5"/>
                    <!-- Side strands -->
                    <path d="M 66,72 C 58,84 56,104 58,118 C 60,108 62,90 65,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <path d="M 134,72 C 142,84 144,104 142,118 C 140,108 138,90 135,80 Z" fill="${color}" stroke="#3a2a18" stroke-width="1"/>
                    <!-- Flowers on braid -->
                    <circle cx="84" cy="66" r="4" fill="#ff4081" stroke="#c0005a" stroke-width="0.8"/>
                    <circle cx="116" cy="66" r="4" fill="#ff4081" stroke="#c0005a" stroke-width="0.8"/>
                    <circle cx="100" cy="60" r="4" fill="#ff4081" stroke="#c0005a" stroke-width="0.8"/>
                </g>`
            }
        ],
        tops: {
            tshirt: [
                { 
                    id: 'top1', 
                    name: 'بلوزة الكشكشة الوردية الأنيقة', 
                    svg: (color) => `<g>
                        <path d="M 76,128 C 84,124 116,124 124,128 L 126,175 C 126,175 100,182 74,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 76,128 C 84,124 116,124 124,128 L 126,175 C 126,175 100,182 74,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 76,128 C 84,124 116,124 124,128 L 126,175 C 126,175 100,182 74,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 78,128 C 66,134 60,150 64,158 C 68,162 76,155 76,155 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 122,128 C 134,134 140,150 136,158 C 132,162 124,155 124,155 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 86,125 C 88,135 112,135 114,125 C 114,125 108,138 100,138 C 92,138 86,125 86,125 Z" fill="#ffffff" stroke="#421a28" stroke-width="0.8"/>
                        <circle cx="100" cy="136" r="2.5" fill="#d81b60"/>
                        <path d="M 97,134 Q 95,138 97,142 M 103,134 Q 105,138 103,142" stroke="#d81b60" stroke-width="1.5" fill="none"/>
                    </g>`
                },
                { 
                    id: 'top2', 
                    name: 'بلوزة الرقبة بحلقة هولتر', 
                    svg: (color) => `<g>
                        <path d="M 88,123 L 112,123 L 124,175 C 124,175 100,182 76,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 88,123 L 112,123 L 124,175 C 124,175 100,182 76,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 88,123 L 112,123 L 124,175 C 124,175 100,182 76,175 Z" fill="url(#shadowOverlay)"/>
                        <circle cx="100" cy="129" r="6.2" fill="url(#goldGrad)" stroke="#421a28" stroke-width="1"/>
                        <circle cx="100" cy="129" r="3.2" fill="${color}"/>
                    </g>`
                },
                { 
                    id: 'top3', 
                    name: 'تي شيرت رياضي مع قلب', 
                    svg: (color) => `<g>
                        <path d="M 74,127 C 84,123 116,123 126,127 L 128,175 L 72,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 74,127 C 84,123 116,123 126,127 L 128,175 L 72,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 74,127 C 84,123 116,123 126,127 L 128,175 L 72,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 74,127 L 62,148 L 74,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 126,127 L 138,148 L 126,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 96,145 Q 100,141 104,145 Q 108,149 100,157 Q 92,149 96,145 Z" fill="#ffffff" stroke="#421a28" stroke-width="0.5"/>
                    </g>`
                },
                { 
                    id: 'top4', 
                    name: 'تيشيرت بطبعة إيموجي ضاحك', 
                    svg: (color) => `<g>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 74,127 L 62,148 L 74,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 126,127 L 138,148 L 126,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <circle cx="100" cy="148" r="8" fill="url(#goldGrad)" stroke="#421a28" stroke-width="0.8"/>
                        <circle cx="97.5" cy="146.5" r="1" fill="#2b2d42"/>
                        <circle cx="102.5" cy="146.5" r="1" fill="#2b2d42"/>
                        <path d="M 97,150 Q 100,153 103,150" stroke="#2b2d42" stroke-width="0.8" fill="none"/>
                    </g>`
                },
                { 
                    id: 'top5', 
                    name: 'تيشيرت الخطوط الأفقية الرياضي', 
                    svg: (color) => `<g>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 74,127 L 126,127 L 128,175 L 72,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 74,127 L 62,148 L 74,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 126,127 L 138,148 L 126,152 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 73,138 L 127,138 L 127,143 L 73,143 Z" fill="#ffffff" opacity="0.65"/>
                        <path d="M 72,152 L 128,152 L 128,157 L 72,157 Z" fill="#ffffff" opacity="0.65"/>
                    </g>`
                },
                { 
                    id: 'top6', 
                    name: 'بلوزة بنقاط النجوم وبأكمام', 
                    svg: (color) => `<g>
                        <path d="M 74,125 C 84,121 116,121 126,125 L 128,175 L 72,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 74,125 C 84,121 116,121 126,125 L 128,175 L 72,175 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 74,125 C 84,121 116,121 126,125 L 128,175 L 72,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 74,125 L 56,154 L 68,158 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 126,125 L 144,154 L 132,158 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <text x="82" y="146" font-size="8" fill="#ffffff" opacity="0.95">★</text>
                        <text x="110" y="146" font-size="8" fill="#ffffff" opacity="0.95">★</text>
                    </g>`
                }
            ],
            jacket: [
                { 
                    id: 'top7', 
                    name: 'فستان صيفي فلورال متوسط', 
                    svg: (color) => `<g>
                        <!-- Top Part -->
                        <path d="M 76,128 C 84,124 116,124 124,128 L 125,175 H 75 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 76,128 C 84,124 116,124 124,128 L 125,175 H 75 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 76,128 C 84,124 116,124 124,128 L 125,175 H 75 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 78,128 C 66,134 60,150 64,158 C 68,162 76,155 76,155 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 122,128 C 134,134 140,150 136,158 C 132,162 124,155 124,155 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <!-- Flared Skirt of the dress covering bottoms -->
                        <path d="M 75,175 L 125,175 L 142,225 L 58,225 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 75,175 L 125,175 L 142,225 L 58,225 Z" fill="url(#shadowOverlay)"/>
                        <!-- Floral dots -->
                        <circle cx="76" cy="190" r="2.5" fill="#ffffff" opacity="0.9"/>
                        <circle cx="124" cy="190" r="2.5" fill="#ffffff" opacity="0.9"/>
                        <circle cx="100" cy="205" r="3" fill="#ffffff" opacity="0.9"/>
                        <circle cx="85" cy="215" r="2.5" fill="#ffffff" opacity="0.9"/>
                        <circle cx="115" cy="215" r="2.5" fill="#ffffff" opacity="0.9"/>
                    </g>`
                },
                { 
                    id: 'top8', 
                    name: 'فستان الأميرة الفاخر المنفوش', 
                    svg: (color) => `<g>
                        <!-- Top corset part -->
                        <path d="M 82,125 L 118,125 L 122,175 H 78 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 82,125 L 118,125 L 122,175 H 78 Z" fill="url(#highlightOverlay)"/>
                        <path d="M 82,125 L 118,125 L 122,175 H 78 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 74,127 C 84,134 116,134 126,127" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                        <!-- Ballroom gown -->
                        <path d="M 78,175 L 122,175 C 136,195 152,215 152,246 C 110,250 90,250 48,246 C 48,215 64,195 78,175 Z" fill="${color}" stroke="#421a28" stroke-width="1"/>
                        <path d="M 78,175 L 122,175 C 136,195 152,215 152,246 C 110,250 90,250 48,246 C 48,215 64,195 78,175 Z" fill="url(#shadowOverlay)"/>
                        <path d="M 48,246 Q 60,242 74,246 Q 88,242 102,246 Q 116,242 130,246 Q 142,242 152,246" stroke="#ffffff" stroke-width="3" fill="none"/>
                    </g>`
                }
            ]
        },
        bottoms: [
            { 
                id: 'bottom1', 
                name: 'شورت جينز أبيض صيفي', 
                svg: (color) => `<g>
                    <path d="M 73,174 L 127,174 C 130,196 128,212 128,212 L 105,212 L 100,192 L 95,212 L 72,212 C 72,212 70,196 73,174 Z" fill="${color}" stroke="#1e2430" stroke-width="1"/>
                    <path d="M 73,174 L 127,174 C 130,196 128,212 128,212 L 105,212 L 100,192 L 95,212 L 72,212 C 72,212 70,196 73,174 Z" fill="url(#shadowOverlay)"/>
                    <path d="M 76,174 Q 82,185 78,192" fill="none" stroke="#1e2430" stroke-width="1"/>
                    <path d="M 124,174 Q 118,185 122,192" fill="none" stroke="#1e2430" stroke-width="1"/>
                    <line x1="100" y1="174" x2="100" y2="192" stroke="#1e2430" stroke-width="1"/>
                </g>`
            },
            { 
                id: 'bottom2', 
                name: 'شورت رياضي قصير مريح', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 128,206 L 104,206 L 100,190 L 96,206 L 72,206 Z" fill="${color}" stroke="#1e2430" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 128,206 L 104,206 L 100,190 L 96,206 L 72,206 Z" fill="url(#shadowOverlay)"/>
                    <path d="M 73,180 L 73,200" stroke="#ffffff" stroke-width="2"/>
                    <path d="M 127,180 L 127,200" stroke="#ffffff" stroke-width="2"/>
                </g>`
            },
            { 
                id: 'bottom3', 
                name: 'بنطال جينز كاجوال طويل', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 129,242 C 129,242 118,245 112,242 L 104,196 L 96,196 L 88,242 C 82,245 71,242 71,242 Z" fill="${color}" stroke="#101c2e" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 129,242 C 129,242 118,245 112,242 L 104,196 L 96,196 L 88,242 C 82,245 71,242 71,242 Z" fill="url(#shadowOverlay)"/>
                    <line x1="100" y1="174" x2="100" y2="196" stroke="#101c2e" stroke-width="1"/>
                </g>`
            },
            { 
                id: 'bottom4', 
                name: 'بنطال الشارع الفضفاض بجيوب', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 132,240 C 132,240 120,244 114,240 L 104,196 L 96,196 L 86,240 C 80,244 68,240 68,240 Z" fill="${color}" stroke="#1a221a" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 132,240 C 132,240 120,244 114,240 L 104,196 L 96,196 L 86,240 C 80,244 68,240 68,240 Z" fill="url(#shadowOverlay)"/>
                    <rect x="70" y="195" width="10" height="12" rx="2" fill="${color}" stroke="#1a221a" stroke-width="0.8"/>
                    <rect x="120" y="195" width="10" height="12" rx="2" fill="${color}" stroke="#1a221a" stroke-width="0.8"/>
                </g>`
            },
            { 
                id: 'bottom5', 
                name: 'بنطال ليجنز رياضي ضيق', 
                svg: (color) => `<g>
                    <path d="M 76,174 L 124,174 L 126,242 C 126,242 118,243 113,242 L 103,196 L 97,196 L 87,242 C 82,243 74,242 74,242 Z" fill="${color}" stroke="#101c2e" stroke-width="1"/>
                    <path d="M 76,174 L 124,174 L 126,242 C 126,242 118,243 113,242 L 103,196 H 97 L 87,242 C 82,243 74,242 74,242 Z" fill="url(#shadowOverlay)"/>
                </g>`
            },
            { 
                id: 'bottom6', 
                name: 'بنطال واسع الساق مريح', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 134,242 C 134,242 120,246 112,242 L 104,196 L 96,196 L 88,242 C 80,246 66,242 66,242 Z" fill="${color}" stroke="#1e2225" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 134,242 C 134,242 120,246 112,242 L 104,196 L 96,196 L 88,242 C 80,246 66,242 66,242 Z" fill="url(#shadowOverlay)"/>
                </g>`
            },
            { 
                id: 'bottom7', 
                name: 'بنطال الكابري القصير الصيفي', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 127,222 C 127,222 118,224 113,222 L 104,194 L 96,194 L 87,222 C 82,224 73,222 73,222 Z" fill="${color}" stroke="#2e1c16" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 127,222 C 127,222 118,224 113,222 L 104,194 L 96,194 L 87,222 C 82,224 73,222 73,222 Z" fill="url(#shadowOverlay)"/>
                </g>`
            },
            { 
                id: 'bottom8', 
                name: 'بنطال مخطط كلاسيكي بكسرات', 
                svg: (color) => `<g>
                    <path d="M 74,174 L 126,174 L 129,242 C 129,242 118,245 112,242 L 104,196 H 96 L 88,242 C 82,245 71,242 71,242 Z" fill="${color}" stroke="#101c2e" stroke-width="1"/>
                    <path d="M 74,174 L 126,174 L 129,242 C 129,242 118,245 112,242 L 104,196 H 96 L 88,242 C 82,245 71,242 71,242 Z" fill="url(#shadowOverlay)"/>
                    <line x1="84" y1="178" x2="80" y2="238" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
                    <line x1="116" y1="178" x2="120" y2="238" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
                </g>`
            }
        ],
        shoes: [
            {
                id: 'shoe1',
                name: 'حفاية الصيف البسيطة (سلايدر)',
                svg: (color) => `<g>
                    <ellipse cx="86" cy="242" rx="9" ry="3.2" fill="#ffffff" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 77,241 Q 86,236 95,241" stroke="${color}" stroke-width="4.2" fill="none" stroke-linecap="round"/>
                    <ellipse cx="114" cy="242" rx="9" ry="3.2" fill="#ffffff" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 105,241 Q 114,236 123,241" stroke="${color}" stroke-width="4.2" fill="none" stroke-linecap="round"/>
                </g>`
            },
            {
                id: 'shoe2',
                name: 'شبشب الأرانب المنفوش الكيوت',
                svg: (color) => `<g>
                    <ellipse cx="86" cy="241" rx="10.5" ry="5.5" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <ellipse cx="80" cy="235" rx="2" ry="4.5" fill="${color}" stroke="#2e1c16" stroke-width="0.5"/>
                    <ellipse cx="84" cy="235" rx="2" ry="4.5" fill="${color}" stroke="#2e1c16" stroke-width="0.5"/>
                    <circle cx="83" cy="241" r="1" fill="#111"/>
                    <circle cx="87" cy="241" r="1" fill="#111"/>
                    <ellipse cx="114" cy="241" rx="10.5" ry="5.5" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <ellipse cx="108" cy="235" rx="2" ry="4.5" fill="${color}" stroke="#2e1c16" stroke-width="0.5"/>
                    <ellipse cx="112" cy="235" rx="2" ry="4.5" fill="${color}" stroke="#2e1c16" stroke-width="0.5"/>
                    <circle cx="111" cy="241" r="1" fill="#111"/>
                    <circle cx="115" cy="241" r="1" fill="#111"/>
                </g>`
            },
            {
                id: 'shoe3',
                name: 'حذاء رياضي أنيق (سنيكرز)',
                svg: (color) => `<g>
                    <path d="M 75,236 Q 85,231 95,236 L 95,244 Q 85,246 75,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 75,242 Q 85,244 95,242 L 95,244 Q 85,246 75,244 Z" fill="#ffffff" stroke="#2e1c16" stroke-width="0.5"/>
                    <line x1="82" y1="237" x2="88" y2="237" stroke="#ffffff" stroke-width="1.2"/>
                    <line x1="80" y1="240" x2="86" y2="240" stroke="#ffffff" stroke-width="1.2"/>
                    <path d="M 105,236 Q 115,231 125,236 L 125,244 Q 115,246 105,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 105,242 Q 115,244 125,242 L 125,244 Q 115,246 105,244 Z" fill="#ffffff" stroke="#2e1c16" stroke-width="0.5"/>
                    <line x1="112" y1="237" x2="118" y2="237" stroke="#ffffff" stroke-width="1.2"/>
                    <line x1="110" y1="240" x2="116" y2="240" stroke="#ffffff" stroke-width="1.2"/>
                </g>`
            },
            {
                id: 'shoe4',
                name: 'حذاء الكعب العالي الأحمر الفاخر',
                svg: (color) => `<g>
                    <path d="M 76,236 L 92,236 L 92,243 L 88,249 L 76,243 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <line x1="77" y1="243" x2="77" y2="249" stroke="${color}" stroke-width="2.5"/>
                    <path d="M 108,236 L 124,236 L 124,243 L 120,249 L 108,243 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <line x1="109" y1="243" x2="109" y2="249" stroke="${color}" stroke-width="2.5"/>
                </g>`
            },
            {
                id: 'shoe5',
                name: 'بوت الكاحل الأنيق الموضة',
                svg: (color) => `<g>
                    <path d="M 75,224 L 94,224 L 94,244 L 75,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 75,224 L 94,224 L 94,244 L 75,244 Z" fill="url(#shadowOverlay)"/>
                    <ellipse cx="84.5" cy="244" rx="9.5" ry="1.8" fill="#111"/>
                    <path d="M 106,224 L 125,224 L 125,244 L 106,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 106,224 L 125,224 L 125,244 L 106,244 Z" fill="url(#shadowOverlay)"/>
                    <ellipse cx="115.5" cy="244" rx="9.5" ry="1.8" fill="#111"/>
                </g>`
            },
            {
                id: 'shoe6',
                name: 'بوت طويل فوق الكاحل دافئ',
                svg: (color) => `<g>
                    <path d="M 76,212 L 94,212 L 94,244 L 76,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 76,212 L 94,212 L 94,244 L 76,244 Z" fill="url(#shadowOverlay)"/>
                    <path d="M 106,212 L 124,212 L 124,244 L 106,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <path d="M 106,212 L 124,212 L 124,244 L 106,244 Z" fill="url(#shadowOverlay)"/>
                </g>`
            },
            {
                id: 'shoe7',
                name: 'حذاء ماري جين الكلاسيكي مع جوارب',
                svg: (color) => `<g>
                    <rect x="78" y="222" width="14" height="20" fill="#ffffff" stroke="#2e1c16" stroke-width="0.5"/>
                    <path d="M 76,236 Q 86,232 94,236 L 94,244 Q 86,246 76,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <rect x="108" y="222" width="14" height="20" fill="#ffffff" stroke="#2e1c16" stroke-width="0.5"/>
                    <path d="M 106,236 Q 116,232 124,236 L 124,244 Q 116,246 106,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                </g>`
            },
            {
                id: 'shoe8',
                name: 'حذاء لوفرز مسطح ومريح',
                svg: (color) => `<g>
                    <path d="M 76,236 L 94,236 L 94,244 L 76,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <circle cx="85" cy="236" r="1.5" fill="#ffffff"/>
                    <path d="M 106,236 L 124,236 L 124,244 L 106,244 Z" fill="${color}" stroke="#2e1c16" stroke-width="0.8"/>
                    <circle cx="115" cy="236" r="1.5" fill="#ffffff"/>
                </g>`
            }
        ]
    };

    // Construct base screen layout matching the user's second screenshot exactly
    let html = `
        <div class="poki-style-dressup-container">
            <!-- Left Side: Character Preview Panel (Checkered Grid, Static Character) -->
            <div class="poki-model-panel">
                <!-- Checkered grid background overlay -->
                <div class="room-background grid-background"></div>

                <!-- The Avatar Drawing Stage (Fixed size, no bounce animation) -->
                <div class="avatar-render-stage" id="avatarStage">
                    <svg viewBox="0 0 200 300" width="100%" height="100%" id="avatarSvg">
                        <defs>
                            <!-- Linear Highlight Overlay -->
                            <linearGradient id="highlightOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
                                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
                                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                            </linearGradient>
                            
                            <!-- Linear Shadow Overlay -->
                            <linearGradient id="shadowOverlay" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stop-color="#000000" stop-opacity="0.2" />
                                <stop offset="60%" stop-color="#000000" stop-opacity="0.04" />
                                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                            </linearGradient>

                            <!-- Skin Radial Blush Gradient -->
                            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#ff4081" stop-opacity="0.55"/>
                                <stop offset="100%" stop-color="#ff4081" stop-opacity="0"/>
                            </radialGradient>
                            
                            <!-- Gold Ring Gradient -->
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#ffee55"/>
                                <stop offset="50%" stop-color="#ddaa00"/>
                                <stop offset="100%" stop-color="#885500"/>
                            </linearGradient>
                        </defs>

                        <!-- 1. Back Hair Layer (drawn behind the head) -->
                        <g id="backHairLayer"></g>

                        <!-- 2. Skin Color Base Body Model (Fixed Warm Tan skin color) -->
                        <g id="bodyBaseLayer">
                            <!-- Legs -->
                            <path d="M 80,190 L 80,240 C 80,243 92,243 92,240 L 92,190 Z" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <path d="M 108,190 L 108,240 C 108,243 120,243 120,240 L 120,190 Z" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <!-- Torso -->
                            <path d="M 76,128 C 76,128 74,192 100,192 C 126,192 124,128 124,128 Z" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <path d="M 76,128 C 76,128 74,192 100,192 C 126,192 124,128 124,128 Z" fill="url(#shadowOverlay)" opacity="0.3"/>
                            <!-- Neck & shadow -->
                            <rect x="94" y="112" width="12" height="18" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <path d="M 94,112 L 94,122 Q 100,126 106,122 L 106,112 Z" fill="rgba(0,0,0,0.06)"/>
                            <!-- Head (smooth chibi chin shape) -->
                            <path d="M 64,82 C 64,105 76,122 100,122 C 124,122 136,105 136,82 C 136,65 120,52 100,52 C 80,52 64,65 64,82 Z" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <!-- Ears -->
                            <circle cx="61" cy="85" r="7" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <circle cx="139" cy="85" r="7" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1"/>
                            <!-- Nose (cute small dot) -->
                            <path d="M 100,92 Q 101.5,94 100,95" stroke="#7a5542" stroke-width="1" fill="none" stroke-linecap="round"/>
                            <!-- Smile Mouth -->
                            <path d="M 96,101 Q 100,107 104,101 Q 100,102 96,101" fill="#e57373" stroke="#4a2d1b" stroke-width="1"/>
                            <!-- Arms -->
                            <path d="M 76,130 C 64,148 62,172 64,177 C 66,182 74,178 74,173 Q 73,150 78,133" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1" stroke-linecap="round"/>
                            <path d="M 124,130 C 136,148 138,172 136,177 C 134,182 126,178 126,173 Q 127,150 122,133" fill="${fixedSkinColor}" stroke="#4a2d1b" stroke-width="1" stroke-linecap="round"/>
                        </g>

                        <!-- 3. Blush / Makeup Layer -->
                        <g id="blushLayer"></g>

                        <!-- 4. Eyes Expression Layer -->
                        <g id="eyesLayer"></g>

                        <!-- 5. Bottoms / Pants / Skirts Layer -->
                        <g id="bottomsLayer"></g>

                        <!-- 6. Tops / Shirts / Jackets / Dresses Layer -->
                        <g id="topsLayer"></g>

                        <!-- 7. Shoes Layer (drawn at feet) -->
                        <g id="shoesLayer"></g>

                        <!-- 8. Front Hair Layer (drawn over the face) -->
                        <g id="frontHairLayer"></g>
                    </svg>
                </div>
            </div>

            <!-- Right Side: Wardrobe Panel (Top categories bar, Items grid, Bottom Colors bar) -->
            <div class="poki-wardrobe-drawer">
                <!-- Top Categories Row (Shoes, Bottoms, Tops, Hair, Eyes) -->
                <div class="dressup-top-bar">
                    <button class="category-tab-btn" data-cat="shoes" title="حذاء">👠</button>
                    <button class="category-tab-btn" data-cat="bottoms" title="بنطال">👖</button>
                    <button class="category-tab-btn active" data-cat="tops" title="تيشيرت">👚</button>
                    <button class="category-tab-btn" data-cat="hair" title="شعر">💇</button>
                    <button class="category-tab-btn" data-cat="eyes" title="عين">👁️</button>
                </div>

                <!-- Subcategory tabs (Index-based data-sub="sub1" and "sub2" to be completely safe) -->
                <div class="poki-subcategory-header" id="pokiSubcategoryHeader">
                    <button class="sub-tab-btn active" data-sub="sub1" id="subBtn1">👚 تيشيرت (6)</button>
                    <button class="sub-tab-btn" data-sub="sub2" id="subBtn2">👗 فساتين (2)</button>
                </div>

                <!-- Items Selection Grid (Scrollable grid of options) -->
                <div class="poki-items-grid-container">
                    <div class="poki-items-grid" id="pokiItemsGrid"></div>
                </div>

                <!-- Bottom Color Swatches Row (Exactly 6 colors) -->
                <div class="dressup-colors-bar" id="pokiColorPalette"></div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // DOM Elements
    const backHairLayer = document.getElementById('backHairLayer');
    const frontHairLayer = document.getElementById('frontHairLayer');
    const blushLayer = document.getElementById('blushLayer');
    const eyesLayer = document.getElementById('eyesLayer');
    const bottomsLayer = document.getElementById('bottomsLayer');
    const topsLayer = document.getElementById('topsLayer');
    const shoesLayer = document.getElementById('shoesLayer');

    const subcategoryHeader = document.getElementById('pokiSubcategoryHeader');
    const subBtn1 = document.getElementById('subBtn1');
    const subBtn2 = document.getElementById('subBtn2');
    const itemsGrid = document.getElementById('pokiItemsGrid');
    const colorPalette = document.getElementById('pokiColorPalette');

    // Register Clean Up Event on game-exit
    container.addEventListener('game-exit', () => {
        document.querySelector('.app-container').classList.remove('wide-mode');
    });

    // Load initial categories layout
    function renderCategoriesMenu() {
        container.querySelectorAll('.category-tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (state.soundOn && window.sound) window.sound.playClick();
                container.querySelector('.category-tab-btn.active').classList.remove('active');
                this.classList.add('active');
                
                state.activeCategory = this.getAttribute('data-cat');
                state.activeSubCategory = 'sub1'; // Reset subcategory to first tab

                // Reset active sub tab button class
                subBtn1.classList.add('active');
                subBtn2.classList.remove('active');

                // Adjust headers and tabs labels
                if (state.activeCategory === 'tops') {
                    subcategoryHeader.style.display = 'flex';
                    subBtn1.innerHTML = '👚 تيشيرت (6)';
                    subBtn2.innerHTML = '👗 فساتين (2)';
                } else if (state.activeCategory === 'bottoms') {
                    subcategoryHeader.style.display = 'flex';
                    subBtn1.innerHTML = '👖 بناطيل (6)';
                    subBtn2.innerHTML = '🩳 شورتات (2)';
                } else if (state.activeCategory === 'shoes') {
                    subcategoryHeader.style.display = 'flex';
                    subBtn1.innerHTML = '👞 أحذية (6)';
                    subBtn2.innerHTML = '👡 حفايات (2)';
                } else {
                    subcategoryHeader.style.display = 'none';
                }

                renderItemsGrid();
                renderColorPalette();
            });
        });

        // Click listeners for the two subcategory tabs (fixed IDs, no attribute rewriting)
        subBtn1.addEventListener('click', function () {
            if (state.soundOn && window.sound) window.sound.playClick();
            subBtn1.classList.add('active');
            subBtn2.classList.remove('active');
            state.activeSubCategory = 'sub1';
            renderItemsGrid();
        });

        subBtn2.addEventListener('click', function () {
            if (state.soundOn && window.sound) window.sound.playClick();
            subBtn2.classList.add('active');
            subBtn1.classList.remove('active');
            state.activeSubCategory = 'sub2';
            renderItemsGrid();
        });
    }

    // Render Items Grid
    function renderItemsGrid() {
        itemsGrid.innerHTML = '';
        let items = [];

        if (state.activeCategory === 'tops') {
            if (state.activeSubCategory === 'sub2') {
                items = database.tops.jacket; // Dresses (2)
            } else {
                items = database.tops.tshirt; // T-shirts (6)
            }
        } else if (state.activeCategory === 'bottoms') {
            const allBottoms = database.bottoms;
            if (state.activeSubCategory === 'sub2') {
                items = allBottoms.slice(0, 2); // 2 shorts
            } else {
                items = allBottoms.slice(2, 8); // 6 pants
            }
        } else if (state.activeCategory === 'shoes') {
            const allShoes = database.shoes;
            if (state.activeSubCategory === 'sub2') {
                items = allShoes.slice(0, 2); // 2 slippers
            } else {
                items = allShoes.slice(2, 8); // 6 shoes
            }
        } else {
            items = database[state.activeCategory]; // hair (8), eyes (8)
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('poki-item-card');

            // If active, add selected style
            if (state.selections[state.activeCategory] === item.id) {
                card.classList.add('selected');
            }

            // Draw miniature item preview inside card
            let itemPreview = '';
            if (state.activeCategory === 'eyes') {
                itemPreview = `<svg viewBox="50 60 100 60" class="mini-svg-preview">${item.svg(state.colors.eyes)}</svg>`;
            } else if (state.activeCategory === 'hair') {
                itemPreview = `<svg viewBox="20 20 160 150" class="mini-svg-preview">
                    ${item.backSvg(state.colors.hair)}
                    ${item.frontSvg(state.colors.hair)}
                </svg>`;
            } else if (state.activeCategory === 'tops') {
                itemPreview = `<svg viewBox="50 115 100 80" class="mini-svg-preview">${item.svg(state.colors.tops)}</svg>`;
            } else if (state.activeCategory === 'bottoms') {
                itemPreview = `<svg viewBox="50 170 100 95" class="mini-svg-preview">${item.svg(state.colors.bottoms)}</svg>`;
            } else if (state.activeCategory === 'shoes') {
                itemPreview = `<svg viewBox="60 220 80 32" class="mini-svg-preview">${item.svg(state.colors.shoes)}</svg>`;
            }

            card.innerHTML = `
                ${itemPreview}
                <!-- Heart Badge for selected -->
                <div class="heart-badge">💖</div>
            `;

            card.addEventListener('click', () => {
                if (state.soundOn && window.sound) window.sound.playClick();
                state.selections[state.activeCategory] = item.id;
                
                updateAvatar();
                renderItemsGrid();
            });

            itemsGrid.appendChild(card);
        });
    }

    // Render 6 Color Squares
    function renderColorPalette() {
        colorPalette.innerHTML = '';
        flatColorsList.forEach(c => {
            const square = document.createElement('div');
            square.classList.add('color-swatch-box');
            square.style.backgroundColor = c;
            
            // Highlight active selection
            if (state.colors[state.activeCategory] === c) {
                square.classList.add('selected');
            }

            square.addEventListener('click', () => {
                if (state.soundOn && window.sound) window.sound.playClick();
                state.colors[state.activeCategory] = c;
                
                container.querySelectorAll('.color-swatch-box').forEach(el => el.classList.remove('selected'));
                square.classList.add('selected');

                updateAvatar();
                renderItemsGrid(); // update grid card colors
            });

            colorPalette.appendChild(square);
        });
    }

    // Update character visual SVG nodes
    function updateAvatar() {
        // 1. Eyes
        const activeEyes = database.eyes.find(e => e.id === state.selections.eyes);
        eyesLayer.innerHTML = activeEyes ? activeEyes.svg(state.colors.eyes) : '';

        // 2. Blush (Fixed default blush)
        blushLayer.innerHTML = `<g>
            <!-- Soft blush circles on cheeks -->
            <circle cx="72" cy="98" r="8" fill="url(#blushGrad)"/>
            <circle cx="128" cy="98" r="8" fill="url(#blushGrad)"/>
        </g>`;

        // 3. Tops (Checks inside tshirt and jackets/dresses)
        let activeTop = database.tops.tshirt.find(t => t.id === state.selections.tops);
        if (!activeTop) {
            activeTop = database.tops.jacket.find(t => t.id === state.selections.tops);
        }
        topsLayer.innerHTML = activeTop ? activeTop.svg(state.colors.tops) : '';

        // 4. Bottoms (Only display if selected top is NOT a dress)
        const isDress = (state.selections.tops === 'top7' || state.selections.tops === 'top8');
        if (isDress) {
            bottomsLayer.style.display = 'none';
        } else {
            bottomsLayer.style.display = 'block';
            const activeBottom = database.bottoms.find(b => b.id === state.selections.bottoms);
            bottomsLayer.innerHTML = activeBottom ? activeBottom.svg(state.colors.bottoms) : '';
        }

        // 5. Shoes
        const activeShoe = database.shoes.find(s => s.id === state.selections.shoes);
        shoesLayer.innerHTML = activeShoe ? activeShoe.svg(state.colors.shoes) : '';

        // 6. Hair (Split Render)
        const activeHair = database.hair.find(h => h.id === state.selections.hair);
        if (activeHair) {
            backHairLayer.innerHTML = activeHair.backSvg(state.colors.hair);
            frontHairLayer.innerHTML = activeHair.frontSvg(state.colors.hair);
        } else {
            backHairLayer.innerHTML = '';
            frontHairLayer.innerHTML = '';
        }
    }

    // Initialize all components
    renderCategoriesMenu();
    renderItemsGrid();
    renderColorPalette();
    updateAvatar();
};
