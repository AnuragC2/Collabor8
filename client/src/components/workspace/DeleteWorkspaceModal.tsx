import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { deleteWorkspace } from "../../api/workspaces";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/SnackbarProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  workspaceName: string | null;
}

export function DeleteWorkspaceModal({ open, onClose, workspaceId, workspaceName }: Props) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!workspaceId) return;

    setLoading(true);

    try {
      await deleteWorkspace(workspaceId);
      
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      showSnackbar("Workspace deleted successfully", "success");
      onClose();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to delete workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>Delete Workspace</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{workspaceName}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}