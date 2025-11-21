import { useQuery, useQueries } from "@tanstack/react-query";
import { getMyWorkspaces, getWorkspaceProjects } from "../api/workspaces";

export const useSidebarData = () => {
  // Fetch all workspaces
  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: getMyWorkspaces,
  });

  // A helper: for the Sidebar to call useQueries()
  const useProjectsQueries = (workspaceIds: string[]) =>
    useQueries({
      queries: workspaceIds.map((id) => ({
        queryKey: ["projects", id],
        queryFn: () => getWorkspaceProjects(id),
        enabled: !!id,
      })),
    });

  return { workspacesQuery, useProjectsQueries };
};