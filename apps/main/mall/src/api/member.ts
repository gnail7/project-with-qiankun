import { request } from './request'
import type { AuthCredentials, MemberSession, RegisterCredentials } from '@/types'

export function loginMember(credentials: AuthCredentials) {
  return request<MemberSession>(
    '/api/mall/member/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
    true,
  )
}

export function registerMember(credentials: RegisterCredentials) {
  return request<MemberSession>(
    '/api/mall/member/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
    true,
  )
}

export function logoutMember() {
  return request<void>('/api/mall/member/auth/logout', { method: 'POST' })
}
