import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Registration from "./components/Registration";
import Login from "./components/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { useDispatch } from "react-redux";
import { useLazyGetCurrentUserQuery } from "./services/userApi";
import { useEffect } from "react";
import { login } from "./app/authSlice";
import UserProfile from "./pages/UserProfile";
import Footer from "./components/Footer";

function App() {
  const dispatch = useDispatch();
  const [getCurrentUser] = useLazyGetCurrentUserQuery();

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
  }, [dispatch, getCurrentUser]);

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
              <div className="flex justify-center items-center h-full">
                <Registration />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="flex justify-center items-center h-full">
                <Login />
              </div>
            }
          />
          <Route path="/myprofile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
