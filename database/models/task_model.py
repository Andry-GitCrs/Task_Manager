from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

def taskModel(db, User, List):
    class Task(db.Model):
        __tablename__ = 'tasks'

        task_id = Column(Integer, primary_key=True)
        task_title = Column(String(120), nullable=False)
        task_start_date = Column(DateTime, nullable=False)
        task_end_date = Column(DateTime, nullable=False)
        task_background_color = Column(String(120), nullable=False)
        description = Column(Text)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        stat = Column(Boolean, default=True)
        finished = Column(Boolean, default=False)
        user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
        list_id = Column(Integer, ForeignKey('lists.list_id', ondelete='CASCADE'), nullable=False)

        user = relationship("User", back_populates="tasks")
        list = relationship("List", back_populates="tasks")

        def deactivate(self):
            self.stat = False
        
        def check(self):
            self.finished = True
        
        def uncheck(self):
            self.finished = False

    User.tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    List.tasks = relationship("Task", back_populates="list", cascade="all, delete-orphan")

    return Task
