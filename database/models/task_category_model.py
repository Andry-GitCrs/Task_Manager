from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

def categoryModel(db, User):
    class Category(db.Model):
        __tablename__ = 'category'

        category_id = Column(Integer, primary_key=True)
        category_name = Column(String(120), nullable=False)
        description = Column(Text)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        stat = Column(Boolean, default=True)
        finished = Column(Boolean, default=False)
        user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)

        # Relationship with User
        user = relationship(User, back_populates='category')

        def deactivate(self):
            self.stat = False

    # Add relationship to User model
    User.category = relationship(Category, back_populates='user', cascade='all, delete-orphan')

    return Category
