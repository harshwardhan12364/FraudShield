import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/client';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'reporter' | 'analyst' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  isAnalystOrAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
      localStorage.setItem('fs_user', JSON.stringify(res.data));
    } catch {
      // Check cached session
      const cached = localStorage.getItem('fs_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);
      await fetchMe();
    } catch (err: any) {
      // If backend is offline / unreachable, fallback to demo session
      if (!err.response || err.code === 'ERR_NETWORK') {
        const role = email.includes('admin')
          ? 'admin'
          : email.includes('analyst')
          ? 'analyst'
          : 'reporter';
        const mockUser: User = {
          id: 'USR-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          email,
          display_name: email.split('@')[0],
          role,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('fs_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // offline
    }
    localStorage.removeItem('fs_user');
    setUser(null);
  };

  const register = async (email: string, displayName: string, password: string) => {
    try {
      await authApi.register({ email, display_name: displayName, password });
    } catch (err: any) {
      // If backend is offline / unreachable, save registration locally
      if (!err.response || err.code === 'ERR_NETWORK') {
        const mockUser: User = {
          id: 'USR-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          email,
          display_name: displayName || email.split('@')[0],
          role: 'reporter',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('fs_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      throw err;
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    register,
    isAnalystOrAdmin: user?.role === 'analyst' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
