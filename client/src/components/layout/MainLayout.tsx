import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSidebar } from "../../providers/SidebarProvider";

const DRAWER_WIDTH = 240;

export default function MainLayout() {
  const { open } = useSidebar();

  return (
    <Box className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <Box 
        className="flex-1 flex flex-col"
        sx={{
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        }}
      >
        <Topbar />
        {/* Add padding top to account for fixed AppBar */}
        <Box 
          className="flex-1 p-4 overflow-y-auto"
          sx={{ 
            mt: '64px', // Standard AppBar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}