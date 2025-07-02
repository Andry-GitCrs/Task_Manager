from flask_login import current_user
from flask_mail import Mail, Message
from flask import jsonify, render_template, request
from dotenv import load_dotenv
import requests
import os

def sendEmail(app):
    load_dotenv()
    # Config for Gmail SMTP
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    mail = Mail(app)

    @app.route('/api/send_email', methods=['POST'])
    def send_email():
        try:
            data = request.get_json()
            user_email = data['email'] or current_user.email
            user_first_name = data['first_name']
            user_last_name = data['last_name']
            user_phone = data['phone']
            user_message = data['message']

            senderHtml = render_template(
                '/views/services/email/confirmation_message.html',
                user_email = user_email,
                user_first_name = user_first_name,
                user_last_name = user_last_name,
                user_phone = user_phone,
                user_message = user_message
            )

            adminHtml = render_template(
                '/views/services/email/received_message.html',
                user_email = user_email,
                user_first_name = user_first_name,
                user_last_name = user_last_name,
                user_phone = user_phone,
                user_message = user_message
            )
            if not user_email or not user_first_name or not user_message:
                return jsonify({'error': "All fields are required"}), 400
            
            msg1 = Message(
                subject = f'Task Manager APP notification',
                sender = app.config['MAIL_USERNAME'],
                recipients = [app.config['MAIL_USERNAME']],
                html = adminHtml
            )

            msg2 = Message(
                subject = f'Task Manager App demand confirmation',
                sender = app.config['MAIL_USERNAME'],
                recipients = [user_email],
                html = senderHtml
            )

            try:
                mail.send(msg1)
                mail.send(msg2)
                return jsonify({'message': "Email sent successfully, we will get back to you soon, check your inbox to confirm"}), 200
            
            except Exception as e:
                return jsonify({'error': str(e)}), 500
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            

def verifyEmail(app):
    api_key = os.getenv('API_KEY')
    @app.route('/api/verify_email', methods=['POST'])
    def verify_email():
        try:
            data = request.get_json()
            email = data['email']
            if not email:
                return jsonify({'error': "Email is required"}), 400
            
            url = 'https://emailvalidation.abstractapi.com/v1/'
            params = {
                'api_key': api_key,
                'email': email
            }

            try:
                response = requests.get(url, params = params)
                data = response.json()

                if data["deliverability"] == "DELIVERABLE":
                    return jsonify({
                        'message': "Your email is valid",
                        'is_valid': True
                    }), 200
                return jsonify({
                    'error': "Cannot send inbox to this address",
                    'is_valid': False
                }), 400
            except ConnectionError as e:
                return jsonify({
                    'error': str(e)
                }), 403
            
            except requests.RequestException as e:
                return jsonify({
                    'error': 'No internet connection'
                }), 401

        except Exception as e:
            print(str(e))
            return jsonify({
                'error': str(e)
            }), 500
