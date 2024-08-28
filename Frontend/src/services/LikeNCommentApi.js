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
      // Optimistic update for toggling like on a video
      onQueryStarted: async (videoId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          LikeNCommentApi.util.updateQueryData('getNLikesOnVideoById', videoId, (draft) => {
            console.log("onQueryHit")
            draft.likesCount += 1; // Increment like count optimistically
            draft.isLiked = !draft.isLiked; // Toggle like state optimistically
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback if mutation fails
        }
      },
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
      // Optimistic update for toggling like on a comment
      onQueryStarted: async (commentId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          LikeNCommentApi.util.updateQueryData('getNLikesOnCommentById', commentId, (draft) => {
            draft.likesCount += 1; // Increment like count optimistically
            draft.isLiked = !draft.isLiked; // Toggle like state optimistically
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback if mutation fails
        }
      },
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
      // Optimistic update for adding a comment
      onQueryStarted: async ({ videoId, content }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          LikeNCommentApi.util.updateQueryData('getVideoComments', videoId, (draft) => {
            draft.push({ id: 'temp-id', content, createdAt: new Date().toISOString() }); // Add a temporary comment
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback if mutation fails
        }
      },
      invalidatesTags: ['comment'],
    }),
    updateVideoComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: `/comments/c/${commentId}`,
        method: 'PATCH',
        body: { content },
      }),
      // Optimistic update for updating a comment
      onQueryStarted: async ({ commentId, content }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          LikeNCommentApi.util.updateQueryData('getVideoComments', undefined, (draft) => {
            const comment = draft.find((c) => c.id === commentId);
            if (comment) {
              comment.content = content; // Update comment content optimistically
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback if mutation fails
        }
      },
      invalidatesTags: ['comment'],
    }),
    deleteVideoComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/c/${commentId}`,
        method: 'DELETE',
      }),
      // Optimistic update for deleting a comment
      onQueryStarted: async (commentId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          LikeNCommentApi.util.updateQueryData('getVideoComments', undefined, (draft) => {
            return draft.filter((comment) => comment.id !== commentId); // Optimistically remove the comment
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback if mutation fails
        }
      },
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