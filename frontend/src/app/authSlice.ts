import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../i18n/translations';

export type UserRole =
  | 'FARMER'
  | 'CROP_BUYER'
  | 'CROP_SELLER'
  | 'LIVESTOCK_BUYER'
  | 'LIVESTOCK_SELLER'
  | 'EQUIPMENT_BUYER'
  | 'EQUIPMENT_SELLER'
  | 'VETERINARIAN'
  | 'MARKET_STAFF'
  | 'GODOWN_OPERATOR'
  | 'DELIVERY_WORKER'
  | 'HELP_DESK_OPERATOR'
  | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  pendingRoles?: string[];
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  preferredLanguage?: Language;
}

interface AuthState {
  token: string | null;
  user: User | null;
  language: Language;
  activeRole: UserRole;
}

// Safely retrieve stored user and role from localStorage
const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem('token');
const storedUser = getStoredUser();
const storedRole = (localStorage.getItem('activeRole') as UserRole) || null;

const initialState: AuthState = {
  token: storedToken || null,
  user: storedUser || null,
  language: ((localStorage.getItem('lang') === 'te' ? 'en' : localStorage.getItem('lang')) as Language) || 'en',
  activeRole: storedRole || (storedUser ? storedUser.role : 'FARMER'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.activeRole = action.payload.user.role;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('activeRole', action.payload.user.role);
      if (action.payload.user.preferredLanguage) {
        state.language = action.payload.user.preferredLanguage || 'en';
        localStorage.setItem('lang', action.payload.user.preferredLanguage);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeRole');
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      localStorage.setItem('lang', action.payload);
      if (state.user) {
        state.user.preferredLanguage = action.payload;
      }
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
      localStorage.setItem('activeRole', action.payload);
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, logout, setLanguage, switchRole } = authSlice.actions;
export default authSlice.reducer;
