import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('raiz_token');
    const storedUser = localStorage.getItem('raiz_user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('raiz_token');
        localStorage.removeItem('raiz_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const { token: jwt, userId, name, email: userEmail, role } = response.data;
    const userData = { userId, name, email: userEmail, role };
    localStorage.setItem('raiz_token', jwt);
    localStorage.setItem('raiz_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (!roles || roles.length === 0) return true;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
