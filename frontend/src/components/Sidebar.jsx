
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Columns3,
  CalendarDays,
  BarChart3,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      label: "My Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
      label: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      label: "Kanban Board",
      icon: Columns3,
      path: "/kanban",
    },
    {
      label: "Calendar",
      icon: CalendarDays,
      path: "/calendar",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      label: "Team",
      icon: Users,
      path: "/team",
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          T
        </div>

        <div className="brand-info">
          <h2>TaskFlow</h2>
          <span>Workspace</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="sidebar-section">

        <p className="sidebar-section-title">
          WORKSPACE
        </p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                className={`sidebar-item ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM AREA */}
      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-item settings-item"
          onClick={() => alert("Settings coming soon!")}
        >
          <Settings
            size={19}
            strokeWidth={1.8}
          />

          <span>Settings</span>
        </button>

        {/* UPGRADE CARD */}
        <div className="upgrade-card">

          <div className="upgrade-icon">
            <Sparkles
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <h3>Upgrade Workspace</h3>

          <p>
            Unlock advanced productivity
            features.
          </p>

          <button
            type="button"
            className="upgrade-button"
          >
            Upgrade
          </button>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;