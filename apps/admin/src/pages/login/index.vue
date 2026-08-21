<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const loading = ref(false)

// 表单数据
const formState = ref({
  username: '',
  password: ''
})

// 表单校验规则
const rules = computed(() => ({
  username: [
    {
      required: true,
      message: t('login.usernameRequired'),
      trigger: ['blur']
    }
  ],
  password: [
    {
      required: true,
      message: t('login.passwordRequired'),
      trigger: ['blur']
    }
  ]
}))

const handleLogin = async (values) => {
  loading.value = true

  try {
    await userStore.login(values)

    message.success(t('login.success'))

    const redirect = route.query.redirect

    router.push(
      redirect ? String(redirect) : '/dashboard' 
    )
  } catch (err) {
    // 后端业务异常（HTTP 200 + code 401）
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
  <div
    class="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <!-- 语言切换 -->
    <!--
    <a-dropdown class="absolute top-4 right-4 z-10">
      <a-button size="small">
        {{ appStore.locale === 'zh-CN' ? t('language.zhCN') : t('language.enUS') }}
        <DownOutlined />
      </a-button>

      <template #overlay>
        <a-menu @click="({ key }) => appStore.setLocale(key)">
          <a-menu-item key="zh-CN">
            {{ t('language.zhCN') }}
          </a-menu-item>

          <a-menu-item key="en-US">
            {{ t('language.enUS') }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    -->

    <a-card
      class="w-full max-w-md shadow-xl rounded-xl"
      :bordered="false"
    >
      <div class="text-center mb-6">
        <span class="text-4xl">🐌</span>

        <h1 class="text-2xl font-bold mt-2">
          Ziven
        </h1>

        <p class="text-gray-400 mt-1">
          {{ t('login.subtitle') }}
        </p>
      </div>

      <a-form
        :model="formState"
        name="login"
        autocomplete="off"
        @finish="handleLogin"
        :label-col="{ span: 0 }"
      >

        <a-form-item
          name="username"
          :rules="rules.username"
        >
          <a-input
            v-model:value="formState.username"
            size="large"
            :placeholder="t('login.username')"
          >
            <template #prefix>
              <UserOutlined class="text-gray-300" />
            </template>
          </a-input>
        </a-form-item>


        <a-form-item
          name="password"
          :rules="rules.password"
        >
          <a-input-password
            v-model:value="formState.password"
            size="large"
            :placeholder="t('login.password')"
          >
            <template #prefix>
              <LockOutlined class="text-gray-300" />
            </template>
          </a-input-password>
        </a-form-item>


        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            size="large"
            :loading="loading"
          >
            {{ t('login.submit') }}
          </a-button>
        </a-form-item>

      </a-form>
    </a-card>
  </div>
</template>