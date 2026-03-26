from datetime import datetime
import hashlib
import os

from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
    flash,
    get_flashed_messages
)
from flask_sqlalchemy import SQLAlchemy


BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config["SECRET_KEY"] = "suraj-portfolio-secret-key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "portfolio.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)


class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_hash = db.Column(db.String(64), nullable=False)
    page = db.Column(db.String(100), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class ProfileEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(500), nullable=False)  # Comma separated
    date = db.Column(db.String(100), nullable=False)
    dot = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    github_url = db.Column(db.String(500), nullable=True)
    view_url = db.Column(db.String(500), nullable=True)
    order = db.Column(db.Integer, default=0)


class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False) # LANGUAGES, ML_AI, TOOLS, DATABASES
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    order = db.Column(db.Integer, default=0)


class Education(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    meta = db.Column(db.String(200), nullable=True) # e.g. CGPA
    order = db.Column(db.Integer, default=0)


class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(200), nullable=False)
    date_range = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    points = db.Column(db.Text, nullable=False)  # Newline separated
    tags = db.Column(db.String(500), nullable=True) # Comma separated
    order = db.Column(db.Integer, default=0)


class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.String(10), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    badge = db.Column(db.String(50), nullable=False)
    order = db.Column(db.Integer, default=0)


class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    meta = db.Column(db.String(200), nullable=True)
    order = db.Column(db.Integer, default=0)


class CourseworkItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    order = db.Column(db.Integer, default=0)


def get_client_ip():
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    return request.remote_addr or "unknown"


def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


@app.before_request
def track_visit():
    # Track only main page visits to avoid noise
    if request.endpoint == "index" and request.method == "GET":
        ip = get_client_ip()
        ip_h = hash_ip(ip)
        visit = Visit(ip_hash=ip_h, page='/')
        db.session.add(visit)
        db.session.commit()


@app.context_processor
def inject_profile():
    entries = ProfileEntry.query.all()
    profile = {e.key: e.value for e in entries}
    return dict(profile=profile)


@app.route("/", methods=["GET"])
def index():
    visitor_count = Visit.query.count()
    education = Education.query.order_by(Education.order.asc()).all()
    experience = Experience.query.order_by(Experience.order.asc()).all()
    achievements = Achievement.query.order_by(Achievement.order.asc()).all()
    certifications = Certification.query.order_by(Certification.order.asc()).all()
    coursework = CourseworkItem.query.order_by(CourseworkItem.order.asc()).all()
    
    return render_template("index.html", 
                           visitor_count=visitor_count,
                           education=education, 
                           experience=experience, 
                           achievements=achievements,
                           certifications=certifications,
                           coursework=coursework)


