// mockSchedulerService.js
import { 
    getMockRooms, 
    getMockTimeslots, 
    getMockCourses, 
    getMockTeachers, 
    getMockSections 
  } from './mockDataService';
  
  class MockSchedulerController {
    constructor() {
      this.sessions_to_schedule = [];
      this.time_slots = {};
      this.rooms = {};
      this.schedule = {};
      this.MAX_SESSIONS_PER_TEACHER_PER_DAY = 5;
    }
  
    initialize_data() {
      // Load rooms
      const rooms = getMockRooms();
      rooms.forEach(room => {
        this.rooms[room.id] = room;
      });
      
      // Load time slots
      const timeSlots = getMockTimeslots();
      timeSlots.forEach(slot => {
        this.time_slots[slot.id] = slot;
      });
      
      // Create sessions to schedule
      const sections = getMockSections();
      sections.forEach(section => {
        const lectureHours = section.course.lecture_hours;
        for (let sessionNum = 1; sessionNum <= lectureHours; sessionNum++) {
          this.sessions_to_schedule.push({ section, sessionNum });
        }
      });
      
      console.log(`Loaded ${Object.keys(this.rooms).length} rooms, ${Object.keys(this.time_slots).length} time slots, and ${this.sessions_to_schedule.length} sessions to schedule.`);
    }
  
    generate_schedule() {
      this.initialize_data();
      
      // For demo purposes, we'll just return the pre-defined schedule from mockDataService
      // In a real implementation, this would run the backtracking algorithm
      
      console.log("Schedule generated successfully!");
      return true;
    }
    
    // This is a simplified version that doesn't actually run the algorithm
    // but simply returns a pre-defined schedule that matches the format
    // expected by the frontend
    get_schedule_by_all_rooms() {
      // This would be replaced with getGeneratedSchedule() from mockDataService
      // in your actual implementation
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
            // Additional schedules would be here
          ]
        },
        // Additional rooms would be here
      };
    }
  }
  
  // Export a singleton instance
  export const mockScheduler = new MockSchedulerController();
  
  // Helper function to simulate API call to generate schedule
  export async function generateScheduleAPI() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scheduler = new MockSchedulerController();
        scheduler.generate_schedule();
        // In a real implementation, this would call get_schedule_by_all_rooms() after running the algorithm
        resolve(true);
      }, 2000);
    });
  }
  
  // Helper function to get the generated schedule
  export async function getScheduleAPI() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scheduler = new MockSchedulerController();
        resolve(scheduler.get_schedule_by_all_rooms());
      }, 1000);
    });
  }