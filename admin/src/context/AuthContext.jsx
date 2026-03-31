import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Проверка токена при загрузке
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Проверка валидности токена
  const verifyToken = async () => {
    try {
      const response = await api.verifyToken();
      if (response.data.valid) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Логин
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка авторизации' 
      };
    }
  };

  // Логаут
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Проверка авторизации
  const isAuthenticated = () => {
    return !!user;
  };

  // Проверка роли
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      verifyToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
