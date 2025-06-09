from flask import jsonify
from flask_login import login_required
from datetime import datetime

def task_restore(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/restoreTask/<int:task_id>', methods=['PUT'])
    @login_required
    def restore_task(task_id):

        task = Task.query.filter_by(task_id = task_id, stat = False).first()

        if task:
            task.updated_at = datetime.utcnow()
            task.stat = True
            db.session.commit()
            return jsonify({"message": "Task restored successfully"}), 200

        return jsonify({"error": "Task not found"}), 404