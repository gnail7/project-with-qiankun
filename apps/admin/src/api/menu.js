import request from './request'

/** 全量菜单树（含按钮），用于菜单管理页 / 角色授权 */
export function getMenuTree() {
  return request.get('/menu/list')
}

/** 当前登录用户的可见菜单树（M/C），用于注册前端动态路由 */
export function getUserMenus() {
  return request.get('/menu/userMenus')
}

/** 新增菜单 */
export function createMenu(data) {
  return request.post('/menu', data)
}

/** 修改菜单 */
export function updateMenu(menuId, data) {
  return request.put(`/menu/${menuId}`, data)
}

/** 删除菜单（有子菜单时后端拒绝） */
export function deleteMenu(menuId) {
  return request.delete(`/menu/${menuId}`)
}
