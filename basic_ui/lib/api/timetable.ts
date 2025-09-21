import { api } from "../api"
import type { ApiResponse, PaginatedResponse } from "../api"
import type { TimetableData } from "@/types/timetable"

// Request aligned with GeneratorInputForm and backend generation payload
export interface TimetableGenerationRequest {
  academic_year: string
  year: number
  semester: string
  department_id: number
  section_letter: 'A'|'B'|'C'|'D'|'E'|'F'
  working_days: string[]
  periods_per_day: number
}

export interface TimetableGenerationResponse {
  jobId: string
}

export interface TimetableGenerationStatus {
  jobId: string
  step: "input_validation" | "generation" | "conflict_check" | "success" | "failed"
  progress: number
  conflicts?: Array<{ id: string; type: string; message: string; suggestedFix?: string }>
  result?: TimetableData
  error?: string
}

export interface TimetableEntity {
  id: number
  department_id: number
  section_letter: string
  year: number
  semester: string
  academic_year: string
  data: TimetableData
  created_at: string
}

export const timetableApi = {
  // Start generation job
  generateTimetable: (request: TimetableGenerationRequest): Promise<ApiResponse<TimetableGenerationResponse>> =>
    api.post<TimetableGenerationResponse>("/timetable/generate/start", request),

  // Poll job status
  getGenerationStatus: (jobId: string): Promise<ApiResponse<TimetableGenerationStatus>> =>
    api.get<TimetableGenerationStatus>(`/timetable/generate/status/${jobId}`),

  // Cancel a running generation job (if supported by backend)
  cancelGeneration: (jobId: string): Promise<ApiResponse<{ canceled: boolean }>> =>
    api.post<{ canceled: boolean }>(`/timetable/generate/cancel/${jobId}`),

  // Persist a generated timetable entity
  saveTimetable: (payload: Omit<TimetableEntity, "id" | "created_at">): Promise<ApiResponse<TimetableEntity>> =>
    api.post<TimetableEntity>("/timetables/", payload),

  // List timetables
  getTimetables: (params?: {
    department_id?: number
    section_letter?: string
    year?: number
    semester?: string
    academic_year?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<TimetableEntity>>> => api.get<PaginatedResponse<TimetableEntity>>("/timetables/", params),

  // Get a specific timetable entity by id
  getTimetable: (id: number): Promise<ApiResponse<TimetableEntity>> =>
    api.get<TimetableEntity>(`/timetables/${id}/`),

  // Update a timetable entity
  updateTimetable: (id: number, data: Partial<TimetableEntity>): Promise<ApiResponse<TimetableEntity>> =>
    api.patch<TimetableEntity>(`/timetables/${id}/`, data),

  // Delete timetable
  deleteTimetable: (id: number): Promise<ApiResponse<void>> =>
    api.delete<void>(`/timetables/${id}/`),
}
