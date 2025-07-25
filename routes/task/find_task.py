from flask import jsonify
from flask_login import current_user, login_required

def find_task(app, database):
    Task = database["tables"]["Task"]
    @app.route('/api/user/findTask/<title>', methods=['GET'])
    @login_required
    def task_find(title):
        task_title = title

        if not task_title:
            return jsonify({"error": "No task found"}), 400

        tasks = Task.query.filter(
            Task.task_title.ilike(f"%{task_title}%"),  
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
                        "updated_at": sub.updated_at.isoformat()
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
                    "subtasks": subtasks,
                    "list_id": task.list_id
                }
                task_list.append(task_data)
            s = 's'
            if not len(task_list) > 1:
                s = ''
            
            return jsonify({"data": task_list, "message": f"{len(task_list)} result{s}"}), 200

        return jsonify({
            "data": [],
            "message": f"No task found named '{task_title}'",
        }), 404
