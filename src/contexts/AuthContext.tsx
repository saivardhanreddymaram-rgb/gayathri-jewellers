import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getCurrentUser, logout as apiLogout } from '../api/auth';
import type { User } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'INITIALIZED' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'INITIALIZED':
      return { ...state, initialized: true, loading: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    initialized: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await getCurrentUser();
      dispatch({ type: 'SET_USER', user });
    } catch {
      dispatch({ type: 'SET_USER', user: null });
    }
  }, []);

  // Bootstrap — check if there is an existing session
  useEffect(() => {
    (async () => {
      await refreshUser();
      dispatch({ type: 'INITIALIZED' });
    })();
  }, [refreshUser]);

  // Listen for 401 events from the API client
  useEffect(() => {
    const handler = () => dispatch({ type: 'SET_USER', user: null });
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const signIn = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', user });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      dispatch({ type: 'SET_USER', user: null });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshUser,
    isAdmin: state.user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
