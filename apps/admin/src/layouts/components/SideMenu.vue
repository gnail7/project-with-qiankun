<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

// 侧边栏菜单：一级分组渲染为子菜单，二级叶子渲染为菜单项
defineProps({
  menus: { type: Array, default: () => [] },
  theme: { type: String, default: 'dark' },
  defaultOpenKeys: { type: Array, default: () => [] },
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const selectedKeys = computed(() => [route.path])

function handleClick({ key }) {
  router.push(key)
}
</script>

<template>
  <a-menu
    :theme="theme"
    mode="inline"
    :selected-keys="selectedKeys"
    :default-open-keys="defaultOpenKeys"
    @click="handleClick"
  >
    <template v-for="item in menus" :key="item.path">
      <a-sub-menu v-if="item.children?.length">
        <template #title>
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ t(item.titleKey) }}</span>
        </template>
        <a-menu-item v-for="child in item.children" :key="child.path">
          <component :is="child.icon" v-if="child.icon" />
          <span>{{ t(child.titleKey) }}</span>
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item v-else>
        <component :is="item.icon" v-if="item.icon" />
        <span>{{ t(item.titleKey) }}</span>
      </a-menu-item>
    </template>
  </a-menu>
</template>
