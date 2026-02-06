import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, CircularProgress, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getWorkspaces } from "../../api/workspaces";
import { CreateWorkspaceModal } from "../../components/workspace/CreateWorkspaceModal";

export default function Home() {
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  const workspaces = workspacesQuery.data ?? [];

  const emptyState = useMemo(() => !workspacesQuery.isLoading && workspaces.length === 0, [workspacesQuery.isLoading, workspaces.length]);

  return (
    <Box className="p-2 md:p-4 max-w-4xl">
      <Box className="flex items-start justify-between gap-3">
        <Box>
          <Typography variant="h5" className="font-bold">
            Home
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a workspace to start working.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          New Workspace
        </Button>
      </Box>

      <Card variant="outlined" className="mt-4">
        <CardContent>
          {workspacesQuery.isLoading ? (
            <Box className="flex justify-center py-8">
              <CircularProgress />
            </Box>
          ) : emptyState ? (
            <Box className="py-6">
              <Typography variant="h6" className="mb-1">
                Create your first workspace
              </Typography>
              <Typography color="text.secondary" className="mb-3">
                A workspace contains projects and tasks for your team.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
                Create Workspace
              </Button>
            </Box>
          ) : (
            <List>
              {workspaces.map((ws) => (
                <ListItem key={ws._id} disablePadding>
                  <ListItemButton onClick={() => navigate(`/workspace/${ws._id}`)}>
                    <ListItemText primary={ws.name} secondary={ws.description || `/${ws.slug}`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <CreateWorkspaceModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </Box>
  );
}
