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
      query: () => '/videos/', // Use a function for query
    }),
    uploadVideo: builder.mutation({
      query: (videoFile) => ({
        url: '/videos/upload-video',
        method: 'POST',
        body: videoFile,
      }),
    }),
    getUserVideos: builder.query({
      query: () => '/dashboard/videos', // Use a function for query
    }),
    getVideoById: builder.query({
      query: (videoId) => `/videos/${videoId}`,
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
  }),
});
  
export const {
  useGetAllVideosQuery,
  useUploadVideoMutation,
  useGetUserVideosQuery,
  useGetVideoByIdQuery,
  useIncViewsMutation,
  useToggelSubscriptionMutation,
} = videoApi;
