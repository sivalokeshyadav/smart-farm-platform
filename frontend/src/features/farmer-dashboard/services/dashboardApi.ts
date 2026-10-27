import { baseApi } from '../../../services/baseApi';

export interface MandiPriceQueryParams {
  state?: string;
  district?: string;
  commodity?: string;
  category?: string;
  search?: string;
  force_live_sync?: boolean;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeather: builder.query<any, string | void>({
      query: (mandal) => ({
        url: '/info/weather',
        params: { mandal: mandal || 'Kurnool' },
      }),
    }),
    getMandiPrices: builder.query<any, MandiPriceQueryParams | void>({
      query: (params) => ({
        url: '/info/market-prices',
        params: params || {},
      }),
      providesTags: ['MandiPrice' as any],
    }),
    getMandiPriceFilters: builder.query<any, void>({
      query: () => '/info/market-prices/filters',
    }),
    syncMandiPrices: builder.mutation<any, void>({
      query: () => ({
        url: '/info/market-prices/sync',
        method: 'POST',
      }),
      invalidatesTags: ['MandiPrice' as any],
    }),
    getMyNotifications: builder.query<any[], void>({
      query: () => '/notifications/my',
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWeatherQuery,
  useGetMandiPricesQuery,
  useGetMandiPriceFiltersQuery,
  useSyncMandiPricesMutation,
  useGetMyNotificationsQuery,
} = dashboardApi;
