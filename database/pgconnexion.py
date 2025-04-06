from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from .models import usermodel, taskmodel, subtaskmodel

class Database :
        def __init__(self, user, password, host, db_name):
            self.user = user
            self.password = password
            self.host = host
            self.db_name = db_name

# Database Setup
def config(app, databaseConfig):
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{databaseConfig.user}:{databaseConfig.password}@{databaseConfig.host}/{databaseConfig.db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
    return app

## Connection
def connect(app):
    databaseConfig = Database('postgres', 'Andry18ans#', 'localhost', 'task_manager') # Database configuration
    app = config(app, databaseConfig)
    db = SQLAlchemy(app)

    ## Tables
    User = usermodel.userModel(app, UserMixin, db)
    Task = taskmodel.taskModel(app, db)
    Subtask = subtaskmodel.subtaskModel(app, db)
    
    return {
        "message": "Database connected",
        "db": db,
        "tables": {
            "User": User,
            "Task": Task,
            "Subtask": Subtask
        }
    }