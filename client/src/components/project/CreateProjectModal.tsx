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
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { createProject, type ProjectVisibility } from "../../api/projects";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  defaultVisibility?: ProjectVisibility;
}

const toKey = (name: string) => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  const initial = words.map((w) => w[0]).join("");
  const key = (initial.length >= 2 ? initial : words[0].slice(0, 4)).toUpperCase();
  return key.replace(/[^A-Z0-9]/g, "").slice(0, 10);
};

export function CreateProjectModal({ open, onClose, workspaceId, defaultVisibility }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>(defaultVisibility || "private");
  const [loading, setLoading] = useState(false);

  const autoKey = useMemo(() => toKey(name), [name]);

  useEffect(() => {
    if (!key) setKey(autoKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoKey]);

  useEffect(() => {
    if (defaultVisibility) setVisibility(defaultVisibility);
  }, [defaultVisibility]);

  const reset = () => {
    setName("");
    setKey("");
    setDescription("");
    setVisibility(defaultVisibility || "private");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !key.trim()) return;

    setLoading(true);
    try {
      const project = await createProject(workspaceId, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
        visibility,
      });
      await queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      showSnackbar("Project created", "success");
      handleClose();
      navigate(`/project/${project._id}`);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to create project", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
    >
      <DialogTitle>Create Project</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 pt-2">
          <TextField
            label="Project Name"
            fullWidth
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Project Key"
            fullWidth
            value={key}
            onChange={(e) => setKey(e.target.value)}
            helperText="Used in task keys (e.g. PROJ-1). 2–10 chars recommended."
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={visibility}
              label="Visibility"
              onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !name.trim() || !key.trim()}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

