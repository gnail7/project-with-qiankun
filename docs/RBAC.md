# RBAC 前端实现笔记

后端 RBAC 接口做完之后，前端这块是我从零搭的。趁记得，把决策和踩过的坑记下来。目录结构、命名、分层都是照 `docs/frontend-standard.md` 来（view → api → request，PascalCase 组件，禁 any，200 行拆组件），但对不上规范的地方我会单独标出来。

## 一、大体走了一遍的流程

```
登录成功
  → 路由守卫发现权限没拉
  → /auth/me 拿 user / roles / permissions
  → 按权限码过滤出这个用户能看的菜单树
  → 把有权限的叶子 addRoute 到布局路由
  → 重进目标页
```

侧边栏菜单、动态路由、角色授权弹窗的树，用的是**同一个前端菜单配置**（因为后端只有"保存角色的菜单权限"接口，没有菜单 CRUD，菜单定义只能放前端）。

## 二、权限模型（跟后端约定好的三件事）

1. **权限码**：`system:user:add`、`system:role:list` 这种冒号串。前端菜单/按钮写同样的 code，后端 `/auth/me` 返回的 permissions 是这些串。
2. **超管放行**：`roleKey === 'admin'` 的角色直接全放行，不看权限码。
3. **菜单 id 跟前端配置对齐**：因为没菜单接口，角色授权弹窗提交的是前端配置里定义的 menuId，这个 id 得和后端种子数据一致（`router/menu-config.js` 里可改）。

`utils/permission.js` 里就是这三件事：

```js
export function isAdminRole(roles = []) {
  return roles.some(r => r?.roleKey === 'admin')
}

export function matchPermission(owned, code) {
  // 支持冒号串 + 通配：*:*:* 全放行，system:user:* 匹配 system:user 下任意按钮
  if (owned.includes('*:*:*')) return true
  const segments = code.split(':')
  return owned.some(p => {
    const parts = p.split(':')
    return (
      parts.length === segments.length &&
      parts.every((part, i) => part === '*' || part === segments[i])
    )
  })
}
```

## 三、菜单/路由唯一配置 `router/menu-config.js`

这是核心。动态路由、侧边栏、角色授权树三处都读它：

```js
export const asyncMenus = [
  {
    id: 100,
    path: '/system',
    titleKey: 'menu.system',
    icon: SettingOutlined,
    children: [
      {
        id: 101,
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/pages/system/user/index.vue'),
        titleKey: 'menu.systemUser',
        icon: UserOutlined,
        permission: 'system:user:list',
      },
      {
        id: 102,
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/pages/system/role/index.vue'),
        titleKey: 'menu.systemRole',
        icon: SafetyCertificateOutlined,
        permission: 'system:role:list',
      },
    ],
  },
]
```

注意 titleKey 用的是 `menu.systemUser` 这种**扁平 key**，别用 `menu.system.user`——因为 `menu.system` 本身是个字符串（分组标题），再当对象路径会冲突。这个吃过一次亏。

## 四、权限 store `stores/permission.js`

```js
const roles = ref([])
const permissions = ref([])
const menus = ref([])
const loaded = ref(false)

async function load() {
  const res = await getMeApi() // { user, roles, permissions }
  const { user, roles: r, permissions: p } = res.data
  useUserStore().setUserInfo(user)
  roles.value = r || []
  permissions.value = p || []
  menus.value = filterMenu(asyncMenus) // 按权限码过滤出可见菜单树
  loaded.value = true
}

function hasPerm(code) {
  // admin 直接 true
  if (!code || isAdmin.value) return true
  const list = Array.isArray(code) ? code : [code]
  return list.some(item => matchPermission(permissions.value, item))
}
```

## 五、动态路由 `router/index.js`

守卫里做这几件事：

```js
router.beforeEach(async to => {
  if (to.path === '/login') {
    updateDocumentTitle(to)
    return true
  }
  if (!userStore.token) return { path: '/login', query: { redirect: to.fullPath } }

  const permissionStore = usePermissionStore()
  if (!permissionStore.loaded) {
    try {
      await permissionStore.load()
      dynamicNames = addDynamicRoutes(permissionStore.menus)
      return { path: to.fullPath, replace: true }
    } catch (error) {
      userStore.logout()
      permissionStore.reset()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  updateDocumentTitle(to)
  return true
})
```

`addDynamicRoutes` 把过滤后的**叶子**作为 `AdminLayout` 的子路由 `addRoute(LAYOUT_NAME, {...})`。退出时 `resetDynamicRoutes()` 把已注册的按名字 remove，下次登录再生成。

