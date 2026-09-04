import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null'))

  /** 调用后端登录接口，成功后保存 token 和用户信息 */
  async function login(payload) {
    const res = await loginApi(payload) // res = { code: 200, message, data: { token, user } }
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem(TOKEN_KEY, res.data.token)
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(res.data.user))
  }

  /** 保存用户信息（登录后 /auth/me 拉取的最新数据） */
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  }

  /** 退出登录：清空本地凭证 */
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  return { token, userInfo, login, setUserInfo, logout }
})
