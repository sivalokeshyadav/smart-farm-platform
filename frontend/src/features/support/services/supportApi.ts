import { baseApi } from '../../../services/baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSupportCase: builder.mutation<any, any>({
      query: (body) => ({
        url: '/support-cases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
    getMySupportCases: builder.query<any[], void>({
      query: () => '/support-cases/my',
      providesTags: ['SupportCase'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSupportCaseMutation,
  useGetMySupportCasesQuery,
} = supportApi;
