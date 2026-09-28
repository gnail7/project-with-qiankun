import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginMember, logoutMember, registerMember } from '@/api/member'
import { MEMBER_PROFILE_KEY, MEMBER_TOKEN_KEY } from '@/data'
import type { AuthCredentials, MemberSession, RegisterCredentials } from '@/types'

function readSavedSession(): MemberSession | null {
  const raw = localStorage.getItem(MEMBER_PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MemberSession
  } catch {
    localStorage.removeItem(MEMBER_PROFILE_KEY)
    return null
  }
}

export const useMemberStore = defineStore('mall-member', () => {
  const session = ref<MemberSession | null>(readSavedSession())
  const token = ref(localStorage.getItem(MEMBER_TOKEN_KEY))
  const authDialogOpen = ref(false)
  const isAuthenticated = computed(() => Boolean(token.value && session.value))

  function saveSession(value: MemberSession) {
    session.value = value
    token.value = value.token
    localStorage.setItem(MEMBER_TOKEN_KEY, value.token)
    localStorage.setItem(MEMBER_PROFILE_KEY, JSON.stringify(value))
    authDialogOpen.value = false
  }

  async function login(credentials: AuthCredentials) {
    saveSession(await loginMember(credentials))
  }

  async function register(credentials: RegisterCredentials) {
    saveSession(await registerMember(credentials))
  }

  async function logout() {
    try {
      if (token.value) await logoutMember()
    } finally {
      token.value = null
      session.value = null
      localStorage.removeItem(MEMBER_TOKEN_KEY)
      localStorage.removeItem(MEMBER_PROFILE_KEY)
    }
  }

  return { session, token, authDialogOpen, isAuthenticated, login, register, logout }
})
