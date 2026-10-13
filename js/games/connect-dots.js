// صل النقاط - Connect the Dots Game
(function() {
    window.initConnectDotsGame = function(container) {
        container.innerHTML = "";

        // Each picture: array of {x,y} dots in order, plus a draw function for the reveal
        const pictures = [
            {
                name: 'نجمة',
                emoji: '⭐',
                dots: [
                    {x:150, y:30},   // 1 - top
                    {x:195, y:165},  // 2 - right bottom
                    {x:70, y:75},    // 3 - left middle
                    {x:230, y:75},   // 4 - right middle
                    {x:105, y:165},  // 5 - left bottom
                ],
                revealColor: '#FFD600',
                revealFill: '#FFE57F',
                revealMsg: 'نجمة لامعة! ⭐',
            },
            {
                name: 'قلب',
                emoji: '💖',
                dots: [
                    {x:150, y:80},   // 1
                    {x:200, y:50},   // 2
                    {x:230, y:80},   // 3
                    {x:220, y:120},  // 4
                    {x:150, y:170},  // 5
                    {x:80, y:120},   // 6
                    {x:70, y:80},    // 7
                    {x:100, y:50},   // 8
                    {x:150, y:80},   // 9 (close)
                ],
                revealColor: '#FF1744',
                revealFill: '#FF80AB',
                revealMsg: 'قلب جميل! 💖',
            },
            {
                name: 'منزل',
                emoji: '🏠',
                dots: [
                    {x:75, y:130},  // 1 - bottom left
                    {x:225, y:130}, // 2 - bottom right
                    {x:225, y:80},  // 3 - right wall
                    {x:150, y:40},  // 4 - roof top
                    {x:75, y:80},   // 5 - left wall
                    {x:75, y:130},  // 6 - close wall
                    {x:120, y:130}, // 7 - door left
                    {x:120, y:100}, // 8 - door top left
                    {x:180, y:100}, // 9 - door top right
                    {x:180, y:130}, // 10 - door right
                ],
                revealColor: '#FB8C00',
                revealFill: '#FFD180',
                revealMsg: 'بيت جميل! 🏠',
            },
            {
                name: 'سمكة',
                emoji: '🐟',
                dots: [
                    {x:200, y:110}, // 1 - mouth
                    {x:170, y:85},  // 2 - top
                    {x:100, y:80},  // 3 - top back
                    {x:70, y:100},  // 4 - tail top
                    {x:50, y:120},  // 5 - tail mid
                    {x:70, y:140},  // 6 - tail bot
                    {x:100, y:155}, // 7 - bottom back
                    {x:170, y:150}, // 8 - bottom
                    {x:200, y:130}, // 9 - mouth bot
                    {x:200, y:110}, // 10 - close
                ],
                revealColor: '#00B0FF',
                revealFill: '#80D8FF',
                revealMsg: 'سمكة رائعة! 🐟',
            },
            {
                name: 'شمس',
                emoji: '☀️',
                dots: [
                    {x:150, y:30},  // 1 top
                    {x:200, y:50},  // 2
                    {x:220, y:100}, // 3 right
                    {x:200, y:150}, // 4
                    {x:150, y:175}, // 5 bottom
                    {x:100, y:150}, // 6
                    {x:80, y:100},  // 7 left
                    {x:100, y:50},  // 8
                    {x:150, y:30},  // 9 close
                ],
                revealColor: '#FFD600',
                revealFill: '#FFF176',
                revealMsg: 'شمس مشرقة! ☀️',
            },
        ];

        let picIdx = 0;
        let connectedCount = 0;
        let lastDot = -1;
        let connected = [];

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:400px;margin:0 auto;padding:10px;box-sizing:border-box;';
        container.appendChild(wrap);

        const title = document.createElement('h2');
        title.className = 'game-title';
        title.innerText = 'صل النقاط ✏️';
        title.style.cssText = 'color:#00695C;margin-bottom:8px;';
        wrap.appendChild(title);

        const info = document.createElement('div');
        info.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;padding:8px 12px;background:#FFF;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,0.1);box-sizing:border-box;margin-bottom:8px;';
        wrap.appendChild(info);
        const picLabel = document.createElement('span');
        picLabel.style.cssText = 'font-weight:bold;color:#00695C;font-size:15px;';
        const dotsLabel = document.createElement('span');
        dotsLabel.style.cssText = 'font-weight:bold;color:#555;font-size:14px;';
        info.appendChild(picLabel);
        info.appendChild(dotsLabel);

        const instrEl = document.createElement('div');
        instrEl.style.cssText = 'font-size:14px;color:#555;text-align:center;margin-bottom:8px;';
        instrEl.innerText = '👆 اضغط النقاط بالترتيب من 1 إلى النهاية';
        wrap.appendChild(instrEl);

        // Picture selector
        const selRow = document.createElement('div');
        selRow.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;justify-content:center;';
        wrap.appendChild(selRow);
        pictures.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.innerText = p.emoji;
            btn.title = p.name;
            btn.style.cssText = `width:38px;height:38px;font-size:20px;border-radius:50%;border:3px solid ${i===0?'#00695C':'#B2DFDB'};background:${i===0?'#E0F2F1':'#FFF'};cursor:pointer;transition:all 0.2s;`;
            btn.classList.add('dot-pic-btn');
            btn.addEventListener('click', () => {
                document.querySelectorAll('.dot-pic-btn').forEach((b,j) => {
                    b.style.border = j===i?`3px solid #00695C`:`3px solid #B2DFDB`;
                    b.style.background = j===i?'#E0F2F1':'#FFF';
                });
                picIdx = i;
                loadPicture();
            });
            selRow.appendChild(btn);
        });

        // Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 220;
        canvas.style.cssText = 'border-radius:20px;background:#FFF;box-shadow:0 6px 16px rgba(0,0,0,0.12);width:100%;max-width:100%;cursor:pointer;';
        wrap.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Reset btn
        const resetBtn = document.createElement('button');
        resetBtn.innerText = '🔄 إعادة الرسم';
        resetBtn.style.cssText = 'margin-top:12px;padding:10px 24px;font-size:15px;font-weight:bold;border:none;border-radius:25px;background:#00695C;color:#FFF;cursor:pointer;';
        resetBtn.addEventListener('click', loadPicture);
        wrap.appendChild(resetBtn);

        function getCanvasPos(evt) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
            const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        }

        function loadPicture() {
            const pic = pictures[picIdx];
            connectedCount = 0;
            lastDot = -1;
            connected = new Array(pic.dots.length).fill(false);
            picLabel.innerText = `${pic.emoji} ${pic.name}`;
            dotsLabel.innerText = `النقاط: 0/${pic.dots.length-1}`;
            instrEl.innerText = `👆 اضغط النقاط بالترتيب من 1 إلى ${pic.dots.length}`;
            drawState();
        }

        function drawState() {
            const pic = pictures[picIdx];
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw completed lines
            if (connected.some(Boolean)) {
                ctx.beginPath();
                let started = false;
                for (let i=0; i<pic.dots.length; i++) {
                    if (!connected[i]) break;
                    if (!started) { ctx.moveTo(pic.dots[i].x, pic.dots[i].y); started = true; }
                    else ctx.lineTo(pic.dots[i].x, pic.dots[i].y);
                }
                ctx.strokeStyle = pic.revealColor;
                ctx.lineWidth = 4;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // If all connected, fill shape
            if (connectedCount >= pic.dots.length - 1) {
                ctx.beginPath();
                ctx.moveTo(pic.dots[0].x, pic.dots[0].y);
                for (let i=1; i<pic.dots.length; i++) ctx.lineTo(pic.dots[i].x, pic.dots[i].y);
                ctx.closePath();
                ctx.fillStyle = pic.revealFill;
                ctx.fill();
                ctx.strokeStyle = pic.revealColor;
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            // Draw dots
            pic.dots.forEach((dot, i) => {
                const isDone = connected[i];
                const isNext = i === lastDot + 1;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, isDone ? 8 : 12, 0, Math.PI*2);
                ctx.fillStyle = isDone ? pic.revealColor : (isNext ? '#FF6D00' : '#ECEFF1');
                ctx.fill();
                ctx.strokeStyle = isDone ? pic.revealColor : '#90A4AE';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (!isDone) {
                    ctx.fillStyle = '#37474F';
                    ctx.font = `bold ${isNext?14:12}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(i+1, dot.x, dot.y);
                } else {
                    ctx.fillStyle = '#FFF';
                    ctx.font = 'bold 10px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('✓', dot.x, dot.y);
                }
            });
        }

        function handleTap(evt) {
            evt.preventDefault();
            const pic = pictures[picIdx];
            const pos = getCanvasPos(evt);
            const nextIdx = lastDot + 1;
            if (nextIdx >= pic.dots.length) return;
            const dot = pic.dots[nextIdx];
            const dist = Math.hypot(pos.x - dot.x, pos.y - dot.y);
            if (dist < 30) {
                connected[nextIdx] = true;
                lastDot = nextIdx;
                if (window.sound) window.sound.playClick();
                if (nextIdx > 0) connectedCount++;
                dotsLabel.innerText = `النقاط: ${connectedCount}/${pic.dots.length-1}`;
                drawState();
                if (connectedCount >= pic.dots.length - 1) {
                    setTimeout(() => {
                        instrEl.innerText = `🎉 ${pic.revealMsg}`;
                        instrEl.style.color = '#00695C';
                        if (window.sound) window.sound.playSuccess();
                    }, 200);
                }
            } else {
                // Shake wrong dot
                ctx.save();
                ctx.fillStyle = '#FF1744';
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 15, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
                setTimeout(drawState, 300);
            }
        }

        canvas.addEventListener('click', handleTap);
        canvas.addEventListener('touchstart', handleTap, { passive: false });

        loadPicture();
    };
})();
