from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

def listModel(db, User):
    class List(db.Model):
        __tablename__ = 'lists'

        list_id = Column(Integer, primary_key=True)
        list_name = Column(String(120), nullable=False)
        description = Column(Text, default="No description")
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        stat = Column(Boolean, default=True)
        finished = Column(Boolean, default=False)
        strict = Column(Boolean, default=False)
        user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)

        # Relationship with User
        user = relationship(User, back_populates='lists')

        def deactivate(self):
            self.stat = False

    # Add relationship to User model
    User.lists = relationship(List, back_populates='user', cascade='all, delete-orphan')

    return List
