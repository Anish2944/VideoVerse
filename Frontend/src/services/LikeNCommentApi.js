import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const LikeNCommentApi = createApi({
  reducerPath: 'likeNcommentapi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendURL}/api/v1`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Assuming you have a token stored in localStorage or a similar place
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getNLikesOnVideoById: builder.query({
      query: (videoId) => `/likes/videolikes/${videoId}`,
      providesTags: ['vLike'],
    }),
    toggelLikeOnVideo: builder.mutation({
      query: (videoId) => ({
        url: `/likes/toggle/v/${videoId}`,
        method: 'POST',
      }),
      invalidatesTags: ['vLike'],
    }),
    getNLikesOnCommentById: builder.query({
      query: (commentId) => `/likes/commentlikes/${commentId}`,
      providesTags: ['cLike'],
    }),
    toggelLikeOnComment: builder.mutation({
      query: (commentId) => ({
        url: `/likes/toggle/c/${commentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['cLike'],
    }),
    getLikedVideos: builder.query({
      query: () => '/likes/likedvideos',
    }),
    getVideoComments: builder.query({
      query: (videoId) => `/comments/${videoId}`,
      providesTags: ['comment'],
    }),
    addVideoComment: builder.mutation({
      query: ({ videoId, content }) => ({
        url: `/comments/${videoId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: ['comment'],
    }),
    updateVideoComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: `/comments/c/${commentId}`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: ['comment'],
    }),
    deleteVideoComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/c/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['comment'],
    }),
  }),
});

export const {
  useGetNLikesOnVideoByIdQuery,
  useToggelLikeOnVideoMutation,
  useGetNLikesOnCommentByIdQuery,
  useToggelLikeOnCommentMutation,
  useGetVideoCommentsQuery,
  useAddVideoCommentMutation,
  useUpdateVideoCommentMutation,
  useDeleteVideoCommentMutation,
  useGetLikedVideosQuery,
} = LikeNCommentApi;