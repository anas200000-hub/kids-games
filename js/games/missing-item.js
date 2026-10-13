// ما الذي اختفى؟ - What's Missing Game
(function() {
    window.initMissingItemGame = function(container) {
        container.innerHTML = "";

        const rounds = [
            { items: ['🍎','🍊','🍋','🍇'], missing: '🍋' },
            { items: ['🐶','🐱','🐭','🐰'], missing: '🐭' },
            { items: ['⭐','🌙','☀️','🌈'], missing: '🌙' },
            { items: ['🚗','✈️','🚢','🚂'], missing: '🚢' },
            { items: ['🌸','🌺','🌹','🌻'], missing: '🌹' },
            { items: ['🎈','🎉','🎁','🎀'], missing: '🎁' },
            { items: ['🍕','🍔','🌮','🍜'], missing: '🌮' },
            { items: ['🦁','🐘','🦒','🐬'], missing: '🐬' },
        ];

        const choiceOptions = {
            '🍋': ['🍋','🍓','🥝','🍍'],
            '🐭': ['🐭','🐹','🦊','🐻'],
            '🌙': ['🌙','💫','🌟','🌠'],
            '🚢': ['🚢','🚤','⛵','🛥️'],
            '🌹': ['🌹','🌷','💐','🪷'],
            '🎁': ['🎁','🧧','📦','🎊'],
            '🌮': ['🌮','🥙','🌯','🥪'],
            '🐬': ['🐬','🐳','🦈','🦭'],
        };

        let qIdx = 0;
        let score = 0;
        let showPhase = true;
        let hideTimeout = null;

        // Wrapper
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:400px;margin:0 auto;padding:10px;box-sizing:border-box;';
        container.appendChild(wrap);

        // Title
        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'ما الذي اختفى؟ 👀';
        title.style.cssText = 'color:#7B1FA2;margin-bottom:10px;';
        wrap.appendChild(title);

        // Score + progress
        const info = document.createElement('div');
        info.style.cssText = 'display:flex;justify-content:space-between;width:100%;padding:8px 12px;background:#FFF;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,0.1);box-sizing:border-box;margin-bottom:12px;';
        wrap.appendChild(info);
        const progEl = document.createElement('div');
        progEl.style.cssText = 'font-weight:bold;color:#7B1FA2;font-size:15px;';
        const scoreEl = document.createElement('div');
        scoreEl.style.cssText = 'font-weight:bold;color:#2E7D32;font-size:15px;';
        info.appendChild(progEl);
        info.appendChild(scoreEl);

        // Instruction
        const instrEl = document.createElement('div');
        instrEl.style.cssText = 'font-size:15px;font-weight:bold;color:#555;margin-bottom:10px;text-align:center;';
        wrap.appendChild(instrEl);

        // Items display area
        const itemsArea = document.createElement('div');
        itemsArea.style.cssText = 'display:flex;justify-content:center;gap:16px;flex-wrap:wrap;background:rgba(255,255,255,0.8);border-radius:20px;padding:20px;box-shadow:0 6px 16px rgba(0,0,0,0.1);margin-bottom:18px;min-height:100px;align-items:center;width:100%;box-sizing:border-box;';
        wrap.appendChild(itemsArea);

        // Choices area
        const choicesArea = document.createElement('div');
        choicesArea.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:100%;';
        wrap.appendChild(choicesArea);

        function updateInfo() {
            progEl.innerText = `السؤال: ${qIdx+1} / ${rounds.length}`;
            scoreEl.innerText = `النقاط: ${score}`;
        }

        function showItems(itemList) {
            itemsArea.innerHTML = '';
            itemList.forEach(em => {
                const d = document.createElement('div');
                d.style.cssText = 'font-size:50px;width:70px;height:70px;display:flex;align-items:center;justify-content:center;background:#FFF;border-radius:16px;box-shadow:0 4px 8px rgba(0,0,0,0.1);';
                d.innerText = em;
                itemsArea.appendChild(d);
            });
        }

        function loadRound() {
            if (qIdx >= rounds.length) { showWin(); return; }
            updateInfo();
            choicesArea.innerHTML = '';
            const round = rounds[qIdx];
            showPhase = true;
            instrEl.innerText = '👀 احفظ هذه الأشياء جيداً!';
            instrEl.style.color = '#1565C0';
            showItems(round.items);

            hideTimeout = setTimeout(() => {
                showPhase = false;
                // Show with one hidden
                const withoutMissing = round.items.filter(i => i !== round.missing);
                // shuffle display
                const display = [...withoutMissing].sort(() => Math.random() - 0.5);
                showItems(display);
                instrEl.innerText = '🤔 ماذا اختفى؟ اختر!';
                instrEl.style.color = '#D84315';

                // Show choices
                const opts = choiceOptions[round.missing].sort(() => Math.random() - 0.5);
                const colors = ['#E53935','#1E88E5','#43A047','#FB8C00'];
                opts.forEach((opt, i) => {
                    const btn = document.createElement('button');
                    btn.style.cssText = `font-size:36px;height:80px;border:none;border-radius:18px;background:${colors[i]};cursor:pointer;box-shadow:0 4px 8px rgba(0,0,0,0.15);transition:transform 0.1s;`;
                    btn.innerText = opt;
                    btn.addEventListener('click', () => handleAnswer(opt, round.missing));
                    choicesArea.appendChild(btn);
                });
            }, 2500);
        }

        function handleAnswer(selected, correct) {
            if (selected === correct) {
                score++;
                if (window.sound) window.sound.playSuccess();
                instrEl.innerText = '✅ صحيح! ممتاز!';
                instrEl.style.color = '#2E7D32';
                // Flash correct green
                Array.from(choicesArea.children).forEach(b => {
                    if (b.innerText === correct) b.style.background = '#00C853';
                    else b.disabled = true;
                });
            } else {
                if (window.sound) window.sound.playFail();
                instrEl.innerText = `❌ خطأ! الصواب هو ${correct}`;
                instrEl.style.color = '#D32F2F';
                Array.from(choicesArea.children).forEach(b => {
                    if (b.innerText === correct) b.style.background = '#00C853';
                    else if (b.innerText === selected) b.style.background = '#D50000';
                    b.disabled = true;
                });
            }
            updateInfo();
            setTimeout(() => { qIdx++; loadRound(); }, 1800);
        }

        function showWin() {
            if (window.sound) window.sound.playSuccess();
            const modal = document.createElement('div');
            modal.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFF;padding:25px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;z-index:10000;width:80%;max-width:300px;';
            modal.innerHTML = `<div style="font-size:48px">🎉</div><h3 style="color:#7B1FA2;margin:8px 0;font-size:22px;">أحسنت!</h3><p style="color:#555;margin:8px 0;">نقاطك: ${score} / ${rounds.length}</p><button class="menu-btn" style="background:#7B1FA2;color:#FFF;border:none;padding:10px 20px;font-size:16px;border-radius:25px;cursor:pointer;margin-top:10px;">العب مرة أخرى 🔄</button>`;
            modal.querySelector('button').addEventListener('click', () => { modal.remove(); qIdx=0; score=0; loadRound(); });
            container.appendChild(modal);
        }

        container.addEventListener('game-exit', () => clearTimeout(hideTimeout), { once: true });
        loadRound();
    };
})();
