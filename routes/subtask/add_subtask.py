from flask import jsonify, request
from flask_login import login_required
import sqlalchemy
import re

def add_subtask(app, database):
    db = database["db"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/api/user/addSubTask', methods=['POST'])
    @login_required
    def addsubtask():
        data = request.get_json()
        task_id = data['task_id']
        subtask_title = data['subtask_title']

        titleRegex = re.compile(r"^[a-zA-Z0-9 ]+$")
        if not titleRegex.match(subtask_title):
            return jsonify({
                "error": "Subtask title contains invalid characters"
            }), 400

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
                newSubtask = {
                    "subtask_id": subtask.subtask_id,
                    "subtask_title": subtask.subtask_title
                }
                
            except sqlalchemy.exc.IntegrityError:
                db.session.rollback()
                return jsonify({'error': f'Task {task_id} not found'}), 400

            return jsonify({
                'message': 'Subtask added successfully',
                'data': newSubtask
            }), 201
        
        return jsonify({'error': 'Missing required fields'}), 400