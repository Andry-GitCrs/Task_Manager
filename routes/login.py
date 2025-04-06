from flask import jsonify, request
from flask_login import login_user
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def login(app, database):
    User = database["tables"]["User"]

    @app.route('/auth/login', methods=['POST'])
    def login_route():
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')

            user = User.query.filter_by(email=email).first()
            suspended = User.query.filter_by(email=email, stat = False).first()

            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            if not bcrypt.check_password_hash(user.password, password):
                return jsonify({"error": "Incorrect password"}), 400

            if not suspended and user:
                login_user(user)
                return jsonify({
                    "message": f"User {user.email} logged in successfully"
                }), 200
            
            elif suspended:
                return jsonify({
                    "error": f"User {user.email} is suspended by admin"
                }), 401

        except Exception as e:
            print("Login error:", str(e))  # for debug
            return jsonify({"error": "Something went wrong", "details": str(e)}), 500
