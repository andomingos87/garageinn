/**
 * RBAC Validation Script
 * 
 * Validates that all 31 roles in the database have proper permissions mapping.
 * Run with: npx tsx scripts/validate-rbac.ts
 */

import {
  GLOBAL_ROLE_PERMISSIONS,
  DEPARTMENT_ROLE_PERMISSIONS,
  type Permission,
} from '../src/lib/auth/permissions'

interface UserRole {
  role_name: string
  department_name: string | null
  is_global: boolean
}

function getUserPermissions(roles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>()

  for (const role of roles) {
    if (role.is_global) {
      const globalPerms = GLOBAL_ROLE_PERMISSIONS[role.role_name]
      if (globalPerms) {
        globalPerms.forEach((p) => permissions.add(p))
      }
    }

    if (role.department_name) {
      const deptPerms = DEPARTMENT_ROLE_PERMISSIONS[role.department_name]?.[role.role_name]
      if (deptPerms) {
        deptPerms.forEach((p) => permissions.add(p))
      }
    }
  }

  return Array.from(permissions)
}

// All 31 roles from the database
const DATABASE_ROLES = [
  // Global roles (3)
  { role_name: 'Administrador', department_name: null, is_global: true },
  { role_name: 'Desenvolvedor', department_name: null, is_global: true },
  { role_name: 'Diretor', department_name: null, is_global: true },
  // Operações (4)
  { role_name: 'Manobrista', department_name: 'Operações', is_global: false },
  { role_name: 'Encarregado', department_name: 'Operações', is_global: false },
  { role_name: 'Supervisor', department_name: 'Operações', is_global: false },
  { role_name: 'Gerente', department_name: 'Operações', is_global: false },
  // Compras e Manutenção (3)
  { role_name: 'Assistente', department_name: 'Compras e Manutenção', is_global: false },
  { role_name: 'Comprador', department_name: 'Compras e Manutenção', is_global: false },
  { role_name: 'Gerente', department_name: 'Compras e Manutenção', is_global: false },
  // Financeiro (7)
  { role_name: 'Auxiliar', department_name: 'Financeiro', is_global: false },
  { role_name: 'Assistente', department_name: 'Financeiro', is_global: false },
  { role_name: 'Analista Júnior', department_name: 'Financeiro', is_global: false },
  { role_name: 'Analista Pleno', department_name: 'Financeiro', is_global: false },
  { role_name: 'Analista Sênior', department_name: 'Financeiro', is_global: false },
  { role_name: 'Supervisor', department_name: 'Financeiro', is_global: false },
  { role_name: 'Gerente', department_name: 'Financeiro', is_global: false },
  // TI (2)
  { role_name: 'Analista', department_name: 'TI', is_global: false },
  { role_name: 'Gerente', department_name: 'TI', is_global: false },
  // RH (7)
  { role_name: 'Auxiliar', department_name: 'RH', is_global: false },
  { role_name: 'Assistente', department_name: 'RH', is_global: false },
  { role_name: 'Analista Júnior', department_name: 'RH', is_global: false },
  { role_name: 'Analista Pleno', department_name: 'RH', is_global: false },
  { role_name: 'Analista Sênior', department_name: 'RH', is_global: false },
  { role_name: 'Supervisor', department_name: 'RH', is_global: false },
  { role_name: 'Gerente', department_name: 'RH', is_global: false },
  // Comercial (1)
  { role_name: 'Gerente', department_name: 'Comercial', is_global: false },
  // Auditoria (2)
  { role_name: 'Auditor', department_name: 'Auditoria', is_global: false },
  { role_name: 'Gerente', department_name: 'Auditoria', is_global: false },
  // Sinistros (2)
  { role_name: 'Supervisor', department_name: 'Sinistros', is_global: false },
  { role_name: 'Gerente', department_name: 'Sinistros', is_global: false },
]

// Expected permissions for each role
const EXPECTED_PERMISSIONS: Record<string, { minPerms?: Permission[], hasAdmin?: boolean }> = {
  // Global roles
  'Administrador': { hasAdmin: true },
  'Desenvolvedor': { hasAdmin: true },
  'Diretor': { hasAdmin: true },
  // Operações
  'Operações|Manobrista': { minPerms: ['tickets:read', 'tickets:create', 'checklists:read'] },
  'Operações|Encarregado': { minPerms: ['tickets:read', 'tickets:approve', 'units:read'] },
  'Operações|Supervisor': { minPerms: ['tickets:read', 'tickets:approve'] },
  'Operações|Gerente': { minPerms: ['tickets:read', 'tickets:triage', 'checklists:configure'] },
  // Compras e Manutenção
  'Compras e Manutenção|Assistente': { minPerms: ['tickets:read'] },
  'Compras e Manutenção|Comprador': { minPerms: ['tickets:read', 'tickets:execute'] },
  'Compras e Manutenção|Gerente': { minPerms: ['tickets:read', 'tickets:triage', 'tickets:execute'] },
  // Financeiro
  'Financeiro|Auxiliar': { minPerms: ['tickets:read'] },
  'Financeiro|Assistente': { minPerms: ['tickets:read'] },
  'Financeiro|Analista Júnior': { minPerms: ['tickets:read', 'tickets:execute'] },
  'Financeiro|Analista Pleno': { minPerms: ['tickets:read', 'tickets:approve'] },
  'Financeiro|Analista Sênior': { minPerms: ['tickets:read', 'tickets:approve'] },
  'Financeiro|Supervisor': { minPerms: ['tickets:read', 'tickets:triage'] },
  'Financeiro|Gerente': { minPerms: ['tickets:read', 'tickets:triage', 'settings:read'] },
  // TI
  'TI|Analista': { minPerms: ['tickets:read', 'tickets:execute'] },
  'TI|Gerente': { hasAdmin: true },
  // RH
  'RH|Auxiliar': { minPerms: ['users:read'] },
  'RH|Assistente': { minPerms: ['users:read'] },
  'RH|Analista Júnior': { minPerms: ['users:read', 'users:create'] },
  'RH|Analista Pleno': { minPerms: ['users:read', 'users:update'] },
  'RH|Analista Sênior': { minPerms: ['users:read', 'users:update'] },
  'RH|Supervisor': { minPerms: ['users:read', 'users:delete'] },
  'RH|Gerente': { minPerms: ['users:read', 'users:delete', 'settings:read'] },
  // Comercial
  'Comercial|Gerente': { minPerms: ['units:read', 'tickets:read', 'settings:read'] },
  // Auditoria
  'Auditoria|Auditor': { minPerms: ['tickets:read', 'checklists:read'] },
  'Auditoria|Gerente': { minPerms: ['tickets:read', 'tickets:approve', 'checklists:configure'] },
  // Sinistros
  'Sinistros|Supervisor': { minPerms: ['tickets:read', 'tickets:execute', 'tickets:approve'] },
  'Sinistros|Gerente': { minPerms: ['tickets:read', 'tickets:triage', 'settings:read'] },
}

