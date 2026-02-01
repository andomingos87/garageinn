export const TI_DEPARTMENT_NAME = "TI";
export const OPERACOES_DEPARTMENT_NAME = "Operações";

/** Roles that can approve tickets in the hierarchical approval flow */
export const APPROVER_ROLES = ["Encarregado", "Supervisor", "Gerente"] as const;
export type ApproverRole = (typeof APPROVER_ROLES)[number];

export interface RoleWithDepartment {
  role_name?: string;
  department_name: string | null;
}

interface TiAccessParams {
  isAdmin: boolean;
  roles?: RoleWithDepartment[] | null;
}

export function hasDepartmentRole(
  roles: RoleWithDepartment[] | null | undefined,
  departmentName: string
): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => role.department_name === departmentName);
}

/**
 * Checks if user has an approver role (Encarregado/Supervisor/Gerente) in Operações department.
 * These users can access TI ticket details to approve them, but not the TI ticket list.
 */
export function isOperacoesApprover(
  roles: RoleWithDepartment[] | null | undefined
): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some(
    (role) =>
      role.department_name === OPERACOES_DEPARTMENT_NAME &&
      role.role_name &&
      APPROVER_ROLES.includes(role.role_name as ApproverRole)
  );
}

/**
 * Gets the user's highest approver role in Operações department.
 * Returns null if user has no approver role in Operações.
 */
export function getOperacoesApproverRole(
  roles: RoleWithDepartment[] | null | undefined
): ApproverRole | null {
  if (!roles || roles.length === 0) return null;

  const roleHierarchy: Record<ApproverRole, number> = {
    Gerente: 3,
    Supervisor: 2,
    Encarregado: 1,
  };

  let highestRole: ApproverRole | null = null;
  let highestLevel = 0;

  for (const role of roles) {
    if (
      role.department_name === OPERACOES_DEPARTMENT_NAME &&
      role.role_name &&
      APPROVER_ROLES.includes(role.role_name as ApproverRole)
    ) {
      const level = roleHierarchy[role.role_name as ApproverRole];
      if (level > highestLevel) {
        highestLevel = level;
        highestRole = role.role_name as ApproverRole;
      }
    }
  }

  return highestRole;
}

/**
 * Maps approval level number to expected role name
 */
export function getApprovalRoleForLevel(level: number): ApproverRole | null {
  const levelToRole: Record<number, ApproverRole> = {
    1: "Encarregado",
    2: "Supervisor",
    3: "Gerente",
  };
  return levelToRole[level] || null;
}

/**
 * Maps role name to approval level number
 */
export function getApprovalLevelForRole(role: ApproverRole): number {
  const roleToLevel: Record<ApproverRole, number> = {
    Encarregado: 1,
    Supervisor: 2,
    Gerente: 3,
  };
  return roleToLevel[role];
}

export function canAccessTiArea({ isAdmin, roles }: TiAccessParams): boolean {
  if (isAdmin) return true;
  return hasDepartmentRole(roles, TI_DEPARTMENT_NAME);
}
