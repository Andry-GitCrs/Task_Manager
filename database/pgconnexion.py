from flask_sqlalchemy import SQLAlchemy
from .models import usermodel, taskmodel, subtaskmodel
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
    load_dotenv()
    user = os.getenv('DATABASE_USER')
    password = os.getenv('DATABASE_PWD')
    host = os.getenv('DATABASE_HOST')
    database_name = os.getenv('DATABASE_NAME')

    databaseConfig = Database(user, password, host, database_name) # Database configuration
    app = config(app, databaseConfig)
    db = SQLAlchemy(app)

    ## Tables
    with app.app_context():
        User = usermodel.userModel(db)
        Task = taskmodel.taskModel(db, User)
        Subtask = subtaskmodel.subtaskModel(db, Task)
        db.create_all()
    
    return {
        "message": "Database connected",
        "db": db,
        "tables": {
            "User": User,
            "Task": Task,
            "Subtask": Subtask
        }
    }