@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or request.form
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message_text = (data.get("message") or "").strip()

    if not name or not email or not subject or not message_text:
        return jsonify({"success": False, "error": "All fields are required."}), 400

    msg = Message(
        name=name,
        email=email,
        subject=subject,
        message=message_text,
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({"success": True})


@app.route("/api/projects", methods=["GET"])
def api_projects():
    tag = (request.args.get("tag") or "").strip().upper()
    query = Project.query.order_by(Project.order.asc())
    
    all_projects = query.all()
    results = []
    for p in all_projects:
        # Convert tags string back to list for JSON response
        tags_list = [t.strip() for t in p.tags.split(",") if t.strip()]
        p_dict = {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "tags": tags_list,
            "date": p.date,
            "dot": p.dot,
            "category": p.category,
            "image_url": p.image_url,
            "github_url": p.github_url,
            "view_url": p.view_url
        }
        
        if not tag or tag == "ALL":
            results.append(p_dict)
        elif tag == p.category.upper() or tag in [t.upper() for t in tags_list]:
            results.append(p_dict)
            
    return jsonify(results)


@app.route("/api/skills", methods=["GET"])
def api_skills():
    skills = Skill.query.order_by(Skill.category, Skill.order.asc()).all()
    grouped = {}
    for s in skills:
        if s.category not in grouped:
            grouped[s.category] = []
        grouped[s.category].append({"id": s.id, "name": s.name, "level": s.level})
    return jsonify(grouped)


@app.route("/api/visitor", methods=["GET"])
def api_visitor():
    count = Visit.query.count()
    return jsonify({"count": count})


def is_admin_logged_in() -> bool:
    return session.get("admin_auth") is True


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password")
        if password == "suraj2025":
            session["admin_auth"] = True
            return redirect(url_for("admin"))
        else:
            return redirect(url_for("admin_login", error=1))

    # GET request
    error_msg = "Invalid password" if request.args.get("error") == "1" else None
    return render_template("admin.html", logged_in=False, error=error_msg)


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_auth", None)
    return redirect(url_for("admin"))


@app.route("/admin", methods=["GET", "POST"])
def admin():
    if not is_admin_logged_in():
        return redirect(url_for("admin_login"))

    messages = Message.query.order_by(Message.timestamp.desc()).all()
    profile_entries = ProfileEntry.query.all()
    projects = Project.query.order_by(Project.order.asc()).all()
    skills = Skill.query.order_by(Skill.category, Skill.order.asc()).all()
    education = Education.query.order_by(Education.order.asc()).all()
    experience = Experience.query.order_by(Experience.order.asc()).all()
    achievements = Achievement.query.order_by(Achievement.order.asc()).all()
    certifications = Certification.query.order_by(Certification.order.asc()).all()
    coursework = CourseworkItem.query.order_by(CourseworkItem.order.asc()).all()

    return render_template("admin.html", 
                           logged_in=True, 
                           messages=messages,
                           profile_entries=profile_entries,
                           projects=projects,
                           skills=skills,
                           education=education,
                           experience=experience,
                           achievements=achievements,
                           certifications=certifications,
                           coursework=coursework)


# CRUD - Profile
@app.route("/admin/profile/update", methods=["POST"])
def admin_profile_update():
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    
    key = request.form.get("key")
    value = request.form.get("value")
    entry = ProfileEntry.query.filter_by(key=key).first()
    if entry:
        entry.value = value
        db.session.commit()
        return redirect(url_for('admin'))
    return "Key not found", 404


# CRUD - Messages
@app.route("/admin/message/<int:id>", methods=["GET"])
def admin_message_view(id: int):
    if not is_admin_logged_in():
        return redirect(url_for("admin_login"))
    m = Message.query.get_or_404(id)
    if not m.read:
        m.read = True
        db.session.commit()
    return render_template("message.html", message=m, logged_in=True)


@app.route("/admin/message/<int:id>/read", methods=["POST"])
def admin_messages_read(id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    m = Message.query.get_or_404(id)
    m.read = not m.read
    db.session.commit()
    return jsonify({"success": True, "read": m.read})


@app.route("/admin/message/<int:id>/delete", methods=["POST"])
def admin_messages_delete(id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    m = Message.query.get_or_404(id)
    db.session.delete(m)
    db.session.commit()
    flash("Message deleted successfully", "success")
    return redirect(url_for('admin'))


@app.route("/admin/bulk-action", methods=["POST"])
def admin_bulk_action():
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    data = request.get_json()
    if not data:
        return jsonify({"success": False}), 400
    
    action = data.get("action")
    ids = data.get("ids", [])
    
    if not ids:
        return jsonify({"success": False, "error": "No ids provided"}), 400

    if action == "read":
        Message.query.filter(Message.id.in_(ids)).update({Message.read: True}, synchronize_session=False)
    elif action == "unread":
        Message.query.filter(Message.id.in_(ids)).update({Message.read: False}, synchronize_session=False)
    elif action == "delete":
        Message.query.filter(Message.id.in_(ids)).delete(synchronize_session=False)
    else:
        return jsonify({"success": False, "error": "Invalid action"}), 400
        
    db.session.commit()
    return jsonify({"success": True, "affected": len(ids)})


# CRUD - Projects
@app.route("/admin/projects/add", methods=["POST"])
def admin_projects_add():
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    
    new_p = Project(
        name=request.form.get("name"),
        description=request.form.get("description"),
        tags=request.form.get("tags"),
        date=request.form.get("date"),
        dot=request.form.get("dot", "white"),
        category=request.form.get("category"),
        github_url=request.form.get("github_url"),
        view_url=request.form.get("view_url"),
        order=int(request.form.get("order", 0))
    )
    db.session.add(new_p)
    db.session.commit()
    return redirect(url_for('admin'))


@app.route("/admin/projects/<int:id>/delete", methods=["POST"])
def admin_projects_delete(id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    p = Project.query.get_or_404(id)
    db.session.delete(p)
    db.session.commit()
    flash("Project deleted successfully", "success")
    return redirect(url_for('admin'))


@app.route("/admin/projects/<int:id>/edit", methods=["GET", "POST"])
def admin_projects_edit(id: int):
    if not is_admin_logged_in():
        return redirect(url_for("admin_login"))
    p = Project.query.get_or_404(id)
    if request.method == "POST":
        p.name = request.form.get("name")
        p.description = request.form.get("description")
        p.tags = request.form.get("tags")
        p.date = request.form.get("date")
        p.category = request.form.get("category")
        p.dot = request.form.get("dot")
        p.github_url = request.form.get("github_url")
        p.view_url = request.form.get("view_url")
        try:
            p.order = int(request.form.get("order", 0))
        except:
            pass
        db.session.commit()
        return redirect(url_for('admin'))
    return render_template("admin_edit_project.html", p=p)


# CRUD - Skills
@app.route("/admin/skills/add", methods=["POST"])
def admin_skills_add():
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    
    new_s = Skill(
        category=request.form.get("category"),
        name=request.form.get("name"),
        level=int(request.form.get("level")),
        order=int(request.form.get("order", 0))
    )
    db.session.add(new_s)
    db.session.commit()
    return redirect(url_for('admin'))


@app.route("/admin/skills/<int:id>/edit", methods=["POST"])
def admin_skills_edit(id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    s = Skill.query.get_or_404(id)
    s.name = request.form.get("name", s.name)
    s.category = request.form.get("category", s.category)
    try:
        s.level = int(request.form.get("level", s.level))
        s.order = int(request.form.get("order", s.order))
    except ValueError:
        pass
    db.session.commit()
    return jsonify({"success": True})


@app.route("/admin/skills/<int:id>/delete", methods=["POST"])
def admin_skills_delete(id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    s = Skill.query.get_or_404(id)
    db.session.delete(s)
    db.session.commit()
    flash("Skill deleted successfully", "success")
    return redirect(url_for('admin'))


# CRUD - Education, Experience, Achievements, Certs, etc. (Generic delete for brevity)
@app.route("/admin/<string:model_type>/<int:item_id>/delete", methods=["POST"])
def admin_generic_delete(model_type: str, item_id: int):
    if not is_admin_logged_in():
        return jsonify({"success": False}), 403
    
    model_map = {
        "education": Education,
        "experience": Experience,
        "achievement": Achievement,
        "certification": Certification,
        "coursework": CourseworkItem
    }
    
    model = model_map.get(model_type)
    if not model:
        return "Invalid model", 400
    
    item = model.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    flash(f"{model_type.capitalize()} deleted successfully", "success")
    return redirect(url_for('admin'))

@app.route("/admin/<string:model_type>/<int:item_id>/edit", methods=["GET", "POST"])
def admin_generic_edit(model_type: str, item_id: int):
    if not is_admin_logged_in():
        return redirect(url_for("admin_login"))
        
    model_map = {
        "skill": Skill,
        "education": Education,
        "experience": Experience,
        "achievement": Achievement,
        "certification": Certification,
        "coursework": CourseworkItem
    }
    
    model = model_map.get(model_type)
    if not model:
        return "Invalid model", 400
        
    item = model.query.get_or_404(item_id)
    
    if request.method == "POST":
        if model_type == "skill":
            item.name = request.form.get("name")
            item.category = request.form.get("category")
            try: item.level = int(request.form.get("level", 0))
            except: pass
        elif model_type == "education":
            item.year = request.form.get("year")
            item.title = request.form.get("title")
            item.institution = request.form.get("institution")
            item.meta = request.form.get("meta")
        elif model_type == "experience":
            item.company = request.form.get("company")
            item.role = request.form.get("role")
            item.date_range = request.form.get("date_range")
            item.location = request.form.get("location")
            item.points = request.form.get("points")
            item.tags = request.form.get("tags")
        elif model_type == "achievement":
            item.num = request.form.get("num")
            item.badge = request.form.get("badge")
            item.text = request.form.get("text")
        elif model_type == "certification":
            item.title = request.form.get("title")
            item.meta = request.form.get("meta")
            item.text = request.form.get("text")
        elif model_type == "coursework":
            item.name = request.form.get("name")
            
        try: item.order = int(request.form.get("order", 0))
        except: pass
        
        db.session.commit()
        return redirect(url_for("admin"))
        
    return render_template("admin_edit_generic.html", item=item, model_type=model_type)

# Add routes for adding other items
@app.route("/admin/education/add", methods=["POST"])
def admin_education_add():
    if not is_admin_logged_in(): return redirect(url_for('admin'))
    db.session.add(Education(
        year=request.form.get("year"),
        title=request.form.get("title"),
        institution=request.form.get("institution"),
        meta=request.form.get("meta"),
        order=int(request.form.get("order", 0))
    ))
    db.session.commit()
    return redirect(url_for('admin'))

@app.route("/admin/experience/add", methods=["POST"])
def admin_experience_add():
    if not is_admin_logged_in(): return redirect(url_for('admin'))
    db.session.add(Experience(
        company=request.form.get("company"),
        date_range=request.form.get("date_range"),
        role=request.form.get("role"),
        location=request.form.get("location"),
        points=request.form.get("points"),
        tags=request.form.get("tags"),
        order=int(request.form.get("order", 0))
    ))
    db.session.commit()
    return redirect(url_for('admin'))

@app.route("/admin/achievement/add", methods=["POST"])
def admin_achievement_add():
    if not is_admin_logged_in(): return redirect(url_for('admin'))
    db.session.add(Achievement(
        num=request.form.get("num"),
        text=request.form.get("text"),
        badge=request.form.get("badge"),
        order=int(request.form.get("order", 0))
    ))
    db.session.commit()
    return redirect(url_for('admin'))

@app.route("/admin/certification/add", methods=["POST"])
def admin_certification_add():
    if not is_admin_logged_in(): return redirect(url_for('admin'))
    db.session.add(Certification(
        title=request.form.get("title"),
        text=request.form.get("text"),
        meta=request.form.get("meta"),
        order=int(request.form.get("order", 0))
    ))
    db.session.commit()
    return redirect(url_for('admin'))

@app.route("/admin/coursework/add", methods=["POST"])
def admin_coursework_add():
    if not is_admin_logged_in(): return redirect(url_for('admin'))
    db.session.add(CourseworkItem(
        name=request.form.get("name"),
        order=int(request.form.get("order", 0))
    ))
    db.session.commit()
    return redirect(url_for('admin'))

with app.app_context():
    db.create_all()

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
