import { baseApi } from '../../../services/baseApi';

export interface GodownFilterParams {
  state?: string;
  district?: string;
  commodity?: string;
  search?: string;
}

export const godownApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGodownLocations: builder.query<Record<string, string[]>, void>({
      query: () => '/godowns/locations',
    }),
    getGodowns: builder.query<any[], GodownFilterParams | void>({
      query: (params) => ({
        url: '/godowns',
        params: params || {},
      }),
      providesTags: ['GodownReservation'],
    }),
    reserveGodown: builder.mutation<any, any>({
      query: (body) => ({
        url: '/godowns/reservations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GodownReservation'],
    }),
    cancelGodownReservation: builder.mutation<any, string>({
      query: (reservationId) => ({
        url: `/godowns/reservations/${reservationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GodownReservation'],
    }),
    getMyGodownReservations: builder.query<any[], void>({
      query: () => '/godowns/reservations/my',
      providesTags: ['GodownReservation'],
    }),
    lookupGodownReservationByToken: builder.query<any, string>({
      query: (token) => `/godowns/reference/${token}`,
      providesTags: ['GodownReservation'],
    }),
    updateGodownStatus: builder.mutation<any, { reservationRef: string; newStatus: string; notes?: string }>({
      query: ({ reservationRef, ...body }) => ({
        url: `/godowns/reference/${reservationRef}/status`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GodownReservation'],
    }),
    getAllGodownReservations: builder.query<any[], { godownId?: string } | void>({
      query: (params) => ({
        url: '/godowns/reservations/all',
        params: params || {},
      }),
      providesTags: ['GodownReservation'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGodownLocationsQuery,
  useGetGodownsQuery,
  useReserveGodownMutation,
  useCancelGodownReservationMutation,
  useGetMyGodownReservationsQuery,
  useLookupGodownReservationByTokenQuery,
  useLazyLookupGodownReservationByTokenQuery,
  useUpdateGodownStatusMutation,
  useGetAllGodownReservationsQuery,
} = godownApi;
