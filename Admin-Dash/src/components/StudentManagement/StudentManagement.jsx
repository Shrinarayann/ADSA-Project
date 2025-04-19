import React, { useState, useEffect } from 'react';
import './StudentManagement.css';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  
  // For adding/editing student modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    id: null,
    student_id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    department: '',
    courses: []
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch students from API on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch students from the API
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
      // Map the MongoDB structure to our component structure
      const formattedStudents = data.map(student => ({
        id: student._id, // Use MongoDB _id as our id
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        year: String(student.year), // Convert number to string for our dropdowns
        department: student.major, // Map major field to department
        courses: student.course_names || [] // Use course names if available, otherwise empty array
      }));
      
      setStudents(formattedStudents);
      setFilteredStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to load students. Please refresh the page.');
    }
  };

  // Filter students based on search and filters
  useEffect(() => {
    let results = students;
    
    if (searchTerm) {
      results = results.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      results = results.filter(student => student.department === departmentFilter);
    }
    
    if (yearFilter) {
      results = results.filter(student => student.year === yearFilter);
    }
    
    setFilteredStudents(results);
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, yearFilter, students]);

  // Get unique departments for filter dropdown
  const departments = [...new Set(students.map(student => student.department))];
  const years = ['1', '2', '3', '4'];

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal functions
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentStudent({
      id: null,
      student_id: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      year: '',
      department: '',
      courses: []
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setCurrentStudent({
      ...student,
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({
      ...currentStudent,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!currentStudent.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!currentStudent.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(currentStudent.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!isEditing) {
      if (!currentStudent.password) {
        errors.password = 'Password is required';
      } else if (currentStudent.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (currentStudent.password !== currentStudent.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (currentStudent.password && currentStudent.password !== currentStudent.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!currentStudent.year) {
      errors.year = 'Year is required';
    }
    
    if (!currentStudent.department) {
      errors.department = 'Department is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to generate a random student_id
  const generateStudentId = () => {
    return `S${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const saveStudent = async () => {
    if (!validateForm()) return;
  
    try {
      if (isEditing) {
        // For editing an existing student
        const { password, confirmPassword, ...studentToUpdate } = currentStudent;
        
        // Prepare data to send to API
        const dataToSend = {
          name: studentToUpdate.name,
          email: studentToUpdate.email,
          year: parseInt(studentToUpdate.year),
          department: studentToUpdate.department  // This will be saved as 'major' in MongoDB
        };
        
        // Only include password if it was changed
        if (password) {
          dataToSend.password = password;
          dataToSend.confirm_password = confirmPassword;
        }
  
        const response = await fetch(`http://localhost:8000/api/v1/student/update/${studentToUpdate.student_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to update student: ${errorData}`);
        }
  
        const updatedStudent = await response.json();
        
        // Update the students list with the updated student
        setStudents(students.map(student => 
          student.student_id === updatedStudent.student_id ? {
            id: updatedStudent._id,
            student_id: updatedStudent.student_id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            year: String(updatedStudent.year),
            department: updatedStudent.major,
            courses: updatedStudent.course_names || []
          } : student
        ));
  
        alert(`Student ${updatedStudent.name} has been updated successfully!`);
      } else {
        // For adding a new student
        const newStudentData = {
          student_id: generateStudentId(),
          name: currentStudent.name,
          email: currentStudent.email,
          password: currentStudent.password,
          confirm_password: currentStudent.confirmPassword,
          year: parseInt(currentStudent.year),
          department: currentStudent.department // This will be saved as 'major' in MongoDB
        };
  
        const response = await fetch('http://localhost:8080/api/v1/student/add', { // initially it was this : http://localhost:8000/api/v1/student/add
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStudentData),
        });
  
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to add student: ${errorData}`);
        }
  
        const createdStudent = await response.json();
        
        // Add the new student to the list
        setStudents([...students, {
          id: createdStudent._id,
          student_id: createdStudent.student_id,
          name: createdStudent.name,
          email: createdStudent.email,
          year: String(createdStudent.year),
          department: createdStudent.major,
          courses: []  // New students start with no courses
        }]);
  
        alert(`Student ${createdStudent.name} has been added successfully!`);
      }
  
      // Reset the modal form
      closeModal();
      setCurrentStudent({
        id: null,
        student_id: '',
        name: '',
        email: '',
        password: '',
        year: '',
        department: '',
        courses: []
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('There was an error saving the student. Please try again.');
    }
  };
  
  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        const student = students.find(s => s.id === id);
        if (!student) {
          throw new Error('Student not found');
        }
        
        const response = await fetch(`http://localhost:8080/api/v1/student/delete/${student.student_id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to delete student: ${errorData}`);
        }
        
        // Update state after successful deletion
        setStudents(students.filter(s => s.id !== id));
        alert('Student has been removed successfully!');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('There was an error deleting the student. Please try again.');
      }
    }
  };

  const resetPassword = async (id) => {
    // This is a placeholder - you would need to implement this endpoint in your Flask API
    alert(`Password reset email sent to the student with ID: ${id}`);
  };

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>Student Management</h1>
        <button className="btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Add New Student
        </button>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-selects">
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>

          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="no-results">No students found matching your criteria.</div>
      ) : (
        <>
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Enrolled Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.year}</td>
                    <td>{student.department}</td>
                    <td>{student.courses.length > 0 ? student.courses.join(', ') : 'No courses enrolled'}</td>
                    <td className="action-buttons">
                      <button className="btn-primary" onClick={() => openEditModal(student)} title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-warning" onClick={() => openEditModal(student)} title="Edit Student">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-danger" onClick={() => deleteStudent(student.id)} title="Delete Student">
                        <i className="fas fa-trash"></i>
                      </button>
                      <button className="btn-info" onClick={() => resetPassword(student.id)} title="Reset Password">
                        <i className="fas fa-key"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Student Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={currentStudent.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={currentStudent.email}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label>{isEditing ? 'New Password (leave blank to keep current):' : 'Password:'}</label>
                <input
                  type="password"
                  name="password"
                  value={currentStudent.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
              </div>

              
              <div className="form-group">
                <label>Year:</label>
                <select
                  name="year"
                  value={currentStudent.year}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Year</option>
                  {years.map((year, index) => (
                    <option key={index} value={year}>{year}</option>
                  ))}
                </select>
                {formErrors.year && <div className="error-message">{formErrors.year}</div>}
              </div>
              
              <div className="form-group">
                <label>Department:</label>
                <select
                  name="department"
                  value={currentStudent.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && <div className="error-message">{formErrors.department}</div>}
              </div>
              
              {isEditing && (
                <div className="form-group">
                  <label>Enrolled Courses:</label>
                  <div className="courses-display">
                    {currentStudent.courses.length > 0 ? (
                      currentStudent.courses.join(', ')
                    ) : (
                      <span className="empty-courses">No courses enrolled</span>
                    )}
                  </div>
                  <div className="info-message">
                    <i className="fas fa-info-circle"></i> Students can enroll in courses through their own portal.
                  </div>
                </div>
              )}
              
              {!isEditing && (
                <div className="info-box">
                  <i className="fas fa-info-circle"></i> Students will be registered with empty course list. They can add courses after logging in.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={saveStudent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;