from flask import Flask, render_template, request, jsonify, Response
import mysql.connector
import pandas as pd
import csv
import io

app = Flask(__name__)

# Connect to MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOUR_MYSQL_PASSWORD",
        database="placement_db"
    )

# Home page
@app.route("/")
def home():
    return render_template("index.html")

# Get all students and placement status
@app.route("/api/students", methods=["GET"])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT s.student_id, s.name, s.department, s.cgpa,
                   s.graduation_year, s.skills,
                   p.company_name, p.package_lpa
            FROM students s
            LEFT JOIN placements p ON s.student_id = p.student_id
            ORDER BY s.student_id
        """)

        students = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(students)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Placement analytics
@app.route("/api/analytics", methods=["GET"])
def analytics():
    try:
        conn = get_db_connection()

        students_df = pd.read_sql(
            "SELECT * FROM students", conn
        )
        placements_df = pd.read_sql(
            "SELECT * FROM placements", conn
        )

        total_students = len(students_df)
        placed_students = placements_df["student_id"].nunique()
        unplaced_students = total_students - placed_students

        placement_rate = (
            round(placed_students / total_students * 100, 2)
            if total_students else 0
        )

        average_package = (
            round(float(placements_df["package_lpa"].mean()), 2)
            if not placements_df.empty else 0
        )

        department_stats = (
            students_df.groupby("department")
            .size()
            .to_dict()
        )

        company_stats = (
            placements_df.groupby("company_name")
            .size()
            .to_dict()
        )

        conn.close()

        return jsonify({
            "total_students": total_students,
            "placed_students": placed_students,
            "unplaced_students": unplaced_students,
            "placement_rate": placement_rate,
            "average_package": average_package,
            "department_stats": department_stats,
            "company_stats": company_stats
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a student
@app.route("/api/students", methods=["POST"])
def add_student():
    data = request.get_json()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO students
            (name, department, cgpa, graduation_year, skills)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["name"],
            data["department"],
            data.get("cgpa") or None,
            data.get("graduation_year") or None,
            data.get("skills", "")
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Student added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Export students to CSV
@app.route("/api/export")
def export_csv():
    try:
        conn = get_db_connection()

        df = pd.read_sql("""
            SELECT s.student_id, s.name, s.department, s.cgpa,
                   s.graduation_year, s.skills,
                   p.company_name, p.package_lpa
            FROM students s
            LEFT JOIN placements p ON s.student_id = p.student_id
        """, conn)

        conn.close()

        output = io.StringIO()
        df.to_csv(output, index=False)

        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={
                "Content-Disposition":
                "attachment; filename=placement_report.csv"
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)