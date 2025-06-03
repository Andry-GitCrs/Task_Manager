from . import (
    create_user,
    fetch_user,
    fetch_task,
    suspend_user,
    delete_user,
    detete_task_permanently,
    edit_user_role,
    users_statistics,
)

from flask import abort, render_template
from flask_login import login_required, current_user, current_user

def use_admin_route(app, database):
    routes = [
        create_user.create_user,
        fetch_user.fetch_user,
        fetch_task.fetch_task,
        suspend_user.suspend_user,
        delete_user.delete_user,
        detete_task_permanently.delete_task_permanently,
        edit_user_role.edit_user_role,
        users_statistics.users_statistics,
    ]

    for route in routes:
        route(app, database)
    
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
