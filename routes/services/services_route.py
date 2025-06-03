from flask import jsonify, render_template
from . import(
  export_csv,
  export_pdf,
  send_email,
  send_notification,
  announcement
)

def use_services_route(app, database, socketio):
  routes = [
    export_csv.export_to_csv,
    export_pdf.export_to_pdf
  ]

  send_email.verifyEmail(app)
  send_email.sendEmail(app)
  send_notification.send_notification(app, database, socketio)
  announcement.announcement(app, database, socketio)

  for route in routes:
    route(app, database)
    
  @app.errorhandler(404)
  def page_not_found(e):
      return render_template('views/404.html'), 404

  @app.errorhandler(405)
  def method_not_allowed(e):
      return render_template("views/405.html"), 405