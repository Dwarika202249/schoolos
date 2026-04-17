import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { authStart, authSuccess, authFailure, logout as logoutAction, clearError } from '../store/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
  school: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const login = async (credentials: any) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, school } = response.data.data;
      dispatch(authSuccess({ user, school, token: accessToken }));
      toast.success('Welcome back!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(authFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: any) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken, school } = response.data.data;
      dispatch(authSuccess({ user, school, token: accessToken }));
      toast.success('School registered successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(authFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
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
