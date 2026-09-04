<script setup>
import { message } from 'ant-design-vue'
import { nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createUser, updateUser } from '@/api/user'
import { ACCOUNT_STATUS, USER_SEX } from '@/constants'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()

const emptyForm = () => ({
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  sex: '0',
  status: '0',
})
const form = reactive(emptyForm())

const statusOptions = ACCOUNT_STATUS.map(o => ({ ...o, label: t(o.label) }))
const sexOptions = USER_SEX.map(o => ({ ...o, label: t(o.label) }))

const rules = {
  userName: [{ required: true, message: t('system.user.userNameRequired'), trigger: 'blur' }],
  nickName: [{ required: true, message: t('system.user.nickNameRequired'), trigger: 'blur' }],
  phone: [
    {
      pattern: /^1\d{10}$/,
      message: t('system.user.phoneInvalid'),
      trigger: 'blur',
    },
  ],
}

/** 打开弹窗：record 为空表示新增 */
async function open(record = null) {
  isEdit.value = !!record
  editingId.value = record?.userId ?? null
  Object.assign(form, emptyForm(), {
    userName: record?.userName ?? '',
    nickName: record?.nickName ?? '',
    phone: record?.phone ?? '',
    email: record?.email ?? '',
    sex: record?.sex ?? '0',
    status: record?.status ?? '0',
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
      await updateUser(editingId.value, payload)
    } else {
      await createUser(payload)
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
    :title="isEdit ? t('system.user.editTitle') : t('system.user.addTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('system.user.userName')" name="userName">
        <a-input
          v-model:value="form.userName"
          :disabled="isEdit"
          :placeholder="t('system.user.userName')"
        />
      </a-form-item>
      <a-form-item :label="t('system.user.nickName')" name="nickName">
        <a-input v-model:value="form.nickName" :placeholder="t('system.user.nickName')" />
      </a-form-item>
      <a-form-item :label="t('system.user.phone')" name="phone">
        <a-input v-model:value="form.phone" maxlength="11" :placeholder="t('system.user.phone')" />
      </a-form-item>
      <a-form-item :label="t('system.user.email')" name="email">
        <a-input v-model:value="form.email" :placeholder="t('system.user.email')" />
      </a-form-item>
      <a-form-item :label="t('system.user.sex')" name="sex">
        <a-select v-model:value="form.sex" :options="sexOptions" />
      </a-form-item>
      <a-form-item :label="t('system.user.status')" name="status">
        <a-select v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
