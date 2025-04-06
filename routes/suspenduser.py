from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def suspendUser(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/api/admin/suspendUser', methods=['POST'])
    @login_required
    def suspend_user():
        data = request.get_json()
        admin_user_id = current_user.user_id
        user_id = data['user_id']

        user = User.query.filter_by(user_id = user_id, stat = True, admin = False).first()
        userAdmin = User.query.filter_by(user_id = admin_user_id, stat = True, admin = True).first()
        suspended = User.query.filter_by(user_id = user_id, stat = False).first()

        if admin_user_id == user_id:
            return jsonify({"error": "You cannot suspend yourself"}), 400

        if user and not suspended and userAdmin:
            user.updated_at = datetime.utcnow()
            user.deactivate()
            db.session.commit()
            return jsonify({"message": f"User suspended successfully by admin {admin_user_id}"}), 200
        
        elif user and suspended:
            return jsonify({"error": f"User {user_id} is already suspended"}), 400
        
        elif not userAdmin:
            return jsonify({"error": "You are not an admin member"}), 401
        
        else:
            return jsonify({"error": "User not found"}), 404