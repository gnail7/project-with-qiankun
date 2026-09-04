/**
 * 权限校验工具
 * - 冒号权限码（RuoYi 风格），如 system:user:add
 * - 支持通配符匹配：*:*:* 表示全部，system:user:* 匹配 system:user 下任意按钮
 */

const ALL_PERMISSION = '*:*:*'

/** 是否超级管理员角色 */
export function isAdminRole(roles = []) {
  return roles.some(role => role?.roleKey === 'admin')
}

/** 单个权限码与已拥有的权限匹配（通配） */
export function matchPermission(owned, code) {
  if (!code) {
    return true
  }
  if (owned.includes(ALL_PERMISSION)) {
    return true
  }
  const segments = code.split(':')
  return owned.some(pattern => {
    const parts = pattern.split(':')
    return (
      parts.length === segments.length &&
      parts.every((part, index) => part === '*' || part === segments[index])
    )
  })
}

/** 校验权限：支持单个 code 或 code 数组（任一命中即可） */
export function hasPermission(owned = [], need = '') {
  const needList = Array.isArray(need) ? need : [need]
  return needList.some(code => matchPermission(owned, code))
}
