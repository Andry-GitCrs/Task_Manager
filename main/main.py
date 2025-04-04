from flask import *
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')

@app.route('/')
def main():
    return render_template('views/main.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        error = "Please fill the banks"
        try:
            email = request.form['email']
            password = request.form['password']
            
            if email and password:
                return redirect('/dashboard')
            
            else:
                return render_template('views/login.html', email = email, password = password, errorLogin = error, d_noneRegister = 'd-none')
            
        except KeyError: ##Register
            new_email = request.form['new_email']
            new_password = request.form['new_password']
            new_confirmation_password = request.form['new_confirmation_password']

            if new_email and new_password and new_confirmation_password :
                return render_template('views/login.html', d_noneRegister = 'd-none')
            
            return render_template('views/login.html', d_noneLogin = 'd-none', errorRegister = error)
    
    return render_template('views/login.html', d_noneRegister = 'd-none')
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