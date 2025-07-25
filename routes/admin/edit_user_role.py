from datetime import datetime
from flask import jsonify
from flask_login import current_user, login_required

def edit_user_role(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/admin/api/editUserRole/<int:user_id>', methods=['PUT'])
    @login_required
    def user_role_edit(user_id):
        admin_id = current_user.user_id
        admin = current_user.admin
        message = ""

        user = User.query.filter_by(user_id = user_id).first()

        if admin:
            if admin_id != user_id:
                if user:
                    if user.admin:
                        user.admin = False
                        message = "a simple user"
                    else:
                        user.admin = True
                        message = "an admin"
                        
                    user.modified_at = datetime.utcnow()
                    db.session.commit()

                    return jsonify({
                        "message": f"User switched as {message}",
                        "data": user.admin
                    }), 200
                
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({"error": "You can not change your own role"}), 404

        return jsonify({"error": "You are not an admin member"}), 401

        