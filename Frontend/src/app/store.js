import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { userApi } from '../services/userApi';  // Import your RTK Query API slice
import authreducer from './authSlice';
import { videoApi } from '../services/videoApi';
import { LikeNCommentApi } from '../services/LikeNCommentApi';
import { playlistApi } from '../services/playlistapi';

const store = configureStore({
  reducer: {
    auth: authreducer,
    // Add the RTK Query API slice reducer here
    [userApi.reducerPath]: userApi.reducer,
    [videoApi.reducerPath]: videoApi.reducer,
    [playlistApi.reducerPath]: playlistApi.reducer,
    [LikeNCommentApi.reducerPath]: LikeNCommentApi.reducer,
  },
  // Adding the userApi middleware enables caching, invalidation, polling, and other features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(videoApi.middleware)
      .concat(LikeNCommentApi.middleware)
      .concat(playlistApi.middleware),
});

setupListeners(store.dispatch);

export default store;
