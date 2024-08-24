import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const videoApi = createApi({
  reducerPath: 'videoApi',
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
    getAllVideos: builder.query({
      query: ({ page = 1, limit = 9, query = "" } = {}) => ({
        url: '/videos/',
        params: { page, limit, query },
      }),
    }),
    uploadVideo: builder.mutation({
      query: (videoData) => ({
        url: '/videos/upload-video',
        method: 'POST',
        body: videoData,
      }),
    }),
    getUserVideos: builder.query({
      query: (userId) => `/videos/uservideos/${userId}`,
      providesTags: ['video'] 
    }),
    getVideoById: builder.query({
      query: (videoId) => `/videos/${videoId}`,
      providesTags: ['videoById']
    }),
    deleteVideoById: builder.mutation({
      query: (videoId) => ({
        url: `/videos/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['video']
    }),
    updateVideoById: builder.mutation({
      query: ({videoId, videoData}) => ({
        url: `/videos/${videoId}`,
        method: 'PATCH',
        body: videoData,
      }),
      invalidatesTags: ['videoById']
    }),
    incViews: builder.mutation({
      query: (videoId) => ({
        url: `/videos/views/${videoId}`,
        method: 'PATCH',
      }),
    }),
    toggelSubscription: builder.mutation({
      query: (channelId) => ({
        url: `/subscriptions/c/${channelId}`,
        method: 'POST',
      }),
    }),
    setWatchHistory: builder.mutation({
      query: (videoId) => ({
        url: `/videos/add-wh/${videoId}`,
        method: 'PATCH',
      }),
    }),
  }),
});
  
export const {
  useGetAllVideosQuery,
  useUploadVideoMutation,
  useGetUserVideosQuery,
  useGetVideoByIdQuery,
  useIncViewsMutation,
  useToggelSubscriptionMutation,
  useDeleteVideoByIdMutation,
  useUpdateVideoByIdMutation,
  useSetWatchHistoryMutation,
} = videoApi;
