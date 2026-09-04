<script setup>
import { message } from 'ant-design-vue'
import { nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createRole, updateRole } from '@/api/role'
import { ACCOUNT_STATUS, DATA_SCOPE } from '@/constants'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()

const emptyForm = () => ({
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  dataScope: '1',
  remark: '',
})
const form = reactive(emptyForm())

const statusOptions = ACCOUNT_STATUS.map(o => ({ ...o, label: t(o.label) }))
const dataScopeOptions = DATA_SCOPE.map(o => ({ ...o, label: t(o.label) }))

const rules = {
  roleName: [{ required: true, message: t('system.role.roleNameRequired'), trigger: 'blur' }],
  roleKey: [{ required: true, message: t('system.role.roleKeyRequired'), trigger: 'blur' }],
}

async function open(record = null) {
  isEdit.value = !!record
  editingId.value = record?.roleId ?? null
  Object.assign(form, emptyForm(), {
    roleName: record?.roleName ?? '',
    roleKey: record?.roleKey ?? '',
    roleSort: record?.roleSort ?? 0,
    status: record?.status ?? '0',
    dataScope: record?.dataScope ?? '1',
    remark: record?.remark ?? '',
  })
  visible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = { ...form }
    if (isEdit.value) {
      await updateRole(editingId.value, payload)
    } else {
      await createRole(payload)
    }
    message.success(t(isEdit.value ? 'common.updateSuccess' : 'common.createSuccess'))
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
    :title="isEdit ? t('system.role.editTitle') : t('system.role.addTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('system.role.roleName')" name="roleName">
        <a-input v-model:value="form.roleName" :placeholder="t('system.role.roleName')" />
      </a-form-item>
      <a-form-item :label="t('system.role.roleKey')" name="roleKey">
        <a-input v-model:value="form.roleKey" :placeholder="t('system.role.roleKey')" />
      </a-form-item>
      <a-form-item :label="t('system.role.roleSort')" name="roleSort">
        <a-input-number v-model:value="form.roleSort" :min="0" class="w-full" />
      </a-form-item>
      <a-form-item :label="t('system.role.status')" name="status">
        <a-select v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
      <a-form-item :label="t('system.role.dataScope')" name="dataScope">
        <a-select v-model:value="form.dataScope" :options="dataScopeOptions" />
      </a-form-item>
      <a-form-item :label="t('system.role.remark')" name="remark">
        <a-textarea v-model:value="form.remark" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
