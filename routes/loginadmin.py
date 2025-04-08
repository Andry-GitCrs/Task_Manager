from flask import jsonify, request
from flask_login import login_user
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def login_admin(app, database):
    User = database["tables"]["User"]

    @app.route('/admin/auth/login', methods=['POST'])
    def login_admin_route():
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')

            user = User.query.filter_by(email = email).first()
            suspended = User.query.filter_by(email=email, stat = False).first()

            if user and not user.admin:
                return jsonify({
                    "error": f"User is not an admin member"
                }), 401

            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            if not bcrypt.check_password_hash(user.password, password):
                return jsonify({"error": "Incorrect password"}), 400

            if not suspended and user and user.admin:
                login_user(user)
                return jsonify({
                    "message": f"User {user.email} logged in successfully (as admin)"
                }), 200

            elif suspended:
                return jsonify({
                    "error": f"User {user.email} is suspended"
                }), 401

        except Exception as e:
            print("Login error:", str(e))  # for debug
            return jsonify({"error": "Something went wrong", "details": str(e)}), 500

from flask_login import login_required, current_user
def verify_admin(app, database):
    User = database["tables"]["User"]
    db = database["db"]
    @app.route('/api/verify_user')
    @login_required
    def verify_admin():
        admin = current_user.admin

        if admin:
            return jsonify({
                "message": "User have admin privilege",
                "privilege": admin
            }), 200
            
        return jsonify({
            "error": f"User is not an admin member",
            "privilege": admin
        }), 401