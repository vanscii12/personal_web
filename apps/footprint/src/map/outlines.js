import { INK } from './basemapTheme.js';

// Copies of the basemap's water and country borders, drawn above the fog so the shape of
// the world stays readable where nothing has been explored (there is nothing to explore on
// open water anyway). Water gets one cool gray, about as dark as fogged land, so coasts stay
// crisp without the sea looking explored. It is redrawn as a fill: outlining vector-tile
// polygons would also trace the edges where they are cut at tile boundaries. Layers are
// located by their source layer, so a basemap style without them is simply skipped.
export const OUTLINE_LAYER_IDS = ['footprint-water', 'footprint-borders'];
const FOGGED_WATER = '#B7C2C4';

export function addFogOutlines(map, beforeLayerId) {
  const layers = map.getStyle().layers;

  const water = layers.find((layer) => layer.type === 'fill' && layer['source-layer'] === 'water');
  if (water) {
    map.addLayer(
      {
        id: OUTLINE_LAYER_IDS[0],
        type: 'fill',
        source: water.source,
        'source-layer': water['source-layer'],
        ...(water.filter ? { filter: water.filter } : {}),
        paint: { 'fill-color': FOGGED_WATER }
      },
      beforeLayerId
    );
  }

  const borders = layers.find(
    (layer) => layer.type === 'line' && /country/.test(layer.id) && !/outline|casing/.test(layer.id)
  );
  if (borders) {
    map.addLayer(
      {
        id: OUTLINE_LAYER_IDS[1],
        type: 'line',
        source: borders.source,
        'source-layer': borders['source-layer'],
        ...(borders.filter ? { filter: borders.filter } : {}),
        paint: { 'line-color': INK.muted, 'line-width': 0.7, 'line-opacity': 0.4, 'line-dasharray': [2, 2] }
      },
      beforeLayerId
    );
  }
}
