# 前端开发规范

本文说明本仓库新增和修改前端代码时应遵循的约定。规范以仓库当前实际使用的技术和目录为准；遇到历史代码与规范不一致时，新增代码遵循本文，除非需求要求，不借机大范围重构旧代码。

## 1. 仓库与技术栈

这是一个 pnpm workspace，多应用共享 `packages` 中的代码。安装依赖、运行脚本时优先在仓库根目录使用 pnpm，不在子项目内生成独立锁文件。

| 项目           | 位置                       | 技术与职责                                                                 |
| -------------- | -------------------------- | -------------------------------------------------------------------------- |
| Admin          | `apps/admin`               | Vue 3、Vite、Ant Design Vue、Pinia、Vue Router。现有代码以 JavaScript 为主 |
| qiankun 主应用 | `apps/main/qiankun`        | Vue 3、TypeScript、Vite、qiankun，负责主框架及子应用注册                   |
| Demo Hub       | `apps/main/demo-hub`       | Vue 3、TypeScript、Vite、Vue Router，承载免登录 Demo                       |
| 博客           | `apps/blog`                | Nuxt 3、Vue 3、TypeScript，负责公开博客页面和服务端路由                    |
| 组件库         | `packages/component-ui`    | `@ziven/ui`，提供 Vue 组件及主题、语言、偏好能力                           |
| 监控包         | `packages/monitoring`      | 基于 Sentry 的共享监控初始化和错误处理                                     |
| 组件文档       | `apps/main/component-docs` | VitePress，文档示例应使用工作区内的组件库                                  |

依赖和脚本以对应目录的 `package.json` 为准。不要假设所有应用使用相同的 Vite、TypeScript 或 UI 库版本。

## 2. 通用原则

- 先阅读目标应用中相邻页面、组件、API 和类型的写法，沿用其分层和命名。
- 优先复用 `@ziven/ui`、`packages/monitoring` 及应用已有的组件、composable、store、工具函数和请求封装。
- 新增抽象应解决可复用或复杂度问题；单处简单逻辑不额外搭建框架。
- 组件、函数和状态应有清楚的职责与来源。避免页面同时承担大量请求细节、复杂数据转换和通用 UI 实现。
- 尽量缩小变更范围。修复问题时优先修改直接相关代码，不顺手改写无关的旧模块。
- 用户可见的加载中、空数据、成功和失败状态应按页面场景处理；不要静默吞掉异常。

## 3. Vue 组件

### 组件结构

- 使用 Vue 3 Composition API 和 `<script setup>`，模板保持非空且具有有效根内容。
- Admin 历史代码主要使用 JavaScript；在 Admin 中修改现有模块时沿用所在目录的 `.js` / 无类型 `<script setup>` 约定，不以本规范为由批量迁移。新建共享库、qiankun 主应用、Demo Hub 和 Nuxt 业务代码优先使用 TypeScript。
- 单文件组件按需要组织为 `<script setup>`、`<template>`、`<style>`。不需要样式时不创建空的 `<style>`。
- 普通页面和组件优先使用 Vue SFC 的 `<template>`。确实需要 render function / 动态 VNode 树时，优先用 Vue JSX/TSX 表达，不手写 `h()`；仅在 JSX 不适用、第三方 API 明确要求或当前构建链不支持 JSX 时使用 `h()`。
- Admin 和组件库已配置 Vue JSX 插件；其他应用不要默认认为已支持 JSX。新增 JSX 前先确认对应 Vite、TypeScript 和 ESLint 配置均支持，未支持时优先用 `<template>`，不要留下无法构建的 JSX。
- 对组件暴露的 props、事件、插槽和实例方法保持明确、稳定；组件内部状态不要无必要地暴露给父组件。
- 通过 props 输入、emit 输出。不要让通用组件直接依赖某个页面的 store 或 API。
- `v-for` 使用稳定的业务 key；避免使用数组下标作为可增删、可排序列表的 key。
- 条件分支应覆盖加载、空、错误和正常状态中实际存在的情况。

### 组件拆分

没有硬性的行数限制。组件同时承担多类职责、出现重复逻辑、难以独立理解或需要多处复用时，再拆分子组件或 composable。拆分后应让数据流更清楚，而不是只为了减少文件行数。

### 命名

- Vue 组件和目录使用 PascalCase，例如 `UserFormModal.vue`、`BasicTable/`。
- 页面遵循所在应用路由结构；当前 Admin、Demo Hub 常用 `pages/.../index.vue` 或 `views/...View.vue`，不强制统一成单一目录名。
- TypeScript / JavaScript 模块使用 camelCase，例如 `useBlog.ts`、`request.js`。
- composable 以 `use` 开头，例如 `useBlogApi`、`useTheme`。
- 常量使用有含义的名称。仅对真正固定且跨多处使用的值使用全大写下划线命名，不要求所有局部常量都大写。

