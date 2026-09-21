# VerificationCode 验证码

验证码组件会生成 4 位随机字母数字验证码，点击可以刷新，并通过 expose 暴露校验方法。

<script setup lang="ts">
import { ref } from 'vue'
import { VerificationCode } from '@ziven/ui'

const verificationCodeRef = ref<InstanceType<typeof VerificationCode> | null>(null)
const result = ref('')

function verify() {
  const code = verificationCodeRef.value?.code ?? ''
  result.value = verificationCodeRef.value?.verify(code) ? '校验通过' : '校验失败'
}
</script>

<div class="demo-block">
  <p class="demo-block__title">点击验证码刷新</p>
  <div class="demo-block__row">
    <VerificationCode ref="verificationCodeRef" />
    <button type="button" @click="verify">校验当前值</button>
    <span>{{ result }}</span>
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VerificationCode } from '@ziven/ui'

const codeRef = ref<InstanceType<typeof VerificationCode> | null>(null)

function verify(input: string) {
  return codeRef.value?.verify(input) ?? false
}
</script>

<template>
  <VerificationCode ref="codeRef" />
</template>
```

公开方法：`refresh()` 刷新验证码，`verify(input)` 忽略大小写校验，`code` 获取当前验证码。
