import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSidebar } from "../../providers/SidebarProvider";

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const { open } = useSidebar(); // Get sidebar state

  return (
    <Box className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <Box 
        className="flex-1 flex flex-col"
        sx={{
          marginLeft: open ? `${DRAWER_WIDTH}px` : 0,
          transition: 'margin 0.3s ease', // Smooth transition
        }}
      >
        <Topbar />

        <Box className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}