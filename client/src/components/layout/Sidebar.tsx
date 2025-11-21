import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { useSidebar } from "../../providers/SidebarProvider";
import { useSidebarData } from "../../hooks/useSidebarData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CreateWorkspaceModal } from '../layout/workspace/CreateWorkspaceModal'

export default function Sidebar() {
  const { open, setOpen } = useSidebar();
  const { workspacesQuery, useProjectsQueries } = useSidebarData();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const navigate = useNavigate();

  const workspaces = workspacesQuery.data || [];

  // Fetch all workspace projects in parallel using useQueries
  const projectsQueries = useProjectsQueries(workspaces.map((w: {_id: string }) => w._id));

  return (
    <>
        <Drawer
        variant="persistent"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
            width: 260,
            "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            },
        }}
        >
        <div className="p-4 text-xl font-semibold border-b">Workspaces</div>

        <List className="overflow-y-auto flex-1">
            {workspacesQuery.isLoading && (
            <div className="flex justify-center p-4">
                <CircularProgress size={24} />
            </div>
            )}

            {workspaces.map((ws: {_id: string; name: string;}, index: number) => {
            const projectQuery = projectsQueries[index];
            const projects = projectQuery?.data || [];

            return (
                <Accordion key={ws._id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className="font-medium">{ws.name}</Typography>
                </AccordionSummary>

                <AccordionDetails className="pl-3">
                    {/* Workspace Overview */}
                    <ListItemButton
                    onClick={() => navigate(`/workspace/${ws._id}`)}
                    >
                    <ListItemText primary="Workspace Overview" />
                    </ListItemButton>

                    {/* Projects */}
                    {projectQuery?.isLoading ? (
                    <Typography className="text-sm text-gray-500 pl-3">
                        Loading projects...
                    </Typography>
                    ) : (
                    projects.map((project: any) => (
                        <ListItemButton
                        key={project._id}
                        sx={{ pl: 2 }}
                        onClick={() => navigate(`/project/${project._id}`)}
                        >
                        <ListItemText primary={project.name} />
                        </ListItemButton>
                    ))
                    )}

                    {/* Add project */}
                    <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ mt: 1, ml: 1 }}
                    onClick={() => navigate(`/workspace/${ws._id}/new-project`)}
                    >
                    Add Project
                    </Button>
                </AccordionDetails>
                </Accordion>
            );
            })}
        </List>

        {/* Add Workspace Button */}
        <div className="p-4 border-t">
            <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateModal(true)}
                >
                Add Workspace
            </Button>
        </div>
        </Drawer>
        <CreateWorkspaceModal
            open={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
        />
    </>
  );
}
