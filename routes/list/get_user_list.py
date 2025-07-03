from flask import jsonify
from flask_login import current_user, login_required

def get_user_list(app, database):
  db = database["db"]
  Task =  database["tables"]["Task"]
  List =  database["tables"]["List"]
  @app.route('/api/user/lists')
  @login_required
  def list_get_user():
    try:
      lists = db.session.query(List).filter(List.stat == True, List.user_id == current_user.user_id).all()
      data = []
      for list in lists:
        task_nbr = db.session.query(Task).filter(Task.list_id == list.list_id, Task.user_id == current_user.user_id, Task.stat == True).count()
        data.append({
          "list_id": list.list_id,
          "list_name": list.list_name,
          "task_nbr": task_nbr,
          "description": list.description,
          "strict": list.strict or False,
        })

      return jsonify({
        "message": "List fetched successfully",
        "data": data
      }), 200
    except Exception as e:
      return jsonify({
        "message": "An error occured",
        "detail": str(e)
      }), 500