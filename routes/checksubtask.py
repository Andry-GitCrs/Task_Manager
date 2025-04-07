
from flask import jsonify
from flask_login import current_user, login_required

def checktask(app, database):
    Subtask = database["tables"]["Subtask"]
    db = database["db"]
    @app.route('/api/user/checkSubTask/<int:subtask_id>', methods=['POST'])
    @login_required
    def check_subtask(subtask_id):

        subtask = Subtask.query.filter_by(subtask_id = subtask_id, stat = True).first()

        if subtask:
            if subtask.finished:
                subtask.uncheck()
            else:
                subtask.check()
                
            db.session.commit()
            
            subtaskData = {
                "subtask_id": subtask.subtask_id,
                "subtask_title": subtask.subtask_title,
                "finished": subtask.finished
            }

            return jsonify({
                "message": "Subtask cheked successfully",
                "data": subtaskData
            })
         
        return jsonify({
            "message": "Subtask not found"
        }) 