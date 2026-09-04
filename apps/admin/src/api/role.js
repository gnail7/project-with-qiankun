import request from './request'

/** 分页查询角色 */
export function getRolePage(params) {
  return request.get('/role/page', { params })
}

/** 全部启用角色（下拉/分配用） */
export function getRoleList() {
  return request.get('/role/list')
}

/** 新增角色 */
export function createRole(data) {
  return request.post('/role', data)
}

/** 修改角色 */
export function updateRole(roleId, data) {
  return request.put(`/role/${roleId}`, data)
}

/** 删除角色（逻辑删除并清理关联） */
export function deleteRole(roleId) {
  return request.delete(`/role/${roleId}`)
}

/** 查询角色已分配的菜单 id */
export function getRoleMenuIds(roleId) {
  return request.get(`/role/${roleId}/menuIds`)
}

/** 保存角色的菜单权限（覆盖式，body 为 menuId 数组） */
export function assignRoleMenus(roleId, menuIds) {
  return request.put(`/role/${roleId}/menus`, menuIds)
}
