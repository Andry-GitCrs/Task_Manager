from flask import jsonify, abort
from flask_login import current_user, login_required

def get_notifications(app, database):
    Notification = database['tables']['Notification']
    db = database['db']

    @app.route('/api/user/notifications', methods=['GET'])
    @login_required
    def fetch_notifications():
        notifications = db.session.query(Notification).filter_by(user_id = current_user.user_id, stat = True).all()

        notifications_data = [
            {
                "id": notification.id,
                "message": notification.message,
                "created_at": notification.created_at,
                "updated_at": notification.updated_at,
                "stat": notification.stat
            }
            for notification in notifications
        ]

        return jsonify({
            'message': 'Notifications fetched successfully',
            'data': notifications_data,
        }), 200
