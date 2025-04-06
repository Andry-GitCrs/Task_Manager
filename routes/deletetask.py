from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def deleteTask(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/deleteTask', methods=['DELETE'])
    @login_required
    def delete_task():
        data = request.get_json()
        user_id = current_user.user_id
        task_id = data['task_id']

        task = Task.query.filter_by(task_id = task_id, user_id = user_id, stat = True).first()
        subtasks = Subtask.query.filter_by(task_id = task_id, stat = True).all()

        if task:
            if subtasks:
                for subtask in subtasks:
                    subtask.updated_at = datetime.utcnow()
                    subtask.deactivate()
                
            task.updated_at = datetime.utcnow()
            task.deactivate()
            db.session.commit()
            return jsonify({"message": "Task deleted successfully"}), 200
        
        else:
            return jsonify({"error": "Task not found"}), 404