from flask import abort, jsonify, request
from flask_login import current_user, login_required


def announcement(app, database, socketio):
  Notification = database['tables']['Notification']
  User = database['tables']['User']
  db = database['db']

  @app.route('/api/admin/notifications/announcement', methods=['POST'])
  @login_required
  def send_announcement_route():
        if not current_user.admin or not current_user.stat:
            abort(403)

        data = request.get_json()
        announcement_subject = data.get('announcement_subject')
        announcement = data.get('announcement')

        if not announcement_subject or not announcement:
            return jsonify({'error': 'All fields are required'}), 400

        users = db.session.query(User).all()
        if not users:
            return jsonify({'error': 'No user on the system'}), 404
        
        announcement_message = f"<span class='fw-bold btn bg-light border m-0'>{announcement_subject}</span> {announcement}"

        for user in users:
          user_id = user.user_id
          # Store the notification in the database
          new_notification = Notification(
              message = announcement_message,
              user_id = user_id
          )
          db.session.add(new_notification)
          db.session.commit()

          socketio.emit('new_notification', {
              'message': announcement_message,
              'user_id': user_id,
              "created_at": new_notification.created_at.strftime('%Y-%m-%d %H:%M'),
              "notification_id": new_notification.id
          }, to=f'user_{user_id}')

        return jsonify({'message': 'Notification sent successfully'}), 200