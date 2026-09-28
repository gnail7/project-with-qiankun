import { API_BASE_URL, MEMBER_TOKEN_KEY } from '@/data'
import type { ApiEnvelope } from '@/types'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  anonymous = false,
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = anonymous ? null : localStorage.getItem(MEMBER_TOKEN_KEY)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('暂时无法连接商城服务，请确认后端已启动。', 0)
  }

  let result: ApiEnvelope<T>
  try {
    result = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError('服务暂时无法处理请求，请稍后重试。', response.status)
  }

  if (!response.ok || result.code !== 200) {
    throw new ApiError(result.message || '请求失败，请稍后重试。', response.status)
  }

  return result.data
}
