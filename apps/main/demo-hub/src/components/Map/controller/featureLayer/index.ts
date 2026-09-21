import L from 'leaflet'

export interface AddGeoJsonLayerOptions {
  layerName: string
  isDuplicate?: boolean
  style?: L.PathOptions
}

const layerRegistry = new Map<string, L.GeoJSON>()

export function addGeoJsonLayer(options: AddGeoJsonLayerOptions, data: GeoJSON.Feature): L.GeoJSON {
  const { layerName, style } = options
  const layer = L.geoJSON(data, { style })
  layerRegistry.set(layerName, layer)
  return layer
}

export function getLayer(layerName: string) {
  return layerRegistry.get(layerName)
}

export function removeLayer(layerName: string, map: L.Map) {
  const layer = layerRegistry.get(layerName)
  if (layer) {
    map.removeLayer(layer)
    layerRegistry.delete(layerName)
  }
}
