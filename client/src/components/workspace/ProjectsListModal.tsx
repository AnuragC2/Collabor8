import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  CircularProgress,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getWorkspaceProjects } from "../../api/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function ProjectsListModal({ open, onClose, workspaceId }: Props) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["workspace-projects", workspaceId],
    queryFn: () => getWorkspaceProjects(workspaceId),
    enabled: open && !!workspaceId,
  });

  const projects = data || [];

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>Workspace Projects</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        ) : projects.length === 0 ? (
          <Typography className="text-center py-8" color="text.secondary">
            No projects yet. Create your first project!
          </Typography>
        ) : (
          <List>
            {projects.map((project: any) => (
              <ListItem key={project._id} disablePadding>
                <ListItemButton onClick={() => handleProjectClick(project._id)}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    secondary={project.description || "No description"}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
