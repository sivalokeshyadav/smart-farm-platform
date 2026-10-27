import { baseApi } from '../../../services/baseApi';
import { Feedback } from '../../../types';

export interface FeedbackSummary {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: Record<number, number>;
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<Feedback[], { module?: string; targetId?: string } | void>({
      query: (params) => ({
        url: '/feedbacks',
        params: params || {},
      }),
      providesTags: ['SupportCase'],
    }),
    getFeedbackSummary: builder.query<FeedbackSummary, { module?: string; targetId?: string } | void>({
      query: (params) => ({
        url: '/feedbacks/summary',
        params: params || {},
      }),
      providesTags: ['SupportCase'],
    }),
    submitFeedback: builder.mutation<Feedback, Partial<Feedback>>({
      query: (body) => ({
        url: '/feedbacks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
    moderateFeedback: builder.mutation<any, { feedbackId: string; status: string; moderationNotes?: string }>({
      query: ({ feedbackId, ...body }) => ({
        url: `/feedbacks/${feedbackId}/moderate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCase'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbacksQuery,
  useGetFeedbackSummaryQuery,
  useSubmitFeedbackMutation,
  useModerateFeedbackMutation,
} = feedbackApi;
