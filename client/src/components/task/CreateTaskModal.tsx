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
import { useSnackbar } from "../../providers/SnackbarProvider";
import { useQueryClient } from "@tanstack/react-query";
import { createTask, type TaskPriority, type TaskType } from "../../api/tasks";

interface AssigneeOption {
  id: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  assignees: AssigneeOption[];
}

export function CreateTaskModal({ open, onClose, projectId, assignees }: Props) {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setType("task");
    setPriority("medium");
    setAssigneeId("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        assigneeId: assigneeId || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      showSnackbar("Task created", "success");
      handleClose();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to create task", "error");
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
      <DialogTitle>Create Task</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 pt-2">
          <TextField
            label="Title"
            fullWidth
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value as TaskType)}>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="feature">Feature</MenuItem>
                <MenuItem value="story">Story</MenuItem>
                <MenuItem value="epic">Epic</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <MenuItem value="lowest">Lowest</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="highest">Highest</MenuItem>
              </Select>
            </FormControl>
          </div>
          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={assigneeId}
              label="Assignee"
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {assignees.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !title.trim()}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
