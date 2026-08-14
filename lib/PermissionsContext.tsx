"use client";
import { createContext, useContext } from "react";
import type { Permissions } from "./permissions";

const defaultPermissions: Permissions = {
  isSuperAdmin: false,
  canViewResponses: true,
  canExportResponses: true,
  canDeleteResponses: false,
  canViewQuestions: true,
  canAddEditQuestions: false,
  canRetireQuestions: false,
  canReorderQuestions: false,
  canManageCategories: false,
  canChangeSettings: false,
  canViewAuditLog: false,
  canViewRobots: true,
};

export const PermissionsContext = createContext<Permissions>(defaultPermissions);

export function usePermissions(): Permissions {
  return useContext(PermissionsContext);
}
