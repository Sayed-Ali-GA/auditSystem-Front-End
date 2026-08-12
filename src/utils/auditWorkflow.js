export const ROLE_IDS = {
  ADMIN: 1,
  OPS_MANAGER: 2,
  STORE_MANAGER: 3,
  AUDITOR: 4,
  AUDIT_MANAGER: 5,
};

// Statuses that mean "this audit is waiting on ME" for a given role.
export const getPendingStatusesForRole = (roleId) => {
  switch (Number(roleId)) {
    case ROLE_IDS.AUDITOR:
      return ["Draft", "Needs Revision"];
    case ROLE_IDS.AUDIT_MANAGER:
      return ["Submitted"];
    case ROLE_IDS.OPS_MANAGER:
      return ["Forwarded"];
    case ROLE_IDS.STORE_MANAGER:
      return ["Sent to Store"];
    case ROLE_IDS.ADMIN:
      return ["Draft", "Submitted", "Needs Revision", "Forwarded", "Sent to Store"];
    default:
      return [];
  }
};

// Filters an already role-scoped audit list down to "my queue" items.
export const filterMyTaskAudits = (audits, user) => {
  if (!user) return [];

  const statuses = getPendingStatusesForRole(user.RoleID);

  return (Array.isArray(audits) ? audits : []).filter((audit) => {
    if (!statuses.includes(audit.status)) return false;

    // Drafts and Needs-Revision items belong to the auditor who created them
    if (
      (audit.status === "Draft" || audit.status === "Needs Revision") &&
      Number(user.RoleID) === ROLE_IDS.AUDITOR
    ) {
      return Number(audit.auditorid) === Number(user.UserID);
    }

    return true;
  });
};

export const TASK_LABELS = {
  Draft: "Continue draft",
  "Needs Revision": "Revise & resubmit",
  Submitted: "Review submission",
  Forwarded: "Add comment & route",
  "Sent to Store": "Add action plan",
};