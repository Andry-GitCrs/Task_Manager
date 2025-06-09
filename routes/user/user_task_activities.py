from flask import jsonify
from flask_login import login_required, current_user
from flask_login import current_user
from sqlalchemy.orm import joinedload

def fetch_task_profile(app, database):
    db = database["db"]
    List = database["tables"]["List"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/fetchTask', methods = ['GET'])
    @login_required
    def fetch_task_profile():
        user_id = current_user.user_id
        data = []
        lists = db.session.query(List).filter(List.user_id == user_id).all()

        for list in lists:
            task_data = []
            tasks = db.session.query(Task).options(joinedload(Task.subtasks)).filter(
                Task.user_id == user_id, Task.list_id == list.list_id).all()
            for task in tasks:
                subtask_data = [{
                    "subtask_id": s.subtask_id,
                    "subtask_title": s.subtask_title,
                    "created_at": s.created_at,
                    "updated_at": s.updated_at,
                    "stat": s.stat,
                    "finished": s.finished
                } for s in task.subtasks]

                finished_subtask_nbr = sum(1 for s in task.subtasks if s.finished)

                task_data.append({
                    "task_id": task.task_id,
                    "task_title": task.task_title,
                    "stat": task.stat,
                    "finished": task.finished,
                    "subtasks": subtask_data,
                    "finished_subtask_nbr": finished_subtask_nbr,
                    "task_background_color": task.task_background_color,
                    "task_description": task.description,
                    "start_date": task.task_start_date,
                    "end_date": task.task_end_date,
                    "created_at": task.created_at,
                    "updated_at": task.updated_at,
                })

            data.append({
                "list_id": list.list_id,
                "list_name": list.list_name,
                "list_description": list.description,
                "created_at": list.created_at,
                "updated_at": list.updated_at,
                "stat": list.stat,
                "tasks": task_data
            })

        if list:
            return jsonify({
                "message": f"Task data fetched successfully",
                "data": data
            })
    
        return jsonify({
                "message": f"There are no data yet",
                "data": data
            }), 200