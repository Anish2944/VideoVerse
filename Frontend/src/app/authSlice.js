import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
      user: null,
      isAuthenticated: false,
    },
    reducers: {
      login: (state, action) => {
        console.log('Reducer login action:', action.payload); // Debug log
        state.user = action.payload; // Update the state with the user data
        state.isAuthenticated = true;
      },
      logout: (state) => {
        state.user = null;
        state.isAuthenticated = false;
      },
    },
  });
  
  export const { login, logout } = authSlice.actions;
  export default authSlice.reducer;
  