<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'
import type { Coordinate, PolylineStyle, PolylineTheme } from './types'

const props = withDefaults(
  defineProps<{
    id?: string
    points: Coordinate[]
    theme?: PolylineTheme
    style?: PolylineStyle
  }>(),
  {
    id: 'route-line',
    theme: 'primary',
    style: () => ({}),
  },
)

const context = useGisMapContext()
let polyline: L.Polyline | null = null

watch(
  [() => context.map.value, () => props.points, () => props.theme, () => props.style],
  () => syncPolyline(),
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  context.layerManager.value?.remove(props.id)
  polyline = null
})

function syncPolyline() {
  const map = context.map.value
  if (!map) return

  const points = props.points.map(point => [point.lat, point.lng] as [number, number])
  const options = { ...getThemeStyle(props.theme), ...props.style }

  if (!polyline) {
    polyline = L.polyline(points, options)
    context.layerManager.value?.add(props.id, polyline, {
      type: 'polyline',
      name: props.id,
    })
    return
  }

  polyline.setLatLngs(points)
  polyline.setStyle(options)
}

function getThemeStyle(theme: PolylineTheme): PolylineStyle {
  return {
    primary: { color: '#7564ef', weight: 3, opacity: 0.82, dashArray: '7 7' },
    secondary: { color: '#718096', weight: 3, opacity: 0.72 },
    danger: { color: '#d0524f', weight: 4, opacity: 0.9 },
  }[theme]
}
</script>

<template>
  <span aria-hidden="true" style="display: none"></span>
</template>
