import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMeApi } from '@/api/auth'
import { asyncMenus } from '@/router/menu-config'
import { useUserStore } from '@/stores/user'
import { isAdminRole, matchPermission } from '@/utils/permission'

/**
 * 权限状态：登录后拉取当前用户信息、角色与权限
 * 根据权限码过滤出当前用户可见的菜单树
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

  /** 根据权限码过滤菜单树（保留 permission 为空 = 无需权限的节点） */
  function filterMenu(list) {
    const result = []
    list.forEach(item => {
      if (item.permission && !hasPerm(item.permission)) {
        return
      }
      const node = { ...item }
      if (item.children?.length) {
        node.children = filterMenu(item.children)
        if (!node.children.length) {
          return
        }
      }
      result.push(node)
    })
    return result
  }

  /** 拉取当前用户信息/角色/权限，并生成可见菜单 */
  async function load() {
    const res = await getMeApi() // { code, message, data: { user, roles, permissions } }
    const { user, roles: roleList, permissions: permList } = res.data
    const userStore = useUserStore()
    userStore.setUserInfo(user)
    roles.value = roleList || []
    permissions.value = permList || []
    menus.value = filterMenu(asyncMenus)
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
