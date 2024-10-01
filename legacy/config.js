var fmi = fmi || {}
fmi.config = fmi.config || {}

fmi.config.metoclient = {
  minZoom: 1,
  maxZoom: 10,
  center: [
    400000,
    6100000
  ],
  extent: [
    -500000,
    5800000,
    1500000,
    8300000
],
  smoothExtentConstraint: false,
  zoom: 2,
  target: 'map',
  projection: 'EPSG:3067',
  refreshInterval: 'PT15M',
  timeZone: 'Europe/Helsinki',
  transition: {
    delay: 500
  },
  tags: [
    'mouse wheel interactions',
    'fullscreen control',
    'fixed extent'
  ],
  locale: 'en-GB',
  sources: {
    osm: {
      type: 'OSM'
    },
    openwms: {
      type: 'raster',
      tiles: [
        'https://openwms.fmi.fi/geoserver/wms'
      ],
      bounds: [
        0,
        6300000,
        1000000,
        7800000
      ],
      tileSize: 256
    },
  },
  
  layers: [
    {
      id: 'basic-map',
      source: 'osm',
      visibility: 'visible',
      metadata: {
        type: 'base',
        title: 'OpenStreetMap'
      }
    },
    {
      id: 'dbz-wms',
      type: 'raster',
      source: 'openwms',
      metadata: {
        title: 'Rain radar',
        legendVisible: true
      },
      url: {
        service: 'WMS',
        layers: 'Radar:suomi_rr_eureffin',
        version: '1.3.0',
        request: 'GetMap',
        format: 'image/png',
        transparent: 'TRUE',
        crs: 'EPSG:3067',
        styles: '',
        width: '2048',
        height: '2048'
      },
      time: {
        range: 'every hour for 24 times history'
      }
    }
  ]
}