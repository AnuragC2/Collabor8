import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listWorkspaceInvites, revokeWorkspaceInvite } from "../../api/workspaces";
import { useSnackbar } from "../../providers/SnackbarProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function InvitesListModal({ open, onClose, workspaceId }: Props) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const invitesQuery = useQuery({
    queryKey: ["workspace-invites", workspaceId],
    queryFn: () => listWorkspaceInvites(workspaceId),
    enabled: open && !!workspaceId,
  });

  const invites = invitesQuery.data ?? [];

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/invites/accept?token=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(link);
      showSnackbar("Invite link copied", "success");
    } catch {
      showSnackbar("Failed to copy link", "error");
    }
  };

  const revoke = async (inviteId: string) => {
    try {
      await revokeWorkspaceInvite(workspaceId, inviteId);
      await queryClient.invalidateQueries({ queryKey: ["workspace-invites", workspaceId] });
      showSnackbar("Invite revoked", "success");
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to revoke invite", "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": { borderRadius: 2 },
      }}
    >
      <DialogTitle>Workspace Invites</DialogTitle>
      <DialogContent>
        {invitesQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        ) : invites.length === 0 ? (
          <Typography className="text-center py-8" color="text.secondary">
            No invites yet
          </Typography>
        ) : (
          <List>
            {invites.map((invite) => (
              <ListItem
                key={invite._id}
                secondaryAction={
                  <div className="flex items-center gap-1">
                    <IconButton
                      size="small"
                      onClick={() => copyLink(invite.token)}
                      aria-label="copy invite link"
                      disabled={invite.status !== "pending"}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => revoke(invite._id)}
                      aria-label="revoke invite"
                      disabled={invite.status !== "pending"}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                }
              >
                <ListItemText
                  primary={invite.email}
                  secondary={`Role: ${invite.role} • Expires: ${new Date(invite.expiresAt).toLocaleDateString()}`}
                />
                <Chip
                  label={invite.status}
                  size="small"
                  color={invite.status === "pending" ? "primary" : "default"}
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
  );
}

