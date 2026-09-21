// 描述所有 qiankun 子应用
const demoHubEntry =
  import.meta.env.VITE_DEMO_HUB_URL ||
  `${window.location.protocol}//${window.location.hostname}:8086/`

export default [
  {
    name: 'gnail-admin',
    entry: 'http://localhost:8081/',
    container: '#subapp-container',
    // 用函数做前缀匹配，/admin、/admin/xxx 都能匹配
    activeRule: '/gnail-admin',
  },
  {
    name: 'demo-hub',
    entry: demoHubEntry,
    container: '#subapp-container',
    activeRule: '/demo-hub',
  },
]
