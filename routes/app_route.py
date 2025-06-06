from .public import use_public_route
from .admin import use_admin_route
from .auth import use_auth_route
from .user import use_user_route
from .task import use_task_route
from .subtask import use_subtask_route
from .services import use_services_route
from .list import use_list_route

def use_app_route(app, database, login_manager, socketio):
  use_user_route(app, database, login_manager)
  use_services_route(app, database, socketio)
  use_admin_route(app, database)
  use_auth_route(app, database)
  use_task_route(app, database)
  use_subtask_route(app, database)
  use_list_route(app, database)
  use_public_route(app)