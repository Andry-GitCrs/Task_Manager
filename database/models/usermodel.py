def userModel(app, UserMixin, db):
    with app.app_context():
        class User(UserMixin, db.Model):
            __table__ = db.Table('users', db.metadata, autoload_with = db.engine)
            def get_id(self):
                return str(self.user_id)
            
    return User 