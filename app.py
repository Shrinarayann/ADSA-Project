from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mongoengine import MongoEngine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection settings
app.config['MONGODB_SETTINGS'] = {
    'host': os.environ.get('MONGODB_URI', 'mongodb+srv://shrinarayann2005:pass123@logisticscluster.37viq2g.mongodb.net/?retryWrites=true&w=majority&appName=LogisticsCluster')
}

# Initialize MongoEngine
db = MongoEngine(app)

# Define MongoDB document models
class Course(db.Document):
    course_id = db.StringField(required=True, unique=True)
    course_name = db.StringField(required=True)
    credits = db.IntField(required=True)
    
    meta = {'collection': 'courses'}
    
    def to_json(self):
        return {
            "_id": str(self.id),
            "course_id": self.course_id,
            "course_name": self.course_name,
            "credits": self.credits
        }

class Student(db.Document):
    student_id = db.StringField(required=True, unique=True)
    name = db.StringField(required=True)
    email = db.StringField(required=True, unique=True)
    password = db.StringField(required=True)
    major = db.StringField(required=True)
    year = db.IntField(required=True)
    enrolled_courses = db.ListField(db.ReferenceField(Course), default=[])
    
    meta = {'collection': 'students'}
    
    def to_json(self):
        enrolled_courses_ids = [str(course.id) for course in self.enrolled_courses]
        course_names = []
        
        # Get course names from references
        if self.enrolled_courses:
            for course in self.enrolled_courses:
                course_names.append(course.course_name)
        
        return {
            "_id": str(self.id),
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "major": self.major,
            "year": self.year,
            "enrolled_courses": enrolled_courses_ids,
            "course_names": course_names
        }


@app.route('/', methods=['GET'])
def home():
    logger.info("Home endpoint accessed")
    return "Flask server is running!"

@app.route('/api/test', methods=['GET'])
def test():
    logger.info("Test endpoint accessed")
    return jsonify({"message": "API is working"})

# @app.route('/api/v1/student/add', methods=['POST'])
# def add_student():
#     logger.info("Add student endpoint accessed")
#     logger.debug(f"Request data: {request.get_data()}")

#     try:
#         data = request.json
#         logger.info(f"Processed JSON data: {data}")

#         student_id = data['student_id']
#         name = data['name']
#         email = data['email']
#         password = data['password']
#         confirm_password = data['confirm_password']
#         year = data['year']
#         department = data['department']

#         if password != confirm_password:
#             return jsonify({"error": "Passwords do not match"}), 400

#         # Hash the password
#         hashed_password = generate_password_hash(password)

#         # Create the student object
#         student = {
#             "student_id": student_id,
#             "name": name,
#             "email": email,
#             "hashed_password": hashed_password,
#             "department": department,
#             "year": year
#         }

#         return jsonify(student), 201

