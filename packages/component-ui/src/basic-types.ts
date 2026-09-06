import type { Component } from 'vue'

/**
 * 菜单项（供 BasicLayout / AppSearch 等使用）
 * title 建议由消费方用 i18n 翻译后传入，组件库本身不依赖 vue-i18n。
 */
export interface BasicMenuItem {
  path: string
  title: string
  icon?: Component
  children?: BasicMenuItem[]
}

export interface BasicUser {
  name?: string
  nickname?: string
  avatar?: string
}

/** 深度遍历菜单（含父级），用于搜索/面包屑/选中态 */
export function flattenMenu(menus: BasicMenuItem[]): BasicMenuItem[] {
  const result: BasicMenuItem[] = []
  const walk = (list: BasicMenuItem[]) => {
    list.forEach(item => {
      result.push(item)
      if (item.children?.length) {
        walk(item.children)
      }
    })
  }
  walk(menus)
  return result
}

/** 只取叶子节点（真正可以跳转的页面），用于搜索定位 */
export function flattenMenuLeaves(menus: BasicMenuItem[]): BasicMenuItem[] {
  const result: BasicMenuItem[] = []
  const walk = (list: BasicMenuItem[]) => {
    list.forEach(item => {
      if (item.children?.length) {
        walk(item.children)
      } else {
        result.push(item)
      }
    })
  }
  walk(menus)
  return result
}

/** 根据路径在菜单树中查找 父→子 链，用于生成面包屑 */
export function findMenuChain(menus: BasicMenuItem[], path: string): BasicMenuItem[] {
  const chain: BasicMenuItem[] = []
  const walk = (list: BasicMenuItem[], trail: BasicMenuItem[]): boolean => {
    for (const item of list) {
      const next = [...trail, item]
      if (item.path === path) {
        chain.push(...next)
        return true
      }
      if (item.children?.length && walk(item.children, next)) {
        return true
      }
    }
    return false
  }
  walk(menus, [])
  return chain
}
