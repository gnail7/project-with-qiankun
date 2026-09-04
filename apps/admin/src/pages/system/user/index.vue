<script setup>
import { KeyOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BasicTable, OpButton, SearchContainer } from '@ziven/ui'
import { deleteUser, getUserPage } from '@/api/user'
import { ACCOUNT_STATUS, PERMISSIONS, USER_SEX } from '@/constants'
import AssignRoleModal from './components/AssignRoleModal.vue'
import ResetPwdModal from './components/ResetPwdModal.vue'
import UserFormModal from './components/UserFormModal.vue'

const { t } = useI18n()

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const query = ref({})
const userFormRef = ref()
const assignRoleRef = ref()
const resetPwdRef = ref()

const statusOptions = ACCOUNT_STATUS.map(o => ({ ...o, label: t(o.label) }))
const sexOptions = USER_SEX.map(o => ({ ...o, label: t(o.label) }))

const searchSchemas = computed(() => [
  {
    field: 'userName',
    label: t('system.user.userName'),
    component: 'a-input',
    componentProps: { placeholder: t('system.user.userName'), allowClear: true },
  },
  {
    field: 'nickName',
    label: t('system.user.nickName'),
    component: 'a-input',
    componentProps: { placeholder: t('system.user.nickName'), allowClear: true },
  },
  {
    field: 'phone',
    label: t('system.user.phone'),
    component: 'a-input',
    componentProps: { placeholder: t('system.user.phone'), allowClear: true },
  },
  {
    field: 'status',
    label: t('system.user.status'),
    component: 'a-select',
    componentProps: {
      options: statusOptions,
      allowClear: true,
      placeholder: t('system.user.status'),
    },
  },
])

const columns = computed(() => [
  { key: 'userName', title: t('system.user.userName'), dataIndex: 'userName' },
  { key: 'nickName', title: t('system.user.nickName'), dataIndex: 'nickName' },
  { key: 'phone', title: t('system.user.phone'), dataIndex: 'phone' },
  {
    key: 'sex',
    title: t('system.user.sex'),
    dataIndex: 'sex',
    formatter: value => sexOptions.find(o => o.value === value)?.label ?? value,
  },
  { key: 'status', title: t('system.user.status'), dataIndex: 'status', slot: 'status' },
  {
    key: 'createTime',
    title: t('system.user.createTime'),
    dataIndex: 'createTime',
    width: 150,
  },
  { key: 'action', title: t('common.action'), slot: 'action', width: 200 },
])

async function load() {
  loading.value = true
  try {
    const res = await getUserPage({
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
    page.value = 1 // 由分页 watcher 触发加载
  }
}

// 切换每页条数时回到第一页；分页/条数变化后重新加载
watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1
  }
})
watch([page, pageSize], load)

function openCreate() {
  userFormRef.value?.open()
}

function openEdit(record) {
  userFormRef.value?.open(record)
}

function openAssignRole(record) {
  assignRoleRef.value?.open(record)
}

function openResetPwd(record) {
  resetPwdRef.value?.open(record)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('system.user.deleteTitle'),
    content: `${t('system.user.deleteConfirm')}「${record.userName}」？`,
    okType: 'danger',
    async onOk() {
      await deleteUser(record.userId)
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
      row-key="userId"
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :scroll="{ x: 'max-content' }"
      @refresh="load"
    >
      <template #toolbar>
        <OpButton
          v-permission="PERMISSIONS.USER_ADD"
          action="add"
          variant="solid"
          :label="t('system.user.add')"
          @click="openCreate"
        />
      </template>

      <template #status="{ record }">
        <a-tag :color="record.status === '0' ? 'success' : 'error'">
          {{ statusOptions.find(o => o.value === record.status)?.label ?? record.status }}
        </a-tag>
      </template>

      <template #action="{ record }">
        <a-space :size="0">
          <OpButton
            v-permission="PERMISSIONS.USER_EDIT"
            action="edit"
            :label="t('common.edit')"
            @click="openEdit(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.USER_ASSIGN_ROLE"
            action="assignRole"
            :icon="TeamOutlined"
            :label="t('system.user.assignRole')"
            @click="openAssignRole(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.USER_RESET_PWD"
            action="resetPwd"
            :icon="KeyOutlined"
            :label="t('system.user.resetPwd')"
            @click="openResetPwd(record)"
          />
          <OpButton
            v-permission="PERMISSIONS.USER_REMOVE"
            action="delete"
            :label="t('common.delete')"
            @click="handleDelete(record)"
          />
        </a-space>
      </template>
    </BasicTable>

    <UserFormModal ref="userFormRef" @saved="load" />
    <AssignRoleModal ref="assignRoleRef" @saved="load" />
    <ResetPwdModal ref="resetPwdRef" />
  </div>
</template>
