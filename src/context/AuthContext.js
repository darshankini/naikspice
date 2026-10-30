import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api } from '../api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pos_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (username, password) => {
    const { token, user } = await api.post('/auth/login', { username, password });
    localStorage.setItem('pos_token', token);
    localStorage.setItem('pos_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
