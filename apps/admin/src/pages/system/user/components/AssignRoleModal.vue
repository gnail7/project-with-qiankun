<script setup>
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { assignUserRoles, getUserRoles } from '@/api/user'
import { getRoleList } from '@/api/role'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const targetUserId = ref(null)
const roleOptions = ref([]) // a-transfer 数据源 { key, title }
const targetKeys = ref([])

async function open(record) {
  targetUserId.value = record.userId
  visible.value = true
  const [roleRes, assignedRes] = await Promise.all([getRoleList(), getUserRoles(record.userId)])
  roleOptions.value = (roleRes.data || []).map(role => ({
    key: role.roleId,
    title: role.roleName,
  }))
  targetKeys.value = (assignedRes.data || []).map(role => role.roleId)
}

async function handleSubmit() {
  submitting.value = true
  try {
    await assignUserRoles(targetUserId.value, targetKeys.value)
    message.success(t('system.user.assignRoleSuccess'))
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
    :title="t('system.user.assignRoleTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-transfer
      v-model:target-keys="targetKeys"
      :data-source="roleOptions"
      :render="item => item.title"
      :titles="[t('system.user.unassigned'), t('system.user.assigned')]"
      class="w-full"
    />
  </a-modal>
</template>
