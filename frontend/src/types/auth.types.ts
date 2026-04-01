// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Token Types
export interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// API Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Response Types
export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Redux State Type
export interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Storage Keys
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexusai_access_token',
  REFRESH_TOKEN: 'nexusai_refresh_token',
  USER: 'nexusai_user',
} as const;
