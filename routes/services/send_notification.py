from flask import request, jsonify, abort
from flask_login import current_user, login_required
from flask_socketio import emit, join_room
from collections import defaultdict

online_users = defaultdict(set)
user_sid_map = {}

def send_notification(app, database, socketio):
    Notification = database['tables']['Notification']
    User = database['tables']['User']
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

        # Check if the user exists
        user = db.session.query(User).filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Store the notification in the database
        new_notification = Notification(
            message=message,
            user_id=user_id
        )
        db.session.add(new_notification)
        db.session.commit()

        # Emit the notification to the specific user via SocketIO
        socketio.emit('new_notification', {
            'message': message,
            'email': user.email,
            'user_id': user_id,
            "created_at": new_notification.created_at.strftime('%Y-%m-%d %H:%M'),
            "notification_id": new_notification.id
        }, to=f'user_{user_id}')

        return jsonify({'message': 'Notification sent successfully'}), 201
    
    # SocketIO event to join a room for real-time notifications
    @socketio.on('join')
    def on_join(data):
        user_id = data.get('user_id')
        if user_id:
            room = f'user_{user_id}'
            join_room(room)

            online_users[room].add(user_id)
            user_sid_map[request.sid] = (user_id, room)
            all_online = [user_id for users in online_users.values() for user_id in users]
            emit('user_online', all_online, broadcast = True)

            emit('joined', {'room': room})


    # SocketIO event to leave a room
    @socketio.on('disconnect')
    def handle_disconnect():
        sid = request.sid
        if sid in user_sid_map:
            user_id, room = user_sid_map.pop(sid)
            online_users[room].discard(user_id)

            # Remove room if empty (optional cleanup)
            if not online_users[room]:
                del online_users[room]

            # Get the full updated list of online users
            all_online = list(set(
                user for users in online_users.values() for user in users
            ))

            emit('user_offline', {
                'disconnected': user_id,
                'online_users': all_online
            }, broadcast=True)
