<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'
import type {
  Coordinate,
  GisControlLayer,
  GisControlTool,
  GisMapProviderOption,
  GisMapThemeOption,
  MapProvider,
  MapTheme,
} from './types'

const props = withDefaults(
  defineProps<{
    layers?: GisControlLayer[]
    layerVisibility?: Record<string, boolean>
    measureActive?: boolean
    tools?: GisControlTool[]
    extraTools?: GisControlTool[]
    mapProvider?: MapProvider
    mapTheme?: MapTheme
    mapProviders?: GisMapProviderOption[]
    mapThemes?: GisMapThemeOption[]
  }>(),
  {
    layers: () => [],
    layerVisibility: () => ({}),
    measureActive: false,
    tools: () => [],
    extraTools: () => [],
    mapProvider: 'openfreemap',
    mapTheme: 'standard',
    mapProviders: () => [],
    mapThemes: () => [],
  },
)

const defaultTools: GisControlTool[] = [
  { id: 'layers', label: '图层控制', icon: '◈', type: 'panel', panel: 'layers' },
  { id: 'measure', label: '测距', icon: '⌁', type: 'panel', panel: 'measure' },
  { id: 'coordinate', label: '经纬度查询', icon: '⌖', type: 'panel', panel: 'coordinate' },
  { id: 'zoom-in', label: '放大', icon: '＋', type: 'action', action: 'zoomIn' },
  { id: 'zoom-out', label: '缩小', icon: '−', type: 'action', action: 'zoomOut' },
  { id: 'fullscreen', label: '全屏', icon: '⛶', type: 'action', action: 'fullscreen' },
]

const defaultMapProviders: GisMapProviderOption[] = [
  { key: 'openfreemap', label: 'OpenFreeMap', description: '矢量地图' },
  { key: 'openstreetmap', label: 'OSM', description: '栅格地图' },
]

const defaultMapThemes: GisMapThemeOption[] = [
  { key: 'light', label: '浅色', description: 'Positron' },
  { key: 'dark', label: '深色', description: 'Dark' },
  { key: 'standard', label: '标准', description: 'Bright' },
]

const emit = defineEmits<{
  'update:layerVisibility': [visibility: Record<string, boolean>]
  'update:measureActive': [active: boolean]
  'update:mapProvider': [provider: MapProvider]
  'update:mapTheme': [theme: MapTheme]
  'tool-click': [tool: GisControlTool]
}>()

const context = useGisMapContext()
const activeToolId = ref<string | null>(null)
const latitude = ref('')
const longitude = ref('')
const coordinateError = ref('')
const measurePoints = ref<Coordinate[]>([])
const measureLine = ref<L.Polyline | null>(null)
const measurePointLayer = ref<L.LayerGroup | null>(null)
const coordinateMarker = ref<L.CircleMarker | null>(null)
const fullscreenActive = ref(false)
const cssFullscreenActive = ref(false)
let previousBodyOverflow = ''

const controlTools = computed(() => {
  const tools = props.tools.length ? props.tools : defaultTools
  return [...new Map([...tools, ...props.extraTools].map(tool => [tool.id, tool])).values()]
})
const mapProviders = computed(() =>
  props.mapProviders.length ? props.mapProviders : defaultMapProviders,
)
const mapThemes = computed(() => (props.mapThemes.length ? props.mapThemes : defaultMapThemes))
const activeTool = computed(
  () => controlTools.value.find(tool => tool.id === activeToolId.value) ?? null,
)
const activeBuiltinPanel = computed(() => {
  const panel = activeTool.value?.panel
  return panel === 'layers' || panel === 'measure' || panel === 'coordinate' ? panel : null
})

const groupedLayers = computed(() => {
  const groups = new Map<string, GisControlLayer[]>()
  props.layers.forEach(layer => {
    const group = layer.group ?? '地图图层'
    const items = groups.get(group) ?? []
    items.push(layer)
    groups.set(group, items)
  })
  return [...groups.entries()].map(([name, items]) => ({ name, items }))
})

