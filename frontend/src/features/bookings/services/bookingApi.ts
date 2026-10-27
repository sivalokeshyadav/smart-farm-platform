import { baseApi } from '../../../services/baseApi';
import { Booking } from '../../../types';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<Booking, any>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Slot'],
    }),
    getMyBookings: builder.query<Booking[], void>({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),
    lookupBookingByToken: builder.query<Booking, string>({
      query: (token) => `/bookings/reference/${token}`,
    }),
    checkInBooking: builder.mutation<Booking, { token: string; notes?: string }>({
      query: ({ token, notes }) => ({
        url: `/bookings/reference/${token}/check-in`,
        method: 'POST',
        body: { verificationNotes: notes },
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation<Booking, { bookingId: string; newStatus: string; notes?: string; reason?: string }>({
      query: ({ bookingId, ...body }) => ({
        url: `/bookings/${bookingId}/status`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
    recordBookingNegotiation: builder.mutation<Booking, { bookingId: string; traderName: string; agreedRatePerQuintal: number; notes?: string }>({
      query: ({ bookingId, ...body }) => ({
        url: `/bookings/${bookingId}/negotiation`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation<any, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Booking', 'Slot'],
    }),
    getAllBookings: builder.query<Booking[], { marketId?: string; date?: string; status?: string } | void>({
      query: (params) => ({
        url: '/bookings/all',
        params: params || {},
      }),
      providesTags: ['Booking'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useLookupBookingByTokenQuery,
  useLazyLookupBookingByTokenQuery,
  useCheckInBookingMutation,
  useUpdateBookingStatusMutation,
  useRecordBookingNegotiationMutation,
  useCancelBookingMutation,
  useGetAllBookingsQuery,
} = bookingApi;
