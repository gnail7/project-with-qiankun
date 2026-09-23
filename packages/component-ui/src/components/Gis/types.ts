export interface Coordinate {
  lat: number
  lng: number
}

export type MapTheme = 'light' | 'dark' | 'standard'

export type MapProvider = 'openfreemap' | 'openstreetmap'

export interface GisMapProviderOption {
  key: MapProvider
  label: string
  description?: string
}

export interface GisMapThemeOption {
  key: MapTheme
  label: string
  description?: string
}

export type PolylineTheme = 'primary' | 'secondary' | 'danger'

export type MarkerVariant = 'default' | 'waypoint' | 'insertion' | 'ship'

export interface GisControlLayer {
  id: string
  label: string
  group?: string
  icon?: string
  description?: string
}

export type GisControlToolPanel = 'layers' | 'measure' | 'coordinate' | 'custom'

export interface GisControlTool {
  id: string
  label: string
  icon?: string
  type?: 'panel' | 'action'
  panel?: GisControlToolPanel
  action?: 'zoomIn' | 'zoomOut' | 'fullscreen' | 'custom'
  disabled?: boolean
  description?: string
}

export interface PolylineStyle {
  color?: string
  weight?: number
  opacity?: number
  dashArray?: string
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
}

export interface PolygonStyle extends PolylineStyle {
  fillColor?: string
  fillOpacity?: number
}

export interface GisLayerMeta {
  name?: string
  type: 'tile' | 'wms' | 'marker' | 'polyline' | 'polygon' | 'graticule' | 'timezone' | 'terminator'
  visible?: boolean
  opacity?: number
  zIndex?: number
}
