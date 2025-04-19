from flask import abort, jsonify, request
from flask_bcrypt import Bcrypt
from flask_login import current_user, login_required

def adduser(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/admin/adduser', methods = ['POST'])
    @login_required
    def add_user():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        password = data['password']
        confirmation_password = data['confirmation_password']
        admin_privilege = data['admin_privilege']

        if current_user.admin:
            if email and password and confirmation_password:

                password = bcrypt.generate_password_hash(password).decode('utf-8')
                newUser = User.query.filter_by(email = email).first()
                
                if newUser:
                    return jsonify({"error": "Email already taken"}), 400 # User already registered

                if bcrypt.check_password_hash(password, confirmation_password):
                    user = User(email = email, password = password, admin = admin_privilege)
                    db.session.add(user)
                    db.session.commit()
                    user = {
                        "user_id": user.user_id,
                        "email": user.email,
                        "stat": user.stat,
                        "admin": user.admin,
                        "created_at": user.created_at,
                        "updated_at": user.updated_at,
                        "tasks_count": 0,
                        "finished_tasks_count": 0,
                        "user_inactive_tasks_count": 0,
                        "finished_subtasks_count": 0,
                        "user_subtasks_count": 0,
                        "user_active_tasks_count": 0
                    }
                    return jsonify({
                        "message": f"User {email} created successfully",
                        "data": user
                    }), 201 # Save user
                
                return jsonify({
                    "error": "Password do not match"
                }), 401
            
            return jsonify({"error": "Please fill all the blanks"}), 400
    
        abort(404)
