import axios from "axios"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for initial data loading
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      // Unauthorized - clear token but don't redirect for now
      localStorage.removeItem("authToken")
      console.warn("Authentication required - token cleared")
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
