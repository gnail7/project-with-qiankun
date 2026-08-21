// 描述所有子应用
export default [
  {
    name: 'gnail-admin',
    entry: 'http://localhost:8081/',
    container: '#subapp-container',
    // 用函数做前缀匹配，/admin、/admin/xxx 都能匹配
    activeRule: '/gnail-admin',
  },
]
