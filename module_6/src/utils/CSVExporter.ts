import { TimetableEntry, Faculty, Student, Room } from '../types';

export default class CSVExporter {
  async exportTimetable(timetable: TimetableEntry[], filename: string): Promise<void> {
    const headers = [
      'Day',
      'Start Time',
      'End Time',
      'Subject Code',
      'Subject Name',
      'Faculty',
      'Room',
      'Semester',
      'Section',
      'Credits',
      'Department'
    ];

    const rows = timetable.map(entry => [
      entry.timeSlot.day,
      entry.timeSlot.startTime,
      entry.timeSlot.endTime,
      entry.subject.code,
      entry.subject.name,
      entry.faculty.name,
      entry.room.name,
      entry.semester.toString(),
      entry.section,
      entry.subject.credits.toString(),
      entry.subject.department
    ]);

    const csvContent = this.generateCSV([headers, ...rows]);
    this.downloadCSV(csvContent, filename);
  }

  async exportFaculty(faculty: Faculty[], filename: string): Promise<void> {
    const headers = ['Name', 'Email', 'Department', 'Designation', 'Total Subjects'];

    const rows = faculty.map(f => [
      f.name,
      f.email,
      f.department,
      f.designation,
      f.subjects.length.toString()
    ]);

    const csvContent = this.generateCSV([headers, ...rows]);
    this.downloadCSV(csvContent, filename);
  }

  async exportStudents(students: Student[], filename: string): Promise<void> {
    const headers = ['Name', 'Roll Number', 'Email', 'Department', 'Semester', 'Section'];

    const rows = students.map(s => [
      s.name,
      s.rollNumber,
      s.email,
      s.department,
      s.semester.toString(),
      s.section
    ]);

    const csvContent = this.generateCSV([headers, ...rows]);
    this.downloadCSV(csvContent, filename);
  }

  async exportRooms(rooms: Room[], filename: string): Promise<void> {
    const headers = ['Room Name', 'Capacity', 'Type', 'Building'];

    const rows = rooms.map(r => [
      r.name,
      r.capacity.toString(),
      r.type,
      r.building
    ]);

    const csvContent = this.generateCSV([headers, ...rows]);
    this.downloadCSV(csvContent, filename);
  }

  private generateCSV(data: string[][]): string {
    return data
      .map(row => 
        row.map(cell => 
          // Escape quotes and wrap in quotes if needed
          this.needsQuoting(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(',')
      )
      .join('\n');
  }

  private needsQuoting(value: string): boolean {
    return value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}