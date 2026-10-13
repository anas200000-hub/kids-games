// رتب من الأصغر للأكبر - Size Ordering Game
(function() {
    window.initSizeOrderGame = function(container) {
        container.innerHTML = "";

        const rounds = [
            {
                label: 'الحيوانات',
                items: [
                    { emoji: '🐭', label: 'فأر', size: 1 },
                    { emoji: '🐱', label: 'قطة', size: 2 },
                    { emoji: '🐕', label: 'كلب', size: 3 },
                    { emoji: '🐄', label: 'بقرة', size: 4 },
                ]
            },
            {
                label: 'الأشجار',
                items: [
                    { emoji: '🌱', label: 'بذرة', size: 1 },
                    { emoji: '🌿', label: 'غصن', size: 2 },
                    { emoji: '🌳', label: 'شجيرة', size: 3 },
                    { emoji: '🎄', label: 'شجرة', size: 4 },
                ]
            },
            {
                label: 'الكرات',
                items: [
                    { emoji: '⚾', label: 'كرة بيسبول', size: 1 },
                    { emoji: '⚽', label: 'كرة قدم', size: 2 },
                    { emoji: '🏀', label: 'كرة سلة', size: 3 },
                    { emoji: '🎱', label: 'كرة بلياردو', size: 2 },
                ]
            },
            {
                label: 'الطيور',
                items: [
                    { emoji: '🐣', label: 'كتكوت', size: 1 },
                    { emoji: '🐤', label: 'فرخ', size: 2 },
                    { emoji: '🐦', label: 'عصفور', size: 3 },
                    { emoji: '🦅', label: 'نسر', size: 4 },
                ]
            },
            {
                label: 'الفواكه',
                items: [
                    { emoji: '🍇', label: 'عنبة', size: 1 },
                    { emoji: '🍊', label: 'برتقالة', size: 2 },
                    { emoji: '🍉', label: 'بطيخة', size: 3 },
                    { emoji: '🎃', label: 'قرعة', size: 4 },
                ]
            },
        ];

        let rIdx = 0, score = 0;
        let userOrder = [];
        let roundItems = [];

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:400px;margin:0 auto;padding:10px;box-sizing:border-box;';
        container.appendChild(wrap);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'الأصغر للأكبر 📏';
        title.style.cssText = 'color:#1565C0;margin-bottom:8px;';
        wrap.appendChild(title);

        const info = document.createElement('div');
        info.style.cssText = 'display:flex;justify-content:space-between;width:100%;padding:8px 12px;background:#FFF;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,0.1);box-sizing:border-box;margin-bottom:10px;';
        wrap.appendChild(info);
        const progEl = document.createElement('span');
        progEl.style.cssText = 'font-weight:bold;color:#1565C0;font-size:15px;';
        const scoreEl = document.createElement('span');
        scoreEl.style.cssText = 'font-weight:bold;color:#2E7D32;font-size:15px;';
        info.appendChild(progEl);
        info.appendChild(scoreEl);

        const instrEl = document.createElement('div');
        instrEl.style.cssText = 'font-size:14px;color:#555;text-align:center;margin-bottom:12px;padding:8px;background:rgba(255,255,255,0.7);border-radius:12px;width:100%;box-sizing:border-box;';
        instrEl.innerText = '👆 اضغط على الأشياء من الأصغر إلى الأكبر';
        wrap.appendChild(instrEl);

        // Answer slots
        const slotsArea = document.createElement('div');
        slotsArea.style.cssText = 'display:flex;justify-content:center;gap:10px;background:rgba(255,255,255,0.6);border-radius:20px;padding:15px;width:100%;box-sizing:border-box;margin-bottom:14px;border:3px dashed #90CAF9;';
        wrap.appendChild(slotsArea);

        // Choices (shuffled)
        const choicesArea = document.createElement('div');
        choicesArea.style.cssText = 'display:flex;justify-content:center;gap:14px;flex-wrap:wrap;width:100%;';
        wrap.appendChild(choicesArea);

        const checkBtn = document.createElement('button');
        checkBtn.innerText = '✅ تحقق';
        checkBtn.style.cssText = 'margin-top:14px;padding:10px 28px;font-size:17px;font-weight:bold;border:none;border-radius:25px;background:#1565C0;color:#FFF;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.2);transition:transform 0.1s;display:none;';
        checkBtn.addEventListener('click', checkAnswer);
        wrap.appendChild(checkBtn);

        function updateInfo() {
            progEl.innerText = `المرحلة: ${rIdx+1}/${rounds.length}`;
            scoreEl.innerText = `نقاط: ${score}`;
        }

        function loadRound() {
            if (rIdx >= rounds.length) { showWin(); return; }
            updateInfo();
            const round = rounds[rIdx];
            roundItems = [...round.items];
            userOrder = [];
            checkBtn.style.display = 'none';

            instrEl.innerText = `👆 رتب ${round.label} من الأصغر للأكبر`;

            // Build slots
            slotsArea.innerHTML = '';
            round.items.forEach((_, i) => {
                const slot = document.createElement('div');
                slot.dataset.slot = i;
                slot.style.cssText = 'width:70px;height:80px;border:3px dashed #90CAF9;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,0.5);';
                const num = document.createElement('div');
                num.innerText = i+1;
                num.style.cssText = 'font-size:11px;color:#90CAF9;font-weight:bold;margin-bottom:2px;';
                slot.appendChild(num);
                slotsArea.appendChild(slot);
            });

            // Shuffle and show choices
            const shuffled = [...round.items].sort(() => Math.random() - 0.5);
            choicesArea.innerHTML = '';
            shuffled.forEach(item => {
                const btn = document.createElement('button');
                btn.dataset.size = item.size;
                btn.dataset.emoji = item.emoji;
                const emSize = 40 + (item.size * 6);
                btn.style.cssText = `border:3px solid #42A5F5;border-radius:16px;background:#E3F2FD;cursor:pointer;padding:8px;display:flex;flex-direction:column;align-items:center;transition:transform 0.1s;`;
                btn.innerHTML = `<span style="font-size:${emSize}px;">${item.emoji}</span><span style="font-size:12px;color:#1565C0;font-weight:bold;">${item.label}</span>`;
                btn.addEventListener('click', () => selectItem(btn, item));
                choicesArea.appendChild(btn);
            });
        }

        function selectItem(btn, item) {
            if (btn.dataset.used === '1') return;
            if (userOrder.length >= roundItems.length) return;
            if (window.sound) window.sound.playClick();
            btn.dataset.used = '1';
            btn.style.opacity = '0.4';
            btn.style.transform = 'scale(0.9)';
            btn.disabled = true;

            userOrder.push(item);
            const slotIdx = userOrder.length - 1;
            const slot = slotsArea.children[slotIdx];
            slot.innerHTML = '';
            const emSize = 36 + (item.size * 4);
            slot.innerHTML = `<span style="font-size:${emSize}px;">${item.emoji}</span><span style="font-size:10px;color:#1565C0;">${item.label}</span>`;
            slot.style.borderColor = '#42A5F5';
            slot.style.background = '#E3F2FD';

            if (userOrder.length === roundItems.length) {
                checkBtn.style.display = 'block';
            }
        }

        function checkAnswer() {
            const sorted = [...roundItems].sort((a,b) => a.size - b.size);
            const correct = userOrder.every((item, i) => item.size === sorted[i].size);
            if (correct) {
                score++;
                instrEl.innerText = '🎉 رائع! الترتيب صحيح!';
                instrEl.style.color = '#2E7D32';
                if (window.sound) window.sound.playSuccess();
                // Green flash on slots
                Array.from(slotsArea.children).forEach(s => s.style.borderColor = '#00C853');
            } else {
                instrEl.innerText = '❌ ليس الترتيب الصحيح! جرب مرة أخرى';
                instrEl.style.color = '#D32F2F';
                if (window.sound) window.sound.playFail();
                Array.from(slotsArea.children).forEach(s => { s.style.animation = 'shake-anim 0.5s'; });
                // Reset after shake
                setTimeout(() => {
                    instrEl.style.color = '#555';
                    loadRound();
                }, 1200);
                return;
            }
            updateInfo();
            setTimeout(() => { rIdx++; loadRound(); }, 1800);
        }

        function showWin() {
            if (window.sound) window.sound.playSuccess();
            const modal = document.createElement('div');
            modal.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFF;padding:25px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;z-index:10000;width:80%;max-width:300px;';
            modal.innerHTML = `<div style="font-size:48px">🏆</div><h3 style="color:#1565C0;margin:8px 0;font-size:22px;">ممتاز!</h3><p style="color:#555;margin:8px 0;">نقاطك: ${score} / ${rounds.length}</p><button class="menu-btn" style="background:#1565C0;color:#FFF;border:none;padding:10px 20px;font-size:16px;border-radius:25px;cursor:pointer;margin-top:10px;">العب مرة أخرى 🔄</button>`;
            modal.querySelector('button').addEventListener('click', () => { modal.remove(); rIdx=0; score=0; loadRound(); });
            container.appendChild(modal);
        }

        loadRound();
    };
})();
