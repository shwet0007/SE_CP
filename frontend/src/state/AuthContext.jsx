import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, meApi, registerApi } from '../api/auth';
import { setAuthToken } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('shr-user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('shr-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await meApi();
        setUser(me);
      } catch (_) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('shr-user', JSON.stringify(user));
    else localStorage.removeItem('shr-user');
  }, [user]);

  const login = async (email, password) => {
    const u = await loginApi(email, password);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const u = await registerApi(payload);
    setUser(u);
    return u;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
