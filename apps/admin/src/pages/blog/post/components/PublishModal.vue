<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  open: Boolean,
  submitting: Boolean,
  form: { type: Object, default: () => ({}) },
  categoryOptions: { type: Array, default: () => [] },
  tagOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'confirm'])

const { t } = useI18n()
const formRef = ref()
const editForm = reactive({
  categoryId: null,
  tagIds: [],
  summary: '',
  slug: '',
  cover: '',
  isTop: false,
  isRecommend: false,
})

const rules = {
  categoryId: [
    { required: true, message: t('blog.post.publishCategoryRequired'), trigger: 'change' },
  ],
}

watch(
  () => props.open,
  open => {
    if (open) {
      editForm.categoryId = props.form.categoryId ?? null
      editForm.tagIds = [...(props.form.tagIds || [])]
      editForm.summary = props.form.summary || ''
      editForm.slug = props.form.slug || ''
      editForm.cover = props.form.cover || ''
      editForm.isTop = !!props.form.isTop
      editForm.isRecommend = !!props.form.isRecommend
      formRef.value?.clearValidate()
    }
  },
)

async function handleOk() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  emit('confirm', {
    categoryId: editForm.categoryId,
    tagIds: editForm.tagIds,
    summary: editForm.summary,
    slug: editForm.slug,
    cover: editForm.cover,
    isTop: editForm.isTop ? 1 : 0,
    isRecommend: editForm.isRecommend ? 1 : 0,
  })
}
</script>

<template>
  <a-modal
    :open="open"
    :title="t('blog.post.publishTitle')"
    :confirm-loading="submitting"
    :ok-text="t('blog.post.publish')"
    :cancel-text="t('common.cancel')"
    @update:open="v => emit('update:open', v)"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="editForm" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('blog.post.category')" name="categoryId">
        <a-select v-model:value="editForm.categoryId" :options="categoryOptions" allow-clear />
      </a-form-item>
      <a-form-item :label="t('blog.post.tags')" name="tagIds">
        <a-select
          v-model:value="editForm.tagIds"
          mode="multiple"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item :label="t('blog.post.summary')" name="summary">
        <a-textarea v-model:value="editForm.summary" :rows="2" />
      </a-form-item>
      <a-form-item :label="t('blog.post.slug')" name="slug">
        <a-input v-model:value="editForm.slug" />
      </a-form-item>
      <a-form-item :label="t('blog.post.cover')" name="cover">
        <a-input v-model:value="editForm.cover" />
      </a-form-item>
      <a-form-item :label="t('blog.post.isTop')" name="isTop">
        <a-switch v-model:checked="editForm.isTop" />
      </a-form-item>
      <a-form-item :label="t('blog.post.isRecommend')" name="isRecommend">
        <a-switch v-model:checked="editForm.isRecommend" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
