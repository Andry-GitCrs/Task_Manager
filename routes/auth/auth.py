from flask import abort, redirect, render_template
from flask_login import current_user, login_required, logout_user

## Authentication route
def auth(app, database):
    @app.route('/auth', methods=['GET'])
    def authentication():
        return render_template('views/auth.html')
    
    @app.route('/auth/admin/login')
    @login_required
    def admin_login_route():
        try:
            admin = current_user.admin
            if admin:
                return render_template('views/admin/admin_login.html')
            abort(404)
        except AttributeError:
            abort(404)

def logout(app, database):
    User = database["tables"]["User"]
    db = database["db"]
    @app.route('/auth/logout')
    @login_required
    def user_logout():
        if current_user.admin:
            user = User.query.filter_by(user_id = current_user.user_id).first()
            user.activate()
            db.session.commit()
        logout_user()
        return redirect('/')
