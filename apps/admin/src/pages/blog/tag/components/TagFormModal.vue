<script setup>
import { message } from 'ant-design-vue'
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createBlogTag, updateBlogTag } from '@/api/blog'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()

const emptyForm = () => ({ tagName: '', orderNum: 0, status: '0' })
const form = reactive(emptyForm())

const statusOptions = computed(() => [
  { value: '0', label: t('common.statusNormal') },
  { value: '1', label: t('common.statusDisabled') },
])

const rules = {
  tagName: [{ required: true, message: t('blog.tag.nameRequired'), trigger: 'blur' }],
}

function open(record = null) {
  isEdit.value = !!record
  editingId.value = record?.tagId ?? null
  Object.assign(form, emptyForm(), {
    tagName: record?.tagName ?? '',
    orderNum: record?.orderNum ?? 0,
    status: record?.status ?? '0',
  })
  visible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = { ...form }
    if (isEdit.value) {
      await updateBlogTag(editingId.value, payload)
    } else {
      await createBlogTag(payload)
    }
    message.success(t(isEdit.value ? 'common.updateSuccess' : 'common.createSuccess'))
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? t('blog.tag.editTitle') : t('blog.tag.addTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('blog.tag.name')" name="tagName">
        <a-input v-model:value="form.tagName" />
      </a-form-item>
      <a-form-item :label="t('blog.tag.orderNum')" name="orderNum">
        <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item :label="t('blog.tag.status')" name="status">
        <a-radio-group v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
