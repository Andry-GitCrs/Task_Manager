from flask import jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

def login(app, database):
    User = database["tables"]["User"]

    @app.route('/auth/login', methods = ['POST'])
    def login():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        password = data['password']

        user = User.query.filter_by(email = email).first()

        if user:
            if bcrypt.check_password_hash(user.password, password):
                access_token = create_access_token(identity = email)
                return jsonify({
                    "message": f"User {email} logged in successfully",
                    "token": access_token
                }), 200
            
            else:
                return jsonify({
                    "error": "Incorrect password"
                }), 400
            
        if not user:
            return jsonify({
                "error": "Invalid email or password"
            }), 401
