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
   Home, Login, Registration, StreamingPage} from './pages/index.js'

function App() {
  const dispatch = useDispatch();
  const [getCurrentUser] = useLazyGetCurrentUserQuery();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await getCurrentUser(); // Assume this returns a promise with user data

          if (res.data) {
            // Ensure user data contains username or required fields
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex justify-center items-center h-full">
                <Home />
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
          <Route path="/video/:videoId" element={<StreamingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
