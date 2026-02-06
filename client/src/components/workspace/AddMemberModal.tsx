import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { createWorkspaceInvite } from "../../api/workspaces";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/SnackbarProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function InviteMemberModal({ open, onClose, workspaceId }: Props) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Member" | "Admin" | "Guest">("Member");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showSnackbar("Please enter an email", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSnackbar("Please enter a valid email", "error");
      return;
    }

    setLoading(true);

    try {
      const invite = await createWorkspaceInvite(workspaceId, { email, role });
      const link = `${window.location.origin}/invites/accept?token=${encodeURIComponent(invite.token)}`;
      setInviteLink(link);

      queryClient.invalidateQueries({ queryKey: ["workspace-invites", workspaceId] });
      showSnackbar("Invite created successfully", "success");
      
      setEmail("");
      setRole("Member");
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || "Failed to add member",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setRole("Member");
      setInviteLink(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>Invite Member</DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-4 pt-2">
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Member">Member</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Guest">Guest</MenuItem>
            </Select>
          </FormControl>

          {inviteLink && (
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium mb-1">Invite link</div>
              <div className="break-all text-gray-700">{inviteLink}</div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                      showSnackbar("Invite link copied", "success");
                    } catch {
                      showSnackbar("Failed to copy link", "error");
                    }
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!email || loading}
        >
          {loading ? "Creating..." : "Create Invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Backward-compatible export name (used by existing imports)
export const AddMemberModal = InviteMemberModal;
