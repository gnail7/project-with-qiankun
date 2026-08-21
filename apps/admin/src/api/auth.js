import request from './request'

/** 登录：POST /api/auth/login，body { username, password } */
export function loginApi(data) {
  return request.post('/auth/login', data)
}

/** 获取当前登录用户：GET /api/auth/me（需要 Authorization 头） */
export function getMeApi() {
  return request.get('/auth/me')
}