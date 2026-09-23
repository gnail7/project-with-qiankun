<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'

import { useGisMapContext } from './core/context'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    date?: Date | number | string
  }>(),
  {
    visible: true,
  },
)

const context = useGisMapContext()
let layerGroup: L.LayerGroup | null = null
let boundMap: L.Map | null = null
let refreshTimer: number | null = null

watch(
  () => context.map.value,
  map => {
    if (boundMap && boundMap !== map) detachMap(boundMap)
    if (map) attachMap(map)
  },
  { immediate: true },
)

watch(() => [props.visible, props.date], render)

onBeforeUnmount(() => {
  if (refreshTimer !== null) window.clearInterval(refreshTimer)
  if (boundMap) detachMap(boundMap)
})

function attachMap(map: L.Map) {
  if (boundMap === map) return
  boundMap = map
  layerGroup ??= L.layerGroup()
  render()
  refreshTimer = window.setInterval(render, 60_000)
}

function detachMap(map: L.Map) {
  if (refreshTimer !== null) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
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

  const solar = getSolarPosition(resolveDate(props.date))
  const points: L.LatLngExpression[] = []
  for (let longitude = -180; longitude <= 180; longitude += 2) {
    points.push([getTerminatorLatitude(longitude, solar.longitude, solar.declination), longitude])
  }

  layerGroup.addTo(map)
  layerGroup.addLayer(
    L.polyline(points, {
      color: '#f59e0b',
      weight: 2.5,
      opacity: 0.95,
      dashArray: '8 5',
      lineCap: 'round',
      interactive: false,
    }),
  )
  layerGroup.addLayer(
    L.circleMarker([solar.declination, solar.longitude], {
      radius: 5,
      color: '#fff7d6',
      weight: 2,
      fillColor: '#f59e0b',
      fillOpacity: 1,
      interactive: false,
    }).bindTooltip('太阳直射点', {
      direction: 'top',
      offset: [0, -5],
      permanent: false,
    }),
  )
}

function resolveDate(value?: Date | number | string) {
  if (value instanceof Date) return value
  if (typeof value === 'number' || typeof value === 'string') return new Date(value)
  return new Date()
}

function getSolarPosition(date: Date) {
  const julianDate = date.getTime() / 86_400_000 + 2_440_587.5
  const days = julianDate - 2_451_545
  const meanLongitude = normalizeDegrees(280.46 + 0.9856474 * days)
  const meanAnomaly = toRadians(357.528 + 0.9856003 * days)
  const eclipticLongitude =
    meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(meanAnomaly * 2)
  const obliquity = 23.439 - 0.0000004 * days
  const declination = toDegrees(
    Math.asin(Math.sin(toRadians(obliquity)) * Math.sin(toRadians(eclipticLongitude))),
  )
  const equationAngle = toRadians((360 / 365) * (days - 81))
  const equationOfTime =
    9.87 * Math.sin(2 * equationAngle) -
    7.53 * Math.cos(equationAngle) -
    1.5 * Math.sin(equationAngle)
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  const longitude = normalizeDegrees(180 - utcMinutes / 4 + equationOfTime / 4)

  return { declination, longitude }
}

function getTerminatorLatitude(longitude: number, solarLongitude: number, declination: number) {
  if (Math.abs(declination) < 0.25) return 0
  const hourAngle = toRadians(normalizeDegrees(longitude - solarLongitude))
  return toDegrees(Math.atan(-Math.cos(hourAngle) / Math.tan(toRadians(declination))))
}

function normalizeDegrees(value: number) {
  const shifted = (value + 180) % 360
  return ((shifted + 360) % 360) - 180
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI
}
</script>

<template>
  <span class="gis-layer-anchor" aria-hidden="true"></span>
</template>

<style scoped>
.gis-layer-anchor {
  display: none;
}
</style>
