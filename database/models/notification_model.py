from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

def notificationModel(db, User):
    class Notification(db.Model):
        __tablename__ = 'notifications'
        id = Column(Integer, primary_key=True, autoincrement=True)
        message = Column(Text, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        stat = Column(Boolean, default=True)
        user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)

        # Relationship with User
        user = relationship('User', back_populates='notifications')

    # Add relationship to User model
    User.notifications = relationship('Notification', back_populates='user', cascade='all, delete-orphan')

    return Notification
