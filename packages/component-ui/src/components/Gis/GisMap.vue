<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'

import { LayerManager } from './core/LayerManager'
import { GIS_MAP_CONTEXT } from './core/context'
import type { Coordinate } from './types'

const props = withDefaults(
  defineProps<{
    center?: Coordinate
    zoom?: number
    minZoom?: number
    maxZoom?: number
    draggable?: boolean
    scrollZoom?: boolean
    doubleClickZoom?: boolean
  }>(),
  {
    center: () => ({ lat: 31.5, lng: 123 }),
    zoom: 5,
    minZoom: 3,
    maxZoom: 18,
    draggable: true,
    scrollZoom: true,
    doubleClickZoom: true,
  },
)

const emit = defineEmits<{
  ready: [map: L.Map]
  click: [position: Coordinate]
  'update:zoom': [zoom: number]
}>()

const mapElement = ref<HTMLDivElement>()
const map = shallowRef<L.Map | null>(null)
const layerManager = shallowRef<LayerManager | null>(null)

provide(GIS_MAP_CONTEXT, { map, layerManager })

onMounted(() => {
  const instance = L.map(mapElement.value!, {
    dragging: props.draggable,
    scrollWheelZoom: props.scrollZoom,
    doubleClickZoom: props.doubleClickZoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    zoomControl: false,
  }).setView([props.center.lat, props.center.lng], props.zoom)

  map.value = instance
  layerManager.value = new LayerManager(instance)

  instance.on('click', event => {
    emit('click', { lat: event.latlng.lat, lng: event.latlng.lng })
  })
  instance.on('zoomend', () => emit('update:zoom', instance.getZoom()))
  emit('ready', instance)
})

onBeforeUnmount(() => {
  layerManager.value?.clear()
  map.value?.remove()
  map.value = null
  layerManager.value = null
})

watch(
  () => props.center,
  center => {
    map.value?.panTo([center.lat, center.lng])
  },
  { deep: true },
)

watch(
  () => props.zoom,
  zoom => {
    if (map.value && map.value.getZoom() !== zoom) map.value.setZoom(zoom)
  },
)

function fitBounds(points: Coordinate[]) {
  if (!map.value || !points.length) return
  map.value.fitBounds(
    L.latLngBounds(points.map(point => [point.lat, point.lng] as [number, number])),
    { padding: [35, 35], maxZoom: 7 },
  )
}

function flyTo(position: Coordinate, zoom?: number) {
  map.value?.flyTo([position.lat, position.lng], zoom ?? map.value.getZoom(), { duration: 0.45 })
}

defineExpose({
  getMap: () => map.value,
  fitBounds,
  flyTo,
})
</script>

<template>
  <div ref="mapElement" class="gis-map">
    <slot />
  </div>
</template>

<style scoped>
.gis-map {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: #dae3e7;
}
.gis-map:fullscreen {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
}
.gis-map--fullscreen {
  position: fixed !important;
  inset: 0;
  z-index: 10000;
  width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
}
</style>