const measuredDistance = computed(() => {
  let distance = 0
  for (let index = 1; index < measurePoints.value.length; index += 1) {
    distance += L.latLng(toLatLng(measurePoints.value[index - 1])).distanceTo(
      toLatLng(measurePoints.value[index]),
    )
  }
  if (distance < 1000) return `${distance.toFixed(0)} m`
  return `${(distance / 1000).toFixed(2)} km`
})

watch([() => context.map.value, () => props.measureActive], () => syncMeasureMode(), {
  immediate: true,
})

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState)
  syncFullscreenState()
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  if (cssFullscreenActive.value) setCssFullscreen(false)
  const map = context.map.value
  map?.off('click', handleMeasureClick)
  map?.getContainer().classList.remove('gis-map--measuring')
  clearMeasureLayers()
  clearCoordinateMarker()
})

function toggleTool(tool: GisControlTool) {
  if (tool.disabled) return

  if (tool.action === 'zoomIn') {
    zoomIn()
    emit('tool-click', tool)
    return
  }
  if (tool.action === 'zoomOut') {
    zoomOut()
    emit('tool-click', tool)
    return
  }
  if (tool.action === 'fullscreen') {
    activeToolId.value = null
    void toggleFullscreen()
    emit('tool-click', tool)
    return
  }

  if (tool.panel === 'measure') {
    const nextActive = !props.measureActive
    emit('update:measureActive', nextActive)
    activeToolId.value = nextActive ? tool.id : null
    emit('tool-click', tool)
    return
  }

  if (props.measureActive) emit('update:measureActive', false)
  activeToolId.value = activeToolId.value === tool.id ? null : tool.id
  emit('tool-click', tool)
}

function closePanel() {
  activeToolId.value = null
  if (props.measureActive) emit('update:measureActive', false)
}

function setLayerVisibility(id: string, visible: boolean) {
  emit('update:layerVisibility', { ...props.layerVisibility, [id]: visible })
}

function isLayerVisible(id: string) {
  return props.layerVisibility[id] !== false
}

function zoomIn() {
  context.map.value?.zoomIn()
}

function zoomOut() {
  context.map.value?.zoomOut()
}

async function toggleFullscreen() {
  const container = context.map.value?.getContainer()
  if (!container) return

  if (!document.fullscreenEnabled || !container.requestFullscreen) {
    setCssFullscreen(!cssFullscreenActive.value)
    return
  }

  try {
    if (document.fullscreenElement === container) await document.exitFullscreen()
    else await container.requestFullscreen()
  } catch {
    if (document.fullscreenElement !== container) setCssFullscreen(true)
  }
}

function syncFullscreenState() {
  const container = context.map.value?.getContainer()
  const isNativeFullscreen = Boolean(container && document.fullscreenElement === container)
  const isCssFullscreen = Boolean(container?.classList.contains('gis-map--fullscreen'))
  fullscreenActive.value = isNativeFullscreen || isCssFullscreen
  requestAnimationFrame(() => context.map.value?.invalidateSize())
}

function setCssFullscreen(active: boolean) {
  const container = context.map.value?.getContainer()
  if (!container) return

  if (active) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
  cssFullscreenActive.value = active
  container.classList.toggle('gis-map--fullscreen', active)
  syncFullscreenState()
}

function getToolLabel(tool: GisControlTool) {
  return tool.action === 'fullscreen' && fullscreenActive.value ? '退出全屏' : tool.label
}

function syncMeasureMode() {
  const map = context.map.value
  if (!map) return

  map.off('click', handleMeasureClick)
  map.getContainer().classList.toggle('gis-map--measuring', props.measureActive)

  if (props.measureActive) {
    map.on('click', handleMeasureClick)
  } else {
    clearMeasureLayers()
  }
}

function handleMeasureClick(event: L.LeafletMouseEvent) {
  measurePoints.value = [...measurePoints.value, { lat: event.latlng.lat, lng: event.latlng.lng }]
  renderMeasureLayers()
}

