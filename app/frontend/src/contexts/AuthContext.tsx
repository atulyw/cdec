import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../utils/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    const storedToken = localStorage.getItem('token');
    console.log('[AuthContext] Stored token:', storedToken ? 'Present' : 'Not found');
    
    if (storedToken) {
      // Verify token and get user info
      verifyToken();
    } else {
      console.log('[AuthContext] No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    console.log('[AuthContext] Verifying token...');
    try {
      const response = await authApi.get<User>('/me');
      console.log('[AuthContext] Token verification response:', response);
      
      if (response.success && response.data) {
        console.log('[AuthContext] Token valid, setting user:', response.data);
        setUser(response.data);
        setError(null);
      } else {
        console.log('[AuthContext] Token invalid, removing from storage');
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('[AuthContext] Token verification error:', error);
      localStorage.removeItem('token');
      setError('Failed to verify session. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[AuthContext] Attempting login for:', email);
    setError(null);
    
    try {
      const response = await authApi.post<{ token: string; user: User }>('/login', {
        email,
        password,
      });

      console.log('[AuthContext] Login response:', response);
      console.log('[AuthContext] Response data structure:', JSON.stringify(response.data, null, 2));

      if (response.success && response.data) {
        // Handle different response structures
        let newToken, userData;
        
        if (response.data.token && response.data.user) {
          // Standard structure: { token: "...", user: {...} }
          newToken = response.data.token;
          userData = response.data.user;
        } else if (response.data.user) {
          // Alternative structure: { user: {...} }
          newToken = response.data.token || localStorage.getItem('token');
          userData = response.data.user;
        } else {
          // Fallback: treat data as user object directly
          newToken = localStorage.getItem('token');
          userData = response.data;
        }
        
        console.log('[AuthContext] Extracted token:', newToken);
        console.log('[AuthContext] Extracted user:', userData);
        
        if (newToken && userData && typeof userData === 'object' && 'id' in userData && 'email' in userData && 'name' in userData) {
          console.log('[AuthContext] Login successful, storing token and setting user');
          localStorage.setItem('token', newToken);
          setUser(userData as User);
          setError(null);
          return { success: true };
        } else {
          console.error('[AuthContext] Missing token or user data in response');
          setError('Invalid response from server');
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        const errorMessage = response.error || 'Login failed';
        console.error('[AuthContext] Login failed:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error during login';
      console.error('[AuthContext] Login error:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[AuthContext] Attempting registration for:', email);
    setError(null);
    
    try {
      const response = await authApi.post<{ token: string; user: User }>('/register', {
        name,
        email,
        password,
      });

      console.log('[AuthContext] Registration response:', response);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        console.log('[AuthContext] Registration successful, storing token and setting user');
        localStorage.setItem('token', newToken);
        setUser(userData);
        setError(null);
        return { success: true };
      } else {
        const errorMessage = response.error || 'Registration failed';
        console.error('[AuthContext] Registration failed:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error during registration';
      console.error('[AuthContext] Registration error:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out user');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
