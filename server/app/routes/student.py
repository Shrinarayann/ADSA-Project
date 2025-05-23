from flask import Blueprint, request, jsonify
from ..models import Student, Course
from ..utils import auth_utils
from ..controllers.run_scheduler1 import display_student_schedule

student_bp = Blueprint("student", __name__)

@student_bp.route('/student/add', methods=['POST'])
def add_students():
    data = request.get_json()
    print(data)
    if "Student" not in data:
        return jsonify({"error": "Missing 'Student' key"}), 400
    
    student_data=data['Student']
    try:
        # Create the student object without saving yet
        student = Student(
            student_id=student_data['student_id'],
            name=student_data["name"],
            email=student_data["email"],
            major=student_data["major"],
            year=int(student_data['year']),
        )
            
        #Hash password
        student.hash_password(student_data['password'])
        # Save the student to the database
        student.save()

        return jsonify({
        "Status": "Success"
    }), 201
        
    except Exception as e:
        print("Error:", e)
        return jsonify({
            "status": "fail",
            "message": f"Could not add student: {str(e)}"
        }), 400

    

@student_bp.route('/student/all', methods=['GET'])
def get_all_students():
    try:
        students = Student.objects.all()
        result = []

        for student in students:
            student_data = {
                "id": student.student_id,
                "name": student.name,
                "email": student.email,
                "department": student.major,
                "year": str(student.year),  # sending as string to match mock data
                "courses": [course.course_code for course in student.enrolled_courses] if student.enrolled_courses else []
            }
            result.append(student_data)
        
        print(result)
        return jsonify(result), 200

    except Exception as e:
        # Log the exception to get more details
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


@student_bp.route('/student/courses', methods=['PATCH'])
def enroll_courses():
    data = request.get_json()
    course_ids = data.get("course_ids", [])

    if not course_ids:
        return jsonify({"error": "No course_ids provided"}), 400

    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing or invalid token"}), 401
    token = auth_header.split(" ")[1]
    student_id=auth_utils.decode_auth_token(token)

    student=Student.objects(student_id=student_id).first()
        

    enrolled_courses = []
    for code in course_ids:
        course = Course.objects(course_code=code).first()
        if course:
            enrolled_courses.append(course)
        else:
            return jsonify({"error": f"Course with code '{code}' not found"}), 404

    # Append new courses only if they aren't already enrolled
    for course in enrolled_courses:
        if course not in student.enrolled_courses:
            student.enrolled_courses.append(course)

    student.save()

    return jsonify({
        "message": f"Enrolled in {len(enrolled_courses)} course(s).",
        "student_id": student.student_id,
        "enrolled_courses": [c.course_code for c in student.enrolled_courses]
    }), 200


@student_bp.route('/student/schedule', methods=['GET'])
def view_student_schedule():
    """API endpoint for students to view their schedule"""
    # Get token from authorization header
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing or invalid token"}), 401
    
    token = auth_header.split(" ")[1]
    
    # Decode the token to get the student_id
    student_id = auth_utils.decode_auth_token(token)
    
    if not student_id:
        return jsonify({"message": "Invalid or expired token"}), 401
    
    # Retrieve and display the student's schedule
    student_schedule = display_student_schedule(student_id)
    
    if student_schedule is None:
        return jsonify({"message": "Student schedule not found"}), 404
    
    return jsonify(student_schedule), 200


@student_bp.route('/student/me', methods=['GET'])
def get_logged_in_student():
    """API endpoint to get details of the currently logged-in student"""
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    student_id = auth_utils.decode_auth_token(token)

    if not student_id:
        return jsonify({"message": "Invalid or expired token"}), 401

    student = Student.objects(student_id=student_id).first()

    if not student:
        return jsonify({"message": "Student not found"}), 404

    # Serialize enrolled courses
    enrolled_courses = [
        {
            "code": course.course_code,
            "name": course.name,
            "credits": course.lecture_hours
        }
        for course in student.enrolled_courses
    ]

    return jsonify({
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "year": student.year,
        "major": student.major,
        "enrolled_courses": enrolled_courses
    }), 200



@student_bp.route('/student/me/courses', methods=['GET'])
def get_enrolled_courses_for_student():
    """API endpoint to get enrolled courses of the currently logged-in student"""
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    student_id = auth_utils.decode_auth_token(token)

    if not student_id:
        return jsonify({"message": "Invalid or expired token"}), 401

    student = Student.objects(student_id=student_id).first()

    if not student:
        return jsonify({"message": "Student not found"}), 404

    # Serialize only the enrolled courses
    enrolled_courses = [ course.course_code for course in student.enrolled_courses]

    return jsonify({'length':len(enrolled_courses),'enrolled_courses': enrolled_courses}), 200