console.log('='.repeat(60))
console.log('RBAC Validation - BUG-015 Phase 3 Tests')
console.log('='.repeat(60))
console.log()

let passed = 0
let failed = 0
const failures: string[] = []

for (const role of DATABASE_ROLES) {
  const key = role.department_name ? `${role.department_name}|${role.role_name}` : role.role_name
  const expected = EXPECTED_PERMISSIONS[key]
  const permissions = getUserPermissions([role])
  
  const roleDesc = role.department_name 
    ? `${role.department_name} > ${role.role_name}`
    : `${role.role_name} (global)`
  
  if (!expected) {
    console.log(`[WARN] No expectations defined for: ${roleDesc}`)
    continue
  }
  
  let testPassed = true
  const errors: string[] = []
  
  // Check admin permission
  if (expected.hasAdmin) {
    if (!permissions.includes('admin:all')) {
      testPassed = false
      errors.push('Expected admin:all permission')
    }
  }
  
  // Check minimum permissions
  if (expected.minPerms) {
    for (const perm of expected.minPerms) {
      if (!permissions.includes(perm)) {
        testPassed = false
        errors.push(`Missing permission: ${perm}`)
      }
    }
  }
  
  // Check that permissions exist at all
  if (permissions.length === 0) {
    testPassed = false
    errors.push('No permissions found - role not mapped!')
  }
  
  if (testPassed) {
    console.log(`[PASS] ${roleDesc}`)
    console.log(`       Permissions: ${permissions.join(', ')}`)
    passed++
  } else {
    console.log(`[FAIL] ${roleDesc}`)
    console.log(`       Got: ${permissions.join(', ') || '(empty)'}`)
    errors.forEach(e => console.log(`       Error: ${e}`))
    failed++
    failures.push(`${roleDesc}: ${errors.join(', ')}`)
  }
}

console.log()
console.log('='.repeat(60))
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${DATABASE_ROLES.length} total`)
console.log('='.repeat(60))

if (failed > 0) {
  console.log()
  console.log('FAILURES:')
  failures.forEach(f => console.log(`  - ${f}`))
  process.exit(1)
}

// Phase 3 Specific Tests
console.log()
console.log('='.repeat(60))
console.log('Phase 3 - Specific Validation Tests')
console.log('='.repeat(60))
console.log()

const specificTests = [
  {
    name: 'Assistente Financeiro → acesso a chamados',
    role: { role_name: 'Assistente', department_name: 'Financeiro', is_global: false },
    check: (perms: Permission[]) => perms.includes('tickets:read'),
  },
  {
    name: 'Analista Júnior RH → acesso a usuários',
    role: { role_name: 'Analista Júnior', department_name: 'RH', is_global: false },
    check: (perms: Permission[]) => perms.includes('users:read') && perms.includes('users:create'),
  },
  {
    name: 'Supervisor Sinistros → acesso a chamados (execute/approve)',
    role: { role_name: 'Supervisor', department_name: 'Sinistros', is_global: false },
    check: (perms: Permission[]) => perms.includes('tickets:read') && perms.includes('tickets:execute') && perms.includes('tickets:approve'),
  },
  {
    name: 'Comprador → acesso a chamados (read/execute)',
    role: { role_name: 'Comprador', department_name: 'Compras e Manutenção', is_global: false },
    check: (perms: Permission[]) => perms.includes('tickets:read') && perms.includes('tickets:execute'),
  },
]

let specificPassed = 0
for (const test of specificTests) {
  const perms = getUserPermissions([test.role])
  const result = test.check(perms)
  
  if (result) {
    console.log(`[PASS] ${test.name}`)
    specificPassed++
  } else {
    console.log(`[FAIL] ${test.name}`)
    console.log(`       Got: ${perms.join(', ')}`)
  }
}

console.log()
console.log(`Phase 3 Tests: ${specificPassed}/${specificTests.length} passed`)

if (specificPassed === specificTests.length && failed === 0) {
  console.log()
  console.log('='.repeat(60))
  console.log('ALL TESTS PASSED - BUG-015 RESOLVED')
  console.log('='.repeat(60))
  process.exit(0)
} else {
  process.exit(1)
}
