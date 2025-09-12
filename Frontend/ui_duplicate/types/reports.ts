export interface ReportConfig {
  type: "timetable-summary" | "teacher-workload" | "room-utilization" | "conflict-analysis"
  filters: {
    semester: string[]
    branch: string[]
    section: string[]
    dateRange: {
      start: Date | null
      end: Date | null
    }
  }
  fields: string[]
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface TimetableReport {
  id: string
  semester: string
  branch: string
  section: string
  generatedDate: string
  status: "active" | "draft" | "archived"
  totalPeriods: number
  utilization: number
}

export interface TeacherReport {
  id: string
  name: string
  department: string
  totalHours: number
  subjects: string[]
}

export interface RoomReport {
  id: string
  number: string
  type: string
  capacity: number
  utilization: number
}

export interface ReportData {
  timetables: TimetableReport[]
  teachers: TeacherReport[]
  rooms: RoomReport[]
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportConfig["type"]
  defaultConfig: Partial<ReportConfig>
}
