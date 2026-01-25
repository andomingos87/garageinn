export const TI_DEPARTMENT_NAME = "TI";

export interface RoleWithDepartment {
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

export function canAccessTiArea({ isAdmin, roles }: TiAccessParams): boolean {
  if (isAdmin) return true;
  return hasDepartmentRole(roles, TI_DEPARTMENT_NAME);
}
