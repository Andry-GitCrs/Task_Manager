from flask import abort, jsonify
from flask_login import current_user, login_required
from collections import defaultdict
from sqlalchemy.orm import joinedload   # <-- eager loading helper


def logs(app, database):
    db      = database["db"]
    User    = database["tables"]["User"]
    Task    = database["tables"]["Task"]
    Subtask = database["tables"]["Subtask"]

    @app.route("/api/admin/logs", methods=["GET"])
    @login_required
    def get_logs():

        if not current_user.admin or not current_user.stat:
            abort(404)
        task_logs = (
            db.session.query(Task)
            .options(joinedload(Task.user))                # Task → User
            .order_by(Task.updated_at.desc())
            .limit(5)
            .all()
        )

        subtask_logs = (
            db.session.query(Subtask)
            .options(                                       # Subtask → Task → User
                joinedload(Subtask.task).joinedload(Task.user)
            )
            .order_by(Subtask.updated_at.desc())
            .limit(5)
            .all()
        )

        user_logs = (
            db.session.query(User)
            .order_by(User.updated_at.desc())
            .limit(5)
            .all()
        )

        # ── 2. helper to group lists by date ───────────────────────────────────
        def group_by_date(logs, builder):
            box = defaultdict(list)
            for row in logs:
                key = row.updated_at.strftime("%d %B %Y") if row.updated_at else "Unknown"
                box[key].append(builder(row))
            return dict(box)

        # ── 3. build payloads ──────────────────────────────────────────────────
        task_data = group_by_date(
            task_logs,
            lambda t: {
                "task_id":   t.task_id,
                "task_title": t.task_title,
                "updated_at": t.updated_at.strftime("%I:%M %p") if t.updated_at else None,
                "owner": {
                    "user_id": t.user.user_id,
                    "email":   t.user.email
                } if t.user else None
            },
        )

        subtask_data = group_by_date(
            subtask_logs,
            lambda s: {
                "subtask_id":    s.subtask_id,
                "subtask_title": s.subtask_title,
                "finished":      s.finished,
                "updated_at":    s.updated_at.strftime("%I:%M %p") if s.updated_at else None,
                "parent_task": {
                    "task_id":    s.task.task_id,
                    "task_title": s.task.task_title,
                    "owner": {
                        "user_id": s.task.user.user_id,
                        "email":   s.task.user.email,
                    } if s.task and s.task.user else None,
                } if s.task else None,
            },
        )

        user_data = group_by_date(
            user_logs,
            lambda u: {
                "user_id":   u.user_id,
                "email":     u.email,
                "updated_at": u.updated_at.strftime("%I:%M %p") if u.updated_at else None,
            },
        )

        # ── 4. respond ─────────────────────────────────────────────────────────
        return (
            jsonify(
                {
                    "message": "Logs",
                    "data": {
                        "subtask": subtask_data,
                        "task":    task_data,
                        "user":    user_data,
                    },
                }
            ),
            200,
        )
