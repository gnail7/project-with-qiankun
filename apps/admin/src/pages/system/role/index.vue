<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BasicTable, SearchContainer } from '@ziven/ui'
import { deleteRole, getRolePage } from '@/api/role'
import { ACCOUNT_STATUS, PERMISSIONS } from '@/constants'
import AssignMenuModal from './components/AssignMenuModal.vue'
import RoleFormModal from './components/RoleFormModal.vue'

const { t } = useI18n()

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const query = ref({})
const roleFormRef = ref()
const assignMenuRef = ref()

const statusOptions = ACCOUNT_STATUS.map(o => ({ ...o, label: t(o.label) }))

const searchSchemas = computed(() => [
  {
    field: 'roleName',
    label: t('system.role.roleName'),
    component: 'a-input',
    componentProps: { placeholder: t('system.role.roleName'), allowClear: true },
  },
  {
    field: 'status',
    label: t('system.role.status'),
    component: 'a-select',
    componentProps: {
      options: statusOptions,
      allowClear: true,
      placeholder: t('system.role.status'),
    },
  },
])

const columns = computed(() => [
  { key: 'roleId', title: t('system.role.id'), dataIndex: 'roleId', width: 80 },
  { key: 'roleName', title: t('system.role.roleName'), dataIndex: 'roleName' },
  { key: 'roleKey', title: t('system.role.roleKey'), dataIndex: 'roleKey' },
  { key: 'roleSort', title: t('system.role.roleSort'), dataIndex: 'roleSort', width: 100 },
  {
    key: 'status',
    title: t('system.role.status'),
    dataIndex: 'status',
    slot: 'status',
    width: 100,
  },
  { key: 'remark', title: t('system.role.remark'), dataIndex: 'remark' },
  {
    key: 'createTime',
    title: t('system.role.createTime'),
    dataIndex: 'createTime',
    width: 180,
  },
  { key: 'action', title: t('common.action'), slot: 'action', width: 220 },
])

async function load() {
  loading.value = true
  try {
    const res = await getRolePage({
      ...query.value,
      pageNum: page.value,
      pageSize: pageSize.value,
    })
    list.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  if (page.value === 1) {
    load()
  } else {
    page.value = 1 // 由分页 watcher 触发加载
  }
}

watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1
  }
})
watch([page, pageSize], load)

function openCreate() {
  roleFormRef.value?.open()
}

function openEdit(record) {
  roleFormRef.value?.open(record)
}

function openAssignMenu(record) {
  assignMenuRef.value?.open(record)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('system.role.deleteTitle'),
    content: `${t('system.role.deleteConfirm')}「${record.roleName}」？`,
    okType: 'danger',
    async onOk() {
      await deleteRole(record.roleId)
      message.success(t('common.deleteSuccess'))
      if (list.value.length === 1 && page.value > 1) {
        page.value -= 1 // 由分页 watcher 触发加载
      } else {
        load()
      }
    },
  })
}

onMounted(load)
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
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :scroll="{ x: 'max-content' }"
      @refresh="load"
    >
      <template #toolbar>
        <a-button v-permission="PERMISSIONS.ROLE_ADD" type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ t('system.role.add') }}
        </a-button>
      </template>

      <template #status="{ record }">
        <a-tag :color="record.status === '0' ? 'success' : 'error'">
          {{ statusOptions.find(o => o.value === record.status)?.label ?? record.status }}
        </a-tag>
      </template>

      <template #action="{ record }">
        <a-space :size="0">
          <a-button
            v-permission="PERMISSIONS.ROLE_EDIT"
            type="link"
            size="small"
            @click="openEdit(record)"
          >
            {{ t('common.edit') }}
          </a-button>
          <a-button
            v-permission="PERMISSIONS.ROLE_ASSIGN_MENU"
            type="link"
            size="small"
            @click="openAssignMenu(record)"
          >
            {{ t('system.role.assignMenu') }}
          </a-button>
          <a-button
            v-permission="PERMISSIONS.ROLE_REMOVE"
            type="link"
            size="small"
            danger
            @click="handleDelete(record)"
          >
            {{ t('common.delete') }}
          </a-button>
        </a-space>
      </template>
    </BasicTable>

    <RoleFormModal ref="roleFormRef" @saved="load" />
    <AssignMenuModal ref="assignMenuRef" @saved="load" />
  </div>
</template>
