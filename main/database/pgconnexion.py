from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

class Database :
        def __init__(self, user, password, host, db_name):
            self.user = user
            self.password = password
            self.host = host
            self.db_name = db_name

# Database Configuration
def config(app, databaseConfig):
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{databaseConfig.user}:{databaseConfig.password}@{databaseConfig.host}/{databaseConfig.db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
    return app

## Connection
def connect(app):
    databaseConfig = Database('postgres', 'Andry18ans#', 'localhost', 'task_manager') # Database configuration
    app = config(app, databaseConfig)
    db = SQLAlchemy(app)

    # Database tables
    with app.app_context():
        class User(UserMixin, db.Model):
            __table__ = db.Table('users', db.metadata, autoload_with = db.engine)
            def get_id(self):
                return str(self.user_id)

    with app.app_context():
        class Task(db.Model):
            __table__ = db.Table('tasks', db.metadata, autoload_with = db.engine)
    
    return {
        "message": "Database connected",
        "db": db,
        "tables": {
            "User": User,
            "Task": Task
        }
    }