from flask import Flask, jsonify, redirect, render_template, request
from flask_login import login_required, current_user
from routes import auth, login, register
from database import pgconnexion
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
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
User = database["tables"]["User"] 

# Flask-Login User Loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
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

## Auth API
login.login(app, database)
@app.route('/auth/logout')
@login_required
def logout():
    logout_user()
    return redirect('/auth')

register.register(app, database)
# ## End Auth API

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('views/dashboard.html', message = current_user.email)

@app.route('/dashboard/calendar')
def calendar():
    return render_template('views/calendar.html')

@app.route('/dashboard/today')
def today():
    return render_template('views/today.html')

@app.route('/dashboard/upcoming')
def upcoming():
    return render_template('views/upcoming.html')