import sys
from flask import Flask, abort, redirect, render_template
from flask_login import login_required, current_user, LoginManager, login_user, logout_user, current_user
import os

## Dir config 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
script_dir = os.path.dirname(os.path.abspath(__file__))

## Dependence module
from routes import addsubtask, auth, checksubtask, deletesubtask, deletetask, deleteuser, edituserrole, fetchtask, fetchusers, findtask, gettodaytasks, getupcomingtasks, login, loginadmin, register, gettasks, addtask, sendemail, suspenduser, deteteTaskPermanentely, updateprofile
from database import pgconnexion

## App config
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.secret_key = "secret-key"

# Login Manager
login_manager = LoginManager()
login_manager.login_view = 'authentication'
login_manager.init_app(app)

# Database Connection
database = pgconnexion.connect(app)
User = database["tables"]["User"]
db = database["db"]

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
login.login(app, database) # Login
register.register(app, database) # Register

## Admin page login route
@app.route('/auth/admin/login')
@login_required
def admin_login_route():
    try:
        admin = current_user.admin
        if admin:
            return render_template('views/admin_login.html')
        abort(404)
    except AttributeError:
        abort(404)

## Admin page logout route
@app.route('/auth/admin/logout')
@login_required
def admin_logout_route():
    admin = current_user.admin
    if admin:
        user = User.query.filter_by(user_id = current_user.user_id).first()
        user.activate()
        db.session.commit()
        logout_user()
        render_template('views/main.html')
    abort(404)

## Admin page login route
@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    try:
        admin = current_user.admin
        stat = current_user.stat
        email = current_user.email
        if admin and stat:
            return render_template('views/admin_dashboard.html', email = email, title = "Dashboard")
        abort(404)
    except AttributeError:
        abort(404)

@app.route('/admin/manage_users')
@login_required
def manage_users():
    admin = current_user.admin
    email = current_user.email
    if admin and current_user.stat:
        return render_template('views/admin/admin_manage_users.html', email = email, title = "Manage users")
    abort(404)

@app.route('/admin/manage_tasks')
@login_required
def manage_tasks():
    admin = current_user.admin
    email = current_user.email
    if admin and current_user.stat:
        return render_template('views/admin/admin_manage_task.html', email = email, title = "Manage tasks")
    abort(404)

## Protected routes
@app.route('/admin/manage_subtasks')
@login_required
def manage_subtasks():
    admin = current_user.admin
    email = current_user.email
    if admin and current_user.stat:
        return render_template('views/admin/admin_manage_subtask.html', email = email, title = "Manage subtasks")
    abort(404)

@app.route('/auth/logout') # Logout
@login_required
def logout():
    if current_user.admin:
        user = User.query.filter_by(user_id = current_user.user_id).first()
        user.activate()
        db.session.commit()
    logout_user()
    return redirect('/auth')

@app.route('/dashboard') # Dashboard
@login_required
def dashboard():
    if current_user.admin:
        current_user.stat = False
    return render_template('views/dashboard.html', message = current_user.email,  email = current_user.email)

@app.route('/dashboard/calendar') # Calendar
@login_required
def calendar():
    return render_template('views/calendar.html', email = current_user.email)

@app.route('/dashboard/today') # Today tasks
@login_required
def today():
    return render_template('views/today.html', email = current_user.email)

@app.route('/dashboard/upcoming') # Upcoming tasks
@login_required
def upcoming():
    return render_template('views/upcoming.html', email = current_user.email)

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

## Today tasks
gettodaytasks.get_today_task(app, database)

## Find task
findtask.findTask(app, database)

## Check subtask
checksubtask.checktask(app, database)

## Get upcoming tasks
getupcomingtasks.get_upcoming_task(app, database)

## Admin action
loginadmin.login_admin(app, database)
loginadmin.verify_admin(app, database)

## Fetch users
fetchusers.fetch_users(app, database)

## Fetch task
fetchtask.fetch_task(app, database)

## Suspend user
suspenduser.suspendUser(app, database)

## Delete user
deleteuser.delete_user(app, database)

## Delete task permanently
deteteTaskPermanentely.deleteTaskPermanentely(app, database)

## Edit user role
edituserrole.edit_user_role(app, database)

## Update user
updateprofile.update_profile(app, database)

## Verify email
sendemail.verifyEmail(app)

## Send email
sendemail.sendEmail(app)

if __name__ == "__main__":
    app.run(debug=True)  
