from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

def subtaskModel(db, Task):
    class Subask(db.Model):
        __tablename__ = 'subtasks'

        subtask_id = Column(Integer, primary_key=True)
        subtask_title = Column(String(120), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        stat = Column(Boolean, default=True)
        finished = Column(Boolean, default=False)
        task_id = Column(Integer, ForeignKey('tasks.task_id', ondelete='CASCADE'), nullable=False)

        task = relationship("Task", back_populates="subtasks")

        def deactivate(self):
            self.stat = False
        
        def check(self):
            self.finished = True
        
        def uncheck(self):
            self.finished = False


    Task.subtasks = relationship("Subask", back_populates="task", cascade="all, delete-orphan")

    return Subask
