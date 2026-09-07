import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smarthire_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('smarthire_token');
      const storedUser = localStorage.getItem('smarthire_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend silently
          const res = await authService.getCurrentUser();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('smarthire_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, resetting token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response && response.success && response.data) {
        const { accessToken, ...userData } = response.data;
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('smarthire_token', accessToken);
        localStorage.setItem('smarthire_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (registerData) => {
    setError(null);
    try {
      const response = await authService.register(registerData);
      if (response && response.success && response.data) {
        const { accessToken, ...userData } = response.data;
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('smarthire_token', accessToken);
        localStorage.setItem('smarthire_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const quickDemoLogin = async (roleType) => {
    if (roleType === 'hr') {
      return login('hr@smarthire.ai', 'password123');
    } else {
      return login('candidate@smarthire.ai', 'password123');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('smarthire_user');
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getFullProfile();
      if (res && res.data) {
        setUser(res.data);
        localStorage.setItem('smarthire_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
