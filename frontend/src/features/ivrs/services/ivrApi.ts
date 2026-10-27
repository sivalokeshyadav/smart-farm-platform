import { baseApi } from '../../../services/baseApi';

export const ivrApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ivrSimulatorStep: builder.mutation<
      any,
      {
        sessionId: string;
        callerPhone: string;
        inputDigit?: string;
        voiceText?: string;
        consentSms?: boolean;
      }
    >({
      query: (body) => ({
        url: '/ivrs/simulator/step',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useIvrSimulatorStepMutation,
} = ivrApi;
