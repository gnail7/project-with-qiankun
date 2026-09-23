# GisMap 地图与控制面板

GIS 组件基于 Leaflet，提供地图容器、瓦片图层、业务图层和可扩展控制面板。控制面板内置图层开关、瓦片服务、地图主题、测距、经纬度定位、缩放和全屏能力。

## 基础用法

组件库将 Leaflet 作为 peer dependency，使用前安装 Leaflet 并引入样式：

```bash
pnpm add leaflet
```

```ts
import 'leaflet/dist/leaflet.css'
import { GisControlPanel, GisMap, GisTileLayer } from '@ziven/ui'
```

下面是一个完整的控制面板示例：

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import type { Coordinate, GisControlLayer, MapProvider, MapTheme } from '@ziven/ui/Gis'

const GisControlPanel = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisControlPanel),
)
const GisGraticuleLayer = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisGraticuleLayer),
)
const GisMap = defineAsyncComponent(() => import('@ziven/ui/Gis').then(module => module.GisMap))
const GisPolyline = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisPolyline),
)
const GisTerminatorLayer = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisTerminatorLayer),
)
const GisTileLayer = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisTileLayer),
)
const GisTimezoneLayer = defineAsyncComponent(() =>
  import('@ziven/ui/Gis').then(module => module.GisTimezoneLayer),
)

const provider = ref<MapProvider>('openfreemap')
const theme = ref<MapTheme>('standard')
const measureActive = ref(false)
const layerVisibility = ref<Record<string, boolean>>({
  route: true,
  timezones: false,
  terminator: false,
  graticule: false,
})
const route: Coordinate[] = [
  { lat: 31.23, lng: 121.47 },
  { lat: 35.68, lng: 139.65 },
  { lat: 37.56, lng: 126.97 },
]
const layers: GisControlLayer[] = [
  { id: 'route', label: '示例航线', icon: '━', group: '业务图层' },
  { id: 'timezones', label: '时区', icon: '◫', group: '地图元素' },
  { id: 'terminator', label: '晨昏线', icon: '☼', group: '地图元素' },
  { id: 'graticule', label: '经纬网', icon: '⊞', group: '地图元素' },
]
</script>

<ClientOnly>
  <div class="gis-doc-demo">
    <GisMap class="gis-doc-demo__map" :center="{ lat: 34, lng: 130 }" :zoom="4">
      <GisTileLayer :provider="provider" :theme="theme" />
      <GisTimezoneLayer :visible="layerVisibility.timezones" />
      <GisTerminatorLayer :visible="layerVisibility.terminator" />
      <GisGraticuleLayer :visible="layerVisibility.graticule" />
      <GisPolyline v-if="layerVisibility.route" :points="route" theme="primary" />
      <GisControlPanel
        v-model:layer-visibility="layerVisibility"
        v-model:measure-active="measureActive"
        v-model:map-provider="provider"
        v-model:map-theme="theme"
        :layers="layers"
      />
    </GisMap>
  </div>
</ClientOnly>

## 地图容器与瓦片

`GisMap` 负责创建 Leaflet 实例，并通过上下文向子图层提供地图对象。所有 GIS 子组件都应放在 `GisMap` 内部。

```vue
<GisMap :center="{ lat: 31.23, lng: 121.47 }" :zoom="6">
  <GisTileLayer provider="openfreemap" theme="standard" />
</GisMap>
```

`GisTileLayer` 支持两种地图服务：

| 属性       | 类型                               | 默认值          | 说明               |
| ---------- | ---------------------------------- | --------------- | ------------------ |
| `provider` | `'openfreemap' \| 'openstreetmap'` | `'openfreemap'` | 瓦片服务           |
| `theme`    | `'light' \| 'dark' \| 'standard'`  | `'standard'`    | OpenFreeMap 主题   |
| `opacity`  | `number`                           | `1`             | OSM 栅格图层透明度 |

OpenFreeMap 使用矢量样式，主题包括浅色、深色和标准；加载失败时会自动回退到 OpenStreetMap。

## 控制面板

```vue
<GisControlPanel
  v-model:layer-visibility="layerVisibility"
  v-model:measure-active="measureActive"
  v-model:map-provider="provider"
  v-model:map-theme="theme"
  :layers="layers"
/>
```

### 图层配置

```ts
const layers: GisControlLayer[] = [
  {
    id: 'ports',
    label: '港口',
    group: '业务图层',
    icon: '⚓',
    description: '全球港口位置',
  },
]
```

通过 `v-model:layer-visibility` 接收图层开关状态。组件不会直接操作业务图层，消费方根据状态决定是否渲染对应的图层组件，因此可以扩展任意业务图层。

### 内置能力

- 图层控制：根据 `layers` 自动按 `group` 分组
- 瓦片服务：切换 OpenFreeMap / OpenStreetMap
- 地图主题：切换浅色、深色、标准主题，默认标准
- 测距：点击地图添加多个测距点，显示累计距离
- 经纬度查询：输入经纬度后定位并标记
- 缩放：放大、缩小
- 全屏：优先使用浏览器原生全屏，非 HTTPS 环境自动使用 CSS 回退

### 自定义工具

使用 `extraTools` 在保留内置工具的基础上追加工具，并通过 `custom-panel` 插槽渲染自定义面板：

```vue
<GisControlPanel
  :extra-tools="[{ id: 'weather', label: '天气', icon: '☁', type: 'panel', panel: 'custom' }]"
  @tool-click="handleToolClick"
>
  <template #custom-panel="{ tool, close }">
    <WeatherPanel :tool="tool" @close="close" />
  </template>
</GisControlPanel>
```

如果需要完全替换工具栏，可以使用 `tools`；如果只是追加功能，推荐使用 `extraTools`。

## 参考图层

组件库内置三个可复用的参考图层：

```vue
<GisTimezoneLayer :visible="showTimezones" />
<GisTerminatorLayer :visible="showTerminator" />
<GisGraticuleLayer :visible="showGraticule" />
```

- `GisTimezoneLayer`：显示 UTC 时区参考带和标签
- `GisTerminatorLayer`：根据当前时间动态绘制太阳晨昏线，每分钟刷新
- `GisGraticuleLayer`：根据缩放级别绘制经纬网，并显示 `E/W`、`N/S` 度数标签

经纬网还可以固定网格间隔，或关闭度数标签：

```vue
<GisGraticuleLayer :interval="10" :show-labels="false" />
```

<style>
.gis-doc-demo {
  height: 520px;
  margin: 20px 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.gis-doc-demo__map {
  height: 100%;
  min-height: 0;
}
</style>
