import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  DashboardData,
  UserActivityLog,
  Department,
  ApiError
} from '../types/auth';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:8000/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const tokens = this.getTokens();
        if (tokens?.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = this.getTokens();
            if (tokens?.refresh) {
              const response = await this.refreshToken(tokens.refresh);
              this.setTokens(response.data);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getTokens() {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  private setTokens(tokens: any) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private clearTokens() {
    localStorage.removeItem('auth_tokens');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login/', credentials);
    this.setTokens(response.data.tokens);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response: AxiosResponse<RegisterResponse> = await this.api.post('/auth/register/', userData);
    this.setTokens(response.data.tokens);
    return response.data;
  }

  async logout(): Promise<void> {
    const tokens = this.getTokens();
    if (tokens?.refresh) {
      try {
        await this.api.post('/auth/logout/', { refresh_token: tokens.refresh });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse> {
    return this.api.post('/auth/token/refresh/', { refresh: refreshToken });
  }

  // User profile endpoints
  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile/');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch('/auth/profile/', userData);
    return response.data;
  }

  async changePassword(passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    const response = await this.api.post('/auth/password/change/', passwordData);
    return response.data;
  }

  // Dashboard endpoint
  async getDashboardData(): Promise<DashboardData> {
    const response: AxiosResponse<DashboardData> = await this.api.get('/auth/dashboard/');
    return response.data;
  }

  // User management endpoints (Admin only)
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<{ results: User[] }> = await this.api.get('/auth/users/');
    return response.data.results || response.data;
  }

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/auth/users/${id}/`);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch(`/auth/users/${id}/`, userData);
    return response.data;
  }

  async deactivateUser(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/auth/users/${id}/`);
    return response.data;
  }

  // Activity logs (Super Admin only)
  async getActivityLogs(params?: {
    user_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<UserActivityLog[]> {
    const response: AxiosResponse<{ results: UserActivityLog[] }> = await this.api.get('/auth/activity-logs/', { params });
    return response.data.results || response.data;
  }

  // Department endpoints (Super Admin only)
  async getDepartments(): Promise<Department[]> {
    const response: AxiosResponse<Department[]> = await this.api.get('/auth/departments/');
    return response.data;
  }

  async createDepartment(departmentData: Partial<Department>): Promise<Department> {
    const response: AxiosResponse<Department> = await this.api.post('/auth/departments/', departmentData);
    return response.data;
  }

  async updateDepartment(id: number, departmentData: Partial<Department>): Promise<Department> {
    const response: AxiosResponse<Department> = await this.api.patch(`/auth/departments/${id}/`, departmentData);
    return response.data;
  }

  async deleteDepartment(id: number): Promise<void> {
    await this.api.delete(`/auth/departments/${id}/`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.api.get('/auth/health/');
    return response.data;
  }

  // Error handler
  handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const errorData = error.response.data as any;
      return {
        message: errorData.message || errorData.detail || 'An error occurred',
        errors: errorData.errors || errorData
      };
    }
    return {
      message: error.message || 'Network error occurred'
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.access;
  }

  // Get current user from token (basic info)
  getCurrentUser(): User | null {
    const tokens = this.getTokens();
    if (!tokens?.access) return null;

    try {
      const payload = JSON.parse(atob(tokens.access.split('.')[1]));
      return payload.user || null;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
export default apiService;