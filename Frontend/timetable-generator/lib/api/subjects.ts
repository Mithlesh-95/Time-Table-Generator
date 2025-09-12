import type { ApiResponse, PaginatedResponse } from "../api"

export interface Subject {
  id: string
  name: string
  code: string
  credits: number
  type: "theory" | "practical" | "lab"
  semester: string
  branch: string
  department: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  department: string
  subjects: string[]
  maxHoursPerWeek: number
}

export interface Room {
  id: string
  number: string
  type: "classroom" | "laboratory" | "auditorium"
  capacity: number
  equipment: string[]
  availability: string[]
}

// Subjects and Resources API endpoints
export const subjectsApi = {
  // Subjects
  getSubjects: async (params?: {
    semester?: string
    branch?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Subject>> => {
    console.log("API Call: Get Subjects", params)

    // Simulate API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: 0,
            totalPages: 0,
          },
        })
      }, 500)
    })

    // return api.get('/subjects', params)
  },

  createSubject: async (subject: Omit<Subject, "id">): Promise<ApiResponse<Subject>> => {
    console.log("API Call: Create Subject", subject)

    // Simulate API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...subject, id: `subj_${Date.now()}` },
        })
      }, 500)
    })

    // return api.post('/subjects', subject)
  },

  updateSubject: async (id: string, subject: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    console.log("API Call: Update Subject", id, subject)

    // return api.put(`/subjects/${id}`, subject)
    return Promise.resolve({ success: true, data: subject as Subject })
  },

  deleteSubject: async (id: string): Promise<ApiResponse<void>> => {
    console.log("API Call: Delete Subject", id)

    // return api.delete(`/subjects/${id}`)
    return Promise.resolve({ success: true, data: undefined })
  },

  // Teachers
  getTeachers: async (params?: {
    department?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Teacher>> => {
    console.log("API Call: Get Teachers", params)

    // return api.get('/teachers', params)
    return Promise.resolve({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    })
  },

  createTeacher: async (teacher: Omit<Teacher, "id">): Promise<ApiResponse<Teacher>> => {
    console.log("API Call: Create Teacher", teacher)

    // return api.post('/teachers', teacher)
    return Promise.resolve({
      success: true,
      data: { ...teacher, id: `teacher_${Date.now()}` },
    })
  },

  // Rooms
  getRooms: async (params?: {
    type?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Room>> => {
    console.log("API Call: Get Rooms", params)

    // return api.get('/rooms', params)
    return Promise.resolve({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    })
  },

  createRoom: async (room: Omit<Room, "id">): Promise<ApiResponse<Room>> => {
    console.log("API Call: Create Room", room)

    // return api.post('/rooms', room)
    return Promise.resolve({
      success: true,
      data: { ...room, id: `room_${Date.now()}` },
    })
  },
}
