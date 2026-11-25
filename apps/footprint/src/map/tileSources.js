import { addProtocol } from 'maplibre-gl';
import { FOG, TILE_SIZE, TRAILS } from '../shared/tileStyle.js';

export const FOG_LAYER_ID = 'footprint-fog';
export const TRAIL_LAYER_ID = 'footprint-trails';

let renderer = null;

// fog:// and trail:// tiles are drawn by the worker pool (see src/shared/tileStyle.js).
async function loadTile(params, abortController) {
  if (!renderer) throw new Error('Tile renderer is not attached');
  return { data: await renderer.tile(params.url, abortController.signal) };
}

addProtocol('fog', loadTile);
addProtocol('trail', loadTile);

export function attachTileRenderer(client) {
  renderer = client;
}

function addRasterOverlay(map, id, tilesUrl, maxzoom, paint = {}) {
  map.addSource(id, { type: 'raster', tiles: [tilesUrl], tileSize: TILE_SIZE, maxzoom });
  map.addLayer({ id, type: 'raster', source: id, paint: { 'raster-fade-duration': 100, ...paint } });
}

export function addFootprintLayers(map, { fogUrl, trailUrl }) {
  // Thinner fog when zoomed out, so continents still show through at world scale.
  addRasterOverlay(map, FOG_LAYER_ID, fogUrl, FOG.maxZoom, {
    'raster-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.72, 6, 1]
  });
  addRasterOverlay(map, TRAIL_LAYER_ID, trailUrl, TRAILS.maxZoom);
}

export function setOverlayTiles(map, id, url) {
  map.getSource(id)?.setTiles([url]);
}
