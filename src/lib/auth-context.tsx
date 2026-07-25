'use client';

import { createContext, useContext, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  } | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = {
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    isLoading: status === 'loading',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
