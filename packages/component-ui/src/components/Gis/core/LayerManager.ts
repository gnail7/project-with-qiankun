import type { Layer, Map as LeafletMap } from 'leaflet'

import type { GisLayerMeta } from '../types'

interface ManagedLayer {
  layer: Layer
  meta: GisLayerMeta
}

export class LayerManager {
  private readonly layers = new Map<string, ManagedLayer>()

  private readonly map: LeafletMap

  constructor(map: LeafletMap) {
    this.map = map
  }

  add(id: string, layer: Layer, meta: GisLayerMeta) {
    this.remove(id)
    const managedLayer = { layer, meta }
    this.layers.set(id, managedLayer)

    if (meta.visible !== false) {
      layer.addTo(this.map)
    }
    this.applyLayerOptions(managedLayer)
    return layer
  }

  remove(id: string) {
    const managedLayer = this.layers.get(id)
    if (!managedLayer) return
    this.map.removeLayer(managedLayer.layer)
    this.layers.delete(id)
  }

  show(id: string) {
    const managedLayer = this.layers.get(id)
    if (!managedLayer) return
    managedLayer.meta.visible = true
    managedLayer.layer.addTo(this.map)
  }

  hide(id: string) {
    const managedLayer = this.layers.get(id)
    if (!managedLayer) return
    managedLayer.meta.visible = false
    this.map.removeLayer(managedLayer.layer)
  }

  setOpacity(id: string, opacity: number) {
    const managedLayer = this.layers.get(id)
    if (!managedLayer) return
    managedLayer.meta.opacity = opacity
    this.applyLayerOptions(managedLayer)
  }

  setZIndex(id: string, zIndex: number) {
    const managedLayer = this.layers.get(id)
    if (!managedLayer) return
    managedLayer.meta.zIndex = zIndex
    this.applyLayerOptions(managedLayer)
  }

  get(id: string) {
    return this.layers.get(id)?.layer
  }

  clear() {
    for (const id of [...this.layers.keys()]) this.remove(id)
  }

  private applyLayerOptions({ layer, meta }: ManagedLayer) {
    const opacityLayer = layer as Layer & { setOpacity?: (opacity: number) => void }
    const zIndexLayer = layer as Layer & { setZIndex?: (zIndex: number) => void }
    if (meta.opacity != null) opacityLayer.setOpacity?.(meta.opacity)
    if (meta.zIndex != null) zIndexLayer.setZIndex?.(meta.zIndex)
  }
}
