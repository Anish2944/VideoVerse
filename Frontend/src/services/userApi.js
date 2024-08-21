// userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

// 1. Base query setup with credentials for secure requests
const baseQuery = fetchBaseQuery({
  baseUrl: `${backendURL}/api/v1/users`,
  credentials: 'include', // Ensures cookies are included in requests
});

// 2. Base query with automatic token refresh handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If access token is expired, refresh the token
  if (result.error && result.error.status === 401) {
    // Try refreshing the token
    const refreshResult = await baseQuery(
      { url: '/refresh-token', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Handle failed refresh (e.g., log out the user)
      api.dispatch(userApi.util.resetApiState()); // Corrected: userApi instead of apiSlice
      // Optionally redirect to login or show a logout message
    }
  }

  return result;
};

// 3. Create the API slice
export const userApi = createApi({
  reducerPath: 'userApi', // Use a meaningful name for the reducerPath
  baseQuery: baseQueryWithReauth, // Use the enhanced base query
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response) => {
        console.error('Register user error:', response);
        return response;
      },
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/current-user',
      providesTags: ['UserProfile'], // Use this tag to invalidate and refetch user profile data
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    refreshAccessToken: builder.mutation({
      query: () => ({
        url: '/refresh-token',
        method: 'POST',
      }),
    }),
    getChannelProfile: builder.query({
      query: (username) => `/chprofile/${username}`,
      providesTags: ['UserProfile'],
    }),
    updateAccDetails: builder.mutation({
      query: (data) => ({
        url: '/update-Acc-details',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['UserProfile'], // Invalidate and refetch user profile data
    }),
    updateCoverImage: builder.mutation({
      query: (file) => ({
        url: '/update-coverImage',
        method: 'PATCH',
        body: file,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    updateAvatar: builder.mutation({
      query: (file) => ({
        url: '/update-avatar',
        method: 'PATCH',
        body: file,
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useLoginUserMutation,
  useLazyGetCurrentUserQuery,
  useLogoutUserMutation,
  useRegisterUserMutation,
  useRefreshAccessTokenMutation,
  useGetChannelProfileQuery,
  useUpdateAccDetailsMutation,
  useUpdateCoverImageMutation,
  useUpdateAvatarMutation,
} = userApi;
