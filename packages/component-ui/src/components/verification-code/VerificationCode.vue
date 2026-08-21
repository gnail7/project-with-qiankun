<script setup lang="ts">
// 图形验证码组件：随机生成验证码并展示，点击刷新
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 验证码长度，默认 4 */
    length?: number
  }>(),
  {
    length: 4,
  },
)

const emit = defineEmits<{
  (e: 'refresh', code: string): void
}>()

const code = ref('')

// 去掉易混淆字符（0/O、1/I、8/B 等）
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function genCode(len: number) {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return s
}

/** 重新生成验证码 */
function refresh() {
  code.value = genCode(props.length)
  emit('refresh', code.value)
}

/** 校验用户输入（忽略大小写），供父组件调用 */
function verify(input: string) {
  return (
    String(input ?? '')
      .trim()
      .toLowerCase() === code.value.toLowerCase()
  )
}

defineExpose({ code, refresh, verify })

onMounted(refresh)
</script>

<template>
  <button type="button" class="vc-box" title="点击刷新验证码" @click="refresh">
    {{ code }}
  </button>
</template>

<style scoped>
.vc-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.06);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-indent: 0.25em; /* 抵消 letter-spacing 造成的不居中 */
  background-color: #6366f1;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.vc-box:hover {
  border-color: #a5b4fc;
}
</style>
