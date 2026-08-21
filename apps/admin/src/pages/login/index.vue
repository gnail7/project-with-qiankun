<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BrandPanel from './components/BrandPanel.vue'
import HeaderControls from './components/HeaderControls.vue'
import AccountLoginForm from './components/AccountLoginForm.vue'
import PhoneLoginForm from './components/PhoneLoginForm.vue'
import QrLoginPanel from './components/QrLoginPanel.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单模式：account（账密） | phone（手机号） | qr（扫码）
const mode = ref('account')
const loading = ref(false)

/** 账密登录：调用后端接口并跳转 */
async function handleSubmit(payload) {
  loading.value = true
  try {
    await userStore.login(payload)
    message.success(t('login.success'))
    const redirect = route.query.redirect
    router.push(redirect ? String(redirect) : '/dashboard')
  } catch (err) {
    if (err?.biz?.code === 401) {
      message.error(t('login.failed'))
    } else {
      message.error(err?.message || t('error.requestFailed'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950">
    <!-- 主体：左右各 50% -->
    <div class="relative z-10 flex flex-1">
      <div class="grid w-full md:grid-cols-2">
        <!-- 左侧：品牌展示区 -->
        <BrandPanel />

        <!-- 右侧：登录区 -->
        <div class="relative flex flex-col bg-white dark:bg-zinc-900">
          <HeaderControls />

          <div class="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
            <div class="w-full max-w-md">
              <AccountLoginForm
                v-if="mode === 'account'"
                :loading="loading"
                @submit="handleSubmit"
                @switch-mode="mode = $event"
              />
              <PhoneLoginForm v-else-if="mode === 'phone'" @back="mode = 'account'" />
              <QrLoginPanel v-else @back="mode = 'account'" />
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
