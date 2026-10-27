import { baseApi } from '../../../services/baseApi';

export const marketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarkets: builder.query<
      any[],
      { state?: string; district?: string; commodity?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/markets',
        params: params || {},
      }),
      providesTags: ['Slot'],
    }),
    getMarketLocations: builder.query<Record<string, string[]>, void>({
      query: () => '/markets/locations',
    }),
    getMarketAvailability: builder.query<any[], { marketId: string; date: string; commodity?: string }>({
      query: ({ marketId, date, commodity }) => ({
        url: `/markets/${marketId}/availability`,
        params: { date, commodity },
      }),
      providesTags: ['Slot'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMarketsQuery,
  useGetMarketLocationsQuery,
  useGetMarketAvailabilityQuery,
} = marketApi;
