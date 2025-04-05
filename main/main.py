from flask import Flask, render_template, request
from routes import auth, login, register
from database import pgconnexion
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')

## Database connection
database = pgconnexion.connect(app)
message = database["message"]

@app.route('/')
def main():
    return render_template('views/main.html', message = message)

## Auth route
auth.auth(app)

## Auth API
login.login(app, database)
register.register(app, database)
# ## End Auth API

## App routes
@app.route('/about')
def about():
    return render_template('views/about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    return render_template('views/contact.html')

@app.route('/dashboard')
def dashboard():
    return render_template('views/dashboard.html')

@app.route('/dashboard/calendar')
def calendar():
    return render_template('views/calendar.html')

@app.route('/dashboard/today')
def today():
    return render_template('views/today.html')

@app.route('/dashboard/upcoming')
def upcoming():
    return render_template('views/upcoming.html')