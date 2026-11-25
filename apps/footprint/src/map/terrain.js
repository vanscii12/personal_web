import { INK } from './basemapTheme.js';

// 3D relief: terrain mesh plus a hillshade drawn above the fog, so mountains stay readable
// in unexplored areas (like pencil shading on paper), and a linen sky for pitched views.
const DEM_TILES =
  import.meta.env.VITE_TERRAIN_DEM_TILES ?? 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const DEM_ATTRIBUTION = '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Terrain Tiles</a>';

const TERRAIN_SOURCE_ID = 'footprint-terrain-dem';
const HILLSHADE_SOURCE_ID = 'footprint-hillshade-dem';
export const HILLSHADE_LAYER_ID = 'footprint-hillshade';
const EXAGGERATION = 1.4;
// Below this zoom the DEM's ocean-floor relief outweighs the land and reads as noise.
const HILLSHADE_MIN_ZOOM = 5;

export function addTerrainLayers(map, beforeLayerId) {
  const dem = {
    type: 'raster-dem',
    tiles: [DEM_TILES],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 15,
    attribution: DEM_ATTRIBUTION
  };
  map.addSource(TERRAIN_SOURCE_ID, dem);
  map.addSource(HILLSHADE_SOURCE_ID, dem);
  map.addLayer(
    {
      id: HILLSHADE_LAYER_ID,
      type: 'hillshade',
      source: HILLSHADE_SOURCE_ID,
      minzoom: HILLSHADE_MIN_ZOOM,
      layout: { visibility: 'none' },
      paint: {
        'hillshade-method': 'combined',
        'hillshade-exaggeration': 0.5,
        'hillshade-illumination-direction': 315,
        'hillshade-shadow-color': 'rgba(44, 44, 44, 0.22)',
        'hillshade-highlight-color': 'rgba(255, 255, 255, 0.35)',
        'hillshade-accent-color': 'rgba(44, 44, 44, 0.06)'
      }
    },
    beforeLayerId
  );
  map.setSky({
    'sky-color': INK.bg,
    'horizon-color': INK.surface,
    'fog-color': INK.bg,
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.6,
    'atmosphere-blend': 0
  });
}

export function setTerrainEnabled(map, enabled) {
  map.setTerrain(enabled ? { source: TERRAIN_SOURCE_ID, exaggeration: EXAGGERATION } : null);
  map.setLayoutProperty(HILLSHADE_LAYER_ID, 'visibility', enabled ? 'visible' : 'none');
}
