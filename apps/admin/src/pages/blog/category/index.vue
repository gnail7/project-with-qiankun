<script setup>
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { OpButton } from '@ziven/ui'
import { deleteBlogCategory, getBlogCategoryList } from '@/api/blog'
import { PERMISSIONS } from '@/constants'
import CategoryFormModal from './components/CategoryFormModal.vue'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const categoryFormRef = ref()

const columns = computed(() => [
  { key: 'categoryName', title: t('blog.category.name'), dataIndex: 'categoryName' },
  { key: 'orderNum', title: t('blog.category.orderNum'), dataIndex: 'orderNum', width: 100 },
  { key: 'status', title: t('blog.category.status'), slot: 'status', width: 100 },
  { key: 'createTime', title: t('system.role.createTime'), dataIndex: 'createTime', width: 180 },
  { key: 'action', title: t('common.action'), slot: 'action', width: 200 },
])

async function load() {
  loading.value = true
  try {
    const res = await getBlogCategoryList()
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  categoryFormRef.value?.open()
}

function openEdit(record) {
  categoryFormRef.value?.open(record)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('blog.category.deleteTitle'),
    content: `${t('blog.category.deleteConfirm')}「${record.categoryName}」？`,
    okType: 'danger',
    async onOk() {
      await deleteBlogCategory(record.categoryId)
      message.success(t('common.deleteSuccess'))
      load()
    },
  })
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-3">
      <OpButton
        v-permission="PERMISSIONS.BLOG_CATEGORY_ADD"
        action="add"
        variant="solid"
        :label="t('blog.category.add')"
        @click="openCreate"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      row-key="categoryId"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
    >
      <template #status="{ record }">
        <a-tag :color="record.status === '0' ? 'success' : 'error'">
          {{ record.status === '0' ? t('common.statusNormal') : t('common.statusDisabled') }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space :size="0">
          <OpButton
            v-permission="PERMISSIONS.BLOG_CATEGORY_EDIT"
            action="edit"
            :label="t('common.edit')"
            @click="openEdit(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.BLOG_CATEGORY_REMOVE"
            action="delete"
            :label="t('common.delete')"
            @click="handleDelete(record)"
          />
        </a-space>
      </template>
    </a-table>

    <CategoryFormModal ref="categoryFormRef" @saved="load" />
  </div>
</template>
