<script setup>
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { OpButton } from '@ziven/ui'
import { deleteMenu, getMenuTree } from '@/api/menu'
import { PERMISSIONS } from '@/constants'
import { resolveIcon } from '@/utils/menu'
import MenuFormModal from './components/MenuFormModal.vue'

const { t } = useI18n()

const tree = ref([])
const loading = ref(false)
const expandedKeys = ref([])
const menuFormRef = ref()

const typeMap = computed(() => ({
  M: { label: t('system.menu.typeDir'), color: 'blue' },
  C: { label: t('system.menu.typeMenu'), color: 'green' },
  F: { label: t('system.menu.typeButton'), color: 'orange' },
}))

const columns = computed(() => [
  { key: 'menuName', title: t('system.menu.menuName'), dataIndex: 'menuName' },
  { key: 'icon', title: t('system.menu.icon'), slot: 'icon', width: 70 },
  { key: 'menuType', title: t('system.menu.menuType'), slot: 'type', width: 90 },
  { key: 'orderNum', title: t('system.menu.orderNum'), dataIndex: 'orderNum', width: 80 },
  { key: 'perms', title: t('system.menu.perms'), dataIndex: 'perms' },
  { key: 'component', title: t('system.menu.component'), dataIndex: 'component' },
  { key: 'visible', title: t('system.menu.visible'), slot: 'visible', width: 90 },
  { key: 'status', title: t('system.menu.status'), slot: 'status', width: 90 },
  { key: 'action', title: t('common.action'), slot: 'action', width: 260 },
])

/** 收集所有有子级的菜单 id，用于默认展开整棵树 */
function collectExpandIds(nodes) {
  const ids = []
  const walk = list => {
    list.forEach(node => {
      if (node.children?.length) {
        ids.push(node.menuId)
        walk(node.children)
      }
    })
  }
  walk(nodes)
  return ids
}

async function load() {
  loading.value = true
  try {
    const res = await getMenuTree()
    tree.value = res.data || []
    expandedKeys.value = collectExpandIds(tree.value)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  menuFormRef.value?.open(null, tree.value)
}

function openAddChild(record) {
  menuFormRef.value?.open(null, tree.value, record.menuId)
}

function openEdit(record) {
  menuFormRef.value?.open(record, tree.value)
}

function handleDelete(record) {
  Modal.confirm({
    title: t('system.menu.deleteTitle'),
    content: `${t('system.menu.deleteConfirm')}「${record.menuName}」？`,
    okType: 'danger',
    async onOk() {
      await deleteMenu(record.menuId)
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
        v-permission="PERMISSIONS.MENU_ADD"
        action="add"
        variant="solid"
        :label="t('system.menu.add')"
        @click="openCreate"
      />
    </div>
    <a-table
      v-model:expanded-row-keys="expandedKeys"
      :columns="columns"
      :data-source="tree"
      row-key="menuId"
      :pagination="false"
      :loading="loading"
      expand-row-by-click
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 图标 -->
        <template v-if="column.key === 'icon'">
          <component :is="resolveIcon(record.icon)" v-if="resolveIcon(record.icon)" />
        </template>

        <!-- 类型 -->
        <template v-else-if="column.key === 'type'">
          <a-tag :color="typeMap[record.menuType]?.color">
            {{ typeMap[record.menuType]?.label ?? record.menuType }}
          </a-tag>
        </template>

        <!-- 显示状态 -->
        <template v-else-if="column.key === 'visible'">
          <a-tag :color="record.visible === '0' ? 'success' : 'default'">
            {{
              record.visible === '0' ? t('system.menu.visibleShow') : t('system.menu.visibleHide')
            }}
          </a-tag>
        </template>

        <!-- 状态 -->
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === '0' ? 'success' : 'error'">
            {{ record.status === '0' ? t('common.statusNormal') : t('common.statusDisabled') }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <a-space :size="0">
            <OpButton
              v-permission="PERMISSIONS.MENU_ADD"
              action="add"
              :label="t('system.menu.addChild')"
              @click="openAddChild(record)"
            />
            <OpButton
              v-permission="PERMISSIONS.MENU_EDIT"
              action="edit"
              :label="t('common.edit')"
              @click="openEdit(record)"
            />
            <OpButton
              v-permission="PERMISSIONS.MENU_REMOVE"
              action="delete"
              :label="t('common.delete')"
              @click="handleDelete(record)"
            />
          </a-space>
        </template>

        <!-- 其余普通列：menuName / orderNum / perms / component -->
        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>
    </a-table>

    <MenuFormModal ref="menuFormRef" @saved="load" />
  </div>
</template>
