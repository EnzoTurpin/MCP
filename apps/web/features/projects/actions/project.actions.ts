import { apiFetch } from "@/shared/lib/api";
import { getToken } from "@/shared/lib/auth";

export type ProjectTask = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | null;
  deadline: string | null;
  position: number;
  assignee: { id: string; display_name: string } | null;
};

export type ProjectStatus = {
  id: string;
  name: string;
  color: string | null;
  order_index: number;
  tasks: ProjectTask[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  created_at: string;
  isFavorited: boolean;
  favoritedAt: string | null;
  _count: { tasks: number; members: number };
};

export type ProjectRole = 'owner' | 'admin' | 'member';

export type ProjectDetail = {
  id: string;
  name: string;
  owner_id: string;
  share_token: string | null;
  statuses: ProjectStatus[];
  members: { user_id: string; role: 'admin' | 'member' }[];
  _count: { members: number };
};

export type ProjectMember = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'member';
  joined_at?: string;
};

export type MembersResponse = {
  owner: { id: string; display_name: string; email: string };
  members: ProjectMember[];
};

export type InvitationInfo = {
  email: string;
  projectName: string;
  invitedBy: string;
  expiresAt: string;
};

function auth() {
  return { token: getToken() ?? undefined };
}

export function getProjects(): Promise<ProjectSummary[]> {
  return apiFetch<ProjectSummary[]>("/projects", auth());
}

export function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/projects/${id}`, auth());
}

export function createProject(name: string): Promise<ProjectSummary> {
  return apiFetch<ProjectSummary>("/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
    ...auth(),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, { method: "DELETE", ...auth() });
}

export function toggleFavorite(projectId: string): Promise<{ isFavorited: boolean }> {
  return apiFetch<{ isFavorited: boolean }>(`/projects/${projectId}/favorite`, {
    method: "POST",
    ...auth(),
  });
}

export function createTask(
  projectId: string,
  data: { title: string; status_id: string },
): Promise<ProjectTask> {
  return apiFetch<ProjectTask>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
    ...auth(),
  });
}

export function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<{
    title: string;
    status_id: string;
    position: number;
    description: string;
    deadline: string;
    priority: "low" | "medium" | "high";
  }>,
): Promise<ProjectTask> {
  return apiFetch<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...auth(),
  });
}

export function deleteTask(projectId: string, taskId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
    ...auth(),
  });
}

export function updateStatus(
  projectId: string,
  statusId: string,
  data: { name?: string; color?: string },
): Promise<ProjectStatus> {
  return apiFetch<ProjectStatus>(`/projects/${projectId}/statuses/${statusId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...auth(),
  });
}

export function deleteStatus(projectId: string, statusId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/statuses/${statusId}`, {
    method: "DELETE",
    ...auth(),
  });
}

// ─── Partage via lien ────────────────────────────────────────────────────────

export function generateShareLink(projectId: string): Promise<{ shareToken: string }> {
  return apiFetch<{ shareToken: string }>(`/projects/${projectId}/share-link`, {
    method: "POST",
    ...auth(),
  });
}

export function revokeShareLink(projectId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/share-link`, {
    method: "DELETE",
    ...auth(),
  });
}

export function getSharedProject(shareToken: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/projects/shared/${shareToken}`);
}

// ─── Invitations par email ────────────────────────────────────────────────────

export function inviteMember(
  projectId: string,
  email: string,
): Promise<{ token: string; email: string; expires_at: string }> {
  return apiFetch(`/projects/${projectId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email }),
    ...auth(),
  });
}

export function getInvitationInfo(token: string): Promise<InvitationInfo> {
  return apiFetch<InvitationInfo>(`/projects/invitations/${token}`);
}

export function acceptInvitation(token: string): Promise<{ projectId: string }> {
  return apiFetch<{ projectId: string }>("/projects/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
    ...auth(),
  });
}

// ─── Gestion des membres ──────────────────────────────────────────────────────

export function getMembers(projectId: string): Promise<MembersResponse> {
  return apiFetch<MembersResponse>(`/projects/${projectId}/members`, auth());
}

export function removeMember(projectId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    ...auth(),
  });
}

export function updateMemberRole(
  projectId: string,
  userId: string,
  role: 'admin' | 'member',
): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    ...auth(),
  });
}
