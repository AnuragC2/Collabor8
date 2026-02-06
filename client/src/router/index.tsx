import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/dashboard/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import WorkspaceDashboard from "../pages/workspace/workspaceDashboard";
import ProjectBoard from "../pages/project/ProjectBoard";
import TaskPage from "../pages/task/TaskPage";
import AcceptInvite from "../pages/invites/AcceptInvite";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/workspace/:workspaceId", element: <WorkspaceDashboard /> },
          { path: "/project/:projectId", element: <ProjectBoard /> },
          { path: "/task/:taskId", element: <TaskPage /> },
          { path: "/invites/accept", element: <AcceptInvite /> },
        ],
      },
    ],
  },
]);
