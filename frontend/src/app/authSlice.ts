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

// Default pilot user: Farmer Ramesh Reddy (Kurnool)
const initialUser: User = {
  id: "pilot_farmer_1",
  phone: "9876543210",
  name: "Ramesh Reddy",
  role: "FARMER",
  roles: ["FARMER"],
  pendingRoles: [],
  state: "Andhra Pradesh",
  district: "Kurnool",
  mandal: "Kurnool Rural",
  village: "Ulchala",
  preferredLanguage: "en"
};

const initialState: AuthState = {
  token: localStorage.getItem('token') || 'pilot-demo-token-kurnool',
  user: initialUser,
  language: ((localStorage.getItem('lang') === 'te' ? 'en' : localStorage.getItem('lang')) as Language) || 'en',
  activeRole: 'FARMER'
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
      if (action.payload.user.preferredLanguage) {
        state.language = action.payload.user.preferredLanguage || "en";
        localStorage.setItem('lang', action.payload.user.preferredLanguage);
      }
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
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
      if (state.user) {
        state.user.role = action.payload;
      }
    }
  }
});

export const { setCredentials, logout, setLanguage, switchRole } = authSlice.actions;
export default authSlice.reducer;
