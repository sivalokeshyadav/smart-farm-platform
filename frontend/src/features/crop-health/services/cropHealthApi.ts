import { baseApi } from '../../../services/baseApi';

export const cropHealthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    analyzeCropHealth: builder.mutation<any, any>({
      query: (body) => ({
        url: '/crop-diagnoses/analyze',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CropDiagnosis'],
    }),
    getMyCropDiagnoses: builder.query<any[], void>({
      query: () => '/crop-diagnoses/my',
      providesTags: ['CropDiagnosis'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAnalyzeCropHealthMutation,
  useGetMyCropDiagnosesQuery,
} = cropHealthApi;
