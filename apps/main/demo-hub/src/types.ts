export type DemoStatus = 'ready' | 'coming-soon'

export interface DemoItem {
  id: string
  title: string
  summary: string
  category: string
  categoryLabel: string
  tags: string[]
  icon: string
  accent: 'violet' | 'cyan' | 'orange' | 'pink' | 'green' | 'blue'
  status: DemoStatus
  updatedAt: string
  featured?: boolean
}
