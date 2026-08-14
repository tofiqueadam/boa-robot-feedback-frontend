import type { AppSettings } from "@/types";

export interface Permissions {
  isSuperAdmin: boolean;
  canViewResponses: boolean;
  canExportResponses: boolean;
  canDeleteResponses: boolean;
  canViewQuestions: boolean;
  canAddEditQuestions: boolean;
  canRetireQuestions: boolean;
  canReorderQuestions: boolean;
  canManageCategories: boolean;
  canChangeSettings: boolean;
  canViewAuditLog: boolean;
  canViewRobots: boolean;
}

export function resolvePermissions(
  role: string,
  settings: AppSettings | null
): Permissions {
  const isSuperAdmin = role === "superadmin";
  if (isSuperAdmin) {
    return {
      isSuperAdmin: true,
      canViewResponses: true,
      canExportResponses: true,
      canDeleteResponses: true,
      canViewQuestions: true,
      canAddEditQuestions: true,
      canRetireQuestions: true,
      canReorderQuestions: true,
      canManageCategories: true,
      canChangeSettings: true,
      canViewAuditLog: true,
      canViewRobots: true,
    };
  }
  return {
    isSuperAdmin: false,
    canViewResponses:       settings?.perm_view_responses        ?? true,
    canExportResponses:     settings?.perm_export_responses      ?? true,
    canDeleteResponses:     settings?.perm_delete_responses      ?? false,
    canViewQuestions:       settings?.perm_view_questions        ?? true,
    canAddEditQuestions:    settings?.perm_add_edit_questions    ?? false,
    canRetireQuestions:     settings?.perm_retire_questions      ?? false,
    canReorderQuestions:    settings?.perm_reorder_questions     ?? false,
    canManageCategories:    settings?.perm_manage_categories     ?? false,
    canChangeSettings:      settings?.perm_change_settings       ?? false,
    canViewAuditLog:        settings?.perm_view_audit_log        ?? false,
    canViewRobots:          settings?.perm_view_robots_locations ?? true,
  };
}
