from flask import render_template

def use_public_route(app):
  @app.route('/')
  def main():
      return render_template('views/main.html')

  @app.route('/about')
  def about():
      return render_template('views/about.html')

  @app.route('/contact', methods=['GET'])
  def contact():
      return render_template('views/contact.html')

  @app.route('/login')
  def login_page():
      return render_template('views/login.html')

  @app.route('/auth/forgot_password')
  def forgot_password_page():
      return render_template('views/forgot_password.html')