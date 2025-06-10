import os
import random
from flask import jsonify, render_template
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

  @app.route('/api/user/sendOtp/<string:email>', methods=['POST'])
  def otp_send(email):
        try:
            user = User.query.filter_by(email=email).first()

            if user:
                if user.verified:
                    return jsonify({"error": "User already exists"}), 409
                
                # User exists but not verified — update OTP and expiration
                user.otp = ''.join(secrets.choice(string.digits) for _ in range(6))
                user.exp_date = datetime.utcnow() + timedelta(minutes=10)
                user.stat = False
                db.session.commit()
                otp = user.otp  
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
                            "error": "Email address is not deliverable",
                            "is_valid": False
                        }), 400
                except requests.ConnectionError as e:
                    return jsonify({"error": str(e)}), 503
                except requests.RequestException:
                    return jsonify({"error": "Unable to validate email due to network error"}), 500
                
                otp = ''.join(secrets.choice(string.digits) for _ in range(6))
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
