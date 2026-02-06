import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { createWorkspace } from "../../api/workspaces";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [defaultVisibility, setDefaultVisibility] =
    useState<"public" | "private">("private");

  const [loading, setLoading] = useState(false);

  // Auto-generate slug
  useEffect(() => {
    setSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }, [name]);

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);

    try {
      await createWorkspace({
        name,
        slug,
        description,
        settings: {
          allowGuestAccess,
          defaultProjectVisibility: defaultVisibility,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      onClose();

      // Reset form
      setName("");
      setSlug("");
      setDescription("");
      setAllowGuestAccess(false);
      setDefaultVisibility("private");
    } catch (err) {
      console.error(err);
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
      <DialogTitle>Create Workspace</DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-4 pt-2">
          {/* Name */}
          <TextField
            label="Workspace Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          {/* Slug */}
          <TextField
            label="Slug"
            fullWidth
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="This will appear in the workspace URL"
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Allow Guest Access */}
          <FormControlLabel
            control={
              <Switch
                checked={allowGuestAccess}
                onChange={() => setAllowGuestAccess(!allowGuestAccess)}
              />
            }
            label="Allow Guest Access"
          />

          {/* Default Project Visibility */}
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
          {loading ? "Creating..." : "Create Workspace"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateWorkspaceModal;
