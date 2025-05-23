// components/CourseCatalog.jsx
import { useState, useEffect } from 'react';

export default function CourseCatalog({ enrolledCourses = [], onEnrollmentChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses from the API endpoint
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fixed URL with colon after localhost
        const response = await fetch('http://localhost:8080/api/v1/course/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        
        // Transform the data to match our component's expected format
        const formattedCourses = data.map(course => ({
          id: course.course_id,
          code: course.course_id, // Using course_id as the code for display
          name: course.course_name,
          credits: course.credits,
          status: 'Open' // Default status since API doesn't provide status
        }));
        
        setCourses(formattedCourses);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Open') return matchesSearch && course.status === 'Open';
    if (selectedFilter === 'Full') return matchesSearch && course.status === 'Full';

    return matchesSearch;
  });

  const handleEnroll = async (course) => {
    try {
      // Set loading state for this specific course
      setEnrollingCourseId(course.id);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You need to be logged in to enroll in courses');
        window.location.href = '/login';
        return;
      }
      
      // Make the API call to enroll in the course
      const response = await fetch('http://localhost:8080/api/v1/student/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll in course');
      }
      
      // If enrollment was successful, update the parent component
      if (onEnrollmentChange) {
        onEnrollmentChange([...enrolledCourses, course]);
      }
      
      // Show success message
      alert(`Successfully enrolled in ${course.code}: ${course.name}`);
      
    } catch (error) {
      alert(error.message || 'An error occurred while enrolling in the course');
      console.error('Enrollment error:', error);
    } finally {
      // Clear loading state
      setEnrollingCourseId(null);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading courses...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <div className="header-controls">
          <h2 className="text-lg font-medium">Available Courses</h2>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${selectedFilter === 'All' ? 'active-all' : ''}`}
              onClick={() => setSelectedFilter('All')}>
              All
            </button>
            <button 
              className={`filter-button ${selectedFilter === 'Open' ? 'active-open' : ''}`}
              onClick={() => setSelectedFilter('Open')}>
              Open
            </button>
            <button 
              className={`filter-button ${selectedFilter === 'Full' ? 'active-full' : ''}`}
              onClick={() => setSelectedFilter('Full')}>
              Full
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses by code or name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="course-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => {
              const isEnrolled = Array.isArray(enrolledCourses) && enrolledCourses.some(c => {
                const enrolledId = c.id || c.code || c.course_id;
                return enrolledId === course.id;
              });
              
              const isEnrolling = enrollingCourseId === course.id;

              return (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className={`course-status ${
                      course.status === 'Open' ? 'status-open' : 'status-full'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => !isEnrolled && course.status === 'Open' && handleEnroll(course)}
                      disabled={isEnrolled || course.status === 'Full' || isEnrolling}
                      className={`enroll-button ${
                        isEnrolled 
                          ? 'enroll-disabled'
                          : course.status === 'Full'
                            ? 'enroll-disabled'
                            : isEnrolling
                              ? 'enroll-loading'
                              : 'enroll-active'
                      }`}
                    >
                      {isEnrolled 
                        ? 'Enrolled' 
                        : isEnrolling 
                          ? 'Enrolling...' 
                          : 'Enroll'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}