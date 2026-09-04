<script setup>
import { message } from 'ant-design-vue'
import { nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resetUserPassword } from '@/api/user'

const { t } = useI18n()

const visible = ref(false)
const submitting = ref(false)
const targetUserId = ref(null)
const formRef = ref()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const rules = {
  password: [
    { required: true, message: t('system.user.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('system.user.passwordLength'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('system.user.confirmPwdRequired'), trigger: 'blur' },
    {
      validator: (_rule, value) =>
        value === form.password
          ? Promise.resolve()
          : Promise.reject(new Error(t('system.user.confirmPwdMismatch'))),
      trigger: 'blur',
    },
  ],
}

async function open(record) {
  targetUserId.value = record.userId
  form.password = ''
  form.confirmPassword = ''
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
    await resetUserPassword(targetUserId.value, form.password)
    message.success(t('system.user.resetPwdSuccess'))
    visible.value = false
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="t('system.user.resetPwdTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('system.user.newPassword')" name="password">
        <a-input-password v-model:value="form.password" />
      </a-form-item>
      <a-form-item :label="t('system.user.confirmPassword')" name="confirmPassword">
        <a-input-password v-model:value="form.confirmPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
