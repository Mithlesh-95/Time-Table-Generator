export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'super_admin' | 'dept_admin' | 'faculty' | 'student';
  role_display: string;
  department: string | null;
  department_display: string | null;
  contact_number: string | null;
  employee_id: string | null;
  date_of_birth: string | null;
  address: string | null;
  profile_picture: string | null;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: string;
  department?: string;
  contact_number?: string;
  employee_id?: string;
  date_of_birth?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardData {
  user: User;
  role_specific_data: {
    [key: string]: any;
  };
}

export interface UserActivityLog {
  id: number;
  user: number;
  user_display: string;
  action: string;
  action_display: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, any>;
  timestamp: string;
  success: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  head_of_department: number | null;
  head_of_department_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}