from flask import jsonify, request
from flask_login import current_user, login_required

def deleteSubTask(app, database):
    db = database["db"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/deleteSubTask', methods=['DELETE'])
    @login_required
    def delete_sub_task():
        data = request.get_json()
        user_id = current_user.user_id
        subtask_id = data['subtask_id']

        subtasks = Subtask.query.filter_by(subtask_id = subtask_id).all()

        if subtasks:
            for subtask in subtasks:
                db.session.delete(subtask)
                db.session.commit()
            return jsonify({"message": f"Subtask deleted successfully by {user_id}"}), 200
        
        return jsonify({"error": "Subtask not found"}), 404