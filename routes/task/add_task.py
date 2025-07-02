from flask import jsonify, request
from flask_login import current_user, login_required
from datetime import datetime
import re

def add_task(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]
    List =  database["tables"]["List"]

    @app.route('/api/user/addTask', methods=['POST'])
    @login_required
    def addtask():
        try:
            data = request.get_json()
            user_id = current_user.user_id
            task_title = data['task_title']
            task_start_date = data['task_start_date']
            task_end_date = data['task_end_date']
            task_background_color = data['task_background_color']
            description = data['description'] or "None"
            subtasks = data['subtasks']
            list_id = data['list_id']
            date_stat = True

            subtasksArray = []

            # Patterns
            title_pattern = re.compile(r'^[\w\s\-]{3,}$')  # Letters, numbers, spaces, dashes, underscores, min 3 chars
            date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')  # YYYY-MM-DD
            color_pattern = re.compile(r'^#[0-9A-Fa-f]{6}$')  # Hex color

            if not title_pattern.match(task_title):
                return jsonify({
                    "error": "Invalid task title. Must be at least 3 characters and contain only letters, numbers, spaces, dashes or underscores."
                }), 400
            
            if not date_pattern.match(task_start_date):
                return jsonify({
                    "error": "Invalid start date format. Use YYYY-MM-DD."
                }), 400
            
            if not date_pattern.match(task_end_date):
                return jsonify({
                    "error": "Invalid end date format. Use YYYY-MM-DD."
                }), 400
            
            if not color_pattern.match(task_background_color):
                return jsonify({
                    "error": "Invalid color format. Use #RRGGBB."
                }), 400

            try:
                start_date = datetime.strptime(task_start_date, "%Y-%m-%d")
                end_date = datetime.strptime(task_end_date, "%Y-%m-%d")

            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

            if start_date > end_date:
                return jsonify({"error": "Start date must be before end date"}), 400
            
            try:

                newTask = Task.query.filter_by(task_title = task_title, user_id = user_id, stat = True, list_id = list_id).first()
                list = List.query.filter_by(list_id = list_id, user_id = user_id, stat = True).first()

                if newTask:
                    return jsonify({
                        "error": "Task already exists on this list"
                    }), 400
                if not list:
                    return jsonify({
                        "error": "List not found"
                    }), 404
            

                if task_title and date_stat and task_background_color: ## Add task to DB
                    task = Task(
                        user_id = user_id,
                        task_title = task_title,
                        task_start_date = task_start_date,
                        task_end_date = task_end_date,
                        task_background_color = task_background_color,
                        description = description,
                        list_id = list_id
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
                        "subtasks": subtasksArray,
                        "list_id": task.list_id
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
                
                return jsonify({'error': 'Missing required fields'}), 400
            except Exception as e:
                db.session.rollback()
                print(e)
                return jsonify({"error": f"An error occurred"}), 500

        except Exception as e:
            print(e)
            return jsonify({"error": f"An error occurred"}), 500