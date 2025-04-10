from flask import jsonify, abort
from flask_login import login_required, current_user
from flask_login import current_user
from sqlalchemy import func

def fetch_task(app, database):
    db = database["db"]
    User = database["tables"]["User"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/admin/api/fetchTask', methods = ['GET'])
    @login_required
    def fetch_task():
        admin = current_user.admin
        data = []

        if admin and current_user.stat:
            results = db.session.query(
                Task.task_id,
                Task.task_title,
                Task.stat,
                Task.created_at,
                Task.updated_at,
                Task.finished,
                Task.user_id
            ).all()

            for result in results:
                subtask_nbr = db.session.query(Subtask.subtask_id).filter_by(task_id = result.task_id).count()
                owner = db.session.query(User.email).filter_by(user_id = result.user_id).first()
                data.append({
                    "task_id": result.task_id,
                    "task_title": result.task_title,
                    "stat": result.stat,
                    "created_at": result.created_at,
                    "updated_at": result.updated_at,
                    "finished": result.finished,
                    "subtask_nbr": subtask_nbr,
                    "owner": owner.email
                })

            if results:
                return jsonify({
                    "message": f"Task fetched successfully",
                    "data": data
                })
        
            return jsonify({
                    "message": f"There are no tasks",
                    "data": data
                }), 404

        abort(404)