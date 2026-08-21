# 项目开发规则

你在修改本项目代码时必须遵守：

## 技术栈

- Vue3
- TypeScript
- Vite
- Pinia

## 代码规范

必须遵守：

docs/frontend-standard.md

## Vue规范

1. 必须使用 script setup

正确:

<script setup lang="ts">

错误:

export default {}



## TypeScript规范

禁止使用 any


## 组件规范

超过200行组件必须拆分


## API规范

禁止页面直接调用axios

必须：

view
 ↓
service
 ↓
api
 ↓
request


修改代码前：

1. 阅读相关文件
2. 遵守已有项目结构
3. 不随意创建目录
