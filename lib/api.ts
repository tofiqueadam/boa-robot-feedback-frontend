// All browser requests go to /api/* — Next.js rewrites proxy to the backend.
const BASE = "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkErr) {
    // Network failure — no response at all (backend down, DNS failure, etc.)
    throw new Error("Network error — please check your connection and try again.");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    if (res.status === 503 || res.status === 502) {
      detail = "The server is temporarily unavailable. Please try again in a moment.";
    } else if (res.status === 401) {
      detail = "Session expired. Please sign in again.";
    } else if (res.status === 403) {
      detail = "You do not have permission to perform this action.";
    } else if (res.status === 404) {
      detail = "not found";
    } else if (res.status === 429) {
      detail = "Too many attempts. Please wait a moment before trying again.";
    } else {
      try {
        const err = await res.json();
        detail = err.detail || detail;
      } catch {}
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Public
export const api = {
  getRobot: (code: string) =>
    request<import("@/types").RobotInfo>(`/api/robots/${code}`),

  getActiveQuestions: () =>
    request<import("@/types").Section[]>("/api/questions/active"),

  getPublicSettings: () =>
    request<import("@/types").PublicSettings>("/api/settings/public"),

  submitFeedback: (body: {
    robot_code: string;
    session_id?: string;
    answers: import("@/types").AnswerInput[];
  }) =>
    request<{ response_id: string; submitted_at: string; message: string }>(
      "/api/feedback",
      { method: "POST", body: JSON.stringify(body) }
    ),

  // Admin auth
  login: (email: string, password: string) =>
    request<{ access_token: string; user: import("@/types").AdminUser }>(
      "/api/admin/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  logout: () =>
    request<void>("/api/admin/auth/logout", { method: "POST" }),

  me: () =>
    request<import("@/types").AdminUser>("/api/admin/auth/me"),

  // Admin questions
  getSections: () =>
    request<{ id: string; title: string; display_order: number; active: boolean }[]>(
      "/api/admin/sections"
    ),

  getQuestions: () =>
    request<import("@/types").Question[]>("/api/admin/questions"),

  createQuestion: (body: Record<string, unknown>) =>
    request<{ id: string; version: number }>("/api/admin/questions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateQuestion: (id: string, body: Record<string, unknown>) =>
    request<{ id: string; version: number }>(`/api/admin/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  retireQuestion: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/questions/${id}/retire`, {
      method: "PUT",
    }),

  reorderQuestions: (items: { id: string; display_order: number }[]) =>
    request<{ ok: boolean }>("/api/admin/questions/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  createSection: (title: string, display_order: number) =>
    request<{ id: string; title: string }>("/api/admin/sections", {
      method: "POST",
      body: JSON.stringify({ title, display_order }),
    }),

  updateSection: (id: string, body: Record<string, unknown>) =>
    request<{ id: string }>(`/api/admin/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  reorderSections: (items: { id: string; display_order: number }[]) =>
    request<{ ok: boolean }>("/api/admin/sections/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  // Admin responses
  getSummary: (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    return request<import("@/types").OverallSummary>(
      `/api/admin/responses/summary?${q}`
    );
  },

  getIndividualResponses: (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    return request<import("@/types").PaginatedResponses>(
      `/api/admin/responses/individual?${q}`
    );
  },

  getIndividualResponse: (id: string) =>
    request<import("@/types").IndividualResponse>(
      `/api/admin/responses/individual/${id}`
    ),

  deleteResponse: (id: string) =>
    request<{ deleted: boolean }>(
      `/api/admin/responses/individual/${id}`,
      { method: "DELETE" }
    ),

  getExportUrl: (fmt: "csv" | "xlsx", params: Record<string, string | undefined>) => {
    const q = new URLSearchParams({ fmt });
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    return `/api/admin/responses/export?${q}`;
  },

  // Admin settings
  getSettings: () =>
    request<import("@/types").AppSettings>("/api/admin/settings"),

  updateSettings: (body: Partial<import("@/types").AppSettings>) =>
    request<import("@/types").AppSettings>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getAuditLogs: (page: number, page_size = 20) =>
    request<{ total: number; page: number; page_size: number; items: import("@/types").AuditLogEntry[] }>(
      `/api/admin/audit?page=${page}&page_size=${page_size}`
    ),

  // Robots & locations
  getRobots: () =>
    request<import("@/types").Robot[]>("/api/admin/robots"),

  getLocations: () =>
    request<import("@/types").Location[]>("/api/admin/locations"),
};
