import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface AuthSliceState {
  auth?: {
    token?: string | null;
  };
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // Safe state extraction without circular dependency on store.ts RootState
      const state = getState() as AuthSliceState;
      const token = state?.auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Booking',
    'GodownReservation',
    'Order',
    'SchemeCase',
    'Product',
    'SupportCase',
    'Slot',
    'CropDiagnosis',
  ],
  endpoints: () => ({}),
});
