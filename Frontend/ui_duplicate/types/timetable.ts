export interface TimetableEntry {
  subject: string
  teacher: string
  room: string
  type: "lecture" | "tutorial" | "practical" | "lab" | "break" | "free"
}

export interface TimetableSchedule {
  [day: string]: {
    [timeSlot: string]: TimetableEntry
  }
}

export interface TimetableMetadata {
  semester: string
  branch: string
  section: string
  academicYear: string
}

export interface TimetableData {
  schedule: TimetableSchedule
  metadata: TimetableMetadata
}

export interface TimetableConfig {
  colorScheme: {
    [key in TimetableEntry["type"]]: string
  }
  timeSlots: string[]
  workingDays: string[]
}
