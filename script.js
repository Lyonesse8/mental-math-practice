let currentQuestion = {};
let score = 0;
let streak = 0;
let totalQuestions = 0;
let correctAnswers = 0;
let gameTimer;
let questionTimer;
let timeRemaining = 0;
let isGameActive = false;

const operations = {
    addition: '+',
    subtraction: '-',
    multiplication: 'x',
    division: '÷'
};

const difficultyRanges = {
    easy: [1, 10],
    medium: [1, 50],
    hard: [1, 100],
    expert: [1, 1000]
};

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const operation = document.getElementById('operation').value;
    const difficulty = document.getElementById('difficulty').value;
    const [min, max] = difficultyRanges[difficulty];

    if(operation == 'mixed') {
        const ops = ['addition', 'subtraction', 'multiplication', 'division'];
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        return generateSpecificQuestion(randomOp, min, max);
    } else {
        return generateSpecificQuestion(operation, min, max);
    }
}

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
            num1 = getRandomNumber(min + 10, max + 50);
            num2 = getRandomNumber(min, Math.min(num1, max));
            answer = num1 - num2;
            symbol = '-';
            break;
        case 'multiplication':
            const multMax = operation == 'easy' ? 10 : Math.min(20, max);
            num1 = getRandomNumber(min, multMax);
            num2 = getRandomNumber(min, multMax);
            answer = num1 * num2;
            symbol = 'x';
            break;
        case 'addition':
            num2 = getRandomNumber(2, Math.min(12, max));
            answer = getRandomNumber(min, Math.floor(max / num2));
            num1 = num2 * answer;
            symbol = '÷';
            break;
    }

    return { num1, num2, answer, symbol};
}

function displayQuestion() {
    const questionEl = document.getElementById('question');
    questionEl.textContent = `${currentQuestion.num1} ${currentQuestion.symbol} ${currentQuestion.num2} = ?`;

    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('answerInput').focus();
}

function startGame() {
    isGameActive = true;
    score = 0;
    streak = 0;
    totalQuestions = 0;
    correctAnswers = 0;
    timeRemaining = parseInt(document.getElementById('timeLimit').value);

    document.getElementById('startBtn').disabled = true;
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('answerInput').disabled = false;
    document.getElementById('nextBtn').style.display = 'none';

    document.getElementById('operation').disabled = true;
    document.getElementById('difficulty').disabled = true;
    document.getElementById('timeLimit').disabled = true;

    updateStats();
    nextQuestion();
    startTimer();
}

function startTimer() {
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateStats();

        const progress = (timeRemaining / parseInt(document.getElementById('timeLimit').value)) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        if (timeRemaining <= 0){
            endGame();
        }
    }, 1000);
}

function nextQuestion() {
    currentQuestion = generateQuestion();
    displayQuestion();
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('answerInput').disabled = false;
}

function submitAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    const feedbackEl = document.getElementById('feedback');

    totalQuestions++;

    if (userAnswer == currentQuestion.answer) {
        correctAnswers++;
        score += 10 * (streak + 1);
        streak++;
        feedbackEl.textContent = 'Correct!';
        feedbackEl.className = 'feedback correct';
        updateStats();

        setTimeout(() => {
            if (isGameActive) {
                nextQuestion();
            }
        }, 800);
    } else {
        streak = 0;
        feedbackEl.textContent = `Wrong! Answer: ${currentQuestion.answer}`;
        feedbackEl.className = 'feedback incorrect';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('answerInput').disabled = true;
        updateStats();
    }
}

function endGame() {
    isGameActive = false;
    clearInterval(gameTimer);
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('answerInput').disabled = true;

    // Re-enable settings
    document.getElementById('operation').disabled = false;
    document.getElementById('difficulty').disabled = false;
    document.getElementById('timeLimit').disabled = false;

    const finalScore = score;
    const finalAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    document.getElementById('question').innerHTML = 
        `🎯 Game Over!<br><small style="font-size: 1.5rem;">Final Score: ${finalScore}<br>Accuracy: ${finalAccuracy}%</small>`;
    document.getElementById('feedback').textContent = 'Click Start to play again!';
    document.getElementById('feedback').className = 'feedback';
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('accuracy').textContent = 
        totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) + '%' : '0%';
    document.getElementById('timeLeft').textContent = timeRemaining;
}

// Event Listeners

// Allow Enter key to submit answer or check answer on input
document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('submitBtn').disabled) {
        submitAnswer();
    }
});

// Auto-check answer as user types
document.getElementById('answerInput').addEventListener('input', function(e) {
    const userAnswer = parseInt(e.target.value);
    if (userAnswer === currentQuestion.answer && e.target.value !== '' && isGameActive) {
        submitAnswer();
    }
});

// Prevent form submission on Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Initialize stats display when page loads
updateStats();