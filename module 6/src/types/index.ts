// Core data types for the timetable system
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  day: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  subjects: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'auditorium';
  building: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number;
  department: string;
  section: string;
}

export interface TimetableEntry {
  id: string;
  timeSlot: TimeSlot;
  subject: Subject;
  faculty: Faculty;
  room: Room;
  students: Student[];
  semester: number;
  section: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'student' | 'faculty' | 'department' | 'room';
  layout: 'portrait' | 'landscape';
  includeHeaders: boolean;
  includeFooters: boolean;
  colorScheme: string;
}

export interface AnalyticsData {
  facultyWorkload: {
    facultyId: string;
    name: string;
    totalHours: number;
    subjects: number;
    utilization: number;
  }[];
  roomUtilization: {
    roomId: string;
    name: string;
    totalSlots: number;
    occupiedSlots: number;
    utilizationPercent: number;
  }[];
  departmentStats: {
    department: string;
    totalClasses: number;
    totalFaculty: number;
    totalStudents: number;
  }[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  template?: ReportTemplate;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeAnalytics?: boolean;
}

export interface EmailConfig {
  recipients: string[];
  subject: string;
  template: string;
  attachments?: string[];
  scheduleType?: 'immediate' | 'daily' | 'weekly' | 'monthly';
}