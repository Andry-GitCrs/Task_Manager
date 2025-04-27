from flask import jsonify, request
from flask_login import login_required

def deleteTaskPermanentely(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]

    @app.route('/api/user/deleteTaskPermanentely/<int:task_id>', methods=['DELETE'])
    @login_required
    def delete_task_permanentely(task_id):

        task = Task.query.filter_by(task_id = task_id).first()

        if task:
            db.session.delete(task)
            db.session.commit()
            return jsonify({"message": "Task deleted permanently"}), 200

        return jsonify({"error": "Task not found"}), 404