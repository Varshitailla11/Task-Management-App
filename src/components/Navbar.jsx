import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const pageNames = {
    "/": "Dashboard",
    "/tasks": "My Tasks",
    "/projects": "Projects",
    "/kanban": "Kanban Board",
    "/calendar": "Calendar",
    "/analytics": "Analytics",
    "/team": "Team",
  };

  const currentPage =
    pageNames[location.pathname] ||
    "Dashboard";

  const userName =
    user?.name || "User";

  const userEmail =
    user?.email || "";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();

  const handleLogout = () => {
    logout();

    navigate("/login");

    setProfileOpen(false);
  };

  return (
    <header className="navbar">

      {/* LEFT */}
      <div className="breadcrumb">

        <span>
          Workspace
        </span>

        <span className="breadcrumb-slash">
          /
        </span>

        <strong>
          {currentPage}
        </strong>

      </div>


      {/* RIGHT */}
      <div className="navbar-right">

        {/* SEARCH */}
        <div className="search-box">

          <Search
            size={16}
            strokeWidth={1.8}
          />

          <input
            type="text"
            placeholder="Search tasks..."
          />

          <span className="search-shortcut">
            Ctrl K
          </span>

        </div>


        {/* NOTIFICATION */}
        <button
          type="button"
          className="notification-button"
          onClick={() =>
            alert(
              "No new notifications"
            )
          }
          aria-label="Notifications"
        >
          <Bell
            size={19}
            strokeWidth={1.8}
          />

          <span className="notification-dot" />

        </button>


        {/* PROFILE */}
        <div className="profile-wrapper">

          <button
            type="button"
            className="profile"
            onClick={() =>
              setProfileOpen(
                !profileOpen
              )
            }
            aria-expanded={
              profileOpen
            }
          >

            <div className="profile-avatar">
              {userInitial}
            </div>

            <div className="profile-info">

              <strong>
                {userName}
              </strong>

              <span>
                Administrator
              </span>

            </div>

            <ChevronDown
              size={15}
              className={`profile-arrow ${
                profileOpen
                  ? "profile-arrow-open"
                  : ""
              }`}
            />

          </button>


          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div className="profile-dropdown">

              <div className="profile-dropdown-header">

                <div className="profile-dropdown-avatar">
                  {userInitial}
                </div>

                <div className="profile-dropdown-user">

                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {userEmail}
                  </span>

                </div>

              </div>


              <div className="profile-dropdown-divider" />


              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >

                <LogOut
                  size={16}
                  strokeWidth={1.8}
                />

                <span>
                  Logout
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;