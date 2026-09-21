<script setup lang="ts">
import { computed, defineAsyncComponent, h } from 'vue'
import type { AsyncComponentLoader, Component } from 'vue'
import type { DemoItem } from '@/types'

/**
 * Demo 加载器
 *
 * 约定：demo.id 与 src/demos 下的目录名一一对应
 *
 *   demo.id = button-lab  ->  src/demos/button-lab/index.vue
 *
 * 新增 Demo 时只需在 src/demos 下新建目录并实现 index.vue，
 * 本文件不需要再追加任何条件分支。
 */
const props = defineProps<{ demo: DemoItem }>()

// 相对路径 glob：Vite 在构建阶段生成 { 路径: () => import(路径) } 映射
const modules = import.meta.glob<{ default: Component }>('../demos/*/index.vue')

/** 从 glob 的键中解析目录名作为 demo id，不依赖键的前缀格式 */
function resolveDemoId(path: string) {
  const normalized = path.replace(/\\/g, '/')
  return /([^/]+)\/index\.vue$/.exec(normalized)?.[1] ?? ''
}

const DemoLoading: Component = {
  name: 'DemoLoading',
  render: () =>
    h('div', { class: 'preview-loading' }, [
      h('i', { class: 'preview-loading__spinner' }),
      h('span', '正在加载 Demo…'),
    ]),
}

const DemoLoadFailed: Component = {
  name: 'DemoLoadFailed',
  render: () =>
    h(
      'div',
      { class: 'preview-loading preview-loading--error' },
      'Demo 加载失败，请刷新页面重试。',
    ),
}

/** id -> 异步组件，模块级构建一次，切换 Demo 时不会重复创建组件定义 */
const demoComponents = new Map<string, Component>()

for (const [path, loader] of Object.entries(modules)) {
  const id = resolveDemoId(path)

  if (!id) {
    continue
  }

  demoComponents.set(
    id,
    defineAsyncComponent({
      loader: loader as AsyncComponentLoader,
      loadingComponent: DemoLoading,
      errorComponent: DemoLoadFailed,
      delay: 120,
    }),
  )
}

const demoComponent = computed(() => demoComponents.get(props.demo.id) ?? null)
</script>

<template>
  <div class="demo-preview">
    <component :is="demoComponent" v-if="demoComponent" :demo="demo" />

    <div v-else class="preview-placeholder">
      <span class="preview-placeholder__icon">{{ demo.icon }}</span>
      <h2>Demo 暂未实现</h2>
      <p>
        没有找到 <code>{{ demo.id }}</code> 对应的组件，请在
        <code>src/demos/{{ demo.id }}/index.vue</code> 中补上实现。
      </p>
      <div class="preview-placeholder__lines"><i /><i /><i /></div>
    </div>
  </div>
</template>
