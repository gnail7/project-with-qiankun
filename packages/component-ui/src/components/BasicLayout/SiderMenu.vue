<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, MenuItem, SubMenu } from 'ant-design-vue'
import { findMenuChain, type BasicMenuItem } from '../../basic-types'

const props = withDefaults(
  defineProps<{
    menus?: BasicMenuItem[]
    isDark?: boolean
    mode?: 'inline' | 'horizontal'
    collapsed?: boolean
  }>(),
  { menus: () => [], isDark: true, mode: 'inline', collapsed: false },
)

const route = useRoute()
const router = useRouter()

const selectedKeys = computed(() => [route.path] as Array<string | number>)
const openKeys = ref<Array<string | number>>([])

function syncOpenKeys() {
  openKeys.value = findMenuChain(props.menus, route.path)
    .slice(0, -1)
    .map(item => item.path)
}

watch([() => props.menus, () => route.path], () => syncOpenKeys(), { immediate: true })

function handleClick({ key }: { key: string | number }) {
  router.push(String(key))
}

function onOpenChange(keys: Array<string | number>) {
  openKeys.value = keys
}
</script>

<template>
  <Menu
    :mode="mode"
    :theme="isDark ? 'dark' : 'light'"
    :inline-collapsed="collapsed"
    :selected-keys="selectedKeys"
    :open-keys="openKeys"
    class="z-menu"
    @open-change="onOpenChange"
    @click="handleClick"
  >
    <template v-for="item in menus" :key="item.path">
      <SubMenu v-if="item.children?.length" :key="item.path">
        <template #title>
          <component :is="item.icon" v-if="item.icon" class="z-menu__icon" />
          <span>{{ item.title }}</span>
        </template>
        <MenuItem v-for="child in item.children" :key="child.path">
          <component :is="child.icon" v-if="child.icon" class="z-menu__icon" />
          <span>{{ child.title }}</span>
        </MenuItem>
      </SubMenu>
      <MenuItem v-else :key="item.path">
        <component :is="item.icon" v-if="item.icon" class="z-menu__icon" />
        <span>{{ item.title }}</span>
      </MenuItem>
    </template>
  </Menu>
</template>

<style scoped>
.z-menu {
  background: transparent !important;
  border-inline-end: none !important;
}

.z-menu__icon {
  font-size: 16px;
  margin-inline-end: 10px;
  vertical-align: -1px;
}

/* 覆写 antd menu 的深色/浅色，让其贴近 vben 观感 */
.z-menu :deep(.ant-menu-item),
.z-menu :deep(.ant-menu-submenu-title) {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  margin: 4px 8px;
  width: auto;
}

.z-menu :deep(.ant-menu-root.ant-menu-inline > .ant-menu-item),
.z-menu :deep(.ant-menu-root.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title) {
  margin-inline: 8px;
  width: auto;
}
</style>
