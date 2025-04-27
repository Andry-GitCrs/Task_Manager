from flask import abort, make_response
from flask_login import current_user, login_required
from reportlab.lib.pagesizes import letter
from datetime import datetime
import io
# New imports for Platypus table layout
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

def export_to_pdf(app, database):
    User = database['tables']['User']
    db = database['db']
    @app.route('/export_users/pdf')
    @login_required
    def export_pdf():
        if current_user.admin and current_user.stat:
            date = datetime.now()
            buffer = io.BytesIO()
            
            # Create PDF using Platypus for a nice table layout
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            story.append(Paragraph(f"{date} --- User list", styles['Title']))
            story.append(Spacer(1, 12))
            
            # Prepare table header and rows
            data = [["ID", "Email", "Stat", "Created At", "Updated At", "Role"]]
            users = db.session.query(
                User.user_id,
                User.email,
                User.stat,
                User.created_at,
                User.updated_at,
                User.admin
            ).all()

            for user in users:
                admin = "Admin" if user.admin else "Simple user"
                stat = "Active" if user.stat else "Inactive"
                data.append([
                    user.user_id,
                    user.email,
                    stat,
                    user.created_at,
                    user.updated_at,
                    admin
                ])
            
            table = Table(data, hAlign='CENTER')
            table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.gray),
                ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
                ('ALIGN',(0,0),(-1,-1),'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING',(0,0),(-1,0),12),
                ('GRID', (0,0), (-1,-1), 1, colors.black)
            ]))
            story.append(table)

            doc.build(story)
            buffer.seek(0)
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'attachment; filename=task_manager_users_{date}.pdf'
            return response
        
        abort(404)
