export default {
  common: {
    appName: 'Gnail Admin',
  },
  login: {
    loginTitle: '登录',
    subtitle: '后台管理系统',
    username: '用户名',
    password: '密码',
    usernameRequired: '请输入用户名',
    passwordRequired: '请输入密码',
    submit: '登 录',
    success: '登录成功',
    failed: '用户名或密码错误',
  },
  menu: {
    dashboard: '仪表盘',
  },
  header: {
    toggleTheme: '切换主题',
    language: '语言',
    admin: '管理员',
    logout: '退出登录',
  },
  dashboard: {
    title: '仪表盘',
    users: '用户数',
    orders: '订单数',
    revenue: '营收',
    documents: '文档',
    welcome: '欢迎使用',
    welcomeDesc:
      '这是基于 Vue 3 + Pinia + Vue Router + Ant Design Vue + Tailwind CSS + Vite 搭建的后台管理系统模板。你可以在此基础上快速开发自己的管理后台。',
  },
  notFound: {
    title: '404',
    desc: '页面不存在',
    backHome: '返回首页',
  },
  error: {
    unauthorized: '未登录或登录已过期，请重新登录',
    forbidden: '没有权限访问',
    notFound: '请求的资源不存在',
    serverError: '服务器异常，请稍后重试',
    network: '网络异常，请检查网络连接',
    requestFailed: '请求失败',
  },
  language: {
    zhCN: '简体中文',
    enUS: 'English',
  },
}