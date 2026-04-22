document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bmi-form');
    const resultDisplay = document.getElementById('result-display');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiStatusEl = document.getElementById('bmi-status');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    let bmiHistory = JSON.parse(localStorage.getItem('auraBmiHistory')) || [];

    const getStatusInfo = (bmi) => {
        if (bmi < 18.5) return { text: 'братан надо больше жрать 👅', color: 'var(--status-underweight)' };
        if (bmi >= 18.5 && bmi < 24.9) return { text: 'все нормально 💯', color: 'var(--status-normal)' };
        if (bmi >= 25 && bmi < 29.9) return { text: 'чуть лишнего, но ок 😐', color: 'var(--status-overweight)' };
        return { text: 'братан пора на диету 😭', color: 'var(--status-obese)' };
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        if (bmiHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-state">Пока пусто. Начни считать!</li>';
            return;
        }

        bmiHistory.slice().reverse().forEach(entry => {
            const statusInfo = getStatusInfo(entry.bmi);
            const date = new Date(entry.date).toLocaleDateString('ru-RU', { 
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-info">
                    <span class="history-date">${date}</span>
                    <span class="history-metrics">${entry.weight} кг • ${entry.height} см</span>
                </div>
                <div class="history-score">
                    <span class="history-bmi" style="color: ${statusInfo.color}">${entry.bmi}</span>
                    <span class="history-status" style="color: ${statusInfo.color}; background: ${statusInfo.color}20">${statusInfo.text}</span>
                </div>
            `;
            historyList.appendChild(li);
        });
    };

    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);

        if (!weight || !height || weight <= 0 || height <= 0) return;

        const heightInMeters = height / 100;
        const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(1);

        const statusInfo = getStatusInfo(bmi);

        resultDisplay.style.display = 'block';
        setTimeout(() => {
            resultDisplay.classList.remove('hidden');
        }, 10);
        
        animateValue(bmiValueEl, 0, bmi, 1000);
        
        setTimeout(() => {
            bmiValueEl.style.color = statusInfo.color;
            bmiStatusEl.textContent = statusInfo.text;
            bmiStatusEl.style.color = statusInfo.color;
        }, 1000);

        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            weight,
            height,
            bmi
        };

        bmiHistory.push(newEntry);
        localStorage.setItem('auraBmiHistory', JSON.stringify(bmiHistory));
        
        renderHistory();
        form.reset();
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Точно очистить историю?')) {
            bmiHistory = [];
            localStorage.removeItem('auraBmiHistory');
            renderHistory();
            
            resultDisplay.classList.add('hidden');
            setTimeout(() => {
                if(resultDisplay.classList.contains('hidden')) {
                    resultDisplay.style.display = 'none';
                }
            }, 500);
            bmiValueEl.style.color = 'inherit';
            bmiValueEl.textContent = '--';
            bmiStatusEl.textContent = 'Введи данные';
            bmiStatusEl.style.color = 'inherit';
        }
    });

    renderHistory();
});
