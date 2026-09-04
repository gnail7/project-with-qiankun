import type { Component } from 'vue'

/** 内置操作类型 */
export type OpActionKey = 'add' | 'edit' | 'delete' | 'view' | 'download' | 'export'

/** 按钮形态：text = 文本按钮（表格操作列默认）；solid = 实心主按钮（工具条“新增/导出”等） */
export type OpButtonVariant = 'text' | 'solid'

export interface OpButtonProps {
  /** 内置操作预设：add 新增 / edit 编辑 / delete 删除 / view 查看详情 / download 下载 / export 导出；
   *  传自定义字符串时不套用默认图标，需要通过 icon prop 或 #icon 插槽提供 */
  action?: OpActionKey | string
  /** 按钮形态，默认 text */
  variant?: OpButtonVariant
  /** 尺寸，默认 small */
  size?: 'small' | 'middle' | 'large'
  /** 按钮文字；不传则只显示图标 */
  label?: string
  /** 自定义图标组件，覆盖该操作默认图标（也可用 #icon 插槽，插槽优先级更高） */
  icon?: Component
  /** 危险样式（删除类默认 true） */
  danger?: boolean
  /** 覆盖该操作默认颜色（antd 预设色，如 blue/green/red/orange/purple/cyan） */
  color?: string
  disabled?: boolean
  loading?: boolean
}
