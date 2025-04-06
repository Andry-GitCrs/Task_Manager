def taskModel(app, db):
    with app.app_context():
        class Task(db.Model):
            __table__ = db.Table('tasks', db.metadata, autoload_with = db.engine)
            
        return Task