// الطبخ السحري - Magic Cooking Game
(function() {
    window.initCookingGame = function(container) {
        container.innerHTML = "";

        const recipes = [
            {
                name: 'كيكة عيد الميلاد',
                emoji: '🎂',
                correct: ['🥚','🍚','🧈','🥛'],
                wrong: ['🧅','🌶️','🧄','🍣'],
                steps: ['أضف البيض','أضف الطحين','أضف الزبدة','أضف الحليب'],
            },
            {
                name: 'عصير فواكه',
                emoji: '🍹',
                correct: ['🍓','🍊','🍋','💧'],
                wrong: ['🧅','🥩','🧄','🥦'],
                steps: ['فراولة','برتقال','ليمون','ماء'],
            },
            {
                name: 'سلطة خضار',
                emoji: '🥗',
                correct: ['🥬','🍅','🥕','🫒'],
                wrong: ['🍰','🍬','🍫','🧁'],
                steps: ['خس','طماطم','جزر','زيتون'],
            },
            {
                name: 'بيتزا',
                emoji: '🍕',
                correct: ['🫓','🍅','🧀','🌿'],
                wrong: ['🍰','🍬','🍦','🍮'],
                steps: ['عجينة','صلصة','جبن','ريحان'],
            },
        ];

        let rIdx = 0, score = 0;
        let placedCorrect = 0;
        let stepDone = [];

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:400px;margin:0 auto;padding:10px;box-sizing:border-box;';
        container.appendChild(wrap);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'الطبخ السحري 🍳';
        title.style.cssText = 'color:#BF360C;margin-bottom:8px;';
        wrap.appendChild(title);

        const info = document.createElement('div');
        info.style.cssText = 'display:flex;justify-content:space-between;width:100%;padding:8px 12px;background:#FFF;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,0.1);box-sizing:border-box;margin-bottom:10px;';
        wrap.appendChild(info);
        const progEl = document.createElement('span');
        progEl.style.cssText = 'font-weight:bold;color:#BF360C;font-size:15px;';
        const scoreEl = document.createElement('span');
        scoreEl.style.cssText = 'font-weight:bold;color:#2E7D32;font-size:15px;';
        info.appendChild(progEl);
        info.appendChild(scoreEl);

        // Recipe card
        const recipeCard = document.createElement('div');
        recipeCard.style.cssText = 'background:linear-gradient(135deg,#FFF3E0,#FBE9E7);border-radius:20px;padding:12px;text-align:center;width:100%;box-sizing:border-box;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);';
        wrap.appendChild(recipeCard);

        const recipeEmoji = document.createElement('div');
        recipeEmoji.style.cssText = 'font-size:55px;';
        recipeCard.appendChild(recipeEmoji);

        const recipeName = document.createElement('div');
        recipeName.style.cssText = 'font-size:17px;font-weight:bold;color:#BF360C;margin:6px 0;';
        recipeCard.appendChild(recipeName);

        // Steps row
        const stepsRow = document.createElement('div');
        stepsRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';
        recipeCard.appendChild(stepsRow);

        // Pot (drop zone)
        const potArea = document.createElement('div');
        potArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;margin-bottom:12px;';
        wrap.appendChild(potArea);

        const potSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        potSVG.setAttribute('viewBox', '0 0 120 100');
        potSVG.style.cssText = 'width:130px;height:auto;drop-shadow:0 4px 8px rgba(0,0,0,0.2);';
        potSVG.innerHTML = `
        <rect x="15" y="38" width="90" height="55" rx="20" fill="#546E7A"/>
        <rect x="20" y="28" width="80" height="20" rx="8" fill="#455A64"/>
        <rect x="5" y="35" width="18" height="10" rx="5" fill="#78909C"/>
        <rect x="97" y="35" width="18" height="10" rx="5" fill="#78909C"/>
        <ellipse cx="60" cy="28" rx="40" ry="10" fill="#37474F"/>
        `;
        potArea.appendChild(potSVG);

        const potLabel = document.createElement('div');
        potLabel.style.cssText = 'font-size:13px;color:#777;margin-top:2px;';
        potLabel.innerText = 'اسحب المكونات الصحيحة إلى القدر!';
        potArea.appendChild(potLabel);

        // Ingredients area
        const ingredientsEl = document.createElement('div');
        ingredientsEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;background:rgba(255,255,255,0.7);border-radius:18px;padding:14px;width:100%;box-sizing:border-box;';
        wrap.appendChild(ingredientsEl);

        // Instruction
        const instrEl = document.createElement('div');
        instrEl.style.cssText = 'font-size:14px;color:#555;margin-top:8px;font-weight:bold;text-align:center;';
        wrap.appendChild(instrEl);

        function updateInfo() {
            progEl.innerText = `الوصفة: ${rIdx+1}/${recipes.length}`;
            scoreEl.innerText = `نقاط: ${score}`;
        }

        function loadRound() {
            if (rIdx >= recipes.length) { showWin(); return; }
            updateInfo();
            const recipe = recipes[rIdx];
            placedCorrect = 0;
            stepDone = new Array(recipe.correct.length).fill(false);

            recipeEmoji.innerText = recipe.emoji;
            recipeName.innerText = recipe.name;

            // Steps indicator
            stepsRow.innerHTML = '';
            recipe.correct.forEach((_, i) => {
                const step = document.createElement('div');
                step.id = `step_${i}`;
                step.style.cssText = 'width:22px;height:22px;border-radius:50%;background:#E0E0E0;display:flex;align-items:center;justify-content:center;font-size:14px;transition:background 0.3s;';
                step.innerText = i+1;
                stepsRow.appendChild(step);
            });

            instrEl.innerText = `أضف المكونات الصحيحة لطبخ ${recipe.name}!`;

            // Build ingredients
            ingredientsEl.innerHTML = '';
            const allItems = [...recipe.correct, ...recipe.wrong].sort(() => Math.random()-0.5);
            allItems.forEach(item => {
                const btn = document.createElement('div');
                btn.style.cssText = 'font-size:38px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#FFF;border-radius:16px;box-shadow:0 4px 10px rgba(0,0,0,0.12);cursor:pointer;transition:transform 0.15s;border:3px solid transparent;user-select:none;';
                btn.innerText = item;
                btn.dataset.isCorrect = recipe.correct.includes(item) ? '1' : '0';
                btn.addEventListener('click', () => handleIngredient(btn, item, recipe));
                btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.15)');
                btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
                ingredientsEl.appendChild(btn);
            });
        }

        function handleIngredient(btn, item, recipe) {
            if (btn.dataset.used === '1') return;
            if (btn.dataset.isCorrect === '1') {
                btn.dataset.used = '1';
                btn.style.opacity = '0.4';
                btn.style.transform = 'scale(0.85)';
                btn.style.borderColor = '#00C853';
                if (window.sound) window.sound.playClick();

                // Animate to pot
                const idx = recipe.correct.indexOf(item);
                const step = document.getElementById(`step_${idx}`);
                if (step) {
                    step.style.background = '#00C853';
                    step.innerText = '✓';
                }

                placedCorrect++;
                instrEl.innerText = `✅ ${recipe.steps[idx]}!`;
                instrEl.style.color = '#2E7D32';

                if (placedCorrect === recipe.correct.length) {
                    score++;
                    updateInfo();
                    if (window.sound) window.sound.playSuccess();
                    instrEl.innerText = `🎉 ${recipe.name} جاهزة!`;
                    setTimeout(() => { rIdx++; loadRound(); }, 2000);
                }
            } else {
                if (window.sound) window.sound.playFail();
                btn.style.background = '#FFEBEE';
                btn.style.borderColor = '#D50000';
                instrEl.innerText = '❌ هذا ليس من المكونات!';
                instrEl.style.color = '#D32F2F';
                setTimeout(() => {
                    btn.style.background = '#FFF';
                    btn.style.borderColor = 'transparent';
                }, 700);
            }
        }

        function showWin() {
            if (window.sound) window.sound.playSuccess();
            const modal = document.createElement('div');
            modal.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFF;padding:25px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;z-index:10000;width:80%;max-width:300px;';
            modal.innerHTML = `<div style="font-size:56px">👨‍🍳</div><h3 style="color:#BF360C;margin:8px 0;font-size:22px;">طباخ ماهر!</h3><p style="color:#555;">نقاطك: ${score} / ${recipes.length}</p><button class="menu-btn" style="background:#BF360C;color:#FFF;border:none;padding:10px 20px;font-size:16px;border-radius:25px;cursor:pointer;margin-top:10px;">اطبخ مرة أخرى 🔄</button>`;
            modal.querySelector('button').addEventListener('click', () => { modal.remove(); rIdx=0; score=0; loadRound(); });
            container.appendChild(modal);
        }

        loadRound();
    };
})();
