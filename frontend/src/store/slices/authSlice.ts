import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/auth.service';
import {
  AuthState,
  LoginRequest,
  RegisterRequest,
  User,
  Tokens,
} from '../../types/auth.types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Initialize auth state thunk
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const user = AuthService.getUser();
      const accessToken = AuthService.getAccessToken();
      const refreshToken = AuthService.getRefreshToken();

      // If no token at all
      if (!accessToken) {
        return { user: null, tokens: null, isAuthenticated: false };
      }

      // Access token exists but is expired — try to refresh
      if (!AuthService.isTokenValid(accessToken)) {
        try {
          const response = await AuthService.refreshTokens();
          return {
            user: response.user || null,
            tokens: response.tokens,
            isAuthenticated: true,
          };
        } catch {
          // Refresh failed
          return { user: null, tokens: null, isAuthenticated: false };
        }
      }

      // Token is valid — re-sync localStorage data back to cookies
      const validTokens = {
        accessToken,
        refreshToken: refreshToken || '',
        tokenType: 'Bearer' as const,
        expiresIn: 900,
      };
      AuthService.setTokens(validTokens);

      // If we don't have a user cached, fetch it from backend (/auth/me)
      if (!user) {
        const me = await AuthService.getCurrentUser();
        return {
          user: me.user || null,
          tokens: refreshToken
            ? { accessToken, refreshToken, tokenType: 'Bearer' as const, expiresIn: 900 }
            : null,
          isAuthenticated: !!me.user,
        };
      }

      return {
        user,
        tokens: refreshToken
          ? { accessToken, refreshToken, tokenType: 'Bearer' as const, expiresIn: 900 }
          : null,
        isAuthenticated: true,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to initialize auth'
      );
    }
  }
);

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      return {
        user: response.user,
        tokens: response.tokens,
      };
    } catch (error) {
      return rejectWithValue(AuthService.getErrorMessage(error));
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(data);
      return {
        user: response.user,
        tokens: response.tokens,
      };
    } catch (error) {
      return rejectWithValue(AuthService.getErrorMessage(error));
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(AuthService.getErrorMessage(error));
    }
  }
);

// Refresh tokens thunk
export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshTokens();
      return {
        tokens: response.tokens,
        user: response.user || null,
      };
    } catch (error) {
      return rejectWithValue(AuthService.getErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (
      state,
      action: PayloadAction<{ user: User; tokens: Tokens }>
    ) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
    });
    builder.addCase(initializeAuth.rejected, (state, action) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Even if backend logout fails, we clear local state
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });

    // Refresh Tokens
    builder.addCase(refreshTokens.fulfilled, (state, action) => {
      state.tokens = action.payload.tokens;
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      }
    });
    builder.addCase(refreshTokens.rejected, (state) => {
      // If refresh fails, clear auth
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, setAuth, clearAuth } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
