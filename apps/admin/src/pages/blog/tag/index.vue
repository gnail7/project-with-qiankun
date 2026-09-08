<script setup>
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { OpButton } from '@ziven/ui'
import { deleteBlogTag, getBlogTagList } from '@/api/blog'
import { PERMISSIONS } from '@/constants'
import TagFormModal from './components/TagFormModal.vue'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const tagFormRef = ref()

const columns = computed(() => [
  { key: 'tagName', title: t('blog.tag.name'), dataIndex: 'tagName' },
  { key: 'orderNum', title: t('blog.tag.orderNum'), dataIndex: 'orderNum', width: 100 },
  { key: 'status', title: t('blog.tag.status'), slot: 'status', width: 100 },
  { key: 'createTime', title: t('system.role.createTime'), dataIndex: 'createTime', width: 180 },
  { key: 'action', title: t('common.action'), slot: 'action', width: 200 },
])

async function load() {
  loading.value = true
  try {
    const res = await getBlogTagList()
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  tagFormRef.value?.open()
}

function openEdit(record) {
  tagFormRef.value?.open(record)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('blog.tag.deleteTitle'),
    content: `${t('blog.tag.deleteConfirm')}「${record.tagName}」？`,
    okType: 'danger',
    async onOk() {
      await deleteBlogTag(record.tagId)
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
        v-permission="PERMISSIONS.BLOG_TAG_ADD"
        action="add"
        variant="solid"
        :label="t('blog.tag.add')"
        @click="openCreate"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      row-key="tagId"
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
            v-permission="PERMISSIONS.BLOG_TAG_EDIT"
            action="edit"
            :label="t('common.edit')"
            @click="openEdit(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.BLOG_TAG_REMOVE"
            action="delete"
            :label="t('common.delete')"
            @click="handleDelete(record)"
          />
        </a-space>
      </template>
    </a-table>

    <TagFormModal ref="tagFormRef" @saved="load" />
  </div>
</template>
