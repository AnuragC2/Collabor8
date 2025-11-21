import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "../../providers/ThemeProvider";
import { useSidebar } from "../../providers/SidebarProvider";
import avatar from './avatar.png'

const DRAWER_WIDTH = 240;

export default function Topbar() {
  const { mode, setMode } = useThemeMode();
  const { open } = useSidebar();

  const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");

  return (
    <AppBar
    position="fixed"
    elevation={0}
    color="inherit"
    sx={{
        width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        ml: open ? `${DRAWER_WIDTH}px` : 0,
        backgroundColor: 'background.default',
        borderBottom: "1px solid rgba(0,0,0,0.1)",
    }}
    >
      <Toolbar sx={{ display: "flex", position: "relative" }}>
  
        <div style={{ width: "32px" }} />

        {/* Centered title */}
        <Typography
            variant="h6"
            sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            }}
        >
            Collaborator
        </Typography>

        {/* Right section */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <IconButton onClick={toggleTheme}>
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            <IconButton sx={{ p: 0.5 }}>
            <img
                src={avatar}
                alt="profile"
                style={{
                width: "32px",
                height: "32px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.1)",
                }}
            />
            </IconButton>
        </div>
        </Toolbar>
    </AppBar>
  );
}