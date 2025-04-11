from datetime import datetime
from flask import jsonify, request
from flask_bcrypt import Bcrypt
from flask_login import current_user, login_required

def update_profile(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/api/user/update', methods = ['PUT'])
    @login_required
    def update_user_profile():
        bcrypt = Bcrypt()
        data = request.get_json()
        user_id = current_user.user_id
        email = data['email']
        old_password = data['old_password']
        new_password = bcrypt.generate_password_hash(f'{data['new_password']}').decode('utf-8')
        new_confirmation_password = data['confirmation_password']

        user = User.query.filter_by(user_id = user_id).first()
        check_email = User.query.filter_by(email = email).first()

        if check_email.user_id == user_id:
            if bcrypt.check_password_hash(user.password, old_password):
                if bcrypt.check_password_hash(new_password, new_confirmation_password):
                    user.email = email
                    user.password = new_password
                    user.updated_at = datetime.utcnow()
                    db.session.commit()
                    return jsonify({"message": f"User {email} updated successfully"}), 201 # Save user
                
                return jsonify({"error": "Passwords do not match"}), 400
                
            return jsonify({
                "error": "Wrong verification password"
            }), 401
        
        return jsonify({
            "error": "Email address already taken"
        }), 401