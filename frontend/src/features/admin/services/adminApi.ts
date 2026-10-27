import { baseApi } from '../../../services/baseApi';
import { User } from '../../../types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminKPIs: builder.query<any, void>({
      query: () => '/admin/summary-kpis',
    }),
    getAdminAuditLogs: builder.query<any[], void>({
      query: () => '/admin/audit-logs',
    }),
    overrideCapacity: builder.mutation<
      any,
      { marketId: string; date: string; slotTime: string; newCapacity: number; reason: string }
    >({
      query: (body) => ({
        url: '/admin/override-capacity',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Slot'],
    }),
    getUsers: builder.query<User[], { role?: string; pendingOnly?: boolean; search?: string } | void>({
      query: (params) => ({
        url: '/admin/users',
        params: params ? { role: params.role, pending_only: params.pendingOnly, search: params.search } : {},
      }),
      providesTags: ['SupportCase'],
    }),
    approveUserRole: builder.mutation<any, { userId: string; role: string; approved: boolean; rejectionReason?: string }>({
      query: (body) => ({
        url: '/admin/users/approve-role',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
    toggleUserStatus: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: ['SupportCase'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminKPIsQuery,
  useGetAdminAuditLogsQuery,
  useOverrideCapacityMutation,
  useGetUsersQuery,
  useApproveUserRoleMutation,
  useToggleUserStatusMutation,
} = adminApi;
