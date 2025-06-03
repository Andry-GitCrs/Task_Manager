from . import (
  auth,
  login,
  login_admin,
  register,
  forgot_password
)

def use_auth_route(app, database):
  routes = [
    auth.auth,
    auth.logout,
    login.login,
    login_admin.login_admin,
    login_admin.verify_admin,
    register.register,
    forgot_password.forgot_password
  ]

  for route in routes:
    route(app, database)