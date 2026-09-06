<script setup lang="ts">
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { Avatar, Dropdown, Menu, MenuItem } from 'ant-design-vue'
import type { BasicUser } from '../../basic-types'

withDefaults(defineProps<{ user?: BasicUser }>(), { user: () => ({}) })

const emit = defineEmits<{ logout: [] }>()
</script>

<template>
  <Dropdown placement="bottomRight">
    <div class="z-user">
      <Avatar :size="28" :src="user?.avatar">
        <UserOutlined v-if="!user?.avatar" />
      </Avatar>
      <span class="z-user__name">{{ user?.nickname || user?.name || 'Admin' }}</span>
    </div>
    <template #overlay>
      <Menu>
        <MenuItem key="logout" @click="emit('logout')">
          <LogoutOutlined />
          <span class="z-user__action">退出登录</span>
        </MenuItem>
      </Menu>
    </template>
  </Dropdown>
</template>

<style scoped>
.z-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.z-user:hover {
  background-color: var(--z-hover);
}

.z-user__name {
  font-size: 13px;
  color: var(--z-text);
}

.z-user__action {
  margin-left: 8px;
}
</style>
