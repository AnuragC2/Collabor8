import client from "./client";

export const getMyWorkspaces = async () => {
  const { data } = await client.get("/workspace/my-workspaces");
  return data.data; // array of workspaces
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const { data } = await client.get(`/project/workspace/${workspaceId}/projects`);
  return data.data; // array of projects
};

export const createWorkspace = async (data: {
  name: string;
  slug: string;
  description?: string;
  settings: {
    allowGuestAccess: boolean;
    defaultProjectVisibility: "public" | "private";
  };
  isActive: boolean;
}) => {
  const res = await client.post("/workspace", data);
  return res.data.data;
};