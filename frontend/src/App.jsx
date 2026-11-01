import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { useAuth } from "./context/AuthContext";

import "./App.css";
import "./design-system.css";

function AppLayout() {
  // The mobile drawer is "open" only for the path it was opened on,
  // so any route change closes it automatically.
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
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

           <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
           />

          <Route
            path="/kanban"
            element={<Kanban />}
          />

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/team"
            element={<Team />}
          />

          {/* unknown workspace URLs fall back to the dashboard */}
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
  const {
    isAuthenticated,
    loggedOut,
  } = useAuth();

  if (!isAuthenticated) {
    // signed out on purpose -> landing page; otherwise -> login
    return (
      <Navigate
        to={loggedOut ? "/" : "/login"}
        replace
      />
    );
  }

  return <AppLayout />;
}

// Vite exposes the configured base ("/Task-Management-App/" on GitHub Pages,
// "/" if the app is ever served from a domain root). React Router needs the
// same value as its basename so every route works in dev and in production.
const ROUTER_BASENAME =
  import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Routes>
        {/* public landing page */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/*"
          element={<ProtectedApp />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