### 目录与文件职责

按功能/领域组织代码，页面专属文件尽量放在页面或功能目录附近；不要把所有页面的组件、类型和数据都堆进同一个全局目录。目录名和入口位置沿用所在应用现有路由及构建约定，不为了统一外观搬迁旧代码。新建一个有一定复杂度的功能时，可按需采用以下结构，不必创建空目录或空文件：

```text
<feature>/
├─ index.vue          # 页面或功能入口
├─ components/        # 仅此功能使用的子组件
├─ composables/       # 此功能内可复用的组合式逻辑
├─ api.ts             # 仅当项目约定允许功能级 API 模块时使用
├─ types.ts           # 此功能的类型定义
└─ data.ts            # 此功能的静态数据、常量和配置数据
```

- `types.ts`：放置该功能的业务模型、组件 Props/Emits 类型、API 参数/响应类型及跨文件共享类型。不要把较长或会被复用的 `interface` / `type` 散落在 `.vue`、API 实现和数据文件中；类型优先就近放在所属功能的 `types.ts`，只有真正跨功能共享时才提升到应用或包的公共 `types/`。避免建立一个容纳所有无关类型的巨型文件。
- `data.ts`：放置静态选项、字典、表格列/表单 schema、地图图层定义、菜单/演示配置、固定默认值及 mock/fixture 数据等声明式数据。数据文件只描述数据，不放组件、请求、状态副作用或复杂业务逻辑；接口返回值、用户运行时配置和环境变量不属于静态 `data.ts`。
- 纯函数和数据转换放 `utils/`；带 Vue 响应式状态或生命周期的可复用逻辑放 `composables/`；Pinia store 放 `stores/`；共享 UI 放 `components/` 或组件库。不要把不同职责塞进 `data.ts` 或 `utils/` 作为杂项收纳处。
- Admin 的业务 HTTP 请求仍统一放在 `apps/admin/src/api/`，Nuxt 服务端路由仍放在 `apps/blog/server/routes/`；不要为符合示例树而绕过既有 API 分层。
- Demo Hub 每个 Demo 以 `apps/main/demo-hub/src/demos/<demo-name>/` 为边界；该 Demo 专属组件、`types.ts`、`data.ts` 和逻辑就近放置。Demo 列表元数据留在现有 `src/data/demos.ts`。
- 共享组件按组件库现有方式放在 `packages/component-ui/src/components/<ComponentName>/`；组件局部类型使用该目录中的 `types.ts`，静态配置使用同目录 `data.ts`，公开入口通过 `index.ts` 导出。
- 在 Admin 以 JavaScript 维护的既有模块中，若局部构建/检查链不适合引入 TypeScript，可沿用对应的 `types.js` JSDoc、`data.js` 等现有文件形式；新建 TypeScript 应用及共享包按 `types.ts` / `data.ts` 执行。不要仅为扩展名统一而批量迁移旧代码。

## 4. TypeScript 与数据类型

- 在采用 TypeScript 的应用和共享包中，为组件 props、事件、API 参数与响应、共享数据结构定义类型。
- 功能级和组件库组件级类型集中放在各自的 `types.ts`；类型定义与运行时数据分离，不要在 `data.ts` 里夹带类型声明，也不要在组件实现中重复定义公共类型。
- 优先使用具体类型、联合类型、泛型和 `unknown`；避免引入新的 `any`。当第三方库或后端返回值无法准确描述时，可在边界处使用受限类型断言，并说明原因。
- 类型应跟随所属模块放置；被多个模块或包消费的类型放在稳定的公共入口中，不复制多份近似定义。
- 对可选值、空值、接口缺字段等情况做显式处理，不用非空断言掩盖未验证的数据。
- `apps/admin` 现存 JavaScript 代码可按附近模块维护。新增复杂或跨模块数据结构优先放在有类型检查的共享包或 TypeScript 应用，不为局部改动强行迁移整个 Admin。

## 5. API 与异步逻辑

### Admin

- HTTP 客户端、鉴权头、统一响应处理和网络错误处理集中在 `apps/admin/src/api/request.js`。
- 业务请求函数按领域放在 `apps/admin/src/api/`，页面调用业务 API 函数，不直接创建 Axios 实例或重复配置拦截器。
- 页面或 composable 负责触发请求、管理页面状态及呈现反馈；请求模块负责路径、方法和参数。

### Nuxt 博客

- 博客公开 API 使用 composable 中的 Nuxt `$fetch` 封装，并由页面通过 `useAsyncData` 等 Nuxt 数据方法调用，以保留 SSR 数据行为。
- Nuxt auto-import 的 `ref`、`useRoute`、`useRuntimeConfig` 等沿用 Nuxt 约定；避免为 Nuxt 页面再引入与框架冲突的重复请求层。
- 服务端路由放在 `apps/blog/server/routes/`，并遵循 Nuxt/Nitro 的服务端边界。

