import {
  ApartmentOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  LockOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

/**
 * 后端 `component` 字符串（如 system/user/index）→ 前端懒加载组件
 * 扫描 src/pages 下所有 .vue，按去掉 /src/pages/ 与 .vue 后的路径匹配。
 */
const pages = import.meta.glob('@/pages/**/*.vue')
const pageMap = {}
for (const [key, loader] of Object.entries(pages)) {
  const normalized = key.replace(/^.*\/pages\//, '').replace(/\.vue$/, '')
  pageMap[normalized] = loader
}

/** 解析后端组件路径，找不到对应页面时返回 undefined（该菜单不注册路由、不进侧边栏） */
export function resolveComponent(component) {
  if (!component) {
    return undefined
  }
  const key = String(component)
    .replace(/^\/+/, '')
    .replace(/\.vue$/, '')
  return pageMap[key]
}

/**
 * 菜单图标映射：后端存的是 'el-icon-xxx'（RuoYi 风格）字符串，
 * 这里映射成 ant-design-vue 图标组件；匹配不到时给一个默认图标。
 */
const ICON_MAP = {
  setting: SettingOutlined,
  user: UserOutlined,
  's-custom': SafetyCertificateOutlined,
  menu: MenuOutlined,
  'office-building': ApartmentOutlined,
  odometer: DashboardOutlined,
  dashboard: DashboardOutlined,
  appstore: AppstoreOutlined,
  lock: LockOutlined,
}

export function resolveIcon(icon) {
  if (!icon || icon === '#') {
    return undefined
  }
  const key = String(icon)
    .replace(/^el-icon-/, '')
    .replace(/^icon-/, '')
  return ICON_MAP[key] || AppstoreOutlined
}

/** 拼接完整路由路径（父路径 + 相对片段），如 '/system' + 'user' → '/system/user' */
export function joinMenuPath(parentPath = '', segment = '') {
  if (!segment) {
    return parentPath || '/'
  }
  if (segment.startsWith('/')) {
    return segment.replace(/\/+/g, '/')
  }
  const base = !parentPath || parentPath === '/' ? '' : parentPath
  return `${base}/${segment}`.replace(/\/+/g, '/')
}
