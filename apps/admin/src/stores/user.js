import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  /** 调用后端登录接口，成功后保存 token 和用户信息 */
  async function login(payload) {
    const res = await loginApi(payload) // res = { code: 200, message, data: { token, user } }
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
  }

  /** 退出登录：清空本地凭证 */
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, login, logout }
})
