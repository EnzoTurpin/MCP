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
  _count: { tasks: number; members: number };
};

export type ProjectDetail = {
  id: string;
  name: string;
  statuses: ProjectStatus[];
  _count: { members: number };
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
