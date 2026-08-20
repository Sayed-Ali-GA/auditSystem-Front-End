// Central place for role IDs — change once, applies everywhere.
export const ROLES = {
  ADMIN: 1,
  OPS_MANAGER: 2,
  STORE_MANAGER: 3,
  AUDITOR: 4,
  AUDIT_MANAGER: 5,
};

export const ALL_ROLES = Object.values(ROLES);

// Common role groupings used across routes
export const ADMIN_ONLY = [ROLES.ADMIN];
export const AUDIT_SETUP_ROLES = [ROLES.ADMIN, ROLES.OPS_MANAGER, ROLES.AUDIT_MANAGER, ROLES.AUDITOR];
export const AUDIT_WORKFLOW_ROLES = ALL_ROLES;