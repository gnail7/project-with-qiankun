import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMeApi } from '@/api/auth'
import { getUserMenus } from '@/api/menu'
import { useUserStore } from '@/stores/user'
import { isAdminRole, matchPermission } from '@/utils/permission'

/**
 * 权限状态：登录后拉取当前用户信息、角色与权限
 * 可见菜单树（M/C）由后端 /api/menu/userMenus 返回，前端据此注册动态路由并渲染侧边栏。
 */
export const usePermissionStore = defineStore('permission', () => {
  const roles = ref([])
  const permissions = ref([])
  const menus = ref([])
  const loaded = ref(false)

  const isAdmin = computed(() => isAdminRole(roles.value))

  /** 判断是否拥有某个权限码（admin 角色直接放行） */
  function hasPerm(code) {
    if (!code || isAdmin.value) {
      return true
    }
    const list = Array.isArray(code) ? code : [code]
    return list.some(item => matchPermission(permissions.value, item))
  }

  /**
   * 拉取当前用户信息/角色/权限，并获取其可见菜单树（已按角色过滤）。
   * menus.value 为后端返回的菜单树（含 menuType/path/component/perms/icon/menuName/children），
   * 供路由注册与侧边栏渲染使用。
   */
  async function load() {
    const res = await getMeApi() // { code, message, data: { user, roles, permissions } }
    const { user, roles: roleList, permissions: permList } = res.data
    const userStore = useUserStore()
    userStore.setUserInfo(user)
    roles.value = roleList || []
    permissions.value = permList || []

    const menuRes = await getUserMenus()
    menus.value = menuRes.data || []
    loaded.value = true
  }

  function reset() {
    roles.value = []
    permissions.value = []
    menus.value = []
    loaded.value = false
  }

  return { roles, permissions, menus, loaded, isAdmin, hasPerm, load, reset }
})
