// Game 7: Kids Piano (بيانو الأطفال)
window.initPianoGame = function (container) {
    const keys = [
        { note: 'C4', label: 'دو', char: '🍎', freq: 261.63, color: '#FF3B30' },
        { note: 'D4', label: 'ري', char: '🍊', freq: 293.66, color: '#FF9500' },
        { note: 'E4', label: 'مي', char: '🍋', freq: 329.63, color: '#FFCC00' },
        { note: 'F4', label: 'فا', char: '🥦', freq: 349.23, color: '#4CD964' },
        { note: 'G4', label: 'صول', char: '💧', freq: 392.00, color: '#5AC8FA' },
        { note: 'A4', label: 'لا', char: '🍇', freq: 440.00, color: '#007AFF' },
        { note: 'B4', label: 'سي', char: '🍆', freq: 493.88, color: '#5856D6' },
        { note: 'C5', label: 'دو²', char: '🌸', freq: 523.25, color: '#FF2D55' }
    ];

    const instruments = [
        { id: 'piano', name: '🎹 بيانو', desc: 'صوت بيانو كلاسيكي لطيف' },
        { id: 'xylophone', name: '🔔 إكسيلوفون', desc: 'نغمات معدنية رنانة' },
        { id: 'funny', name: '🤪 مضحك', desc: 'نغمات متموجة تسعد الأطفال' }
    ];

    let html = `
        <div class="game-piano-layout">
            <h2 class="game-title">🎹 بيانو الأطفال 🎹</h2>
            
            <div class="instrument-selector">
    `;

    instruments.forEach(inst => {
        html += `
            <button class="inst-btn ${inst.id === 'piano' ? 'active' : ''}" data-id="${inst.id}">
                ${inst.name}
            </button>
        `;
    });

    html += `
            </div>

            <div class="piano-board" id="pianoBoard">
    `;

    keys.forEach(k => {
        html += `
            <div class="piano-key" data-freq="${k.freq}" style="background: linear-gradient(180deg, #FFFFFF 60%, ${k.color} 100%);">
                <div class="key-char">${k.char}</div>
                <div class="key-name" style="background-color: ${k.color};">${k.label}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Set initial instrument in sound engine
    if (window.sound) {
        window.sound.instrument = 'piano';
    }

    // Instrument selector event listener
    container.querySelectorAll('.inst-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            window.sound.playClick();
            container.querySelector('.inst-btn.active').classList.remove('active');
            this.classList.add('active');
            
            const instId = this.getAttribute('data-id');
            if (window.sound) {
                window.sound.instrument = instId;
            }
        });
    });

    // Piano keys event listener
    const pianoBoard = document.getElementById('pianoBoard');
    container.querySelectorAll('.piano-key').forEach(key => {
        const playKey = function (e) {
            e.preventDefault();
            const freq = parseFloat(this.getAttribute('data-freq'));
            
            // Play note sound
            if (window.sound) {
                window.sound.playPianoNote(freq);
            }

            // Key press animation
            this.classList.add('key-active');
            setTimeout(() => this.classList.remove('key-active'), 150);

            // Spawn floating music note emoji
            spawnFloatingNote(e, this);
        };

        key.addEventListener('mousedown', playKey);
        key.addEventListener('touchstart', playKey);
    });

    function spawnFloatingNote(e, keyElement) {
        const noteEmojis = ['🎵', '🎶', '🎼', '✨'];
        const emoji = noteEmojis[Math.floor(Math.random() * noteEmojis.length)];
        
        const noteEl = document.createElement('div');
        noteEl.classList.add('floating-note');
        noteEl.innerText = emoji;

        // Position above the key
        const keyRect = keyElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        let clickX = 0;
        if (e.touches) {
            clickX = e.touches[0].clientX - containerRect.left;
        } else {
            clickX = e.clientX - containerRect.left;
        }

        noteEl.style.left = `${clickX - 15}px`;
        noteEl.style.top = `${keyRect.top - containerRect.top - 20}px`;

        container.appendChild(noteEl);

        // Remove element after animation
        setTimeout(() => {
            noteEl.remove();
        }, 1200);
    }
};
