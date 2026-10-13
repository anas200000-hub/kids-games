// Game 1: Animal Sounds (أصوات الحيوانات)
window.initAnimalsGame = function (container) {
    const animals = [
        { id: 'lion', emoji: '🦁', name: 'أسد', soundName: 'زئير!', color: '#FF7F50' },
        { id: 'cat', emoji: '🐱', name: 'قطة', soundName: 'مواء!', color: '#FF69B4' },
        { id: 'dog', emoji: '🐶', name: 'كلب', soundName: 'نباح!', color: '#FFA500' },
        { id: 'duck', emoji: '🦆', name: 'بطة', soundName: 'بطبطة!', color: '#FFD700' },
        { id: 'cow', emoji: '🐮', name: 'بقرة', soundName: 'خوار!', color: '#D2B48C' },
        { id: 'sheep', emoji: '🐑', name: 'خروف', soundName: 'ثغاء!', color: '#90EE90' },
        { id: 'chicken', emoji: '🐔', name: 'ديك', soundName: 'صياح!', color: '#FFB6C1' },
        { id: 'horse', emoji: '🐴', name: 'حصان', soundName: 'صهيل!', color: '#AFEEEE' },
        { id: 'elephant', emoji: '🐘', name: 'فيل', soundName: 'نهيم!', color: '#ADD8E6' }
    ];

    let html = `
        <div class="game-animals-layout">
            <h2 class="game-title">🦁 أصوات الحيوانات 🦁</h2>
            <p class="game-instructions">اضغط على الحيوان لتسمع صوته الجميل!</p>
            <div class="animals-grid">
    `;

    animals.forEach(a => {
        html += `
            <div class="animal-card" data-id="${a.id}" style="background-color: ${a.color};">
                <div class="animal-emoji"><img src="${window.getEmojiSVG(a.emoji)}" alt="${a.name}" class="game-svg-icon"></div>
                <div class="animal-name">${a.name}</div>
                <div class="bubble-text" id="bubble-${a.id}">${a.soundName}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('.animal-card').forEach(card => {
        card.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            
            // Play sound
            if (window.sound) {
                window.sound.playAnimalSound(id);
            }

            // Animate card
            this.classList.add('bounce-anim');
            setTimeout(() => this.classList.remove('bounce-anim'), 600);

            // Show speech bubble
            const bubble = document.getElementById(`bubble-${id}`);
            bubble.classList.add('show-bubble');
            setTimeout(() => bubble.classList.remove('show-bubble'), 1200);
        });
    });
};
