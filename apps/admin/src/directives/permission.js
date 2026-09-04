import { usePermissionStore } from '@/stores/permission'

/**
 * 按钮权限指令
 * 用法：v-permission="'system:user:add'" 或 v-permission="['system:user:add', 'system:user:edit']"
 * 无权限时直接移除元素
 */
function removeIfNoPermission(el, binding) {
  if (!binding.value) {
    return
  }
  const permissionStore = usePermissionStore()
  if (!permissionStore.hasPerm(binding.value) && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

export const permission = {
  mounted: removeIfNoPermission,
  updated: removeIfNoPermission,
}
