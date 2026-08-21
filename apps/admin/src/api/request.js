import { message } from 'ant-design-vue'
import axios from 'axios'
import i18n from '@/i18n'

const t = key => i18n.global.t(key)

const request = axios.create({
  // 后端地址，可用环境变量 VITE_API_BASE_URL 覆盖
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
})

// 请求拦截器：自动带上 JWT
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理后端统一返回的 { code, message, data }
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res && res.code === 200) {
      return res
    }
    // 业务错误（HTTP 200，但 code !== 200）：交给调用方处理，不自动弹提示
    const err = new Error(res?.message || t('error.requestFailed'))
    err.biz = res
    return Promise.reject(err)
  },
  error => {
    // HTTP 层错误
    const status = error.response?.status
    let msg = t('error.network')

    if (status === 401) {
      msg = t('error.unauthorized')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      if (!window.location.pathname.startsWith('/gnail-admin/login')) {
        window.location.href = '/gnail-admin/login'
      }
    } else if (status === 403) {
      msg = t('error.forbidden')
    } else if (status === 404) {
      msg = t('error.notFound')
    } else if (status === 500) {
      msg = t('error.serverError')
    } else if (error.response?.data?.message) {
      msg = error.response.data.message
    }

    message.error(msg)
    return Promise.reject(error)
  },
)

export default request
