from flask import Response
import csv
import io
from flask_login import login_required

def export_to_csv(app, database):
    @app.route('/export_users/csv')
    @login_required
    def export_csv():
        data = [
            ['Name', 'Email', 'Role'],
            ['Alice', 'alice@example.com', 'Admin'],
            ['Bob', 'bob@example.com', 'User']
        ]

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(data)

        response = Response(output.getvalue(), mimetype='text/csv')
        response.headers["Content-Disposition"] = "attachment; filename=users.csv"
        return response
