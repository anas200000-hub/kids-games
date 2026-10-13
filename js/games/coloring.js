// Game 2: Coloring Book (كتاب التلوين)
window.initColoringGame = function (container) {
    const colors = [
        '#FF3B30', // Red
        '#FF9500', // Orange
        '#FFCC00', // Yellow
        '#4CD964', // Green
        '#5AC8FA', // Light Blue
        '#007AFF', // Blue
        '#5856D6', // Purple
        '#FF2D55', // Pink
        '#8E8E93', // Gray
        '#FFFFFF'  // White (Eraser)
    ];

    const templates = [
        { id: 'star', name: '⭐️ نجمة جميلة', draw: drawStar },
        { id: 'apple', name: '🍎 تفاحة لذيذة', draw: drawApple },
        { id: 'fish', name: '🐟 سمكة صغيرة', draw: drawFish },
        { id: 'car', name: '🚗 سيارة سريعة', draw: drawCar },
        { id: 'house', name: '🏠 بيت صغير', draw: drawHouse },
        { id: 'balloon', name: '🎈 بالون طائر', draw: drawBalloon },
        { id: 'cat', name: '🐱 قطة لطيفة', draw: drawCatFace },
        { id: 'sun', name: '☀️ شمس مشرقة', draw: drawSun },
        { id: 'boat', name: '⛵ قارب بحري', draw: drawBoat },
        { id: 'butterfly', name: '🦋 فراشة طائرة', draw: drawButterfly },
        { id: 'flower', name: '🌸 زهرة عطرة', draw: drawFlower },
        { id: 'rocket', name: '🚀 صاروخ فضائي', draw: drawRocket },
        { id: 'mushroom', name: '🍄 فطر الغابة', draw: drawMushroom },
        { id: 'icecream', name: '🍦 مثلجات شهية', draw: drawIceCream }
    ];

    let selectedColor = colors[0];
    let selectedTemplate = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    let html = `
        <div class="game-coloring-layout">
            <h2 class="game-title">🎨 كتاب التلوين 🎨</h2>
            
            <!-- Selection Screen -->
            <div id="templatesSelectionScreen" class="templates-grid-screen">
                <p class="game-instructions">اختر رسمة جميلة لتلوينها:</p>
                <div class="templates-grid" id="templatesGrid"></div>
            </div>
            
            <!-- Coloring Workspace -->
            <div id="coloringWorkspace" class="coloring-workspace" style="display: none;">
                <div class="workspace-header">
                    <button class="menu-btn back-to-templates-btn" id="backToTemplates">🎨 اختر رسمة أخرى</button>
                    <h3 id="currentTemplateName" class="current-template-name"></h3>
                </div>
                <div class="canvas-container">
                    <canvas id="coloringCanvas" width="400" height="400"></canvas>
                </div>
                <div class="palette-container">
                    <div id="paletteSwatches" style="display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;"></div>
                    <button class="clear-btn" id="clearCanvas">🗑️ مسح الكل</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const selectionScreen = document.getElementById('templatesSelectionScreen');
    const workspace = document.getElementById('coloringWorkspace');
    const templatesGrid = document.getElementById('templatesGrid');
    const backBtn = document.getElementById('backToTemplates');
    const templateNameHeader = document.getElementById('currentTemplateName');
    const canvas = document.getElementById('coloringCanvas');
    const ctx = canvas.getContext('2d');
    const paletteSwatches = document.getElementById('paletteSwatches');

    // Create a temporary off-screen canvas to hold the kid's coloring separate from the template outline
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = canvas.width;
    drawingCanvas.height = canvas.height;
    const drawCtx = drawingCanvas.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = 16;

    // Render selection grid thumbnails dynamically
    templates.forEach(t => {
        const card = document.createElement('div');
        card.classList.add('template-card');
        card.setAttribute('data-id', t.id);
        
        // Create thumbnail canvas
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 120;
        thumbCanvas.height = 120;
        const thumbCtx = thumbCanvas.getContext('2d');
        
        // Draw the template outline centered on a 120x120 thumbnail canvas
        thumbCtx.strokeStyle = '#222222';
        thumbCtx.lineWidth = 4.5;
        thumbCtx.lineCap = 'round';
        thumbCtx.lineJoin = 'round';
        
        thumbCtx.save();
        thumbCtx.scale(0.3, 0.3);
        t.draw(thumbCtx);
        thumbCtx.restore();
        
        card.appendChild(thumbCanvas);
        templatesGrid.appendChild(card);

        // Click handler to open workspace
        card.addEventListener('click', () => {
            window.sound.playClick();
            selectedTemplate = t;
            templateNameHeader.innerText = t.name;
            selectionScreen.style.display = 'none';
            workspace.style.display = 'block';
            resetGame();
        });
    });

    // Populate colors palette
    colors.forEach(c => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        if (c === selectedColor) swatch.classList.add('active');
        swatch.setAttribute('data-color', c);
        swatch.style.backgroundColor = c;
        paletteSwatches.appendChild(swatch);

        swatch.addEventListener('click', function () {
            window.sound.playClick();
            const activeSwatch = paletteSwatches.querySelector('.color-swatch.active');
            if (activeSwatch) activeSwatch.classList.remove('active');
            this.classList.add('active');
            selectedColor = this.getAttribute('data-color');
            if (selectedColor === '#FFFFFF') {
                drawCtx.lineWidth = 32; // Bigger brush for eraser
            } else {
                drawCtx.lineWidth = 16;
            }
        });
    });

    backBtn.addEventListener('click', () => {
        window.sound.playClick();
        workspace.style.display = 'none';
        selectionScreen.style.display = 'block';
    });

    // Clear everything
    function resetGame() {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        render();
    }

    // Render loop: draws user drawings then template outlines on top
    function render() {
        if (!selectedTemplate) return;
        // Draw user colored strokes
        ctx.drawImage(drawingCanvas, 0, 0);

        // Draw template outline on top
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        selectedTemplate.draw(ctx);
    }

    // Template outlines drawing functions
    function drawStar(c) {
        c.beginPath();
        const cx = 200, cy = 200, spikes = 5, outerRadius = 130, innerRadius = 60;
        let rot = Math.PI / 2 * 3;
        let x = cx, y = cy;
        const step = Math.PI / spikes;

        c.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            c.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            c.lineTo(x, y);
            rot += step;
        }
        c.lineTo(cx, cy - outerRadius);
        c.closePath();
        c.stroke();
    }

    function drawApple(c) {
        c.beginPath();
        // Apple body
        c.moveTo(200, 140);
        c.bezierCurveTo(240, 100, 310, 130, 290, 220);
        c.bezierCurveTo(280, 270, 230, 310, 200, 290);
        c.bezierCurveTo(170, 310, 120, 270, 110, 220);
        c.bezierCurveTo(90, 130, 160, 100, 200, 140);
        
        // Stem
        c.moveTo(200, 135);
        c.quadraticCurveTo(210, 90, 225, 75);
        
        // Leaf
        c.moveTo(212, 100);
        c.quadraticCurveTo(240, 90, 250, 110);
        c.quadraticCurveTo(225, 120, 212, 100);
        
        c.stroke();
    }

    function drawFish(c) {
        c.beginPath();
        // Body
        c.moveTo(80, 200);
        c.quadraticCurveTo(200, 90, 300, 200);
        c.quadraticCurveTo(200, 310, 80, 200);
        // Tail
        c.lineTo(40, 150);
        c.lineTo(40, 250);
        c.closePath();
        // Fins
        c.moveTo(200, 130);
        c.quadraticCurveTo(230, 90, 240, 120);
        c.moveTo(190, 260);
        c.quadraticCurveTo(220, 300, 230, 270);
        // Eye
        c.moveTo(260, 185);
        c.arc(255, 185, 5, 0, Math.PI * 2);
        // Smile
        c.moveTo(280, 205);
        c.quadraticCurveTo(270, 215, 260, 205);
        c.stroke();
    }

    function drawCar(c) {
        c.beginPath();
        // Body base
        c.moveTo(60, 260);
        c.lineTo(340, 260);
        c.quadraticCurveTo(360, 260, 360, 230);
        c.lineTo(350, 200);
        c.quadraticCurveTo(340, 180, 310, 180);
        c.lineTo(270, 180);
        // Cabin
        c.lineTo(240, 130);
        c.quadraticCurveTo(220, 110, 180, 110);
        c.lineTo(130, 110);
        c.quadraticCurveTo(100, 110, 90, 140);
        c.lineTo(70, 180);
        c.lineTo(50, 180);
        c.quadraticCurveTo(40, 180, 40, 210);
        c.lineTo(40, 230);
        c.quadraticCurveTo(40, 260, 60, 260);
        c.closePath();
        c.stroke();
        
        // Wheels
        c.beginPath();
        c.arc(110, 260, 35, 0, Math.PI * 2);
        c.arc(290, 260, 35, 0, Math.PI * 2);
        c.fillStyle = '#FFFFFF';
        c.fill();
        c.stroke();
        
        // Inner Wheels
        c.beginPath();
        c.arc(110, 260, 12, 0, Math.PI * 2);
        c.arc(290, 260, 12, 0, Math.PI * 2);
        c.stroke();

        // Windows
        c.beginPath();
        c.moveTo(130, 130);
        c.lineTo(175, 130);
        c.lineTo(175, 170);
        c.lineTo(105, 170);
        c.closePath();
        c.moveTo(185, 130);
        c.lineTo(230, 130);
        c.lineTo(250, 170);
        c.lineTo(185, 170);
        c.closePath();
        c.stroke();
    }

    function drawHouse(c) {
        c.beginPath();
        c.rect(100, 180, 200, 160);
        c.moveTo(80, 180);
        c.lineTo(200, 80);
        c.lineTo(320, 180);
        c.closePath();
        c.rect(140, 240, 50, 100); // Door
        c.rect(220, 220, 50, 50); // Window
        c.stroke();
    }

    function drawBalloon(c) {
        c.beginPath();
        c.ellipse(200, 170, 70, 90, 0, 0, Math.PI * 2);
        c.moveTo(200, 260);
        c.lineTo(190, 275);
        c.lineTo(210, 275);
        c.closePath();
        c.moveTo(200, 275);
        c.bezierCurveTo(190, 310, 210, 340, 200, 370);
        c.stroke();
    }

    function drawCatFace(c) {
        c.beginPath();
        c.arc(200, 200, 100, 0, Math.PI * 2);
        // Ears
        c.moveTo(120, 140);
        c.lineTo(100, 60);
        c.lineTo(170, 110);
        c.moveTo(280, 140);
        c.lineTo(300, 60);
        c.lineTo(230, 110);
        // Eyes
        c.moveTo(170, 180);
        c.arc(160, 180, 10, 0, Math.PI * 2);
        c.moveTo(250, 180);
        c.arc(240, 180, 10, 0, Math.PI * 2);
        // Nose
        c.moveTo(200, 210);
        c.lineTo(190, 220);
        c.lineTo(210, 220);
        c.closePath();
        // Whiskers
        c.moveTo(140, 215); c.lineTo(70, 205);
        c.moveTo(140, 225); c.lineTo(70, 230);
        c.moveTo(260, 215); c.lineTo(330, 205);
        c.moveTo(260, 225); c.lineTo(330, 230);
        c.stroke();
    }

    function drawSun(c) {
        c.beginPath();
        c.arc(200, 200, 65, 0, Math.PI * 2);
        c.stroke();
        // Rays
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x = 200 + Math.cos(angle) * 115;
            const y = 200 + Math.sin(angle) * 115;
            const x1 = 200 + Math.cos(angle - 0.2) * 80;
            const y1 = 200 + Math.sin(angle - 0.2) * 80;
            const x2 = 200 + Math.cos(angle + 0.2) * 80;
            const y2 = 200 + Math.sin(angle + 0.2) * 80;
            c.beginPath();
            c.moveTo(x1, y1);
            c.lineTo(x, y);
            c.lineTo(x2, y2);
            c.stroke();
        }
    }

    function drawBoat(c) {
        c.beginPath();
        // Hull
        c.moveTo(80, 250);
        c.lineTo(320, 250);
        c.lineTo(280, 310);
        c.lineTo(120, 310);
        c.closePath();
        // Mast
        c.moveTo(200, 250);
        c.lineTo(200, 90);
        // Sail
        c.moveTo(200, 100);
        c.lineTo(110, 210);
        c.lineTo(200, 210);
        c.closePath();
        // Waves
        c.moveTo(40, 335);
        c.bezierCurveTo(120, 315, 160, 355, 240, 335);
        c.bezierCurveTo(320, 315, 360, 355, 380, 335);
        c.stroke();
    }

    function drawButterfly(c) {
        c.beginPath();
        // Center Body
        c.ellipse(200, 200, 12, 75, 0, 0, Math.PI * 2);
        // Left Wings
        c.moveTo(188, 170);
        c.bezierCurveTo(100, 60, 40, 150, 188, 200);
        c.bezierCurveTo(70, 215, 90, 305, 188, 245);
        // Right Wings
        c.moveTo(212, 170);
        c.bezierCurveTo(300, 60, 360, 150, 212, 200);
        c.bezierCurveTo(330, 215, 310, 305, 212, 245);
        // Antennae
        c.moveTo(195, 125);
        c.quadraticCurveTo(170, 75, 150, 85);
        c.moveTo(205, 125);
        c.quadraticCurveTo(230, 75, 250, 85);
        c.stroke();
    }

    // Coordinates helpers
    function drawFlower(c) {
        c.beginPath();
        // Center
        c.arc(200, 170, 35, 0, Math.PI * 2);
        // Petals
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5;
            const px = 200 + Math.cos(angle) * 60;
            const py = 170 + Math.sin(angle) * 60;
            c.moveTo(px + 28, py);
            c.arc(px, py, 28, 0, Math.PI * 2);
        }
        // Stem
        c.moveTo(200, 233);
        c.quadraticCurveTo(190, 290, 200, 345);
        // Leaf
        c.moveTo(196, 280);
        c.quadraticCurveTo(150, 260, 160, 300);
        c.quadraticCurveTo(185, 305, 196, 280);
        c.stroke();
    }

    function drawRocket(c) {
        c.beginPath();
        // Body
        c.moveTo(170, 290);
        c.lineTo(170, 140);
        c.quadraticCurveTo(200, 50, 230, 140);
        c.lineTo(230, 290);
        c.closePath();
        // Fins
        c.moveTo(170, 230);
        c.lineTo(130, 290);
        c.lineTo(170, 290);
        c.moveTo(230, 230);
        c.lineTo(270, 290);
        c.lineTo(230, 290);
        // Window
        c.moveTo(215, 160);
        c.arc(200, 160, 15, 0, Math.PI * 2);
        // Flame
        c.moveTo(180, 295);
        c.lineTo(200, 335);
        c.lineTo(220, 295);
        c.stroke();
    }

    function drawMushroom(c) {
        c.beginPath();
        // Cap
        c.moveTo(90, 210);
        c.bezierCurveTo(100, 70, 300, 70, 310, 210);
        c.closePath();
        // Stem
        c.moveTo(160, 210);
        c.quadraticCurveTo(150, 310, 180, 310);
        c.lineTo(220, 310);
        c.quadraticCurveTo(250, 310, 240, 210);
        c.stroke();
        // Spots
        c.beginPath();
        c.arc(150, 140, 12, 0, Math.PI * 2);
        c.moveTo(262, 150);
        c.arc(250, 150, 14, 0, Math.PI * 2);
        c.moveTo(210, 110);
        c.arc(200, 110, 10, 0, Math.PI * 2);
        c.stroke();
    }

    function drawIceCream(c) {
        c.beginPath();
        // Cone
        c.moveTo(140, 210);
        c.lineTo(260, 210);
        c.lineTo(200, 330);
        c.closePath();
        // Scoop
        c.moveTo(140, 210);
        c.bezierCurveTo(110, 120, 290, 120, 260, 210);
        // Cherry
        c.moveTo(212, 125);
        c.arc(200, 125, 12, 0, Math.PI * 2);
        // Cherry stem
        c.moveTo(200, 113);
        c.quadraticCurveTo(215, 85, 230, 90);
        c.stroke();
    }

    // Coordinates helpers
    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function startDrawing(e) {
        e.preventDefault();
        window.sound.playClick();
        isDrawing = true;
        const coords = getCoords(e);
        lastX = coords.x;
        lastY = coords.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);

        drawCtx.beginPath();
        drawCtx.moveTo(lastX, lastY);
        drawCtx.lineTo(coords.x, coords.y);
        
        drawCtx.strokeStyle = selectedColor;
        drawCtx.stroke();

        lastX = coords.x;
        lastY = coords.y;
        render();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Attach canvas drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('clearCanvas').addEventListener('click', () => {
        window.sound.playFail();
        resetGame();
    });
};
