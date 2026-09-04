<script setup>
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { assignRoleMenus, getRoleMenuIds } from '@/api/role'
import { asyncMenus } from '@/router/menu-config'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const targetRoleId = ref(null)
const checkedKeys = ref([])
const expandedKeys = ref([])

// 菜单配置 → antd treeData（key 统一转字符串）
const treeData = computed(() => buildTree(asyncMenus))

function buildTree(menus) {
  return menus.map(item => ({
    title: t(item.titleKey),
    key: String(item.id),
    children: item.children?.length ? buildTree(item.children) : undefined,
  }))
}

async function open(record) {
  targetRoleId.value = record.roleId
  visible.value = true
  // 默认展开第一层
  expandedKeys.value = asyncMenus.map(item => String(item.id))
  const res = await getRoleMenuIds(record.roleId)
  checkedKeys.value = (res.data || []).map(id => String(id))
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
