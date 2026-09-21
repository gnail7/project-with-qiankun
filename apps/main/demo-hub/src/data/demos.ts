import type { DemoItem } from '@/types'

export interface DemoCategory {
  id: string
  label: string
  icon: string
  description: string
}

export const demoCategories: DemoCategory[] = [
  { id: 'all', label: '全部 Demo', icon: '✦', description: '浏览所有可运行的示例' },
  { id: 'component', label: '组件交互', icon: '◈', description: '组件状态、事件与组合用法' },
  { id: 'layout', label: '布局与导航', icon: '▦', description: '布局壳、菜单和导航模式' },
  { id: 'form', label: '表单与数据', icon: '□', description: '录入、校验和数据展示' },
  { id: 'visual', label: '视觉实验', icon: '✺', description: '主题、动效和视觉方案' },
]

/**
 * Demo 元数据
 *
 * 只描述业务信息，不记录组件路径：
 * id 即 src/demos 下的目录名，由 DemoPreview 通过 import.meta.glob 自动加载。
 */
export const demos: DemoItem[] = [
  {
    id: 'button-lab',
    title: 'Button Lab',
    summary: '集中展示按钮的状态、尺寸、图标和交互反馈。',
    category: 'component',
    categoryLabel: '组件交互',
    tags: ['Vue 3', 'Interaction'],
    icon: '⌁',
    accent: 'violet',
    status: 'ready',
    updatedAt: '2026-09-21',
    featured: true,
  },
  {
    id: 'voyage-planning',
    title: 'GIS',
    summary: '编辑航线waypoint',
    category: 'component',
    categoryLabel: '组件交互',
    tags: ['Vue 3', 'Interaction'],
    icon: '⌁',
    accent: 'violet',
    status: 'ready',
    updatedAt: '2026-09-21',
    featured: true,
  },
  {
    id: 'table-playground',
    title: 'Table Playground',
    summary: '可筛选的数据表格，演示列渲染、状态标记和空态处理。',
    category: 'form',
    categoryLabel: '表单与数据',
    tags: ['Vue 3', 'Table'],
    icon: '▤',
    accent: 'cyan',
    status: 'ready',
    updatedAt: '2026-09-20',
  },
  {
    id: 'form-lab',
    title: 'Form Lab',
    summary: '最小可用的表单录入体验，包含字段绑定与提交反馈。',
    category: 'form',
    categoryLabel: '表单与数据',
    tags: ['Vue 3', 'Form'],
    icon: '□',
    accent: 'green',
    status: 'ready',
    updatedAt: '2026-09-19',
  },
]

export function findDemo(id: string) {
  return demos.find(demo => demo.id === id)
}
