from flask import jsonify, request
from flask_login import current_user, login_required

def add_list(app, database):
  db = database["db"]
  User =  database["tables"]["User"]
  List =  database["tables"]["List"]
  @app.route('/api/user/lists/add', methods=['POST'])
  @login_required
  def list_add():
    try:
      data = request.get_json()
      list_name = data['list_name'].strip()
      list_description = data['list_description'].strip()
      user_id = current_user.user_id
      
      existing_user = User.query.filter_by(user_id = user_id).first()

      if not list_name or not user_id:
        return jsonify({
          "error": "Please fill all the blanks"
        }), 400 

      if not existing_user:
        return jsonify({
          "error": "User not found"
        }), 404
      existing_list = List.query.filter_by(user_id = user_id, list_name = list_name, stat = True).first()

      if existing_list:
        return jsonify({
          "error": "List already exist"
        }), 400
      
      list = List(list_name = list_name, user_id = user_id, description = list_description)
      db.session.add(list)
      db.session.commit()

      data = {
        "list_id": list.list_id,
        "list_name": list.list_name,
        "task_nbr": 0,
        "description": list.description,
        "strict": False,
        "task_nbr": 0
      }

      return jsonify({
        "message": "List created successfully",
        "list": data
      }), 201
    except Exception as e:
      print(str(e))
      return jsonify({
        'error': 'An error occured while creating the list',
        "detail": str(e)
      }), 500