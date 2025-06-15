from flask import abort, jsonify
from flask_login import current_user, login_required
from sqlalchemy import func, desc

def most_active_user(app, database):
    User = database['tables']['User']
    Task = database['tables']['Task']
    Subtask = database['tables']['Subtask']

    @app.route('/api/user/mostActiveUser', methods=['GET'])
    @login_required
    def most_active_user_route():
        if not current_user.admin or not current_user.stat:
            abort(403)

        results = (
            database['db'].session.query(
                User.user_id.label("user_id"),
                User.email,
                func.count(Subtask.subtask_id).label("finished_subtasks_count")
            )
            .join(Task, Task.user_id == User.user_id)
            .join(Subtask, Subtask.task_id == Task.task_id)
            .filter(Subtask.finished == True)
            .group_by(User.user_id, User.email)
            .order_by(desc("finished_subtasks_count"))
            .limit(10)
            .all()
        )

        users_data = [
            {
                "user_id": user.user_id,
                "email": user.email,
                "finished_subtasks_count": user.finished_subtasks_count
            }
            for user in results
        ]

        return jsonify({
            "message": "Top 10 most active users retrieved",
            "data": users_data
        }), 200
