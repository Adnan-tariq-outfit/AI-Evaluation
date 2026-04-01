'use client';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshTokens,
  selectUser,
  selectTokens,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  clearError,
} from '../store/slices/authSlice';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, User } from '../types/auth.types';

// ============== HOOK ==============
// NOTE: initializeAuth is dispatched by AuthProvider (single source of truth).
// This hook only reads state and exposes actions.

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const tokens = useSelector(selectTokens);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const accessToken = AuthService.getAccessToken();
    if (!accessToken || !AuthService.isTokenValid(accessToken)) return;

    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded: { exp: number } = JSON.parse(jsonPayload);
      const expiryTime = decoded.exp * 1000;
      const refreshTime = expiryTime - Date.now() - 60000; // Refresh 1 minute before expiry

      if (refreshTime > 0 && refreshTime < 900000) {
        const timer = setTimeout(() => {
          dispatch(refreshTokens());
        }, refreshTime);

        return () => clearTimeout(timer);
      }
    } catch {
      // If decoding fails, the axios interceptor will handle it on the next request
    }
  }, [dispatch, isAuthenticated]);

  // ============== AUTH METHODS ==============

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const resultAction = await dispatch(loginUser(credentials));
      return resultAction;
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const resultAction = await dispatch(registerUser(data));
      return resultAction;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const hasValidAuth = useCallback(() => {
    return isAuthenticated && !!AuthService.getAccessToken();
  }, [isAuthenticated]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    clearAuthError,

    // Helpers
    hasValidAuth,
  };
}

// ============== SERVER-SIDE AUTH CHECK (for RSC) ==============

export async function getServerAuth(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  return {
    user: null,
    isAuthenticated: false,
  };
}
