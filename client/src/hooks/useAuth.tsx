import React, { createContext, useContext, useEffect, ReactNode } from 'react';
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
  updateSchoolState: (school: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert hex to HSL for Tailwind variables
const hexToHsl = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; 
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  /**
   * On mount: if we have a token, rehydrate user/school from /auth/me.
   * This handles page refresh and stale localStorage data.
   */
  useEffect(() => {
    const rehydrate = async () => {
      if (auth.token && auth.isAuthenticated) {
        try {
          const response = await api.get('/auth/me');
          const { user, school } = response.data.data;
          dispatch(authSuccess({ user, school, token: auth.token as string }));
        } catch {
          // Token invalid/expired, refresh interceptor will handle or logout
        }
      }
    };
    rehydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Theme Branding Engine:
   * Dynamically injects school primary color into CSS variables
   */
  useEffect(() => {
    if (auth.school?.branding?.primaryColor) {
      const hsl = hexToHsl(auth.school.branding.primaryColor);
      document.documentElement.style.setProperty('--primary', hsl);
    } else {
      // Default blue-violet
      document.documentElement.style.setProperty('--primary', '250 83.2% 53.3%');
    }
  }, [auth.school?.branding?.primaryColor]);

  const login = async (credentials: any) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, school } = response.data.data;
      dispatch(authSuccess({ user, school, token: accessToken }));
      toast.success('Welcome back!');
    } catch (error: any) {
      // Error response shape from docs: { success: false, error: { code, message } }
      const message = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || 'Login failed';
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
      const message = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || 'Registration failed';
      dispatch(authFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call server to clear refresh token cookie
      await api.post('/auth/logout');
    } catch {
      // Best effort — clear local state regardless
    }
    dispatch(logoutAction());
    toast.success('Logged out');
  };

  const updateSchoolState = (school: any) => {
    dispatch(authSuccess({ 
      user: auth.user, 
      school, 
      token: auth.token as string 
    }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, updateSchoolState }}>
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
