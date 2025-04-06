from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

def subtaskModel(db, Task):
    class Subask(db.Model):
        __tablename__ = 'subtasks'

        subtask_id = Column(Integer, primary_key=True)
        subtask_title = Column(String(120), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow)
        stat = Column(Boolean, default=True)
        task_id = Column(Integer, ForeignKey('tasks.task_id', ondelete='CASCADE'), nullable=False)

        task = relationship("Task", back_populates="subtasks")

        def deactivate(self):
            self.stat = False


    Task.subtasks = relationship("Subask", back_populates="task", cascade="all, delete-orphan")

    return Subask
