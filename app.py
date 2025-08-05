#backend functions --> user acc, high scores, analytics

"""
To run this Python backend:

1. Install Flask:
   pip install flask

2. Run the server:
   python app.py

3. The server will start on http://localhost:5000

Features this backend provides:
- Question generation API
- Score storage in SQLite database  
- High score leaderboard
- Statistics tracking
- RESTful API endpoints

You can extend this to add:
- User authentication
- Personal progress tracking
- Different game modes
- Multiplayer competitions
- Advanced analytics
"""

from flask import Flask, render_template, request, jsonify
import random
import json
from datetime import datetime
import sqlite3

app = Flask(__name__)

class MathQuestionGenerator:
    """Handles generation of math problems"""
    
    def __init__(self):
        self.difficulty_ranges = {
            'easy': (1, 10),
            'medium': (1, 50),
            'hard': (1, 100),
            'expert': (1, 500)
        }
    
    def generate_question(self, operation, difficulty):
        """Generate a math question based on operation and difficulty"""
        min_val, max_val = self.difficulty_ranges[difficulty]
        
        if operation == 'addition':
            return self._generate_addition(min_val, max_val)
        elif operation == 'subtraction':
            return self._generate_subtraction(min_val, max_val)
        elif operation == 'multiplication':
            return self._generate_multiplication(min_val, max_val)
        elif operation == 'division':
            return self._generate_division(min_val, max_val)
        elif operation == 'mixed':
            ops = ['addition', 'subtraction', 'multiplication', 'division']
            random_op = random.choice(ops)
            return self.generate_question(random_op, difficulty)
    
    def _generate_addition(self, min_val, max_val):
        num1 = random.randint(min_val, max_val)
        num2 = random.randint(min_val, max_val)
        return {
            'num1': num1,
            'num2': num2,
            'operator': '+',
            'answer': num1 + num2
        }
    
    def _generate_subtraction(self, min_val, max_val):
        num1 = random.randint(min_val + 10, max_val + 50)
        num2 = random.randint(min_val, min(num1, max_val))
        return {
            'num1': num1,
            'num2': num2,
            'operator': '-',
            'answer': num1 - num2
        }
    
    def _generate_multiplication(self, min_val, max_val):
        mult_max = min(20, max_val)
        num1 = random.randint(min_val, mult_max)
        num2 = random.randint(min_val, mult_max)
        return {
            'num1': num1,
            'num2': num2,
            'operator': '×',
            'answer': num1 * num2
        }
    
    def _generate_division(self, min_val, max_val):
        num2 = random.randint(2, min(12, max_val))
        answer = random.randint(min_val, max_val // num2)
        num1 = num2 * answer
        return {
            'num1': num1,
            'num2': num2,
            'operator': '÷',
            'answer': answer
        }

class ScoreManager:
    """Handles score tracking and statistics"""
    
    def __init__(self):
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for storing scores"""
        conn = sqlite3.connect('math_scores.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name TEXT,
                score INTEGER,
                accuracy REAL,
                operation TEXT,
                difficulty TEXT,
                time_limit INTEGER,
                date_played TEXT
            )
        ''')
        conn.commit()
        conn.close()
    
    def save_score(self, score_data):
        """Save a game score to the database"""
        conn = sqlite3.connect('math_scores.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scores (player_name, score, accuracy, operation, difficulty, time_limit, date_played)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            score_data.get('player_name', 'Anonymous'),
            score_data['score'],
            score_data['accuracy'],
            score_data['operation'],
            score_data['difficulty'],
            score_data['time_limit'],
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
    
    def get_high_scores(self, limit=10):
        """Get top high scores"""
        conn = sqlite3.connect('math_scores.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT player_name, score, accuracy, operation, difficulty, date_played
            FROM scores
            ORDER BY score DESC
            LIMIT ?
        ''', (limit,))
        
        scores = cursor.fetchall()
        conn.close()
        
        return [
            {
                'player_name': row[0],
                'score': row[1],
                'accuracy': row[2],
                'operation': row[3],
                'difficulty': row[4],
                'date_played': row[5]
            }
            for row in scores
        ]

# Initialize components
question_generator = MathQuestionGenerator()
score_manager = ScoreManager()

# Routes
@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/api/question')
def get_question():
    """API endpoint to get a new math question"""
    operation = request.args.get('operation', 'addition')
    difficulty = request.args.get('difficulty', 'easy')
    
    question = question_generator.generate_question(operation, difficulty)
    return jsonify(question)

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    """API endpoint to submit a game score"""
    score_data = request.json
    score_manager.save_score(score_data)
    return jsonify({'status': 'success'})

@app.route('/api/high-scores')
def get_high_scores():
    """API endpoint to get high scores"""
    limit = request.args.get('limit', 10, type=int)
    scores = score_manager.get_high_scores(limit)
    return jsonify(scores)

@app.route('/api/stats')
def get_stats():
    """API endpoint to get player statistics"""
    # This could be expanded to show personal stats, global averages, etc.
    return jsonify({
        'total_games': 0,
        'average_score': 0,
        'best_streak': 0
    })

if __name__ == '__main__':
    print("🧮 Mental Math Trainer Backend Starting...")
    print("📊 Database initialized")
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True)