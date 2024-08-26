import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetCurrentUserQuery } from "./services/userApi";
import { useEffect, useState } from "react";
import { login } from "./app/authSlice";

import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute.jsx";

import { UserProfile, OthersProfile, NotFound,
   Home, Login, Registration, StreamingPage, VideoForm,
    UpdateVideo, Playlists, ViewPlaylist} from './pages/index.js'

import { SearchProvider } from './context/SearchContext.jsx'

function App() {
  const dispatch = useDispatch();
  const [getCurrentUser] = useLazyGetCurrentUserQuery();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await getCurrentUser();

          if (res.data) {
            dispatch(login(res.data));
          } else {
            console.error("No user data received:", res);
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
      }
    };
    fetchCurrentUser();
  }, [dispatch, getCurrentUser, token]);

  return (
    <SearchProvider>  
    <div className="flex flex-col bg-base-100 min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex justify-center items-center h-full">
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="flex justify-center items-center min-h-screen">
                <Registration />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="flex justify-center min-h-screen items-center">
                <Login />
              </div>
            }
          />
          <Route path="/myprofile" element={
          <PrivateRoute>
            <UserProfile/>
          </PrivateRoute>} 
          />
          <Route path="/chprofile/:username" element={<OthersProfile />} />
          <Route path="/video/:videoId" element={
            <PrivateRoute>
              <StreamingPage />
            </PrivateRoute>
          } />
          <Route path="/upload-video" element={<VideoForm />} />
          <Route path="/update-video/:videoId" element={
            <PrivateRoute>
              <UpdateVideo />
            </PrivateRoute>
          } />
          <Route path="/playlists" element={
            <PrivateRoute>
              <Playlists />
            </PrivateRoute>
          } />
          <Route path="/playlist/:playlistId" element={
            <PrivateRoute>
              <ViewPlaylist />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  </SearchProvider>
  );
}

export default App;
