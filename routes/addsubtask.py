from flask import jsonify, request
from flask_login import current_user, login_required
import sqlalchemy

def add_subtask(app, database):
    db = database["db"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/addSubTask', methods=['POST'])
    @login_required
    def addsubtask():
        data = request.get_json()
        user_id = current_user.user_id
        task_id = data['task_id']
        subtask_title = data['subtask_title']

        newSubTask = Subtask.query.filter_by(subtask_title = subtask_title, task_id = task_id).first()

        if newSubTask:
            return jsonify({
                "error": "SubTask already exists on this task"
            }), 400

        if subtask_title and task_id:
            try:
                subtask = Subtask(
                    task_id=task_id,
                    subtask_title=subtask_title
                )
                db.session.add(subtask)
                db.session.commit()
                
            except sqlalchemy.exc.IntegrityError:
                db.session.rollback()
                return jsonify({'error': f'Task {task_id} not found'}), 400

            return jsonify({'message': 'Subtask added successfully'}), 201
        
        else:
            return jsonify({'error': 'Missing required fields'}), 400