#     except Exception as e:
#         logger.error(f"Error processing request: {e}")
#         return jsonify({"error": str(e)}), 400

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        # For MongoEngine, we can check connection by accessing the underlying PyMongo client
        logger.info("Testing MongoDB connection")
        # Get the PyMongo client from MongoEngine
        mongo_client = db.get_connection()
        db_names = mongo_client.list_database_names()
        return jsonify({"message": "Database connection successful", "databases": db_names}), 200
    except Exception as e:
        import traceback
        logger.error(f"Database connection error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/students', methods=['GET'])
def get_students():
    logger.info("Fetching all students")
    try:
        logger.info("Attempting to connect to MongoDB")
        students = Student.objects.all()
        logger.info(f"Retrieved {len(students)} students")
        return jsonify([student.to_json() for student in students]), 200
    except Exception as e:
        logger.error(f"Error fetching students: {e}")
        # Print more detailed exception info
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/student/<student_id>', methods=['GET'])
def get_student(student_id):
    logger.info(f"Fetching student with ID: {student_id}")
    try:
        student = Student.objects(student_id=student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        return jsonify(student.to_json()), 200
    except Exception as e:
        logger.error(f"Error fetching student: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/student/add', methods=['POST'])
def add_student():
    logger.info("Add student endpoint accessed")
    logger.debug(f"Request data: {request.get_data()}")

    try:
        data = request.json
        logger.info(f"Processed JSON data: {data}")

        student_id = data.get('student_id')
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        year = int(data.get('year'))
        department = data.get('department')  # This will be stored as major

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        # Check if student_id or email already exists
        if Student.objects(student_id=student_id).first():
            return jsonify({"error": "Student ID already exists"}), 400
        
        if Student.objects(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create new student
        new_student = Student(
            student_id=student_id,
            name=name,
            email=email,
            password=hashed_password,
            major=department,
            year=year
        )
        new_student.save()
        
        return jsonify(new_student.to_json()), 201

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/v1/student/update/<student_id>', methods=['PUT'])
def update_student(student_id):
    logger.info(f"Update student endpoint accessed for ID: {student_id}")
    logger.debug(f"Request data: {request.get_data()}")
    
    try:
        data = request.json
        logger.info(f"Processed JSON data: {data}")
        
        # Find the student
        student = Student.objects(student_id=student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Update fields if provided
        if 'name' in data:
            student.name = data['name']
        if 'email' in data:
            # Check if email already exists for another student
            existing = Student.objects(email=data['email']).first()
            if existing and existing.student_id != student_id:
                return jsonify({"error": "Email already in use by another student"}), 400
            student.email = data['email']
        if 'department' in data:
            student.major = data['department']
        if 'year' in data:
            student.year = int(data['year'])
        if 'password' in data and data['password']:
            # Only update password if it's provided
            if data['password'] != data.get('confirm_password', ''):
                return jsonify({"error": "Passwords do not match"}), 400
            student.password = generate_password_hash(data['password'])
        
        student.save()
        return jsonify(student.to_json()), 200
        
    except Exception as e:
        logger.error(f"Error updating student: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/v1/student/delete/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    logger.info(f"Delete student endpoint accessed for ID: {student_id}")
    
    try:
        # Find the student
        student = Student.objects(student_id=student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Delete the student
        student.delete()
        return jsonify({"message": f"Student {student_id} deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting student: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/v1/courses', methods=['GET'])
def get_courses():
    logger.info("Fetching all courses")
    try:
        courses = Course.objects.all()
        return jsonify([course.to_json() for course in courses]), 200
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        return jsonify({"error": str(e)}), 500




@app.route('/api/v1/course/add', methods=['POST'])
def add_course():
    logger.info("Add course endpoint accessed")
    logger.debug(f"Request data: {request.get_data()}")
    
    try:
        data = request.json
        logger.info(f"Processed JSON data: {data}")
        
        # Check for missing fields
        if not data.get('course_id') or not data.get('course_name') or not data.get('credits'):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Returning data as JSON
        return jsonify({
            "course_id": data["course_id"],
            "course_name": data["course_name"],
            "credits": data["credits"]
        }), 201
    
    except Exception as e:
        logger.error(f"Error processing course data: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/v1/teacher/add', methods=['POST'])
def register_faculty():
    logger.info("Register faculty endpoint accessed")
    logger.debug(f"Request data (raw): {request.get_data()}")
    
    try:
        if request.is_json:
            data = request.get_json()
            logger.info(f"Processed JSON data: {data}")
            print("FACULTY DATA RECEIVED:", data)
            
            # Extract the data fields
            teacher_id = data.get('teacher_id')
            name = data.get('name')
            email = data.get('email')
            department = data.get('department')
            teachable_courses = data.get('teachable_courses', [])
            
            # Validate required fields
            if not all([teacher_id, name, email, department]):
                return jsonify({"error": "Missing required fields"}), 400
                
            # Format the response in the desired structure
            faculty_data = {
                "teacher_id": teacher_id,
                "name": name,
                "email": email,
                "department": department,
                "teachable_courses": teachable_courses
            }
            
            # Return the structured data
            return jsonify(faculty_data), 201
        else:
            logger.error("Request content is not JSON")
            return jsonify({"error": "Content-type must be application/json"}), 400
    except Exception as e:
        logger.error(f"Error processing faculty data: {e}")
        return jsonify({"error": f"Error: {str(e)}"}), 400


@app.route('/api/v1/room/add', methods=['POST'])
def add_classroom():
    logger.info("Add classroom endpoint accessed")
    logger.debug(f"Request data: {request.get_data()}")
    
    try:
        if request.is_json:
            data = request.get_json()
            logger.info(f"Processed JSON data: {data}")
            
            # Extract the data fields
            room_id = data.get('room_id')
            capacity = data.get('capacity')
            
            # Validate required fields
            if not room_id or not capacity:
                return jsonify({"error": "Missing required fields"}), 400
                
            try:
                # Ensure capacity is an integer
                capacity = int(capacity)
            except (ValueError, TypeError):
                return jsonify({"error": "Capacity must be a valid number"}), 400
                
            # Format the response in the desired structure
            room_data = {
                "room_id": room_id,
                "capacity": capacity
            }
            
            # Here you would normally save to a database
            print(f"(room_id=\"{room_id}\", capacity={capacity})")
            
            # Return the structured data
            return jsonify(room_data), 201
        else:
            logger.error("Request content is not JSON")
            return jsonify({"error": "Content-type must be application/json"}), 400
    except Exception as e:
        logger.error(f"Error processing classroom data: {e}")
        return jsonify({"error": f"Error: {str(e)}"}), 400

@app.route('/api/v1/scholar/add', methods=['POST'])
def add_scholar():
    logger.info("Add research scholar endpoint accessed")
    logger.debug(f"Request data: {request.get_data()}")
    
    try:
        data = request.json
        logger.info(f"Processed JSON data: {data}")
        
        # Check for missing required fields
        if not data.get('scholar_id') or not data.get('name'):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Format as specified
        scholar_data = {
            "scholar_id": data.get('scholar_id'),
            "name": data.get('name'),
            "TA_courses": data.get('TA_courses', ''),
            "supervisor_id": data.get('supervisor_id', '')
        }
        
        # Log the formatted tuple representation
        logger.info(f"(scholar_id=\"{scholar_data['scholar_id']}\", name=\"{scholar_data['name']}\", TA_courses=\"{scholar_data['TA_courses']}\", supervisor_id=\"{scholar_data['supervisor_id']}\")")
        
        # Return data as JSON
        return jsonify(scholar_data), 201
    
    except Exception as e:
        logger.error(f"Error processing scholar data: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # logger.info("Starting Flask server on port 8000")
    app.run(host='0.0.0.0', port=8000, debug=True)