<script setup>
import { message } from 'ant-design-vue'
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useTheme } from '@ziven/ui/theme'
import {
  createBlogPost,
  getBlogCategoryList,
  getBlogPost,
  getBlogTagList,
  updateBlogPost,
} from '@/api/blog'

const { t } = useI18n()
const { isDark } = useTheme()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()
const categoryOptions = ref([])
const tagOptions = ref([])

const emptyForm = () => ({
  title: '',
  slug: '',
  categoryId: null,
  tagIds: [],
  summary: '',
  content: '',
  cover: '',
  status: '0',
  isTop: 0,
  isRecommend: 0,
})
const form = reactive(emptyForm())

const statusOptions = computed(() => [
  { value: '0', label: t('blog.post.statusDraft') },
  { value: '1', label: t('blog.post.statusPublished') },
  { value: '2', label: t('blog.post.statusOff') },
])

const rules = {
  title: [{ required: true, message: t('blog.post.titleRequired'), trigger: 'blur' }],
  categoryId: [{ required: true, message: t('blog.post.categoryPlaceholder'), trigger: 'change' }],
}

async function open(record = null) {
  isEdit.value = !!record
  editingId.value = record?.postId ?? null
  visible.value = true

  // 下拉数据
  const [catRes, tagRes] = await Promise.all([getBlogCategoryList(), getBlogTagList()])
  categoryOptions.value = (catRes.data || []).map(c => ({
    value: c.categoryId,
    label: c.categoryName,
  }))
  tagOptions.value = (tagRes.data || []).map(tag => ({ value: tag.tagId, label: tag.tagName }))

  // 编辑时拉详情补全 tagIds 等
  if (isEdit.value) {
    const detail = await getBlogPost(editingId.value)
    Object.assign(form, emptyForm(), {
      title: detail.data?.title ?? '',
      slug: detail.data?.slug ?? '',
      categoryId: detail.data?.categoryId ?? null,
      tagIds: detail.data?.tagIds ?? [],
      summary: detail.data?.summary ?? '',
      content: detail.data?.content ?? '',
      cover: detail.data?.cover ?? '',
      status: detail.data?.status ?? '0',
      isTop: detail.data?.isTop ?? 0,
      isRecommend: detail.data?.isRecommend ?? 0,
    })
  } else {
    Object.assign(form, emptyForm())
  }
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
    const payload = { ...form, isTop: form.isTop ? 1 : 0, isRecommend: form.isRecommend ? 1 : 0 }
    if (isEdit.value) {
      await updateBlogPost(editingId.value, payload)
    } else {
      await createBlogPost(payload)
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
    :title="isEdit ? t('blog.post.editTitle') : t('blog.post.addTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    :width="720"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
      <a-form-item :label="t('blog.post.title')" name="title">
        <a-input v-model:value="form.title" />
      </a-form-item>
      <a-form-item :label="t('blog.post.category')" name="categoryId">
        <a-select v-model:value="form.categoryId" :options="categoryOptions" allow-clear />
      </a-form-item>
      <a-form-item :label="t('blog.post.tags')" name="tagIds">
        <a-select v-model:value="form.tagIds" mode="multiple" :options="tagOptions" allow-clear />
      </a-form-item>
      <a-form-item :label="t('blog.post.summary')" name="summary">
        <a-textarea v-model:value="form.summary" :rows="2" />
      </a-form-item>
      <a-form-item :label="t('blog.post.content')" name="content">
        <MdEditor
          v-model="form.content"
          :theme="isDark ? 'dark' : 'light'"
          :height="'460px'"
          :language="'zh-CN'"
          :preview-theme="isDark ? 'github' : 'github'"
        />
      </a-form-item>
      <a-form-item :label="t('blog.post.cover')" name="cover">
        <a-input v-model:value="form.cover" />
      </a-form-item>
      <a-form-item :label="t('blog.post.status')" name="status">
        <a-select v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
      <a-form-item :label="t('blog.post.isTop')" name="isTop">
        <a-switch v-model:checked="form.isTop" />
      </a-form-item>
      <a-form-item :label="t('blog.post.isRecommend')" name="isRecommend">
        <a-switch v-model:checked="form.isRecommend" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
