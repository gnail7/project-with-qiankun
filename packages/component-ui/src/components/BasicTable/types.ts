import type { TableColumnType } from 'ant-design-vue'

export interface BasicColumn extends TableColumnType {
  key: string
  title?: string
  dataIndex?: string

  /**
   * 自定义插槽
   */
  slot?: string

  /**
   * 格式化
   */
  formatter?: (value: any, record: any, index: number) => any

  /**
   * 是否隐藏
   */
  hidden?: boolean

  /**
   * 是否允许拖拽
   */
  draggable?: boolean

  /**
   * 是否允许拖拽调整列宽；需要同时提供 number 类型的 width 才能精确控制初始宽度
   */
  resizable?: boolean
}
