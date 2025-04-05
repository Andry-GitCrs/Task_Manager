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
        task_title = data['task_title']
        task_start_date = data['task_start_date']
        task_end_date = data['task_end_date']
        task_background_color = data['task_background_color']
        description = data['description'] or "None"
        subtasks = data['subtasks']
        date_stat = True

        try:
            start_date = datetime.strptime(task_start_date, "%Y-%m-%d")
            end_date = datetime.strptime(task_end_date, "%Y-%m-%d")

        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        if start_date > end_date:
            return jsonify({"error": "Start date must be before end date"}), 400

        newTask = Task.query.filter_by(task_title = task_title).first()

        if newTask:
            return jsonify({
                "error": "Task already exists"
            }), 400

        if task_title and date_stat and task_background_color:
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

            if len(subtasks) > 0:
                for subtask in subtasks:
                    newSubtask = Subtask(
                        task_id=task.task_id,
                        subtask_title=subtask
                    )
                    db.session.add(newSubtask)
                    db.session.commit()
            
            elif len(subtasks) == 0:
                return jsonify({'message': 'Task added successfully, no subtasks added on this task'}), 201

            return jsonify({'message': 'Task added successfully'}), 201
        
        else:
            return jsonify({'error': 'Missing required fields'}), 400