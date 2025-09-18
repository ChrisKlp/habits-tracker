'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { SelfUserDto } from '@/types';
import { ApiError } from '../api/api-error';
import { authService } from './auth-client';

interface AuthContextType {
  user: SelfUserDto | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelfUserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await authService.login(email, password);
    } catch (error) {
      toast.error((error as ApiError).message, {
        position: 'top-right',
      });
      setUser(null);
    }
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshAuth = async () => {
    try {
      await authService.refreshToken();
    } catch (error) {
      setUser(null);
      toast.error((error as ApiError).message, {
        position: 'top-right',
      });
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // const interval = setInterval(
    //   () => {
    //     if (user) {
    //       refreshAuth();
    //     }
    //   },
    //   59 * 60 * 1000
    // );

    // return () => clearInterval(interval);
  }, [checkAuth, user]);

  return (
    <AuthContext
      value={{
        user,
        login,
        logout,
        loading,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
