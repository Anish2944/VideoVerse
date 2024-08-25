import React, { useCallback, useContext, useState } from "react";
import { HiOutlineMenuAlt1, HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import { TfiSearch } from "react-icons/tfi";
import { RxCross2 } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutUserMutation } from "../services/userApi"; // Adjust path to your API service
import { logout } from "../app/authSlice";
import { SearchContext } from "../context/SearchContext";

const Navbar = () => {
  const [logoutUser] = useLogoutUserMutation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showSearchBar = location.pathname === "/";
  const { setSearchQuery } = useContext(SearchContext);
  const [inputValue, setInputValue] = useState("");
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  const handleSearchToggle = () => {
    setMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleCloseSearch = () => {
    setMobileSearchOpen(false);
    setInputValue("");
  };

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser().unwrap();
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login"); // Redirect to login page on successful logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, navigate]);

  return (
    <div className="navbar bg-base-200 sticky top-0 z-10 ">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <HiOutlineMenuAlt1 className="text-2xl" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-m dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/">Homepage</Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/myprofile">Profile</Link>
                </li>
                <li>
                  <Link to="/upload-video">upload video</Link>
                </li>
                <li>
                  <Link to="/playlists">Playlist</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="navbar-center text-primary">
        <Link to="/" className={`${
                !isMobileSearchOpen ? "flex" : "hidden"
              } sm:block font-bold text-2xl`}>
          Videoverse
        </Link>
      </div>
      <div className="navbar-end gap-2">
        {showSearchBar && (
          <>
            <form
              onSubmit={handleSearch}
              className={`${
                isMobileSearchOpen ? "flex" : "hidden"
              } sm:flex items-center gap-2`}
            >
              <label className="relative flex items-center">
                <input
                  type="text"
                  className="input input-bordered w-40 md:w-40 lg:w-60 p-2 text-sm bg-base-200 placeholder-gray-400 rounded-lg"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search..."
                />
                <button
                  type="submit"
                  className="absolute right-3 text-gray-500 hover:text-gray-300"
                >
                  <TfiSearch className="text-lg" />
                </button>
              </label>
            </form>
            {!isMobileSearchOpen && (
              <button
                className="sm:hidden btn rounded-full block"
                onClick={handleSearchToggle}
              >
                <TfiSearch className="text-xl" />
              </button>
            )}
            {isMobileSearchOpen && (
              <button
                className="sm:hidden btn rounded-full block"
                onClick={handleSearchToggle}
              >
                <RxCross2 className="text-xl" />
              </button>
            )}
          </>
        )}

        <label className="swap swap-rotate">
          {/* this hidden checkbox controls the state */}
          <input
            type="checkbox"
            className="theme-controller"
            onChange={(e) => {
              if (e.target.checked) {
                document.documentElement.setAttribute("data-theme", "light");
              } else {
                document.documentElement.setAttribute("data-theme", "dark");
              }
            }}
          />

          {/* sun icon */}
          <HiOutlineSun className="swap-on h-6 w-6 sm:h-7 sm:w-12 fill-current" />

          {/* moon icon */}
          <HiOutlineMoon className="swap-off h-6 w-6 sm:h-7 sm:w-12 fill-current" />
        </label>
        {isAuthenticated && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 sm:w-16 rounded-full">
                <Link to="/myprofile">
                  <img alt="User Avatar" src={user?.data?.avatar} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
