'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store';
import { AppDispatch } from '../../store';
import { initializeAuth } from '../../store/slices/authSlice';

// Inner component that drives auth initialization — lives inside <Provider>
function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useRef(false);

  // Dispatch initializeAuth exactly ONCE per app mount.
  // This is the single source of truth — useAuth() hook no longer does this.
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  // ⚠️ DO NOT block rendering on isLoading.
  // Individual components (Header, etc.) already show their own skeleton/spinner
  // for the auth section while isLoading is true.
  return <>{children}</>;
}

// Main provider — wraps with Redux then kicks off auth
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

export default AuthProvider;
