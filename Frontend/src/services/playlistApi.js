import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const playlistApi = createApi({
  reducerPath: 'playlistApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendURL}/api/v1/playlist`,
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
    
    createPlaylist: builder.mutation({
      query: ({ name, videoId }) => ({
        url: '/',
        method: 'POST',
        body: { name, videoId },
      }),
      invalidatesTags: ['createPlaylist']
    }),

    getUserPlaylists: builder.query({
        query: (userId) => `/user/${userId}`,
        providesTags: ['createPlaylist']
    }),
    getPlaylistById: builder.query({
        query: (playlistId) => `/${playlistId}`,
        providesTags: ['Playlist'],
    }),
    updatePlaylist: builder.mutation({
      query: ({playlistId, name, description}) => ({
        url: `/${playlistId}`,
        method: 'PATCH',
        body: { name, description },
      }),
      invalidatesTags: ['Playlist']
    }),
    deletePlaylist: builder.mutation({
      query: (playlistId) => ({
        url: `/${playlistId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['createPlaylist']
    }),
    addVideoToPlaylist: builder.mutation({
      query: ({playlistId, videoId}) => ({
        url: `/add/${videoId}/${playlistId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Playlist']
    }),
    removeVideoFromPlaylist: builder.mutation({
      query: ({playlistId, videoId}) => ({
        url: `/remove/${videoId}/${playlistId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Playlist']
    }),
  }),
});

export const {
    useGetUserPlaylistsQuery,
    useGetPlaylistByIdQuery,
    useUpdatePlaylistMutation,
    useDeletePlaylistMutation,
    useAddVideoToPlaylistMutation,
    useRemoveVideoFromPlaylistMutation,
    useCreatePlaylistMutation,
} = playlistApi;