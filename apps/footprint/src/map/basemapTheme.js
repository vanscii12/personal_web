// Recolors the basemap to the DESIGN.md palette (linen paper, warm gray ink, sage parks).
// Layers are matched by type and source layer, so a style without some of them is fine.
export const INK = {
  bg: '#F0EBE3',
  surface: '#F7F3EE',
  fg: '#2C2C2C',
  fgSoft: '#55544E',
  muted: '#8A8378',
  sage: '#8B9A7B',
  sageInk: '#5E6E50',
  border: '#DDD6CC',
  grid: '#E4DED4'
};

export const WATER = '#D7DEDD';
const WATER_LINE = '#C8D2D1';
const WATER_LABEL = '#7E8C8B';
const ROAD = '#FBF8F3';
const TUNNEL = '#F4EFE8';
const BUILDING = '#E6E0D6';
const BUILDING_TOP = '#ECE6DD';
const PARK = 'rgba(139, 154, 123, 0.14)';
const RESIDENTIAL = 'rgba(221, 214, 204, 0.4)';

function lineColor(layer) {
  const id = layer.id;
  switch (layer['source-layer']) {
    case 'water':
      return WATER_LINE;
    case 'boundaries':
      if (id.includes('country_outline')) return INK.grid;
      if (id.includes('country')) return INK.muted;
      return '#D9CFC3';
    case 'roads':
    case 'landuse':
      if (id.includes('rail_dash')) return INK.surface;
      if (id.includes('rail')) return '#D6CFC4';
      if (id.includes('path')) return '#D9D2C7';
      if (id.includes('aeroway')) return INK.grid;
      if (id.includes('_case')) return /minor|service/.test(id) ? INK.grid : INK.border;
      if (id.includes('_fill')) return id.startsWith('tunnel') ? TUNNEL : ROAD;
      return null;
    default:
      return null;
  }
}

function textColor(layer) {
  const id = layer.id;
  switch (layer['source-layer']) {
    case 'water':
      return WATER_LABEL;
    case 'pois':
      return INK.sageInk;
    case 'places':
      return /city|capital|town/.test(id) ? INK.fgSoft : INK.muted;
    default:
      return INK.muted;
  }
}

export function applyBasemapTheme(map) {
  for (const layer of map.getStyle().layers) {
    const paint = (property, value) => {
      if (value !== null) map.setPaintProperty(layer.id, property, value);
    };
    const sourceLayer = layer['source-layer'];

    if (layer.type === 'background') paint('background-color', INK.bg);
    else if (layer.type === 'fill' && sourceLayer === 'water' && layer.id === 'water') paint('fill-color', WATER);
    else if (layer.type === 'fill' && sourceLayer === 'landuse') {
      paint('fill-color', layer.id.includes('residential') ? RESIDENTIAL : PARK);
    } else if (layer.type === 'fill' && sourceLayer === 'buildings') {
      paint('fill-color', layer.id.includes('top') ? BUILDING_TOP : BUILDING);
    } else if (layer.type === 'line') paint('line-color', lineColor(layer));
    else if (layer.type === 'symbol' && layer.layout?.['text-field'] !== undefined) {
      paint('text-color', textColor(layer));
      paint('text-halo-color', INK.bg);
    }
  }
}
