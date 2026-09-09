<script setup>
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
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
import PublishModal from './components/PublishModal.vue'

const { t } = useI18n()
const { isDark } = useTheme()
const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const publishing = ref(false)
const publishVisible = ref(false)
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

/** 文章列表路由（注册编辑路由时写入 meta.listPath，可据此跳回） */
const listPath = computed(() => route.meta.listPath || '/blog/post')

async function loadMeta() {
  const [catRes, tagRes] = await Promise.all([getBlogCategoryList(), getBlogTagList()])
  categoryOptions.value = (catRes.data || []).map(c => ({
    value: c.categoryId,
    label: c.categoryName,
  }))
  tagOptions.value = (tagRes.data || []).map(tag => ({ value: tag.tagId, label: tag.tagName }))
}

async function loadDetail(id) {
  const res = await getBlogPost(id)
  Object.assign(form, emptyForm(), {
    title: res.data?.title ?? '',
    slug: res.data?.slug ?? '',
    categoryId: res.data?.categoryId ?? null,
    tagIds: res.data?.tagIds ?? [],
    summary: res.data?.summary ?? '',
    content: res.data?.content ?? '',
    cover: res.data?.cover ?? '',
    status: res.data?.status ?? '0',
    isTop: res.data?.isTop ?? 0,
    isRecommend: res.data?.isRecommend ?? 0,
  })
}

onMounted(async () => {
  await loadMeta()
  if (route.params.id) {
    await loadDetail(route.params.id)
  }
})

function buildPayload(status) {
  return {
    title: form.title,
    slug: form.slug,
    categoryId: form.categoryId,
    tagIds: form.tagIds,
    summary: form.summary,
    content: form.content,
    cover: form.cover,
    status,
    isTop: form.isTop ? 1 : 0,
    isRecommend: form.isRecommend ? 1 : 0,
  }
}

function goBack() {
  router.replace(listPath.value)
}

/** 保存草稿：只需标题即可存为草稿（可先存标题，后续再补正文） */
async function saveDraft() {
  if (!form.title.trim()) {
    message.warning(t('blog.post.titleRequired'))
    return
  }
  saving.value = true
  try {
    const payload = buildPayload('0')
    if (isEdit.value) {
      await updateBlogPost(route.params.id, payload)
    } else {
      await createBlogPost(payload)
    }
    message.success(t('common.createSuccess'))
    goBack()
  } finally {
    saving.value = false
  }
}

/** 发布：先校验标题与正文，再弹出填写分类/标签等元数据的窗口，确认后以发布状态保存 */
function openPublish() {
  if (!form.title.trim()) {
    message.warning(t('blog.post.titleRequired'))
    return
  }
  if (!form.content.trim()) {
    message.warning(t('blog.post.contentRequired'))
    return
  }
  publishVisible.value = true
}

async function handlePublish(publishData) {
  Object.assign(form, publishData)
  publishing.value = true
  try {
    const payload = buildPayload('1')
    if (isEdit.value) {
      await updateBlogPost(route.params.id, payload)
    } else {
      await createBlogPost(payload)
    }
    message.success(t('common.createSuccess'))
    publishVisible.value = false
    goBack()
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="flex items-start gap-3 mb-4 shrink-0">
      <a-button class="shrink-0" @click="goBack">
        <template #icon>
          <arrow-left-outlined />
        </template>
        {{ t('blog.post.backToList') }}
      </a-button>
      <a-input
        v-model:value="form.title"
        class="flex-1 text-lg font-semibold"
        :placeholder="t('blog.post.title')"
        :bordered="false"
      />
      <div class="flex items-center gap-2 shrink-0">
        <a-button :loading="saving" @click="saveDraft">{{ t('blog.post.saveDraft') }}</a-button>
        <a-button type="primary" :loading="saving" @click="openPublish">
          {{ t('blog.post.publish') }}
        </a-button>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-hidden">
      <MdEditor
        v-model="form.content"
        :theme="isDark ? 'dark' : 'light'"
        :height="'100%'"
        :style="{ minHeight: '520px' }"
        :language="'zh-CN'"
        :preview-theme="isDark ? 'github' : 'github'"
      />
    </div>

    <PublishModal
      v-model:open="publishVisible"
      :submitting="publishing"
      :form="form"
      :category-options="categoryOptions"
      :tag-options="tagOptions"
      @confirm="handlePublish"
    />
  </div>
</template>