### Demo 与 mock

- Demo 使用的模拟数据和模拟 API 放在该 Demo 目录附近，并清楚标识模拟行为。
- 不要把 Demo mock 或页面专属数据放入生产 API 模块或公共组件库。

### 错误与反馈

- 异步状态应能反映等待和失败结果；异常需要被正确呈现、上抛或记录，不使用空 `catch`。
- Admin 使用现有 Ant Design Vue 消息与弹窗反馈方式；Nuxt 页面使用其既有 UI 和错误展示模式。
- 不在 API 层和页面层重复提示同一错误。遵循该应用已有的错误处理责任边界。

## 6. 状态管理

- 组件内部临时状态（表单草稿、弹窗开关、当前 hover 等）优先留在组件中。
- 需要跨页面共享且有明确生命周期的应用状态才进入 Pinia；不要把单页表单和临时弹窗状态提升为全局状态。
- 主应用与 qiankun 子应用之间的跨应用状态按现有 `src/qiankun/` 全局状态机制接入，不各自维护互不一致的副本。
- 主题、语言和布局偏好优先复用 `@ziven/ui/theme`、`@ziven/ui/locale`、`@ziven/ui/preferences` 提供的能力。
- 直接访问 `window`、`document`、`localStorage` 等浏览器 API 时，确认代码不会在 Nuxt SSR 或 VitePress 服务端渲染阶段执行；需要时放入客户端生命周期或客户端专用组件。

## 7. 组件库与共享包

- 确认能力确实由多个应用共享，或属于组件库职责后，再新增到 `packages/component-ui` 或 `packages/monitoring`。
- 组件库组件放在 `packages/component-ui/src/components/<ComponentName>/`，对外导出通过对应目录的 `index.ts` 及包的 `exports` 管理。
- 新增公共组件时检查根入口生成逻辑和子路径入口，确保按预期导出；不要只依赖应用内的相对路径引用。
- 组件库对外的 props、事件、默认值和依赖属于公共 API。修改时同步考虑已有消费者和 VitePress 文档。
- 特定重量级或浏览器专用依赖应使用独立子路径，避免普通组件库入口意外加载。例如 GIS 通过 `@ziven/ui/Gis` 引入，并由使用方提供 Leaflet 依赖及样式。
- 包之间通过 workspace 包名和已声明的导出路径依赖，不跨包引用对方未导出的内部源码。

## 8. qiankun 微前端

- 主应用负责子应用注册、激活规则和全局状态；子应用保留自身可独立运行的能力。
- 复用当前 qiankun mount/unmount 生命周期。子应用卸载时清理监听器、定时器、全局回调和手工创建的 DOM/地图实例。
- 路由、静态资源和接口地址要考虑子应用挂载路径及独立运行场景；不要把开发端口或本机地址硬编码进业务逻辑。
- 跨应用共享数据通过既有全局状态或组件库能力传递，不直接操作其他子应用的内部状态。

## 9. 样式与界面

- 优先沿用当前应用的样式方案：Admin 使用 Tailwind CSS 与现有 Ant Design Vue 样式；Demo Hub、Nuxt 页面及 GIS 组件按附近模块使用 scoped CSS 或项目现有样式。
- 组件私有样式使用 `scoped` 或稳定的组件名前缀，避免无意影响宿主、其他子应用或 VitePress 页面。
- 复用现有主题 token、CSS 变量和组件库主题能力；避免在新组件中硬编码一套与全局主题冲突的颜色。
- 不用大量内联样式承载稳定的布局规则；确有动态值时才通过绑定样式表达。
- 表单和交互控件应保留可辨识的标签、焦点状态、禁用状态与键盘操作能力。
- 页面需考虑常见窄屏宽度，避免固定尺寸导致内容溢出；地图等有明确容器尺寸要求的组件，应在示例中给出容器高度。

## 10. 安全与环境配置

- 环境差异配置使用对应应用的 `.env.development`、`.env.production` 和 Vite/Nuxt runtime config；不要把服务地址写死在可变业务逻辑中。
- 不提交令牌、密码、私钥或个人本地配置；不要在日志、错误消息和演示数据中输出真实敏感信息。
- 渲染用户提供的 HTML 或 Markdown 时使用项目现有的安全处理方式；不直接把未可信输入注入 `v-html`。
- 路由菜单可见性不等于权限校验。涉及访问控制时沿用后端鉴权及 Admin 的权限指令/路由机制。

## 11. ESLint、Prettier 与代码质量

仓库根目录使用 ESLint 8、Vue 3 推荐规则、TypeScript ESLint 推荐规则和 Prettier。具体规则以 `.eslintrc.cjs` 与 `.prettierrc` 为准。

