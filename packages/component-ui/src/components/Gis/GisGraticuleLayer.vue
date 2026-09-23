<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    interval?: number
    showLabels?: boolean
    lineStyle?: L.PathOptions
  }>(),
  {
    visible: true,
    interval: undefined,
    showLabels: true,
    lineStyle: () => ({
      color: '#526b86',
      weight: 1,
      opacity: 0.32,
      dashArray: '3 5',
      interactive: false,
    }),
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

watch(() => props.visible, render)
watch(() => props.interval, render)
watch(() => props.showLabels, render)
watch(() => props.lineStyle, render, { deep: true })

onBeforeUnmount(() => {
  if (boundMap) detachMap(boundMap)
})

function attachMap(map: L.Map) {
  if (boundMap === map) return
  boundMap = map
  layerGroup ??= L.layerGroup()
  map.on('zoomend', render)
  map.on('moveend', render)
  render()
}

function detachMap(map: L.Map) {
  map.off('zoomend', render)
  map.off('moveend', render)
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
  const interval = props.interval ?? getInterval(map.getZoom())
  const baseStyle = props.lineStyle
  const bounds = map.getBounds()
  const labelLatitude = clamp(
    bounds.getNorth() - Math.max(bounds.getNorth() - bounds.getSouth(), 4) * 0.06,
    -82,
    82,
  )
  const labelLongitude = clamp(
    bounds.getWest() + Math.max(bounds.getEast() - bounds.getWest(), 4) * 0.04,
    -178,
    178,
  )

  for (let latitude = -80; latitude <= 80; latitude += interval) {
    layerGroup.addLayer(
      L.polyline(
        [
          [latitude, -180],
          [latitude, 180],
        ],
        {
          ...baseStyle,
          weight: latitude === 0 ? Math.max(baseStyle.weight ?? 1, 1.4) : baseStyle.weight,
        },
      ),
    )
    if (
      props.showLabels &&
      latitude >= bounds.getSouth() - interval &&
      latitude <= bounds.getNorth() + interval
    ) {
      layerGroup.addLayer(createLabel([latitude, labelLongitude], formatLatitude(latitude)))
    }
  }

  for (let longitude = -180; longitude <= 180; longitude += interval) {
    layerGroup.addLayer(
      L.polyline(
        [
          [-85, longitude],
          [85, longitude],
        ],
        {
          ...baseStyle,
          weight: longitude === 0 ? Math.max(baseStyle.weight ?? 1, 1.4) : baseStyle.weight,
        },
      ),
    )
    if (
      props.showLabels &&
      longitude >= bounds.getWest() - interval &&
      longitude <= bounds.getEast() + interval
    ) {
      layerGroup.addLayer(createLabel([labelLatitude, longitude], formatLongitude(longitude)))
    }
  }
}

function createLabel(position: L.LatLngExpression, text: string) {
  return L.marker(position, {
    icon: L.divIcon({
      className: 'gis-graticule-label',
      html: `<span>${text}</span>`,
      iconSize: [46, 18],
      iconAnchor: [23, 9],
    }),
    interactive: false,
    keyboard: false,
  })
}

function formatLatitude(latitude: number) {
  if (latitude === 0) return '0°'
  return `${Math.abs(latitude)}°${latitude > 0 ? 'N' : 'S'}`
}

function formatLongitude(longitude: number) {
  if (longitude === 0) return '0°'
  return `${Math.abs(longitude)}°${longitude > 0 ? 'E' : 'W'}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getInterval(zoom: number) {
  if (zoom <= 3) return 30
  if (zoom <= 4) return 15
  if (zoom <= 6) return 10
  if (zoom <= 8) return 5
  return 1
}
</script>

<template>
  <span class="gis-layer-anchor" aria-hidden="true"></span>
</template>

<style scoped>
.gis-layer-anchor {
  display: none;
}

:deep(.gis-graticule-label) {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  pointer-events: none;
}

:deep(.gis-graticule-label span) {
  padding: 2px 4px;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 4px;
  color: #40536c;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 2px 6px rgb(45 61 85 / 12%);
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
