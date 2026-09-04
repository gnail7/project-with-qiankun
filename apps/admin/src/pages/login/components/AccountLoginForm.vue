<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  GithubOutlined,
  GoogleOutlined,
  LockOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { VerificationCode } from '@ziven/ui'

const { t } = useI18n()

const props = defineProps({
  /** 登录请求中时按钮 loading */
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'switch-mode'])

const REMEMBER_KEY = 'gnail_admin_remembered_user'

// ---------- 表单状态（captcha 必须在 formState 中，antd 校验才会生效） ----------
const formState = ref({ username: '', password: '', captcha: '' })
const captchaRef = ref(null)
const remember = ref(false)

const rules = computed(() => ({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: ['blur'] }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: ['blur'] }],
  captcha: [{ required: true, message: t('login.captchaRequired'), trigger: ['blur'] }],
}))

// ---------- 登录方式下拉（演示账号） ----------
const presetOptions = computed(() => [
  { label: t('login.accountDefault'), value: 'admin' },
  { label: t('login.accountSuper'), value: 'super admin' },
])
const accountPreset = ref('admin')

function onPresetChange(value) {
  formState.value.username = value
  formState.value.password = 'admin123'
  message.success(`${value} / admin123`)
}

// ---------- 初始化 ----------
onMounted(() => {
  // 默认填充演示账号
  formState.value.username = 'admin'
  formState.value.password = 'admin123'
  // 记住我
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    formState.value.username = saved
    remember.value = true
  }
})

// ---------- 提交（a-form 校验通过后触发） ----------
function handleSubmit() {
  // 额外校验图形验证码
  if (!captchaRef.value?.verify(formState.value.captcha)) {
    message.error(t('login.captchaError'))
    captchaRef.value?.refresh()
    formState.value.captcha = ''
    return
  }
  // 记住账号
  if (remember.value) {
    localStorage.setItem(REMEMBER_KEY, formState.value.username)
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
  emit('submit', { username: formState.value.username, password: formState.value.password })
}

// ---------- 占位功能 ----------
function handleOtherLogin() {
  message.info(t('login.notConfigured'))
}
</script>

<template>
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
    {{ t('login.welcome') }}
  </h2>
  <p class="mt-1.5 text-sm text-gray-400 dark:text-zinc-500">
    {{ t('login.welcomeDesc') }}
  </p>

  <a-form
    :model="formState"
    name="passwordLogin"
    autocomplete="off"
    class="mt-6"
    @finish="handleSubmit"
  >
    <!-- 登录方式下拉 -->
    <a-form-item>
      <a-select
        v-model:value="accountPreset"
        size="large"
        :options="presetOptions"
        :placeholder="t('login.accountPreset')"
        @change="onPresetChange"
      />
    </a-form-item>

    <a-form-item name="username" :rules="rules.username">
      <a-input
        v-model:value="formState.username"
        size="large"
        :placeholder="t('login.usernamePlaceholder')"
      >
        <template #prefix>
          <UserOutlined class="text-gray-300 dark:text-zinc-500" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item name="password" :rules="rules.password">
      <a-input-password
        v-model:value="formState.password"
        size="large"
        :placeholder="t('login.passwordPlaceholder')"
      >
        <template #prefix>
          <LockOutlined class="text-gray-300 dark:text-zinc-500" />
        </template>
      </a-input-password>
    </a-form-item>

    <!-- 验证码区域 -->
    <a-form-item name="captcha" :rules="rules.captcha">
      <div class="flex gap-3">
        <a-input
          v-model:value="formState.captcha"
          size="large"
          :placeholder="t('login.captchaPlaceholder')"
          class="flex-1"
        >
          <template #prefix>
            <SafetyCertificateOutlined class="text-gray-300 dark:text-zinc-500" />
          </template>
        </a-input>
        <VerificationCode ref="captchaRef" @refresh="formState.captcha = ''" />
      </div>
    </a-form-item>

    <!-- 记住账号 + 忘记密码 -->
    <div class="mb-6 flex items-center justify-between">
      <a-checkbox v-model:checked="remember" class="text-sm">
        {{ t('login.rememberMe') }}
      </a-checkbox>
      <a-button
        type="link"
        size="small"
        :style="{ padding: 0 }"
        class="text-indigo-500"
        @click="message.info(t('login.forgotPasswordTip'))"
      >
        {{ t('login.forgotPassword') }}
      </a-button>
    </div>

    <!-- 登录按钮 -->
    <a-button
      type="primary"
      html-type="submit"
      block
      size="large"
      :loading="props.loading"
      :style="{ height: '44px', fontSize: '15px' }"
    >
      {{ t('login.submit') }}
    </a-button>
  </a-form>

  <!-- 快捷登录 -->
  <div class="mt-4 grid grid-cols-2 gap-3">
    <a-button size="large" @click="emit('switch-mode', 'phone')">
      <template #icon>
        <MobileOutlined />
      </template>
      {{ t('login.quickPhone') }}
    </a-button>
    <a-button size="large" @click="emit('switch-mode', 'qr')">
      <template #icon>
        <QrcodeOutlined />
      </template>
      {{ t('login.quickQr') }}
    </a-button>
  </div>

  <!-- 第三方登录 -->
  <div class="my-5 flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
    <span class="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
    <span>{{ t('login.otherLogin') }}</span>
    <span class="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
  </div>
  <div class="flex items-center justify-center gap-5">
    <button
      class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#07C160] hover:text-[#07C160] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
      title="WeChat"
      @click="handleOtherLogin"
    >
      <WechatOutlined />
    </button>
    <button
      class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#181717] hover:text-[#181717] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
      title="GitHub"
      @click="handleOtherLogin"
    >
      <GithubOutlined />
    </button>
    <button
      class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#4285F4] hover:text-[#4285F4] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
      title="Google"
      @click="handleOtherLogin"
    >
      <GoogleOutlined />
    </button>
  </div>

  <!-- 注册提示 -->
  <div class="mt-6 text-center text-sm text-gray-400 dark:text-zinc-500">
    {{ t('login.registerHint') }}
    <a class="text-indigo-500" @click="message.info(t('login.registerTip'))">
      {{ t('login.register') }}
    </a>
  </div>
</template>
