import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { getTaskById, updateTaskStatus, assignTask, unassignTask, type TaskStatus } from "../../api/tasks";
import { getProjectById } from "../../api/projects";
import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
  type Comment,
} from "../../api/comments";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "in_review", "done", "cancelled"];

function CommentNode({
  comment,
  onReply,
  onUpdate,
  onDelete,
}: {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const author =
    typeof comment.authorId === "string"
      ? "Unknown"
      : comment.authorId.name || comment.authorId.email;

  return (
    <Box className="rounded-md border p-3">
      <Box className="flex items-start justify-between gap-2">
        <Box className="min-w-0">
          <Typography variant="subtitle2" className="font-semibold truncate">
            {author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(comment.createdAt).toLocaleString()}
            {comment.isEdited ? " • edited" : ""}
          </Typography>
        </Box>
        <Box className="flex items-center gap-1">
          <IconButton size="small" onClick={() => setReplyOpen((v) => !v)} aria-label="reply">
            <ReplyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setEditText(comment.content);
              setEditOpen(true);
            }}
            aria-label="edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(comment._id)} aria-label="delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {editOpen ? (
        <Box className="mt-2 flex flex-col gap-2">
          <TextField
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Box className="flex gap-2">
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={async () => {
                await onUpdate(comment._id, editText);
                setEditOpen(false);
              }}
              disabled={!editText.trim()}
            >
              Save
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" className="mt-2 whitespace-pre-wrap">
          {comment.content}
        </Typography>
      )}

      {replyOpen && (
        <Box className="mt-3 flex flex-col gap-2">
          <TextField
            label="Reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Box className="flex gap-2">
            <Button
              size="small"
              variant="contained"
              onClick={async () => {
                await onReply(comment._id, replyText);
                setReplyText("");
                setReplyOpen(false);
              }}
              disabled={!replyText.trim()}
            >
              Reply
            </Button>
            <Button size="small" variant="outlined" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {comment.replies?.length ? (
        <Box className="mt-3 flex flex-col gap-2 pl-4 border-l">
          {comment.replies.map((r) => (
            <CommentNode
              key={r._id}
              comment={r}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export default function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [newComment, setNewComment] = useState("");

  const taskQuery = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId!),
    enabled: !!taskId,
  });

  const task = taskQuery.data;
  const projectId = useMemo(() => {
    if (!task) return null;
    return typeof task.projectId === "string" ? task.projectId : task.projectId._id;
  }, [task]);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });

  const commentsQuery = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => getTaskComments(taskId!, true),
    enabled: !!taskId,
  });

  const assignees = useMemo(() => {
    const project = projectQuery.data;
    if (!project) return [];
    const options: Array<{ id: string; label: string }> = [];
    const push = (u: any) => {
      if (!u) return;
      const id = typeof u === "string" ? u : u._id;
      const label = u.name ? `${u.name} (${u.email})` : u.email;
      if (!options.some((o) => o.id === id)) options.push({ id, label });
    };
    push(project.leadId);
    for (const m of project.members || []) push(m.userId);
    return options;
  }, [projectQuery.data]);

  const updateStatusMutation = useMutation({
    mutationFn: (status: TaskStatus) => updateTaskStatus(taskId!, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      if (projectId) await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      showSnackbar("Status updated", "success");
    },
    onError: (err: any) => showSnackbar(err?.response?.data?.message || "Failed to update status", "error"),
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string) => assignTask(taskId!, assigneeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      if (projectId) await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      showSnackbar("Assignee updated", "success");
    },
    onError: (err: any) => showSnackbar(err?.response?.data?.message || "Failed to assign", "error"),
  });

  const unassignMutation = useMutation({
    mutationFn: () => unassignTask(taskId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      if (projectId) await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      showSnackbar("Unassigned", "success");
    },
    onError: (err: any) => showSnackbar(err?.response?.data?.message || "Failed to unassign", "error"),
  });

  const onReply = async (parentId: string, content: string) => {
    try {
      await createComment(taskId!, { content, parentCommentId: parentId });
      await queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      showSnackbar("Reply added", "success");
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to reply", "error");
    }
  };

  const onUpdate = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      await queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      showSnackbar("Comment updated", "success");
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to update comment", "error");
    }
  };

  const onDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      await queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      showSnackbar("Comment deleted", "success");
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to delete comment", "error");
    }
  };

  if (taskQuery.isLoading || commentsQuery.isLoading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (taskQuery.error || !task) {
    return (
      <Box className="flex justify-center items-center h-full">
        <Typography variant="h6" color="error">
          Failed to load task
        </Typography>
      </Box>
    );
  }

  const comments = (commentsQuery.data ?? []) as Comment[];
  const assigneeId =
    typeof task.assigneeId === "string" ? task.assigneeId : task.assigneeId?._id || "";

  return (
    <Box className="p-2 md:p-4 max-w-5xl">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Card variant="outlined">
        <CardContent>
          <Box className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <Box className="min-w-0">
              <Typography variant="h5" className="font-bold">
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.key}
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Chip label={task.type} size="small" />
              <Chip label={task.priority} size="small" />
            </Box>
          </Box>

          {task.description ? (
            <Typography className="mt-3 whitespace-pre-wrap">{task.description}</Typography>
          ) : (
            <Typography className="mt-3" color="text.secondary">
              No description
            </Typography>
          )}

          <Divider className="my-4" />

          <Box className="grid gap-3 md:grid-cols-2">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={task.status}
                label="Status"
                onChange={(e) => updateStatusMutation.mutate(e.target.value as TaskStatus)}
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeId}
                label="Assignee"
                onChange={(e) => {
                  const value = e.target.value as string;
                  if (!value) return unassignMutation.mutate();
                  return assignMutation.mutate(value);
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {assignees.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" className="mt-4">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            Comments
          </Typography>

          <Box className="flex flex-col gap-2">
            <TextField
              label="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Box className="flex justify-end">
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await createComment(taskId!, { content: newComment });
                    setNewComment("");
                    await queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
                    showSnackbar("Comment added", "success");
                  } catch (err: any) {
                    showSnackbar(err?.response?.data?.message || "Failed to add comment", "error");
                  }
                }}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </Box>
          </Box>

          <Divider className="my-4" />

          <Box className="flex flex-col gap-2">
            {comments.length === 0 ? (
              <Typography color="text.secondary">No comments yet</Typography>
            ) : (
              comments.map((c) => (
                <CommentNode
                  key={c._id}
                  comment={c}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

