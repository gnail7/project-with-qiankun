import request from './request'

/** 分页查询用户 */
export function getUserPage(params) {
  return request.get('/users/page', { params })
}

/** 用户详情 */
export function getUser(userId) {
  return request.get(`/users/${userId}`)
}

/** 新增用户 */
export function createUser(data) {
  return request.post('/users', data)
}

/** 修改用户（不含密码） */
export function updateUser(userId, data) {
  return request.put(`/users/${userId}`, data)
}

/** 删除用户（逻辑删除） */
export function deleteUser(userId) {
  return request.delete(`/users/${userId}`)
}

/** 查询用户已分配的角色 */
export function getUserRoles(userId) {
  return request.get(`/users/${userId}/roles`)
}

/** 给用户分配角色（覆盖式，body 为 roleId 数组） */
export function assignUserRoles(userId, roleIds) {
  return request.put(`/users/${userId}/roles`, roleIds)
}

/** 重置用户密码 */
export function resetUserPassword(userId, newPassword) {
  return request.put(`/users/${userId}/password`, { newPassword })
}
