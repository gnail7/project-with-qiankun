import { SafetyCertificateOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue'

/**
 * 系统菜单/路由唯一配置
 * 动态路由、侧边栏、角色授权菜单树共用
 *
 * - id：菜单 id，角色授权时提交给后端（需与后端种子数据一致）
 * - path：页面路由地址（叶子节点）；子路由一律挂在 AdminLayout 下
 * - permission：菜单可见权限码，空 = 登录即可见
 * - titleKey：i18n key，渲染标题/菜单名
 */
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
