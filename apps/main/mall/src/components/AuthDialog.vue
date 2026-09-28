<script setup lang="ts">
import { ref, watch } from 'vue'
import { ApiError } from '@/api/request'
import { useMemberStore } from '@/stores/member'
import type { AuthDialogEmits, AuthDialogProps } from './types'

const props = defineProps<AuthDialogProps>()
const emit = defineEmits<AuthDialogEmits>()
const member = useMemberStore()
const mode = ref<'login' | 'register'>('login')
const phone = ref('')
const password = ref('')
const nickname = ref('')
const busy = ref(false)
const errorMessage = ref('')

watch(
  () => props.open,
  open => {
    if (open) errorMessage.value = ''
  },
)

async function submit() {
  busy.value = true
  errorMessage.value = ''
  try {
    if (mode.value === 'register') {
      await member.register({
        phone: phone.value.trim(),
        password: password.value,
        nickname: nickname.value.trim(),
      })
    } else {
      await member.login({ phone: phone.value.trim(), password: password.value })
    }
    password.value = ''
    emit('success')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '暂时无法完成操作，请稍后重试。'
  } finally {
    busy.value = false
  }
}

function setMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  errorMessage.value = ''
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="auth-overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
      <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button class="auth-dialog__close" type="button" aria-label="关闭" @click="emit('close')">
          ×
        </button>
        <span class="auth-dialog__eyebrow">FORME / MEMBER</span>
        <h2 id="auth-title">{{ mode === 'login' ? '欢迎回来。' : '加入 FORME。' }}</h2>
        <p>登录后即可同步购物袋与订单。</p>

        <div class="auth-tabs" role="tablist" aria-label="账户操作">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            :class="{ 'is-active': mode === 'login' }"
            @click="setMode('login')"
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            :class="{ 'is-active': mode === 'register' }"
            @click="setMode('register')"
          >
            注册
          </button>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <label v-if="mode === 'register'">
            <span>怎么称呼你</span>
            <input
              v-model="nickname"
              autocomplete="nickname"
              maxlength="64"
              required
              placeholder="你的昵称"
            />
          </label>
          <label>
            <span>手机号</span>
            <input
              v-model="phone"
              autocomplete="tel"
              inputmode="tel"
              required
              placeholder="请输入手机号"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              v-model="password"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              minlength="6"
              maxlength="64"
              required
              type="password"
              placeholder="至少 6 位"
            />
          </label>
          <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>
          <button class="auth-form__submit" type="submit" :disabled="busy">
            {{ busy ? '请稍候…' : mode === 'login' ? '登录商城' : '创建账户' }}
          </button>
        </form>
        <small>会员账户与管理后台账号相互独立。</small>
      </section>
    </div>
  </Teleport>
</template>

<style scoped src="./auth-dialog.css"></style>
