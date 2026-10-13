// Simple addition and subtraction math game for kids aged 4-6
// Show numbers visually using child-friendly emojis

(function() {
    // Emojis for visual aid representation
    const visualEmojis = ["🍎", "⭐", "🎈", "💖", "🌸"];

    window.initMathGame = function(container) {
        container.innerHTML = "";

        let currentQuestionIndex = 0;
        let correctCount = 0;
        let currentQuestion = null;
        let canAnswer = true;

        // Container structure
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "400px";
        wrapper.style.margin = "0 auto";
        wrapper.style.padding = "10px";
        wrapper.style.boxSizing = "border-box";
        container.appendChild(wrapper);

        // Header controls (Question count, Score)
        const header = document.createElement("div");
        header.style.width = "100%";
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "15px";
        header.style.padding = "10px 15px";
        header.style.background = "#FFF";
        header.style.borderRadius = "16px";
        header.style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)";
        header.style.boxSizing = "border-box";
        wrapper.appendChild(header);

        const progressInfo = document.createElement("div");
        progressInfo.style.fontSize = "16px";
        progressInfo.style.fontWeight = "bold";
        progressInfo.style.color = "#E65100";
        header.appendChild(progressInfo);

        const scoreInfo = document.createElement("div");
        scoreInfo.style.fontSize = "16px";
        scoreInfo.style.fontWeight = "bold";
        scoreInfo.style.color = "#2E7D32";
        header.appendChild(scoreInfo);

        // Main game card
        const gameCard = document.createElement("div");
        gameCard.style.width = "100%";
        gameCard.style.background = "#FFF";
        gameCard.style.borderRadius = "24px";
        gameCard.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        gameCard.style.padding = "20px";
        gameCard.style.boxSizing = "border-box";
        gameCard.style.display = "flex";
        gameCard.style.flexDirection = "column";
        gameCard.style.alignItems = "center";
        gameCard.style.gap = "20px";
        wrapper.appendChild(gameCard);

        // Formula Display
        const equationDiv = document.createElement("div");
        equationDiv.style.fontSize = "42px";
        equationDiv.style.fontWeight = "bold";
        equationDiv.style.color = "#FF6F00";
        equationDiv.style.textAlign = "center";
        equationDiv.style.direction = "ltr";
        gameCard.appendChild(equationDiv);

        // Visual Aid (Emoji Counts)
        const visualAidContainer = document.createElement("div");
        visualAidContainer.style.display = "flex";
        visualAidContainer.style.alignItems = "center";
        visualAidContainer.style.justifyContent = "center";
        visualAidContainer.style.gap = "15px";
        visualAidContainer.style.flexWrap = "wrap";
        visualAidContainer.style.minHeight = "60px";
        visualAidContainer.style.width = "100%";
        gameCard.appendChild(visualAidContainer);

        // Answers grid
        const answersGrid = document.createElement("div");
        answersGrid.style.width = "100%";
        answersGrid.style.display = "grid";
        answersGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
        answersGrid.style.gap = "12px";
        gameCard.appendChild(answersGrid);

        // Restart button
        const restartBtn = document.createElement("button");
        restartBtn.className = "menu-btn restart-btn";
        restartBtn.innerText = "إعادة اللعب 🔄";
        restartBtn.style.marginTop = "20px";
        restartBtn.style.padding = "10px 25px";
        restartBtn.style.fontSize = "16px";
        restartBtn.style.background = "#FF6F00";
        restartBtn.style.color = "#FFF";
        restartBtn.style.border = "none";
        restartBtn.style.borderRadius = "25px";
        restartBtn.style.cursor = "pointer";
        restartBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        restartBtn.addEventListener("click", () => {
            if (window.sound) window.sound.playClick();
            startNewGame();
        });
        wrapper.appendChild(restartBtn);

        // Logic functions
        function startNewGame() {
            currentQuestionIndex = 0;
            correctCount = 0;
            loadQuestion();
        }

        function loadQuestion() {
            canAnswer = true;
            updateUI();

            // Generate operands
            const op = Math.random() > 0.5 ? "+" : "-";
            let num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
            let num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to num1-1 (for positive subtract)

            let correctAnswer;
            if (op === "+") {
                // Keep sum simple (<= 12)
                num1 = Math.floor(Math.random() * 5) + 2; // 2 to 6
                num2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
                correctAnswer = num1 + num2;
            } else {
                correctAnswer = num1 - num2;
            }

            currentQuestion = {
                num1: num1,
                num2: num2,
                op: op,
                correctAnswer: correctAnswer
            };

            // Display Equation
            equationDiv.innerText = `${num1} ${op} ${num2} = ?`;

            // Draw visual aids
            const emojiChar = visualEmojis[Math.floor(Math.random() * visualEmojis.length)];
            const emojiSrc = window.getEmojiSVG(emojiChar);

            visualAidContainer.innerHTML = "";

            // Group 1 Emojis
            const group1 = document.createElement("div");
            group1.style.display = "flex";
            group1.style.gap = "4px";
            for (let i = 0; i < num1; i++) {
                const img = document.createElement("img");
                img.src = emojiSrc;
                img.style.width = "28px";
                img.style.height = "28px";
                group1.appendChild(img);
            }
            visualAidContainer.appendChild(group1);

            // Operator Sign
            const sign = document.createElement("div");
            sign.innerText = op === "+" ? "➕" : "➖";
            sign.style.fontSize = "20px";
            visualAidContainer.appendChild(sign);

            // Group 2 Emojis
            const group2 = document.createElement("div");
            group2.style.display = "flex";
            group2.style.gap = "4px";
            for (let i = 0; i < num2; i++) {
                const img = document.createElement("img");
                img.src = emojiSrc;
                img.style.width = "28px";
                img.style.height = "28px";
                group2.appendChild(img);
            }
            visualAidContainer.appendChild(group2);

            // Generate multiple choices (1 correct, 3 wrong)
            const choices = [correctAnswer];
            while (choices.length < 4) {
                // Plausible offset ±1, ±2, ±3
                const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
                const wrong = correctAnswer + offset;
                if (wrong > 0 && wrong <= 15 && !choices.includes(wrong)) {
                    choices.push(wrong);
                }
            }
            // Shuffle choices
            choices.sort(() => Math.random() - 0.5);

            // Render Choice Buttons
            answersGrid.innerHTML = "";
            const buttonColors = ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800"];

            choices.forEach((choice, idx) => {
                const btn = document.createElement("button");
                btn.style.width = "100%";
                btn.style.height = "70px";
                btn.style.fontSize = "32px";
                btn.style.fontWeight = "bold";
                btn.style.border = "none";
                btn.style.borderRadius = "16px";
                btn.style.cursor = "pointer";
                btn.style.background = buttonColors[idx];
                btn.style.color = "#FFF";
                btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.12)";
                btn.style.transition = "transform 0.1s, opacity 0.2s";
                btn.innerText = choice;

                btn.addEventListener("click", () => handleAnswer(choice, btn));
                answersGrid.appendChild(btn);
            });
        }

        function handleAnswer(selected, buttonEl) {
            if (!canAnswer) return;

            if (selected === currentQuestion.correctAnswer) {
                // Correct!
                canAnswer = false;
                correctCount++;
                updateUI();

                if (window.sound) window.sound.playSuccess();

                buttonEl.style.background = "#00C853";
                buttonEl.classList.add("bounce-anim");

                // Disable other buttons slightly
                Array.from(answersGrid.children).forEach(btn => {
                    if (btn !== buttonEl) btn.style.opacity = "0.5";
                });

                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < 8) {
                        loadQuestion();
                    } else {
                        showResultsModal();
                    }
                }, 1500);
            } else {
                // Wrong!
                if (window.sound) window.sound.playFail();
                buttonEl.style.background = "#D50000";
                buttonEl.classList.add("shake-anim");
                setTimeout(() => {
                    buttonEl.classList.remove("shake-anim");
                }, 500);
            }
        }

        function updateUI() {
            progressInfo.innerText = `السؤال: ${currentQuestionIndex + 1} من 8`;
            scoreInfo.innerText = `الصواب: ${correctCount} / 8`;
        }

        function showResultsModal() {
            const modal = document.createElement("div");
            modal.className = "game-modal";
            modal.style.position = "absolute";
            modal.style.top = "50%";
            modal.style.left = "50%";
            modal.style.transform = "translate(-50%, -50%)";
            modal.style.background = "#FFF";
            modal.style.padding = "25px";
            modal.style.borderRadius = "24px";
            modal.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
            modal.style.textAlign = "center";
            modal.style.zIndex = "10000";
            modal.style.width = "85%";
            modal.style.maxWidth = "320px";

            // Visual feedback based on score
            let ratingTitle = "ممتاز جداً! 🌟";
            let ratingMsg = "أنت ذكي جداً وممتاز في الحساب!";
            if (correctCount < 5) {
                ratingTitle = "عمل جيد! 👍";
                ratingMsg = "أحسنت محاولة رائعة! واصل التدريب.";
            }

            modal.innerHTML = `
                <h3 style="color: #E65100; margin: 0 0 10px 0; font-size: 24px;">${ratingTitle}</h3>
                <p style="color: #666; margin: 0 0 15px 0; font-size: 16px;">${ratingMsg}</p>
                <div style="font-size: 28px; font-weight: bold; color: #2E7D32; margin-bottom: 25px;">النتيجة: ${correctCount} / 8</div>
                <button class="menu-btn restart-btn" style="background:#E65100; color:#FFF; border:none; padding:12px 25px; font-size:16px; border-radius:25px; cursor:pointer; width:100%; box-sizing:border-box;">العب مرة أخرى 🔄</button>
            `;

            modal.querySelector("button").addEventListener("click", () => {
                if (window.sound) window.sound.playClick();
                modal.remove();
                startNewGame();
            });

            wrapper.appendChild(modal);
        }

        // Run game initial setup
        startNewGame();
    };
})();
