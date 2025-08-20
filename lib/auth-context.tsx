'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { superAdminAPI } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      console.log('Auth check - Token found:', token ? 'Yes' : 'No');
      if (token) {
        try {
          console.log('Auth check - Calling getProfile...');
          const response = await superAdminAPI.getProfile();
          console.log('Auth check - Profile response:', response.user ? 'Success' : 'Failed');
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await superAdminAPI.login(email, password);
      const { token, user: userData } = response;
      
      console.log('Login response token:', token ? 'Present' : 'Missing');
      
      // Store token in cookie
      Cookies.set('token', token, { expires: 1 }); // 1 day
      
      console.log('Token stored, verifying:', Cookies.get('token') ? 'Success' : 'Failed');
      
      // Set user data
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 