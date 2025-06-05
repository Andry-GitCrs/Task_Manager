from flask import jsonify, request
from flask_bcrypt import Bcrypt

def register(app, database):
    db = database["db"]
    User = database["tables"]["User"]
    Notification = database["tables"]["Notification"]

    @app.route('/auth/register', methods = ['POST'])
    def create_user():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        password = bcrypt.generate_password_hash(f"{data['password']}").decode('utf-8')
        confirmation_password = data['confirmation_password']

        try:
            newUser = User.query.filter_by(email = email).first()
            adminInApp = User.query.filter_by(admin = True).first()
            suspended = User.query.filter_by(email = email, stat = False).first()
            
            if newUser:
                return jsonify({"error": "Email already taken"}), 400 # User already registered
            
            if bcrypt.check_password_hash(password, confirmation_password) and not suspended:
                greeting = "<span class='fw-bold btn bg-light border m-0'>💁‍♀️Tips</span> Hi, welcome to <b>Task Manager</b>, you're on the right APP to manage your Task. Please visit the <a class='text-primary' href='/dashboard/help'>guide</a> page before starting using the app, thank you. Don't hesitate to <a class='text-primary' href='/dashboard/help#contact-us'>contact us</a> if needed"
                adminMessage = """
                                <span class='fw-bold btn bg-light border m-0'>
                                    <i class="fas fa-trophy text-warning me-1"></i> Congratulation
                                </span> You are the first person on the <b>Task Manager</b>, so you have been promoted <b>Admin role</b>.""".strip()
                if adminInApp :
                    user = User(email = email, password = password)
                    db.session.add(user)
                    db.session.commit()
                    notification = Notification( message = greeting, user_id = user.user_id )

                else:
                    user = User(email = email, password = password, admin = True)
                    db.session.add(user)    
                    db.session.commit()
                    notification = Notification( message = adminMessage, user_id = user.user_id )
                    notification_1 = Notification( message = greeting, user_id = user.user_id )
                    db.session.add(notification_1)

                db.session.add(notification)
                db.session.commit()
                return jsonify({"message": f"User {email} created successfully"}), 201 # Save user
                
            elif suspended:
                return jsonify({"error": f"User {email} is suspended by admin"}), 401
            
            return jsonify({"error": "Passwords do not match"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500
