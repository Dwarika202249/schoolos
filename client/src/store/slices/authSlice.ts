import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  school: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const safeParse = (key: string) => {
  const item = localStorage.getItem(key);
  if (!item || item === 'undefined') return null;
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
};

const initialState: AuthState = {
  user: safeParse('user'),
  school: safeParse('school'),
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: any; school: any; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.school = action.payload.school;
      state.token = action.payload.token;
      
      localStorage.setItem('accessToken', action.payload.token);
      if (action.payload.user) localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.school) localStorage.setItem('school', JSON.stringify(action.payload.school));
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.school = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('school');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { authStart, authSuccess, authFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
