from flask import jsonify, request
from flask_login import current_user, login_required
from datetime import datetime, date

def getTaskByDate(app, database):
    Task = database["tables"]["Task"]
    @app.route('/api/user/getTaskByDate/<argument>/<int:yyyy>/<int:mm>/<int:dd>', methods=['GET'])
    @login_required
    def get_task_by_date(argument, yyyy, mm, dd):
        try:
            task_date = date(yyyy, mm, dd)
            tasks = None

            if argument == "start":
                tasks = Task.query.filter(
                    Task.task_start_date == task_date, 
                    Task.user_id == current_user.user_id,
                    Task.stat == True
                ).all()
            else:
                argument = "end"
                tasks = Task.query.filter(
                    Task.task_end_date == task_date, 
                    Task.user_id == current_user.user_id,
                    Task.stat == True
                ).all()

            if tasks:
                task_list = []
                for task in tasks:
                    # Build a list of active subtasks for each task
                    subtasks = [
                        {
                            "subtask_id": sub.subtask_id,
                            "title": sub.subtask_title,
                            "created_at": sub.created_at.isoformat(),
                            "updated_at": sub.updated_at.isoformat(),
                            "finished": sub.finished
                        }
                        for sub in task.subtasks if sub.stat
                    ]
                    
                    task_data = {
                        "task_id": task.task_id,
                        "title": task.task_title,
                        "start_date": task.task_start_date.isoformat(),
                        "end_date": task.task_end_date.isoformat(),
                        "description": task.description,
                        "bg_color": task.task_background_color,
                        "subtasks": subtasks
                    }
                    task_list.append(task_data)
                
                return jsonify({
                    "message": f"{len(task_list)} Tasks found that {argument} on",
                    "data": task_list,
                    "date": str(task_date)
                }), 200

            return jsonify({
                "message": f"No task found that {argument} on {task_date}",
                "data": []
            }), 404
        
        except ValueError as e:
            return jsonify({
                "error": e.args
            }), 401