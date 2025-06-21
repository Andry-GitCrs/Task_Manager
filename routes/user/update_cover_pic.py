import traceback, os
import uuid
from flask import jsonify, request, url_for, abort
from werkzeug.utils import secure_filename
from flask_login import current_user, login_required

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def update_cover_pic(app, database):
    db = database["db"]

    # 1) absolute directory where we really save files
    UPLOAD_DIR = os.path.join(app.root_path, "..\\static", "uploads", "profile")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    @app.route('/update_cover_pic', methods=['POST'])
    def update_cover_pic():
        # --------- validations ----------
        file = request.files.get("cover_pic")
        if file is None:
            return jsonify(error="No file part"), 400
        if file.filename == "":
            return jsonify(error="No file selected"), 400
        if not allowed_file(file.filename):
            return jsonify(error="Invalid file type"), 415

        # --------- unique filename ----------
        ext = os.path.splitext(secure_filename(file.filename))[1].lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"       # e.g. 9f316a2e0c3a4.jpg
        abs_path = os.path.join(UPLOAD_DIR, unique_name)

        # ----- save on disk -----
        try:
            file.save(abs_path)
        except Exception as e:
            print("file.save() raised:", e)

        # NEW: immediately verify with os.path.exists
        exists = os.path.exists(abs_path)
        if not exists:
            # stat() will raise -> we see exact reason
            try:
                os.stat(abs_path)
            except Exception as stat_err:
                print("⛔ os.stat() failure:", stat_err)
                traceback.print_exc()

        # --------- update DB ----------
        user = current_user
        if user is None:
            abort(401)
        user.cover_pic = unique_name      # store only the file name
        db.session.commit()

        # --------- respond with public URL ----------
        public_url = url_for("static", filename=f"uploads/profile/{unique_name}")
        return jsonify(message="Cover picture updated", cover_pic=public_url), 200