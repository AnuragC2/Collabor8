import { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Button,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSidebar } from "../../providers/SidebarProvider";
import { useSidebarData } from "../../hooks/useSidebarData";
import { useNavigate } from "react-router-dom";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";
import { WorkspaceMenu } from "../workspace/WorkspaceMenu";
import { DeleteWorkspaceModal } from "../workspace/DeleteWorkspaceModal";
import { EditWorkspaceModal } from "../workspace/EditWorkSpaceModal";

interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
  isActive?: boolean;
}

export default function Sidebar() {
  const { open, setOpen } = useSidebar();
  const { workspacesQuery } = useSidebarData();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const navigate = useNavigate();

  const workspaces: Workspace[] = workspacesQuery.data || [];

  const handleEdit = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setOpenEditModal(true);
  };

  const handleDelete = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setOpenDeleteModal(true);
  };

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

          {workspaces.map((ws) => {
            return (
              <ListItemButton
                key={ws._id}
                onClick={() => navigate(`/workspace/${ws._id}`)}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <ListItemText primary={ws.name} />

                {/* Keep the WorkspaceMenu but prevent its clicks from triggering navigation */}
                <div onClick={(e) => e.stopPropagation()}>
                  <WorkspaceMenu
                    workspaceId={ws._id}
                    workspaceName={ws.name}
                    onEdit={() => handleEdit(ws)}
                    onDelete={() => handleDelete(ws)}
                  />
                </div>
              </ListItemButton>
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

      {/* Modals */}
      <CreateWorkspaceModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />

      <EditWorkspaceModal open={openEditModal} onClose={() => setOpenEditModal(false)} workspace={selectedWorkspace} />

      <DeleteWorkspaceModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        workspaceId={selectedWorkspace?._id || null}
        workspaceName={selectedWorkspace?.name || null}
      />
    </>
  );
}
