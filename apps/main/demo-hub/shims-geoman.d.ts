import 'leaflet'
declare module 'leaflet' {
  interface Polyline {
    pm: any
  }
}
