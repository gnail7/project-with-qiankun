export interface Waypoint {
  id: string
  name: string
  lon: number
  lat: number
  date?: string
  isMajor?: boolean
  memo?: string
  routeType?: string
  speed?: number
  foRate?: number
  doRate?: number
  stopTime?: number
  lngRate?: number
  lpgRate?: number
  nh3Rate?: number
  methanolRate?: number
  otherRate?: number
}

export interface MockRoute {
  routeId: string
  waypoints: Waypoint[]
}

export const mockRoute: MockRoute = {
  routeId: 'R001',
  waypoints: [
    {
      id: 'wp-001',
      name: '起点',
      lon: 120.0,
      lat: 30.0,
      speed: 12,
      memo: '起点',
      routeType: 'RL',
      isMajor: true,
    },
    {
      id: 'wp-002',
      name: '途经 1',
      lon: 122.0,
      lat: 31.0,
      speed: 14,
      memo: '途经1',
      routeType: 'RL',
    },
    {
      id: 'wp-003',
      name: '途经 2',
      lon: 124.0,
      lat: 32.0,
      speed: 15,
      memo: '途经2',
      routeType: 'RL',
    },
    {
      id: 'wp-004',
      name: '终点',
      lon: 126.0,
      lat: 33.0,
      speed: 16,
      memo: '终点',
      routeType: 'RL',
      isMajor: true,
    },
  ],
}

// 模拟 dealRow：waypoint -> 坐标数组（和你项目字段顺序一致）
export function dealRow(row: MockRoute): any[][] {
  return row.waypoints.map(w => [
    w.lon,
    w.lat,
    1,
    w.date ?? '',
    w.isMajor ?? false,
    w.memo ?? '',
    w.routeType ?? 'RL',
    w.speed ?? 0,
    w.foRate ?? 0,
    w.doRate ?? 0,
    w.stopTime ?? 0,
    w.lngRate ?? 0,
    w.lpgRate ?? 0,
    w.nh3Rate ?? 0,
    w.methanolRate ?? 0,
    w.otherRate ?? 0,
  ])
}

// 模拟 formatArrayToGeoJSON
export function formatArrayToGeoJSON(type: 'LineString', coords: any[][]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type,
      coordinates: coords.map(c => [c[0], c[1]]),
    },
  }
}

// 模拟后端接口 updateLinkOrder
export function updateLinkOrder(routeId: string, lines: any[][]): Promise<void> {
  console.log('[MOCK] POST /navigation/orderRoutes/updateLinkOrder', { routeId, lines })
  return new Promise(resolve => setTimeout(resolve, 300))
}
