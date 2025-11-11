document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const targetHoursInput = document.getElementById('target-hours');
    const generateBtn = document.getElementById('generate-btn');
    const candlesContainer = document.getElementById('candles-container');
    const candlesGrid = document.getElementById('candles-grid');
    const totalHoursSpan = document.getElementById('total-hours');
    const completedHoursSpan = document.getElementById('completed-hours');
    const timerContainer = document.getElementById('timer-container');
    const currentCandle = document.getElementById('current-candle');
    const wax = currentCandle.querySelector('.wax');
    const flame = currentCandle.querySelector('.flame');
    const dripsContainer = document.getElementById('drips-container');
    const timeDisplay = document.getElementById('time');
    const progressBar = document.getElementById('progress-bar');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const completionMessage = document.getElementById('completion-message');
    const nextBtn = document.getElementById('next-btn');

    // App State
    let candles = [];
    let currentCandleIndex = 0;
    let timer;
    let remainingTime = 0;
    let totalDuration = 0;
    let isRunning = false;
    let completedHours = 0;

    // Candle durations (in hours)
    const candleDurations = [1, 1.5, 2, 2.5];

    // Generate candles based on target hours
    generateBtn.addEventListener('click', function() {
        const targetHours = parseInt(targetHoursInput.value);
        
        if (targetHours < 10 || targetHours > 70) {
            alert('Lütfen 10 ile 70 saat arasında bir değer girin.');
            return;
        }

        candles = generateCandles(targetHours);
        renderCandles();
        
        candlesContainer.classList.remove('hidden');
        completedHours = 0;
        updateCompletedHours();
    });

    // Start timer
    startBtn.addEventListener('click', startTimer);
    
    // Pause timer
    pauseBtn.addEventListener('click', pauseTimer);
    
    // Stop timer
    stopBtn.addEventListener('click', stopTimer);
    
    // Move to next candle
    nextBtn.addEventListener('click', setupNextCandle);

    // Generate candle distribution
    function generateCandles(targetHours) {
        let remaining = targetHours;
        const generatedCandles = [];
        
        // Convert target to minutes for more precise distribution
        let remainingMinutes = targetHours * 60;
        
        while (remainingMinutes > 0) {
            // Filter possible candle durations that fit in remaining time
            const possibleDurations = candleDurations
                .map(d => d * 60)
                .filter(d => d <= remainingMinutes);
            
            if (possibleDurations.length === 0) {
                // If no full candle fits, create a smaller one with remaining time
                const smallCandle = remainingMinutes / 60;
                generatedCandles.push(parseFloat(smallCandle.toFixed(1)));
                break;
            }
            
            // Randomly select a duration
            const randomIndex = Math.floor(Math.random() * possibleDurations.length);
            const selectedDuration = possibleDurations[randomIndex];
            
            // Add to candles and subtract from remaining
            generatedCandles.push(selectedDuration / 60);
            remainingMinutes -= selectedDuration;
        }
        
        // Sort candles from largest to smallest
        generatedCandles.sort((a, b) => b - a);
        
        return generatedCandles;
    }

    // Render candles in the grid
    function renderCandles() {
        candlesGrid.innerHTML = '';
        
        const total = candles.reduce((sum, candle) => sum + candle, 0);
        totalHoursSpan.textContent = total.toFixed(1);
        
        candles.forEach((duration, index) => {
            const candleCard = document.createElement('div');
            candleCard.className = 'candle-card';
            candleCard.dataset.index = index;
            candleCard.dataset.duration = duration;
            
            candleCard.innerHTML = `
                <div class="candle-preview">
                    <div class="wax">
                        <div class="flame"></div>
                    </div>
                </div>
                <div class="duration">${duration} saat</div>
            `;
            
            candleCard.addEventListener('click', () => selectCandle(index));
            candlesGrid.appendChild(candleCard);
        });
    }

    // Select a candle to work on
    function selectCandle(index) {
        // Reset any previously selected candle
        document.querySelectorAll('.candle-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Mark selected candle
        candlesGrid.children[index].classList.add('active');
        currentCandleIndex = index;
        
        // Setup timer
        setupTimer(candles[index]);
        
        // Show timer container
        timerContainer.classList.remove('hidden');
    }

    // Setup timer for selected candle
    function setupTimer(duration) {
        totalDuration = duration * 3600; // Convert hours to seconds
        remainingTime = totalDuration;
        updateTimeDisplay();
        
        // Reset progress bar
        progressBar.style.width = '0%';
        
        // Reset candle visual
        wax.style.height = '100%';
        flame.style.display = 'block';
        
        // Hide completion message if shown
        completionMessage.classList.add('hidden');
        
        // Reset button states
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        isRunning = false;
    }

// Update time display
function updateTimeDisplay() {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    
    timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Update candle height
    const waxHeight = (remainingTime / totalDuration) * 100;
    wax.style.height = `${waxHeight}%`;

    // Damlama kapsayıcısını wax ile aynı boyuta getir (Üstten erimeye uyum)
    dripsContainer.style.height = `${waxHeight}%`;
}

    // Start timer
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        
        timer = setInterval(() => {
            remainingTime--;
            updateTimeDisplay();
            
            // Randomly create wax drips
            if (Math.random() < 0.50) {
                createWaxDrip();
            }
            
            if (remainingTime <= 0) {
                completeCandle();
            }
        }, 1000);
    }

    // Pause timer
    function pauseTimer() {
        isRunning = false;
        clearInterval(timer);
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }

    // Stop timer
    function stopTimer() {
        isRunning = false;
        clearInterval(timer);
        
        // Reset to full duration
        remainingTime = totalDuration;
        updateTimeDisplay();
        
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        
        // Clear any drips
        dripsContainer.innerHTML = '';
    }

    // Create wax drip animation
    function createWaxDrip() {
        const drip = document.createElement('div');
        drip.className = 'drip';
        
        // Random position along the candle width
        const left = Math.random() * 30 + 15;
        drip.style.left = `${left}px`;
        
        dripsContainer.appendChild(drip);
        
        // Remove drip element after animation completes
        setTimeout(() => {
            drip.remove();
        }, 3000);
    }

    // Complete current candle
    function completeCandle() {
        clearInterval(timer);
        isRunning = false;
        
        // Hide flame
        flame.style.display = 'none';
        
        // Mark candle as completed
        candlesGrid.children[currentCandleIndex].classList.add('completed');
        
        // Add to completed hours
        completedHours += candles[currentCandleIndex];
        updateCompletedHours();
        
        // Show completion message
        completionMessage.classList.remove('hidden');
        timerContainer.classList.add('hidden');
    }

    // Setup next candle
    function setupNextCandle() {
        completionMessage.classList.add('hidden');
        
        // Find next uncompleted candle
        const nextIndex = findNextUncompletedCandle();
        
        if (nextIndex !== -1) {
            selectCandle(nextIndex);
            timerContainer.classList.remove('hidden');
        } else {
            // All candles completed
            timerContainer.classList.add('hidden');
            alert('Tebrikler! Tüm mumları tamamladınız!');
        }
    }

    // Find next uncompleted candle
    function findNextUncompletedCandle() {
        for (let i = 0; i < candles.length; i++) {
            if (!candlesGrid.children[i].classList.contains('completed')) {
                return i;
            }
        }
        return -1;
    }

    // Update completed hours display
    function updateCompletedHours() {
        completedHoursSpan.textContent = completedHours.toFixed(1);
    }
});