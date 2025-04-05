from flask import jsonify
from flask_login import login_required, current_user
from flask_login import current_user

def get_tasks(app, database):
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]
    db = database["db"]

    @app.route('/api/user/getTask', methods=['GET'])
    @login_required
    def get_task():
        tasks = []
        user_id = current_user.user_id
        results = db.session.query(
            Task.task_id,
            Task.user_id,
            Task.task_title,
            Task.task_start_date,
            Task.task_end_date,
            Task.task_background_color,
            Task.description
        ).filter(Task.user_id == user_id).all()

        for result in results:
            subtasksArray = []
            task_id = result.task_id
            subtasks = db.session.query(
                Subtask.subtask_id,
                Subtask.subtask_title
            ).filter(Subtask.task_id == task_id).all()

            for subtask in subtasks:
                subtasksArray.append({
                    "subtask_id": subtask.subtask_id,
                    "subtask_title": subtask.subtask_title
                })

            task = {
                "task_id": result.task_id,
                "title": result.task_title,
                "start_date": result.task_start_date,
                "end_date": result.task_end_date,
                "description": result.description,
                "bg_color": result.task_background_color,
                "subtasks": subtasksArray
            }
            tasks.append(task)

        return jsonify({
            "message": f"Task fetched successfully",
            "data": tasks
        }), 200