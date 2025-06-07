from . import(
  fetch_user_daily_finished_subtask,
  get_notification,
  mark_notification,
  update_profile,
  user_task_activities
)

from flask import render_template
from flask_login import login_required, current_user
from sqlalchemy import func
from datetime import date

def use_user_route(app, database, login_manager):
  User = database["tables"]["User"]
  Task = database['tables']['Task']
  List = database['tables']['List']
  db = database["db"]
  routes = [
    user_task_activities.fetch_task_profile,
    update_profile.update_profile,
    fetch_user_daily_finished_subtask.fetch_user_daily_finished_subtask,
    get_notification.get_notification,
    mark_notification.mark_notification
  ]

  for route in routes:
    route(app, database)

  ## Helper
  def getTaskNbr():
      today = date.today()
      today_task_nbr = Task.query.filter(Task.user_id == current_user.user_id, func.date(Task.task_end_date) == today, Task.stat == True).count()
      task_nbr = db.session.query(Task).filter_by(user_id = current_user.user_id, stat = True).count()
      list_nbr = db.session.query(List).filter_by(user_id = current_user.user_id, stat = True).count()

      return {
          "today_task": today_task_nbr,
          "task_nbr": task_nbr,
          "list_nbr": list_nbr
      }

  # Flask-Login User Loader
  @login_manager.user_loader
  def load_user(user_id):
      return User.query.get(int(user_id))

  # Private User Routes
  @app.route('/dashboard') # Dashboard
  @login_required
  def dashboard():
        if current_user.admin:
            current_user.stat = False
        return render_template('views/users/dashboard.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )

  @app.route('/dashboard/help') # Help
  @login_required
  def help():
        return render_template('views/users/help.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )

  @app.route('/dashboard/calendar') # Calendar
  @login_required
  def calendar():
      return render_template('views/users/calendar.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )
  @app.route('/dashboard/today') # Today tasks
  @login_required
  def today():
      return render_template('views/users/today.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )
  @app.route('/dashboard/upcoming') # Upcoming tasks
  @login_required
  def upcoming():
      return render_template('views/users/upcoming.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )

  @app.route('/dashboard/profile') # Upcoming tasks
  @login_required
  def profile():
      return render_template('views/users/profile.html',
                email = current_user.email,
                task_nbr = getTaskNbr()["task_nbr"],
                today_task_nbr = getTaskNbr()["today_task"],
                list_nbr = getTaskNbr()["list_nbr"]
            )