<script setup>
import { InboxOutlined } from '@ant-design/icons-vue'
import { message, Upload } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { importUsers } from '@/api/user'

const { t } = useI18n()
const emit = defineEmits(['imported'])

const ACCEPT = '.xlsx,.xls'
const MAX_SIZE_MB = 10

const visible = ref(false)
const submitting = ref(false)
const fileList = ref([])

function open() {
  fileList.value = []
  visible.value = true
}

/** 只做本地校验并暂存文件，真正上传由弹窗确认后触发 */
function beforeUpload(file) {
  const name = file.name?.toLowerCase() ?? ''
  if (!ACCEPT.split(',').some(ext => name.endsWith(ext))) {
    message.error(t('system.user.importFileType'))
    return Upload.LIST_IGNORE
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    message.error(t('system.user.importFileSize', { size: MAX_SIZE_MB }))
    return Upload.LIST_IGNORE
  }
  // 返回 false 阻止组件自动上传，同时保留文件在选择列表中
  return false
}

async function handleSubmit() {
  const file = fileList.value[0]?.originFileObj
  if (!file) {
    message.warning(t('system.user.importFileRequired'))
    return
  }

  submitting.value = true
  try {
    const res = await importUsers(file)
    const count = Array.isArray(res.data) ? res.data.length : 0
    message.success(count ? t('system.user.importSuccess', { count }) : t('system.user.importDone'))
    visible.value = false
    emit('imported')
  } catch (error) {
    // HTTP 层错误已由 request 拦截器统一提示，这里只兜底业务错误
    if (error?.biz) {
      message.error(error.message || t('error.requestFailed'))
    }
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="t('system.user.importTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.import')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-upload-dragger
      v-model:file-list="fileList"
      :accept="ACCEPT"
      :max-count="1"
      :disabled="submitting"
      :before-upload="beforeUpload"
    >
      <p class="import-modal__icon">
        <InboxOutlined />
      </p>
      <p class="import-modal__text">{{ t('system.user.importDragText') }}</p>
      <p class="import-modal__hint">{{ t('system.user.importHint', { size: MAX_SIZE_MB }) }}</p>
    </a-upload-dragger>
  </a-modal>
</template>

<style scoped>
.import-modal__icon {
  margin-bottom: 8px;
  color: var(--ant-color-primary, #1677ff);
  font-size: 40px;
}

.import-modal__text {
  margin-bottom: 4px;
  font-size: 14px;
}

.import-modal__hint {
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
