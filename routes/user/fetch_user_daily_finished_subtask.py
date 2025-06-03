from flask import jsonify
from flask_login import login_required, current_user
from sqlalchemy import func

def fetch_user_daily_finished_subtask(app, database):
    db = database["db"]
    Subtask = database["tables"]["Subtask"]
    Task = database["tables"]["Task"]

    @app.route('/api/user/daily_finished_subtasks')
    @login_required
    def daily_finished_subtasks():
        # Query finished subtasks grouped by date for the current user
        finished_subtasks = db.session.query(
            func.date(Subtask.updated_at).label('date'),
            func.count(Subtask.subtask_id).label('count')
        ).join(Task, Subtask.task_id == Task.task_id) \
         .filter(
             Subtask.finished == True,
             Task.user_id == current_user.user_id
         ) \
         .group_by(func.date(Subtask.updated_at)) \
         .order_by(func.date(Subtask.updated_at)) \
         .all()

        # Prepare result
        result = [
            {"date": row.date.strftime("%Y-%m-%d"), "count": row.count}
            for row in finished_subtasks
        ]

        return jsonify({
            "message": "Daily finished subtasks fetched successfully",
            "data": result
        }), 200
