import { Faculty, Subject, Room, Student, TimetableEntry, TimeSlot } from '../types';

export const timeSlots: TimeSlot[] = [
  { id: '1', startTime: '09:00', endTime: '10:00', day: 'Monday' },
  { id: '2', startTime: '10:00', endTime: '11:00', day: 'Monday' },
  { id: '3', startTime: '11:15', endTime: '12:15', day: 'Monday' },
  { id: '4', startTime: '12:15', endTime: '13:15', day: 'Monday' },
  { id: '5', startTime: '14:15', endTime: '15:15', day: 'Monday' },
  { id: '6', startTime: '15:15', endTime: '16:15', day: 'Monday' },
  // Repeat for other days
  { id: '7', startTime: '09:00', endTime: '10:00', day: 'Tuesday' },
  { id: '8', startTime: '10:00', endTime: '11:00', day: 'Tuesday' },
  { id: '9', startTime: '11:15', endTime: '12:15', day: 'Tuesday' },
];

export const subjects: Subject[] = [
  { id: '1', name: 'Data Structures', code: 'CS201', credits: 4, department: 'Computer Science' },
  { id: '2', name: 'Database Systems', code: 'CS301', credits: 3, department: 'Computer Science' },
  { id: '3', name: 'Software Engineering', code: 'CS401', credits: 4, department: 'Computer Science' },
  { id: '4', name: 'Digital Electronics', code: 'EC201', credits: 3, department: 'Electronics' },
  { id: '5', name: 'Microprocessors', code: 'EC301', credits: 4, department: 'Electronics' },
  { id: '6', name: 'Engineering Mathematics', code: 'MA101', credits: 4, department: 'Mathematics' },
];

export const faculty: Faculty[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@college.edu',
    department: 'Computer Science',
    designation: 'Professor',
    subjects: ['1', '2']
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@college.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    subjects: ['3']
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@college.edu',
    department: 'Electronics',
    designation: 'Assistant Professor',
    subjects: ['4', '5']
  },
  {
    id: '4',
    name: 'Prof. Robert Wilson',
    email: 'robert.wilson@college.edu',
    department: 'Mathematics',
    designation: 'Professor',
    subjects: ['6']
  }
];

export const rooms: Room[] = [
  { id: '1', name: 'Room 101', capacity: 60, type: 'classroom', building: 'Main Block' },
  { id: '2', name: 'Room 102', capacity: 40, type: 'classroom', building: 'Main Block' },
  { id: '3', name: 'Lab 201', capacity: 30, type: 'lab', building: 'CS Block' },
  { id: '4', name: 'Lab 202', capacity: 30, type: 'lab', building: 'EC Block' },
  { id: '5', name: 'Auditorium', capacity: 200, type: 'auditorium', building: 'Main Block' },
];

export const students: Student[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@student.edu', rollNumber: 'CS001', semester: 3, department: 'Computer Science', section: 'A' },
  { id: '2', name: 'Alice Brown', email: 'alice.brown@student.edu', rollNumber: 'CS002', semester: 3, department: 'Computer Science', section: 'A' },
  { id: '3', name: 'Bob Wilson', email: 'bob.wilson@student.edu', rollNumber: 'EC001', semester: 3, department: 'Electronics', section: 'A' },
  { id: '4', name: 'Emma Davis', email: 'emma.davis@student.edu', rollNumber: 'EC002', semester: 3, department: 'Electronics', section: 'A' },
];

export const sampleTimetable: TimetableEntry[] = [
  {
    id: '1',
    timeSlot: timeSlots[0],
    subject: subjects[0],
    faculty: faculty[0],
    room: rooms[0],
    students: [students[0], students[1]],
    semester: 3,
    section: 'A'
  },
  {
    id: '2',
    timeSlot: timeSlots[1],
    subject: subjects[1],
    faculty: faculty[0],
    room: rooms[2],
    students: [students[0], students[1]],
    semester: 3,
    section: 'A'
  },
  {
    id: '3',
    timeSlot: timeSlots[6],
    subject: subjects[3],
    faculty: faculty[2],
    room: rooms[3],
    students: [students[2], students[3]],
    semester: 3,
    section: 'A'
  }
];

export const generateAnalyticsData = () => {
  return {
    facultyWorkload: faculty.map(f => ({
      facultyId: f.id,
      name: f.name,
      totalHours: Math.floor(Math.random() * 20) + 10,
      subjects: f.subjects.length,
      utilization: Math.floor(Math.random() * 40) + 60
    })),
    roomUtilization: rooms.map(r => ({
      roomId: r.id,
      name: r.name,
      totalSlots: 30,
      occupiedSlots: Math.floor(Math.random() * 25) + 5,
      utilizationPercent: Math.floor(Math.random() * 60) + 20
    })),
    departmentStats: [
      { department: 'Computer Science', totalClasses: 45, totalFaculty: 12, totalStudents: 120 },
      { department: 'Electronics', totalClasses: 38, totalFaculty: 10, totalStudents: 95 },
      { department: 'Mathematics', totalClasses: 25, totalFaculty: 8, totalStudents: 200 }
    ]
  };
};