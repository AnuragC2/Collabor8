import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import FolderIcon from "@mui/icons-material/Folder";
import { getWorkspaceById } from "../../api/workspaces";
import { getWorkspaceProjects } from "../../api/projects";
import { EditWorkspaceModal } from "../../components/workspace/EditWorkSpaceModal";
import { InviteMemberModal } from "../../components/workspace/AddMemberModal";
import { MembersListModal } from "../../components/workspace/MembersListModal";
import { ProjectsListModal } from "../../components/workspace/ProjectsListModal";
import { InvitesListModal } from "../../components/workspace/InvitesListModal";
import { CreateProjectModal } from "../../components/project/CreateProjectModal";

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openMembersListModal, setOpenMembersListModal] = useState(false);
  const [openProjectsListModal, setOpenProjectsListModal] = useState(false);
  const [openInvitesListModal, setOpenInvitesListModal] = useState(false);
  const [openCreateProjectModal, setOpenCreateProjectModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceById(workspaceId!),
    enabled: !!workspaceId,
  });

  const workspace = data;

  const projectsQuery = useQuery({
    queryKey: ["workspace-projects", workspaceId],
    queryFn: () => getWorkspaceProjects(workspaceId!),
    enabled: !!workspaceId,
  });
  const projectsCount = projectsQuery.data?.length ?? 0;

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !workspace) {
    return (
      <Box className="flex justify-center items-center h-full">
        <Typography variant="h6" color="error">
          Failed to load workspace
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="mb-6 flex justify-between items-start">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">
            {workspace.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mb-2">
            {workspace.description || "No description"}
          </Typography>
          <Box className="flex gap-2">
            <Chip
              label={workspace.isActive ? "Active" : "Inactive"}
              color={workspace.isActive ? "success" : "default"}
              size="small"
            />
            <Chip
              label={`/${workspace.slug}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setOpenEditModal(true)}
        >
          Edit Workspace
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-3">
        <Box>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-3">
                <GroupIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {workspace.members?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-3">
                <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {projectsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-3">
                <Box className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Typography variant="h6" color="white">
                    {workspace.settings?.defaultProjectVisibility === "public" ? "🌐" : "🔒"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" className="font-semibold">
                    {workspace.settings?.defaultProjectVisibility || "private"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Default Visibility
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Action Cards */}
      <Box className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-3">
                Team Management
              </Typography>
              <Box className="flex flex-col gap-2">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenInviteModal(true)}
                >
                  Invite Member
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GroupIcon />}
                  onClick={() => setOpenMembersListModal(true)}
                >
                  View All Members
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenInvitesListModal(true)}
                >
                  View Invites
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-3">
                Project Management
              </Typography>
              <Box className="flex flex-col gap-2">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FolderIcon />}
                  onClick={() => setOpenProjectsListModal(true)}
                >
                  View All Projects
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenCreateProjectModal(true)}
                >
                  Create New Project
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Settings Card */}
      <Card className="mt-4">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            Workspace Settings
          </Typography>
          <Box className="flex flex-col gap-2">
            <Box className="flex justify-between items-center py-2 border-b">
              <Typography variant="body1">Guest Access</Typography>
              <Chip
                label={workspace.settings?.allowGuestAccess ? "Enabled" : "Disabled"}
                color={workspace.settings?.allowGuestAccess ? "success" : "default"}
                size="small"
              />
            </Box>
            <Box className="flex justify-between items-center py-2 border-b">
              <Typography variant="body1">Owner</Typography>
              <Typography variant="body2" color="text.secondary">
                {workspace.ownerId?.name || workspace.ownerId?.email || "Unknown"}
              </Typography>
            </Box>
            <Box className="flex justify-between items-center py-2">
              <Typography variant="body1">Created</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditWorkspaceModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        workspace={workspace}
      />

      <InviteMemberModal
        open={openInviteModal}
        onClose={() => setOpenInviteModal(false)}
        workspaceId={workspaceId!}
      />

      <MembersListModal
        open={openMembersListModal}
        onClose={() => setOpenMembersListModal(false)}
        workspaceId={workspaceId!}
        members={workspace.members || []}
      />

      <ProjectsListModal
        open={openProjectsListModal}
        onClose={() => setOpenProjectsListModal(false)}
        workspaceId={workspaceId!}
      />

      <InvitesListModal
        open={openInvitesListModal}
        onClose={() => setOpenInvitesListModal(false)}
        workspaceId={workspaceId!}
      />

      <CreateProjectModal
        open={openCreateProjectModal}
        onClose={() => setOpenCreateProjectModal(false)}
        workspaceId={workspaceId!}
        defaultVisibility={workspace.settings?.defaultProjectVisibility || "private"}
      />
    </Box>
  );
}
