from flask_login import LoginManager
from flask_socketio import SocketIO
from flask import Flask
import sys
import os

# Dir config 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
script_dir = os.path.dirname(os.path.abspath(__file__))

# Dependence module
from routes.public import use_public_route
from routes.admin import use_admin_route
from routes.auth import use_auth_route
from routes.user import use_user_route
from routes.task import use_task_route
from routes.subtask import use_subtask_route
from routes.services import use_services_route
from database import pg_connexion

# App config
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.secret_key = "secret-key"

# Login Manager config
login_manager = LoginManager()
login_manager.login_view = 'authentication'
login_manager.init_app(app)

# Initialize SocketIO
socketio = SocketIO(app)

# Database Connection
database = pg_connexion.connect(app)

# Routes
use_user_route(app, database, login_manager)
use_services_route(app, database, socketio)
use_admin_route(app, database)
use_auth_route(app, database)
use_task_route(app, database)
use_subtask_route(app, database)
use_public_route(app)

if __name__ == "__main__":
    socketio.run(app, debug=True)
