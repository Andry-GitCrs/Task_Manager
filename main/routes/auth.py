from flask import render_template

## Authentication route
def auth(app):
    @app.route('/auth', methods=['GET', 'POST'])
    def authentication():
        return render_template('views/auth.html')
