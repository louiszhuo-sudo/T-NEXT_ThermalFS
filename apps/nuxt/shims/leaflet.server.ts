type LeafletMapStub = {
  _layersMaxZoom: number
  options: Record<string, unknown>
  on: (...args: unknown[]) => LeafletMapStub
  off: (...args: unknown[]) => LeafletMapStub
  remove: () => LeafletMapStub
  addLayer: (...args: unknown[]) => LeafletMapStub
  removeLayer: (...args: unknown[]) => LeafletMapStub
  addControl: (...args: unknown[]) => LeafletMapStub
  setZoom: (...args: unknown[]) => LeafletMapStub
  fitBounds: (...args: unknown[]) => LeafletMapStub
  getBounds: () => { equals: (...args: unknown[]) => boolean }
  getCenter: () => { lat: number; lng: number }
  panTo: (...args: unknown[]) => LeafletMapStub
  getZoom: () => number
  setView: (...args: unknown[]) => LeafletMapStub
  createPane: (...args: unknown[]) => { style: Record<string, unknown> }
  invalidateSize: (...args: unknown[]) => LeafletMapStub
}

const makeChainable = () => {
  const fn = () => makeChainable()
  return new Proxy(fn, {
    get: (_target, key) => {
      if (key === 'style') return {}
      if (key === 'extend') {
        return () =>
          class {
            addTo() {
              return this
            }
            on() {
              return this
            }
            off() {
              return this
            }
            remove() {
              return this
            }
          }
      }
      return makeChainable()
    },
    apply: () => makeChainable(),
  })
}

const makeMap = (): LeafletMapStub => {
  const bounds = { equals: () => false }
  const center = { lat: 0, lng: 0 }
  const pane = { style: {} }
  const map: LeafletMapStub = {
    _layersMaxZoom: 0,
    options: {},
    on: () => map,
    off: () => map,
    remove: () => map,
    addLayer: () => map,
    removeLayer: () => map,
    addControl: () => map,
    setZoom: () => map,
    fitBounds: () => map,
    getBounds: () => bounds,
    getCenter: () => center,
    panTo: () => map,
    getZoom: () => 0,
    setView: () => map,
    createPane: () => pane,
    invalidateSize: () => map,
  }
  return map
}

export const CRS = { Simple: {} }
export const Icon = { Default: { mergeOptions: () => undefined } }
export const Control = { extend: () => class {} }
export const GridLayer = { extend: () => class {} }
export const DomEvent = {
  disableClickPropagation: () => undefined,
  disableScrollPropagation: () => undefined,
}
export const DomUtil = makeChainable()
export const Util = makeChainable()
export const latLng = (lat = 0, lng = 0) => ({
  lat: typeof lat === 'object' && lat !== null ? Number((lat as { lat?: number }).lat ?? 0) : Number(lat),
  lng: typeof lat === 'object' && lat !== null ? Number((lat as { lng?: number }).lng ?? 0) : Number(lng),
})
export const latLngBounds = (..._args: unknown[]) => ({ equals: () => false })
export const stamp = () => 0
export const map = () => makeMap()
export const circle = () => makeChainable()
export const circleMarker = () => makeChainable()
export const control = makeChainable()
export const featureGroup = () => makeChainable()
export const geoJSON = () => makeChainable()
export const imageOverlay = () => makeChainable()
export const layerGroup = () => makeChainable()
export const marker = () => makeChainable()
export const polygon = () => makeChainable()
export const polyline = () => makeChainable()
export const popup = () => makeChainable()
export const rectangle = () => makeChainable()
export const tileLayer = () => makeChainable()
export const tooltip = () => makeChainable()
export const videoOverlay = () => makeChainable()
export const divIcon = () => makeChainable()
export const icon = () => makeChainable()

const leafletDefault = {
  CRS,
  Icon,
  Control,
  GridLayer,
  DomEvent,
  DomUtil,
  Util,
  latLng,
  latLngBounds,
  stamp,
  map,
  circle,
  circleMarker,
  control,
  featureGroup,
  geoJSON,
  imageOverlay,
  layerGroup,
  marker,
  polygon,
  polyline,
  popup,
  rectangle,
  tileLayer,
  tooltip,
  videoOverlay,
  divIcon,
  icon,
}

export default leafletDefault
