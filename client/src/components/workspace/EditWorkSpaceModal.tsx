import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Switch, FormControlLabel, RadioGroup, Radio, Typography } from "@mui/material";
import { useState, useEffect } from 'react';
import { updateWorkspace } from "../../api/workspaces";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/SnackbarProvider";

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

interface Props {
  open: boolean;
  onClose: () => void;
  workspace: Workspace | null;
}

export function EditWorkspaceModal({ open, onClose, workspace }: Props) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [defaultVisibility, setDefaultVisibility] = useState<"public" | "private">("private");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Populate form when workspace changes
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setSlug(workspace.slug || "");
      setDescription(workspace.description || "");
      setAllowGuestAccess(workspace.settings?.allowGuestAccess || false);
      setDefaultVisibility(workspace.settings?.defaultProjectVisibility || "private");
      setIsActive(workspace.isActive ?? true);
    }
  }, [workspace]);

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim() || !workspace) return;

    setLoading(true);

    try {
      await updateWorkspace(workspace._id, {
        name,
        slug,
        description,
        settings: {
          allowGuestAccess,
          defaultProjectVisibility: defaultVisibility,
        },
        isActive,
      });

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      showSnackbar("Workspace updated successfully", "success");
      onClose();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to update workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
        '& .MuiDialog-paper': {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>Edit Workspace</DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-4 pt-2">
          <TextField
            label="Workspace Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <TextField
            label="Slug"
            fullWidth
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="This will appear in the workspace URL"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={allowGuestAccess}
                onChange={() => setAllowGuestAccess(!allowGuestAccess)}
              />
            }
            label="Allow Guest Access"
          />

          <div>
            <Typography variant="body1" className="mb-1">
              Default Project Visibility
            </Typography>
            <RadioGroup
              value={defaultVisibility}
              onChange={(e) =>
                setDefaultVisibility(e.target.value as "public" | "private")
              }
            >
              <FormControlLabel
                value="private"
                control={<Radio />}
                label="Private (default)"
              />
              <FormControlLabel
                value="public"
                control={<Radio />}
                label="Public"
              />
            </RadioGroup>
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            }
            label="Workspace Active"
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!name || !slug || loading}
          onClick={handleSubmit}
        >
          {loading ? "Updating..." : "Update Workspace"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
