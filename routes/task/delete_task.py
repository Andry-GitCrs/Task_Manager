from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def delete_task(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]

    @app.route('/api/user/deleteTask', methods=['DELETE'])
    @login_required
    def task_delete():
        data = request.get_json()
        user_id = current_user.user_id
        task_id = data['task_id']

        task = Task.query.filter_by(task_id = task_id, user_id = user_id, stat = True).first()

        if task:                
            task.updated_at = datetime.utcnow()
            task.deactivate()
            db.session.commit()
            return jsonify({"message": "Task deleted successfully"}), 200
        
        return jsonify({"error": "Task not found"}), 404