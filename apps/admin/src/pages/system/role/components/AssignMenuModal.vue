<script setup>
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { assignRoleMenus, getRoleMenuIds } from '@/api/role'
import { getMenuTree } from '@/api/menu'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const targetRoleId = ref(null)
const checkedKeys = ref([])
const expandedKeys = ref([])
const treeData = ref([])

// 后端菜单树 → antd treeData（title/key 都要是 a-tree 认识的字段）
function toTree(nodes) {
  return (nodes || []).map(node => ({
    title: node.menuName,
    key: String(node.menuId),
    children: node.children?.length ? toTree(node.children) : undefined,
  }))
}

// 收集所有“有子级”的节点 id，用于默认展开整棵树
function collectExpandIds(nodes, acc = []) {
  ;(nodes || []).forEach(node => {
    if (node.children?.length) {
      acc.push(String(node.menuId))
      collectExpandIds(node.children, acc)
    }
  })
  return acc
}

async function open(record) {
  targetRoleId.value = record.roleId
  visible.value = true
  // 全量菜单树来自后端（含 M/C/F，便于给角色分配按钮权限）
  const res = await getMenuTree()
  const menus = res.data || []
  treeData.value = toTree(menus)
  expandedKeys.value = collectExpandIds(menus)
  const menuRes = await getRoleMenuIds(record.roleId)
  checkedKeys.value = (menuRes.data || []).map(id => String(id))
}

async function handleSubmit() {
  submitting.value = true
  try {
    const menuIds = checkedKeys.value.map(key => Number(key))
    await assignRoleMenus(targetRoleId.value, menuIds)
    message.success(t('system.role.assignMenuSuccess'))
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="t('system.role.assignMenuTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-alert :message="t('system.role.assignMenuTip')" type="info" show-icon class="mb-3" />
    <div class="max-h-96 overflow-auto border border-gray-200 rounded-md p-3">
      <a-tree
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        checkable
        :tree-data="treeData"
      />
    </div>
  </a-modal>
</template>
