from flask import jsonify, request
from flask_login import current_user, login_required
from datetime import datetime

def add_task(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/addTask', methods=['POST'])
    @login_required
    def addtask():
        data = request.get_json()
        user_id = current_user.user_id
        task_title = data['task_title'].strip()
        task_start_date = data['task_start_date']
        task_end_date = data['task_end_date']
        task_background_color = data['task_background_color']
        description = data['description'] or "None"
        subtasks = data['subtasks']
        date_stat = True

        subtasksArray = []

        try:
            start_date = datetime.strptime(task_start_date, "%Y-%m-%d")
            end_date = datetime.strptime(task_end_date, "%Y-%m-%d")

        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        if start_date > end_date:
            return jsonify({"error": "Start date must be before end date"}), 400

        newTask = Task.query.filter_by(task_title = task_title, user_id = user_id, stat = True).first()

        if newTask:
            return jsonify({
                "error": "Task already exists"
            }), 400

        if task_title and date_stat and task_background_color: ## Add task to DB
            task = Task(
                user_id=user_id,
                task_title=task_title,
                task_start_date=task_start_date,
                task_end_date=task_end_date,
                task_background_color=task_background_color,
                description=description
            )
            db.session.add(task)
            db.session.commit()

            taskData = {
                "task_id": task.task_id,
                "title": task.task_title,
                "start_date": task.task_start_date,
                "end_date": task.task_end_date,
                "description": task.description,
                "bg_color": task.task_background_color,
                "subtasks": subtasksArray
            }

            if len(subtasks) > 0:
                for subtask in subtasks:
                    newSubtask = Subtask(
                        task_id=task.task_id,
                        subtask_title=subtask
                    )
                    
                    db.session.add(newSubtask)
                    db.session.commit()
                    subtasksArray.append({
                        "subtask_id": newSubtask.subtask_id,
                        "subtask_title": newSubtask.subtask_title
                    })
            
            elif len(subtasks) == 0:
                return jsonify({
                    'message': 'Task added successfully, no subtasks added on this task',
                    'data': taskData
                }), 201

            return jsonify({
                'message': 'Task added successfully',
                'data': taskData
            }), 201
        
        else:
            return jsonify({'error': 'Missing required fields'}), 400