<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'
import type { Coordinate, MarkerVariant } from './types'

const props = withDefaults(
  defineProps<{
    id?: string
    position: Coordinate
    variant?: MarkerVariant
    label?: string | number
    selected?: boolean
    draggable?: boolean
  }>(),
  {
    variant: 'default',
    selected: false,
    draggable: false,
  },
)

const emit = defineEmits<{
  click: [position: Coordinate]
  contextmenu: []
  dragstart: [position: Coordinate]
  drag: [position: Coordinate]
  dragend: [position: Coordinate]
}>()

const context = useGisMapContext()
const markerId = props.id ?? `marker-${Math.random().toString(36).slice(2, 9)}`
let marker: L.Marker | null = null
let isDragging = false

watch(
  () => context.map.value,
  () => createMarker(),
  { immediate: true },
)

watch([() => props.position.lat, () => props.position.lng], ([lat, lng]) => {
  if (!marker || isDragging) return
  marker.setLatLng([lat, lng])
})

watch([() => props.variant, () => props.label, () => props.selected], () => {
  if (!marker || isDragging) return
  marker.setIcon(createIcon())
})

watch(
  () => props.draggable,
  draggable => {
    if (!marker) return
    if (draggable) marker.dragging?.enable()
    else marker.dragging?.disable()
  },
)

onBeforeUnmount(() => {
  context.layerManager.value?.remove(markerId)
  marker = null
})

function createMarker() {
  const map = context.map.value
  if (!map || marker) return

  const position: [number, number] = [props.position.lat, props.position.lng]
  marker = L.marker(position, {
    icon: createIcon(),
    draggable: props.draggable,
    bubblingMouseEvents: false,
  })
  bindEvents(marker)
  context.layerManager.value?.add(markerId, marker, {
    type: 'marker',
    name: markerId,
  })
}

function createIcon() {
  const label = props.label == null ? '' : escapeHtml(String(props.label))
  const selectedClass = props.selected ? 'is-selected' : ''
  return L.divIcon({
    className: `gis-marker-wrap gis-marker-wrap--${props.variant}`,
    html: `<span class="gis-marker gis-marker--${props.variant} ${selectedClass}">${label}</span>`,
    iconSize: props.variant === 'insertion' ? [28, 28] : [32, 32],
    iconAnchor: props.variant === 'insertion' ? [14, 14] : [16, 16],
  })
}

function bindEvents(target: L.Marker) {
  target.on('click', () => emit('click', toCoordinate(target.getLatLng())))
  target.on('contextmenu', event => {
    event.originalEvent.preventDefault()
    emit('contextmenu')
  })
  target.on('dragstart', () => {
    isDragging = true
    emit('dragstart', toCoordinate(target.getLatLng()))
  })
  target.on('drag', () => emit('drag', toCoordinate(target.getLatLng())))
  target.on('dragend', () => {
    isDragging = false
    emit('dragend', toCoordinate(target.getLatLng()))
  })
}

function toCoordinate(latlng: L.LatLng): Coordinate {
  return { lat: latlng.lat, lng: latlng.lng }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}
</script>

<template>
  <span aria-hidden="true" style="display: none"></span>
</template>

<style>
.gis-marker-wrap {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}
.gis-marker {
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
.gis-marker.is-selected {
  width: 32px;
  height: 32px;
  border-color: #ded9ff;
  background: #4b3bb7;
  box-shadow:
    0 0 0 5px rgb(117 100 239 / 22%),
    0 3px 10px rgb(28 18 92 / 40%);
}
.gis-marker--insertion {
  width: 23px;
  height: 23px;
  border: 2px solid #7564ef;
  color: #7564ef;
  background: #fff;
  cursor: grab;
  font-size: 14px;
}
.gis-marker--insertion:active {
  cursor: grabbing;
}
.gis-marker--ship {
  border-radius: 9px;
  background: #31b9ce;
}
.gis-marker--default {
  background: #667085;
}
</style>
