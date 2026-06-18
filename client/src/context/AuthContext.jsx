import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [token]);

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      // Ensure user always has _id for easy access
      const userData = { ...res.data, id: res.data._id || res.data.id };
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user', error);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const login = (newToken, userData) => {
    setToken(newToken);
    const normalizedUser = { ...userData, id: userData._id || userData.id };
    setUser(normalizedUser);
    localStorage.setItem('token', newToken);
  };

  const register = (newToken, userData) => {
    setToken(newToken);
    const normalizedUser = { ...userData, id: userData._id || userData.id };
    setUser(normalizedUser);
    localStorage.setItem('token', newToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      refreshUser 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
