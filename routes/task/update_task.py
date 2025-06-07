from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def update_task(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]

    @app.route('/api/task/update/<int:task_id>', methods = ['PUT'])
    @login_required
    def update_task(task_id):
        data = request.get_json()
        try:
            task_title = data.get('task_title')
            task_start_date = data['task_start_date']
            task_end_date = data['task_end_date']
            task_background_color = data['task_background_color']
            description = data['description'] or "None"
            list_id = data['list_id']
            user_id = current_user.user_id

            task = db.session.query(Task).filter_by(task_id = task_id).first()

            if not task:
                return jsonify({"error": "Task not found"}), 404
            
            newTask = Task.query.filter(
                Task.task_title == task_title,
                Task.user_id == user_id,
                Task.stat == True,
                Task.task_id != task_id,
                Task.list_id == list_id
            ).first()

            if newTask:
                return jsonify({
                    "error": "Task already exists"
                }), 400
        
            if not task_title or not task_start_date or not task_end_date or not task_background_color:
                return jsonify({"error": "Please fill all required fields"}), 400
            
            try:
                start_date = datetime.strptime(task_start_date, "%Y-%m-%d")
                end_date = datetime.strptime(task_end_date, "%Y-%m-%d")

            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

            if start_date > end_date:
                return jsonify({"error": "Start date must be before end date"}), 400
            
            task.task_title = task_title
            task.task_start_date = task_start_date
            task.task_end_date = task_end_date
            task.task_background_color = task_background_color
            task.description = description
            task.list_id = list_id
            task.updated_at = datetime.utcnow()
            db.session.commit()

            task = {
                "task_id": task.task_id,
                "title": task.task_title,
                "start_date": task.task_start_date,
                "end_date": task.task_end_date,
                "description": task.description,
                "bg_color": task.task_background_color,
                "finished": task.finished
            }
            
            return jsonify({
                "message": "Task updated successfully",
                "data": task
            }), 200
        
        except KeyError:
            return jsonify({
                "error": "Missing required property"
            })