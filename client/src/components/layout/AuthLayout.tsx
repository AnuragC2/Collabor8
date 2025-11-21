import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Outlet />
    </div>
  );
}

export default AuthLayout;