import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

function Navbar({ onMenuClick = () => {} }) {
  const location = useLocation();

  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Ctrl/Cmd + K focuses search (matches the hint in the UI)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // click outside closes the profile menu
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const pageNames = {
    "/dashboard": "Dashboard",
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
    setProfileOpen(false);

    // Clears the session. ProtectedApp then redirects a user who signed
    // out on purpose to the public landing page ("/").
    logout();
  };

  return (
    <header className="navbar">

      {/* LEFT */}
      <button
        type="button"
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

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
            ref={searchRef}
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
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
        <div className="profile-wrapper" ref={profileRef}>

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
