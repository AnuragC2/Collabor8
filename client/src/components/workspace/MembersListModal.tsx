import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { removeMember, updateMemberRole } from "../../api/workspaces";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/SnackbarProvider";

interface Member {
  _id?: string;
  userId: {
    _id: string;
    name?: string;
    email: string;
  };
  role: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  members: Member[];
}

export function MembersListModal({ open, onClose, workspaceId, members }: Props) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: Member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await removeMember(workspaceId, selectedMember.userId._id);
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      showSnackbar("Member removed successfully", "success");
      handleMenuClose();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to remove member", "error");
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedMember) return;

    try {
      await updateMemberRole(workspaceId, selectedMember.userId._id, newRole);
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      showSnackbar("Member role updated successfully", "success");
      handleMenuClose();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to update role", "error");
    }
  };

  return (
    <>
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
        <DialogTitle>Workspace Members ({members.length})</DialogTitle>

        <DialogContent>
          {members.length === 0 ? (
            <Typography className="text-center py-8" color="text.secondary">
              No members yet
            </Typography>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem
                  key={member._id || member.userId._id}
                  secondaryAction={
                    member.role !== "Owner" && (
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, member)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {member.userId.name?.charAt(0).toUpperCase() || 
                       member.userId.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.userId.name || member.userId.email}
                    secondary={member.userId.email}
                  />
                  <Chip
                    label={member.role}
                    color={member.role === "Owner" ? "primary" : "default"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleChangeRole("Admin")}>
          Make Admin
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole("Member")}>
          Make Member
        </MenuItem>
        <MenuItem onClick={handleRemoveMember} sx={{ color: "error.main" }}>
          Remove Member
        </MenuItem>
      </Menu>
    </>
  );
}
