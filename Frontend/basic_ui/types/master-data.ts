export interface Department {
    id?: number
    name: string
    code: string
}

export type RoomType = "lecture" | "lab" | "seminar"

export interface Room {
    id?: number
    number: string
    room_type: RoomType
    capacity: number
    equipment?: string[]
}

export interface Faculty {
    id?: number
    first_name: string
    last_name: string
    email: string
    department_id: number
    qualifications?: string
    experience_years?: number
    workload_capacity_hours?: number
    availability?: Record<string, any>
    preferences?: Record<string, any>
}

export interface Student {
    id?: number
    first_name: string
    last_name: string
    email: string
    enrollment_no: string
    department_id: number
    current_semester: string
    major_subjects?: string[]
    minor_subjects?: string[]
    elective_preferences?: string[]
    credit_requirements?: Record<string, any>
}

export interface Subject {
    id?: number
    code: string
    name: string
    category: "Major" | "Minor" | "SEC" | "VAC" | "AEC"
    credits_theory: number
    credits_practical: number
    prerequisites?: number[]
    departments?: number[]
}

export interface Section {
    id?: number
    department_id: number
    semester: string
    name: string
    size: number
}
