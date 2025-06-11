from datetime import datetime
from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, DateTime, Boolean

def userModel(db):
    class User(UserMixin, db.Model):
        __tablename__ = 'users'

        user_id = Column(Integer, primary_key=True)
        email = Column(String(120), unique=True, nullable=False)
        password = Column(String(200), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        admin = Column(Boolean, default=False)
        stat = Column(Boolean, default=True)
        otp = Column(String(6), nullable=True)
        verified = Column(Boolean, default=False)
        exp_date = Column(DateTime, nullable=True)

        tasks = None

        def get_id(self):
            return str(self.user_id)
        
        def deactivate(self):
            self.stat = False

        def activate(self):
            self.stat = True

    return User
