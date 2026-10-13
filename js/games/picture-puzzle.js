// 9-Piece Picture Puzzle Game for Kids
// Supports drag and drop of interlocking jigsaw puzzle shapes

(function() {
    // Configurations of edges for each of the 9 pieces in a 3x3 grid
    // 0 = straight (border), 1 = outward tab, -1 = inward tab
    const pieceConfigs = [
        [ // Row 0
            { top: 0, right: -1, bottom: -1, left: 0 },
            { top: 0, right: 1, bottom: -1, left: 1 },
            { top: 0, right: 0, bottom: -1, left: -1 }
        ],
        [ // Row 1
            { top: 1, right: -1, bottom: -1, left: 0 },
            { top: 1, right: -1, bottom: -1, left: 1 },
            { top: 1, right: 0, bottom: 1, left: 1 }
        ],
        [ // Row 2
            { top: 1, right: -1, bottom: 0, left: 0 },
            { top: 1, right: -1, bottom: 0, left: 1 },
            { top: -1, right: 0, bottom: 0, left: 1 }
        ]
    ];

    // Generate the path string relative to 0,0 - 100,100
    function generatePathString(cfg) {
        let d = "M 0,0";
        
        // Top edge
        if (cfg.top === 0) {
            d += " L 100,0";
        } else if (cfg.top === 1) {
            d += " L 35,0 C 35,-15 45,-20 50,-20 C 55,-20 65,-15 65,0 L 100,0";
        } else if (cfg.top === -1) {
            d += " L 35,0 C 35,15 45,20 50,20 C 55,20 65,15 65,0 L 100,0";
        }
        
        // Right edge
        if (cfg.right === 0) {
            d += " L 100,100";
        } else if (cfg.right === 1) {
            d += " L 100,35 C 115,35 120,45 120,50 C 120,55 115,65 100,65 L 100,100";
        } else if (cfg.right === -1) {
            d += " L 100,35 C 85,35 80,45 80,50 C 80,55 85,65 100,65 L 100,100";
        }
        
        // Bottom edge
        if (cfg.bottom === 0) {
            d += " L 0,100";
        } else if (cfg.bottom === 1) {
            d += " L 65,100 C 65,115 55,120 50,120 C 45,120 35,115 35,100 L 0,100";
        } else if (cfg.bottom === -1) {
            d += " L 65,100 C 65,85 55,80 50,80 C 45,80 35,85 35,100 L 0,100";
        }
        
        // Left edge
        if (cfg.left === 0) {
            d += " Z";
        } else if (cfg.left === 1) {
            d += " L 0,65 C -15,65 -20,55 -20,50 C -20,45 -15,35 0,35 Z";
        } else if (cfg.left === -1) {
            d += " L 0,65 C 15,65 20,55 20,50 C 20,45 15,35 0,35 Z";
        }
        
        return d;
    }

    // SVG Puzzles (6 options for more variety)
    const puzzles = [
        {
            name: "قوس قزح والشمس",
            emoji: "🌈",
            svg: `
            <rect width="300" height="300" fill="#87CEEB"/>
            <circle cx="150" cy="200" r="130" fill="none" stroke="#FF3D00" stroke-width="15"/>
            <circle cx="150" cy="200" r="115" fill="none" stroke="#FF9100" stroke-width="15"/>
            <circle cx="150" cy="200" r="100" fill="none" stroke="#FFEA00" stroke-width="15"/>
            <circle cx="150" cy="200" r="85" fill="none" stroke="#00E676" stroke-width="15"/>
            <circle cx="150" cy="200" r="70" fill="none" stroke="#2979FF" stroke-width="15"/>
            <circle cx="150" cy="200" r="55" fill="none" stroke="#651FFF" stroke-width="15"/>
            <circle cx="150" cy="200" r="40" fill="none" stroke="#AA00FF" stroke-width="15"/>
            <circle cx="150" cy="200" r="32" fill="#87CEEB" />
            <rect y="230" width="300" height="70" fill="#4CAF50"/>
            <circle cx="50" cy="50" r="25" fill="#FFD700"/>
            <circle cx="230" cy="60" r="20" fill="#FFFFFF"/>
            <circle cx="255" cy="65" r="16" fill="#FFFFFF"/>
            <circle cx="210" cy="68" r="16" fill="#FFFFFF"/>
            <rect x="210" y="62" width="45" height="15" fill="#FFFFFF"/>
            <circle cx="100" cy="265" r="6" fill="#E91E63"/>
            <circle cx="94" cy="265" r="5" fill="#FFEB3B"/>
            <circle cx="106" cy="265" r="5" fill="#FFEB3B"/>
            <circle cx="100" cy="259" r="5" fill="#FFEB3B"/>
            <circle cx="100" cy="271" r="5" fill="#FFEB3B"/>
            <rect x="99" y="271" width="2" height="15" fill="#388E3C"/>
            <circle cx="200" cy="260" r="6" fill="#FF5722"/>
            <circle cx="194" cy="260" r="5" fill="#FFEB3B"/>
            <circle cx="206" cy="260" r="5" fill="#FFEB3B"/>
            <circle cx="200" cy="254" r="5" fill="#FFEB3B"/>
            <circle cx="200" cy="266" r="5" fill="#FFEB3B"/>
            <rect x="199" y="266" width="2" height="15" fill="#388E3C"/>
            `
        },
        {
            name: "القطة الكيوت",
            emoji: "🐱",
            svg: `
            <rect width="300" height="300" fill="#FCE4EC"/>
            <polygon points="60,110 110,40 120,110" fill="#FF9800"/>
            <polygon points="65,105 100,50 110,105" fill="#F8BBD0"/>
            <polygon points="240,110 190,40 180,110" fill="#FF9800"/>
            <polygon points="235,105 200,50 190,105" fill="#F8BBD0"/>
            <ellipse cx="150" cy="155" rx="95" ry="75" fill="#FFB74D"/>
            <circle cx="110" cy="140" r="16" fill="#FFFFFF"/>
            <circle cx="110" cy="140" r="9" fill="#00ACC1"/>
            <circle cx="106" cy="136" r="4" fill="#FFFFFF"/>
            <circle cx="190" cy="140" r="16" fill="#FFFFFF"/>
            <circle cx="190" cy="140" r="9" fill="#00ACC1"/>
            <circle cx="186" cy="136" r="4" fill="#FFFFFF"/>
            <polygon points="150,165 140,156 160,156" fill="#F06292"/>
            <path d="M150,165 Q145,178 135,172 M150,165 Q155,178 165,172" fill="none" stroke="#37474F" stroke-width="3" stroke-linecap="round"/>
            <line x1="70" y1="160" x2="25" y2="152" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="70" y1="168" x2="20" y2="168" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="70" y1="176" x2="25" y2="184" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="230" y1="160" x2="275" y2="152" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="230" y1="168" x2="280" y2="168" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="230" y1="176" x2="275" y2="184" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="85" cy="165" r="10" fill="#FF8A80" opacity="0.6"/>
            <circle cx="215" cy="165" r="10" fill="#FF8A80" opacity="0.6"/>
            `
        },
        {
            name: "الزهرة الكرتونية",
            emoji: "🌸",
            svg: `
            <rect width="300" height="300" fill="#E0F7FA"/>
            <circle cx="40" cy="40" r="22" fill="#FFF59D"/>
            <path d="M150,140 L150,270" stroke="#81C784" stroke-width="12" stroke-linecap="round"/>
            <path d="M150,210 Q110,190 80,205 Q110,225 150,210" fill="#4CAF50"/>
            <path d="M150,180 Q190,160 220,175 Q190,195 150,180" fill="#4CAF50"/>
            <circle cx="150" cy="80" r="28" fill="#F48FB1"/>
            <circle cx="150" cy="200" r="28" fill="#F48FB1"/>
            <circle cx="90" cy="140" r="28" fill="#F48FB1"/>
            <circle cx="210" cy="140" r="28" fill="#F48FB1"/>
            <circle cx="108" cy="98" r="28" fill="#FFB74D"/>
            <circle cx="192" cy="98" r="28" fill="#FFB74D"/>
            <circle cx="108" cy="182" r="28" fill="#FFB74D"/>
            <circle cx="192" cy="182" r="28" fill="#FFB74D"/>
            <circle cx="150" cy="140" r="32" fill="#FFF176"/>
            <circle cx="150" cy="140" r="22" fill="#FBC02D"/>
            <ellipse cx="245" cy="65" rx="8" ry="12" fill="#AB47BC" transform="rotate(15 245 65)"/>
            <ellipse cx="257" cy="70" rx="6" ry="10" fill="#AB47BC" transform="rotate(15 257 70)"/>
            <ellipse cx="250" cy="75" rx="3" ry="8" fill="#3F51B5" transform="rotate(15 250 75)"/>
            `
        },
        {
            name: "الدبدوب اللطيف",
            emoji: "🧸",
            svg: `
            <rect width="300" height="300" fill="#FFF9C4"/>
            <circle cx="80" cy="100" r="30" fill="#8D6E63"/>
            <circle cx="80" cy="100" r="18" fill="#F8BBD0"/>
            <circle cx="220" cy="100" r="30" fill="#8D6E63"/>
            <circle cx="220" cy="100" r="18" fill="#F8BBD0"/>
            <circle cx="150" cy="170" r="75" fill="#A1887F"/>
            <ellipse cx="150" cy="195" rx="30" ry="22" fill="#D7CCC8"/>
            <circle cx="120" cy="150" r="10" fill="#3E2723"/>
            <circle cx="120" cy="148" r="3.5" fill="#FFFFFF"/>
            <circle cx="180" cy="150" r="10" fill="#3E2723"/>
            <circle cx="180" cy="148" r="3.5" fill="#FFFFFF"/>
            <ellipse cx="150" cy="188" rx="12" ry="8" fill="#3E2723"/>
            <path d="M150,196 C145,206 138,202 138,202 M150,196 C155,206 162,202 162,202" fill="none" stroke="#3E2723" stroke-width="3" stroke-linecap="round"/>
            <circle cx="95" cy="175" r="9" fill="#FF8A80" opacity="0.6"/>
            <circle cx="205" cy="175" r="9" fill="#FF8A80" opacity="0.6"/>
            `
        },
        {
            name: "السمكة الذهبية",
            emoji: "🐠",
            svg: `
            <rect width="300" height="300" fill="#E0F2F1"/>
            <path d="M40,300 Q60,200 30,120" fill="none" stroke="#00897B" stroke-width="8" stroke-linecap="round"/>
            <path d="M260,300 Q240,220 270,150" fill="none" stroke="#00897B" stroke-width="8" stroke-linecap="round"/>
            <circle cx="90" cy="90" r="10" fill="none" stroke="#26A69A" stroke-width="2" opacity="0.7"/>
            <circle cx="100" cy="60" r="6" fill="none" stroke="#26A69A" stroke-width="1.5" opacity="0.7"/>
            <circle cx="80" cy="130" r="14" fill="none" stroke="#26A69A" stroke-width="2.5" opacity="0.7"/>
            <polygon points="70,150 20,110 35,150 20,190" fill="#FF7043"/>
            <ellipse cx="140" cy="150" rx="65" ry="48" fill="#FFAB91"/>
            <path d="M140,102 Q160,70 180,105" fill="#FF7043"/>
            <path d="M130,198 Q145,220 160,195" fill="#FF7043"/>
            <circle cx="175" cy="135" r="12" fill="#FFFFFF"/>
            <circle cx="177" cy="135" r="6" fill="#37474F"/>
            <circle cx="175" cy="133" r="3.5" fill="#FFFFFF"/>
            <path d="M200,160 Q190,165 180,160" fill="none" stroke="#D84315" stroke-width="3" stroke-linecap="round"/>
            <path d="M110,135 Q115,142 110,150 M125,140 Q130,147 125,155 M115,155 Q120,162 115,170" fill="none" stroke="#FF7043" stroke-width="2.5"/>
            `
        },
        {
            name: "صاروخ الفضاء",
            emoji: "🚀",
            svg: `
            <rect width="300" height="300" fill="#1A237E"/>
            <circle cx="50" cy="60" r="2" fill="#FFF"/>
            <circle cx="250" cy="50" r="3" fill="#FFF"/>
            <circle cx="280" cy="220" r="2" fill="#FFF"/>
            <circle cx="70" cy="250" r="3.5" fill="#FFF"/>
            <circle cx="130" cy="30" r="1.5" fill="#FFF"/>
            <circle cx="240" cy="80" r="25" fill="#FFF59D"/>
            <circle cx="225" cy="80" r="22" fill="#1A237E"/>
            <polygon points="120,230 150,280 180,230" fill="#FF3D00"/>
            <polygon points="130,230 150,265 170,230" fill="#FFD600"/>
            <path d="M150,60 Q120,130 120,220 L180,220 Q180,130 150,60 Z" fill="#ECEFF1"/>
            <polygon points="120,180 90,220 120,220" fill="#3F51B5"/>
            <polygon points="180,180 210,220 180,220" fill="#3F51B5"/>
            <path d="M150,60 Q130,95 124,110 L176,110 Q170,95 150,60 Z" fill="#FF1744"/>
            <circle cx="150" cy="140" r="16" fill="#00E5FF" stroke="#37474F" stroke-width="3"/>
            <circle cx="146" cy="136" r="5" fill="#FFF" opacity="0.7"/>
            `
        },
        {
            name: "فراشة جميلة",
            emoji: "🦋",
            svg: `
            <rect width="300" height="300" fill="#EDE7F6"/>
            <ellipse cx="105" cy="120" rx="60" ry="40" fill="#D1C4E9" transform="rotate(-30 105 120)"/>
            <ellipse cx="195" cy="120" rx="60" ry="40" fill="#D1C4E9" transform="rotate(30 195 120)"/>
            <ellipse cx="100" cy="110" rx="55" ry="35" fill="#E91E63" transform="rotate(-30 100 110)"/>
            <ellipse cx="200" cy="110" rx="55" ry="35" fill="#E91E63" transform="rotate(30 200 110)"/>
            <circle cx="85" cy="100" r="12" fill="#FFEB3B"/>
            <circle cx="215" cy="100" r="12" fill="#FFEB3B"/>
            <ellipse cx="115" cy="180" rx="45" ry="28" fill="#FF9800" transform="rotate(-15 115 180)"/>
            <ellipse cx="185" cy="180" rx="45" ry="28" fill="#FF9800" transform="rotate(15 185 180)"/>
            <circle cx="110" cy="185" r="8" fill="#FFF"/>
            <circle cx="190" cy="185" r="8" fill="#FFF"/>
            <ellipse cx="150" cy="150" rx="14" ry="70" fill="#5D4037"/>
            <circle cx="150" cy="70" r="18" fill="#5D4037"/>
            <circle cx="144" cy="65" r="3" fill="#FFF"/>
            <circle cx="156" cy="65" r="3" fill="#FFF"/>
            <path d="M142,55 Q130,30 110,40" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round"/>
            <path d="M158,55 Q170,30 190,40" fill="none" stroke="#3E2723" stroke-width="4" stroke-linecap="round"/>
            `
        },
        {
            name: "بطة صفراء",
            emoji: "🐤",
            svg: `
            <rect width="300" height="300" fill="#E0F7FA"/>
            <circle cx="60" cy="50" r="20" fill="#FFF" opacity="0.8"/>
            <circle cx="85" cy="55" r="15" fill="#FFF" opacity="0.8"/>
            <circle cx="240" cy="70" r="25" fill="#FFF" opacity="0.8"/>
            <rect y="220" width="300" height="80" fill="#0288D1"/>
            <path d="M0,220 Q50,205 100,220 T200,220 T300,220 L300,300 L0,300 Z" fill="#0288D1"/>
            <path d="M0,240 Q75,230 150,240 T300,240 L300,300 L0,300 Z" fill="#03A9F4" opacity="0.6"/>
            <ellipse cx="140" cy="170" rx="65" ry="50" fill="#FFEB3B"/>
            <polygon points="85,170 50,130 85,150" fill="#FFEB3B"/>
            <ellipse cx="145" cy="175" rx="35" ry="22" fill="#FDD835"/>
            <circle cx="195" cy="115" r="35" fill="#FFEB3B"/>
            <polygon points="225,110 260,118 225,128" fill="#FF9800"/>
            <circle cx="205" cy="108" r="5" fill="#333"/>
            <circle cx="207" cy="106" r="2" fill="#FFF"/>
            <circle cx="195" cy="125" r="7" fill="#FF8A80" opacity="0.6"/>
            `
        },
        {
            name: "فطر أحمر",
            emoji: "🍄",
            svg: `
            <rect width="300" height="300" fill="#F1F8E9"/>
            <rect y="240" width="300" height="60" fill="#81C784"/>
            <circle cx="70" cy="250" r="15" fill="#81C784"/>
            <circle cx="230" cy="250" r="20" fill="#81C784"/>
            <path d="M110,180 L190,180 L180,260 L120,260 Z" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="2"/>
            <path d="M60,180 C60,90 240,90 240,180 Z" fill="#E53935"/>
            <path d="M60,180 Q150,195 240,180 L245,170 Q150,185 55,170 Z" fill="#D32F2F"/>
            <circle cx="150" cy="120" r="16" fill="#FFF"/>
            <circle cx="100" cy="150" r="12" fill="#FFF"/>
            <circle cx="200" cy="150" r="12" fill="#FFF"/>
            <circle cx="110" cy="110" r="10" fill="#FFF"/>
            <circle cx="190" cy="110" r="10" fill="#FFF"/>
            <circle cx="138" cy="215" r="4.5" fill="#333"/>
            <circle cx="162" cy="215" r="4.5" fill="#333"/>
            <path d="M144,226 Q150,232 156,226" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="130" cy="220" r="5" fill="#FF8A80" opacity="0.6"/>
            <circle cx="170" cy="220" r="5" fill="#FF8A80" opacity="0.6"/>
            `
        },
        {
            name: "بيت صغير",
            emoji: "🏡",
            svg: `
            <rect width="300" height="300" fill="#FFF8E1"/>
            <rect y="230" width="300" height="70" fill="#81C784"/>
            <rect x="50" y="160" width="16" height="80" fill="#8D6E63"/>
            <circle cx="58" cy="140" r="30" fill="#4CAF50"/>
            <rect x="110" y="140" width="130" height="100" fill="#FFF" stroke="#CFD8DC" stroke-width="3"/>
            <polygon points="95,140 175,70 255,140" fill="#FF7043"/>
            <rect x="160" y="180" width="30" height="60" fill="#8D6E63" rx="4"/>
            <circle cx="182" cy="210" r="3" fill="#FFD54F"/>
            <rect x="125" y="165" width="25" height="25" fill="#E0F7FA" stroke="#90A4AE" stroke-width="2"/>
            <line x1="137.5" y1="165" x2="137.5" y2="190" stroke="#90A4AE" stroke-width="2"/>
            <line x1="125" y1="177.5" x2="150" y2="177.5" stroke="#90A4AE" stroke-width="2"/>
            <circle cx="250" cy="45" r="20" fill="#FFEB3B"/>
            `
        }
    ];

    window.initPicturePuzzleGame = function(container) {
        container.innerHTML = "";

        let currentPuzzleIdx = 0;
        let matchedCount = 0;
        const clipSeed = Math.floor(Math.random() * 10000);

        function showCatalogScreen() {
            container.innerHTML = "";

            // Catalog Header
            const header = document.createElement("div");
            header.style.textAlign = "center";
            header.style.marginBottom = "20px";
            header.style.width = "100%";

            const title = document.createElement("h2");
            title.className = "game-title";
            title.innerText = "تركيب الصور الكيوت";
            title.style.margin = "5px 0";
            title.style.fontSize = "26px";
            title.style.color = "#4A148C";
            header.appendChild(title);

            const subtitle = document.createElement("p");
            subtitle.innerText = "اختر صورة لتبدأ التركيب! 👇";
            subtitle.style.margin = "0";
            subtitle.style.fontSize = "15px";
            subtitle.style.color = "#666";
            subtitle.style.fontWeight = "bold";
            header.appendChild(subtitle);
            container.appendChild(header);

            // Scroll wrapper to show all 10 cards within fixed console container height
            const scrollWrapper = document.createElement("div");
            scrollWrapper.style.width = "100%";
            scrollWrapper.style.maxHeight = "515px";
            scrollWrapper.style.overflowY = "auto";
            scrollWrapper.style.paddingBottom = "15px";
            scrollWrapper.style.boxSizing = "border-box";
            scrollWrapper.style.scrollbarWidth = "thin";

            // Grid Container
            const grid = document.createElement("div");
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(2, 1fr)";
            grid.style.gap = "15px";
            grid.style.width = "100%";
            grid.style.boxSizing = "border-box";
            grid.style.padding = "0 10px";

            puzzles.forEach((p, idx) => {
                const card = document.createElement("div");
                card.style.background = "#FFF";
                card.style.border = "3px solid #E0E0E0";
                card.style.borderRadius = "18px";
                card.style.padding = "10px";
                card.style.display = "flex";
                card.style.flexDirection = "column";
                card.style.alignItems = "center";
                card.style.cursor = "pointer";
                card.style.transition = "transform 0.2s, border-color 0.2s, box-shadow 0.2s";
                card.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";

                card.addEventListener("mouseenter", () => {
                    card.style.transform = "scale(1.05)";
                    card.style.borderColor = "#7C4DFF";
                    card.style.boxShadow = "0 6px 12px rgba(124, 77, 255, 0.15)";
                });
                card.addEventListener("mouseleave", () => {
                    card.style.transform = "none";
                    card.style.borderColor = "#E0E0E0";
                    card.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";
                });

                const thumb = document.createElement("div");
                thumb.style.width = "90px";
                thumb.style.height = "90px";
                thumb.style.borderRadius = "8px";
                thumb.style.overflow = "hidden";
                thumb.style.border = "2px solid #F5F5F5";
                thumb.innerHTML = `
                    <svg viewBox="0 0 300 300" width="100%" height="100%">
                        ${p.svg}
                    </svg>
                `;
                card.appendChild(thumb);

                const label = document.createElement("div");
                label.innerText = p.name;
                label.style.marginTop = "8px";
                label.style.fontSize = "13px";
                label.style.fontWeight = "bold";
                label.style.color = "#333";
                label.style.textAlign = "center";
                card.appendChild(label);

                card.addEventListener("click", () => {
                    if (window.sound) window.sound.playClick();
                    currentPuzzleIdx = idx;
                    showAssemblyScreen();
                });

                grid.appendChild(card);
            });

            scrollWrapper.appendChild(grid);
            container.appendChild(scrollWrapper);
        }

        function showAssemblyScreen() {
            container.innerHTML = "";

            // Header Controls
            const controls = document.createElement("div");
            controls.style.display = "flex";
            controls.style.justifyContent = "space-between";
            controls.style.alignItems = "center";
            controls.style.width = "100%";
            controls.style.padding = "0 10px";
            controls.style.boxSizing = "border-box";
            controls.style.marginBottom = "10px";
            controls.style.direction = "rtl";

            const backBtn = document.createElement("button");
            backBtn.className = "menu-btn";
            backBtn.innerText = "⬅️ اختر صورة أخرى";
            backBtn.style.padding = "6px 12px";
            backBtn.style.fontSize = "13px";
            backBtn.style.borderRadius = "12px";
            backBtn.style.border = "none";
            backBtn.style.background = "#FF9800";
            backBtn.style.color = "#FFF";
            backBtn.style.cursor = "pointer";
            backBtn.style.fontWeight = "bold";
            backBtn.style.boxShadow = "0 3px 0 #E65100";
            backBtn.addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                showCatalogScreen();
            });
            controls.appendChild(backBtn);

            const activePuzzle = puzzles[currentPuzzleIdx];
            const titleInfo = document.createElement("span");
            titleInfo.innerText = activePuzzle.name;
            titleInfo.style.fontSize = "15px";
            titleInfo.style.fontWeight = "bold";
            titleInfo.style.color = "#4A148C";
            controls.appendChild(titleInfo);

            container.appendChild(controls);

            // Game Layout
            const gameLayout = document.createElement("div");
            gameLayout.style.display = "flex";
            gameLayout.style.flexDirection = "column";
            gameLayout.style.alignItems = "center";
            gameLayout.style.gap = "15px";
            gameLayout.style.width = "100%";
            container.appendChild(gameLayout);

            // Main Stage
            const mainStage = document.createElement("div");
            mainStage.style.display = "flex";
            mainStage.style.flexDirection = "row";
            mainStage.style.flexWrap = "wrap";
            mainStage.style.justifyContent = "center";
            mainStage.style.alignItems = "center";
            mainStage.style.gap = "15px";
            gameLayout.appendChild(mainStage);

            // Board
            const board = document.createElement("div");
            board.style.width = "300px";
            board.style.height = "300px";
            board.style.background = "#ECEFF1";
            board.style.borderRadius = "12px";
            board.style.boxShadow = "inset 0 4px 10px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)";
            board.style.display = "grid";
            board.style.gridTemplateColumns = "repeat(3, 100px)";
            board.style.gridTemplateRows = "repeat(3, 100px)";
            board.style.position = "relative";
            board.style.direction = "ltr";
            mainStage.appendChild(board);

            // Palette
            const palette = document.createElement("div");
            palette.style.width = "100%";
            palette.style.maxWidth = "450px";
            palette.style.minHeight = "120px";
            palette.style.background = "rgba(255, 255, 255, 0.6)";
            palette.style.border = "2px dashed #B0BEC5";
            palette.style.borderRadius = "16px";
            palette.style.padding = "15px";
            palette.style.boxSizing = "border-box";
            palette.style.display = "flex";
            palette.style.flexWrap = "wrap";
            palette.style.justifyContent = "center";
            palette.style.alignItems = "center";
            palette.style.gap = "15px";
            palette.style.position = "relative";
            palette.style.direction = "ltr";
            gameLayout.appendChild(palette);

            // Restart Button
            const restartBtn = document.createElement("button");
            restartBtn.className = "menu-btn restart-btn";
            restartBtn.innerText = "إعادة اللعب 🔄";
            restartBtn.style.padding = "8px 16px";
            restartBtn.style.fontSize = "15px";
            restartBtn.style.background = "#7C4DFF";
            restartBtn.style.color = "#FFF";
            restartBtn.style.border = "none";
            restartBtn.style.borderRadius = "20px";
            restartBtn.style.cursor = "pointer";
            restartBtn.style.boxShadow = "0 3px 0 #5E35B1";
            restartBtn.addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                setupGame();
            });
            gameLayout.appendChild(restartBtn);

            function setupGame() {
                matchedCount = 0;
                board.innerHTML = "";
                palette.innerHTML = "";

                const slots = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const slot = document.createElement("div");
                        slot.style.width = "100px";
                        slot.style.height = "100px";
                        slot.style.position = "relative";
                        slot.style.boxSizing = "border-box";

                        const pcfg = pieceConfigs[r][c];
                        const pathStr = generatePathString(pcfg);

                        slot.innerHTML = `
                            <svg viewBox="${c*100 - 20} ${r*100 - 20} 140 140" width="140" height="140" style="position: absolute; left: -20px; top: -20px; pointer-events: none; opacity: 0.25; z-index: 1;">
                                <path d="${pathStr}" transform="translate(${c*100}, ${r*100})" fill="#CFD8DC" stroke="#455A64" stroke-width="2" stroke-dasharray="3 3"/>
                            </svg>
                        `;
                        board.appendChild(slot);
                        slots.push({ row: r, col: c, element: slot });
                    }
                }

                const pieces = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const pcfg = pieceConfigs[r][c];
                        const pathStr = generatePathString(pcfg);
                        const clipId = `clip-${r}-${c}-${clipSeed}`;

                        const pieceEl = document.createElement("div");
                        pieceEl.style.width = "100px";
                        pieceEl.style.height = "100px";
                        pieceEl.style.cursor = "grab";
                        pieceEl.style.position = "relative";
                        pieceEl.style.touchAction = "none";
                        pieceEl.style.zIndex = "10";
                        pieceEl.dataset.row = r;
                        pieceEl.dataset.col = c;

                        pieceEl.innerHTML = `
                            <svg viewBox="${c*100 - 20} ${r*100 - 20} 140 140" width="140" height="140" style="position: absolute; left: -20px; top: -20px; pointer-events: none; overflow: visible;">
                                <defs>
                                    <clipPath id="${clipId}">
                                        <path d="${pathStr}" transform="translate(${c*100}, ${r*100})" />
                                    </clipPath>
                                </defs>
                                <path d="${pathStr}" transform="translate(${c*100}, ${r*100})" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="5" />
                                <g clip-path="url(#${clipId})">
                                    ${activePuzzle.svg}
                                </g>
                                <path d="${pathStr}" transform="translate(${c*100}, ${r*100})" fill="none" stroke="#FFFFFF" stroke-width="2" />
                            </svg>
                        `;

                        pieceEl.addEventListener("pointerdown", onPointerDown);
                        pieces.push(pieceEl);
                    }
                }

                const shuffled = [...pieces].sort(() => Math.random() - 0.5);
                shuffled.forEach(p => palette.appendChild(p));
            }

            function onPointerDown(e) {
                e.preventDefault();
                const piece = e.currentTarget;
                piece.style.cursor = "grabbing";
                piece.style.zIndex = "1000";

                if (window.sound) window.sound.playClick();

                const rect = piece.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;

                const originalParent = piece.parentElement;
                const originalPosition = {
                    left: piece.style.left,
                    top: piece.style.top,
                    position: piece.style.position,
                    width: piece.style.width,
                    height: piece.style.height
                };

                const containerRect = container.getBoundingClientRect();
                piece.style.position = "absolute";
                updatePosition(e.clientX, e.clientY);
                container.appendChild(piece);

                function updatePosition(clientX, clientY) {
                    const targetX = clientX - containerRect.left - offsetX;
                    const targetY = clientY - containerRect.top - offsetY;
                    piece.style.left = `${targetX}px`;
                    piece.style.top = `${targetY}px`;
                    piece.style.width = "100px";
                    piece.style.height = "100px";
                }

                function onPointerMove(moveEvt) {
                    updatePosition(moveEvt.clientX, moveEvt.clientY);
                }

                function onPointerUp(upEvt) {
                    window.removeEventListener("pointermove", onPointerMove);
                    window.removeEventListener("pointerup", onPointerUp);

                    piece.style.cursor = "grab";
                    piece.style.zIndex = "10";

                    const targetRow = parseInt(piece.dataset.row);
                    const targetCol = parseInt(piece.dataset.col);

                    const slots = board.children;
                    const slotIndex = targetRow * 3 + targetCol;
                    const targetSlot = slots[slotIndex];

                    const boardRect = board.getBoundingClientRect();
                    const currentContainerRect = container.getBoundingClientRect();
                    const boardLeftInContainer = boardRect.left - currentContainerRect.left;
                    const boardTopInContainer = boardRect.top - currentContainerRect.top;

                    const correctLeft = boardLeftInContainer + targetCol * 100;
                    const correctTop = boardTopInContainer + targetRow * 100;

                    const currentLeft = parseFloat(piece.style.left);
                    const currentTop = parseFloat(piece.style.top);

                    const dx = currentLeft - correctLeft;
                    const dy = currentTop - correctTop;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 60) {
                        piece.style.position = "absolute";
                        piece.style.left = "0px";
                        piece.style.top = "0px";
                        piece.style.width = "100px";
                        piece.style.height = "100px";

                        const svgEl = piece.querySelector("svg");
                        svgEl.style.left = "-20px";
                        svgEl.style.top = "-20px";
                        svgEl.style.width = "140px";
                        svgEl.style.height = "140px";

                        targetSlot.appendChild(piece);
                        piece.removeEventListener("pointerdown", onPointerDown);
                        piece.style.cursor = "default";

                        if (window.sound) window.sound.playBubble();

                        piece.classList.add("bounce-anim");
                        setTimeout(() => piece.classList.remove("bounce-anim"), 500);

                        matchedCount++;
                        checkVictory();
                    } else {
                        piece.classList.add("shake-anim");
                        if (window.sound) window.sound.playFail();

                        piece.style.position = originalPosition.position;
                        piece.style.left = originalPosition.left;
                        piece.style.top = originalPosition.top;
                        piece.style.width = originalPosition.width;
                        piece.style.height = originalPosition.height;

                        const svgEl = piece.querySelector("svg");
                        svgEl.style.left = "-20px";
                        svgEl.style.top = "-20px";
                        svgEl.style.width = "140px";
                        svgEl.style.height = "140px";

                        originalParent.appendChild(piece);
                        setTimeout(() => piece.classList.remove("shake-anim"), 500);
                    }
                }

                window.addEventListener("pointermove", onPointerMove);
                window.addEventListener("pointerup", onPointerUp);
            }

            function checkVictory() {
                if (matchedCount === 9) {
                    setTimeout(() => {
                        if (window.sound) window.sound.playSuccess();

                        const modal = document.createElement("div");
                        modal.className = "game-modal show";

                        modal.innerHTML = `
                            <div class="modal-content">
                                <h2 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 26px;">ممتاز! رائع جداً 🎉</h2>
                                <p style="color: #555; margin: 0 0 20px 0; font-size: 16px;">لقد قمت بتركيب الصورة كاملة بنجاح!</p>
                                <button class="menu-btn restart-btn" style="background:#7C4DFF; color:#FFF; border:none; padding:10px 20px; font-size:16px; border-radius:25px; cursor:pointer;">العب مرة أخرى 🔄</button>
                            </div>
                        `;

                        modal.querySelector("button").addEventListener("click", () => {
                            if (window.sound) window.sound.playClick();
                            modal.remove();
                            setupGame();
                        });

                        container.appendChild(modal);
                    }, 600);
                }
            }

            setupGame();
        }

        showCatalogScreen();
    };
})();
