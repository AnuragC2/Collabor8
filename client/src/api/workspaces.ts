import client from "./client";

export interface WorkspaceMember {
  userId: {
    _id: string;
    name?: string;
    email: string;
  };
  role: "Owner" | "Admin" | "Member" | "Guest";
  joinedAt: string;
  _id?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId?: {
    _id: string;
    name?: string;
    email: string;
  };
  members: WorkspaceMember[];
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  description?: string;
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
}

interface UpdateWorkspaceDTO {
  name?: string;
  slug?: string;
  description?: string;
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
  isActive?: boolean;
}

export const createWorkspace = async (data: CreateWorkspaceDTO) => {
  const response = await client.post("/workspace", data);
  return response.data.data as Workspace;
};

export const updateWorkspace = async (workspaceId: string, data: UpdateWorkspaceDTO) => {
  const response = await client.patch(`/workspace/${workspaceId}`, data);
  return response.data.data as Workspace;
};

export const deleteWorkspace = async (workspaceId: string) => {
  await client.delete(`/workspace/${workspaceId}`);
};

export const getWorkspaces = async () => {
  const response = await client.get("/workspace/my-workspaces");
  return response.data.data as Workspace[];
};

export const getWorkspaceById = async (workspaceId: string) => {
  const response = await client.get(`/workspace/${workspaceId}`);
  return response.data.data as Workspace;
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const { data } = await client.get(`/project/workspace/${workspaceId}/projects`);
  return data.data as any[];
};

export const removeMember = async (workspaceId: string, memberId: string) => {
  const response = await client.delete(`/workspace/${workspaceId}/members/${memberId}`);
  return response.data.data as Workspace;
};

export const updateMemberRole = async (workspaceId: string, memberId: string, role: string) => {
  const response = await client.patch(`/workspace/${workspaceId}/members/${memberId}/role`, { role });
  return response.data.data as Workspace;
};

// Workspace invites (email-based)
export interface WorkspaceInvite {
  _id: string;
  workspaceId: string;
  email: string;
  role: "Admin" | "Member" | "Guest";
  invitedBy: any;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  acceptedBy?: any;
  acceptedAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const createWorkspaceInvite = async (
  workspaceId: string,
  data: { email: string; role?: "Admin" | "Member" | "Guest" }
) => {
  const response = await client.post(`/workspace/${workspaceId}/invites`, data);
  return response.data.data as WorkspaceInvite;
};

export const listWorkspaceInvites = async (
  workspaceId: string,
  status?: "pending" | "accepted" | "revoked" | "expired"
) => {
  const response = await client.get(`/workspace/${workspaceId}/invites`, {
    params: status ? { status } : undefined,
  });
  return response.data.data as WorkspaceInvite[];
};

export const revokeWorkspaceInvite = async (workspaceId: string, inviteId: string) => {
  await client.post(`/workspace/${workspaceId}/invites/${inviteId}/revoke`);
};

export const acceptWorkspaceInvite = async (token: string) => {
  const response = await client.post(`/workspace/invites/accept`, { token });
  return response.data.data as Workspace;
};
