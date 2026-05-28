document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let tickets = []; // Array of { group: "1", number: "123" }
    
    // --- DOM Elements ---
    const spinBtn = document.getElementById('spin-btn');
    const resultDisplay = document.getElementById('result-display');
    const winningNumberEl = document.getElementById('winning-number');
    
    const groupSelect = document.getElementById('group-select');
    const ticketInput = document.getElementById('ticket-input');
    const btnAddTicket = document.getElementById('btn-add-ticket');
    const btnResetTickets = document.getElementById('btn-reset-tickets');
    const ticketListEl = document.getElementById('ticket-list');
    const ticketCountEl = document.getElementById('ticket-count');
    
    const winnersCard = document.getElementById('winners-card');
    const winnersListEl = document.getElementById('winners-list');
    
    const timerDisplay = document.getElementById('timer-display');
    const btnTimerStart = document.getElementById('btn-timer-start');
    const btnTimerReset = document.getElementById('btn-timer-reset');

    // --- Timer Logic ---
    let timerInterval = null;
    let timeLeft = 15 * 60; // 15 minutes in seconds
    let isTimerRunning = false;

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
        
        if (timeLeft <= 60) {
            timerDisplay.style.color = 'var(--danger-red)';
        } else {
            timerDisplay.style.color = 'var(--primary-blue)';
        }
    }

    btnTimerStart.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            btnTimerStart.innerHTML = 'เริ่มต่อ';
            isTimerRunning = false;
        } else {
            if (timeLeft === 0) return;
            isTimerRunning = true;
            btnTimerStart.innerHTML = 'พัก';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    btnTimerStart.innerHTML = 'หมดเวลา!';
                    // Optional: play siren sound
                }
            }, 1000);
        }
    });

    btnTimerReset.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 15 * 60;
        updateTimerDisplay();
        btnTimerStart.innerHTML = 'เริ่ม/พัก';
    });


    // --- Ticket Logic ---
    btnAddTicket.addEventListener('click', () => {
        const group = groupSelect.value;
        const number = ticketInput.value.trim();

        if (!group) {
            alert('กรุณาเลือกกลุ่มก่อนครับ');
            return;
        }
        if (!/^\d{3}$/.test(number)) {
            alert('กรุณากรอกตัวเลข 3 หลักให้ถูกต้องครับ (เช่น 045)');
            return;
        }

        // Add ticket
        tickets.push({ group, number });
        
        // Render
        renderTickets();
        
        // Clear input
        ticketInput.value = '';
        ticketInput.focus();
    });

    function renderTickets() {
        ticketCountEl.textContent = tickets.length;
        if (tickets.length === 0) {
            ticketListEl.innerHTML = '<p class="empty-msg">ยังไม่มีการแทงหวยในรอบนี้</p>';
            return;
        }

        ticketListEl.innerHTML = '';
        // Show newest top
        [...tickets].reverse().forEach(t => {
            const div = document.createElement('div');
            div.className = 'ticket-item';
            div.innerHTML = `
                <span class="t-group">กลุ่ม ${t.group}</span>
                <span class="t-num">${t.number}</span>
            `;
            ticketListEl.appendChild(div);
        });
    }

    // Allow Enter key to add ticket
    ticketInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAddTicket.click();
        }
    });

    btnResetTickets.addEventListener('click', () => {
        if (tickets.length === 0 && resultDisplay.classList.contains('hidden')) return;
        
        if (confirm('คุณต้องการล้างข้อมูลเพื่อเริ่มรอบใหม่ใช่ไหม?')) {
            tickets = [];
            renderTickets();
            
            // Clear result display and winners card
            resultDisplay.classList.add('hidden');
            winnersCard.classList.add('hidden');
            
            // Reset slot machine view
            slots.forEach(slot => {
                slot.style.transition = 'none';
                slot.style.transform = `translateY(0px)`;
            });
            
            winningNumberEl.textContent = '---';
            spinBtn.textContent = 'สุ่มรางวัล!';
            spinBtn.disabled = false;
        }
    });


    // --- Slot Machine & Calculation Logic ---
    const slots = [
        document.querySelector('#slot-1 .numbers'),
        document.querySelector('#slot-2 .numbers'),
        document.querySelector('#slot-3 .numbers')
    ];

    const slotHeight = 80; // Match css

    function generateSlotStrip() {
        let strip = '';
        for (let i = 0; i < 40; i++) {
            strip += `${i % 10}<br>`;
        }
        return strip;
    }

    slots.forEach(slot => {
        slot.innerHTML = generateSlotStrip();
    });

    spinBtn.addEventListener('click', () => {
        // Validation check
        if (tickets.length === 0) {
            if(!confirm('ยังไม่มีใครซื้อโพยเลย ยืนยันที่จะสุ่มไหม?')) return;
        }

        spinBtn.disabled = true;
        spinBtn.textContent = 'กำลังปั่น...';
        resultDisplay.classList.add('hidden');
        winnersCard.classList.add('hidden');

        // Random 3 digits
        const digits = [
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10)
        ];
        const winningNumberStr = digits.join('');

        slots.forEach(slot => {
            slot.style.transition = 'none';
            slot.style.transform = `translateY(0px)`;
        });
        slots[0].offsetHeight; // force reflow

        slots.forEach((slot, index) => {
            const targetPos = 30 + digits[index];
            const scrollDistance = -(targetPos * slotHeight);

            setTimeout(() => {
                slot.style.transition = `transform ${2 + index * 0.5}s cubic-bezier(0.25, 1, 0.5, 1)`;
                slot.style.transform = `translateY(${scrollDistance}px)`;
            }, 50);
        });

        const maxAnimationTime = (2 + 2 * 0.5) * 1000 + 50;
        
        setTimeout(() => {
            winningNumberEl.textContent = winningNumberStr;
            resultDisplay.classList.remove('hidden');
            
            spinBtn.disabled = false;
            spinBtn.textContent = 'สุ่มรอบต่อไป!';

            // Calculate winners
            calculateAndShowWinners(winningNumberStr);
            
            // Auto stop timer if running
            if (isTimerRunning) {
                btnTimerStart.click(); // pauses it
            }

        }, maxAnimationTime + 200);
    });

    function calculateAndShowWinners(winningStr) {
        const winningNum = parseInt(winningStr, 10);
        const winningLast2 = winningStr.slice(1);
        
        let results = [];
        
        tickets.forEach(ticket => {
            const tNumStr = ticket.number;
            const tNum = parseInt(tNumStr, 10);
            const tLast2 = tNumStr.slice(1);
            
            let reward = 0;
            let reason = '';
            
            if (tNumStr === winningStr) {
                reward = 50;
                reason = 'รางวัลที่ 1 (3 ตัวตรง)';
            } else if (tLast2 === winningLast2) {
                reward = 20;
                reason = 'รางวัลปลอบใจ (ท้าย 2 ตัว)';
            } else if (tNum === winningNum + 1 || tNum === winningNum - 1) {
                reward = 10;
                reason = 'รางวัลเฉียดตาย (±1)';
            }
            
            if (reward > 0) {
                results.push({
                    group: ticket.group,
                    number: tNumStr,
                    reward,
                    reason
                });
            }
        });

        // Render winners
        winnersListEl.innerHTML = '';
        if (results.length === 0) {
            winnersListEl.innerHTML = '<p class="empty-msg">เจ้ามือกินเรียบ! ไม่มีใครถูกรางวัลรอบนี้</p>';
        } else {
            results.sort((a,b) => b.reward - a.reward); // highest reward first
            
            results.forEach(res => {
                const div = document.createElement('div');
                div.className = 'winner-item';
                div.innerHTML = `
                    <div class="winner-header">
                        <span>กลุ่ม ${res.group} (เลข ${res.number})</span>
                        <span class="reward-text">+${res.reward} ลูกอม</span>
                    </div>
                    <div class="winner-reason">${res.reason}</div>
                `;
                winnersListEl.appendChild(div);
            });
        }
        
        winnersCard.classList.remove('hidden');
    }
});
