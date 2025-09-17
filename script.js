// Game state variables
let currentQuestion = {};
let score = 0;
let streak = 0;
let totalQuestions = 0;
let correctAnswers = 0;
let gameTimer;
let questionTimer;
let timeRemaining = 0;
let isGameActive = false;

// Level progression variables
let currentLevel = 1;
let levelPoints = 0;
let levelTarget = 50;
let currentDynamicDifficulty = 'easy';

// Configuration objects
const operations = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
};

const difficultyRanges = {
    easy: [1, 10],
    medium: [1, 50],
    hard: [1, 100],
    expert: [1, 500]
};

// Level progression configuration
const levelProgression = {
    1: { difficulty: 'easy', target: 50, name: 'Beginner' },
    2: { difficulty: 'easy', target: 75, name: 'Getting Started' },
    3: { difficulty: 'medium', target: 100, name: 'Improving' },
    4: { difficulty: 'medium', target: 125, name: 'Good Progress' },
    5: { difficulty: 'medium', target: 150, name: 'Intermediate' },
    6: { difficulty: 'hard', target: 200, name: 'Advanced' },
    7: { difficulty: 'hard', target: 250, name: 'Expert Level' },
    8: { difficulty: 'expert', target: 300, name: 'Master' },
    9: { difficulty: 'expert', target: 400, name: 'Grandmaster' },
    10: { difficulty: 'expert', target: 500, name: 'Legend' }
};

/**
 * Generate a random number between min and max (inclusive)
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get current difficulty based on game mode
 */
function getCurrentDifficulty() {
    const gameMode = document.getElementById('gameMode').value;
    if (gameMode === 'progression') {
        return currentDynamicDifficulty;
    } else {
        return document.getElementById('difficulty').value;
    }
}

/**
 * Generate a math question based on current settings
 */
function generateQuestion() {
    const operation = document.getElementById('operation').value;
    const difficulty = getCurrentDifficulty();
    const [min, max] = difficultyRanges[difficulty];

    if (operation === 'mixed') {
        const ops = ['addition', 'subtraction', 'multiplication', 'division'];
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        return generateSpecificQuestion(randomOp, min, max);
    } else {
        return generateSpecificQuestion(operation, min, max);
    }
}

/**
 * Generate a specific type of math question
 */
function generateSpecificQuestion(operation, min, max) {
    let num1, num2, answer, symbol;

    switch (operation) {
        case 'addition':
            num1 = getRandomNumber(min, max);
            num2 = getRandomNumber(min, max);
            answer = num1 + num2;
            symbol = '+';
            break;
            
        case 'subtraction':
            // Ensure positive results
            num1 = getRandomNumber(min + 10, max + 50);
            num2 = getRandomNumber(min, Math.min(num1, max));
            answer = num1 - num2;
            symbol = '-';
            break;
            
        case 'multiplication':
            // Keep numbers reasonable for mental math
            const multMax = operation === 'easy' ? 10 : Math.min(20, max);
            num1 = getRandomNumber(min, multMax);
            num2 = getRandomNumber(min, multMax);
            answer = num1 * num2;
            symbol = '×';
            break;
            
        case 'division':
            // Ensure whole number results
            num2 = getRandomNumber(2, Math.min(12, max));
            answer = getRandomNumber(min, Math.floor(max / num2));
            num1 = num2 * answer;
            symbol = '÷';
            break;
    }

    return { num1, num2, answer, symbol };
}

/**
 * Display the current question on screen
 */
function displayQuestion() {
    const questionEl = document.getElementById('question');
    questionEl.textContent = `${currentQuestion.num1} ${currentQuestion.symbol} ${currentQuestion.num2} = ?`;
    
    // Reset input and feedback
    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('answerInput').focus();
}

/**
 * Start a new game session
 */
function startGame() {
    // Initialize game state
    isGameActive = true;
    score = 0;
    streak = 0;
    totalQuestions = 0;
    correctAnswers = 0;
    timeRemaining = parseInt(document.getElementById('timeLimit').value);
    
    // Initialize level progression
    const gameMode = document.getElementById('gameMode').value;
    if (gameMode === 'progression') {
        currentLevel = 1;
        levelPoints = 0;
        levelTarget = levelProgression[currentLevel].target;
        currentDynamicDifficulty = levelProgression[currentLevel].difficulty;
        document.getElementById('levelInfo').style.display = 'block';
        updateLevelDisplay();
    } else {
        document.getElementById('levelInfo').style.display = 'none';
    }

    // Update UI controls
    document.getElementById('startBtn').disabled = true;
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('answerInput').disabled = false;
    document.getElementById('nextBtn').style.display = 'none';

    // Disable settings during game
    document.getElementById('operation').disabled = true;
    document.getElementById('gameMode').disabled = true;
    document.getElementById('difficulty').disabled = true;
    document.getElementById('timeLimit').disabled = true;

    // Start the game
    updateStats();
    nextQuestion();
    startTimer();
}

/**
 * Start the game timer
 */
