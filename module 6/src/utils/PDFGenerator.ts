import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, Faculty, TimetableEntry, ReportTemplate, Room } from '../types';

export default class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateStudentTimetable(
    student: Student, 
    timetable: TimetableEntry[], 
    template?: ReportTemplate
  ): Promise<void> {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Header
    this.addHeader('Student Timetable', template?.colorScheme || 'blue');
    
    // Student Information
    this.doc.setFontSize(14);
    this.doc.text('Student Information', 20, 40);
    
    this.doc.setFontSize(10);
    this.doc.text(`Name: ${student.name}`, 20, 50);
    this.doc.text(`Roll Number: ${student.rollNumber}`, 20, 57);
    this.doc.text(`Department: ${student.department}`, 20, 64);
    this.doc.text(`Semester: ${student.semester}`, 20, 71);
    this.doc.text(`Section: ${student.section}`, 20, 78);
    
    // Timetable
    this.doc.setFontSize(14);
    this.doc.text('Weekly Schedule', 20, 95);
    
    // Create timetable grid
    const startY = 105;
    const cellHeight = 12;
    const cellWidth = 25;
    
    // Days header
    const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach((day, index) => {
      this.doc.rect(20 + (index * cellWidth), startY, cellWidth, cellHeight);
      this.doc.text(day, 22 + (index * cellWidth), startY + 8);
    });
    
    // Time slots
    const timeSlots = ['9:00-10:00', '10:00-11:00', '11:15-12:15', '12:15-13:15', '14:15-15:15'];
    timeSlots.forEach((slot, rowIndex) => {
      const y = startY + ((rowIndex + 1) * cellHeight);
      this.doc.rect(20, y, cellWidth, cellHeight);
      this.doc.text(slot, 22, y + 8);
      
      // Fill in subjects for each day
      for (let dayIndex = 1; dayIndex < 6; dayIndex++) {
        this.doc.rect(20 + (dayIndex * cellWidth), y, cellWidth, cellHeight);
        // Add subject if exists
        const subject = this.findSubjectForSlot(timetable, days[dayIndex], slot);
        if (subject) {
          this.doc.setFontSize(8);
          this.doc.text(subject, 22 + (dayIndex * cellWidth), y + 6);
          this.doc.setFontSize(10);
        }
      }
    });
    
    this.addFooter(template);
    this.doc.save(`${student.name}_timetable.pdf`);
  }

  async generateFacultySchedule(
    faculty: Faculty,
    timetable: TimetableEntry[],
    template?: ReportTemplate
  ): Promise<void> {
    this.doc = new jsPDF('landscape', 'mm', 'a4');
    
    this.addHeader('Faculty Schedule', template?.colorScheme || 'green');
    
    // Faculty Information
    this.doc.setFontSize(14);
    this.doc.text('Faculty Information', 20, 40);
    
    this.doc.setFontSize(10);
    this.doc.text(`Name: ${faculty.name}`, 20, 50);
    this.doc.text(`Department: ${faculty.department}`, 20, 57);
    this.doc.text(`Designation: ${faculty.designation}`, 20, 64);
    this.doc.text(`Email: ${faculty.email}`, 20, 71);
    
    // Teaching Schedule
    this.doc.setFontSize(14);
    this.doc.text('Teaching Schedule', 20, 90);
    
    const facultyTimetable = timetable.filter(entry => entry.faculty.id === faculty.id);
    
    let yPosition = 100;
    facultyTimetable.forEach((entry, index) => {
      this.doc.setFontSize(10);
      this.doc.text(
        `${entry.timeSlot.day} ${entry.timeSlot.startTime}-${entry.timeSlot.endTime}: ${entry.subject.name} (${entry.room.name})`,
        20, yPosition + (index * 7)
      );
    });
    
    // Workload Summary
    this.doc.setFontSize(14);
    this.doc.text('Workload Summary', 20, yPosition + (facultyTimetable.length * 7) + 20);
    
    this.doc.setFontSize(10);
    this.doc.text(`Total Classes: ${facultyTimetable.length}`, 20, yPosition + (facultyTimetable.length * 7) + 30);
    this.doc.text(`Subjects: ${faculty.subjects.length}`, 20, yPosition + (facultyTimetable.length * 7) + 37);
    
    this.addFooter(template);
    this.doc.save(`${faculty.name}_schedule.pdf`);
  }

  async generateDepartmentReport(
    department: string,
    timetable: TimetableEntry[],
    template?: ReportTemplate
  ): Promise<void> {
    this.doc = new jsPDF('landscape', 'mm', 'a4');
    
    this.addHeader(`${department} Department Report`, template?.colorScheme || 'purple');
    
    const departmentTimetable = timetable.filter(
      entry => entry.faculty.department === department
    );
    
    // Department Statistics
    this.doc.setFontSize(14);
    this.doc.text('Department Statistics', 20, 40);
    
    this.doc.setFontSize(10);
    this.doc.text(`Total Classes: ${departmentTimetable.length}`, 20, 50);
    this.doc.text(`Active Faculty: ${new Set(departmentTimetable.map(e => e.faculty.id)).size}`, 20, 57);
    this.doc.text(`Rooms Utilized: ${new Set(departmentTimetable.map(e => e.room.id)).size}`, 20, 64);
    
    // Class Schedule
    this.doc.setFontSize(14);
    this.doc.text('Class Schedule', 20, 80);
    
    let yPos = 90;
    departmentTimetable.forEach((entry, index) => {
      this.doc.setFontSize(9);
      this.doc.text(
        `${entry.timeSlot.day} ${entry.timeSlot.startTime}: ${entry.subject.name} - ${entry.faculty.name} (${entry.room.name})`,
        20, yPos + (index * 6)
      );
    });
    
    this.addFooter(template);
    this.doc.save(`${department}_department_report.pdf`);
  }

  async generateRoomUtilization(
    room: Room,
    timetable: TimetableEntry[],
    template?: ReportTemplate
  ): Promise<void> {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    
    this.addHeader('Room Utilization Report', template?.colorScheme || 'orange');
    
    // Room Information
    this.doc.setFontSize(14);
    this.doc.text('Room Information', 20, 40);
    
    this.doc.setFontSize(10);
    this.doc.text(`Room: ${room.name}`, 20, 50);
    this.doc.text(`Capacity: ${room.capacity}`, 20, 57);
    this.doc.text(`Type: ${room.type}`, 20, 64);
    this.doc.text(`Building: ${room.building}`, 20, 71);
    
    // Utilization Schedule
    const roomSchedule = timetable.filter(entry => entry.room.id === room.id);
    
    this.doc.setFontSize(14);
    this.doc.text('Utilization Schedule', 20, 90);
    
    let yPos = 100;
    roomSchedule.forEach((entry, index) => {
      this.doc.setFontSize(10);
      this.doc.text(
        `${entry.timeSlot.day} ${entry.timeSlot.startTime}-${entry.timeSlot.endTime}: ${entry.subject.name}`,
        20, yPos + (index * 7)
      );
      this.doc.text(`Faculty: ${entry.faculty.name}`, 25, yPos + (index * 7) + 4);
    });
    
    // Utilization Statistics
    this.doc.setFontSize(14);
    this.doc.text('Utilization Statistics', 20, yPos + (roomSchedule.length * 7) + 20);
    
    const totalSlots = 30; // Assuming 30 total available slots per week
    const utilizationPercentage = Math.round((roomSchedule.length / totalSlots) * 100);
    
    this.doc.setFontSize(10);
    this.doc.text(`Total Occupied Slots: ${roomSchedule.length}`, 20, yPos + (roomSchedule.length * 7) + 30);
    this.doc.text(`Total Available Slots: ${totalSlots}`, 20, yPos + (roomSchedule.length * 7) + 37);
    this.doc.text(`Utilization Rate: ${utilizationPercentage}%`, 20, yPos + (roomSchedule.length * 7) + 44);
    
    this.addFooter(template);
    this.doc.save(`${room.name}_utilization.pdf`);
  }

  private addHeader(title: string, colorScheme: string = 'blue'): void {
    // Header background
    const headerColor = this.getColorByScheme(colorScheme);
    this.doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
    this.doc.rect(0, 0, this.doc.internal.pageSize.getWidth(), 25, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(18);
    this.doc.text(title, 20, 15);
    
    // College name
    this.doc.setFontSize(10);
    this.doc.text('University College of Engineering', 20, 20);
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addFooter(template?: ReportTemplate): void {
    if (!template?.includeFooters) return;
    
    const pageHeight = this.doc.internal.pageSize.getHeight();
    this.doc.setFontSize(8);
    this.doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, pageHeight - 10);
    this.doc.text('Timetable Management System', this.doc.internal.pageSize.getWidth() - 60, pageHeight - 10);
  }

  private findSubjectForSlot(timetable: TimetableEntry[], day: string, timeSlot: string): string | null {
    const entry = timetable.find(e => 
      e.timeSlot.day === day && 
      timeSlot.includes(e.timeSlot.startTime)
    );
    return entry ? entry.subject.code : null;
  }

  private getColorByScheme(scheme: string): { r: number; g: number; b: number } {
    switch (scheme) {
      case 'blue': return { r: 59, g: 130, b: 246 };
      case 'green': return { r: 16, g: 185, b: 129 };
      case 'purple': return { r: 139, g: 92, b: 246 };
      case 'orange': return { r: 245, g: 158, b: 11 };
      default: return { r: 107, g: 114, b: 128 };
    }
  }
}