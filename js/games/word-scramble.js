// رتب الكلمة - Word Scramble Game (Arabic)
(function() {
    window.initWordScrambleGame = function(container) {
        container.innerHTML = "";

        const words = [
            { word: 'شمس', emoji: '☀️', hint: 'في السماء' },
            { word: 'قمر', emoji: '🌙', hint: 'يضيء الليل' },
            { word: 'سمك', emoji: '🐟', hint: 'يعيش في الماء' },
            { word: 'كلب', emoji: '🐶', hint: 'صديق الإنسان' },
            { word: 'قطة', emoji: '🐱', hint: 'تموء' },
            { word: 'بيت', emoji: '🏠', hint: 'نسكن فيه' },
            { word: 'ماء', emoji: '💧', hint: 'نشرب منه' },
            { word: 'تفاح', emoji: '🍎', hint: 'فاكهة حمراء' },
            { word: 'نجم', emoji: '⭐', hint: 'في السماء ليلاً' },
            { word: 'زهرة', emoji: '🌸', hint: 'جميلة وعطرة' },
        ];

        let qIdx = 0, score = 0;
        let currentWord = '';
        let userLetters = [];
        let letterBtns = [];

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:400px;margin:0 auto;padding:10px;box-sizing:border-box;';
        container.appendChild(wrap);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'رتب الكلمة 🔤';
        title.style.cssText = 'color:#6A1B9A;margin-bottom:8px;';
        wrap.appendChild(title);

        const info = document.createElement('div');
        info.style.cssText = 'display:flex;justify-content:space-between;width:100%;padding:8px 12px;background:#FFF;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,0.1);box-sizing:border-box;margin-bottom:10px;';
        wrap.appendChild(info);
        const progEl = document.createElement('span');
        progEl.style.cssText = 'font-weight:bold;color:#6A1B9A;font-size:15px;';
        const scoreEl = document.createElement('span');
        scoreEl.style.cssText = 'font-weight:bold;color:#2E7D32;font-size:15px;';
        info.appendChild(progEl);
        info.appendChild(scoreEl);

        // Picture card
        const card = document.createElement('div');
        card.style.cssText = 'background:#FFF;border-radius:22px;padding:16px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,0.12);margin-bottom:14px;width:100%;box-sizing:border-box;';
        wrap.appendChild(card);

        const emojiEl = document.createElement('div');
        emojiEl.style.cssText = 'font-size:70px;margin-bottom:6px;animation:bounce-anim 1s ease infinite;';
        card.appendChild(emojiEl);

        const hintEl = document.createElement('div');
        hintEl.style.cssText = 'color:#777;font-size:14px;margin-bottom:0;';
        card.appendChild(hintEl);

        // Answer slots
        const slotsArea = document.createElement('div');
        slotsArea.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-bottom:14px;';
        wrap.appendChild(slotsArea);

        // Letter choices
        const lettersArea = document.createElement('div');
        lettersArea.style.cssText = 'display:flex;justify-content:center;gap:8px;flex-wrap:wrap;background:rgba(255,255,255,0.7);border-radius:18px;padding:14px;width:100%;box-sizing:border-box;';
        wrap.appendChild(lettersArea);

        // Clear / Hint row
        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;gap:10px;margin-top:12px;';
        wrap.appendChild(controls);

        const clearBtn = document.createElement('button');
        clearBtn.innerText = '🔄 مسح';
        clearBtn.style.cssText = 'flex:1;padding:10px;font-size:15px;font-weight:bold;border:none;border-radius:20px;background:#FF7043;color:#FFF;cursor:pointer;';
        clearBtn.addEventListener('click', clearAnswer);
        controls.appendChild(clearBtn);

        const hintBtn = document.createElement('button');
        hintBtn.innerText = '💡 تلميح';
        hintBtn.style.cssText = 'flex:1;padding:10px;font-size:15px;font-weight:bold;border:none;border-radius:20px;background:#FFA726;color:#FFF;cursor:pointer;';
        hintBtn.addEventListener('click', giveHint);
        controls.appendChild(hintBtn);

        let hintUsed = false;
        const colors = ['#E53935','#1E88E5','#43A047','#8E24AA','#FB8C00','#00ACC1'];

        function updateInfo() {
            progEl.innerText = `الكلمة: ${qIdx+1}/${words.length}`;
            scoreEl.innerText = `نقاط: ${score}`;
        }

        function shuffle(arr) {
            let a = [...arr];
            for (let i=a.length-1;i>0;i--) {
                const j=Math.floor(Math.random()*(i+1));
                [a[i],a[j]]=[a[j],a[i]];
            }
            return a;
        }

        function loadRound() {
            if (qIdx >= words.length) { showWin(); return; }
            updateInfo();
            const w = words[qIdx];
            currentWord = w.word;
            userLetters = [];
            hintUsed = false;
            hintBtn.disabled = false;

            emojiEl.innerText = w.emoji;
            hintEl.innerText = `تلميح: ${w.hint}`;

            // Build slots
            slotsArea.innerHTML = '';
            [...currentWord].forEach(() => {
                const slot = document.createElement('div');
                slot.style.cssText = 'width:46px;height:50px;border:3px dashed #CE93D8;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;background:rgba(255,255,255,0.7);color:#6A1B9A;';
                slotsArea.appendChild(slot);
            });

            // Shuffle letters + add 1 extra distractor
            const extras = ['ي','و','ا','ن','ب','ت','ل','م','ر','ه'].filter(c => !currentWord.includes(c));
            const distractors = extras.sort(() => Math.random()-0.5).slice(0, Math.max(0, 5 - currentWord.length));
            const allLetters = shuffle([...currentWord, ...distractors]);

            lettersArea.innerHTML = '';
            letterBtns = [];
            allLetters.forEach((letter, i) => {
                const btn = document.createElement('button');
                btn.innerText = letter;
                btn.dataset.letter = letter;
                btn.dataset.idx = i;
                btn.style.cssText = `width:48px;height:52px;font-size:22px;font-weight:bold;border:none;border-radius:12px;background:${colors[i%colors.length]};color:#FFF;cursor:pointer;box-shadow:0 4px 8px rgba(0,0,0,0.15);transition:transform 0.1s;`;
                btn.addEventListener('click', () => pickLetter(btn));
                lettersArea.appendChild(btn);
                letterBtns.push(btn);
            });
        }

        function pickLetter(btn) {
            if (btn.dataset.used === '1') return;
            if (userLetters.length >= currentWord.length) return;
            if (window.sound) window.sound.playClick();
            btn.dataset.used = '1';
            btn.style.opacity = '0.35';
            btn.disabled = true;

            userLetters.push({ letter: btn.dataset.letter, btn });
            const slotIdx = userLetters.length - 1;
            const slot = slotsArea.children[slotIdx];
            slot.innerText = btn.dataset.letter;
            slot.style.borderColor = '#BA68C8';
            slot.style.background = '#F3E5F5';

            if (userLetters.length === currentWord.length) {
                checkWord();
            }
        }

        function clearAnswer() {
            userLetters.forEach(({btn}) => {
                btn.dataset.used = '0';
                btn.style.opacity = '1';
                btn.disabled = false;
            });
            userLetters = [];
            Array.from(slotsArea.children).forEach(s => {
                s.innerText = '';
                s.style.borderColor = '#CE93D8';
                s.style.background = 'rgba(255,255,255,0.7)';
            });
        }

        function giveHint() {
            if (hintUsed) return;
            hintUsed = true;
            hintBtn.disabled = true;
            // Auto-place first letter
            const firstLetter = currentWord[0];
            const btn = letterBtns.find(b => b.dataset.letter === firstLetter && b.dataset.used !== '1');
            if (btn) pickLetter(btn);
        }

        function checkWord() {
            const formed = userLetters.map(u => u.letter).join('');
            if (formed === currentWord) {
                score++;
                if (window.sound) window.sound.playSuccess();
                Array.from(slotsArea.children).forEach(s => { s.style.borderColor = '#00C853'; s.style.background = '#E8F5E9'; });
                card.style.background = '#E8F5E9';
                setTimeout(() => { card.style.background = '#FFF'; qIdx++; loadRound(); }, 1500);
            } else {
                if (window.sound) window.sound.playFail();
                Array.from(slotsArea.children).forEach(s => { s.style.borderColor = '#D50000'; s.style.animation = 'shake-anim 0.4s'; });
                setTimeout(() => { clearAnswer(); }, 800);
            }
            updateInfo();
        }

        function showWin() {
            if (window.sound) window.sound.playSuccess();
            const modal = document.createElement('div');
            modal.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFF;padding:25px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;z-index:10000;width:80%;max-width:300px;';
            modal.innerHTML = `<div style="font-size:48px">🎊</div><h3 style="color:#6A1B9A;margin:8px 0;font-size:22px;">رائع!</h3><p style="color:#555;margin:8px 0;">نقاطك: ${score} / ${words.length}</p><button class="menu-btn" style="background:#6A1B9A;color:#FFF;border:none;padding:10px 20px;font-size:16px;border-radius:25px;cursor:pointer;margin-top:10px;">العب مرة أخرى 🔄</button>`;
            modal.querySelector('button').addEventListener('click', () => { modal.remove(); qIdx=0; score=0; loadRound(); });
            container.appendChild(modal);
        }

        loadRound();
    };
})();
