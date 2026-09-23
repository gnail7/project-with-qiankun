<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import type { DemoItem } from '@/types'
import {
  GisControlPanel,
  GisGraticuleLayer,
  GisMap,
  GisMarker,
  GisPolyline,
  GisTerminatorLayer,
  GisTileLayer,
  GisTimezoneLayer,
} from '@ziven/ui/Gis'
import type { Coordinate, GisControlLayer, MapProvider, MapTheme } from '@ziven/ui/Gis'
import { mockRoutes, updateLinkOrder } from './api'
import type { Waypoint } from './api'

defineProps<{ demo: DemoItem }>()

type WaypointForm = Pick<
  Waypoint,
  'name' | 'lon' | 'lat' | 'speed' | 'routeType' | 'isMajor' | 'date' | 'memo' | 'stopTime'
>

const mapControlLayers: GisControlLayer[] = [
  {
    id: 'route-line',
    label: '航线',
    icon: '━',
    group: '航线数据',
    description: '当前航线连线',
  },
  {
    id: 'waypoints',
    label: 'Waypoint',
    icon: '●',
    group: '航线数据',
    description: '航线节点',
  },
  {
    id: 'insertion-points',
    label: '辅助插入点',
    icon: '＋',
    group: '航线数据',
    description: '拖拽节点时显示',
  },
  {
    id: 'timezones',
    label: '时区',
    icon: '◫',
    group: '地图元素',
    description: 'UTC 时区参考带',
  },
  {
    id: 'terminator',
    label: '晨昏线',
    icon: '☼',
    group: '地图元素',
    description: '实时太阳晨昏分界线',
  },
  {
    id: 'graticule',
    label: '经纬网',
    icon: '⊞',
    group: '地图元素',
    description: '动态经纬度网格',
  },
]

const mapRef = ref<InstanceType<typeof GisMap>>()
const routeWaypoints = ref<Record<string, Waypoint[]>>(
  Object.fromEntries(
    mockRoutes.map(route => [route.routeId, cloneWaypoints(route.waypoints)]),
  ) as Record<string, Waypoint[]>,
)
const activeRouteId = ref(mockRoutes[0].routeId)
const currentRoute = computed(
  () => mockRoutes.find(route => route.routeId === activeRouteId.value) ?? mockRoutes[0],
)
const waypoints = computed(() => routeWaypoints.value[activeRouteId.value] ?? [])
const draggingPositions = ref<Record<string, Coordinate>>({})
const insertionMarkers = ref<Array<{ id: string; position: Coordinate; insertIndex: number }>>([])
const draggingInsertion = ref<{
  id: string
  position: Coordinate
  insertIndex: number
} | null>(null)
const selectedId = ref<string | null>(waypoints.value[0]?.id ?? null)
const editingId = ref<string | null>(null)
const editingIsNew = ref(false)
const dialogVisible = ref(false)
const addMode = ref(false)
const measureActive = ref(false)
const layerVisibility = ref<Record<string, boolean>>({
  'route-line': true,
  waypoints: true,
  'insertion-points': true,
  timezones: false,
  terminator: false,
  graticule: false,
})
const activeMapProvider = ref<MapProvider>('openfreemap')
const activeMapTheme = ref<MapTheme>('standard')
const saving = ref(false)
const formError = ref('')
const form = ref<WaypointForm>(createForm(waypoints.value[0]))
let insertionAnchorIndex: number | null = null

watch(activeRouteId, () => {
  draggingPositions.value = {}
  clearInsertionMarkers()
  addMode.value = false
  dialogVisible.value = false
  editingId.value = null
  editingIsNew.value = false
  formError.value = ''
  selectedId.value = waypoints.value[0]?.id ?? null
  void nextTick(() => fitRoute())
})

const displayWaypoints = computed(() =>
  waypoints.value.map(waypoint => {
    const position = draggingPositions.value[waypoint.id]
    return position ? { ...waypoint, lat: position.lat, lon: position.lng } : waypoint
  }),
)

const routePoints = computed<Coordinate[]>(() => getRoutePointsWithDraggingInsertion())

function cloneWaypoints(items: Waypoint[]) {
  return items.map(item => ({ ...item }))
}

