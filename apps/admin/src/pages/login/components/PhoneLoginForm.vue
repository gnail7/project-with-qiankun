<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { message } from 'ant-design-vue'
import { MobileOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['back'])

const phoneForm = ref({ phone: '', code: '' })
const codeCountdown = ref(0)
let countdownTimer = null

const rules = computed(() => ({
  phone: [
    { required: true, message: t('login.phoneRequired'), trigger: ['blur'] },
    { pattern: /^1\d{10}$/, message: t('login.phoneInvalid'), trigger: ['blur'] },
  ],
  code: [{ required: true, message: t('login.smsCodeRequired'), trigger: ['blur'] }],
}))

// ---------- 验证码倒计时 ----------
function getCode() {
  if (codeCountdown.value > 0) return
  if (!phoneForm.value.phone) {
    message.warning(t('login.phoneRequired'))
    return
  }
  message.success(t('login.codeSent'))
  codeCountdown.value = 60
  countdownTimer = setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

// ---------- 提交（演示占位） ----------
function handleSubmit() {
  message.info(t('login.notConfigured'))
}
</script>

<template>
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
    {{ t('login.quickPhone') }}
  </h2>

  <a-form
    :model="phoneForm"
    name="phoneLogin"
    autocomplete="off"
    class="mt-6"
    @finish="handleSubmit"
  >
    <a-form-item name="phone" :rules="rules.phone">
      <a-input
        v-model:value="phoneForm.phone"
        size="large"
        maxlength="11"
        :placeholder="t('login.phonePlaceholder')"
      >
        <template #prefix>
          <MobileOutlined class="text-gray-300 dark:text-zinc-500" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item name="code" :rules="rules.code">
      <a-input
        v-model:value="phoneForm.code"
        size="large"
        maxlength="6"
        :placeholder="t('login.smsCodePlaceholder')"
      >
        <template #prefix>
          <SafetyCertificateOutlined class="text-gray-300 dark:text-zinc-500" />
        </template>
        <template #suffix>
          <a-button type="link" size="small" :disabled="codeCountdown > 0" @click="getCode">
            {{ codeCountdown > 0 ? `${codeCountdown}s` : t('login.getCode') }}
          </a-button>
        </template>
      </a-input>
    </a-form-item>

    <a-button
      type="primary"
      html-type="submit"
      block
      size="large"
      :style="{ height: '44px', fontSize: '15px' }"
    >
      {{ t('login.submit') }}
    </a-button>

    <a-button type="link" block class="mt-2" @click="emit('back')">
      {{ t('login.backToAccount') }}
    </a-button>
  </a-form>
</template>
