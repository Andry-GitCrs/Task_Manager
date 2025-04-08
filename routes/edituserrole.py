from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required

def edit_user_role(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/admin/api/editUserRole/<int:user_id>', methods=['POST'])
    @login_required
    def edit_user_role(user_id):
        admin_id = current_user.user_id
        message = ""

        user = User.query.filter_by(user_id = user_id).first()

        if user and admin_id != user_id:
            if user.admin:
                user.admin = False
                message = "an admin"

            else:
                user.admin = True
                message = "a simple user"

            user.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({"message": f"User role updated successfully as {message}"}), 200

        elif user and admin_id == user_id:
            return jsonify({"error": "You cannot change your own role"}), 400
                
        else:
            return jsonify({"error": "User not found"}), 404