from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from sqlalchemy import func
from datetime import datetime, timedelta

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

        # Generate a list of all dates from the first user creation date to today
        start_date = first_user.date()
        end_date = datetime.utcnow().date()
        all_dates = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

        # Query user creation data grouped by day
        user_counts = (
            database["db"].session.query(
            func.date(User.created_at).label('date'),
            func.count(User.user_id).label('count')
            )
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )

        # Map query results to a dictionary for easier lookup
        user_counts_dict = {row.date: row.count for row in user_counts}

        # Fill in missing dates with 0 counts
        data = [{"date": str(date), "count": user_counts_dict.get(date, 0)} for date in all_dates]

        return jsonify({
            "message": "User statistics retrieved successfully",
            "data": data
        }), 200
