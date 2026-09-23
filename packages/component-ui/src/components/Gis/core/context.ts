import type { InjectionKey, ShallowRef } from 'vue'
import { inject } from 'vue'
import type L from 'leaflet'

import type { LayerManager } from './LayerManager'

export interface GisMapContext {
  map: ShallowRef<L.Map | null>
  layerManager: ShallowRef<LayerManager | null>
}

export const GIS_MAP_CONTEXT: InjectionKey<GisMapContext> = Symbol('gis-map-context')

export function useGisMapContext() {
  const context = inject(GIS_MAP_CONTEXT)
  if (!context) {
    throw new Error('GIS components must be used inside <GisMap>.')
  }
  return context
}
