// لعبة موقف الحافلات - Bus Jam
(function() {
    window.initBusJamGame = function(container) {
        container.innerHTML = "";

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .bj-game-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                position: relative;
                font-family: 'Fredoka', 'Tajawal', sans-serif;
            }
            .bj-hud {
                display: flex;
                justify-content: space-between;
                width: 100%;
                padding: 8px 16px;
                background: #FFF;
                border-radius: 14px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.06);
                box-sizing: border-box;
                margin-bottom: 8px;
            }
            .bj-hud span {
                font-weight: bold;
                font-size: 15px;
            }
            .bj-play-area {
                width: 100%;
                max-width: 340px;
                height: 440px;
                background: #ECEFF1; /* Concrete street look */
                border-radius: 24px;
                border: 4px solid #B0BEC5;
                box-shadow: 0 6px 15px rgba(0,0,0,0.1), inset 0 4px 10px rgba(0,0,0,0.05);
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                padding: 12px;
                justify-content: space-between;
            }
            /* Buses Lane */
            .bj-bus-lane {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                width: 100%;
                height: 70px;
                background: #CFD8DC;
                border-radius: 16px;
                position: relative;
                overflow: hidden;
                border: 2px solid #90A4AE;
                padding: 0 8px;
                box-sizing: border-box;
            }
            .bj-bus {
                position: absolute;
                height: 52px;
                border-radius: 10px;
                border: 2px solid rgba(0,0,0,0.25);
                box-shadow: 0 3px 6px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .bj-bus-active {
                width: 120px;
                right: 12px;
                z-index: 10;
            }
            .bj-bus-next {
                width: 100px;
                right: 145px;
                transform: scale(0.85);
                opacity: 0.75;
                z-index: 5;
            }
            .bj-bus-queue {
                width: 100px;
                right: 255px;
                transform: scale(0.7);
                opacity: 0.4;
                z-index: 2;
            }
            .bj-bus-wheels {
                position: absolute;
                bottom: -7px;
                width: 100%;
                display: flex;
                justify-content: space-around;
                padding: 0 12px;
                box-sizing: border-box;
            }
            .bj-wheel {
                width: 14px;
                height: 14px;
                background: #212121;
                border-radius: 50%;
                border: 2px solid #90A4AE;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .bj-bus-windows {
                display: flex;
                justify-content: space-around;
                width: 85%;
                margin-bottom: 2px;
            }
            .bj-window {
                width: 14px;
                height: 10px;
                background: #E0F7FA;
                border-radius: 2px;
                border: 1px solid rgba(0,0,0,0.2);
            }
            .bj-bus-label {
                font-size: 10px;
                font-weight: bold;
                color: #FFF;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            }
            /* Waiting slots */
            .bj-waiting-area {
                display: flex;
                justify-content: space-between;
                width: 100%;
                padding: 10px 14px;
                background: #FFF8E1; /* Pavement color */
                border-radius: 16px;
                border: 2px dashed #FFB74D;
                box-sizing: border-box;
            }
            .bj-wait-slot {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: #FFE082;
                border: 2px solid #FFB74D;
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            /* Grid Area */
            .bj-grid-area {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: 4px;
                width: 100%;
                height: 220px;
                background: #FFF;
                padding: 8px;
                border-radius: 18px;
                border: 2px solid #CFD8DC;
                box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                box-sizing: border-box;
                position: relative;
            }
            .bj-grid-cell {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-sizing: border-box;
            }
            .bj-passenger {
                width: 46px;
                height: 74px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                z-index: 5;
                filter: drop-shadow(0px 3px 2px rgba(0,0,0,0.25));
                transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1), top 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease, transform 0.2s ease;
            }
            .bj-passenger-blocked {
                opacity: 0.35;
                cursor: not-allowed;
            }
            .bj-passenger-active {
                animation: bj-pulse 1.5s infinite alternate;
            }
            @keyframes bj-pulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.06); }
            }
            /* Walking waddle animation */
            .bj-walking-active {
                animation: bj-waddle 0.15s infinite alternate ease-in-out;
            }
            @keyframes bj-waddle {
                0% { transform: rotate(-10deg) translateY(-2px); }
                100% { transform: rotate(10deg) translateY(0px); }
            }
            /* Flying animation overlay */
            .bj-flying-passenger {
                position: absolute;
                z-index: 100;
            }
            /* Overlays */
            .bj-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.65);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: #FFF;
            }
            .bj-card {
                background: #FFF;
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                border: 4px solid #FF9800;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 260px;
                color: #333;
            }
            .bj-card h3 {
                color: #E65100;
                margin-bottom: 8px;
                font-size: 20px;
                font-weight: bold;
            }
            .bj-card p {
                color: #555;
                margin-bottom: 16px;
                font-size: 15px;
            }
        `;
        container.appendChild(styleEl);

        // 2. DOM Elements Creation
        const layout = document.createElement('div');
        layout.className = 'bj-game-layout';
        container.appendChild(layout);

        const logoContainer = document.createElement('div');
        logoContainer.className = 'bj-logo-container';
        logoContainer.style.cssText = 'width: 100%; display: flex; justify-content: center; margin-bottom: 4px;';
        logoContainer.innerHTML = `
            <svg viewBox="0 0 320 60" style="width: 100%; max-width: 320px; height: auto;">
                <!-- Cartoon Orange Bus drawing on the left -->
                <rect x="15" y="12" width="42" height="24" rx="6" fill="#FF9800" stroke="#E65100" stroke-width="2" />
                <!-- Windows -->
                <rect x="22" y="16" width="8" height="8" rx="1.5" fill="#E0F7FA" stroke="#00838F" stroke-width="1" paint-order="stroke fill" />
                <rect x="34" y="16" width="8" height="8" rx="1.5" fill="#E0F7FA" stroke="#00838F" stroke-width="1" paint-order="stroke fill" />
                <rect x="46" y="16" width="6" height="8" rx="1.5" fill="#E0F7FA" stroke="#00838F" stroke-width="1" paint-order="stroke fill" />
                <!-- Wheels -->
                <circle cx="26" cy="36" r="5" fill="#212121" stroke="#ECEFF1" stroke-width="1.5" />
                <circle cx="46" cy="36" r="5" fill="#212121" stroke="#ECEFF1" stroke-width="1.5" />
                <!-- Front Light -->
                <circle cx="15" cy="26" r="2.5" fill="#FFEB3B" />
                <!-- Text with thick cartoon outline -->
                <text x="185" y="40" font-family="'Fredoka', 'Tajawal', sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#E65100" stroke="#FFF" stroke-width="4.5" paint-order="stroke fill">موقف الحافلات 🚌</text>
            </svg>
        `;
        layout.appendChild(logoContainer);

        const instr = document.createElement('p');
        instr.className = 'game-instructions';
        instr.innerText = 'انقر على الأشخاص غير المحجوبين لنقلهم إلى الحافلة المطابقة للونهم!';
        instr.style.cssText = 'margin-bottom:8px;width:100%;';
        layout.appendChild(instr);

        const hud = document.createElement('div');
        hud.className = 'bj-hud';
        layout.appendChild(hud);

        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#E65100';
        scoreSpan.innerText = 'الركاب: 0';
        const lvlSpan = document.createElement('span');
        lvlSpan.style.color = '#E65100';
        lvlSpan.innerText = 'المرحلة: 1 / 5';
        hud.appendChild(scoreSpan);
        hud.appendChild(lvlSpan);

        const playArea = document.createElement('div');
        playArea.className = 'bj-play-area';
        layout.appendChild(playArea);

        // Buses Lane
        const busLane = document.createElement('div');
        busLane.className = 'bj-bus-lane';
        playArea.appendChild(busLane);

        // Waiting Area
        const waitingArea = document.createElement('div');
        waitingArea.className = 'bj-waiting-area';
        playArea.appendChild(waitingArea);

        const WAITING_SLOTS_COUNT = 5;
        const waitingSlots = []; // array of slots: { element, passenger: null/color }
        for (let i = 0; i < WAITING_SLOTS_COUNT; i++) {
            const slot = document.createElement('div');
            slot.className = 'bj-wait-slot';
            waitingArea.appendChild(slot);
            waitingSlots.push({
                element: slot,
                passenger: null
            });
        }

        // Grid Area
        const gridArea = document.createElement('div');
        gridArea.className = 'bj-grid-area';
        playArea.appendChild(gridArea);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'bj-overlay';
        overlay.style.display = 'none';
        playArea.appendChild(overlay);

        const card = document.createElement('div');
        card.className = 'bj-card bounce-anim';
        overlay.appendChild(card);

        // Color Settings
        const colorPalette = {
            'red': { bg: '#FF5252', label: 'أحمر', emoji: '🔴' },
            'blue': { bg: '#2196F3', label: 'أزرق', emoji: '🔵' },
            'green': { bg: '#4CAF50', label: 'أخضر', emoji: '🟢' },
            'yellow': { bg: '#FFCA28', label: 'أصفر', emoji: '🟡' }
        };
        const colorKeys = Object.keys(colorPalette);

        // Helper to generate SVG passenger figurine matching user attachment
        function createPassengerFigurine(color, isSlot = false) {
            const pass = document.createElement('div');
            pass.className = 'bj-passenger';
            if (isSlot) {
                pass.style.width = '36px';
                pass.style.height = '58px';
            }
            pass.innerHTML = `
                <svg viewBox="0 0 24 24" style="width: 100%; height: 100%;">
                    <!-- Head -->
                    <circle cx="12" cy="3.2" r="2.8" fill="${colorPalette[color].bg}" />
                    <!-- Body -->
                    <rect x="9.5" y="7.2" width="5" height="8.8" rx="1.5" fill="${colorPalette[color].bg}" />
                    <!-- Left Arm -->
                    <rect x="7" y="7.2" width="2" height="6.8" rx="1" fill="${colorPalette[color].bg}" />
                    <!-- Right Arm -->
                    <rect x="15" y="7.2" width="2" height="6.8" rx="1" fill="${colorPalette[color].bg}" />
                    <!-- Left Leg -->
                    <rect x="9.5" y="16.8" width="2" height="6.8" rx="1" fill="${colorPalette[color].bg}" />
                    <!-- Right Leg -->
                    <rect x="12.5" y="16.8" width="2" height="6.8" rx="1" fill="${colorPalette[color].bg}" />
                </svg>
            `;
            return pass;
        }

        // Game state
        let isGameRunning = true;
        let score = 0;
        let currentLevel = 1;

        let busesQueue = []; // array of bus colors: e.g. ['red', 'blue', ...]
        let activeBusSeats = 0; // seats filled in active bus (0/3)
        let totalLevelPassengers = 0;

        // Level Grid configurations
        const levels = {
            1: {
                colors: ['red', 'blue', 'green'],
                passengersCount: 12 // 4 buses
            },
            2: {
                colors: ['red', 'blue', 'green', 'yellow'],
                passengersCount: 15 // 5 buses
            },
            3: {
                colors: ['red', 'blue', 'green', 'yellow'],
                passengersCount: 18 // 6 buses
            },
            4: {
                colors: ['red', 'blue', 'green', 'yellow'],
                passengersCount: 21 // 7 buses
            },
            5: {
                colors: ['red', 'blue', 'green', 'yellow'],
                passengersCount: 24 // 8 buses
            }
        };

        let passengerGrid = []; // 2D array [row][col] of colors or null

        function initLevel(lvlNum) {
            score = 0;
            scoreSpan.innerText = `الركاب: 0`;
            lvlSpan.innerText = `المرحلة: ${lvlNum} / 5`;
            overlay.style.display = 'none';

            // Reset waiting area slots
            waitingSlots.forEach(slot => {
                slot.passenger = null;
                slot.element.innerHTML = "";
            });

            // Get level config
            const config = levels[lvlNum];
            totalLevelPassengers = config.passengersCount;
            const colorsList = config.colors;

            // Generate list of passenger colors in multiples of 3 (matching bus capacity)
            const numBuses = config.passengersCount / 3;
            const levelColors = [];
            
            // Build buses queue
            busesQueue = [];
            for (let i = 0; i < numBuses; i++) {
                const col = colorsList[Math.floor(Math.random() * colorsList.length)];
                busesQueue.push(col);
                // add 3 passengers of this color
                levelColors.push(col, col, col);
            }

            // Shuffle passenger colors for the grid
            levelColors.sort(() => Math.random() - 0.5);

            // Populate 5x5 passenger grid
            passengerGrid = [];
            for (let r = 0; r < 5; r++) {
                passengerGrid.push(new Array(5).fill(null));
            }

            let pIndex = 0;
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (pIndex < levelColors.length) {
                        passengerGrid[r][c] = levelColors[pIndex++];
                    } else {
                        passengerGrid[r][c] = null;
                    }
                }
            }

            activeBusSeats = 0;
            renderBuses();
            renderGrid();
        }

        // Render the active bus and upcoming buses in queue
        function renderBuses() {
            // Clear existing buses
            busLane.querySelectorAll('.bj-bus').forEach(b => b.remove());

            // Active Bus (index 0)
            if (busesQueue.length > 0) {
                const activeColor = busesQueue[0];
                const activeBus = createBusDOM(activeColor, 'bj-bus-active');
                
                // Draw seats
                const seatContainer = document.createElement('div');
                seatContainer.style.cssText = "display:flex; gap:3px; margin-top:2px;";
                for (let s = 0; s < 3; s++) {
                    const seat = document.createElement('span');
                    seat.style.fontSize = "12px";
                    seat.innerText = s < activeBusSeats ? colorPalette[activeColor].emoji : '⚪';
                    seatContainer.appendChild(seat);
                }
                activeBus.appendChild(seatContainer);
                busLane.appendChild(activeBus);
            }

            // Next Bus (index 1)
            if (busesQueue.length > 1) {
                const nextColor = busesQueue[1];
                const nextBus = createBusDOM(nextColor, 'bj-bus-next');
                busLane.appendChild(nextBus);
            }

            // Queue Bus (index 2)
            if (busesQueue.length > 2) {
                const queueColor = busesQueue[2];
                const queueBus = createBusDOM(queueColor, 'bj-bus-queue');
                busLane.appendChild(queueBus);
            }
        }

        function createBusDOM(color, className) {
            const bus = document.createElement('div');
            bus.className = `bj-bus ${className}`;
            bus.style.background = colorPalette[color].bg;

            // Windows
            const windows = document.createElement('div');
            windows.className = 'bj-bus-windows';
            for (let w = 0; w < 3; w++) {
                const win = document.createElement('div');
                win.className = 'bj-window';
                windows.appendChild(win);
            }
            bus.appendChild(windows);

            // Wheels
            const wheels = document.createElement('div');
            wheels.className = 'bj-bus-wheels';
            const w1 = document.createElement('div');
            w1.className = 'bj-wheel';
            const w2 = document.createElement('div');
            w2.className = 'bj-wheel';
            wheels.appendChild(w1);
            wheels.appendChild(w2);
            bus.appendChild(wheels);

            return bus;
        }

        // Render passenger grid and calculate block state
        function renderGrid() {
            gridArea.innerHTML = "";

            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'bj-grid-cell';
                    gridArea.appendChild(cell);

                    const color = passengerGrid[r][c];
                    if (color) {
                        const pass = createPassengerFigurine(color);
                        
                        // Check if blocked: A passenger is blocked if there's any other passenger in the same column at a smaller row (above them)
                        let isBlocked = false;
                        for (let prevR = 0; prevR < r; prevR++) {
                            if (passengerGrid[prevR][c] !== null) {
                                isBlocked = true;
                                break;
                            }
                        }

                        if (isBlocked) {
                            pass.classList.add('bj-passenger-blocked');
                        } else {
                            pass.classList.add('bj-passenger-active');
                            pass.onclick = () => handlePassengerTap(r, c, pass, color);
                        }

                        cell.appendChild(pass);
                    }
                }
            }
        }

        function handlePassengerTap(r, c, passengerEl, color) {
            if (!isGameRunning || busesQueue.length === 0) return;

            // Target color check (must match active bus color)
            const activeColor = busesQueue[0];

            if (color === activeColor) {
                // Board active bus immediately!
                boardPassenger(r, c, passengerEl, color);
            } else {
                // Try to place in waiting slots
                const emptySlotIndex = waitingSlots.findIndex(slot => slot.passenger === null);
                if (emptySlotIndex !== -1) {
                    moveToWaitingSlot(r, c, passengerEl, color, emptySlotIndex);
                } else {
                    // Fail - Slots are full!
                    if (window.sound) window.sound.playFail();
                    passengerEl.style.animation = 'none';
                    passengerEl.offsetHeight; // reflow
                    passengerEl.style.animation = 'error-shake 0.4s';
                    setTimeout(() => passengerEl.style.animation = '', 400);
                }
            }
        }

        // Animates moving a passenger to the active bus
        function boardPassenger(r, c, passengerEl, color) {
            // Remove from grid logical representation
            passengerGrid[r][c] = null;
            
            // Get coordinates
            const startRect = passengerEl.getBoundingClientRect();
            
            // Re-render grid so blocked passengers behind can walk forward/become active
            renderGrid();

            // Create temporary flying passenger element
            const flyer = createPassengerFigurine(color);
            flyer.classList.add('bj-flying-passenger', 'bj-walking-active');
            flyer.style.left = `${startRect.left - playArea.getBoundingClientRect().left}px`;
            flyer.style.top = `${startRect.top - playArea.getBoundingClientRect().top}px`;
            playArea.appendChild(flyer);

            // Active bus target coordinates
            const activeBusDOM = busLane.querySelector('.bj-bus-active');
            const targetRect = activeBusDOM.getBoundingClientRect();

            // Trigger smooth CSS movement
            setTimeout(() => {
                flyer.style.left = `${targetRect.left - playArea.getBoundingClientRect().left + 40}px`;
                flyer.style.top = `${targetRect.top - playArea.getBoundingClientRect().top + 10}px`;
            }, 20);

            if (window.sound) window.sound.playClick();

            setTimeout(() => {
                flyer.classList.remove('bj-walking-active');
                flyer.style.transform = 'scale(0.2)';
                flyer.style.opacity = '0';
                setTimeout(() => flyer.remove(), 200);
                
                // Add to active bus seat count
                activeBusSeats++;
                score++;
                scoreSpan.innerText = `الركاب: ${score} / ${totalLevelPassengers}`;

                if (activeBusSeats >= 3) {
                    // Active bus is full! Drive off!
                    driveBusAway();
                } else {
                    renderBuses();
                }
            }, 600);
        }

        // Animate moving a passenger to the waiting slots
        function moveToWaitingSlot(r, c, passengerEl, color, slotIndex) {
            passengerGrid[r][c] = null;
            
            const startRect = passengerEl.getBoundingClientRect();
            
            renderGrid();

            const flyer = createPassengerFigurine(color);
            flyer.classList.add('bj-flying-passenger', 'bj-walking-active');
            flyer.style.left = `${startRect.left - playArea.getBoundingClientRect().left}px`;
            flyer.style.top = `${startRect.top - playArea.getBoundingClientRect().top}px`;
            playArea.appendChild(flyer);

            // Slot Target coordinates
            const targetSlot = waitingSlots[slotIndex];
            targetSlot.passenger = color; // reserve slot immediately
            
            const targetRect = targetSlot.element.getBoundingClientRect();

            setTimeout(() => {
                flyer.style.left = `${targetRect.left - playArea.getBoundingClientRect().left}px`;
                flyer.style.top = `${targetRect.top - playArea.getBoundingClientRect().top}px`;
            }, 20);

            if (window.sound) window.sound.playClick();

            setTimeout(() => {
                flyer.remove();

                // Draw passenger sitting inside the slot
                const slotPass = createPassengerFigurine(color, true);
                targetSlot.element.appendChild(slotPass);
            }, 600);
        }

        // Animate active bus driving off to the right and load next bus
        function driveBusAway() {
            const activeBusDOM = busLane.querySelector('.bj-bus-active');
            if (activeBusDOM) {
                activeBusDOM.style.right = '-150px'; // drive off-screen to the right
                activeBusDOM.style.opacity = '0';
            }

            if (window.sound) window.sound.playSuccess();

            setTimeout(() => {
                busesQueue.shift(); // remove active bus
                activeBusSeats = 0;

                renderBuses();

                // Check win condition (all buses completed)
                if (busesQueue.length === 0) {
                    levelWin();
                } else {
                    // Check if any passenger in the waiting slots can now board the new active bus
                    checkWaitingQueueBoarding();
                }
            }, 550);
        }

        // Recursively check if any passenger in the waiting queue matches the new active bus color
        function checkWaitingQueueBoarding() {
            if (busesQueue.length === 0) return;

            const activeColor = busesQueue[0];

            // Find first slot index matching active color
            const matchingSlotIndex = waitingSlots.findIndex(slot => slot.passenger === activeColor);
            if (matchingSlotIndex !== -1) {
                const targetSlot = waitingSlots[matchingSlotIndex];
                
                // Remove from waiting slot
                targetSlot.passenger = null;
                
                const passEl = targetSlot.element.querySelector('.bj-passenger');
                const startRect = passEl.getBoundingClientRect();
                passEl.remove();

                // Create flyer to active bus
                const flyer = createPassengerFigurine(activeColor, true);
                flyer.classList.add('bj-flying-passenger', 'bj-walking-active');
                flyer.style.left = `${startRect.left - playArea.getBoundingClientRect().left}px`;
                flyer.style.top = `${startRect.top - playArea.getBoundingClientRect().top}px`;
                playArea.appendChild(flyer);

                const activeBusDOM = busLane.querySelector('.bj-bus-active');
                const targetRect = activeBusDOM.getBoundingClientRect();

                setTimeout(() => {
                    flyer.style.left = `${targetRect.left - playArea.getBoundingClientRect().left + 40}px`;
                    flyer.style.top = `${targetRect.top - playArea.getBoundingClientRect().top + 10}px`;
                }, 20);

                if (window.sound) window.sound.playClick();

                setTimeout(() => {
                    flyer.classList.remove('bj-walking-active');
                    flyer.style.transform = 'scale(0.2)';
                    flyer.style.opacity = '0';
                    setTimeout(() => flyer.remove(), 200);
                    
                    activeBusSeats++;
                    score++;
                    scoreSpan.innerText = `الركاب: ${score} / ${totalLevelPassengers}`;

                    if (activeBusSeats >= 3) {
                        driveBusAway();
                    } else {
                        renderBuses();
                        // Check again for other passengers waiting
                        checkWaitingQueueBoarding();
                    }
                }, 600);
            } else {
                // No more waiting passengers match. Check if player has lost (grid is not empty, slots are full)
                checkLoseCondition();
            }
        }

        function checkLoseCondition() {
            // Player loses if there are still passengers in the grid, but all waiting slots are full
            let gridHasPassengers = false;
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (passengerGrid[r][c] !== null) {
                        gridHasPassengers = true;
                        break;
                    }
                }
                if (gridHasPassengers) break;
            }

            const emptySlotIndex = waitingSlots.findIndex(slot => slot.passenger === null);

            if (gridHasPassengers && emptySlotIndex === -1) {
                // Game Over! No more slots!
                levelGameOver();
            }
        }

        function levelWin() {
            if (window.sound) window.sound.playSuccess();

            if (currentLevel < 5) {
                card.innerHTML = `
                    <h3>🎉 كسبت المرحلة! 🎉</h3>
                    <p>لقد صعدت جميع الركاب بنجاح!</p>
                    <button class="menu-btn restart-btn" id="nextBtn">المرحلة التالية ➡️</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('nextBtn').onclick = () => {
                    currentLevel++;
                    initLevel(currentLevel);
                };
            } else {
                card.innerHTML = `
                    <h3>🏆 بطل مواقف الحافلات! 🏆</h3>
                    <p>تهانينا! لقد أنهيت جميع مواقف الحافلات ببراعة ذكائك!</p>
                    <button class="menu-btn restart-btn" id="finishBtn">العب مجدداً 🔄</button>
                `;
                overlay.style.display = 'flex';
                document.getElementById('finishBtn').onclick = () => {
                    currentLevel = 1;
                    initLevel(currentLevel);
                };
            }
        }

        function levelGameOver() {
            if (window.sound) window.sound.playFail();

            card.innerHTML = `
                <h3 style="color:#D50000;">💥 زحام شديد! 💥</h3>
                <p>امتلأت كراسي الانتظار بالكامل. حاول مجدداً!</p>
                <button class="menu-btn restart-btn" id="retryBtn">إعادة المحاولة 🔄</button>
            `;
            overlay.style.display = 'flex';
            document.getElementById('retryBtn').onclick = () => {
                initLevel(currentLevel);
            };
        }

        // Clean exit listener
        container.addEventListener('game-exit', () => {
            isGameRunning = false;
        }, { once: true });

        // Start Level
        initLevel(currentLevel);
    };
})();
