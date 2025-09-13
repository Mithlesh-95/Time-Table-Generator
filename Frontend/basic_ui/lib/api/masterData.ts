import { api } from "@/lib/api"
import type { Department, Faculty, Student, Room, Subject, Section } from "@/types/master-data"

export const masterDataApi = {
  // Departments
  listDepartments: () => api.get<Department[]>("/departments/"),
  createDepartment: (data: Department) => api.post<Department>("/departments/", data),

  // Faculty
  listFaculty: (params?: any) => api.get<Faculty[]>("/faculties/", params),
  createFaculty: (data: Faculty) => api.post<Faculty>("/faculties/", data),

  // Students
  listStudents: (params?: any) => api.get<Student[]>("/students/", params),
  createStudent: (data: Student) => api.post<Student>("/students/", data),

  // Rooms
  listRooms: () => api.get<Room[]>("/rooms/"),
  createRoom: (data: Room) => api.post<Room>("/rooms/", data),

  // Subjects
  listSubjects: () => api.get<Subject[]>("/subjects/"),
  createSubject: (data: Subject) => api.post<Subject>("/subjects/", data),

  // Sections
  listSections: () => api.get<Section[]>("/sections/"),
  createSection: (data: Section) => api.post<Section>("/sections/", data),

  // Bulk upload
  bulkUploadFaculty: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<{ created: number }>("/faculties/bulk-upload/", formData)
  },
  bulkUploadStudents: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<{ created: number }>("/students/bulk-upload/", formData)
  },
}
