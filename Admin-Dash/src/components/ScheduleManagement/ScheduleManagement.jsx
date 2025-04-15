import React, { useState, useEffect } from 'react';
import { getEmptySchedule, getGeneratedSchedule } from './mockDataService';
import './ScheduleManagement.css';

function ScheduleManagement() {
  // State for schedule data
  const [roomSchedules, setRoomSchedules] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  
  // Days for the schedule
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Load initial empty schedule
  useEffect(() => {
    // Simulating API fetch delay
    setTimeout(() => {
      const emptySchedule = getEmptySchedule();
      setRoomSchedules(emptySchedule);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Function to handle room selection
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId === selectedRoom ? null : roomId);
  };
  
  // Generate schedule with mock data
  const generateSchedule = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const generatedSchedule = getGeneratedSchedule();
      setRoomSchedules(generatedSchedule);
      setScheduleGenerated(true);
      setLoading(false);
      alert('Schedule generated successfully!');
    }, 2000);
  };
  
  // Export schedule (mock function)
  const exportSchedule = (format) => {
    alert(`Exporting schedule as ${format}. In a real application, this would generate and download a ${format} file.`);
  };
  
  // Group schedules by day for a specific room
  const getSchedulesByDay = (roomData) => {
    if (!roomData || !roomData.schedules) return {};
    
    const scheduledByDay = {};
    days.forEach(day => {
      scheduledByDay[day] = roomData.schedules.filter(schedule => schedule.day === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    
    return scheduledByDay;
  };
  
  // Calculate room utilization
  const calculateRoomUtilization = (roomData) => {
    if (!roomData || !roomData.schedules) return '0%';
    const totalTimeSlots = 40; // 8 slots per day * 5 days
    const scheduledSessions = roomData.schedules.length;
    return `${Math.round((scheduledSessions / totalTimeSlots) * 100)}%`;
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="schedule-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading schedule data...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="schedule-management">
      <div className="page-header">
        <h1>Schedule Management</h1>
        <div className="status-indicator">
          {scheduleGenerated ? (
            <span className="status-success">Schedule Generated</span>
          ) : (
            <span className="status-waiting">No Schedule Generated</span>
          )}
        </div>
        <div className="export-buttons">
          <button className="btn-success" onClick={() => exportSchedule('Excel')} disabled={!scheduleGenerated}>
            <i className="fas fa-file-excel"></i> Export to Excel
          </button>
          <button className="btn-danger" onClick={() => exportSchedule('PDF')} disabled={!scheduleGenerated}>
            <i className="fas fa-file-pdf"></i> Export to PDF
          </button>
          <button 
            className={`btn-primary ${scheduleGenerated ? 'btn-generated' : ''}`} 
            onClick={generateSchedule}
            disabled={loading}
          >
            <i className="fas fa-calendar-alt"></i> 
            {scheduleGenerated ? 'Regenerate Schedule' : 'Generate Schedule'}
          </button>
        </div>
      </div>
      
      {/* Room selection cards */}
      <div className="room-cards-container">
        <h2>Select a Room to View Schedule</h2>
        <div className="room-cards">
          {Object.keys(roomSchedules).map(roomId => {
            const roomData = roomSchedules[roomId];
            const totalSessions = roomData.schedules ? roomData.schedules.length : 0;
            const isSelected = selectedRoom === roomId;
            const utilization = calculateRoomUtilization(roomData);
            
            return (
              <div 
                key={roomId} 
                className={`room-card ${isSelected ? 'selected' : ''} ${totalSessions > 0 ? 'has-sessions' : ''}`}
                onClick={() => handleRoomSelect(roomId)}
              >
                <h3>Room {roomData.room_id}</h3>
                <div className="room-card-details">
                  <p><strong>Capacity:</strong> {roomData.capacity}</p>
                  <p><strong>Sessions:</strong> {totalSessions}</p>
                  <p><strong>Utilization:</strong> {utilization}</p>
                </div>
                <div className="room-card-footer">
                  <button className="btn-small">
                    {isSelected ? 'Hide Details' : 'View Schedule'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected room schedule */}
      {selectedRoom && (
        <div className="selected-room-schedule">
          <div className="room-schedule-header">
            <h2>Schedule for Room {roomSchedules[selectedRoom].room_id}</h2>
            <p>Capacity: {roomSchedules[selectedRoom].capacity} students</p>
          </div>
          
          {/* Tab navigation for days */}
          <div className="day-tabs">
            {days.map(day => {
              const daySchedules = getSchedulesByDay(roomSchedules[selectedRoom])[day] || [];
              const hasClasses = daySchedules.length > 0;
              return (
                <button 
                  key={day} 
                  className={`day-tab ${hasClasses ? 'has-classes' : ''}`}
                  onClick={() => document.getElementById(`day-${day}`).scrollIntoView({ behavior: 'smooth' })}
                >
                  {day}
                  {hasClasses && <span className="class-count">{daySchedules.length}</span>}
                </button>
              );
            })}
          </div>
          
          {/* Day-wise schedules */}
          <div className="day-schedules">
            {days.map(day => {
              const daySchedules = getSchedulesByDay(roomSchedules[selectedRoom])[day] || [];
              return (
                <div key={day} id={`day-${day}`} className="day-schedule">
                  <h3>{day}</h3>
                  
                  {daySchedules.length === 0 ? (
                    <div className="no-classes">
                      <p>No classes scheduled for this day</p>
                    </div>
                  ) : (
                    <div className="time-slots">
                      {daySchedules.map((schedule, index) => (
                        <div key={index} className="time-slot-card">
                          <div className="time-slot-header">
                            <span className="time">{schedule.start_time} - {schedule.end_time}</span>
                            <span className="course-code">{schedule.course_code}</span>
                          </div>
                          <div className="time-slot-details">
                            <p><strong>Course:</strong> {schedule.course_name}</p>
                            <p><strong>Section:</strong> {schedule.section_id}</p>
                            <p><strong>Professor:</strong> {schedule.professor}</p>
                            <p><strong>Session:</strong> {schedule.session_number}/{schedule.total_sessions}</p>
                            <p><strong>Students:</strong> {schedule.enrolled_students}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Room timetable view for selected room */}
      {selectedRoom && (
        <div className="room-timetable-view">
          <h3>Timetable View for Room {roomSchedules[selectedRoom].room_id}</h3>
          <table className="timetable">
            <thead>
              <tr>
                <th>Time</th>
                {days.map(day => <th key={day}>{day.substring(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {generateTimeSlots().map(timeSlot => {
                const formattedTime = timeSlot.format;
                return (
                  <tr key={formattedTime}>
                    <td className="time-cell">{formattedTime}</td>
                    {days.map(day => {
                      const schedules = roomSchedules[selectedRoom].schedules || [];
                      const classAtThisTime = schedules.find(
                        schedule => schedule.day === day && schedule.start_time === timeSlot.value
                      );
                      
                      return (
                        <td 
                          key={`${day}-${formattedTime}`} 
                          className={classAtThisTime ? 'scheduled-cell' : 'empty-cell'}
                        >
                          {classAtThisTime && (
                            <div className="cell-content">
                              <div className="cell-course">{classAtThisTime.course_code}</div>
                              <div className="cell-session">({classAtThisTime.session_number})</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Schedule summary if schedule is generated */}
      {scheduleGenerated && (
        <div className="schedule-summary">
          <h2>Schedule Summary</h2>
          <div className="summary-stats">
            <div className="summary-stat">
              <h4>Total Rooms</h4>
              <p>{Object.keys(roomSchedules).length}</p>
            </div>
            <div className="summary-stat">
              <h4>Total Sessions</h4>
              <p>{Object.values(roomSchedules).reduce((sum, room) => sum + room.schedules.length, 0)}</p>
            </div>
            <div className="summary-stat">
              <h4>Average Utilization</h4>
              <p>
                {Math.round(
                  Object.values(roomSchedules).reduce(
                    (sum, room) => sum + (room.schedules.length / 40) * 100, 
                    0
                  ) / Object.keys(roomSchedules).length
                )}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate time slots for the timetable
function generateTimeSlots() {
  return [
    { value: '09:00', format: '9:00 AM' },
    { value: '10:00', format: '10:00 AM' },
    { value: '11:15', format: '11:15 AM' },
    { value: '12:15', format: '12:15 PM' },
    { value: '13:15', format: '1:15 PM' },
    { value: '14:15', format: '2:15 PM' },
    { value: '15:15', format: '3:15 PM' },
    { value: '16:15', format: '4:15 PM' }
  ];
}

export default ScheduleManagement;