function createForm(item?: Waypoint): WaypointForm {
  return {
    name: item?.name ?? `Waypoint ${waypoints.value.length + 1}`,
    lon: item?.lon ?? 0,
    lat: item?.lat ?? 0,
    speed: item?.speed ?? 12,
    routeType: item?.routeType ?? 'RL',
    isMajor: item?.isMajor ?? false,
    date: item?.date ?? '',
    memo: item?.memo ?? '',
    stopTime: item?.stopTime ?? 0,
  }
}

function makeId() {
  return `wp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function clearInsertionMarkers() {
  insertionMarkers.value = []
  draggingInsertion.value = null
  insertionAnchorIndex = null
}

function createInsertionMarkers(id: string, current: Coordinate) {
  clearInsertionMarkers()

  const index = waypoints.value.findIndex(item => item.id === id)
  if (index < 0) return
  insertionAnchorIndex = index

  const previous = waypoints.value[index - 1]
  const next = waypoints.value[index + 1]
  const candidates = [
    previous && {
      id: `${id}-before`,
      position: { lat: (previous.lat + current.lat) / 2, lng: (previous.lon + current.lng) / 2 },
      insertIndex: index,
    },
    next && {
      id: `${id}-after`,
      position: { lat: (current.lat + next.lat) / 2, lng: (current.lng + next.lon) / 2 },
      insertIndex: index + 1,
    },
  ].filter(Boolean) as Array<{ id: string; position: Coordinate; insertIndex: number }>
  insertionMarkers.value = candidates
}

function updateInsertionMarkers(current: Coordinate) {
  if (insertionAnchorIndex == null) return
  const anchorIndex = insertionAnchorIndex
  const previous = waypoints.value[anchorIndex - 1]
  const next = waypoints.value[anchorIndex + 1]

  insertionMarkers.value = insertionMarkers.value.map(insertion => {
    const { insertIndex } = insertion
    if (insertIndex === anchorIndex && previous) {
      return {
        ...insertion,
        position: { lat: (previous.lat + current.lat) / 2, lng: (previous.lon + current.lng) / 2 },
      }
    }
    if (insertIndex === anchorIndex + 1 && next) {
      return {
        ...insertion,
        position: { lat: (current.lat + next.lat) / 2, lng: (current.lng + next.lon) / 2 },
      }
    }
    return insertion
  })
}

function insertWaypoint(index: number, position: Coordinate) {
  const waypoint: Waypoint = {
    id: makeId(),
    name: `Waypoint ${waypoints.value.length + 1}`,
    lon: roundCoordinate(position.lng),
    lat: roundCoordinate(position.lat),
    speed: 12,
    routeType: 'RL',
    memo: '通过辅助点插入',
    isMajor: false,
    stopTime: 0,
  }
  waypoints.value.splice(Math.max(0, Math.min(index, waypoints.value.length)), 0, waypoint)
  selectedId.value = waypoint.id
  clearInsertionMarkers()
}

function getRoutePointsWithDraggingInsertion() {
  const points = displayWaypoints.value.map(waypoint => ({
    lat: waypoint.lat,
    lng: waypoint.lon,
  }))
  const insertion = draggingInsertion.value
  if (!insertion) return points

  points.splice(insertion.insertIndex, 0, insertion.position)
  return points
}

function handleInsertionDragStart(id: string, position: Coordinate) {
  const insertion = insertionMarkers.value.find(item => item.id === id)
  if (!insertion) return
  draggingInsertion.value = { id, position, insertIndex: insertion.insertIndex }
}

function handleInsertionDrag(id: string, position: Coordinate) {
  const insertion = insertionMarkers.value.find(item => item.id === id)
  if (!insertion) return
  draggingInsertion.value = { id, position, insertIndex: insertion.insertIndex }
  insertionMarkers.value = insertionMarkers.value.map(item =>
    item.id === id ? { ...item, position } : item,
  )
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

function updateWaypoint(id: string, patch: Partial<Waypoint>) {
  const item = waypoints.value.find(waypoint => waypoint.id === id)
  if (!item) return
  Object.assign(item, patch)
  selectedId.value = id
}

function handleWaypointDragStart(id: string, position: Coordinate) {
  createInsertionMarkers(id, position)
}

function handleWaypointDrag(id: string, position: Coordinate) {
  draggingPositions.value = { ...draggingPositions.value, [id]: position }
  updateInsertionMarkers(position)
}

function handleWaypointDragEnd(id: string, position: Coordinate) {
  updateWaypoint(id, { lat: roundCoordinate(position.lat), lon: roundCoordinate(position.lng) })
  const nextPositions = { ...draggingPositions.value }
  delete nextPositions[id]
  draggingPositions.value = nextPositions
  updateInsertionMarkers(position)
}

function handleMapClick(position: Coordinate) {
  if (measureActive.value) return
  if (!addMode.value) return
  const waypoint: Waypoint = {
    id: makeId(),
    name: `Waypoint ${waypoints.value.length + 1}`,
    lon: roundCoordinate(position.lng),
    lat: roundCoordinate(position.lat),
    speed: 12,
    routeType: 'RL',
    memo: '',
    isMajor: false,
    stopTime: 0,
  }
  waypoints.value.push(waypoint)
  selectedId.value = waypoint.id
  addMode.value = false
  clearInsertionMarkers()
  openEditor(waypoint.id, true)
}

function openEditor(id: string, isNew = false) {
  const waypoint = waypoints.value.find(item => item.id === id)
  if (!waypoint) return
  selectedId.value = id
  editingId.value = id
  editingIsNew.value = isNew
  form.value = createForm(waypoint)
  formError.value = ''
  dialogVisible.value = true
}

function selectWaypoint(waypoint: Waypoint) {
  selectedId.value = waypoint.id
  mapRef.value?.flyTo({ lat: waypoint.lat, lng: waypoint.lon }, 6)
  openEditor(waypoint.id)
}

function closeEditor() {
  if (editingIsNew.value && editingId.value) removeWaypoint(editingId.value, false)
  dialogVisible.value = false
  editingId.value = null
  editingIsNew.value = false
  formError.value = ''
}

async function saveWaypoint() {
  const id = editingId.value
  const draft = form.value
  if (!id) return
  if (!draft.name.trim()) {
    formError.value = '请输入 waypoint 名称'
    return
  }
  if (!Number.isFinite(draft.lon) || draft.lon < -180 || draft.lon > 180) {
    formError.value = '经度范围应为 -180 至 180'
    return
  }
  if (!Number.isFinite(draft.lat) || draft.lat < -90 || draft.lat > 90) {
    formError.value = '纬度范围应为 -90 至 90'
    return
  }

  updateWaypoint(id, {
    name: draft.name.trim(),
    lon: roundCoordinate(draft.lon),
    lat: roundCoordinate(draft.lat),
    speed: Math.max(0, Number(draft.speed) || 0),
    routeType: draft.routeType,
    isMajor: draft.isMajor,
    date: draft.date,
    memo: draft.memo,
    stopTime: Math.max(0, Number(draft.stopTime) || 0),
  })
  saving.value = true
  try {
    await updateLinkOrder(
      currentRoute.value.routeId,
      waypoints.value.map(waypoint => [waypoint.lon, waypoint.lat, waypoint.speed, waypoint.memo]),
    )
    dialogVisible.value = false
    editingId.value = null
    editingIsNew.value = false
  } finally {
    saving.value = false
  }
}

function removeWaypoint(id: string, closeDialog = true) {
  const index = waypoints.value.findIndex(item => item.id === id)
  if (index < 0) return
  waypoints.value.splice(index, 1)
  selectedId.value = waypoints.value[Math.max(0, index - 1)]?.id ?? waypoints.value[0]?.id ?? null
  if (closeDialog) {
    dialogVisible.value = false
    editingId.value = null
    editingIsNew.value = false
  }
  const nextPositions = { ...draggingPositions.value }
  delete nextPositions[id]
  draggingPositions.value = nextPositions
  clearInsertionMarkers()
}

function fitRoute() {
  if (!routePoints.value.length) return
  mapRef.value?.fitBounds(routePoints.value)
}

function toggleAddMode() {
  addMode.value = !addMode.value
}
</script>

<template>
  <div class="voyage-plan">
    <div class="voyage-plan__toolbar">
      <div>
        <strong>{{ currentRoute.name }} · Waypoint</strong>
        <span>{{ currentRoute.description }} · {{ waypoints.length }} 个节点 · 右键删除</span>
      </div>
      <div class="voyage-plan__toolbar-actions">
        <label class="voyage-plan__route-switcher">
          <span>当前航线</span>
          <select v-model="activeRouteId" aria-label="切换航线">
            <option v-for="route in mockRoutes" :key="route.routeId" :value="route.routeId">
              {{ route.routeId }} · {{ route.name }}
            </option>
          </select>
        </label>
        <button
          class="voyage-plan__button"
          :class="{ 'is-active': addMode }"
          @click="toggleAddMode"
        >
          <span>＋</span>{{ addMode ? '请在地图上点选' : '地图点选新增' }}
        </button>
        <button class="voyage-plan__button voyage-plan__button--ghost" @click="fitRoute">
          定位航线
        </button>
      </div>
    </div>

    <div class="voyage-plan__content">
      <aside class="voyage-plan__sidebar">
        <div class="voyage-plan__sidebar-heading">
          <div>
            <span class="voyage-plan__eyebrow">ROUTE {{ currentRoute.routeId }}</span>
            <h3>Waypoint 列表</h3>
          </div>
          <span class="voyage-plan__count">{{ waypoints.length }}</span>
        </div>
        <p v-if="!waypoints.length" class="voyage-plan__empty">暂无线位点，请在地图上新增。</p>
        <div v-else class="voyage-plan__list">
          <button
            v-for="(waypoint, index) in waypoints"
            :key="waypoint.id"
            class="voyage-plan__item"
            :class="{ 'is-selected': selectedId === waypoint.id }"
            @click="selectWaypoint(waypoint)"
            @contextmenu.prevent="removeWaypoint(waypoint.id)"
          >
            <span class="voyage-plan__item-index">{{ index + 1 }}</span>
            <span class="voyage-plan__item-main"
              ><strong>{{ waypoint.name }}</strong
              ><small>{{ waypoint.lat.toFixed(4) }}, {{ waypoint.lon.toFixed(4) }}</small></span
            >
            <span class="voyage-plan__item-speed">{{ waypoint.speed ?? 0 }} <small>kn</small></span>
            <span class="voyage-plan__item-chevron">›</span>
          </button>
        </div>
        <p class="voyage-plan__tip">
          拖动原节点只会更新坐标；拖动两侧的 ＋ 点才会插入新节点。地图标记或列表项支持右键删除。
        </p>
      </aside>

      <div class="voyage-plan__map-wrap">
        <GisMap
          ref="mapRef"
          class="voyage-plan__map"
          :class="{ 'is-add-mode': addMode }"
          :center="{ lat: 31.5, lng: 123 }"
          :zoom="5"
          :min-zoom="3"
          :max-zoom="18"
          @click="handleMapClick"
        >
          <GisTileLayer id="route-base-map" :provider="activeMapProvider" :theme="activeMapTheme" />
          <GisTimezoneLayer :visible="layerVisibility.timezones" />
          <GisTerminatorLayer :visible="layerVisibility.terminator" />
          <GisGraticuleLayer :visible="layerVisibility.graticule" />
          <GisPolyline
            v-if="layerVisibility['route-line']"
            id="route-line"
            :points="routePoints"
            theme="primary"
          />
          <template v-if="layerVisibility.waypoints">
            <GisMarker
              v-for="(waypoint, index) in displayWaypoints"
              :id="waypoint.id"
              :key="waypoint.id"
              :position="{ lat: waypoint.lat, lng: waypoint.lon }"
              variant="waypoint"
              :label="index + 1"
              :selected="selectedId === waypoint.id"
              draggable
              @click="openEditor(waypoint.id)"
              @contextmenu="removeWaypoint(waypoint.id)"
              @dragstart="handleWaypointDragStart(waypoint.id, $event)"
              @drag="handleWaypointDrag(waypoint.id, $event)"
              @dragend="handleWaypointDragEnd(waypoint.id, $event)"
            />
          </template>
          <template v-if="layerVisibility['insertion-points']">
            <GisMarker
              v-for="insertion in insertionMarkers"
              :id="insertion.id"
              :key="insertion.id"
              :position="insertion.position"
              variant="insertion"
              label="＋"
              draggable
              @dragstart="handleInsertionDragStart(insertion.id, $event)"
              @drag="handleInsertionDrag(insertion.id, $event)"
              @dragend="insertWaypoint(insertion.insertIndex, $event)"
            />
          </template>
          <GisControlPanel
            v-model:layer-visibility="layerVisibility"
            v-model:measure-active="measureActive"
            v-model:map-provider="activeMapProvider"
            v-model:map-theme="activeMapTheme"
            :layers="mapControlLayers"
          />
        </GisMap>
        <div class="voyage-plan__map-hint" :class="{ 'is-visible': addMode }">
          <span>＋</span> 点击地图位置新增 Waypoint
        </div>
        <div class="voyage-plan__legend">
          <span><i class="is-route"></i>航线</span><span><i class="is-node"></i>Waypoint</span>
        </div>
      </div>
    </div>

    <div v-if="dialogVisible" class="voyage-plan__mask" @click.self="closeEditor">
      <form class="voyage-plan__dialog" @submit.prevent="saveWaypoint">
        <div class="voyage-plan__dialog-heading">
          <div>
            <span class="voyage-plan__eyebrow">WAYPOINT EDITOR</span>
            <h3>{{ editingIsNew ? '新增 Waypoint' : '编辑 Waypoint' }}</h3>
          </div>
          <button type="button" class="voyage-plan__close" aria-label="关闭" @click="closeEditor">
            ×
          </button>
        </div>
        <div class="voyage-plan__fields">
          <label class="is-wide"
            ><span>名称</span><input v-model="form.name" placeholder="例如：起点"
          /></label>
          <label
            ><span>纬度</span><input v-model.number="form.lat" type="number" step="0.000001"
          /></label>
          <label
            ><span>经度</span><input v-model.number="form.lon" type="number" step="0.000001"
          /></label>
          <label
            ><span>航速 <b>kn</b></span
            ><input v-model.number="form.speed" type="number" min="0" step="0.1"
          /></label>
          <label
            ><span>停留 <b>min</b></span
            ><input v-model.number="form.stopTime" type="number" min="0" step="1"
          /></label>
          <label
            ><span>航线类型</span
            ><select v-model="form.routeType">
              <option value="RL">RL</option>
              <option value="GC">GC</option>
              <option value="RH">RH</option>
            </select></label
          >
          <label class="is-wide"><span>日期</span><input v-model="form.date" type="date" /></label>
          <label class="is-wide"
            ><span>备注</span
            ><textarea
              v-model="form.memo"
              rows="3"
              placeholder="补充当前 waypoint 的说明"
            ></textarea>
          </label>
          <label class="voyage-plan__checkbox is-wide"
            ><input v-model="form.isMajor" type="checkbox" /><span>标记为关键节点</span></label
          >
        </div>
        <p v-if="formError" class="voyage-plan__error">{{ formError }}</p>
        <div class="voyage-plan__actions">
          <button
            v-if="!editingIsNew"
            type="button"
            class="voyage-plan__delete"
            @click="removeWaypoint(editingId!)"
          >
            删除节点</button
          ><span></span>
          <button
            type="button"
            class="voyage-plan__button voyage-plan__button--ghost"
            @click="closeEditor"
          >
            取消
          </button>
          <button
            type="submit"
            class="voyage-plan__button voyage-plan__button--primary"
            :disabled="saving"
          >
            {{ saving ? '保存中…' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.voyage-plan {
  position: relative;
  overflow: hidden;
  min-height: 660px;
  border: 1px solid var(--hub-line);
  border-radius: 16px;
  color: var(--hub-text);
  background: var(--hub-surface);
}
.voyage-plan__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--hub-line);
}
.voyage-plan__toolbar strong {
  display: block;
  font-size: 15px;
}
.voyage-plan__toolbar > div:first-child > span {
  display: block;
  margin-top: 5px;
  color: var(--hub-muted);
  font-size: 11px;
}
.voyage-plan__toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.voyage-plan__route-switcher {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--hub-muted);
  font-size: 10px;
  white-space: nowrap;
}
.voyage-plan__route-switcher select {
  max-width: 190px;
  padding: 8px 26px 8px 9px;
  border: 1px solid var(--hub-line);
  border-radius: 8px;
  outline: 0;
  color: var(--hub-text);
  background: var(--hub-surface-soft);
  cursor: pointer;
  font-size: 10px;
}
.voyage-plan__route-switcher select:focus {
  border-color: var(--hub-primary);
  box-shadow: 0 0 0 3px var(--hub-primary-soft);
}
.voyage-plan__button {
  padding: 9px 12px;
  border: 1px solid var(--hub-line);
  border-radius: 8px;
  color: var(--hub-text);
  background: var(--hub-surface-soft);
  cursor: pointer;
  font-size: 11px;
  transition: 160ms ease;
}
.voyage-plan__button:hover,
.voyage-plan__button.is-active {
  border-color: var(--hub-primary);
  color: var(--hub-primary);
  background: var(--hub-primary-soft);
}
.voyage-plan__button--primary {
  border-color: var(--hub-primary);
  color: white;
  background: var(--hub-primary);
}
.voyage-plan__button--primary:hover {
  color: white;
  background: color-mix(in srgb, var(--hub-primary) 86%, black);
}
.voyage-plan__button--ghost {
  background: transparent;
}
.voyage-plan__button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.voyage-plan__content {
  display: grid;
  height: 590px;
  min-height: 590px;
  grid-template-columns: 268px minmax(0, 1fr);
}
.voyage-plan__sidebar {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 20px 14px;
  border-right: 1px solid var(--hub-line);
}
.voyage-plan__sidebar-heading,
.voyage-plan__dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.voyage-plan__eyebrow {
  display: block;
  margin-bottom: 6px;
  color: var(--hub-primary);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.12em;
}
.voyage-plan__sidebar h3,
.voyage-plan__dialog h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: -0.03em;
}
.voyage-plan__count {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 8px;
  color: var(--hub-primary);
  background: var(--hub-primary-soft);
  font-size: 11px;
  font-weight: 700;
}
.voyage-plan__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 20px;
}
.voyage-plan__item {
  display: grid;
  grid-template-columns: 27px minmax(0, 1fr) auto 10px;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--hub-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: 160ms ease;
}
.voyage-plan__item:hover,
.voyage-plan__item.is-selected {
  border-color: color-mix(in srgb, var(--hub-primary) 32%, var(--hub-line));
  background: var(--hub-primary-soft);
}
.voyage-plan__item-index {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  color: var(--hub-primary);
  background: var(--hub-surface);
  font-size: 10px;
  font-weight: 700;
}
.voyage-plan__item-main {
  min-width: 0;
}
.voyage-plan__item-main strong,
.voyage-plan__item-main small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.voyage-plan__item-main strong {
  font-size: 11px;
}
.voyage-plan__item-main small {
  margin-top: 4px;
  color: var(--hub-muted);
  font-size: 9px;
}
.voyage-plan__item-speed {
  color: var(--hub-primary);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.voyage-plan__item-speed small {
  color: var(--hub-muted);
  font-size: 9px;
  font-weight: 500;
}
.voyage-plan__item-chevron {
  color: var(--hub-subtle);
  font-size: 16px;
}
.voyage-plan__tip {
  margin: auto 4px 0;
  color: var(--hub-subtle);
  font-size: 10px;
  line-height: 1.65;
}
.voyage-plan__empty {
  margin: 28px 4px;
  color: var(--hub-muted);
  font-size: 11px;
  line-height: 1.7;
}
.voyage-plan__map-wrap {
  position: relative;
  height: 590px;
  min-width: 0;
  min-height: 590px;
}
.voyage-plan__map {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #dae3e7;
}
.voyage-plan__map.is-add-mode {
  cursor: crosshair;
}
.voyage-plan__map-hint {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid rgb(117 100 239 / 28%);
  border-radius: 8px;
  color: var(--hub-primary);
  background: color-mix(in srgb, var(--hub-surface) 88%, transparent);
  box-shadow: 0 5px 18px rgb(35 31 63 / 12%);
  font-size: 11px;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -8px);
  transition: 180ms ease;
}
.voyage-plan__map-hint.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
}
.voyage-plan__map-hint span {
  font-size: 17px;
  line-height: 10px;
}
.voyage-plan__legend {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 500;
  display: flex;
  gap: 11px;
  padding: 8px 10px;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 7px;
  color: #34424b;
  background: rgb(255 255 255 / 84%);
  font-size: 10px;
}
.voyage-plan__legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.voyage-plan__legend i {
  display: inline-block;
  width: 10px;
  height: 3px;
  border-radius: 3px;
  background: var(--hub-primary);
}
.voyage-plan__legend i.is-node {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--hub-primary);
}
.voyage-plan__mask {
  position: absolute;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(17 17 25 / 36%);
  backdrop-filter: blur(2px);
}
.voyage-plan__dialog {
  width: min(455px, 100%);
  padding: 22px;
  border: 1px solid var(--hub-line);
  border-radius: 15px;
  color: var(--hub-text);
  background: var(--hub-surface);
  box-shadow: 0 20px 60px rgb(20 18 42 / 20%);
}
.voyage-plan__close {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  color: var(--hub-muted);
  background: var(--hub-surface-soft);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
.voyage-plan__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}
.voyage-plan__fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: var(--hub-muted);
  font-size: 10px;
}
.voyage-plan__fields label.is-wide {
  grid-column: 1 / -1;
}
.voyage-plan__fields input,
.voyage-plan__fields select,
.voyage-plan__fields textarea {
  width: 100%;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--hub-line);
  border-radius: 7px;
  outline: 0;
  color: var(--hub-text);
  background: var(--hub-surface-soft);
  font-size: 12px;
  resize: vertical;
}
.voyage-plan__fields input:focus,
.voyage-plan__fields select:focus,
.voyage-plan__fields textarea:focus {
  border-color: var(--hub-primary);
  box-shadow: 0 0 0 3px var(--hub-primary-soft);
}
.voyage-plan__fields b {
  color: var(--hub-primary);
  font-size: 9px;
  font-weight: 600;
}
.voyage-plan__checkbox {
  flex-direction: row !important;
  align-items: center;
  gap: 7px !important;
}
.voyage-plan__checkbox input {
  width: 14px;
}
.voyage-plan__checkbox span {
  color: var(--hub-text);
}
.voyage-plan__error {
  margin: 12px 0 0;
  color: #d0524f;
  font-size: 11px;
}
.voyage-plan__actions {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.voyage-plan__delete {
  padding: 0;
  border: 0;
  color: #d0524f;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
}
:deep(.leaflet-container) {
  color: #263238;
  font-family: inherit;
}
:deep(.voyage-plan__marker-wrap) {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}
:deep(.voyage-plan__marker) {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  color: #fff;
  background: #7564ef;
  box-shadow: 0 2px 8px rgb(28 18 92 / 38%);
  font-size: 10px;
  font-weight: 750;
  transition: 160ms ease;
}
:deep(.voyage-plan__marker.is-selected) {
  width: 32px;
  height: 32px;
  border-color: #ded9ff;
  background: #4b3bb7;
  box-shadow:
    0 0 0 5px rgb(117 100 239 / 22%),
    0 3px 10px rgb(28 18 92 / 40%);
}
:deep(.voyage-plan__insertion-wrap) {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}
:deep(.voyage-plan__insertion-marker) {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border: 2px solid #7564ef;
  border-radius: 50%;
  color: #7564ef;
  background: #fff;
  box-shadow: 0 2px 8px rgb(28 18 92 / 25%);
  cursor: grab;
  font-size: 14px;
  font-weight: 700;
}
:deep(.voyage-plan__insertion-marker:active) {
  cursor: grabbing;
}
@media (max-width: 720px) {
  .voyage-plan__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .voyage-plan__toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .voyage-plan__route-switcher {
    width: 100%;
    justify-content: space-between;
  }
  .voyage-plan__route-switcher select {
    flex: 1;
    max-width: none;
  }
  .voyage-plan__content {
    height: auto;
    min-height: 0;
    grid-template-columns: 1fr;
  }
  .voyage-plan__sidebar {
    min-height: 250px;
    border-right: 0;
    border-bottom: 1px solid var(--hub-line);
  }
  .voyage-plan__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .voyage-plan__map-wrap,
  .voyage-plan__map {
    height: 440px;
    min-height: 440px;
  }
}
</style>
