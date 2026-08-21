<script setup>
import { useI18n } from 'vue-i18n'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const { t } = useI18n()

const stats = [
  { titleKey: 'dashboard.users', value: '12,846', icon: UserOutlined, color: 'text-blue-500' },
  { titleKey: 'dashboard.orders', value: '3,291', icon: ShoppingCartOutlined, color: 'text-green-500' },
  { titleKey: 'dashboard.revenue', value: '¥68,420', icon: DollarOutlined, color: 'text-orange-500' },
  { titleKey: 'dashboard.documents', value: '245', icon: FileTextOutlined, color: 'text-purple-500' },
]
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">{{ t('dashboard.title') }}</h2>

    <a-row :gutter="[16, 16]">
      <a-col v-for="stat in stats" :key="stat.titleKey" :xs="24" :sm="12" :lg="6">
        <a-card hoverable>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-2">{{ t(stat.titleKey) }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
            <component :is="stat.icon" :class="[stat.color, 'text-3xl']" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :title="t('dashboard.welcome')" class="mt-4">
      <p class="text-gray-500">{{ t('dashboard.welcomeDesc') }}</p>
    </a-card>
  </div>
</template>
