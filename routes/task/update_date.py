from datetime import datetime
from flask import jsonify, request

def update_date(app, database):
  db = database['db']
  Task = database['tables']['Task']
  @app.route('/api/user/task/updateDate', methods=['PUT'])
  def date_update():
    try:
      task_id = request.args.get('task_id')
      data = request.get_json()
      start_date = data['start_date']
      end_date = data['end_date']
      task = db.session.query(Task).filter_by(task_id = task_id).first()

      if task:
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        if start_date > end_date:
            return jsonify({"error": "Start date must be before end date"}), 400
        
        task.task_start_date = start_date
        task.task_end_date = end_date
        task.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
          "message": "Task updated successfully"
        }), 200

      return jsonify({
        "error": "Task not found"
      }), 404
    except Exception as e:
      print(str(e))
      return jsonify({
        "error": str(e)
      }), 500