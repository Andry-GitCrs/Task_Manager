from flask import Flask, jsonify, redirect, render_template, request
from flask_login import login_required, current_user
from routes import auth, login, register
from database import pgconnexion
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from sqlalchemy.orm import aliased
import os

## App initialization
script_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.secret_key = "super-secret-key"

# Login Manager
login_manager = LoginManager()
login_manager.login_view = 'login_route'
login_manager.init_app(app)

# Database Setup
database = pgconnexion.connect(app)
db = database["db"]
User = database["tables"]["User"] 
Task = database["tables"]["Task"] 
Subtask = database["tables"]["Subtask"]

# Flask-Login User Loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Public Routes
@app.route('/')
def main():
    return render_template('views/main.html')

@app.route('/about')
def about():
    return render_template('views/about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    return render_template('views/contact.html')

auth.auth(app)
## Auth route

## Protected routes
login.login(app, database) # Login
@app.route('/auth/logout') # Logout
@login_required
def logout():
    logout_user()
    return redirect('/auth')

register.register(app, database) # Register

@app.route('/dashboard') # Dashboard
@login_required
def dashboard():
    return render_template('views/dashboard.html', message = current_user.email)

@app.route('/dashboard/calendar') # Calendar
@login_required
def calendar():
    return render_template('views/calendar.html')

@app.route('/dashboard/today') # Today tasks
@login_required
def today():
    return render_template('views/today.html')

@app.route('/dashboard/upcoming') # Upcoming tasks
@login_required
def upcoming():
    return render_template('views/upcoming.html')

@app.route('/api/user/getTask', methods=['GET'])
@login_required
def get_task():
    tasks = []
    user_id = current_user.user_id
    results = db.session.query(
        Task.task_id,
        Task.user_id,
        Task.task_title,
        Task.task_start_date,
        Task.task_end_date,
        Task.task_background_color,
        Task.description
    ).filter(Task.user_id == user_id).all()

    for result in results:
        subtasksArray = []
        task_id = result.task_id
        subtasks = db.session.query(
            Subtask.subtask_id,
            Subtask.subtask_title
        ).filter(Subtask.task_id == task_id).all()

        for subtask in subtasks:
            subtasksArray.append({
                "subtask_id": subtask.subtask_id,
                "subtask_title": subtask.subtask_title
            })

        task = {
            "task_id": result.task_id,
            "title": result.task_title,
            "start_date": result.task_start_date,
            "end_date": result.task_end_date,
            "description": result.description,
            "bg_color": result.task_background_color,
            "subtasks": subtasksArray
        }
        tasks.append(task)

    return jsonify({
        "message": f"Task fetched successfully, user_id = {user_id}",
        "data": tasks
    }), 200