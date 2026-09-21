import L from 'leaflet'
import type { Feature, LineString } from 'geojson'

const PM_EDIT_OPTIONS = {
  draggable: true,
  allowEditing: true,
  allowRemoval: true,
  allowCutting: true,
  snappable: false,
}

export class EditLayerManager {
  private map: L.Map
  private layer: L.GeoJSON | null = null
  private polyline: L.Polyline | null = null
  private coordinates: any[][] = [] // 业务坐标（含属性）

  constructor(map: L.Map) {
    this.map = map
  }

  /** 加载 GeoJSON 图层并开启编辑 */
  load(geojson: Feature<LineString>, coordinates: any[][]) {
    this.coordinates = coordinates

    this.layer = L.geoJSON(geojson, {
      style: { color: '#1677ff', weight: 3 },
    }).addTo(this.map)

    this.layer.eachLayer(l => {
      if (l instanceof L.Polyline) this.polyline = l
    })

    this.activateEditMode()
  }

  /** 开启 Geoman 编辑 */
  activateEditMode() {
    if (!this.polyline) return
    this.polyline.pm.enable(PM_EDIT_OPTIONS)
  }

  /** 关闭编辑 */
  deactivateEditMode() {
    this.polyline?.pm.disable()
  }

  /** 绑定拖拽结束 -> 写回坐标 */
  onMarkerDragEnd(cb: (index: number, latlng: L.LatLng) => void) {
    this.polyline?.on('pm:markerdragend', (e: any) => {
      const idx = e.index
      const latlng = e.markerEvent.latlng
      this.commitEditGeometry(idx, latlng)
      cb(idx, latlng)
    })
  }

  /** 点击顶点 */
  onVertexClick(cb: (index: number) => void) {
    this.polyline?.on('pm:vertexclick', (e: any) => {
      if (e.index != null) cb(e.index)
    })
  }

  /** 拖拽后写回 GeoJSON */
  private commitEditGeometry(index: number, latlng: L.LatLng) {
    if (!this.coordinates[index]) return
    this.coordinates[index][0] = latlng.lng
    this.coordinates[index][1] = latlng.lat
  }

  /** 读取业务坐标 */
  getCoordinates() {
    return this.coordinates
  }

  /** 读取 Leaflet 当前点 */
  getLatLngs(): L.LatLng[] {
    if (!this.polyline) return []
    const latlngs = this.polyline.getLatLngs()
    return latlngs as L.LatLng[]
  }

  /** 弹窗保存后：写回地图并重新激活 */
  setCoordinates(
    index: number,
    patch: Partial<{
      lng: number
      lat: number
      speed: number
      memo: string
    }>,
  ) {
    const pt = this.coordinates[index]
    if (!pt) return

    if (patch.lng != null) pt[0] = patch.lng
    if (patch.lat != null) pt[1] = patch.lat
    if (patch.speed != null) pt[7] = patch.speed
    if (patch.memo != null) pt[5] = patch.memo

    // 同步到 Leaflet
    if (this.polyline) {
      this.deactivateEditMode()
      const latlngs = this.getLatLngs()
      latlngs[index] = L.latLng(pt[1], pt[0])
      this.polyline.setLatLngs(latlngs)
      this.activateEditMode()
    }
  }
}
