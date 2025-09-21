import axios from "axios"
import { parseJwt, setCollegeCode, getCollegeCode } from "@/lib/college"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token")
      if (token) {
        ;(config.headers = config.headers || {}).Authorization = `Bearer ${token}`
        // Sync college_code from token claim if available and differs
        try {
          const payload = parseJwt(token)
          let claim: any = payload?.college_code || payload?.college || payload?.user?.college_code
          if (claim && typeof claim === 'object' && typeof claim.code === 'string') claim = claim.code
          if (typeof claim === 'string') {
            const code = claim.trim()
            if (code && getCollegeCode() !== code) {
              setCollegeCode(code)
            }
          }
        } catch {}
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login/index.html"
      }
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error("Access forbidden")
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data)
    }

    return Promise.reject(error)
  },
)

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Generic API methods
export const api = {
  get: <T,>(url: string, params?: any): Promise<ApiResponse<T>> =>
    apiClient.get(url, { params }).then((res) => res.data),

  post: <T,>(url: string, data?: any): Promise<ApiResponse<T>> => apiClient.post(url, data).then((res) => res.data),

  put: <T,>(url: string, data?: any): Promise<ApiResponse<T>> => apiClient.put(url, data).then((res) => res.data),

  delete: <T,>(url: string): Promise<ApiResponse<T>> => apiClient.delete(url).then((res) => res.data),

  patch: <T,>(url: string, data?: any): Promise<ApiResponse<T>> => apiClient.patch(url, data).then((res) => res.data),
}

// Timetable Generation APIs
export interface GenerationStartPayload {
  // legacy fields (still accepted by API if present)
  program?: string
  semester?: string
  sections?: string[]
  // new structured payload
  academic_year?: string
  year?: number
  section_id?: number
  department_id?: number
  section_letter?: 'A'|'B'|'C'|'D'|'E'|'F'
  working_days?: string[]
  periods_per_day?: number
  constraints?: Record<string, any>
}

export interface GenerationStartResponse {
  jobId: string
}

export interface GenerationStatusResponse {
  jobId: string
  step: "input_validation" | "generation" | "conflict_check" | "success" | "failed"
  progress: number // 0-100
  conflicts?: Array<{ id: string; type: string; message: string; suggestedFix?: string }>
  resultUrl?: string
  error?: string
}

export const generatorApi = {
  startGeneration: (payload: GenerationStartPayload) =>
    api.post<GenerationStartResponse>("/timetable/generate/start", payload),

  getGenerationStatus: (jobId: string) =>
    api.get<GenerationStatusResponse>(`/timetable/generate/status/${jobId}`),

  cancelGeneration: (jobId: string) =>
    api.post<{ canceled: boolean }>(`/timetable/generate/cancel/${jobId}`),
}
