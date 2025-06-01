from datetime import datetime
from flask import jsonify, request
from flask_bcrypt import Bcrypt
from flask_login import current_user, login_required

def forgot_password(app, database):
    db = database["db"]
    User = database["tables"]["User"]
    Notification = database["tables"]["Notification"]

    @app.route('/api/user/forgot_password', methods = ['PUT'])
    def user_forgot_password():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        new_password = data['new_password']
        new_confirmation_password = data['confirmation_password']

        if email and new_password and new_confirmation_password:
            user = User.query.filter_by(email = email).first()

            if user:
                if new_password == new_confirmation_password:
                    new_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
                    user.password = new_password
                    user.updated_at = datetime.utcnow()
                    new_notification = Notification(
                        message = 'Your password was updated',
                        user_id = user.user_id
                    )
                    db.session.add(new_notification)
                    db.session.commit()
                    return jsonify({"message": f"Password updated successfully"}), 201
                
                return jsonify({"error": "Passwords do not match"}), 400
            
            return jsonify({
                "error": "User not found"
            }), 401
        
        return jsonify({
            "error": "Please fill all the blanks"
        })