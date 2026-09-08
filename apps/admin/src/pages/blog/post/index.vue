<script setup>
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BasicTable, OpButton, SearchContainer } from '@ziven/ui'
import { deleteBlogPost, getBlogCategoryList, getBlogPostPage } from '@/api/blog'
import { PERMISSIONS } from '@/constants'
import PostFormModal from './components/PostFormModal.vue'

const { t } = useI18n()

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const query = ref({})
const postFormRef = ref()
const categoryOptions = ref([])

const statusOptions = computed(() => [
  { value: '0', label: t('blog.post.statusDraft') },
  { value: '1', label: t('blog.post.statusPublished') },
  { value: '2', label: t('blog.post.statusOff') },
])

const searchSchemas = computed(() => [
  {
    field: 'title',
    label: t('blog.post.title'),
    component: 'a-input',
    componentProps: { placeholder: t('blog.post.title'), allowClear: true },
  },
  {
    field: 'categoryId',
    label: t('blog.post.category'),
    component: 'a-select',
    componentProps: {
      options: categoryOptions.value,
      allowClear: true,
      placeholder: t('blog.post.category'),
    },
  },
  {
    field: 'status',
    label: t('blog.post.status'),
    component: 'a-select',
    componentProps: {
      options: statusOptions.value,
      allowClear: true,
      placeholder: t('blog.post.status'),
    },
  },
])

const columns = computed(() => [
  { key: 'title', title: t('blog.post.title'), dataIndex: 'title' },
  { key: 'categoryName', title: t('blog.post.category'), dataIndex: 'categoryName', width: 120 },
  { key: 'status', title: t('blog.post.status'), slot: 'status', width: 100 },
  { key: 'isTop', title: t('blog.post.isTop'), slot: 'isTop', width: 90 },
  { key: 'viewCount', title: t('blog.post.viewCount'), dataIndex: 'viewCount', width: 90 },
  {
    key: 'publishedTime',
    title: t('blog.post.publishTime'),
    dataIndex: 'publishedTime',
    width: 180,
  },
  { key: 'action', title: t('common.action'), slot: 'action', width: 200 },
])

async function load() {
  loading.value = true
  try {
    const res = await getBlogPostPage({
      ...query.value,
      pageNum: page.value,
      pageSize: pageSize.value,
    })
    list.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  if (page.value === 1) {
    load()
  } else {
    page.value = 1
  }
}

watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1
  }
})
watch([page, pageSize], load)

function openCreate() {
  postFormRef.value?.open()
}

function openEdit(record) {
  postFormRef.value?.open(record)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('blog.post.deleteTitle'),
    content: `${t('blog.post.deleteConfirm')}「${record.title}」？`,
    okType: 'danger',
    async onOk() {
      await deleteBlogPost(record.postId)
      message.success(t('common.deleteSuccess'))
      if (list.value.length === 1 && page.value > 1) {
        page.value -= 1
      } else {
        load()
      }
    },
  })
}

onMounted(async () => {
  load()
  const res = await getBlogCategoryList()
  categoryOptions.value = (res.data || []).map(c => ({
    value: c.categoryId,
    label: c.categoryName,
  }))
})
</script>

<template>
  <div>
    <SearchContainer
      v-model:model-value="query"
      :schemas="searchSchemas"
      :loading="loading"
      @search="onSearch"
      @reset="onSearch"
    />

    <BasicTable
      v-model:page="page"
      v-model:page-size="pageSize"
      row-key="postId"
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :scroll="{ x: 'max-content' }"
      @refresh="load"
    >
      <template #toolbar>
        <OpButton
          v-permission="PERMISSIONS.BLOG_POST_ADD"
          action="add"
          variant="solid"
          :label="t('blog.post.add')"
          @click="openCreate"
        />
      </template>

      <template #status="{ record }">
        <a-tag
          :color="record.status === '1' ? 'success' : record.status === '2' ? 'warning' : 'default'"
        >
          {{ statusOptions.find(o => o.value === record.status)?.label ?? record.status }}
        </a-tag>
      </template>

      <template #isTop="{ record }">
        <a-tag v-if="record.isTop === 1" color="red">{{ t('blog.post.isTop') }}</a-tag>
      </template>

      <template #action="{ record }">
        <a-space :size="0">
          <OpButton
            v-permission="PERMISSIONS.BLOG_POST_EDIT"
            action="edit"
            :label="t('common.edit')"
            @click="openEdit(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.BLOG_POST_REMOVE"
            action="delete"
            :label="t('common.delete')"
            @click="handleDelete(record)"
          />
        </a-space>
      </template>
    </BasicTable>

    <PostFormModal ref="postFormRef" @saved="load" />
  </div>
</template>
