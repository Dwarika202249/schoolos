import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  school: any | null;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);

  // Check for existing session (simplified)
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      // In a real app, verify token or fetch profile
      setIsAuthenticated(true);
      setUser({ firstName: 'Admin', lastName: 'User', role: 'OWNER' });
    }
  }, []);

  const login = (data: any) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setSchool(data.school);
    localStorage.setItem('accessToken', data.accessToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSchool(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, school, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
