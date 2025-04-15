// mockDataService.js
export function getMockRooms() {
    return [
      { id: "A101", room_id: "A101", capacity: 30 },
      { id: "A102", room_id: "A102", capacity: 25 },
      { id: "B201", room_id: "B201", capacity: 40 },
      { id: "B202", room_id: "B202", capacity: 35 }
    ];
  }
  
  export function getMockTimeslots() {
    return [
      { id: "MON-9", day: "Monday", start_time: "09:00", end_time: "10:00", is_break: false },
      { id: "MON-10", day: "Monday", start_time: "10:00", end_time: "11:00", is_break: false },
      { id: "MON-11", day: "Monday", start_time: "11:15", end_time: "12:15", is_break: false },
      { id: "MON-1", day: "Monday", start_time: "13:15", end_time: "14:15", is_break: false },
      { id: "TUE-9", day: "Tuesday", start_time: "09:00", end_time: "10:00", is_break: false },
      { id: "TUE-10", day: "Tuesday", start_time: "10:00", end_time: "11:00", is_break: false },
      { id: "WED-9", day: "Wednesday", start_time: "09:00", end_time: "10:00", is_break: false },
      { id: "WED-10", day: "Wednesday", start_time: "10:00", end_time: "11:00", is_break: false },
      { id: "THU-9", day: "Thursday", start_time: "09:00", end_time: "10:00", is_break: false },
      { id: "THU-1", day: "Thursday", start_time: "13:15", end_time: "14:15", is_break: false },
      { id: "FRI-9", day: "Friday", start_time: "09:00", end_time: "10:00", is_break: false },
      { id: "FRI-11", day: "Friday", start_time: "11:15", end_time: "12:15", is_break: false }
    ];
  }
  
  export function getMockCourses() {
    return [
      { id: "CS101", course_code: "CS101", name: "Introduction to Programming", lecture_hours: 2 },
      { id: "MATH101", course_code: "MATH101", name: "Calculus I", lecture_hours: 2 },
      { id: "ENG101", course_code: "ENG101", name: "English Composition", lecture_hours: 1 },
      { id: "PHYS101", course_code: "PHYS101", name: "Physics I", lecture_hours: 3 },
      { id: "CHEM101", course_code: "CHEM101", name: "Chemistry I", lecture_hours: 2 }
    ];
  }
  
  export function getMockTeachers() {
    return [
      { id: "T1", name: "Dr. Smith", teachable_courses: ["CS101"] },
      { id: "T2", name: "Dr. Johnson", teachable_courses: ["MATH101"] },
      { id: "T3", name: "Prof. Davis", teachable_courses: ["ENG101"] },
      { id: "T4", name: "Dr. Wilson", teachable_courses: ["PHYS101"] },
      { id: "T5", name: "Prof. Brown", teachable_courses: ["CHEM101"] }
    ];
  }
  
  export function getMockSections() {
    const mockStudents = Array.from({ length: 30 }, (_, i) => ({ id: `S${i+1}`, name: `Student ${i+1}` }));
    
    return [
      { 
        id: "SEC1", 
        section_id: "CS101-A", 
        course: getMockCourses()[0], 
        teacher: getMockTeachers()[0],
        enrolled_students: mockStudents.slice(0, 25)
      },
      { 
        id: "SEC2", 
        section_id: "MATH101-A", 
        course: getMockCourses()[1], 
        teacher: getMockTeachers()[1],
        enrolled_students: mockStudents.slice(0, 28)
      },
      { 
        id: "SEC3", 
        section_id: "ENG101-A", 
        course: getMockCourses()[2], 
        teacher: getMockTeachers()[2],
        enrolled_students: mockStudents.slice(0, 22)
      },
      { 
        id: "SEC4", 
        section_id: "PHYS101-A", 
        course: getMockCourses()[3], 
        teacher: getMockTeachers()[3],
        enrolled_students: mockStudents.slice(0, 30)
      },
      { 
        id: "SEC5", 
        section_id: "CHEM101-A", 
        course: getMockCourses()[4], 
        teacher: getMockTeachers()[4],
        enrolled_students: mockStudents.slice(0, 20)
      }
    ];
  }
  
  // This mimics the empty schedule or initial state
  export function getEmptySchedule() {
    const rooms = getMockRooms();
    const emptySchedule = {};
    
    rooms.forEach(room => {
      emptySchedule[room.room_id] = {
        room_id: room.room_id,
        capacity: room.capacity,
        schedules: []
      };
    });
    
    return emptySchedule;
  }
  
  // This mimics what would come from the backend after scheduling
  export function getGeneratedSchedule() {
    return {
      "A101": {
        "room_id": "A101",
        "capacity": 30,
        "schedules": [
          {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
            "course_code": "CS101",
            "course_name": "Introduction to Programming",
            "section_id": "CS101-A",
            "professor": "Dr. Smith",
            "session_number": 1,
            "total_sessions": 2,
            "enrolled_students": 25
          },
          {
            "day": "Monday",
            "start_time": "10:00",
            "end_time": "11:00",
            "course_code": "CS101",
            "course_name": "Introduction to Programming",
            "section_id": "CS101-A",
            "professor": "Dr. Smith",
            "session_number": 2,
            "total_sessions": 2,
            "enrolled_students": 25
          },
          {
            "day": "Wednesday",
            "start_time": "09:00",
            "end_time": "10:00",
            "course_code": "PHYS101",
            "course_name": "Physics I",
            "section_id": "PHYS101-A",
            "professor": "Dr. Wilson",
            "session_number": 1,
            "total_sessions": 3,
            "enrolled_students": 30
          }
        ]
      },
      "A102": {
        "room_id": "A102",
        "capacity": 25,
        "schedules": [
          {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
            "course_code": "MATH101",
            "course_name": "Calculus I",
            "section_id": "MATH101-A",
            "professor": "Dr. Johnson",
            "session_number": 1,
            "total_sessions": 2,
            "enrolled_students": 28
          },
          {
            "day": "Tuesday",
            "start_time": "10:00",
            "end_time": "11:00",
            "course_code": "MATH101",
            "course_name": "Calculus I",
            "section_id": "MATH101-A",
            "professor": "Dr. Johnson",
            "session_number": 2,
            "total_sessions": 2,
            "enrolled_students": 28
          },
          {
            "day": "Friday",
            "start_time": "11:15",
            "end_time": "12:15",
            "course_code": "CHEM101",
            "course_name": "Chemistry I",
            "section_id": "CHEM101-A",
            "professor": "Prof. Brown",
            "session_number": 2,
            "total_sessions": 2,
            "enrolled_students": 20
          }
        ]
      },
      "B201": {
        "room_id": "B201",
        "capacity": 40,
        "schedules": [
          {
            "day": "Monday",
            "start_time": "09:00",
            "end_time": "10:00",
            "course_code": "ENG101",
            "course_name": "English Composition",
            "section_id": "ENG101-A",
            "professor": "Prof. Davis",
            "session_number": 1,
            "total_sessions": 1,
            "enrolled_students": 22
          },
          {
            "day": "Thursday",
            "start_time": "09:00",
            "end_time": "10:00",
            "course_code": "PHYS101",
            "course_name": "Physics I",
            "section_id": "PHYS101-A",
            "professor": "Dr. Wilson",
            "session_number": 2,
            "total_sessions": 3,
            "enrolled_students": 30
          }
        ]
      },
      "B202": {
        "room_id": "B202",
        "capacity": 35,
        "schedules": [
          {
            "day": "Wednesday",
            "start_time": "10:00",
            "end_time": "11:00",
            "course_code": "PHYS101",
            "course_name": "Physics I",
            "section_id": "PHYS101-A",
            "professor": "Dr. Wilson",
            "session_number": 3,
            "total_sessions": 3,
            "enrolled_students": 30
          },
          {
            "day": "Thursday",
            "start_time": "13:15",
            "end_time": "14:15",
            "course_code": "CHEM101",
            "course_name": "Chemistry I",
            "section_id": "CHEM101-A",
            "professor": "Prof. Brown",
            "session_number": 1,
            "total_sessions": 2,
            "enrolled_students": 20
          }
        ]
      }
    };
  }