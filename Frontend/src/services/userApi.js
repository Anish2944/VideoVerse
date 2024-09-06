import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

// 1. Base query setup with credentials for secure requests
const baseQuery = fetchBaseQuery({
  baseUrl: `${backendURL}/api/v1/users`,
  credentials: 'include', // Ensures cookies are included in requests
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`); // Add token to headers
    }
    return headers;
  },
});

// 2. Base query with automatic token refresh handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If access token is expired, refresh the token
  if (result.error && result.error.status === 401) {
    // Try refreshing the token from cookies
    let refreshResult = await baseQuery(
      { url: '/refresh-token', method: 'POST', credentials: 'include' },
      api,
      extraOptions
    );
    //If failed to get it from cookie then get it from body
    if (result.error && result.error.status === 401) {
      // Call the mutation that refreshes the access token
       refreshResult = await api.dispatch(
        userApi.endpoints.refreshAccessToken.initiate()
      );
    }
    console.log('Refresh token result:', refreshResult);


    if (refreshResult?.data?.data) {
      // Retry the original request with the new token
      localStorage.setItem('token', refreshResult?.data?.data?.accessToken);
      localStorage.setItem('refreshtoken', refreshResult?.data?.data?.refreshToken);
      result = await baseQuery(args, api, extraOptions);
      console.log('Result after refresh:', result);
    } else {
      // Handle failed refresh (e.g., log out the user)
      api.dispatch(userApi.util.resetApiState());
      localStorage.removeItem('token')
      localStorage.removeItem('refreshtoken')
    }
  }

  return result;
};

// 3. Create the API slice
export const userApi = createApi({
  reducerPath: 'userApi',
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
      providesTags: ['UserProfile'],
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
        body: { refreshToken: localStorage.getItem('refreshtoken') },
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
      invalidatesTags: ['UserProfile'],
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
    getWatchHistory: builder.query({
      query: () => `/watch-history`,
    })
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
  useGetWatchHistoryQuery
} = userApi;
