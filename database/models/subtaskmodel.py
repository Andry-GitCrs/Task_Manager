def subtaskModel(app, db):
    with app.app_context():
        class Subtask(db.Model):
            __table__ = db.Table('subtasks', db.metadata, autoload_with = db.engine)
            
    return Subtask