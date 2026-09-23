<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    showLabels?: boolean
    fillOpacity?: number
  }>(),
  {
    visible: true,
    showLabels: true,
    fillOpacity: 0.08,
  },
)

const context = useGisMapContext()
let layerGroup: L.LayerGroup | null = null
let boundMap: L.Map | null = null

watch(
  () => context.map.value,
  map => {
    if (boundMap && boundMap !== map) detachMap(boundMap)
    if (map) attachMap(map)
  },
  { immediate: true },
)

watch(() => [props.visible, props.showLabels, props.fillOpacity], render)

onBeforeUnmount(() => {
  if (boundMap) detachMap(boundMap)
})

function attachMap(map: L.Map) {
  if (boundMap === map) return
  boundMap = map
  layerGroup ??= L.layerGroup()
  render()
}

function detachMap(map: L.Map) {
  layerGroup?.removeFrom(map)
  if (boundMap === map) boundMap = null
}

function render() {
  const map = boundMap
  if (!map) return

  layerGroup ??= L.layerGroup()
  layerGroup.clearLayers()

  if (!props.visible) {
    layerGroup.removeFrom(map)
    return
  }

  layerGroup.addTo(map)

  for (let offset = -11; offset <= 11; offset += 1) {
    addZone(offset, offset * 15 - 7.5, offset * 15 + 7.5)
  }

  addZone(-12, -180, -172.5)
  addZone(12, 172.5, 180)
}

function addZone(offset: number, west: number, east: number) {
  if (!layerGroup) return

  const index = offset + 12
  const label = formatOffset(offset)
  const rectangle = L.rectangle(
    [
      [-85, west],
      [85, east],
    ],
    {
      color: '#7992b2',
      weight: 1,
      opacity: 0.45,
      fillColor: index % 2 === 0 ? '#6f8ed1' : '#b393db',
      fillOpacity: props.fillOpacity,
      interactive: false,
    },
  )
  layerGroup.addLayer(rectangle)

  if (props.showLabels) {
    layerGroup.addLayer(
      L.marker([54, (west + east) / 2], {
        icon: L.divIcon({
          className: 'gis-timezone-label',
          html: `<span>${label}</span>`,
          iconSize: [58, 18],
          iconAnchor: [29, 9],
        }),
        interactive: false,
        keyboard: false,
      }),
    )
  }
}

function formatOffset(offset: number) {
  if (offset === 0) return 'UTC±0'
  return offset > 0 ? `UTC+${offset}` : `UTC${offset}`
}
</script>

<template>
  <span class="gis-layer-anchor" aria-hidden="true"></span>
</template>

<style scoped>
.gis-layer-anchor {
  display: none;
}

:deep(.gis-timezone-label) {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  pointer-events: none;
}

:deep(.gis-timezone-label span) {
  padding: 2px 5px;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 4px;
  color: #40536c;
  background: rgb(255 255 255 / 68%);
  box-shadow: 0 2px 6px rgb(45 61 85 / 14%);
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
