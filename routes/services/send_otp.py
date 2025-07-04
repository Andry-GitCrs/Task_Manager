import os
from flask import jsonify, render_template, request
import string
import secrets
import requests
from datetime import datetime, timedelta
from flask_mail import Mail, Message

def send_otp(app, database):
  api_key = os.getenv('API_KEY')
  User = database["tables"]["User"]
  db = database["db"]
  app.config['MAIL_SERVER'] = 'smtp.gmail.com'
  app.config['MAIL_PORT'] = 587
  app.config['MAIL_USE_TLS'] = True
  app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
  app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
  mail = Mail(app)

  @app.route('/api/user/sendOtp', defaults={'email': None}, methods=['POST'])
  @app.route('/api/user/sendOtp/<string:email>', methods=['POST'])
  def otp_send(email):
        try:
            forgot_password = True
            if email is None:
                email = request.args.get('email')
                forgot_password = False
            
            if not email:
                return jsonify(error="Email is required"), 400
            
            user = User.query.filter_by(email=email).first()

            if not user and forgot_password:
                return jsonify({"error": "User not registered"}), 404

            if user:
                if user.verified and not forgot_password:
                    return jsonify({"error": "User already exists"}), 409
                
                # User exists but not verified — update OTP and expiration
                otp = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(6))
                user.otp = otp
                user.exp_date = datetime.utcnow() + timedelta(minutes=10)
                
                if not forgot_password:
                    user.stat = False
                else:
                    user.stat = True
                
                db.session.commit()
            else:
                url = 'https://emailvalidation.abstractapi.com/v1/'
                params = {
                    'api_key': api_key,
                    'email': email
                }
                try:
                    response = requests.get(url, params=params)
                    data = response.json()
                    if data.get("deliverability") != "DELIVERABLE":
                        return jsonify({
                            "error": "Cannot send inbox to this address",
                            "is_valid": False
                        }), 400
                except ConnectionError as e:
                    return jsonify({"error": str(e)}), 403
                except requests.RequestException:
                    return jsonify({"error": 'No internet connection'}), 401
                
                
                otp = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(6))
                exp_date = datetime.utcnow() + timedelta(minutes=10)
                
                temp_user = User(
                    email=email,
                    password="",
                    otp=otp,                            
                    verified=False,
                    exp_date=exp_date,
                    stat=False
                )
                db.session.add(temp_user)
                db.session.commit()

            # Send email with the OTP
            emailHtml = render_template(
                '/views/services/email/email_verification.html',
                otp=otp,
                email=email
            )

            msg = Message(
                subject="Task Manager Email verification",
                sender=app.config['MAIL_USERNAME'],
                recipients=[email],
                html=emailHtml
            )
            mail.send(msg)

            return jsonify({
                "message": "OTP sent successfully",
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
