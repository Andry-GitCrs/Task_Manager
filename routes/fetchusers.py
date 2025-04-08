from flask import jsonify
from flask_login import login_required, current_user
from flask_login import current_user
from sqlalchemy import func

def fetch_users(app, database):
    db = database["db"]
    User = database["tables"]["User"]
    Task = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route('/admin/api/fetchUsers', methods=['GET'])
    @login_required
    def fetch_users():
        user_id = current_user.user_id
        data = []
        active_users = []
        suspended_users = []
        user = User.query.filter_by(user_id = user_id, stat = True, admin = True).first() ## Authorization verification

        if not user:
            return jsonify({"error": "You are not an admin member"}), 401

        results = db.session.query(
            User.user_id,
            User.email,
            User.stat,
            User.created_at,
            User.updated_at
        ).filter(User.user_id != user_id, User.admin == False).all()

        if results:
            for result in results:
                user_tasks_count = db.session.query(Task).filter_by(user_id = result.user_id).count() #User total task number
                user_inactive_tasks_count = db.session.query(Task).filter_by(user_id = result.user_id, stat = False).count() #User total inactive task number
                user_active_tasks_count = db.session.query(Task).filter_by(user_id = result.user_id, stat = True).count() #User total active task number
                user_finished_tasks_count = db.session.query(Task).filter_by(finished = True, user_id = result.user_id).count() #User total finished task number
                user_finished_subtasks_count = (
                    db.session.query(Subtask)
                    .join(Task, Task.task_id == Subtask.task_id)
                    .filter(Subtask.finished == True, Task.user_id == result.user_id)
                    .count()
                ) #User total finished subtask number
                
                user_subtasks_count = (
                    db.session.query(Subtask)
                    .join(Task, Task.task_id == Subtask.task_id)
                    .filter(Task.user_id == result.user_id)
                    .count()) #User total subtask number

                user = {
                    "user_id": result.user_id,
                    "email": result.email,
                    "stat": result.stat,
                    "created_at": result.created_at,
                    "updated_at": result.updated_at,
                    "tasks_count": user_tasks_count,
                    "finished_tasks_count": user_finished_tasks_count,
                    "user_inactive_tasks_count": user_inactive_tasks_count,
                    "finished_subtasks_count": user_finished_subtasks_count,
                    "user_subtasks_count": user_subtasks_count,
                    "user_active_tasks_count": user_active_tasks_count
                }

                if user["stat"] == False:
                    suspended_users.append(user)
                    continue
    
                else:
                    active_users.append(user)

            tasks_count = db.session.query(Task).count()
            subtasks_count = db.session.query(Subtask).count()
            finished_subtasks_count = db.session.query(Subtask).filter_by(finished = True).count()
            finished_tasks_count = db.session.query(Task).filter_by(finished = True).count()
            inactive_task = db.session.query(Task).filter_by(stat = False).count()
            inactive_subtask = db.session.query(Subtask).filter_by(stat = False).count()
            total_users = db.session.query(User).count()
            total_admin = db.session.query(User).filter_by(admin = True).count()
            
            data = {
                "active_users": active_users,
                "suspended_users": suspended_users,
                "finished_subtask_count": finished_subtasks_count,
                "finished_tasks_count": finished_tasks_count,
                "total_task_count": tasks_count,
                "inactive_task": inactive_task,
                "inactive_subtask": inactive_subtask,
                "total_subtask_count": subtasks_count,
                "total_users": total_users,
                "total_admin": total_admin
            }

            return jsonify({
                "message": f"Users fetched successfully",
                "data": data
            }), 200
        
        return jsonify({
                "message": f"There are no users",
                "data": data
            }), 404