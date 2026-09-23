<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'
import type { MapProvider, MapTheme } from './types'

const props = withDefaults(
  defineProps<{
    id?: string
    provider?: MapProvider
    theme?: MapTheme
    opacity?: number
  }>(),
  {
    id: 'base-map',
    provider: 'openfreemap',
    theme: 'standard',
    opacity: 1,
  },
)

const context = useGisMapContext()
let activeLayer: L.Layer | null = null
let activeLayerKey = ''
let syncVersion = 0

type MapLibreMapLike = {
  on: (event: 'error', listener: (event: unknown) => void) => void
}

type OpenFreeMapLayer = L.Layer & {
  getMaplibreMap?: () => MapLibreMapLike
}

watch(
  [() => context.map.value, () => props.provider, () => props.theme, () => props.opacity],
  () => void syncLayer(),
  { immediate: true },
)

onBeforeUnmount(() => {
  syncVersion += 1
  removeActiveLayer()
})

async function syncLayer() {
  const map = context.map.value
  if (!map) return

  const layerKey = `${props.provider}:${props.theme}`
  if (activeLayer && activeLayerKey === layerKey) {
    if (props.provider === 'openstreetmap') {
      ;(activeLayer as L.TileLayer).setOpacity(props.opacity)
    }
    return
  }

  const currentVersion = ++syncVersion
  removeActiveLayer()

  let layer: L.Layer
  let usingFallback = false
  try {
    layer =
      props.provider === 'openfreemap'
        ? await createOpenFreeMapLayer(props.theme)
        : createOpenStreetMapLayer(props.theme)
  } catch {
    layer = createOpenStreetMapLayer(props.theme)
    usingFallback = props.provider === 'openfreemap'
  }

  if (currentVersion !== syncVersion || context.map.value !== map) {
    layer.remove()
    return
  }

  activeLayer = layer
  activeLayerKey = usingFallback ? `${layerKey}:fallback` : layerKey
  context.layerManager.value?.add(props.id, layer, {
    type: 'tile',
    name: `${props.provider}-${props.theme}`,
    opacity: props.opacity,
  })

  if (!usingFallback && props.provider === 'openfreemap') {
    bindOpenFreeMapErrorFallback(layer, props.theme)
  }
}

function createOpenStreetMapLayer(theme: MapTheme) {
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  return L.tileLayer(tileUrl, {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    opacity: props.opacity,
    className: `gis-tile-layer gis-tile-layer--${theme}`,
  })
}

async function createOpenFreeMapLayer(theme: MapTheme): Promise<L.Layer> {
  await ensureOpenFreeMapRuntime()

  const leafletWithMapLibre = L as typeof L & {
    maplibreGL?: (options: { style: string; interactive?: boolean }) => L.Layer
  }
  if (!leafletWithMapLibre.maplibreGL) {
    throw new Error('OpenFreeMap runtime was loaded, but the Leaflet adapter is unavailable.')
  }

  return leafletWithMapLibre.maplibreGL({
    style: openFreeMapStyles[theme],
    interactive: false,
  })
}

function bindOpenFreeMapErrorFallback(layer: L.Layer, theme: MapTheme) {
  const maplibreMap = (layer as OpenFreeMapLayer).getMaplibreMap?.()
  if (!maplibreMap) return

  maplibreMap.on('error', () => {
    if (activeLayer !== layer || !context.map.value) return

    context.map.value.removeLayer(layer)
    layer.remove()
    context.layerManager.value?.remove(props.id)

    const fallbackLayer = createOpenStreetMapLayer(theme)
    activeLayer = fallbackLayer
    activeLayerKey = `${props.provider}:${theme}:fallback`
    context.layerManager.value?.add(props.id, fallbackLayer, {
      type: 'tile',
      name: 'openstreetmap-fallback',
      opacity: props.opacity,
    })
  })
}

function removeActiveLayer() {
  if (activeLayer) {
    context.map.value?.removeLayer(activeLayer)
    activeLayer.remove()
  }
  context.layerManager.value?.remove(props.id)
  activeLayer = null
  activeLayerKey = ''
}

const openFreeMapStyles: Record<MapTheme, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  standard: 'https://tiles.openfreemap.org/styles/bright',
}

let openFreeMapRuntime: Promise<void> | null = null

function ensureOpenFreeMapRuntime() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('OpenFreeMap can only be loaded in a browser.'))
  }
  if (openFreeMapRuntime) return openFreeMapRuntime

  const browserWindow = window as typeof window & { maplibregl?: unknown }
  ;(browserWindow as typeof window & { L?: typeof L }).L = L

  openFreeMapRuntime = Promise.all([
    loadStyleSheet('https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css'),
    loadScript('https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js'),
  ])
    .then(() =>
      loadScript('https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js'),
    )
    .then(() => undefined)
    .catch(error => {
      openFreeMapRuntime = null
      throw error
    })

  return openFreeMapRuntime
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve()
      else {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        })
      }
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function loadStyleSheet(href: string) {
  return new Promise<void>(resolve => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve()
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
}
</script>

<template>
  <span aria-hidden="true" style="display: none"></span>
</template>

<style>
.gis-tile-layer--light {
  filter: saturate(0.72) brightness(1.08) contrast(0.9);
}
.gis-tile-layer--dark {
  filter: invert(0.88) hue-rotate(180deg) brightness(0.72) contrast(1.08) saturate(0.75);
}
</style>
