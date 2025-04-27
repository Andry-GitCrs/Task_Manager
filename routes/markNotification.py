from datetime import datetime
from flask import jsonify, request, abort
from flask_login import login_required, current_user

def mark_notification(app, database):
    Notification = database['tables']['Notification']
    db = database['db']

    @app.route('/api/user/notifications/mark_read/<int:notification_id>', methods=['PUT'])
    @login_required
    def mark_notification_as_read(notification_id):

        if not notification_id:
            return jsonify({'error': 'Notification ID is required'}), 400

        # Fetch the notification
        notification = db.session.query(Notification).filter_by(id=notification_id, user_id=current_user.user_id, stat=True).first()

        if not notification:
            return jsonify({'error': 'Notification not found or access denied'}), 404

        # Mark as read
        notification.stat = False
        notification.update_date = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Notification marked as read'}), 200
