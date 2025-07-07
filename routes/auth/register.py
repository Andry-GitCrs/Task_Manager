from datetime import datetime
import os
from flask import jsonify, render_template, request
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message

def register(app, database):
    db = database["db"]
    User = database["tables"]["User"]
    Notification = database["tables"]["Notification"]
    List =  database["tables"]["List"]
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    mail = Mail(app)

    @app.route('/auth/register', methods = ['POST'])
    def create_user():
        bcrypt = Bcrypt()
        data = request.get_json()
        email = data['email']
        otp = data['otp']
        password = bcrypt.generate_password_hash(f"{data['password']}").decode('utf-8')
        confirmation_password = data['confirmation_password']

        try:
            newUser = User.query.filter_by(email = email).first()
            if not newUser:
                return jsonify({"error": "Invalid OTP or email"}), 404

            if newUser.verified:
                return jsonify({"error": "Email already verified, please log in"}), 409

            if newUser.otp != otp:
                return jsonify({"error": "Invalid OTP"}), 400

            if newUser.exp_date and newUser.exp_date < datetime.utcnow():
                return jsonify({"error": "OTP has expired"}), 410   
            
            adminInApp = User.query.filter_by(admin = True).first()
            
            if newUser and newUser.verified:
                return jsonify({"error": "Email already taken"}), 400 # User already registered
            
            if bcrypt.check_password_hash(password, confirmation_password):
                newUser.verified = True
                newUser.stat = True
                newUser.otp = None
                newUser.exp_date = None
                newUser.password = password
                newUser.email = email
                greeting = "<span class='fw-bold btn bg-light border m-0'>💁‍♀️Tips</span> Hi, welcome to <b>Stack Task</b>, you're on the right APP to manage your Task. Please visit the <a class='text-primary' href='/dashboard/help'>guide</a> page before starting using the app. Don't hesitate to <a class='text-primary' href='/dashboard/help#contact-us'>contact us</a> if needed"
                adminMessage = """
                                <span class='fw-bold btn bg-light border m-0'>
                                    <i class="fas fa-trophy text-warning me-1"></i> Congratulation
                                </span> You are the first person on the <b>Stack Task</b>, so you have been promoted <b>Admin role</b>.""".strip()
                if adminInApp :
                    if not adminInApp:
                        newUser.admin = True
                    db.session.add(newUser)
                    db.session.commit()
                    notification = Notification( message = greeting, user_id = newUser.user_id )

                else:
                    newUser.admin = True
                    db.session.add(newUser)    
                    db.session.commit()
                    notification = Notification( message = adminMessage, user_id = newUser.user_id )
                    notification_1 = Notification( message = greeting, user_id = newUser.user_id )
                    db.session.add(notification_1)

                db.session.add(notification)
                db.session.add( List(list_name = "Personal", user_id = newUser.user_id, strict = True) )
                db.session.commit()
                emailHtml = render_template(
                    '/views/services/email/welcome_email.html',
                    email=email
                )

                msg = Message(
                    subject="Welcome to Stack Task!",
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[email],
                    html=emailHtml
                )
                mail.send(msg)
                return jsonify({"message": f"User {email} created successfully"}), 201 # Save user
            
            return jsonify({"error": "Passwords do not match"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500
