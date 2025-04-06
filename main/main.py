import sys
from flask import Flask, jsonify, redirect, render_template, request
from flask_login import login_required, current_user
from flask_login import LoginManager, login_required, logout_user, current_user
import os

## Dir config 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
script_dir = os.path.dirname(os.path.abspath(__file__))

## Dependence module
from routes import addsubtask, auth, deletesubtask, deletetask, login, register, gettasks, addtask
from database import pgconnexion

## App config
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.secret_key = "secret-key"

# Login Manager
login_manager = LoginManager()
login_manager.login_view = 'login_route'
login_manager.init_app(app)

# Database Connection
database = pgconnexion.connect(app)
User = database["tables"]["User"] 

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

## Auth route
auth.auth(app)

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

## API

## Get task
gettasks.get_tasks(app, database)

## Add new task
addtask.add_task(app, database)

## Add subtask
addsubtask.add_subtask(app, database)

## Delete task
deletetask.deleteTask(app, database)

## Delete subtask
deletesubtask.deleteSubTask(app, database)