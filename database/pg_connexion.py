from flask_sqlalchemy import SQLAlchemy
from .models import notification_model, subtask_model, task_list_model, task_model, user_model
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

class Database :
    def __init__(self, user, password, host, db_name):
        self.user = user
        self.password = password
        self.host = host
        self.db_name = db_name

# Database Setup
def config(app, databaseConfig):
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{databaseConfig.user}:{databaseConfig.password}@{databaseConfig.host}/{databaseConfig.db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    return app

## Connection
def connect(app):
    try:
        load_dotenv()
        user = os.getenv('DATABASE_USER')
        password = os.getenv('DATABASE_PWD')
        host = os.getenv('DATABASE_HOST')
        database_name = os.getenv('DATABASE_NAME')

        databaseConfig = Database(user, password, host, database_name) # Database configuration
        app = config(app, databaseConfig)
        db = SQLAlchemy(app)
        migrate = Migrate(app, db)

        ## Tables
        with app.app_context():
            User = user_model.userModel(db)
            List = task_list_model.listModel(db, User)
            Task = task_model.taskModel(db, User, List)
            Subtask = subtask_model.subtaskModel(db, Task)
            Notification = notification_model.notificationModel(db, User)
        
        return {
            "message": "Database connected",
            "db": db,
            "tables": {
                "User": User,
                "Task": Task,
                "Subtask": Subtask,
                "Notification": Notification,
                "List": List
            }
        }
    except Exception as e:
        print(str(e))
        return None