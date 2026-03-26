from app import app, db, ProfileEntry, Project, Skill, Education, Experience, Achievement, Certification, CourseworkItem

def migrate():
    with app.app_context():
        # Create tables
        db.create_all()

        # 1. Profile Entries
        profile_data = {
            "name": "SURAJ KUMAR",
            "role": "B.Tech AI & Data Science Engineer",
            "bio_hero": "Building intelligent systems and crafting digital experiences from Chennai.",
            "bio_about_1": "Hey. I'm Suraj Kumar, a 3rd-year B.Tech student in Artificial Intelligence and Data Science at Sri Sairam Institute of Technology, Chennai.",
            "bio_about_2": "I build ML models, chatbots, web apps, and DevOps pipelines. I enjoy working at the intersection of AI and good design.",
            "stat_proj": "5",
            "stat_inter": "2",
            "stat_cgpa": "7.73",
            "stat_award": "4",
            "github": "https://github.com/Sforsuraj",
            "linkedin": "https://www.linkedin.com/in/suraj-kumar-370317295",
            "email": "surajsharma.748863@gmail.com",
            "phone": "+91 7261857290",
            "location": "Chennai, Tamil Nadu, India",
            "about_batch": "2023-2027",
            "about_college": "Sri Sairam IT",
            "about_location": "Chennai, TN"
        }

        for key, value in profile_data.items():
            if not ProfileEntry.query.filter_by(key=key).first():
                db.session.add(ProfileEntry(key=key, value=value))

        # 2. Projects (from app.py)
        projects = [
            {
                "name": "Chatbot Using NLP",
                "description": "NLP-powered chatbot with intent detection and contextual responses, deployed with a clean web interface.",
                "tags": "PYTHON, NLTK, SPACY, STREAMLIT, ML",
                "date": "Mar 2025",
                "dot": "green",
                "category": "ML",
            },
            {
                "name": "Event Website",
                "description": "Responsive event landing page with schedule, speakers, and registration flow.",
                "tags": "HTML, CSS, JAVASCRIPT, WEB",
                "date": "Oct 2024",
                "dot": "cyan",
                "category": "WEB",
            },
            {
                "name": "Ecommerce Website",
                "description": "Full-stack ecommerce platform built with Django and MySQL, including cart and checkout.",
                "tags": "DJANGO, PYTHON, MYSQL, WEB",
                "date": "May 2024",
                "dot": "amber",
                "category": "WEB",
            },
            {
                "name": "Quiz Website",
                "description": "Interactive quiz portal with timer, scoring, and admin question management.",
                "tags": "HTML, CSS, JAVASCRIPT, PHP",
                "date": "Jun 2023",
                "dot": "green",
                "category": "WEB",
            },
            {
                "name": "School Management System",
                "description": "Desktop application for managing students, classes, and attendance using Tkinter and MySQL.",
                "tags": "PYTHON, TKINTER, MYSQL",
                "date": "Nov 2022",
                "dot": "cyan",
                "category": "DATABASE",
            },
            {
                "name": "Open Source (GitHub)",
                "description": "Continual contributions to open-source projects and personal tooling on GitHub.",
                "tags": "GIT, OPEN SOURCE",
                "date": "Ongoing",
                "dot": "white",
                "category": "PYTHON",
            },
        ]
        for i, p in enumerate(projects):
            if not Project.query.filter_by(name=p["name"]).first():
                db.session.add(Project(order=i, **p))

        # 3. Skills (from app.py)
        skills_raw = {
            "LANGUAGES": [
                {"name": "Python", "level": 90},
                {"name": "HTML / CSS", "level": 90},
                {"name": "JavaScript", "level": 80},
                {"name": "C / C++", "level": 80},
                {"name": "Java", "level": 70},
            ],
            "ML_AI": [
                {"name": "NumPy", "level": 85},
                {"name": "pandas", "level": 85},
                {"name": "scikit-learn", "level": 75},
                {"name": "NLTK / spaCy", "level": 70},
            ],
            "TOOLS": [
                {"name": "Git / GitHub", "level": 90},
                {"name": "VS Code", "level": 95},
                {"name": "Jupyter", "level": 85},
                {"name": "Google Colab", "level": 85},
            ],
            "DATABASES": [
                {"name": "MySQL", "level": 80},
                {"name": "SQL", "level": 80},
                {"name": "ELK Stack", "level": 60},
            ],
        }
        for cat, items in skills_raw.items():
            for i, item in enumerate(items):
                if not Skill.query.filter_by(name=item["name"], category=cat).first():
                    db.session.add(Skill(category=cat, name=item["name"], level=item["level"], order=i))

        # 4. Education
        education = [
            {
                "year": "2023 — 2027",
                "title": "B.Tech AI & Data Science",
                "institution": "Sri Sairam Institute of Technology",
                "meta": "CGPA: 7.73"
            },
            {
                "year": "2021 — 2023",
                "title": "12th Grade — CBSE",
                "institution": "Thamarai International School",
                "meta": "Percentage: 74.5%"
            }
        ]
        for i, e in enumerate(education):
            if not Education.query.filter_by(title=e["title"], year=e["year"]).first():
                db.session.add(Education(order=i, **e))

        # 5. Experience
        experience = [
            {
                "company": "VECTRA TECHNOSOFT PVT LTD",
                "date_range": "Jun 2025 – Jul 2025",
                "role": "DevOps & Cloud Infrastructure Intern",
                "location": "Chennai, Tamil Nadu",
                "points": "Built real-time log monitoring dashboards\nWorked with Elasticsearch, Logstash, Kibana, Filebeat\nOptimized pipelines and secured the ELK stack",
                "tags": "ELK Stack, Elasticsearch, Kibana, Linux, DevOps"
            },
            {
                "company": "EDUNET FOUNDATION",
                "date_range": "Feb 2025 – Mar 2025",
                "role": "AI & Data Analytics Intern",
                "location": "Bengaluru, Karnataka",
                "points": "Built NLP chatbot using Python, NLTK, spaCy\nImplemented intent detection and contextual understanding\nDeployed chatbot with interactive user interface",
                "tags": "Python, NLTK, spaCy, NLP, Streamlit"
            }
        ]
        for i, ex in enumerate(experience):
            if not Experience.query.filter_by(company=ex["company"], role=ex["role"]).first():
                db.session.add(Experience(order=i, **ex))

        # 6. Achievements
        achievements = [
            {"num": "01", "text": "1st Prize — IEEE YESIST Event", "badge": "badge-gold"},
            {"num": "02", "text": "1st Prize — QTuxathon 24Hr Hackathon", "badge": "badge-gold"},
            {"num": "03", "text": "RHCSA Certification — Red Hat Global", "badge": "badge-cert"},
            {"num": "04", "text": "Appreciation — Top Rank Skillrack", "badge": "badge-award"},
            {"num": "05", "text": "Technical Volunteer — Dept. Symposium", "badge": "badge-vol"},
            {"num": "06", "text": "Volunteer — IEEE TechX Madras 48Hr", "badge": "badge-vol"},
            {"num": "07", "text": "Ambassador — IEEE Xtreme Global", "badge": "badge-amb"},
        ]
        for i, a in enumerate(achievements):
            if not Achievement.query.filter_by(text=a["text"]).first():
                db.session.add(Achievement(order=i, **a))

        # 7. Certifications
        certs = [
            {"title": "RHCSA", "text": "Red Hat Certified System Administrator", "meta": "Global Level | 2024"}
        ]
        for i, c in enumerate(certs):
            if not Certification.query.filter_by(title=c["title"]).first():
                db.session.add(Certification(order=i, **c))

        # 8. Coursework
        coursework = [
            "Data Structures & Algorithms", "Operating Systems", "Object Oriented Programming",
            "Database Management System", "Software Engineering", "Machine Learning", "Computer Networks"
        ]
        for i, name in enumerate(coursework):
            if not CourseworkItem.query.filter_by(name=name).first():
                db.session.add(CourseworkItem(order=i, name=name))

        db.session.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
