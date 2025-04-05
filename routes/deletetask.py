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

        task = Task.query.filter_by(task_id = task_id).first()
        subtasks = Subtask.query.filter_by(task_id = task_id).all()

        if task and task.user_id == user_id:
            for subtask in subtasks:
                db.session.delete(subtask)
            db.session.delete(task)
            db.session.commit()
            return jsonify({"message": "Task deleted successfully"}), 200
        
        else:
            return jsonify({"error": "Task not found"}), 404