# OpButton 操作按钮

`OpButton` 为常见的新增、编辑、删除、查看、下载和导出操作提供统一的图标与颜色。

<script setup lang="ts">
import { OpButton } from '@ziven/ui'
</script>

## 基础用法

<div class="demo-block">
  <p class="demo-block__title">根据 action 自动匹配图标和颜色</p>
  <div class="demo-block__row">
    <OpButton action="add" label="新增" />
    <OpButton action="edit" label="编辑" />
    <OpButton action="delete" label="删除" />
    <OpButton action="view" label="查看" />
    <OpButton action="download" label="下载" />
    <OpButton action="export" label="导出" />
  </div>
</div>

## 实心按钮

```vue
<OpButton action="add" label="新增" variant="solid" />
<OpButton action="delete" label="删除" variant="solid" />
```

## API

<div class="api-table">

| 属性       | 类型                                                  | 默认值   | 说明                                    |
| ---------- | ----------------------------------------------------- | -------- | --------------------------------------- |
| `action`   | `add \| edit \| delete \| view \| download \| export` | `''`     | 操作类型，自动提供图标和颜色            |
| `variant`  | `'text' \| 'solid'`                                   | `'text'` | `text` 为链接样式，`solid` 为主按钮样式 |
| `label`    | `string`                                              | `''`     | 按钮文本                                |
| `icon`     | `Component`                                           | -        | 覆盖内置图标                            |
| `color`    | `string`                                              | -        | 覆盖操作默认颜色                        |
| `danger`   | `boolean`                                             | -        | 删除操作默认开启危险样式                |
| `loading`  | `boolean`                                             | `false`  | 加载状态                                |
| `disabled` | `boolean`                                             | `false`  | 禁用状态                                |

</div>

支持 `a-button` 的其他属性和 `click` 事件。
