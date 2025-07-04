from flask import abort, jsonify
from flask_login import current_user, login_required

def user_type(app, database):
  db = database['db']
  User = database['tables']['User']
  @app.route('/api/admin/user_type', methods=['GET'])
  @login_required
  def user_type_route():
    if not current_user.admin:
      abort(404)
    
    simple_user = User.query.filter_by(admin = False).count()
    admin = User.query.filter_by(admin = True).count()
    try:
      user_type = {
        "simple_user": simple_user,
        "admin": admin
      }
      if user_type:
        return jsonify({"user_type": user_type}), 200
      return jsonify({"error": "User type not found"}), 404
    except AttributeError:
      return jsonify({"error": "User not authenticated"}), 401