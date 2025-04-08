from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def suspendUser(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/api/admin/suspendUser/<int:user_id>', methods=['PUT'])
    @login_required
    def suspend_user(user_id):
        admin = current_user.admin
        admin_user_id = current_user.user_id

        user = User.query.filter_by(user_id = user_id, admin = False).first()
        suspended = User.query.filter_by(user_id = user_id, stat = False).first()

        if admin:
            if admin_user_id == user_id:
                return jsonify({"error": "You cannot suspend yourself"}), 400

            if user and not suspended:
                user.updated_at = datetime.utcnow()
                user.deactivate()
                db.session.commit()
                return jsonify({"message": f"User suspended successfully by admin {admin_user_id}"}), 200
            
            elif user and suspended:
                user.updated_at = datetime.utcnow()
                user.activate()
                db.session.commit()
                return jsonify({"error": f"User unsuspended successfully"}), 400
            
            else:
                return jsonify({"error": "User not found"}), 404
        else:
            return jsonify({"error": "You are not an admin member"}), 401