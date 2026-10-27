import { baseApi } from '../../../services/baseApi';

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<any[], string | void>({
      query: (category) => ({
        url: '/marketplace/products',
        params: category && category !== 'ALL' ? { category } : {},
      }),
      providesTags: ['Product'],
    }),
    createOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: '/marketplace/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    getMyOrders: builder.query<any[], void>({
      query: () => '/marketplace/orders/my',
      providesTags: ['Order'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
} = marketplaceApi;
