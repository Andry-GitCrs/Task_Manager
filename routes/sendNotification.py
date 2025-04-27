from flask import request, jsonify, abort
from flask_login import current_user, login_required
from flask_socketio import SocketIO, emit, join_room

def send_notification(app, database, socketio):
    Notification = database['tables']['Notification']
    db = database['db']

    @app.route('/api/user/notifications/send', methods=['POST'])
    @login_required
    def send_notification_route():
        if not current_user.admin:
            abort(403)

        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')

        if not user_id or not message:
            return jsonify({'error': 'User ID and message are required'}), 400

        # Store the notification in the database
        new_notification = Notification(
            message=message,
            user_id=user_id,
            stat=True
        )
        db.session.add(new_notification)
        db.session.commit()

        # Emit the notification to the specific user via SocketIO
        socketio.emit('new_notification', {
            'message': message,
            'user_id': user_id
        }, to=f'user_{user_id}')

        return jsonify({'message': 'Notification sent successfully'}), 201

    # SocketIO event to join a room for real-time notifications
    @socketio.on('join')
    def on_join(data):
        user_id = data.get('user_id')
        if user_id:
            room = f'user_{user_id}'
            join_room(room) 
            emit('joined', {'room': room})

