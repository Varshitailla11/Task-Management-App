
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Kanban from "./pages/Kanban";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { useAuth } from "./context/AuthContext";

import "./App.css";
import "./design-system.css";

function AppLayout() {
  const { pathname } = useLocation();
  const [openPath, setOpenPath] = useState(null);
  const navOpen = openPath === pathname;

  return (
    <div className="app">
      <Sidebar
        open={navOpen}
        onClose={() => setOpenPath(null)}
      />

      <main className="main">
        <Navbar onMenuClick={() => setOpenPath(pathname)} />

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedApp() {
  const { isAuthenticated, loggedOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={loggedOut ? "/" : "/login"}
        replace
      />
    );
  }

  return <AppLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;
