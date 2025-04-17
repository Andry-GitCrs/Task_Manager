from flask import make_response
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

def export_to_pdf(app, database):
    @app.route('/export/pdf')
    def export_pdf():
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize = letter)

        p.drawString(100, 750, "User Report")
        users = [('Alice', 'alice@example.com', 'Admin'),
                ('Bob', 'bob@example.com', 'User')]

        y = 720
        for user in users:
            p.drawString(100, y, f"Name: {user[0]}, Email: {user[1]}, Role: {user[2]}")
            y -= 20

        p.save()

        buffer.seek(0)
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=users.pdf'
        return response
    