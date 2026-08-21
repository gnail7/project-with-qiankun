下面给你一份偏**企业级 Vue3 + TypeScript 前端项目开发规范**，结合了：

- antfu 风格 ESLint
- Vue3 Composition API
- TypeScript 最佳实践
- Vite 工程化
- Monorepo 思路
- 中后台项目经验

可以直接保存为：

```
docs/frontend-development-standard.md
```

---

# 前端开发规范

版本：v1.0.0

适用技术栈：

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Axios
- Ant Design Vue / Element Plus

---

# 1. 规范目标

## 1.1 目的

统一团队代码风格，提高：

- 可读性
- 可维护性
- 可扩展性
- 开发效率
- 代码质量

所有项目必须遵循本规范。

---

# 2. 技术规范

## 2.1 基础技术要求

项目必须：

- 使用 TypeScript
- 使用 Vue3 Composition API
- 使用 `<script setup>`
- 使用 ESLint 检查
- 使用 Git 提交规范

推荐：

```
Vue3
+
TypeScript
+
Vite
+
ESLint
+
Husky
+
Commitlint
```

---

# 3. 项目目录规范

标准目录：

```
src
├── api                 # 接口请求
├── assets              # 静态资源
├── components          # 公共组件
├── composables         # Vue组合逻辑
├── constants           # 常量
├── directives          # 自定义指令
├── hooks               # hooks
├── layouts             # 页面布局
├── router              # 路由
├── stores              # Pinia状态
├── styles              # 全局样式
├── types               # 类型定义
├── utils               # 工具函数
├── views               # 页面
└── main.ts
```

---

# 4. 文件命名规范

## 4.1 Vue组件

使用 PascalCase：

正确：

```
UserTable.vue
OrderDetail.vue
SearchForm.vue
```

错误：

```
user-table.vue
user_table.vue
```

---

## 4.2 TS文件

使用 camelCase：

正确：

```
userApi.ts
formatDate.ts
request.ts
```

---

## 4.3 Hooks

必须 use 开头：

正确：

```
useUser.ts
usePermission.ts
useTable.ts
```

---

## 4.4 常量

使用大写：

```ts
const MAX_COUNT = 10

const TOKEN_KEY = 'token'
```

---

# 5. Vue组件规范

## 5.1 组件结构

统一：

```vue
<script setup lang="ts">
// 1. import

// 2. props

// 3. state

// 4. computed

// 5. methods

// 6. lifecycle
</script>

<template></template>

<style scoped></style>
```

---

# 6. TypeScript规范

## 6.1 禁止any

禁止：

```ts
const user: any = {}
```

推荐：

```ts
interface User {
  id: number

  name: string
}

const user: User = {}
```

---

## 6.2 类型独立管理

不要：

```
user.ts

interface User{}

function getUser(){}
```

推荐：

```
user
├── api.ts
├── types.ts
└── constants.ts
```

---

# 7. Vue Props规范

禁止：

```ts
defineProps({
  user: Object,
})
```

推荐：

```ts
interface Props {
  user: User
}

defineProps<Props>()
```

---

# 8. Emits规范

禁止：

```ts
emit('change')
```

推荐：

```ts
const emit = defineEmits<{
  change: [value: string]
}>()
```

---

# 9. API规范

## 9.1 禁止页面直接请求

禁止：

```ts
axios.get('/user/list')
```

页面：

```
views
 |
 ↓
service
 |
 ↓
api
 |
 ↓
request
```

---

示例：

api/user.ts

```ts
export function getUserList() {
  return request({
    url: '/user/list',

    method: 'GET',
  })
}
```

页面：

```ts
const list = await getUserList()
```

---

# 10. 状态管理规范

## Pinia使用规则

全局状态：

允许：

```
用户信息
权限
主题
语言
Token
```

禁止：

```
表单数据
弹窗状态
页面临时数据
```

---

# 11. CSS规范

## 11.1 使用BEM命名

组件：

```
UserCard.vue
```

CSS：

```css
.user-card {
}

.user-card__title {
}

.user-card__content {
}
```

---

## 11.2 禁止全局污染

禁止：

```css
.button {
}
```

推荐：

```css
.user-page__button {
}
```

---

# 12. ESLint规范

项目统一使用：

```
@antfu/eslint-config
```

安装：

```bash
pnpm add -D eslint @antfu/eslint-config
```

eslint.config.mjs：

```ts
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,

  typescript: true,
})
```

---

# 13. Git提交规范

提交格式：

```
type(scope): message
```

示例：

新增：

```
feat(user): add user list
```

修复：

```
fix(login): fix token refresh
```

类型：

| 类型     | 说明     |
| -------- | -------- |
| feat     | 新增功能 |
| fix      | 修复bug  |
| refactor | 重构     |
| docs     | 文档     |
| style    | 样式     |
| test     | 测试     |
| chore    | 工程配置 |

---

# 14. 分支规范

推荐：

```
main

develop

feature/*
release/*
hotfix/*
```

示例：

```
feature/user-management
```

---

# 15. 注释规范

## 15.1 不写无意义注释

禁止：

```ts
// 获取用户
getUser()
```

代码已经表达。

---

## 15.2 复杂逻辑必须说明

推荐：

```ts
/**
 * 根据权限生成动态路由
 * 过滤无访问权限菜单
 */
function generateRoutes() {}
```

---

# 16. 异常处理规范

禁止：

```ts
try {
} catch (e) {}
```

不处理。

推荐：

```ts
try {
} catch (error) {
  console.error(error)
}
```

---

# 17. 环境变量规范

禁止：

```ts
const url = 'http://localhost:8080'
```

使用：

```
.env.development

.env.production
```

例如：

```
VITE_API_URL=/api
```

---

# 18. 组件设计规范

## 单一职责

一个组件：

应该：

```
负责展示一个业务模块
```

不应该：

```
页面
+
请求
+
权限
+
弹窗
+
导出
+
复杂计算
```

---

# 19. 工程化规范

必须：

```
husky

lint-staged

commitlint
```

提交流程：

```
git commit

↓

eslint检查

↓

格式检查

↓

commit检查

↓

提交
```

---

# 20. Monorepo规范（可选）

目录：

```
project

├── apps

│   ├── admin

│   └── mobile


└── packages

    ├── ui

    ├── utils

    └── hooks
```

规则：

公共代码必须进入 packages。

禁止：

```
admin复制一份utils
mobile复制一份utils
```

---

# 21. 代码质量要求

提交前必须：

- 无 ESLint error
- 无 TypeScript error
- 无 console.log
- 无 unused import
- 无 any 类型

---

# 22. 推荐工具链

| 功能     | 工具           |
| -------- | -------------- |
| 构建     | Vite           |
| 语言     | TypeScript     |
| 规范     | ESLint         |
| 格式     | antfu config   |
| 提交     | Commitlint     |
| Hooks    | Husky          |
| 包管理   | pnpm           |
| Monorepo | pnpm workspace |

---

# 23. 核心原则

## 代码优先考虑：

1. 可读性
2. 可维护性
3. 可扩展性
4. 性能优化

不要为了：

- 少写几行代码
- 炫技
- 过度抽象

牺牲维护成本。

---
