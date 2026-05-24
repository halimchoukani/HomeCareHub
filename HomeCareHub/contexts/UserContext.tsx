import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_URL } from '../constants/api';
import storage from './storage';

interface User {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface UserContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: Record<string, unknown>) => {
    const token = userData.access as string;
    const resourceResponse = await fetch(`${API_URL}/api/auth/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const resourceData: User = await resourceResponse.json();
    setUser(resourceData);
    await storage.setItem('user', JSON.stringify(resourceData));
    await storage.setItem('token', JSON.stringify(token));
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem('user');
    await storage.removeItem('token');
  };

  const value: UserContextType = {
    user,
    role: user?.role || null,
    loading,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
