from datetime import timedelta
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask import Flask
from dotenv import load_dotenv
import sys
import os

# Dir config 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv()

# Dependence module
from database import pg_connexion
from routes import use_app_route

# App config
app = Flask(__name__, template_folder = f'{script_dir}/../templates', static_folder = f'{script_dir}/../static')
app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days = 1)
app.config['REMEMBER_COOKIE_SECURE'] = True
app.config['REMEMBER_COOKIE_HTTPONLY'] = True
app.secret_key = os.getenv("SECRET_KEY")
port = os.getenv("PORT")

login_manager = LoginManager() # Login Manager config
login_manager.login_view = 'authentication'
login_manager.init_app(app)
socketio = SocketIO(app, async_mode='threading') # Initialize SocketIO
database = pg_connexion.connect(app) # Database Connection
use_app_route(app, database, login_manager, socketio) # Route

## Use HTTPS
if __name__ == "__main__":
    socketio.run(app, debug = True, port = port, host = '0.0.0.0', ssl_context=('cert.pem', 'key.pem'))
