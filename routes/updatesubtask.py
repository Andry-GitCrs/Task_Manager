from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def update_subtask(app, database):
    db = database["db"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/subtask/update/<int:subtask_id>', methods = ['PUT'])
    @login_required
    def update_subtask(subtask_id):
        data = request.get_json()
        subtask_title = data.get('subtask_title')
        subtask = db.session.query(Subtask).filter_by(subtask_id = subtask_id).first()
        if not subtask:
            return jsonify({"error": "Subtask not found"}), 404
    
        if not subtask_title:
            return jsonify({"error": "Subtask title cannot be empty"}), 400
        
        subtask.subtask_title = subtask_title
        subtask.updated_at = datetime.utcnow()
        db.session.commit()
        subtask = {
            "subtask_id": subtask.subtask_id,
            "subtask_title": subtask.subtask_title,
            "finished": subtask.finished
        }
        
        return jsonify({
            "message": "Subtask updated successfully",
            "data": subtask
        }), 200