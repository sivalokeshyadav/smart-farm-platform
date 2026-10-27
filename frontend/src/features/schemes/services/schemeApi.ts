import { baseApi } from '../../../services/baseApi';
import { Scheme, SchemeCase } from '../../../types';

export const schemeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchemes: builder.query<
      Scheme[],
      { jurisdiction?: string; category?: string; state?: string; district?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/schemes',
        params: params || {},
      }),
    }),
    getSchemeById: builder.query<Scheme, string>({
      query: (id) => `/schemes/${id}`,
    }),
    runSchemePreCheck: builder.mutation<
      any,
      { schemeId: string; landHoldingAcres: number; ownsAadhaar: boolean; isTenantFarmer: boolean }
    >({
      query: ({ schemeId, ...body }) => ({
        url: `/schemes/${schemeId}/pre-check`,
        method: 'POST',
        body,
      }),
    }),
    createSchemeCase: builder.mutation<SchemeCase, any>({
      query: (body) => ({
        url: '/schemes/cases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SchemeCase'],
    }),
    getMySchemeCases: builder.query<SchemeCase[], void>({
      query: () => '/schemes/cases/my',
      providesTags: ['SchemeCase'],
    }),
    getAllSchemeCases: builder.query<SchemeCase[], { status?: string } | void>({
      query: (params) => ({
        url: '/schemes/cases/all',
        params: params || {},
      }),
      providesTags: ['SchemeCase'],
    }),
    updateCaseStatus: builder.mutation<SchemeCase, { caseId: string; newStatus: string; notes?: string; evidence?: any }>({
      query: ({ caseId, ...body }) => ({
        url: `/schemes/cases/${caseId}/status`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SchemeCase'],
    }),
    assignCaseOperator: builder.mutation<SchemeCase, { caseId: string; operatorId: string; operatorName: string }>({
      query: ({ caseId, ...body }) => ({
        url: `/schemes/cases/${caseId}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SchemeCase'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSchemesQuery,
  useGetSchemeByIdQuery,
  useRunSchemePreCheckMutation,
  useCreateSchemeCaseMutation,
  useGetMySchemeCasesQuery,
  useGetAllSchemeCasesQuery,
  useUpdateCaseStatusMutation,
  useAssignCaseOperatorMutation,
} = schemeApi;
