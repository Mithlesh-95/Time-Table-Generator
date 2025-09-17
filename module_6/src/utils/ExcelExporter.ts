import * as XLSX from 'xlsx';
import { TimetableEntry, Faculty, Student, Room } from '../types';

export default class ExcelExporter {
  async exportTimetable(timetable: TimetableEntry[], filename: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Create timetable sheet
    const timetableData = timetable.map(entry => ({
      'Day': entry.timeSlot.day,
      'Start Time': entry.timeSlot.startTime,
      'End Time': entry.timeSlot.endTime,
      'Subject Code': entry.subject.code,
      'Subject Name': entry.subject.name,
      'Faculty': entry.faculty.name,
      'Room': entry.room.name,
      'Semester': entry.semester,
      'Section': entry.section,
      'Credits': entry.subject.credits,
      'Department': entry.subject.department
    }));
    
    const timetableSheet = XLSX.utils.json_to_sheet(timetableData);
    
    // Apply formatting
    const range = XLSX.utils.decode_range(timetableSheet['!ref']!);
    
    // Header formatting
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!timetableSheet[cellAddress]) continue;
      
      timetableSheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Column widths
    timetableSheet['!cols'] = [
      { width: 12 }, // Day
      { width: 12 }, // Start Time
      { width: 12 }, // End Time
      { width: 15 }, // Subject Code
      { width: 25 }, // Subject Name
      { width: 20 }, // Faculty
      { width: 15 }, // Room
      { width: 10 }, // Semester
      { width: 10 }, // Section
      { width: 10 }, // Credits
      { width: 18 }  // Department
    ];
    
    XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable');
    
    // Create summary sheet
    this.addSummarySheet(workbook, timetable);
    
    // Save file
    XLSX.writeFile(workbook, filename);
  }

  async exportFaculty(faculty: Faculty[], filename: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    const facultyData = faculty.map(f => ({
      'Name': f.name,
      'Email': f.email,
      'Department': f.department,
      'Designation': f.designation,
      'Total Subjects': f.subjects.length
    }));
    
    const facultySheet = XLSX.utils.json_to_sheet(facultyData);
    this.applyHeaderFormatting(facultySheet);
    
    facultySheet['!cols'] = [
      { width: 25 }, // Name
      { width: 30 }, // Email
      { width: 20 }, // Department
      { width: 18 }, // Designation
      { width: 15 }  // Total Subjects
    ];
    
    XLSX.utils.book_append_sheet(workbook, facultySheet, 'Faculty');
    XLSX.writeFile(workbook, filename);
  }

  async exportStudents(students: Student[], filename: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    const studentData = students.map(s => ({
      'Name': s.name,
      'Roll Number': s.rollNumber,
      'Email': s.email,
      'Department': s.department,
      'Semester': s.semester,
      'Section': s.section
    }));
    
    const studentSheet = XLSX.utils.json_to_sheet(studentData);
    this.applyHeaderFormatting(studentSheet);
    
    studentSheet['!cols'] = [
      { width: 25 }, // Name
      { width: 15 }, // Roll Number
      { width: 30 }, // Email
      { width: 20 }, // Department
      { width: 10 }, // Semester
      { width: 10 }  // Section
    ];
    
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Students');
    XLSX.writeFile(workbook, filename);
  }

  async exportRooms(rooms: Room[], filename: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    const roomData = rooms.map(r => ({
      'Room Name': r.name,
      'Capacity': r.capacity,
      'Type': r.type,
      'Building': r.building
    }));
    
    const roomSheet = XLSX.utils.json_to_sheet(roomData);
    this.applyHeaderFormatting(roomSheet);
    
    roomSheet['!cols'] = [
      { width: 15 }, // Room Name
      { width: 12 }, // Capacity
      { width: 15 }, // Type
      { width: 20 }  // Building
    ];
    
    XLSX.utils.book_append_sheet(workbook, roomSheet, 'Rooms');
    XLSX.writeFile(workbook, filename);
  }

  private addSummarySheet(workbook: XLSX.WorkBook, timetable: TimetableEntry[]): void {
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Classes', timetable.length],
      ['Total Faculty', new Set(timetable.map(t => t.faculty.id)).size],
      ['Total Rooms Used', new Set(timetable.map(t => t.room.id)).size],
      ['Total Subjects', new Set(timetable.map(t => t.subject.id)).size],
      [''],
      ['Department Wise Distribution', ''],
      ...this.getDepartmentSummary(timetable)
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Format summary sheet
    summarySheet['A1'].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "366092" } }
    };
    summarySheet['B1'].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "366092" } }
    };
    
    summarySheet['!cols'] = [{ width: 30 }, { width: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  private getDepartmentSummary(timetable: TimetableEntry[]): string[][] {
    const deptCounts: { [key: string]: number } = {};
    
    timetable.forEach(entry => {
      const dept = entry.subject.department;
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    return Object.entries(deptCounts).map(([dept, count]) => [dept, count.toString()]);
  }

  private applyHeaderFormatting(sheet: XLSX.WorkSheet): void {
    if (!sheet['!ref']) return;
    
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!sheet[cellAddress]) continue;
      
      sheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center" }
      };
    }
  }
}