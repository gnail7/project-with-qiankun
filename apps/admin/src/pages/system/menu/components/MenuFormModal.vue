<script setup>
import { message } from 'ant-design-vue'
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createMenu, updateMenu } from '@/api/menu'

const { t } = useI18n()
const emit = defineEmits(['saved'])

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()
const treeData = ref([])
const parentTree = ref([])

const emptyForm = () => ({
  parentId: 0,
  menuType: 'C',
  menuName: '',
  orderNum: 0,
  path: '',
  component: '',
  perms: '',
  icon: '',
  visible: '0',
  status: '0',
})
const form = reactive(emptyForm())

const typeOptions = computed(() => [
  { value: 'M', label: t('system.menu.typeDir') },
  { value: 'C', label: t('system.menu.typeMenu') },
  { value: 'F', label: t('system.menu.typeButton') },
])
const visibleOptions = computed(() => [
  { value: '0', label: t('system.menu.visibleShow') },
  { value: '1', label: t('system.menu.visibleHide') },
])
const statusOptions = computed(() => [
  { value: '0', label: t('common.statusNormal') },
  { value: '1', label: t('common.statusDisabled') },
])

const rules = {
  menuName: [{ required: true, message: t('system.menu.menuNameRequired'), trigger: 'blur' }],
}

function buildTree(nodes, excludeId = null) {
  return nodes
    .filter(node => node.menuId !== excludeId)
    .map(node => ({
      title: node.menuName,
      value: node.menuId,
      children: node.children?.length ? buildTree(node.children, excludeId) : undefined,
    }))
}

/** 打开弹窗：record 为空表示新增；presetParentId 用于“新增子项”预设父级 */
function open(record = null, menus = [], presetParentId = null) {
  isEdit.value = !!record
  editingId.value = record?.menuId ?? null
  treeData.value = menus || []
  // 父菜单下拉：同级“顶级” + 去掉当前节点及其子树，避免循环
  parentTree.value = [
    { title: t('system.menu.parentRoot'), value: 0, children: buildTree(menus, editingId.value) },
  ]
  Object.assign(form, emptyForm(), {
    parentId: presetParentId ?? record?.parentId ?? 0,
    menuType: record?.menuType ?? 'C',
    menuName: record?.menuName ?? '',
    orderNum: record?.orderNum ?? 0,
    path: record?.path ?? '',
    component: record?.component ?? '',
    perms: record?.perms ?? '',
    icon: record?.icon ?? '',
    visible: record?.visible ?? '0',
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
      await updateMenu(editingId.value, payload)
    } else {
      await createMenu(payload)
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
    :title="isEdit ? t('system.menu.editTitle') : t('system.menu.addTitle')"
    :confirm-loading="submitting"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item :label="t('system.menu.parentMenu')" name="parentId">
        <a-tree-select
          v-model:value="form.parentId"
          :tree-data="parentTree"
          :tree-default-expand-all="true"
          allow-clear
        />
      </a-form-item>
      <a-form-item :label="t('system.menu.menuType')" name="menuType">
        <a-radio-group v-model:value="form.menuType" :options="typeOptions" option-type="button" />
      </a-form-item>
      <a-form-item :label="t('system.menu.menuName')" name="menuName">
        <a-input v-model:value="form.menuName" />
      </a-form-item>
      <a-form-item :label="t('system.menu.orderNum')" name="orderNum">
        <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item :label="t('system.menu.path')" name="path">
        <a-input v-model:value="form.path" />
      </a-form-item>
      <a-form-item
        v-if="form.menuType !== 'F'"
        :label="t('system.menu.component')"
        name="component"
      >
        <a-input v-model:value="form.component" />
      </a-form-item>
      <a-form-item :label="t('system.menu.perms')" name="perms">
        <a-input v-model:value="form.perms" />
      </a-form-item>
      <a-form-item :label="t('system.menu.icon')" name="icon">
        <a-input v-model:value="form.icon" placeholder="el-icon-setting" />
      </a-form-item>
      <a-form-item :label="t('system.menu.visible')" name="visible">
        <a-radio-group v-model:value="form.visible" :options="visibleOptions" />
      </a-form-item>
      <a-form-item :label="t('system.menu.status')" name="status">
        <a-radio-group v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
