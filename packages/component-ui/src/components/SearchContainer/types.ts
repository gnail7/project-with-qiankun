import type { Component } from 'vue'

export interface SearchSchema {
  field: string
  label: string
  component?: Component
  componentProps?: Record<string, any>
  defaultValue?: any
  colProps?: {
    span?: number
  }
  hidden?: boolean
}

export interface SearchContainerProps {
  modelValue: Record<string, any>
  schemas?: SearchSchema[]
  loading?: boolean
  collapsed?: boolean
  showCollapse?: boolean
  showSearch?: boolean
  showReset?: boolean
  searchText?: string
  resetText?: string
}
