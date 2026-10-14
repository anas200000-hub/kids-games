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

    // ------------------------------------------------------------------
    // Anime-style (cel-shaded) rendering helpers for hair & clothes
    // ------------------------------------------------------------------
    let gdUid = 0;
    const gdId = (p) => `gd-${p}-${++gdUid}`;
    const SHADE = '#2a1438'; // translucent cel-shadow tint (works on any color or print)

    function mixHex(a, b, t) {
        const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
        const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
        return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
    }

    function luminance(c) {
        const p = parseInt(c.slice(1), 16);
        return (0.299 * ((p >> 16) & 255) + 0.587 * ((p >> 8) & 255) + 0.114 * (p & 255)) / 255;
    }

    // Builds a cel-shading palette (base / shadow / highlight / lineart) from one flat color
    function tone(c) {
        const lum = luminance(c);
        const base = lum < 0.15 ? mixHex(c, '#4a4a5e', 0.4) : c;
        return {
            base,
            shadow: mixHex(base, '#3b2450', lum > 0.9 ? 0.2 : 0.3),
            deep: mixHex(base, '#24122e', 0.5),
            light: mixHex(base, '#ffffff', 0.45),
            shine: mixHex(base, '#ffffff', 0.78),
            line: mixHex(base, '#1f1020', 0.72),
            isLight: lum > 0.8
        };
    }

    const ln = (t, w = 1) => `stroke="${t.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
    // Draws a shape on the left side plus its mirror image on the right side (x -> 200 - x)
    const mirror = (s) => `${s}<g transform="translate(200,0) scale(-1,1)">${s}</g>`;
    const WHITE = tone('#ffffff');
    const PINK = tone('#ff5c93');
    const RED = tone('#e53950');
    const GOLD = { base: '#ffd54a', shadow: '#d9a21e', line: '#8a5a12', shine: '#fff6c4' };

    // Glossy "angel ring" highlight band across the crown of the hair
    function angelRing(t, y = 54, w = 25) {
        let d = `M ${100 - w},${y + 5} Q 100,${y - 8} ${100 + w},${y + 5}`;
        const n = 12;
        for (let i = 1; i < n; i++) {
            const x = 100 + w - (2 * w * i) / n;
            const u = (x - 100) / w;
            const top = y + 5 - 6.5 * (1 - u * u);
            d += ` L ${x.toFixed(1)},${(top + (i % 2 ? 5 : 2)).toFixed(1)}`;
        }
        return `<path d="${d} Z" fill="${t.shine}" opacity="0.85"/>`;
    }

    // Hair cap + pointed anime bang locks. locks = [notch, tip, notch, tip, ..., notch] ordered right -> left
    function animeBangs(t, locks, opts = {}) {
        const left = opts.left || [59, 92], right = opts.right || [141, 92], top = opts.top || 41;
        const q = (a, b, k) => `Q ${((a[0] + b[0]) / 2 + k).toFixed(1)},${((a[1] + b[1]) / 2).toFixed(1)} ${b[0]},${b[1]}`;
        let d = `M ${left[0]},${left[1]} C ${left[0] - 4},60 72,${top} 100,${top} C 128,${top} ${right[0] + 4},60 ${right[0]},${right[1]}`;
        let prev = right;
        locks.forEach(p => { d += ' ' + q(prev, p, p[1] > prev[1] ? 1.5 : -1.5); prev = p; });
        d += ' ' + q(prev, left, 0) + ' Z';
        let shade = '', strands = '';
        for (let i = 1; i < locks.length - 1; i += 2) {
            const a = locks[i - 1], tip = locks[i], b = locks[i + 1];
            const mx = a[0] + (b[0] - a[0]) * 0.45, my = Math.max(a[1], b[1]) + 3;
            shade += `M ${a[0] - 1},${a[1] + 1} L ${tip[0]},${tip[1] - 1.5} L ${mx.toFixed(1)},${my} Z `;
            const sx = (a[0] + b[0]) / 2;
            strands += `M ${sx},${Math.min(a[1], b[1]) - 9} Q ${sx},${tip[1] - 8} ${tip[0]},${tip[1] - 3} `;
        }
        return `<path d="${d}" fill="${t.base}"/>
            <path d="${shade}" fill="${t.shadow}"/>
            <path d="${strands}" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>
            ${opts.ring === false ? '' : angelRing(t)}
            <path d="${d}" fill="none" ${ln(t)}/>`;
    }

    // Long face-framing locks in front of the ears
    function sideLocks(t, len) {
        return mirror(`<path d="M 67,70 C 60,80 57,98 57,${len - 8} Q 57,${len - 3} 59,${len} Q 61,${len - 9} 63,${len - 15} C 65,100 67,88 71,77 Z" fill="${t.base}" ${ln(t, 0.9)}/>
            <path d="M 68,76 C 64,90 62,104 61.5,${len - 14} C 63,104 65,90 70,79 Z" fill="${t.shadow}"/>
            <path d="M 62,84 Q 59,100 59.5,${len - 10}" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>`);
    }

    function backHair(t, d, inner, strands) {
        return `<path d="${d}" fill="${t.base}" ${ln(t, 1.1)}/>
            ${inner ? `<path d="${inner}" fill="${t.shadow}"/>` : ''}
            ${strands ? `<path d="${strands}" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>` : ''}`;
    }

    // Braid made of alternating tilted segments. pts = [[x, y, extraAngle]]
    function braidChain(t, pts) {
        return pts.map((p, i) => {
            const rot = (i % 2 ? 28 : -28) + (p[2] || 0);
            return `<g transform="translate(${p[0]},${p[1]}) rotate(${rot.toFixed(1)})">
                <ellipse cx="0" cy="0" rx="7.5" ry="5.2" fill="${t.base}" ${ln(t, 0.9)}/>
                <path d="M -7,0.8 Q 0,7 7,0.8 Q 0,3 -7,0.8 Z" fill="${t.shadow}"/>
                <path d="M -4,-2.5 Q 0,-4 4,-2.5" fill="none" stroke="${t.shine}" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
            </g>`;
        }).join('');
    }

    function flower(cx, cy, r, petal = '#ffffff', center = '#ffd54a') {
        let s = '';
        for (let i = 0; i < 5; i++) {
            const a = (i * 72 - 90) * Math.PI / 180;
            s += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.75).toFixed(2)}" fill="${petal}"/>`;
        }
        return `<g>${s}<circle cx="${cx}" cy="${cy}" r="${(r * 0.6).toFixed(2)}" fill="${center}"/></g>`;
    }

    function bow(cx, cy, s, t) {
        return `<g transform="translate(${cx},${cy}) scale(${s})">
            <path d="M -1,1 L -5,11 L -2.5,10 L -1.5,12 L 1.5,2 Z M 1,1 L 5,11 L 2.5,10 L 1.5,12 L -1.5,2 Z" fill="${t.shadow}" ${ln(t, 0.8)}/>
            <path d="M 0,0 C -5,-7 -12,-6 -11,0 C -12,6 -5,7 0,0 Z M 0,0 C 5,-7 12,-6 11,0 C 12,6 5,7 0,0 Z" fill="${t.base}" ${ln(t, 0.8)}/>
            <path d="M -1.5,1 C -5,5 -9,5 -10.5,2.5 C -10,5.5 -5,6 -1.5,1 Z M 1.5,1 C 5,5 9,5 10.5,2.5 C 10,5.5 5,6 1.5,1 Z" fill="${t.shadow}"/>
            <path d="M -8,-3 Q -6,-4.5 -4,-3.5" fill="none" stroke="${t.shine}" stroke-width="1.1" stroke-linecap="round"/>
            <ellipse cx="0" cy="0" rx="2.4" ry="2.9" fill="${t.base}" ${ln(t, 0.8)}/>
        </g>`;
    }

    const sparkle = (x, y, s, c = '#ffffff') => `<path d="M ${x},${y - s} Q ${x},${y} ${x + s},${y} Q ${x},${y} ${x},${y + s} Q ${x},${y} ${x - s},${y} Q ${x},${y} ${x},${y - s} Z" fill="${c}"/>`;

    const TIARA = `<path d="M 77,60 L 80,49 L 88,56 L 94,45 L 100,53 L 106,45 L 112,56 L 120,49 L 123,60 Q 100,54 77,60 Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="0.9" stroke-linejoin="round"/>
        <path d="M 77,60 Q 100,54 123,60 L 123,62.5 Q 100,56.5 77,62.5 Z" fill="${GOLD.shadow}" stroke="${GOLD.line}" stroke-width="0.6"/>
        <path d="M 81,52 L 83,57 M 94,48.5 L 95,54" stroke="${GOLD.shine}" stroke-width="1" stroke-linecap="round"/>
        <circle cx="100" cy="56.5" r="2.8" fill="#ff4f8b" stroke="#a3204e" stroke-width="0.6"/>
        <circle cx="99.2" cy="55.6" r="0.9" fill="#ffffff"/>
        <circle cx="88" cy="58.4" r="1.6" fill="#4fc3f7" stroke="#1b6a8f" stroke-width="0.4"/>
        <circle cx="112" cy="58.4" r="1.6" fill="#4fc3f7" stroke="#1b6a8f" stroke-width="0.4"/>`;

    // Bang lock layouts (notch, tip, notch, ... right -> left)
    const BANGS_FULL = [[132, 64], [125, 78], [117, 60], [110, 77], [101, 59], [92, 78], [84, 60], [75, 78], [68, 64]];
    const BANGS_CURLY = [[133, 66], [127, 77], [120, 62], [112, 76], [104, 61], [96, 76], [88, 61], [80, 77], [72, 64]];
    const BANGS_BLUNT = [[134, 66], [128, 77], [122, 70], [116, 77.5], [110, 71], [104, 78], [98, 71], [92, 78], [86, 71], [80, 77.5], [74, 70], [70, 76], [66, 66]];
    const BANGS_SWEPT = [[133, 64], [128, 79], [121, 58], [110, 78], [104, 56], [93, 77], [87, 57], [77, 76], [71, 62]];
    const BANGS_SPIKY = [[136, 66], [131, 80], [124, 57], [116, 78], [109, 55], [101, 77], [93, 55], [85, 78], [77, 58], [69, 80], [65, 68]];
    const BANGS_PART = [[134, 66], [127, 77], [119, 60], [109, 75], [101, 58], [91, 77], [83, 60], [75, 78], [68, 64]];

    // ---------- Clothing helpers ----------
    const SHIRT = 'M 78,125 C 82,123 87,122 90,122 Q 100,131 110,122 C 113,122 118,123 122,125 C 124,140 123,158 126,177 Q 100,182 74,177 C 77,158 76,140 78,125 Z';

    // Torso garment with clipped cel shading, folds and highlight. `extra` = prints drawn under the shading
    function shirtBody(t, d = SHIRT, extra = '') {
        const id = gdId('top');
        return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
            <path d="${d}" fill="${t.base}"/>
            <g clip-path="url(#${id})">
                ${extra}
                <path d="M 112,116 C 120,140 119,162 115,190 L 140,190 L 140,116 Z" fill="${SHADE}" opacity="0.22"/>
                <path d="M 66,171 Q 100,176 134,171 L 134,192 L 66,192 Z" fill="${SHADE}" opacity="0.14"/>
                <path d="M 86,165 Q 90,171 88,178 M 112,164 Q 109,171 111,178 M 95,147 Q 99,154 97,161" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.45"/>
                <path d="M 82,131 Q 80.5,150 80.5,167" fill="none" stroke="${t.shine}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
            </g>
            <path d="${d}" fill="none" ${ln(t)}/>`;
    }

    function sleeveShort(t, cuff) {
        return mirror(`<path d="M 81,126 C 70,127 63,137 60,152 Q 67,157 75,156 C 75,147 77,138 81,133 Z" fill="${t.base}" ${ln(t)}/>
            <path d="M 61,148 Q 68,153 75.3,151.5 L 75,156 Q 67,157 60,152 Z" fill="${cuff || t.shadow}" ${ln(t, 0.7)}/>
            <path d="M 75,154 C 75,147 77,139 80,134 L 78,134 C 74,140 72.5,147 72.5,154 Z" fill="${SHADE}" opacity="0.2"/>
            <path d="M 66,137 Q 68,144 67,150" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>
            <path d="M 70,131 Q 65,137 63,146" fill="none" stroke="${t.shine}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`);
    }

    function sleevePuff(t, cuff) {
        return mirror(`<path d="M 83,126 C 70,121 57,129 57,143 C 57,151 63,155 69,153 Q 74,156 77,151 C 77,143 79,136 83,132 Z" fill="${t.base}" ${ln(t)}/>
            <path d="M 58,146 C 60,152 66,154 70,152 Q 74,154 77,150 L 77,145 Q 70,150 58,143 Z" fill="${t.shadow}"/>
            <path d="M 63,131 Q 65,140 63,149 M 70,127 Q 72,138 71,151" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>
            <path d="M 66,127 Q 60,131 59,139" fill="none" stroke="${t.shine}" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
            <path d="M 60,150 Q 68,157 77,151 L 77.5,155 Q 68,161 60,154 Z" fill="${cuff || t.light}" ${ln(t, 0.7)}/>`);
    }

    function sleeveLong(t, cuff) {
        return mirror(`<path d="M 81,126 C 70,128 63,142 61,158 C 60,164 60.5,169 61.5,172 L 75.5,171 C 74.5,160 75.5,146 81,134 Z" fill="${t.base}" ${ln(t)}/>
            <path d="M 75.5,171 C 74.5,160 75.5,146 81,134 L 79,136 C 73,148 71.5,160 71.5,171 Z" fill="${SHADE}" opacity="0.22"/>
            <path d="M 62.5,152 Q 66,151 68,154 M 63,157 Q 66.5,156 69,159" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.55"/>
            <path d="M 70,132 Q 64,142 62.5,152" fill="none" stroke="${t.shine}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>
            <path d="M 61.2,166 L 75,165.5 L 75.6,172 L 61.6,172.8 Z" fill="${cuff || t.shadow}" ${ln(t, 0.7)}/>
            <path d="M 64,166 L 64.2,172.5 M 67,165.9 L 67.2,172.4 M 70,165.8 L 70.2,172.2 M 73,165.6 L 73.2,172" stroke="${t.line}" stroke-width="0.4" opacity="0.5"/>`);
    }

    // Trousers outline. hw = half width of each leg at the hem, y = hem height
    function pantsPath(hw, y) {
        const o = (y - (y - 174) * 0.4).toFixed(1), i = (y - (y - 197) * 0.6).toFixed(1);
        return `M 75,174 L 125,174 C 127,190 ${114 + hw},${o} ${114 + hw},${y} Q 114,${y + 2} ${114 - hw},${y} C ${114 - hw},${i} 103,198 100,197 C 97,198 ${86 + hw},${i} ${86 + hw},${y} Q 86,${y + 2} ${86 - hw},${y} C ${86 - hw},${o} 73,190 75,174 Z`;
    }

    function pantsBase(t, hw, y, extra = '', opts = {}) {
        const d = pantsPath(hw, y), id = gdId('pants');
        const knee = 174 + (y - 174) * 0.6, i = (y - (y - 197) * 0.6).toFixed(1);
        const band = opts.noBand
            ? `<path d="M 75,174 L 125,174 L 125.3,178 Q 100,180 74.7,178 Z" fill="${t.shadow}" ${ln(t, 0.7)}/>`
            : `<path d="M 75,174 L 125,174 L 125.4,180 Q 100,182 74.6,180 Z" fill="${t.base}" ${ln(t, 0.8)}/>
               <path d="M 80,174.5 L 80,180.5 M 92,174.5 L 92,181.5 M 108,174.5 L 108,181.5 M 120,174.5 L 120,180.5" stroke="${t.line}" stroke-width="0.8"/>
               <circle cx="100" cy="177.2" r="1.5" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="0.5"/>
               <path d="M 103,181 L 103,191 Q 102,194 100,195.5" fill="none" ${ln(t, 0.7)}/>
               <path d="M 77.5,181 Q 84,185 86.5,180.8 M 122.5,181 Q 116,185 113.5,180.8" fill="none" ${ln(t, 0.7)}/>`;
        return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
            <path d="${d}" fill="${t.base}"/>
            <g clip-path="url(#${id})">
                ${extra}
                <path d="M 117,176 C 121,196 ${114 + hw - 4},${y - 20} ${114 + hw - 3},${y + 4} L 140,${y + 4} L 140,170 Z" fill="${SHADE}" opacity="0.22"/>
                <path d="M 101,197 C 104,205 ${114 - hw + 3},${i} ${114 - hw + 3},${y + 4} L ${114 - hw - 4},${y + 4} L 100,198 Z" fill="${SHADE}" opacity="0.18"/>
                <path d="M 70,180 Q 100,184 130,180 L 130,184 Q 100,188 70,184 Z" fill="${SHADE}" opacity="0.16"/>
                <path d="M 82,${knee - 2} Q 86,${knee + 2} 91,${knee - 1} M 109,${knee - 1} Q 114,${knee + 2} 118,${knee - 2} M ${86 - hw + 2},${y - 6} Q 86,${y - 3} ${86 + hw - 2},${y - 7} M ${114 - hw + 2},${y - 7} Q 114,${y - 3} ${114 + hw - 2},${y - 6}" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>
                <path d="M 78,184 C 77,200 ${86 - hw + 3},${y - 30} ${86 - hw + 3},${y - 6}" fill="none" stroke="${t.shine}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
            </g>
            ${band}
            <path d="${d}" fill="none" ${ln(t)}/>`;
    }



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
                name: 'شعر طويل منسدل (أنمي)',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 60,64 C 49,74 46,98 46,126 C 46,160 44,184 41,202 L 51,195 L 57,204 L 65,193 L 73,200 L 78,184 L 122,184 L 127,200 L 135,193 L 143,204 L 149,195 L 159,202 C 156,184 154,160 154,126 C 154,98 151,74 140,64 C 128,44 72,44 60,64 Z',
                        'M 63,100 C 61,130 61,162 65,190 L 72,196 L 78,150 L 122,150 L 128,196 L 135,190 C 139,162 139,130 137,100 Z',
                        'M 52,108 Q 50,150 49,192 M 148,108 Q 150,150 151,192 M 58,118 Q 56,160 59,198 M 142,118 Q 144,160 141,198')
                        + `<path d="M 50,98 Q 48,128 48,160 M 150,98 Q 152,128 152,160" fill="none" stroke="${t.shine}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>`;
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    return sideLocks(t, 136) + animeBangs(t, BANGS_FULL);
                }
            },
            {
                id: 'hair2',
                name: 'كعكتين أنمي (أودانغو)',
                backSvg: (c) => {
                    const t = tone(c);
                    const bun = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="16" fill="${t.base}" ${ln(t, 1.1)}/>
                        <path d="M ${cx + 15},${cy + 5} A 16 16 0 0 1 ${cx - 9},${cy + 13} A 13 13 0 0 0 ${cx + 15},${cy + 5} Z" fill="${t.shadow}"/>
                        <path d="M ${cx - 9},${cy - 3} Q ${cx},${cy - 11} ${cx + 9},${cy - 3} M ${cx - 11},${cy + 4} Q ${cx},${cy + 11} ${cx + 11},${cy + 3} M ${cx - 4},${cy - 14} Q ${cx + 6},${cy} ${cx - 2},${cy + 14}" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.55"/>
                        <path d="M ${cx - 11},${cy - 6} Q ${cx - 7},${cy - 12} ${cx - 1},${cy - 13}" fill="none" stroke="${t.shine}" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>`;
                    return backHair(t,
                        'M 60,68 C 51,80 50,102 54,118 Q 62,124 70,118 L 130,118 Q 138,124 146,118 C 150,102 149,80 140,68 C 128,46 72,46 60,68 Z',
                        'M 62,98 C 60,108 60,114 64,118 L 136,118 C 140,114 140,108 138,98 Z')
                        + bun(64, 50) + bun(136, 50);
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    return sideLocks(t, 114) + animeBangs(t, BANGS_FULL) + bow(77, 57, 0.6, PINK) + bow(123, 57, 0.6, PINK);
                }
            },
            {
                id: 'hair3',
                name: 'شعر كيرلي منفوش مع تاج ذهبي',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 64,60 Q 52,50 46,64 Q 34,70 40,86 Q 30,96 38,110 Q 28,124 40,136 Q 34,152 50,158 Q 56,170 70,164 L 130,164 Q 144,170 150,158 Q 166,152 160,136 Q 172,124 162,110 Q 170,96 160,86 Q 166,70 154,64 Q 148,50 136,60 Q 122,40 100,42 Q 78,40 64,60 Z',
                        'M 60,100 Q 54,122 58,150 Q 68,158 80,150 L 120,150 Q 132,158 142,150 Q 146,122 140,100 Z',
                        'M 44,94 q 6,-4 9,2 M 41,124 q 6,-4 9,2 M 52,150 q 6,-4 9,2 M 156,94 q -6,-4 -9,2 M 159,124 q -6,-4 -9,2 M 148,150 q -6,-4 -9,2 M 50,72 q 6,-3 8,3 M 150,72 q -6,-3 -8,3')
                        + `<path d="M 42,80 Q 40,86 43,92 M 36,112 Q 35,118 38,124 M 42,140 Q 42,146 46,150" fill="none" stroke="${t.shine}" stroke-width="2" stroke-linecap="round" opacity="0.65"/>`;
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    const ringlet = `<path d="M 64,74 C 55,82 54,94 59,99 C 53,104 53,114 59,118 C 54,123 55,132 62,135 C 61,129 64,125 65,121 C 61,116 62,109 65,105 C 61,99 62,90 68,81 Z" fill="${t.base}" ${ln(t, 0.9)}/>
                        <path d="M 62,104 C 61,110 62,115 64,119 M 63,85 C 61,90 61,95 62,99" fill="none" stroke="${t.shadow}" stroke-width="2"/>
                        <path d="M 56,101 Q 60,104 64,102 M 56,120 Q 60,123 64,121" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.6"/>
                        <path d="M 57,92 Q 57,96 59,98 M 56,111 Q 56,115 58,117" fill="none" stroke="${t.shine}" stroke-width="1.4" stroke-linecap="round"/>`;
                    return mirror(ringlet) + animeBangs(t, BANGS_CURLY, { ring: false }) + TIARA;
                }
            },
            {
                id: 'hair4',
                name: 'قصة بوب هيمي (أنمي)',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 58,66 C 48,78 46,100 48,118 C 50,128 56,132 64,130 L 70,124 L 130,124 L 136,130 C 144,132 150,128 152,118 C 154,100 152,78 142,66 C 130,44 70,44 58,66 Z',
                        'M 64,96 C 62,110 62,120 66,126 L 134,126 C 138,120 138,110 136,96 Z',
                        'M 53,90 Q 50,108 54,126 M 147,90 Q 150,108 146,126')
                        + `<path d="M 51,92 Q 49,104 50,116" fill="none" stroke="${t.shine}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`;
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    return sideLocks(t, 126) + animeBangs(t, BANGS_BLUNT);
                }
            },
            {
                id: 'hair5',
                name: 'ذيل حصان عالي متمايل',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 122,47 C 140,36 163,50 165,76 C 167,100 160,130 167,160 L 159,154 L 157,171 L 149,158 L 145,173 L 141,153 C 136,127 146,98 141,76 C 139,64 131,55 122,51 Z',
                        'M 141,76 C 146,98 136,127 141,153 L 146,157 C 143,130 152,100 149,78 Z',
                        'M 152,60 Q 160,90 155,130 Q 152,150 156,166 M 145,70 Q 150,100 145,140')
                        + `<path d="M 160,70 Q 163,92 160,115" fill="none" stroke="${t.shine}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`
                        + backHair(t,
                            'M 58,70 C 50,84 50,104 56,118 L 144,118 C 150,104 150,84 142,70 C 130,44 70,44 58,70 Z',
                            'M 62,98 C 60,108 60,114 63,118 L 137,118 C 140,114 140,108 138,98 Z');
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    return sideLocks(t, 118) + animeBangs(t, BANGS_SWEPT)
                        + `<ellipse cx="129" cy="46" rx="8.5" ry="5.5" transform="rotate(-25 129 46)" fill="${PINK.base}" ${ln(PINK, 0.8)}/>
                        <path d="M 124,44 Q 126,49 125,51 M 129,41.5 Q 131,46 130,50 M 134,40 Q 135,44 135,47" fill="none" stroke="${PINK.line}" stroke-width="0.6" opacity="0.6"/>
                        <path d="M 123,45 Q 126,41 131,40" fill="none" stroke="${PINK.shine}" stroke-width="1.2" stroke-linecap="round"/>`;
                }
            },
            {
                id: 'hair6',
                name: 'ضفيرتين طويلتين بشرائط',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 58,70 C 50,84 50,104 56,120 L 144,120 C 150,104 150,84 142,70 C 130,44 70,44 58,70 Z',
                        'M 62,98 C 60,108 60,116 63,120 L 137,120 C 140,116 140,108 138,98 Z');
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    const pts = [[58, 106], [56.5, 116], [55.5, 126], [54.5, 136], [53.5, 146], [52.5, 156], [51.5, 166]];
                    const braid = `<path d="M 61,80 C 56,90 55,99 57,108 L 65,106 C 64,97 65,88 67,81 Z" fill="${t.base}" ${ln(t, 0.9)}/>`
                        + braidChain(t, pts)
                        + `<path d="M 47,174 Q 49,186 47,194 Q 51,188 52,195 Q 53,188 56,194 Q 55,184 56,174 Z" fill="${t.base}" ${ln(t, 0.9)}/>
                        <path d="M 52,176 Q 53,186 52,193" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.5"/>`
                        + bow(51.5, 172, 0.55, PINK);
                    return mirror(braid) + animeBangs(t, BANGS_FULL);
                }
            },
            {
                id: 'hair7',
                name: 'قصة قصيرة شقية مع خصلة أنمي',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 60,72 C 53,84 53,100 57,112 L 62,118 L 66,112 L 70,117 L 74,112 L 126,112 L 130,117 L 134,112 L 138,118 L 143,112 C 147,100 147,84 140,72 C 130,46 70,46 60,72 Z',
                        'M 62,96 C 61,104 61,110 63,114 L 137,114 C 139,110 139,104 138,96 Z');
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    return sideLocks(t, 106) + animeBangs(t, BANGS_SPIKY)
                        + `<path d="M 99,42 C 101,30 112,26 116,32 C 110,30 104,34 102,42 Z" fill="${t.base}" ${ln(t, 0.9)}/>`;
                }
            },
            {
                id: 'hair8',
                name: 'ضفيرة تاج مع ورود',
                backSvg: (c) => {
                    const t = tone(c);
                    return backHair(t,
                        'M 58,68 C 47,80 45,104 47,126 Q 50,140 61,136 Q 66,145 74,137 L 126,137 Q 134,145 139,136 Q 150,140 153,126 C 155,104 153,80 142,68 C 130,44 70,44 58,68 Z',
                        'M 62,98 C 60,114 60,128 64,134 L 136,134 C 140,128 140,114 138,98 Z',
                        'M 52,96 Q 50,115 53,132 M 148,96 Q 150,115 147,132');
                },
                frontSvg: (c) => {
                    const t = tone(c);
                    const P0 = [64, 73], P1 = [100, 29], P2 = [136, 73];
                    const pts = [];
                    for (let i = 0; i <= 10; i++) {
                        const s = i / 10, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, e = s * s;
                        const x = a * P0[0] + b * P1[0] + e * P2[0], y = a * P0[1] + b * P1[1] + e * P2[1];
                        const dx = 2 * (1 - s) * (P1[0] - P0[0]) + 2 * s * (P2[0] - P1[0]);
                        const dy = 2 * (1 - s) * (P1[1] - P0[1]) + 2 * s * (P2[1] - P1[1]);
                        pts.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.atan2(dy, dx) * 180 / Math.PI + 90]);
                    }
                    return sideLocks(t, 128) + animeBangs(t, BANGS_PART, { ring: false }) + braidChain(t, pts)
                        + [2, 5, 8].map(k => flower(pts[k][0], pts[k][1], 2.6, '#ff8fb5', '#ffe066')).join('');
                }
            }
        ],
        tops: {
            tshirt: [
                {
                    id: 'top1',
                    name: 'بلوزة كشكش بياقة وفيونكة',
                    svg: (c) => {
                        const t = tone(c);
                        return sleevePuff(t, '#ffffff') + shirtBody(t)
                            + `<path d="M 74,172 Q 77,180 80,176 Q 83,181 86,177 Q 89,182 92,177.5 Q 95,182 98,178 Q 101,183 104,178 Q 107,182 110,177.5 Q 113,182 116,177 Q 119,181 122,176 Q 125,180 126.5,174 L 125.8,170 Q 100,175 74.3,170 Z" fill="${t.light}" ${ln(t, 0.8)}/>`
                            + mirror(`<path d="M 100,129 Q 93,126 89,121.5 Q 84,128 88,134 Q 95,136 100,129 Z" fill="#ffffff" ${ln(WHITE, 0.8)}/>
                                <path d="M 100,129 Q 95,133 89,132.5 Q 95,135.5 100,129 Z" fill="${WHITE.shadow}"/>`)
                            + bow(100, 130, 0.75, PINK)
                            + `<circle cx="100" cy="146" r="1.4" fill="#ffffff" ${ln(t, 0.5)}/><circle cx="100" cy="157" r="1.4" fill="#ffffff" ${ln(t, 0.5)}/>`;
                    }
                },
                {
                    id: 'top2',
                    name: 'بلوزة هولتر بحلقة ذهبية',
                    svg: (c) => {
                        const t = tone(c);
                        const d = 'M 84,131 C 90,128 110,128 116,131 C 120,146 121,160 124,177 Q 100,182 76,177 C 79,160 80,146 84,131 Z';
                        const gathers = `<path d="M 96,136 Q 90,147 86,162 M 104,136 Q 110,147 114,162 M 100,138 L 100,158" fill="none" stroke="${t.line}" stroke-width="0.7" opacity="0.5"/>`;
                        return mirror(`<path d="M 87,131 L 95,115 L 98.5,116 L 93,131 Z" fill="${t.base}" ${ln(t, 0.8)}/>`)
                            + shirtBody(t, d, gathers)
                            + `<circle cx="100" cy="132.5" r="4.6" fill="none" stroke="${GOLD.line}" stroke-width="3.4"/>
                            <circle cx="100" cy="132.5" r="4.6" fill="none" stroke="${GOLD.base}" stroke-width="2.2"/>
                            <path d="M 96.5,130 Q 98,128.3 100,128.2" fill="none" stroke="${GOLD.shine}" stroke-width="1" stroke-linecap="round"/>`;
                    }
                },
                {
                    id: 'top3',
                    name: 'تيشيرت رياضي بقلب',
                    svg: (c) => {
                        const t = tone(c);
                        const ac = t.isLight ? PINK.base : '#ffffff';
                        const print = `<path d="M 100,163 C 90,155 89.5,147 94.5,145.5 C 97.5,144.7 99.5,147 100,149 C 100.5,147 102.5,144.7 105.5,145.5 C 110.5,147 110,155 100,163 Z" fill="${ac}" ${ln(t, 0.7)}/>
                            <path d="M 94,149 Q 95,147 97,147.3" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
                            <path d="M 79.5,134 L 77.6,176 M 120.5,134 L 122.6,176" fill="none" stroke="${ac}" stroke-width="1.8"/>`;
                        return sleeveShort(t, ac) + shirtBody(t, SHIRT, print)
                            + `<path d="M 90,122 Q 100,131 110,122 L 112,122.6 Q 100,134.5 88,122.6 Z" fill="${ac}" ${ln(t, 0.7)}/>`;
                    }
                },
                {
                    id: 'top4',
                    name: 'زي البحّار المدرسي (أنمي)',
                    svg: (c) => {
                        const t = tone(c);
                        const cc = t.isLight ? '#2b3a67' : '#ffffff', sc = t.isLight ? '#ffffff' : t.base;
                        const ct = tone(cc);
                        return sleeveShort(t, cc) + shirtBody(t)
                            + mirror(`<path d="M 77.5,126.5 C 83,124 88,122.5 91,122 L 100,141 L 100,149.5 Z" fill="${cc}" ${ln(ct, 0.9)}/>
                                <path d="M 80.5,126.8 L 99.2,145.6" fill="none" stroke="${sc}" stroke-width="1.3"/>
                                <path d="M 91,122 L 100,141 L 100,144 L 90,124 Z" fill="${SHADE}" opacity="0.2"/>`)
                            + `<path d="M 98,152 L 95,167 L 100,164 L 105,167 L 102,152 Z" fill="${RED.base}" ${ln(RED, 0.7)}/>`
                            + bow(100, 149, 0.85, RED);
                    }
                },
                {
                    id: 'top5',
                    name: 'تيشيرت مخطط بحري',
                    svg: (c) => {
                        const t = tone(c);
                        const sc = t.isLight ? '#2b3a67' : '#ffffff';
                        const stripes = `<path d="M 60,134 H 140 V 139 H 60 Z M 60,146 H 140 V 151 H 60 Z M 60,158 H 140 V 163 H 60 Z M 60,170 H 140 V 175 H 60 Z" fill="${sc}" opacity="0.9"/>`;
                        return sleeveShort(t, sc) + shirtBody(t, SHIRT, stripes)
                            + `<path d="M 90,122 Q 100,131 110,122 L 112,122.6 Q 100,134.5 88,122.6 Z" fill="${sc}" ${ln(t, 0.7)}/>`;
                    }
                },
                {
                    id: 'top6',
                    name: 'كارديجان بأكمام طويلة',
                    svg: (c) => {
                        const t = tone(c);
                        const inner = `<path d="M 66,170.5 Q 100,175.5 134,170.5 L 134,192 L 66,192 Z" fill="${t.shadow}"/>
                            <path d="M 78,172 L 78,180 M 82,172.5 L 82,180 M 86,173 L 86,180 M 114,173 L 114,180 M 118,172.5 L 118,180 M 122,172 L 122,180" stroke="${t.line}" stroke-width="0.5" opacity="0.5"/>
                            <path d="M 89.5,120 Q 100,131 110.5,120 L 107,190 L 93,190 Z" fill="#ffffff"/>
                            <path d="M 89.5,120 Q 100,131 110.5,120 L 110.5,124 Q 100,135 89.5,124 Z" fill="${SHADE}" opacity="0.15"/>`;
                        return sleeveLong(t) + shirtBody(t, SHIRT, inner)
                            + `<path d="M 90,122.2 L 93.5,178.5 M 110,122.2 L 106.5,178.5" fill="none" ${ln(t, 0.9)}/>
                            <circle cx="92.2" cy="140" r="1.3" fill="${t.light}" ${ln(t, 0.5)}/>
                            <circle cx="92.8" cy="152" r="1.3" fill="${t.light}" ${ln(t, 0.5)}/>
                            <circle cx="93.3" cy="164" r="1.3" fill="${t.light}" ${ln(t, 0.5)}/>`
                            + mirror(`<path d="M 80,157 L 89,157 L 89.4,166 Q 85,167.5 80.5,166 Z" fill="none" ${ln(t, 0.7)}/>`);
                    }
                }
            ],
            jacket: [
                {
                    id: 'top7',
                    name: 'فستان صيفي مورّد بأكمام منفوخة',
                    svg: (c) => {
                        const t = tone(c);
                        const bodice = 'M 80,125 C 84,123 88,122 91,122 Q 100,132 109,122 C 112,122 116,123 120,125 C 122,140 121,156 120,170 Q 100,174 80,170 C 79,156 78,140 80,125 Z';
                        const skirt = 'M 80,168 Q 100,172 120,168 C 128,186 136,204 145,226 Q 134,232 123,228 Q 112,234 100,229 Q 88,234 77,228 Q 66,232 55,226 C 64,204 72,186 80,168 Z';
                        const sid = gdId('dress');
                        const petal = t.isLight ? '#ff8fb5' : '#ffffff';
                        const sash = t.isLight ? PINK : WHITE;
                        let prints = '';
                        [[74, 196], [92, 188], [110, 200], [126, 192], [84, 214], [102, 216], [120, 216], [66, 220], [136, 220], [100, 182]]
                            .forEach(p => { prints += flower(p[0], p[1], 1.7, petal, '#ffd54a'); });
                        return sleevePuff(t, sash.base)
                            + `<defs><clipPath id="${sid}"><path d="${skirt}"/></clipPath></defs>
                            <path d="${skirt}" fill="${t.base}"/>
                            <g clip-path="url(#${sid})">
                                ${prints}
                                <path d="M 92,170 Q 88,200 84,234 L 93,234 Q 93,200 95,170 Z M 107,170 Q 111,200 115,234 L 124,234 Q 118,200 110,170 Z M 116,169 Q 128,200 140,234 L 152,234 Q 136,196 120,167 Z" fill="${SHADE}" opacity="0.22"/>
                                <path d="M 84,171 Q 75,200 64,226" fill="none" stroke="${t.shine}" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>
                            </g>
                            <path d="${skirt}" fill="none" ${ln(t)}/>
                            <path d="M 58,221 Q 66,226 77,223 Q 88,228 100,224 Q 112,228 123,223 Q 134,226 142,221" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.5"/>`
                            + shirtBody(t, bodice)
                            + `<path d="M 79.6,164.5 Q 100,169.5 120.4,164.5 L 120.6,171 Q 100,176 79.4,171 Z" fill="${sash.base}" ${ln(sash, 0.8)}/>`
                            + bow(100, 168, 0.7, sash);
                    }
                },
                {
                    id: 'top8',
                    name: 'فستان الأميرة الملكي المنفوش',
                    svg: (c) => {
                        const t = tone(c);
                        const bodice = 'M 79,134 Q 89,129 100,135 Q 111,129 121,134 C 122,148 121,160 120,171 Q 100,175 80,171 C 79,160 78,148 79,134 Z';
                        const skirt = 'M 80,169 Q 100,173 120,169 C 138,186 152,206 158,230 Q 100,239 42,230 C 48,206 62,186 80,169 Z';
                        const ruffle = 'M 42,228 Q 100,237 158,228 L 160,244 Q 155,249 149,245 Q 143,250 137,246 Q 131,251 124,247 Q 118,251 112,247 Q 106,252 100,248 Q 94,252 88,247 Q 82,251 76,247 Q 69,251 63,246 Q 57,250 51,245 Q 45,249 40,244 Z';
                        const sid = gdId('gown'), rid = gdId('ruffle');
                        const accent = t.isLight ? PINK : WHITE;
                        const lace = `<path d="M 96,141 L 104,147 M 104,141 L 96,147 M 96,149 L 104,155 M 104,149 L 96,155 M 96,157 L 104,163 M 104,157 L 96,163" fill="none" stroke="${GOLD.base}" stroke-width="0.9"/>`;
                        return `<defs><clipPath id="${sid}"><path d="${skirt}"/></clipPath><clipPath id="${rid}"><path d="${ruffle}"/></clipPath></defs>
                            <path d="${skirt}" fill="${t.base}"/>
                            <g clip-path="url(#${sid})">
                                <path d="M 94,171 Q 86,200 76,236 L 88,236 Q 94,200 97,171 Z M 106,171 Q 114,200 124,236 L 134,236 Q 120,198 110,171 Z M 118,170 Q 136,198 150,236 L 165,236 Q 146,190 121,168 Z" fill="${SHADE}" opacity="0.22"/>
                                <path d="M 84,172 Q 70,200 56,228" fill="none" stroke="${t.shine}" stroke-width="2.4" stroke-linecap="round" opacity="0.5"/>
                                ${sparkle(70, 206, 2.6)}${sparkle(100, 196, 2.2)}${sparkle(128, 214, 2.6)}${sparkle(88, 222, 2)}${sparkle(116, 186, 1.8)}${sparkle(62, 222, 1.8)}
                            </g>
                            <path d="${skirt}" fill="none" ${ln(t)}/>
                            <path d="${ruffle}" fill="${t.light}"/>
                            <g clip-path="url(#${rid})">
                                <path d="M 112,228 L 170,228 L 170,255 L 118,255 Z" fill="${SHADE}" opacity="0.18"/>
                                <path d="M 52,232 L 51,244 M 64,233 L 63,245 M 76,234 L 76,246 M 88,234.5 L 88,247 M 100,235 L 100,247.5 M 112,234.5 L 112,247 M 124,234 L 124,246 M 136,233 L 137,245 M 148,232 L 149,244" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.45"/>
                            </g>
                            <path d="${ruffle}" fill="none" ${ln(t, 0.9)}/>`
                            + mirror(`<path d="M 81,136 C 72,130 62,134 61,144 C 60,151 66,155 72,153 C 77,151 80,146 82,141 Z" fill="${t.base}" ${ln(t)}/>
                                <path d="M 61.5,147 C 63,152 67,154 72,153 C 76,151.5 79,148 80.5,144 Q 72,151 61.5,147 Z" fill="${t.shadow}"/>
                                <path d="M 66,135 Q 68,143 66,151 M 73,133 Q 75,142 74,151" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.5"/>
                                <path d="M 68,134 Q 63,137 62.5,143" fill="none" stroke="${t.shine}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>`)
                            + shirtBody(t, bodice, lace)
                            + `<path d="M 79,134 Q 89,129 100,135 Q 111,129 121,134" fill="none" stroke="${accent.base}" stroke-width="2.2" stroke-linecap="round"/>
                            <path d="M 79.6,166 Q 100,170.5 120.4,166 L 120.6,171.5 Q 100,176 79.4,171.5 Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="0.7"/>`
                            + bow(100, 170, 0.8, accent)
                            + `<circle cx="100" cy="137" r="1.8" fill="#ff4f8b" stroke="#a3204e" stroke-width="0.5"/>`;
                    }
                }
            ]
        },
        bottoms: [
            {
                id: 'bottom1',
                name: 'شورت جينز بثنيات',
                svg: (c) => {
                    const t = tone(c);
                    const st = `<path d="M 77,182 C 76.5,190 76.5,196 76.8,201 M 123,182 C 123.5,190 123.5,196 123.2,201" fill="none" stroke="${GOLD.shadow}" stroke-width="0.6" stroke-dasharray="1.6 1.2"/>`;
                    return pantsBase(t, 9.5, 206, st)
                        + mirror(`<path d="M 76.3,201 L 95.6,201 L 95.6,207.5 Q 86,209.5 76.6,207.5 Z" fill="${t.light}" ${ln(t, 0.7)}/>
                            <path d="M 77,204 L 95,204" stroke="${t.line}" stroke-width="0.5" opacity="0.4"/>`);
                }
            },
            {
                id: 'bottom2',
                name: 'تنورة بليسيه مدرسية (أنمي)',
                svg: (c) => {
                    const t = tone(c);
                    const d = 'M 75,174 L 125,174 L 135,211 Q 100,216 65,211 Z';
                    const id = gdId('skirt');
                    let pleats = '', lines = '';
                    for (let i = 0; i < 10; i++) {
                        const x1 = 75 + i * 5, x2 = 65 + i * 7, x3 = 75 + (i + 1) * 5, x4 = 65 + (i + 1) * 7;
                        if (i % 2) pleats += `M ${x1},174 L ${x3},174 L ${x4},218 L ${x2},218 Z `;
                        if (i > 0) lines += `M ${x1},179 L ${x2},214 `;
                    }
                    return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
                        <path d="${d}" fill="${t.base}"/>
                        <g clip-path="url(#${id})">
                            <path d="${pleats}" fill="${SHADE}" opacity="0.18"/>
                            <path d="M 112,174 L 140,174 L 140,220 L 122,220 Z" fill="${SHADE}" opacity="0.15"/>
                            <path d="${lines}" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.6"/>
                            <path d="M 60,207.5 Q 100,212.5 140,207.5" fill="none" stroke="${t.isLight ? '#2b3a67' : '#ffffff'}" stroke-width="1.3" opacity="0.8"/>
                        </g>
                        <path d="${d}" fill="none" ${ln(t)}/>
                        <path d="M 75,174 L 125,174 L 125.6,179.5 Q 100,181.5 74.4,179.5 Z" fill="${t.shadow}" ${ln(t, 0.8)}/>`;
                }
            },
            {
                id: 'bottom3',
                name: 'بنطال جينز كاجوال',
                svg: (c) => {
                    const t = tone(c);
                    const st = `<path d="M 76.5,182 C 75.5,200 79,215 79.5,238 M 123.5,182 C 124.5,200 121,215 120.5,238 M 80,236 L 92,236 M 108,236 L 120,236" fill="none" stroke="${GOLD.shadow}" stroke-width="0.6" stroke-dasharray="1.6 1.2"/>`;
                    return pantsBase(t, 8, 240, st);
                }
            },
            {
                id: 'bottom4',
                name: 'بنطال كارغو بجيوب',
                svg: (c) => {
                    const t = tone(c);
                    return pantsBase(t, 10.5, 240)
                        + mirror(`<path d="M 76.5,199 L 84.5,199 L 85,213 Q 81,215 77,213 Z" fill="${t.base}" ${ln(t, 0.7)}/>
                            <path d="M 76.2,197.5 L 84.8,197.5 L 85,202 L 76.4,202 Z" fill="${t.shadow}" ${ln(t, 0.7)}/>
                            <circle cx="80.7" cy="200.3" r="0.8" fill="${t.line}"/>`);
                }
            },
            {
                id: 'bottom5',
                name: 'ليجنز رياضي ضيق',
                svg: (c) => {
                    const t = tone(c);
                    return pantsBase(t, 6.5, 240, '', { noBand: true })
                        + `<path d="M 83,205 Q 82,220 83,236 M 111,205 Q 110,220 111,236" fill="none" stroke="${t.shine}" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>`;
                }
            },
            {
                id: 'bottom6',
                name: 'بنطال واسع منساب',
                svg: (c) => {
                    const t = tone(c);
                    const folds = `<path d="M 80,200 Q 78,220 76,242 M 120,200 Q 122,220 124,242 M 92,212 Q 94,228 95,242 M 108,212 Q 106,228 105,242" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.5"/>`;
                    return pantsBase(t, 13, 242, folds);
                }
            },
            {
                id: 'bottom7',
                name: 'بنطال كابري صيفي',
                svg: (c) => {
                    const t = tone(c);
                    return pantsBase(t, 8, 222)
                        + mirror(`<path d="M 77.6,217 L 94.4,217 L 94.4,223 Q 86,225 77.8,223 Z" fill="${t.light}" ${ln(t, 0.7)}/>`);
                }
            },
            {
                id: 'bottom8',
                name: 'بنطال مقلّم كلاسيكي',
                svg: (c) => {
                    const t = tone(c);
                    const sc = t.isLight ? t.deep : '#ffffff';
                    let stripes = '';
                    for (let x = 72; x <= 128; x += 4) stripes += `M ${x},174 L ${x + (x < 100 ? -2 : 2)},244 `;
                    const extra = `<path d="${stripes}" fill="none" stroke="${sc}" stroke-width="0.5" opacity="0.45"/>
                        <path d="M 86,183 L 86,239 M 114,183 L 114,239" fill="none" stroke="${t.line}" stroke-width="0.6" opacity="0.6"/>`;
                    return pantsBase(t, 8.5, 240, extra);
                }
            }
        ],
        shoes: [
            {
                id: 'shoe1',
                name: 'صندل سلايد صيفي',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 76.5,243 Q 76,240.5 79,240.5 L 93,240.5 Q 96,240.5 95.5,243 Q 95,246.5 86,246.5 Q 77,246.5 76.5,243 Z" fill="#ffffff" ${ln(WHITE, 0.7)}/>
                        <path d="M 77.5,240.5 C 78,234.5 94,234.5 94.5,240.5 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 87,235.6 C 91,236 93.5,237.8 94.5,240.5 L 90,240.5 Z" fill="${SHADE}" opacity="0.22"/>
                        <path d="M 80,238.5 Q 83,236.3 87,236.2" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round"/>`);
                }
            },
            {
                id: 'shoe2',
                name: 'شبشب الأرنب الكيوت',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<ellipse cx="81" cy="232.5" rx="2.6" ry="6" transform="rotate(-12 81 232.5)" fill="${t.base}" ${ln(t, 0.7)}/>
                        <ellipse cx="81" cy="233" rx="1.1" ry="4" transform="rotate(-12 81 233)" fill="#ffb3c8"/>
                        <ellipse cx="90" cy="232.5" rx="2.6" ry="6" transform="rotate(10 90 232.5)" fill="${t.base}" ${ln(t, 0.7)}/>
                        <ellipse cx="90" cy="233" rx="1.1" ry="4" transform="rotate(10 90 233)" fill="#ffb3c8"/>
                        <path d="M 75.5,243.5 C 74.5,236 79,233.5 86,233.5 C 93,233.5 97.5,236 96.5,243.5 Q 86,248 75.5,243.5 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 91,235 C 95,236.5 97,239 96.5,243.5 Q 93,245.5 89,246 Q 94,240 91,235 Z" fill="${SHADE}" opacity="0.2"/>
                        <circle cx="83" cy="239.5" r="1.1" fill="#222"/><circle cx="89" cy="239.5" r="1.1" fill="#222"/>
                        <circle cx="82.7" cy="239.1" r="0.35" fill="#fff"/><circle cx="88.7" cy="239.1" r="0.35" fill="#fff"/>
                        <ellipse cx="86" cy="241.6" rx="1" ry="0.7" fill="#ff6f9a"/>
                        <circle cx="80.5" cy="241.5" r="1.3" fill="#ff8fb5" opacity="0.5"/><circle cx="91.5" cy="241.5" r="1.3" fill="#ff8fb5" opacity="0.5"/>`);
                }
            },
            {
                id: 'shoe3',
                name: 'حذاء رياضي (سنيكرز)',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 77,243 L 77.5,237 C 78,232.5 94,232.5 94.5,237 L 95.5,243 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 90,233.8 C 93,234.5 94.3,235.5 94.5,237 L 95.5,243 L 91,243 Z" fill="${SHADE}" opacity="0.2"/>
                        <path d="M 76,242.5 L 96,242.5 L 96.3,245 Q 86,248 75.7,245 Z" fill="#ffffff" ${ln(WHITE, 0.7)}/>
                        <path d="M 82,235 L 90,237.5 M 90,235 L 82,237.5 M 82.5,233.8 L 89.5,233.8" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round"/>
                        <path d="M 78.8,236.5 Q 79.5,234.5 82,234" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round"/>`);
                }
            },
            {
                id: 'shoe4',
                name: 'حذاء كعب عالي لامع',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 84.6,246 L 87.4,246 L 87,251 L 85,251 Z" fill="${t.deep}" ${ln(t, 0.6)}/>
                        <path d="M 79,236.5 Q 86,234 93,236.5 L 94,241.5 Q 91,246.5 86,247 Q 81,246.5 78,241.5 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 89,235.3 Q 92,235.6 93,236.5 L 94,241.5 Q 91.5,245.6 87.5,246.8 Q 91.5,241 89,235.3 Z" fill="${SHADE}" opacity="0.22"/>
                        <path d="M 80.5,239 Q 81.5,243 84,245" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round"/>
                        <circle cx="86" cy="238.3" r="1.6" fill="#ffffff" ${ln(t, 0.5)}/>`);
                }
            },
            {
                id: 'shoe5',
                name: 'بوت كاحل بفرو',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 78,226 L 94,226 L 94.5,239 Q 97,241 96.5,243.5 Q 86,247 75.5,243.5 Q 75,241 77.5,239 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 90,229 L 94,229 L 94.5,239 Q 97,241 96.5,243.5 L 92,244.5 Q 92.5,236 90,229 Z" fill="${SHADE}" opacity="0.2"/>
                        <path d="M 75.4,243 Q 86,247 96.6,243 L 96.6,245.5 Q 86,249.5 75.4,245.5 Z" fill="${t.deep}" ${ln(t, 0.6)}/>
                        <path d="M 77.5,224 L 94.5,224 L 94.5,229 L 77.5,229 Z" fill="${WHITE.base}" ${ln(WHITE, 0.7)}/>
                        <path d="M 79,226.5 L 80,227.5 M 83,225.5 L 84,226.8 M 87,226.5 L 88,227.6 M 91,225.6 L 92,226.8" stroke="${WHITE.shadow}" stroke-width="0.8"/>
                        <path d="M 83,231 L 89,233 M 89,231 L 83,233 M 83,234.5 L 89,236.5 M 89,234.5 L 83,236.5" fill="none" stroke="${t.light}" stroke-width="0.8"/>
                        <path d="M 79.5,231 L 79.5,240" fill="none" stroke="${t.shine}" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>`);
                }
            },
            {
                id: 'shoe6',
                name: 'بوت طويل بإبزيم',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 78,212 L 94,212 L 94.5,239 Q 97,241 96.5,243.5 Q 86,247 75.5,243.5 Q 75,241 77.5,239 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 90,213 L 94,213 L 94.5,239 Q 97,241 96.5,243.5 L 92,244.5 Q 92.5,228 90,213 Z" fill="${SHADE}" opacity="0.2"/>
                        <path d="M 75.4,243 Q 86,247 96.6,243 L 96.6,245.5 Q 86,249.5 75.4,245.5 Z" fill="${t.deep}" ${ln(t, 0.6)}/>
                        <path d="M 77,209 L 95,209 L 94.6,214 L 77.4,214 Z" fill="${t.shadow}" ${ln(t, 0.7)}/>
                        <path d="M 77.8,224 L 94.2,224 L 94.2,227.5 L 77.8,227.5 Z" fill="${t.deep}" ${ln(t, 0.6)}/>
                        <rect x="84" y="223.3" width="4.4" height="5" rx="0.8" fill="none" stroke="${GOLD.base}" stroke-width="1.1"/>
                        <path d="M 80,216 L 80,240" fill="none" stroke="${t.shine}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>`);
                }
            },
            {
                id: 'shoe7',
                name: 'حذاء ماري جين مع جوارب كشكش',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 79.5,224 L 92.5,224 L 92.5,241 L 79.5,241 Z" fill="#ffffff" ${ln(WHITE, 0.6)}/>
                        <path d="M 78.5,224 Q 80,221 81.7,224 Q 83.3,221 85,224 Q 86.7,221 88.3,224 Q 90,221 91.7,224 Q 93,221 93.5,224 L 93.5,226 L 78.5,226 Z" fill="#ffffff" ${ln(WHITE, 0.6)}/>
                        <path d="M 89,226 L 92.5,226 L 92.5,241 L 89.5,241 Z" fill="${WHITE.shadow}" opacity="0.7"/>
                        <path d="M 77,243 Q 76.5,237.5 81,237 L 91,237 Q 95.5,237.5 95,243 Q 86,247 77,243 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 79,234.5 L 93,234.5 L 93,236.8 L 79,236.8 Z" fill="${t.base}" ${ln(t, 0.6)}/>
                        <circle cx="91.3" cy="235.6" r="1" fill="${GOLD.base}"/>
                        <path d="M 76.9,243 Q 86,247 95.1,243 L 95.1,244.5 Q 86,248.8 76.9,244.5 Z" fill="${t.deep}"/>
                        <path d="M 79.5,239.5 Q 81,238 84,237.8" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round"/>`);
                }
            },
            {
                id: 'shoe8',
                name: 'حذاء لوفر مريح',
                svg: (c) => {
                    const t = tone(c);
                    return mirror(`<path d="M 77,243 Q 76.5,238 80,237.5 Q 86,236.5 92,237.5 Q 95.5,238 95,243 Q 86,247 77,243 Z" fill="${t.base}" ${ln(t, 0.8)}/>
                        <path d="M 80.5,239.5 L 91.5,239.5 L 91,242 L 81,242 Z" fill="${t.deep}" ${ln(t, 0.6)}/>
                        <ellipse cx="86" cy="240.7" rx="1.8" ry="0.8" fill="${GOLD.base}"/>
                        <path d="M 76.8,243 Q 86,247 95.2,243 L 95.2,244.6 Q 86,249 76.8,244.6 Z" fill="#3a2a22"/>
                        <path d="M 79,240.5 Q 79.5,238.6 82,238.2" fill="none" stroke="${t.shine}" stroke-width="1.2" stroke-linecap="round"/>`);
                }
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
