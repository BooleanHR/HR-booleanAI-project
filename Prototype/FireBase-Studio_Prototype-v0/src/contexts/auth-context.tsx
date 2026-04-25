'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { users } from '@/lib/mock-data';
import type { User } from '@/types';
import { Icons } from '@/components/icons';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      setUser(userToStore as User);
      try {
        localStorage.setItem('user', JSON.stringify(userToStore));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      router.push('/dashboard');
    } else {
      setLoading(false);
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    router.push('/login');
  };
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
