import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, login as authLogin, logout as authLogout, register as authRegister, getCurrentUser } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name?: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const current = await getCurrentUser();
      if (!mounted) return;
      setUser(current);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload: { name?: string; email: string; password: string }) => {
    const u = await authRegister(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
