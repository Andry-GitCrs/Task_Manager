from datetime import date
from flask import jsonify
from flask_login import current_user, login_required
from sqlalchemy import func

def get_today_task(app, database):
    Task = database["tables"]["Task"]
    @app.route('/api/user/getTodayTask', methods=['GET'])
    @login_required
    def get_today_tasks():
        user_id = current_user.user_id
        today = date.today()

        tasks = Task.query.filter(
            Task.user_id == user_id,
            func.date(Task.task_end_date) == today,
            Task.stat == True
        ).all()

        task_data_list = []

        for task in tasks:
            subtasks = [
                {
                    "subtask_id": sub.subtask_id,
                    "subtask_title": sub.subtask_title,
                    "finished": sub.finished
                }
                for sub in task.subtasks if sub.stat
            ]

            taskData = {
                "task_id": task.task_id,
                "title": task.task_title,
                "start_date": task.task_start_date,
                "end_date": task.task_end_date,
                "description": task.description,
                "bg_color": task.task_background_color,
                "subtasks": subtasks,
                "list_id": task.list_id
            }

            task_data_list.append(taskData)

        return jsonify({
            "message": "Today's tasks fetched successfully",
            "data": task_data_list
        })
