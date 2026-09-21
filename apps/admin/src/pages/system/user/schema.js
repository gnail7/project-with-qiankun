/** 用户列表的查询项与表格列定义（文案依赖 i18n，故以工厂函数传入 t 与枚举） */

export function createSearchSchemas({ t, statusOptions }) {
  return [
    {
      field: 'userName',
      label: t('system.user.userName'),
      component: 'a-input',
      componentProps: { placeholder: t('system.user.userName'), allowClear: true },
    },
    {
      field: 'nickName',
      label: t('system.user.nickName'),
      component: 'a-input',
      componentProps: { placeholder: t('system.user.nickName'), allowClear: true },
    },
    {
      field: 'phone',
      label: t('system.user.phone'),
      component: 'a-input',
      componentProps: { placeholder: t('system.user.phone'), allowClear: true },
    },
    {
      field: 'status',
      label: t('system.user.status'),
      component: 'a-select',
      componentProps: {
        options: statusOptions,
        allowClear: true,
        placeholder: t('system.user.status'),
      },
    },
  ]
}

export function createColumns({ t, sexOptions }) {
  return [
    { key: 'userName', title: t('system.user.userName'), dataIndex: 'userName' },
    { key: 'nickName', title: t('system.user.nickName'), dataIndex: 'nickName' },
    { key: 'phone', title: t('system.user.phone'), dataIndex: 'phone' },
    {
      key: 'sex',
      title: t('system.user.sex'),
      dataIndex: 'sex',
      formatter: value => sexOptions.find(o => o.value === value)?.label ?? value,
    },
    { key: 'status', title: t('system.user.status'), dataIndex: 'status', slot: 'status' },
    {
      key: 'createTime',
      title: t('system.user.createTime'),
      dataIndex: 'createTime',
      width: 150,
    },
    { key: 'action', title: t('common.action'), slot: 'action', width: 200 },
  ]
}
