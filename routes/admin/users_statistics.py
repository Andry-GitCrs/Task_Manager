from flask import jsonify, abort
from flask_login import login_required, current_user
from sqlalchemy import func

def users_statistics(app, database):
    User = database["tables"]["User"]

    @app.route('/api/users_statistics', methods=['GET'])
    @login_required
    def get_users_statistics():
        if not current_user.admin or not current_user.stat:
            abort(404)

        # Get the first user creation date
        first_user = database["db"].session.query(func.min(User.created_at)).scalar()
        if not first_user:
            return jsonify({
                "message": "No users found",
                "data": []
            }), 200

        # Query user creation data grouped by day (only actual subscription dates)
        user_counts = (
            database["db"].session.query(
                func.date(User.created_at).label('date'),
                func.count(User.user_id).label('count')
            )
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )

        # Prepare result list directly from the query result
        data = [{"date": str(row.date), "count": row.count} for row in user_counts]

        return jsonify({
            "message": "User statistics retrieved successfully",
            "data": data
        }), 200