function renderMeasureLayers() {
  const map = context.map.value
  if (!map) return

  if (!measurePointLayer.value) measurePointLayer.value = L.layerGroup().addTo(map)
  measurePointLayer.value.clearLayers()
  measurePoints.value.forEach((point, index) => {
    const marker = L.circleMarker(toLatLng(point), {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: '#7564ef',
      fillOpacity: 1,
    }).bindTooltip(String(index + 1), {
      permanent: true,
      direction: 'top',
      offset: [0, -5],
    })
    measurePointLayer.value?.addLayer(marker)
  })

  measureLine.value?.removeFrom(map)
  measureLine.value = null
  if (measurePoints.value.length > 1) {
    measureLine.value = L.polyline(measurePoints.value.map(toLatLng), {
      color: '#7564ef',
      weight: 3,
      dashArray: '7 6',
      lineCap: 'round',
    }).addTo(map)
  }
}

function clearMeasure() {
  measurePoints.value = []
  clearMeasureLayers()
}

function clearMeasureLayers() {
  const map = context.map.value
  if (map) {
    measureLine.value?.removeFrom(map)
    measurePointLayer.value?.removeFrom(map)
  }
  measureLine.value = null
  measurePointLayer.value = null
}

function searchCoordinate() {
  const lat = Number(latitude.value)
  const lng = Number(longitude.value)
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    coordinateError.value = '纬度范围应为 -90 至 90'
    return
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    coordinateError.value = '经度范围应为 -180 至 180'
    return
  }

  const map = context.map.value
  if (!map) return
  coordinateError.value = ''
  const position = { lat, lng }
  map.flyTo(toLatLng(position), Math.max(map.getZoom(), 7), { duration: 0.45 })
  clearCoordinateMarker()
  coordinateMarker.value = L.circleMarker(toLatLng(position), {
    radius: 8,
    color: '#ffffff',
    weight: 3,
    fillColor: '#e45572',
    fillOpacity: 1,
  })
    .bindPopup(`纬度 ${lat.toFixed(6)}<br>经度 ${lng.toFixed(6)}`)
    .addTo(map)
    .openPopup()
}

function clearCoordinateMarker() {
  coordinateMarker.value?.remove()
  coordinateMarker.value = null
}

function toLatLng(position: Coordinate): L.LatLngExpression {
  return [position.lat, position.lng]
}
</script>

