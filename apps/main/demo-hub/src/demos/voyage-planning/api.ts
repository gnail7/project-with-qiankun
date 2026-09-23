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
  name: string
  description?: string
  waypoints: Waypoint[]
}

export const mockRoute: MockRoute = {
  routeId: 'R001',
  name: '东亚近海航线',
  description: '上海 → 釜山 → 东京',
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

export const mockRoutes: MockRoute[] = [
  mockRoute,
  {
    routeId: 'R002',
    name: '东南亚航线',
    description: '新加坡 → 马六甲 → 巴生港',
    waypoints: [
      {
        id: 'wp-101',
        name: '新加坡港',
        lon: 103.82,
        lat: 1.27,
        speed: 11,
        memo: '起点',
        routeType: 'RL',
        isMajor: true,
      },
      {
        id: 'wp-102',
        name: '马六甲海峡',
        lon: 101.85,
        lat: 2.35,
        speed: 13,
        memo: '狭水道航行',
        routeType: 'RL',
      },
      {
        id: 'wp-103',
        name: '巴生港',
        lon: 101.39,
        lat: 3.0,
        speed: 12,
        memo: '终点',
        routeType: 'RL',
        isMajor: true,
      },
    ],
  },
  {
    routeId: 'R003',
    name: '南中国海航线',
    description: '厦门 → 马尼拉 → 新加坡',
    waypoints: [
      {
        id: 'wp-201',
        name: '厦门',
        lon: 118.08,
        lat: 24.48,
        speed: 15,
        memo: '起点',
        routeType: 'RL',
        isMajor: true,
      },
      {
        id: 'wp-202',
        name: '马尼拉',
        lon: 120.98,
        lat: 14.6,
        speed: 16,
        memo: '中转港',
        routeType: 'RL',
      },
      {
        id: 'wp-203',
        name: '南海中转点',
        lon: 114.5,
        lat: 8.5,
        speed: 16,
        memo: '远洋航段',
        routeType: 'RL',
      },
      {
        id: 'wp-204',
        name: '新加坡',
        lon: 103.82,
        lat: 1.27,
        speed: 14,
        memo: '终点',
        routeType: 'RL',
        isMajor: true,
      },
    ],
  },
]

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
