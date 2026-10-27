import { baseApi } from '../../../services/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOtp: builder.mutation<{ success: boolean; message: string; mockOtp: string }, { phone: string }>({
      query: (body) => ({
        url: '/auth/request-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<any, { phone: string; otp: string; name?: string; role?: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    loginWithPassword: builder.mutation<any, { phone: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    registerUser: builder.mutation<
      any,
      {
        phone: string;
        name: string;
        email?: string;
        password: string;
        state: string;
        district: string;
        mandal?: string;
        village?: string;
        preferredLanguage: string;
        requestedRoles: string[];
      }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<any, void>({
      query: () => '/auth/me',
    }),
    updateProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PUT',
        body,
      }),
    }),
    switchActiveRole: builder.mutation<any, { role: string }>({
      query: (body) => ({
        url: '/auth/switch-role',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useLoginWithPasswordMutation,
  useRegisterUserMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useSwitchActiveRoleMutation,
} = authApi;
