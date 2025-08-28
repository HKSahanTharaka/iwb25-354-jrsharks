// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    console.log('AuthProvider: Initializing from localStorage');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthProvider: Stored token exists:', !!storedToken);
    console.log('AuthProvider: Stored user exists:', !!storedUser);
    
    if (storedToken) {
      console.log('AuthProvider: Setting token from localStorage');
      setToken(storedToken);
    }
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthProvider: Setting user from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
    console.log('AuthProvider: Initialization complete');
  }, []);

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    login,
    logout,
    setUser,
  }), [token, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}


