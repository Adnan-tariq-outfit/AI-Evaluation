import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  User,
  Tokens,
  AuthResponse,
  LogoutResponse,
  LoginRequest,
  RegisterRequest,
  AUTH_STORAGE_KEYS,
} from '../types/auth.types';
import { clearChatHistory } from '../lib/chatHistory';
import { API_URL } from '../lib/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = AuthService.getRefreshToken();

      if (refreshToken) {
        // Try to refresh the existing token
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true },
          );
          const { tokens } = response.data;
          AuthService.setTokens(tokens);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
          return apiClient(originalRequest);
        } catch {
          // Refresh failed
        }
      }

      AuthService.clearAuth();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export class AuthService {
  // ============== AUTH METHODS ==============

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    this.setAuth(response.data);
    return response.data;
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    this.setAuth(response.data);
    return response.data;
  }

  static async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');
      this.clearAuth();
      return response.data;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  // ============== TOKEN METHODS ==============

  static async refreshTokens(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );

    this.setTokens(response.data.tokens);
    // For authenticated users, sync user data too
    if (response.data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    return response.data;
  }

  // ============== SESSION/USER INFO ==============

  static async getCurrentUser(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch {
      return { isAuthenticated: false };
    }
  }

  // ============== STORAGE METHODS ==============

  static setAuth(data: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, data.tokens.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      // Sync to cookies so Next.js middleware can read auth state server-side
      this.setCookie('nexusai_access_token', data.tokens.accessToken, 1);
    }
  }

  static setTokens(tokens: Tokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      // Update access token cookie for middleware
      this.setCookie('nexusai_access_token', tokens.accessToken, 1);
    }
  }

  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      clearChatHistory();
      // Clear cookies
      this.deleteCookie('nexusai_access_token');
    }
  }

  // ============== COOKIE HELPERS (for Next.js middleware sync) ==============

  private static setCookie(name: string, value: string, days: number = 1): void {
    if (typeof document !== 'undefined') {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  }

  private static deleteCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    }
  }

  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const prefix = `${name}=`;
    const entry = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));

    if (!entry) {
      return null;
    }

    const value = entry.slice(prefix.length);
    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ??
        this.getCookie(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      );
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) ??
        this.getCookie(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      );
    }
    return null;
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // ============== HELPER METHODS ==============

  static isTokenValid(token: string): boolean {
    if (!token || token.split('.').length !== 3) {
      return false;
    }
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  static getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      }
      if (axiosError.response?.status === 401) {
        return 'Authentication failed. Please check your credentials.';
      }
      if (axiosError.response?.status === 409) {
        return 'User already exists with this email.';
      }
      return axiosError.message || 'An error occurred. Please try again.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }

  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return this.isTokenValid(token);
  }
}

export default apiClient;
