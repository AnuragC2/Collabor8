import client from "./client";

export type ProjectVisibility = "public" | "private";
export type ProjectMemberRole = "lead" | "member";

export interface ProjectMember {
  userId: {
    _id: string;
    name?: string;
    email: string;
  };
  role: ProjectMemberRole;
  joinedAt: string;
  _id?: string;
}

export interface Project {
  _id: string;
  workspaceId: { _id: string; name?: string; slug?: string } | string;
  name: string;
  key: string;
  description?: string;
  status: string;
  leadId: { _id: string; name?: string; email: string } | string;
  members: ProjectMember[];
  visibility: ProjectVisibility;
  startDate?: string;
  targetEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const createProject = async (
  workspaceId: string,
  data: {
    name: string;
    key: string;
    description?: string;
    leadId?: string;
    visibility?: ProjectVisibility;
    startDate?: string;
    targetEndDate?: string;
  }
) => {
  const response = await client.post(`/project/workspace/${workspaceId}/projects`, data);
  return response.data.data as Project;
};

export const getProjectById = async (projectId: string) => {
  const response = await client.get(`/project/${projectId}`);
  return response.data.data as Project;
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const response = await client.get(`/project/workspace/${workspaceId}/projects`);
  return response.data.data as Project[];
};

