// 角色常量
export const Roles = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  COUNSELOR: 'counselor',
  ADMIN: 'admin'
}

// 角色名称映射
export const RoleNames = {
  [Roles.STUDENT]: '学生',
  [Roles.TEACHER]: '教师',
  [Roles.COUNSELOR]: '辅导员',
  [Roles.ADMIN]: '管理员'
}

// 角色标签类型映射
export const RoleTagTypes = {
  [Roles.STUDENT]: 'info',
  [Roles.TEACHER]: 'success',
  [Roles.COUNSELOR]: 'warning',
  [Roles.ADMIN]: 'danger'
}