<template>
  <div class="gis-control-panel" @click.stop @dblclick.stop>
    <section v-if="activeTool" class="gis-control-panel__drawer">
      <header class="gis-control-panel__header">
        <div>
          <span class="gis-control-panel__eyebrow">MAP CONTROL</span>
          <h3>{{ activeTool.label }}</h3>
        </div>
        <button type="button" aria-label="关闭面板" @click="closePanel">×</button>
      </header>

      <div v-if="activeBuiltinPanel === 'layers'" class="gis-control-panel__content">
        <section class="gis-control-panel__settings">
          <div class="gis-control-panel__settings-heading">
            <h4>底图服务</h4>
            <small>选择地图数据来源</small>
          </div>
          <div class="gis-control-panel__options">
            <button
              v-for="provider in mapProviders"
              :key="provider.key"
              type="button"
              :class="{ 'is-active': mapProvider === provider.key }"
              :title="provider.description"
              @click="emit('update:mapProvider', provider.key)"
            >
              {{ provider.label }}
            </button>
          </div>
        </section>
        <section class="gis-control-panel__settings">
          <div class="gis-control-panel__settings-heading">
            <h4>地图主题</h4>
            <small>切换底图视觉样式</small>
          </div>
          <div class="gis-control-panel__options">
            <button
              v-for="theme in mapThemes"
              :key="theme.key"
              type="button"
              :class="{ 'is-active': mapTheme === theme.key }"
              :title="theme.description"
              @click="emit('update:mapTheme', theme.key)"
            >
              {{ theme.label }}
            </button>
          </div>
        </section>
        <section v-for="group in groupedLayers" :key="group.name" class="gis-control-panel__group">
          <h4>{{ group.name }}</h4>
          <label v-for="layer in group.items" :key="layer.id" class="gis-control-panel__layer">
            <span class="gis-control-panel__layer-icon">{{ layer.icon ?? '◈' }}</span>
            <span class="gis-control-panel__layer-copy">
              <strong>{{ layer.label }}</strong>
              <small v-if="layer.description">{{ layer.description }}</small>
            </span>
            <input
              type="checkbox"
              :checked="isLayerVisible(layer.id)"
              @change="setLayerVisibility(layer.id, ($event.target as HTMLInputElement).checked)"
            />
          </label>
        </section>
        <p v-if="!groupedLayers.length" class="gis-control-panel__empty">暂无可控制图层</p>
      </div>

      <div v-else-if="activeBuiltinPanel === 'measure'" class="gis-control-panel__content">
        <p class="gis-control-panel__hint">点击地图依次添加测距点，双击地图结束当前测量。</p>
        <div class="gis-control-panel__metric">
          <span>当前距离</span>
          <strong>{{ measuredDistance }}</strong>
        </div>
        <div class="gis-control-panel__measure-meta">已添加 {{ measurePoints.length }} 个点</div>
        <button type="button" class="gis-control-panel__action" @click="clearMeasure">
          清除测量
        </button>
      </div>

      <form
        v-else-if="activeBuiltinPanel === 'coordinate'"
        class="gis-control-panel__content"
        @submit.prevent="searchCoordinate"
      >
        <p class="gis-control-panel__hint">输入经纬度后定位地图，并在目标位置放置标记。</p>
        <label class="gis-control-panel__field">
          <span>纬度</span>
          <input v-model="latitude" type="number" step="0.000001" placeholder="例如 31.2304" />
        </label>
        <label class="gis-control-panel__field">
          <span>经度</span>
          <input v-model="longitude" type="number" step="0.000001" placeholder="例如 121.4737" />
        </label>
        <p v-if="coordinateError" class="gis-control-panel__error">{{ coordinateError }}</p>
        <button type="submit" class="gis-control-panel__action">定位坐标</button>
      </form>

      <div v-else class="gis-control-panel__content">
        <slot name="custom-panel" :tool="activeTool" :close="closePanel">
          <p class="gis-control-panel__empty">请通过 custom-panel 插槽提供此工具的内容。</p>
        </slot>
      </div>
    </section>

    <nav class="gis-control-panel__rail" aria-label="地图工具">
      <template v-for="(tool, index) in controlTools" :key="tool.id">
        <span
          v-if="index > 0 && tool.type === 'action' && controlTools[index - 1]?.type !== 'action'"
          class="gis-control-panel__divider"
        ></span>
        <button
          type="button"
          :class="{
            'is-active':
              activeToolId === tool.id || (tool.action === 'fullscreen' && fullscreenActive),
          }"
          :disabled="tool.disabled"
          :aria-label="getToolLabel(tool)"
          :title="tool.description ?? getToolLabel(tool)"
          @click="toggleTool(tool)"
        >
          {{ tool.icon ?? '◈' }}
        </button>
      </template>
    </nav>
  </div>
</template>