当前 Prettier 约定：

- 单引号
- 不加分号
- 2 空格缩进
- 行宽 100
- 尾随逗号使用 `all`
- 箭头函数单参数省略括号

其他要求：

- 不提交 `debugger`；ESLint 将其视为错误。
- `console.error`、`console.warn` 可用于合理的错误和警告记录；其他 `console` 调用会触发警告，避免遗留临时调试输出。
- ESLint 当前没有强制禁止 `any`，但新增 TypeScript 仍应遵守本文的类型约定。
- 提交钩子通过 lint-staged 对暂存的 JS/TS/Vue 文件执行 ESLint 修复，对样式、JSON、Markdown 等文件执行 Prettier。
- 根目录 `pnpm test` 当前只是占位脚本，不代表已配置完整的自动化测试体系。不要把它描述为有效的测试通过依据。

## 12. 检查方式

根据改动范围选择已有脚本，不必为了无关应用运行所有构建：

| 改动范围                | 命令                                 |
| ----------------------- | ------------------------------------ |
| ESLint 全仓检查         | `pnpm lint`                          |
| 单文件或指定目录 ESLint | `pnpm exec eslint <路径>`            |
| Admin 构建              | `pnpm --filter gnail-admin build`    |
| qiankun 主应用构建      | `pnpm --filter qiankun build`        |
| Demo Hub 构建           | `pnpm --filter demo-hub build`       |
| 组件库构建              | `pnpm --filter @ziven/ui build`      |
| VitePress 文档构建      | `pnpm --filter component-docs build` |
| Nuxt 博客构建           | `pnpm --filter blog build`           |

若现有代码或生成文件导致检查失败，应说明具体失败位置及其与本次改动的关系，不要通过关闭规则或改动无关业务代码来掩盖失败。

## 13. Git 提交

- 提交信息使用简洁的 Conventional Commits 风格，例如 `feat: add map layer control`、`fix(admin): correct editor height`、`docs: document GIS components`。
- 常用类型：`feat`、`fix`、`refactor`、`docs`、`style`、`test`、`chore`。
- 本仓库当前未配置 commitlint 自动校验，提交格式由开发者保持一致。
- 提交前检查暂存区，只提交当前任务相关文件；不要提交 `.nuxt`、`.output`、`dist` 等生成内容，除非任务明确要求。
- 不覆盖、不丢弃工作区中与当前任务无关的用户改动。

## 14. 修改边界与高影响变更确认

默认按“最小影响范围”实施需求：只修改完成当前需求所必需的功能目录和文件，不顺手调整其他页面、应用、公共组件或全局默认行为。一个功能需要扩展时，优先新增局部实现、配置项或显式 opt-in 能力，避免改变现有消费者的行为。

以下属于跨功能或公共设置。若当前需求没有明确要求修改具体设置，动手前必须先告知用户拟修改的文件/设置、受影响的应用或消费者、可能的兼容性影响和局部替代方案，并等待用户确认：

- 根目录及 workspace 配置：`package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`、依赖版本目录/overrides、根级 TypeScript / ESLint / Prettier 配置。
- 应用级入口或构建/运行配置：Vite、Nuxt、TypeScript、环境变量模板、端口、代理、路由 base、构建产物及部署相关配置，尤其是会同时影响独立运行和 qiankun 挂载的配置。
- 跨应用行为：qiankun 子应用注册与激活规则、全局状态、公共路由/鉴权、主题/语言/偏好默认值、全局 CSS 和全局错误处理。
- 公共包和公共接口：`packages/` 中被多个消费者使用的组件、默认值、类型、事件、导出路径、样式 token，以及会改变已有调用方行为的 API。
- 任何可能改变其他功能默认行为、数据格式、持久化键名或后端契约的改动。

用户明确要求修改某个具体公共设置时，该明确要求视为对所述范围的确认；不得据此扩大到其他公共设置。若实施过程中发现必须额外修改未获授权的公共设置，应暂停该部分并另行征求确认。确认前可以继续不依赖该改动的局部工作，但不能先修改公共设置再补报。

提交前检查变更文件清单和差异，确认没有夹带无关目录或超出已确认范围的全局改动；若发现意外影响，应撤回本次造成的无关改动（不得覆盖用户原有改动），或先向用户说明并等待处理意见。

## 15. 新增功能时的简要流程

1. 确认所属应用或共享包，阅读相邻实现和对应配置。
2. 找出现有组件、API、composable、store 和公共类型，确定复用边界。
3. 按所在项目惯例实现，限制改动范围并覆盖必要的加载、空和错误状态。
4. 更新受影响的 VitePress 文档或示例，尤其是组件库公共 API 发生变化时。
5. 运行与改动范围匹配的 lint/build 命令，检查差异和暂存文件。
