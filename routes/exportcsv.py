import datetime
from flask import Response, abort, jsonify
import csv
import io
from flask_login import current_user, login_required

def export_to_csv(app, database):
    User = database['tables']['User']
    db = database['db']
    @app.route('/export_users/csv')
    @login_required
    def export_csv():

        if current_user.admin and current_user.stat:
            date = datetime.date.today()
            data = [
                ['ID', 'Email', 'Stat', 'Created At', 'Updated At', 'Role']
            ]

            users = db.session.query(
                User.user_id,
                User.email,
                User.stat,
                User.created_at,
                User.updated_at,
                User.admin
            ).all()

            for user in users:
                admin = 'Admin'
                stat = 'Active'

                if not user.admin:
                    admin = 'Simple user'

                if not user.stat:
                    stat = 'Inactive'

                data.append([
                    user.user_id, 
                    user.email,
                    stat,
                    user.created_at,
                    user.updated_at,
                    admin
                ])

            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerows(data)

            response = Response(output.getvalue(), mimetype='text/csv')
            response.headers["Content-Disposition"] = f"attachment; filename=task_manager_users_{date}.csv"
            return response
        
        abort(404)
