from flask import jsonify, request
from flask_bcrypt import Bcrypt

def register(app, database):
    db = database["db"]
    User = database["tables"]["User"]

    @app.route('/auth/register', methods = ['POST'])
    def create_user():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        password = bcrypt.generate_password_hash(f'{data['password']}').decode('utf-8')
        confirmation_password = data['confirmation_password']

        newUser = User.query.filter_by(email = email).first()
        suspended = User.query.filter_by(email=email, stat = False).first()
        
        if newUser:
            return jsonify({"error": "Email already taken"}), 400 # User already registered
        
        if bcrypt.check_password_hash(password, confirmation_password) and not suspended:
            user = User(email = email, password = password)
            db.session.add(user)
            db.session.commit()
            return jsonify({"message": f"User {email} created successfully"}), 201 # Save user
        
        elif suspended:
            return jsonify({"error": f"User {email} is suspended by admin"}), 401
        
        else :
            return jsonify({"error": "Passwords do not match"}), 400