function startTimer() {
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateStats();
        
        // Update progress bar
        const progress = (timeRemaining / parseInt(document.getElementById('timeLimit').value)) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        // End game when time runs out
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

/**
 * Generate and display the next question
 */
function nextQuestion() {
    currentQuestion = generateQuestion();
    displayQuestion();
    
    // Reset UI for new question
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('answerInput').disabled = false;
}

/**
 * Process the user's answer
 */
function submitAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    const feedbackEl = document.getElementById('feedback');
    
    totalQuestions++;

    if (userAnswer === currentQuestion.answer) {
        // Correct answer
        correctAnswers++;
        const basePoints = 10;
        const streakBonus = streak + 1;
        const pointsEarned = basePoints * streakBonus;
        
        score += pointsEarned;
        streak++;
        
        // Update level progression
        const gameMode = document.getElementById('gameMode').value;
        if (gameMode === 'progression') {
            levelPoints += pointsEarned;
            checkLevelUp();
        }
        
        feedbackEl.textContent = '✓ Correct!';
        feedbackEl.className = 'feedback correct';
        updateStats();
        
        // Faster auto-advance - reduced from 800ms to 300ms
        setTimeout(() => {
            if (isGameActive) {
                nextQuestion();
            }
        }, 300);
    } else {
        // Wrong answer
        streak = 0;
        feedbackEl.textContent = `✗ Wrong! Answer: ${currentQuestion.answer}`;
        feedbackEl.className = 'feedback incorrect';
        
        // Show manual next button for wrong answers
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('answerInput').disabled = true;
        updateStats();
    }
}

/**
 * End the current game session
 */
function endGame() {
    isGameActive = false;
    clearInterval(gameTimer);
    
    // Reset UI controls
    document.getElementById('startBtn').disabled = false;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('answerInput').disabled = true;
    document.getElementById('levelInfo').style.display = 'none';

    // Re-enable settings
    document.getElementById('operation').disabled = false;
    document.getElementById('gameMode').disabled = false;
    document.getElementById('difficulty').disabled = false;
    document.getElementById('timeLimit').disabled = false;

    // Show final results
    const finalScore = score;
    const finalAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const gameMode = document.getElementById('gameMode').value;
    
    let resultsText = `🎯 Game Over!<br><small style="font-size: 1.5rem;">Final Score: ${finalScore}<br>Accuracy: ${finalAccuracy}%`;
    
    if (gameMode === 'progression') {
        const levelName = levelProgression[currentLevel]?.name || 'Master';
        resultsText += `<br>Reached Level: ${currentLevel} (${levelName})`;
    }
    
    resultsText += '</small>';
    
    document.getElementById('question').innerHTML = resultsText;
    document.getElementById('feedback').textContent = 'Click Start to play again!';
    document.getElementById('feedback').className = 'feedback';
}

/**
 * Update the statistics display
 */
function updateStats() {
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('accuracy').textContent = 
        totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) + '%' : '0%';
    document.getElementById('timeLeft').textContent = timeRemaining;
}

/**
 * Check if player should level up
 */
function checkLevelUp() {
    if (levelPoints >= levelTarget && levelProgression[currentLevel + 1]) {
        // Level up!
        levelPoints -= levelTarget; // Carry over excess points
        currentLevel++;
        
        // Update difficulty and target for new level
        currentDynamicDifficulty = levelProgression[currentLevel].difficulty;
        levelTarget = levelProgression[currentLevel].target;
        
        // Show level up animation
        const levelInfo = document.getElementById('levelInfo');
        levelInfo.classList.add('level-up');
        setTimeout(() => levelInfo.classList.remove('level-up'), 600);
        
        // Show level up message
        const feedbackEl = document.getElementById('feedback');
        const originalText = feedbackEl.textContent;
        feedbackEl.textContent = `🎊 LEVEL UP! Welcome to Level ${currentLevel}! 🎊`;
        feedbackEl.className = 'feedback correct';
        
        // Restore original message after showing level up
        setTimeout(() => {
            feedbackEl.textContent = originalText;
        }, 1500);
    }
    
    updateLevelDisplay();
}

/**
 * Update level progression display
 */
function updateLevelDisplay() {
    const gameMode = document.getElementById('gameMode').value;
    if (gameMode !== 'progression') return;
    
    document.getElementById('currentLevel').textContent = currentLevel;
    document.getElementById('levelPoints').textContent = levelPoints;
    document.getElementById('levelTarget').textContent = levelTarget;
    
    // Update progress bar
    const progress = (levelPoints / levelTarget) * 100;
    document.getElementById('levelFill').style.width = Math.min(progress, 100) + '%';
}

// Event Listeners

// Handle game mode change
document.getElementById('gameMode').addEventListener('change', function() {
    const gameMode = this.value;
    const difficultyGroup = document.getElementById('difficultyGroup');
    
    if (gameMode === 'progression') {
        difficultyGroup.style.display = 'none';
    } else {
        difficultyGroup.style.display = 'flex';
    }
});

// Handle Enter key press for answer submission
document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('submitBtn').disabled) {
        submitAnswer();
    }
});

// Auto-check answer as user types (for correct answers)
document.getElementById('answerInput').addEventListener('input', function(e) {
    const userAnswer = parseInt(e.target.value);
    if (userAnswer === currentQuestion.answer && e.target.value !== '' && isGameActive) {
        submitAnswer();
    }
});

// Prevent form submission on Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    console.log('Mental Math Trainer loaded successfully!');
});