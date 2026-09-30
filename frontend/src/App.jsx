import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Interns from "./pages/Interns.jsx";
import InternDetails from "./pages/InternDetails.jsx";
import Mentors from "./pages/Mentors.jsx";
import Departments from "./pages/Departments.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Tasks from "./pages/Tasks.jsx";
import Attendance from "./pages/Attendance.jsx";
import WeeklyReports from "./pages/WeeklyReports.jsx";
import Evaluations from "./pages/Evaluations.jsx";
import Documents from "./pages/Documents.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<ProtectedRoute roles={["admin", "mentor"]} />}>
            <Route path="/interns" element={<Interns />} />
            <Route path="/interns/:id" element={<InternDetails />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/departments" element={<Departments />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "mentor"]} />}>
            <Route path="/projects" element={<Projects />} />
          </Route>
          <Route path="/projects/:id" element={<ProjectDetails />} />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<WeeklyReports />} />

          <Route element={<ProtectedRoute roles={["admin", "mentor"]} />}>
            <Route path="/evaluations" element={<Evaluations />} />
          </Route>

          <Route element={<ProtectedRoute roles={["intern"]} />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
