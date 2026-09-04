// Vue JSX 类型声明（供 @vitejs/plugin-vue-jsx / JSX 写法使用）
// 解决 "JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists"
import type { VNodeChild } from 'vue'

declare global {
  namespace JSX {
    type Element = VNodeChild
    type ElementChildrenAttribute = {
      children: unknown
    }
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elem: string]: any
    }
  }
}

export {}
