from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Database Configuration
def config(app, databaseConfig):
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{databaseConfig.user}:{databaseConfig.password}@{databaseConfig.host}/{databaseConfig.db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
    app.config['JWT_SECRET_KEY'] = "bd445f47a42260dacb2f4b0c4498a04acb72c05c42a553eb3e1824ed42d4e3ad"
    return app

## Connection
def connect(app):
    databaseConfig = Database('postgres', 'Andry18ans#', 'localhost', 'task_manager') # Database configuration
    app = config(app, databaseConfig)
    db = SQLAlchemy(app)
    jwt = JWTManager(app)

    # Database tables
    with app.app_context():
        class User(db.Model):
            __table__ = db.Table('users', db.metadata, autoload_with = db.engine)

    with app.app_context():
        class Task(db.Model):
            __table__ = db.Table('tasks', db.metadata, autoload_with = db.engine)
    
    return {
        "message": "Database connected",
        "db": db,
        "jwt": jwt,
        "tables": {
            "User": User,
            "Task": Task
        }
    }

class Database :
        def __init__(self, user, password, host, db_name):
            self.user = user
            self.password = password
            self.host = host
            self.db_name = db_name