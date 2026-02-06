import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getProjectById } from "../../api/projects";
import { getProjectTasks, type Task, type TaskStatus } from "../../api/tasks";
import { CreateTaskModal } from "../../components/task/CreateTaskModal";

const STATUSES: Array<{ key: TaskStatus; label: string }> = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
  { key: "cancelled", label: "Cancelled" },
];

const statusChipColor = (status: TaskStatus) => {
  switch (status) {
    case "todo":
      return "default";
    case "in_progress":
      return "primary";
    case "in_review":
      return "warning";
    case "done":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export default function ProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [openCreateTask, setOpenCreateTask] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => getProjectTasks(projectId!, { parentTaskId: null }),
    enabled: !!projectId,
  });

  const project = projectQuery.data;
  const tasks = tasksQuery.data ?? [];

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const s of STATUSES) map.set(s.key, []);
    for (const task of tasks) {
      const list = map.get(task.status) || [];
      list.push(task);
      map.set(task.status, list);
    }
    return map;
  }, [tasks]);

  const assignees = useMemo(() => {
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
  }, [project]);

  if (projectQuery.isLoading || tasksQuery.isLoading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (projectQuery.error || !project) {
    return (
      <Box className="flex justify-center items-center h-full">
        <Typography variant="h6" color="error">
          Failed to load project
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="p-2 md:p-4">
      <Box className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold">
            {project.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.key} • {project.visibility}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateTask(true)}>
          New Task
        </Button>
      </Box>

      {project.description && (
        <Typography variant="body1" className="mt-2" color="text.secondary">
          {project.description}
        </Typography>
      )}

      <Divider className="my-4" />

      <Box
        className="grid gap-3"
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        {STATUSES.map((col) => {
          const colTasks = grouped.get(col.key) ?? [];
          return (
            <Box key={col.key} className="min-w-0">
              <Box className="flex items-center justify-between mb-2">
                <Typography variant="subtitle2" className="font-semibold">
                  {col.label}
                </Typography>
                <Chip label={colTasks.length} size="small" />
              </Box>
              <Box className="flex flex-col gap-2">
                {colTasks.map((t) => (
                  <Card
                    key={t._id}
                    variant="outlined"
                    className="cursor-pointer hover:shadow-sm"
                    onClick={() => navigate(`/task/${t._id}`)}
                  >
                    <CardContent className="p-3">
                      <Box className="flex items-center justify-between gap-2">
                        <Typography variant="subtitle2" className="font-medium truncate">
                          {t.title}
                        </Typography>
                        <Chip label={t.status} size="small" color={statusChipColor(t.status)} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {t.key}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      <CreateTaskModal
        open={openCreateTask}
        onClose={() => setOpenCreateTask(false)}
        projectId={projectId!}
        assignees={assignees}
      />
    </Box>
  );
}

