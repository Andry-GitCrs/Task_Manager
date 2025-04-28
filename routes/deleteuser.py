from datetime import datetime
from flask import jsonify, request, abort
from flask_login import current_user, login_required

def delete_user(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/api/admin/deteteUser/<int:user_id>', methods=['DELETE'])
    @login_required
    def delete_user(user_id):
        admin = current_user.admin
        stat = current_user.stat

        user = User.query.filter_by(user_id = user_id).first()

        if admin and stat:
            if user:
                db.session.delete(user)
                db.session.commit()
                return jsonify({"message": "User deleted successfully"}), 200
            return jsonify({"error": "User not found"}), 404
        abort(404)