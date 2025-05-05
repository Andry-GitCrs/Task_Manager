import sys
import os
from flask import Flask, abort, redirect, render_template
from flask_login import login_required, current_user, LoginManager, login_user, logout_user, current_user
from sqlalchemy import func
from datetime import datetime, date
from flask_socketio import SocketIO
## Dir config 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
script_dir = os.path.dirname(os.path.abspath(__file__))

## Dependence module
from routes import addsubtask, auth, checksubtask, deletesubtask, deletetask, deleteuser, edituserrole, exportcsv, fetchtask, fetchusers, findtask, getNotification, getTaskByDate, gettodaytasks, getupcomingtasks, login, loginadmin, markNotification, register, gettasks, addtask, sendemail, suspenduser, deteteTaskPermanentely, updateprofile, exportpdf, adduser, updatesubtask, updatetask, sendNotification, users_statistics
from database import pgconnexion

## App config
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.secret_key = "secret-key"

# Login Manager
login_manager = LoginManager()
login_manager.login_view = 'authentication'
login_manager.init_app(app)

# Initialize SocketIO
socketio = SocketIO(app)

# Database Connection
database = pgconnexion.connect(app)
User = database["tables"]["User"]
Task = database['tables']['Task']
db = database["db"]

## Helper
def getTaskNbr():
    today = date.today()
    today_task_nbr = Task.query.filter(Task.user_id == current_user.user_id, func.date(Task.task_end_date) == today, Task.stat == True).count()
    task_nbr = db.session.query(Task).filter_by(user_id = current_user.user_id, stat = True).count()

    return {
        "today_task": today_task_nbr,
        "task_nbr": task_nbr
    }

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

@app.route('/login')
def login_page():
    return render_template('views/login.html')

## Auth route
auth.auth(app)
login.login(app, database) # Login
register.register(app, database) # Register

# Private User Routes
@app.route('/auth/logout') # Logout
@login_required
def logout():
    if current_user.admin:
        user = User.query.filter_by(user_id = current_user.user_id).first()
        user.activate()
        db.session.commit()
    logout_user()
    return redirect('/')

@app.route('/dashboard') # Dashboard
@login_required
def dashboard():
    if current_user.admin:
        current_user.stat = False

    return render_template('views/users/dashboard.html', email = current_user.email, task_nbr = getTaskNbr()["task_nbr"], today_task_nbr = getTaskNbr()["today_task"])

@app.route('/dashboard/calendar') # Calendar
@login_required
def calendar():

    return render_template('views/users/calendar.html', email = current_user.email, task_nbr = getTaskNbr()["task_nbr"], today_task_nbr = getTaskNbr()["today_task"])

@app.route('/dashboard/today') # Today tasks
@login_required
def today():
    
    return render_template('views/users/today.html', email = current_user.email, task_nbr = getTaskNbr()["task_nbr"], today_task_nbr = getTaskNbr()["today_task"])

@app.route('/dashboard/upcoming') # Upcoming tasks
@login_required
def upcoming():
    
    return render_template('views/users/upcoming.html', email = current_user.email, task_nbr = getTaskNbr()["task_nbr"], today_task_nbr = getTaskNbr()["today_task"])


@app.route('/dashboard/profile') # Upcoming tasks
@login_required
def profile():

    return render_template('views/users/profile.html', email = current_user.email, task_nbr = getTaskNbr()["task_nbr"], today_task_nbr = getTaskNbr()["today_task"])

# Admin Routes
@app.route('/auth/admin/login')
@login_required
def admin_login_route():
    try:
        admin = current_user.admin
        if admin:
            return render_template('views/admin/admin_login.html')
        abort(404)
    except AttributeError:
        abort(404)

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    try:
        admin = current_user.admin
        stat = current_user.stat
        email = current_user.email
        if admin and stat:
            return render_template('views/admin/admin_dashboard.html', email = email, title = "Dashboard")
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

@app.route('/admin/manage_subtasks')
@login_required
def manage_subtasks():
    admin = current_user.admin
    email = current_user.email
    if admin and current_user.stat:
        return render_template('views/admin/admin_manage_subtask.html', email = email, title = "Manage subtasks")
    abort(404)

@app.route('/admin/user_statistics')
@login_required
def admin_user_statistics():
    if not current_user.admin or not current_user.stat:
        abort(403)
    return render_template('views/admin/admin_user_statistics.html', email = current_user.email, title = "Users statistics")

## API

## Get notification
getNotification.get_notifications(app, database)

## Mark notification
markNotification.mark_notification(app, database)

## Get task
gettasks.get_tasks(app, database)

## Get task by date
getTaskByDate.getTaskByDate(app, database)

## Add new task
addtask.add_task(app, database)

## Update task
updatetask.update_task(app, database)

## Add subtask
addsubtask.add_subtask(app, database)

## Update subtask
updatesubtask.update_subtask(app, database)

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

adduser.adduser(app, database)

## Send notification
sendNotification.send_notification(app, database, socketio)

## Data exportation
exportcsv.export_to_csv(app, database)
exportpdf.export_to_pdf(app, database)

## User statistics
users_statistics.users_statistics(app, database)

if __name__ == "__main__":
    socketio.run(app, debug=True)