几个细节：

- 布局路由要**命名**（`name: 'AdminLayout'`），否则 `addRoute(parentName, ...)` 挂不上去。
- 登出后要 `permissionStore.reset()` + `resetDynamicRoutes()`，不然换个人登录会 addRoute 重复名告警。
- 直接访问未知路径会命中 404，`replace: true` 后再导航就匹配到真实路由了。

## 六、按钮权限 `directives/permission.js`

```js
function removeIfNoPermission(el, binding) {
  if (!binding.value) return
  const permissionStore = usePermissionStore()
  if (!permissionStore.hasPerm(binding.value) && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}
export const permission = { mounted: removeIfNoPermission, updated: removeIfNoPermission }
```

在 `main.js` 里 `instance.directive('permission', permission)`。用法：

```html
<a-button v-permission="PERMISSIONS.USER_ADD" @click="openCreate">新增</a-button>
```

权限码集中在 `constants/index.js` 的 `PERMISSIONS` 里，UI 型枚举（状态/性别/dataScope）也放这，label 存 i18n key，页面里 `t()` 转一下。

## 七、CRUD 页面（用 Ziven-ui 的 BasicTable + SearchContainer）

标准套路：搜索区（SearchContainer 走 schemas）+ 表格（BasicTable + 工具栏 slot + 行操作 slot）+ 弹窗。

用户页 `pages/system/user/`：

- `index.vue`：查询表单 + 表格 + 操作列（编辑/分配角色/重置密码/删除）
- `components/UserFormModal.vue`：新增/编辑
- `components/AssignRoleModal.vue`：穿梭框，`getUserRoles` + `getRoleList` + `assignUserRoles(userId, roleIds)`
- `components/ResetPwdModal.vue`：`resetUserPassword(userId, { newPassword })`

角色页 `pages/system/role/` 同理，多了个 `AssignMenuModal.vue`（从 menu-config 渲染可勾选树，`getRoleMenuIds` → 勾选 → `assignRoleMenus(roleId, menuIds)`）。

接口分层按规范走 `api/user.js`、`api/role.js`，页面不直接 axios。后端统一返回 `{ code, message, data }`，`request.js` 拦截器 `code===200` 才返回，非 200 reject 一个带 `err.biz` 的错误，页面里 `err?.biz?.code === 401` 判断业务失败。

## 八、踩坑记录

- **antd 表单校验**：`a-form` 的 `form-item name` 必须对应 `:model` 里的字段，否则 `required` 永远判不过。登录页的验证码一开始是独立 ref，不在 `formState` 里，一直卡校验。后来把 `captcha` 放进 `formState` 才好。
- **rowKey**：BasicTable 默认 `rowKey='id'`，可用户主键是 `userId`、角色是 `roleId`，不传就是错的。要显式 `<BasicTable row-key="userId">`（角色页 `row-key="roleId"`）。
- **表格横滚**：列宽之和很容易超过容器，`scroll={{ x: 'max-content' }}` 让表格在**自己内部**滚，别把页面撑出横向滚动条。
- **嵌入主应用时 `w-screen` 会超宽**：admin 的根节点原来是 `w-screen`（100vw），单独跑没事，被 qiankun 嵌进 `#subapp-container` 后容器不是整个视口宽，就横向滚动。改成 `w-full`。
- **内容卡撑满剩余高度**：根节点和内容卡别用 `100vh`（嵌入时容器是"视口-主应用顶栏"），要沿容器撑满，用 `h-full` + `flex-1 min-h-0 overflow-auto`，std高度链 `html, body, #app { height:100% }`。
- **antd 按钮图标文字对不齐**：加全局 `.ant-btn { display:inline-flex; align-items:center }`。
- **侧边栏菜单颜色**：antdv 对 `Menu`/`Layout` 组件级 token 支持不全，最后用 `html.dark .ant-menu-dark ...` 的 CSS 覆盖兜底。

## 九、最终文件

```
apps/admin/src/
├── api/{auth,user,role}.js
├── constants/index.js
├── utils/permission.js
├── directives/permission.js
├── stores/permission.js
├── router/{index.js, menu-config.js}
└── pages/system/{user,role}/...
```

`docs/frontend-standard.md` 要求 TS + 禁 any，但 admin 现有代码都是 JS，我这次新代码跟着现状用 JS 写了（分层/命名/拆分都按规范）。整体迁 TS 是另一回事，后面想做再说。
