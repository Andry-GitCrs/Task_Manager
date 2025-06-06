from flask import jsonify
from flask_login import login_required, current_user

def get_tasks(app, database):
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]
    List =  database["tables"]["List"]
    db = database["db"]

    @app.route('/api/user/getTask', methods=['GET'])
    @login_required
    def get_task():
        tasks = []
        user_id = current_user.user_id
        
        try:         

            results = db.session.query(
                Task.task_id,
                Task.user_id,
                Task.task_title,
                Task.task_start_date,
                Task.task_end_date,
                Task.task_background_color,
                Task.description,
                Task.list_id
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
                        "list_id": result.list_id,
                        "subtasks": subtasksArray
                    }
                    tasks.append(task)

                return jsonify({
                    "message": f"Task fetched successfully",
                    "user_id": result.user_id,
                    "data": tasks
                }), 200
            
            return jsonify({
                    "error": f"You don't have any task yet",
                    "user_id": user_id,
                    "data": tasks
                }), 404
        except Exception as e:
            print(str(e))
            return jsonify({
                'error': 'An error occured while fetching the task'
            }), 500