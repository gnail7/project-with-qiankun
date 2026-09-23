<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'

const props = withDefaults(
  defineProps<{
    id?: string
    url: string
    layers: string[]
    opacity?: number
    visible?: boolean
    params?: Record<string, string | number | boolean>
  }>(),
  {
    id: 'wms-layer',
    opacity: 1,
    visible: true,
    params: () => ({}),
  },
)

const context = useGisMapContext()
let wmsLayer: L.TileLayer.WMS | null = null

watch(
  [
    () => context.map.value,
    () => props.url,
    () => props.layers,
    () => props.params,
    () => props.opacity,
    () => props.visible,
  ],
  () => syncWmsLayer(),
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  context.layerManager.value?.remove(props.id)
  wmsLayer = null
})

function syncWmsLayer() {
  if (!context.map.value) return

  context.layerManager.value?.remove(props.id)
  wmsLayer = L.tileLayer.wms(props.url, {
    layers: props.layers.join(','),
    format: 'image/png',
    transparent: true,
    opacity: props.opacity,
    ...props.params,
  })
  context.layerManager.value?.add(props.id, wmsLayer, {
    type: 'wms',
    name: props.id,
    visible: props.visible,
    opacity: props.opacity,
  })
}
</script>

<template>
  <span aria-hidden="true" style="display: none"></span>
</template>