<style scoped>
.gis-control-panel {
  position: absolute;
  top: 16px;
  right: 14px;
  z-index: 700;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  color: #293346;
  font-family: inherit;
}
.gis-control-panel__rail {
  display: flex;
  width: 42px;
  flex-direction: column;
  gap: 6px;
  padding: 7px;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 22px;
  background: rgb(246 249 255 / 92%);
  box-shadow: 0 10px 26px rgb(42 58 88 / 18%);
  backdrop-filter: blur(8px);
}
.gis-control-panel__rail button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #51627b;
  background: transparent;
  cursor: pointer;
  font-size: 19px;
  line-height: 1;
  transition: 160ms ease;
}
.gis-control-panel__rail button:hover,
.gis-control-panel__rail button.is-active {
  color: #fff;
  background: #3169e8;
  box-shadow: 0 4px 12px rgb(49 105 232 / 28%);
}
.gis-control-panel__divider {
  height: 1px;
  margin: 2px 1px;
  background: #dbe3ef;
}
.gis-control-panel__drawer {
  width: min(280px, calc(100vw - 90px));
  max-height: min(560px, calc(100% - 22px));
  overflow: auto;
  padding: 14px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 14px;
  background: rgb(248 251 255 / 94%);
  box-shadow: 0 14px 36px rgb(42 58 88 / 22%);
  backdrop-filter: blur(12px);
}
.gis-control-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 13px;
}
.gis-control-panel__header h3 {
  margin: 0;
  color: #253249;
  font-size: 16px;
}
.gis-control-panel__header button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #66758b;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
.gis-control-panel__eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #3169e8;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.12em;
}
.gis-control-panel__settings {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #c4d9fb;
  border-radius: 10px;
  background: rgb(228 239 255 / 76%);
}
.gis-control-panel__settings-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}
.gis-control-panel__settings-heading h4 {
  margin: 0;
  color: #34445b;
  font-size: 12px;
}
.gis-control-panel__settings-heading small {
  color: #8290a3;
  font-size: 9px;
}
.gis-control-panel__options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.gis-control-panel__options button {
  padding: 6px 8px;
  border: 1px solid #c1d2eb;
  border-radius: 7px;
  color: #63738a;
  background: rgb(255 255 255 / 65%);
  cursor: pointer;
  font-size: 10px;
}
.gis-control-panel__options button:hover,
.gis-control-panel__options button.is-active {
  border-color: #3169e8;
  color: #fff;
  background: #3169e8;
}
.gis-control-panel__group {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #c4d9fb;
  border-radius: 10px;
  background: rgb(228 239 255 / 76%);
}
.gis-control-panel__group h4 {
  margin: 0 0 5px;
  color: #34445b;
  font-size: 12px;
}
.gis-control-panel__layer {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  color: #46556b;
  cursor: pointer;
}
.gis-control-panel__layer-icon {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  color: #365d9b;
  font-size: 15px;
}
.gis-control-panel__layer-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}
.gis-control-panel__layer-copy strong {
  font-size: 12px;
  font-weight: 600;
}
.gis-control-panel__layer-copy small {
  overflow: hidden;
  color: #8290a3;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gis-control-panel__layer input {
  width: 16px;
  height: 16px;
  accent-color: #3169e8;
}
.gis-control-panel__hint,
.gis-control-panel__empty,
.gis-control-panel__measure-meta {
  margin: 0 0 12px;
  color: #728096;
  font-size: 11px;
  line-height: 1.6;
}
.gis-control-panel__metric {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid #e3cf88;
  border-radius: 10px;
  background: #fff9e7;
}
.gis-control-panel__metric span {
  color: #6c6b60;
  font-size: 11px;
}
.gis-control-panel__metric strong {
  color: #bd7b18;
  font-size: 19px;
}
.gis-control-panel__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #627188;
  font-size: 10px;
}
.gis-control-panel__field input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid #c8d6eb;
  border-radius: 8px;
  outline: 0;
  color: #2f3d54;
  background: #fff;
  font: inherit;
}
.gis-control-panel__field input:focus {
  border-color: #3169e8;
  box-shadow: 0 0 0 3px rgb(49 105 232 / 14%);
}
.gis-control-panel__action {
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: #3169e8;
  cursor: pointer;
  font-size: 11px;
}
.gis-control-panel__action:hover {
  background: #2456c8;
}
.gis-control-panel__error {
  margin: -3px 0 10px;
  color: #d04e61;
  font-size: 10px;
}
@media (max-width: 720px) {
  .gis-control-panel {
    top: 10px;
    right: 10px;
  }
  .gis-control-panel__drawer {
    width: min(260px, calc(100vw - 76px));
  }
}
</style>
