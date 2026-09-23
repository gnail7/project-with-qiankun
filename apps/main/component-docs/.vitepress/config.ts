import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ziven UI',
  description: 'Ziven UI 组件库使用文档',
  lang: 'zh-CN',
  base: '/component-docs/',
  cleanUrls: true,
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../../../packages/component-ui/src', import.meta.url)),
      },
    },
    server: {
      port: 8083,
      strictPort: true,
      host: '0.0.0.0',
      cors: true,
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Ziven UI',
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: '组件', link: '/components/op-button' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '主题与语言', link: '/guide/theme-and-locale' },
          ],
        },
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'OpButton 操作按钮', link: '/components/op-button' },
            { text: 'VerificationCode 验证码', link: '/components/verification-code' },
            { text: 'LocaleSwitch 语言切换', link: '/components/locale-switch' },
            { text: 'ThemeToggle 主题切换', link: '/components/theme-toggle' },
          ],
        },
        {
          text: '业务组件',
          items: [
            { text: 'BasicTable 基础表格', link: '/components/basic-table' },
            { text: 'SearchContainer 搜索容器', link: '/components/search-container' },
            { text: 'AppSearch 全局搜索', link: '/components/app-search' },
            { text: 'PreferencesDrawer 偏好设置', link: '/components/preferences-drawer' },
            { text: 'BasicLayout 基础布局', link: '/components/basic-layout' },
          ],
        },
        {
          text: 'GIS 组件',
          items: [{ text: 'GisMap 地图与控制面板', link: '/components/gis-map' }],
        },
      ],
    },
    socialLinks: [],
    search: { provider: 'local' },
    footer: {
      message: 'Built with Vue 3 · VitePress · @ziven/ui',
    },
  },
})
