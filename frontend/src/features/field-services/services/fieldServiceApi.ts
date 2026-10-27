import { baseApi } from '../../../services/baseApi';
import { FieldService } from '../../../types';

export const fieldServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFieldServices: builder.query<
      FieldService[],
      { serviceType?: string; status?: string; mine?: boolean } | void
    >({
      query: (params) => ({
        url: '/field-services',
        params: params || {},
      }),
      providesTags: ['SupportCase'],
    }),
    getFieldServiceById: builder.query<FieldService, string>({
      query: (id) => `/field-services/${id}`,
    }),
    createFieldService: builder.mutation<FieldService, Partial<FieldService>>({
      query: (body) => ({
        url: '/field-services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
    assignServiceProvider: builder.mutation<
      FieldService,
      { id: string; providerId: string; providerName: string; providerRole: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/field-services/${id}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
    updateFieldServiceStatus: builder.mutation<
      FieldService,
      { id: string; newStatus: string; notes?: string; locationEvidence?: any; customerConfirmation?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/field-services/${id}/status`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFieldServicesQuery,
  useGetFieldServiceByIdQuery,
  useCreateFieldServiceMutation,
  useAssignServiceProviderMutation,
  useUpdateFieldServiceStatusMutation,
} = fieldServiceApi;
