<script setup>
import {
  AppstoreOutlined,
  BulbOutlined,
  GithubOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const REMEMBER_KEY = 'gnail_admin_remembered_user'

// ---------- 状态 ----------
// 表单模式：account（账密） | phone（手机号） | qr（扫码）
const mode = ref('account')
const loading = ref(false)
const remember = ref(false)
const codeCountdown = ref(0)

const formState = ref({ username: '', password: '' })
const phoneForm = ref({ phone: '', code: '' })

// ---------- 验证码 ----------
const captchaCode = ref('')
const captcha = ref('')

function genCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}

function refreshCaptcha() {
  captchaCode.value = genCaptcha()
  captcha.value = ''
}

// ---------- 登录方式下拉（演示账号） ----------
const presetOptions = computed(() => [
  { label: t('login.accountDefault'), value: 'admin' },
  { label: t('login.accountSuper'), value: 'super' },
])
const accountPreset = ref('admin')

function onPresetChange(value) {
  formState.value.username = value
  formState.value.password = '123456'
  message.success(`${value} / 123456`)
}

// ---------- 表单校验 ----------
const passwordRules = computed(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: ['blur'] },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: ['blur'] },
  ],
  captcha: [
    { required: true, message: t('login.captchaRequired'), trigger: ['blur'] },
  ],
}))

const phoneRules = computed(() => ({
  phone: [
    { required: true, message: t('login.phoneRequired'), trigger: ['blur'] },
    { pattern: /^1\d{10}$/, message: t('login.phoneInvalid'), trigger: ['blur'] },
  ],
  code: [
    { required: true, message: t('login.smsCodeRequired'), trigger: ['blur'] },
  ],
}))
const a = 1; 
function a  () {};
// ---------- 初始化 ----------
onMounted(() => {
  refreshCaptcha()
  // 默认填充演示账号
  formState.value.username = 'admin'
  formState.value.password = '123456'
  // 记住我
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    formState.value.username = saved
    remember.value = true
  }
})

// ---------- 账密登录 ----------
async function handleLogin() {
  if (captcha.value.toLowerCase() !== captchaCode.value.toLowerCase()) {
    message.error(t('login.captchaError'))
    refreshCaptcha()
    return
  }
  loading.value = true
  try {
    await userStore.login(formState.value)
    if (remember.value) {
      localStorage.setItem(REMEMBER_KEY, formState.value.username)
    }
    else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    message.success(t('login.success'))
    const redirect = route.query.redirect
    router.push(redirect ? String(redirect) : '/dashboard')
  }
  catch (err) {
    if (err?.biz?.code === 401) {
      message.error(t('login.failed'))
    }
    else {
      message.error(err?.message || t('error.requestFailed'))
    }
  }
  finally {
    loading.value = false
  }
}

// ---------- 手机号登录（演示占位） ----------
function handlePhoneLogin() {
  message.info(t('login.notConfigured'))
}

function handleOtherLogin() {
  message.info(t('login.notConfigured'))
}

// ---------- 验证码倒计时 ----------
function getCode() {
  if (codeCountdown.value > 0)
    return
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

let countdownTimer = null

onBeforeUnmount(() => {
  if (countdownTimer)
    clearInterval(countdownTimer)
})

// ---------- 控制栏 ----------
function onSelectLocale({ key }) {
  appStore.setLocale(key)
}

function onLocaleRadio(e) {
  appStore.setLocale(e.target.value)
}

function onLayoutRadio(e) {
  appStore.setLayout(e.target.value)
}

function onToggleLayout() {
  appStore.toggleLayout()
  message.info(
    `${t('login.layoutChanged')}：${appStore.layout === 'sidebar' ? t('login.layoutSidebar') : t('login.layoutTop')}`,
  )
}

// ---------- 演示二维码（伪随机生成，固定种子保证稳定） ----------
function makeQrCells() {
  const cells = new Set()
  const finder = (ox, oy) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const on
          = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        if (on)
          cells.add(`${ox + j},${oy + i}`)
      }
    }
  }
  finder(0, 0)
  finder(14, 0)
  finder(0, 14)
  let seed = 42
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      if (cells.has(`${x},${y}`))
        continue
      if (x >= 7 && x <= 13 && y >= 7 && y <= 13)
        continue
      if (rand() < 0.42)
        cells.add(`${x},${y}`)
    }
  }
  return Array.from(cells).map((c) => {
    const [x, y] = c.split(',').map(Number)
    return { key: c, x, y }
  })
}

