// 通用枚举常量（label 为 i18n key，使用时通过 t() 转换）

/** 账号状态：0-正常 1-停用 */
export const ACCOUNT_STATUS = [
  { value: '0', label: 'common.statusNormal' },
  { value: '1', label: 'common.statusDisabled' },
]

/** 性别：0-男 1-女 2-未知 */
export const USER_SEX = [
  { value: '0', label: 'common.sexMale' },
  { value: '1', label: 'common.sexFemale' },
  { value: '2', label: 'common.sexUnknown' },
]

/** 数据权限范围（与后端种子数据对应） */
export const DATA_SCOPE = [
  { value: '1', label: 'common.dataScopeAll' },
  { value: '2', label: 'common.dataScopeCustom' },
  { value: '3', label: 'common.dataScopeDept' },
  { value: '4', label: 'common.dataScopeDeptAndChild' },
  { value: '5', label: 'common.dataScopeSelf' },
]

/** 按钮/菜单权限码约定（需与后端种子数据一致，admin 角色不受限） */
export const PERMISSIONS = {
  USER_LIST: 'system:user:list',
  USER_ADD: 'system:user:add',
  USER_EDIT: 'system:user:edit',
  USER_REMOVE: 'system:user:remove',
  USER_RESET_PWD: 'system:user:resetPwd',
  USER_ASSIGN_ROLE: 'system:user:assign',
  ROLE_LIST: 'system:role:list',
  ROLE_ADD: 'system:role:add',
  ROLE_EDIT: 'system:role:edit',
  ROLE_REMOVE: 'system:role:remove',
  ROLE_ASSIGN_MENU: 'system:role:assign',
  MENU_LIST: 'system:menu:list',
  MENU_ADD: 'system:menu:add',
  MENU_EDIT: 'system:menu:edit',
  MENU_REMOVE: 'system:menu:remove',
  BLOG_POST_LIST: 'blog:post:list',
  BLOG_POST_ADD: 'blog:post:add',
  BLOG_POST_EDIT: 'blog:post:edit',
  BLOG_POST_REMOVE: 'blog:post:remove',
  BLOG_CATEGORY_LIST: 'blog:category:list',
  BLOG_CATEGORY_ADD: 'blog:category:add',
  BLOG_CATEGORY_EDIT: 'blog:category:edit',
  BLOG_CATEGORY_REMOVE: 'blog:category:remove',
  BLOG_TAG_LIST: 'blog:tag:list',
  BLOG_TAG_ADD: 'blog:tag:add',
  BLOG_TAG_EDIT: 'blog:tag:edit',
  BLOG_TAG_REMOVE: 'blog:tag:remove',
}
