<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'
import type { Coordinate, PolygonStyle } from './types'

const props = withDefaults(
  defineProps<{
    id?: string
    points: Coordinate[]
    style?: PolygonStyle
  }>(),
  {
    id: 'polygon',
    style: () => ({ color: '#7564ef', weight: 2, fillColor: '#7564ef', fillOpacity: 0.16 }),
  },
)

const context = useGisMapContext()
let polygon: L.Polygon | null = null

watch([() => context.map.value, () => props.points, () => props.style], () => syncPolygon(), {
  deep: true,
  immediate: true,
})

onBeforeUnmount(() => {
  context.layerManager.value?.remove(props.id)
  polygon = null
})

function syncPolygon() {
  if (!context.map.value) return
  const points = props.points.map(point => [point.lat, point.lng] as [number, number])
  if (!polygon) {
    polygon = L.polygon(points, props.style)
    context.layerManager.value?.add(props.id, polygon, { type: 'polygon', name: props.id })
    return
  }
  polygon.setLatLngs(points)
  polygon.setStyle(props.style)
}
</script>

<template>
  <span aria-hidden="true" style="display: none"></span>
</template>