const qrCells = makeQrCells()
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950">
    <!-- 主体：左右各 50% -->
    <div class="relative z-10 flex flex-1">
      <div class="grid w-full md:grid-cols-2">
        <!-- ========== 左侧：品牌展示区 ========== -->
        <div
          class="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white md:flex md:flex-col"
        >
          <!-- 装饰光斑 -->
          <div class="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div class="pointer-events-none absolute left-1/4 top-1/2 h-52 w-52 rounded-full bg-sky-200/10 blur-2xl" />

          <!-- 顶部 Logo 区 -->
          <div class="relative flex items-center gap-3 p-8 lg:p-10">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl shadow-lg ring-1 ring-white/20 backdrop-blur"
            >
              🐌
            </div>
            <div class="text-xl font-bold tracking-wide">
              {{ t('login.brandTitle') }}
            </div>
          </div>

          <!-- 中央宣传区域 -->
          <div class="relative flex flex-1 flex-col items-center justify-center px-8 pb-16 text-center">
            <!-- 产品插画：玻璃拟态数据卡片 -->
            <div class="relative mb-12 w-full max-w-sm">
              <div
                class="absolute -left-4 -top-5 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur"
              >
                +12.5%
              </div>
              <div
                class="rounded-2xl bg-white/15 p-5 ring-1 ring-white/20 backdrop-blur"
              >
                <div class="mb-4 flex items-center justify-between">
                  <span class="text-sm text-white/80">数据概览</span>
                  <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                    实时
                  </span>
                </div>
                <div class="flex h-28 items-end gap-2">
                  <div class="w-6 flex-1 rounded-t bg-white/60" style="height: 30%" />
                  <div class="w-6 flex-1 rounded-t bg-white/70" style="height: 48%" />
                  <div class="w-6 flex-1 rounded-t bg-white/50" style="height: 36%" />
                  <div class="w-6 flex-1 rounded-t bg-white/80" style="height: 62%" />
                  <div class="w-6 flex-1 rounded-t bg-white/90" style="height: 54%" />
                  <div class="w-6 flex-1 rounded-t bg-white/60" style="height: 76%" />
                  <div class="w-6 flex-1 rounded-t bg-white/70" style="height: 90%" />
                </div>
                <div class="mt-3 flex justify-between text-xs text-white/50">
                  <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
                </div>
              </div>
              <div
                class="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm text-white ring-1 ring-white/30 backdrop-blur"
              >
                <span>👥</span>
                <span>1,286</span>
              </div>
            </div>

            <!-- 主标题 + 副标题 -->
            <h1 class="text-3xl font-extrabold leading-snug lg:text-4xl">
              {{ t('login.brandSlogan') }}
            </h1>
            <p class="mt-3 text-sm text-white/70 lg:text-base">
              {{ t('login.brandSub') }}
            </p>
          </div>
        </div>

        <!-- ========== 右侧：登录区 ========== -->
        <div class="relative flex flex-col bg-white dark:bg-zinc-900">
          <!-- 顶部功能按钮 -->
          <div class="absolute right-6 top-6 z-20 flex items-center gap-2">
            <a-tooltip :title="t('header.toggleTheme')">
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-indigo-400"
                @click="appStore.toggleTheme()"
              >
                <BulbOutlined />
              </button>
            </a-tooltip>

            <a-tooltip :title="t('login.layoutToggle')">
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-indigo-400"
                @click="onToggleLayout"
              >
                <AppstoreOutlined />
              </button>
            </a-tooltip>

            <a-dropdown placement="bottomRight">
              <button
                class="flex h-9 items-center gap-1.5 rounded-full bg-gray-50 px-3 text-sm text-gray-600 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10 dark:hover:text-indigo-400"
              >
                <GlobalOutlined />
                {{ appStore.locale === 'zh-CN' ? '中文' : 'EN' }}
              </button>
              <template #overlay>
                <a-menu @click="onSelectLocale">
                  <a-menu-item key="zh-CN">
                    简体中文
                  </a-menu-item>
                  <a-menu-item key="en-US">
                    English
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <a-popover placement="bottomRight" trigger="click">
              <template #content>
                <div class="w-60 space-y-4 p-1">
                  <div class="text-sm font-semibold text-gray-800 dark:text-zinc-100">
                    {{ t('login.settingsTitle') }}
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-zinc-300">
                      {{ t('header.toggleTheme') }}
                    </span>
                    <a-switch
                      :checked="appStore.theme === 'dark'"
                      size="small"
                      @change="appStore.toggleTheme()"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-zinc-300">
                      {{ t('header.language') }}
                    </span>
                    <a-radio-group :value="appStore.locale" size="small" @change="onLocaleRadio">
                      <a-radio-button value="zh-CN">
                        中
                      </a-radio-button>
                      <a-radio-button value="en-US">
                        EN
                      </a-radio-button>
                    </a-radio-group>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-zinc-300">
                      {{ t('login.layoutToggle') }}
                    </span>
                    <a-radio-group :value="appStore.layout" size="small" @change="onLayoutRadio">
                      <a-radio-button value="sidebar">
                        {{ t('login.layoutSidebar') }}
                      </a-radio-button>
                      <a-radio-button value="top">
                        {{ t('login.layoutTop') }}
                      </a-radio-button>
                    </a-radio-group>
                  </div>
                </div>
              </template>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-indigo-400"
              >
                <SettingOutlined />
              </button>
            </a-popover>
          </div>

          <!-- 登录表单容器 -->
          <div class="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
            <div class="w-full max-w-md">
              <!-- ===== 账密登录 ===== -->
              <template v-if="mode === 'account'">
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
                  @finish="handleLogin"
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

                  <a-form-item name="username" :rules="passwordRules.username">
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

                  <a-form-item name="password" :rules="passwordRules.password">
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
                  <a-form-item name="captcha" :rules="passwordRules.captcha">
                    <div class="flex gap-3">
                      <a-input
                        v-model:value="captcha"
                        size="large"
                        :placeholder="t('login.captchaPlaceholder')"
                        class="flex-1"
                      >
                        <template #prefix>
                          <SafetyCertificateOutlined class="text-gray-300 dark:text-zinc-500" />
                        </template>
                      </a-input>
                      <button
                        type="button"
                        class="flex h-10 w-24 shrink-0 cursor-pointer select-none items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-mono text-lg font-bold tracking-[0.3em] text-indigo-500 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-indigo-400"
                        title="点击刷新"
                        @click="refreshCaptcha"
                      >
                        {{ captchaCode }}
                      </button>
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
                    :loading="loading"
                    :style="{ height: '44px', fontSize: '15px' }"
                  >
                    {{ t('login.submit') }}
                  </a-button>
                </a-form>

                <!-- 快捷登录 -->
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <a-button size="large" @click="mode = 'phone'">
                    <template #icon>
                      <MobileOutlined />
                    </template>
                    {{ t('login.quickPhone') }}
                  </a-button>
                  <a-button size="large" @click="mode = 'qr'">
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

              <!-- ===== 手机号登录 ===== -->
              <template v-else-if="mode === 'phone'">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ t('login.quickPhone') }}
                </h2>
                <a-form
                  :model="phoneForm"
                  name="phoneLogin"
                  autocomplete="off"
                  class="mt-6"
                  @finish="handlePhoneLogin"
                >
                  <a-form-item name="phone" :rules="phoneRules.phone">
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

                  <a-form-item name="code" :rules="phoneRules.code">
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
                        <a-button
                          type="link"
                          size="small"
                          :disabled="codeCountdown > 0"
                          @click="getCode"
                        >
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

                  <a-button type="link" block class="mt-2" @click="mode = 'account'">
                    {{ t('login.backToAccount') }}
                  </a-button>
                </a-form>
              </template>

              <!-- ===== 扫码登录 ===== -->
              <template v-else>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ t('login.quickQr') }}
                </h2>
                <div class="mt-6 flex flex-col items-center justify-center py-4">
                  <div class="relative rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                    <svg
                      viewBox="0 0 21 21"
                      shape-rendering="crispEdges"
                      class="h-44 w-44 text-gray-900"
                    >
                      <rect
                        v-for="cell in qrCells"
                        :key="cell.key"
                        :x="cell.x"
                        :y="cell.y"
                        width="1"
                        height="1"
                        fill="currentColor"
                      />
                    </svg>
                    <div
                      class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-500 text-xl text-white shadow"
                    >
                      🐌
                    </div>
                  </div>
                  <p class="mt-5 text-sm text-gray-600 dark:text-zinc-300">
                    {{ t('login.qrDesc') }}
                  </p>
                  <p class="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                    {{ t('login.qrPlaceholder') }}
                  </p>
                  <a-button type="link" class="mt-3" @click="mode = 'account'">
                    {{ t('login.backToAccount') }}
                  </a-button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <footer class="relative z-10 py-4 text-center text-xs text-gray-400 dark:text-zinc-600">
      {{ t('login.copyright') }}
    </footer>
  </div>
</template>
