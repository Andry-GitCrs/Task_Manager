from flask import jsonify
from flask_login import login_required, current_user
from flask_login import current_user

def fetch_users(app, database):
    db = database["db"]
    User = database["tables"]["Task"]

    @app.route('/admin/api/fetchUsers', methods=['GET'])
    @login_required
    def fetch_users():
        tasks = []
        user_id = current_user.user_id
        results = db.session.query(
            User.email,
            User.stat,
            User.created_at,
            User.updated_at
        ).filter(Task.user_id == user_id, Task.stat == True).all()

        if results:
            for result in results:
                subtasksArray = []
                task_id = result.task_id
                subtasks = db.session.query(
                    Subtask.subtask_id,
                    Subtask.subtask_title,
                    Subtask.finished
                ).filter(Subtask.task_id == task_id, Subtask.stat == True).all()

                for subtask in subtasks:
                    subtasksArray.append({
                        "subtask_id": subtask.subtask_id,
                        "subtask_title": subtask.subtask_title,
                        "finished": subtask.finished
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
        
        return jsonify({
                "message": f"You don't have any task yet",
                "data": tasks
            }), 404