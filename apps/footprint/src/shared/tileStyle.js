// Both overlays are raster tiles drawn by the footprint workers. Tile URLs have the form
//   {kind}://{param}/{i0}/{i1}/{z}/{x}/{y}
// where [i0, i1) is the point index range (the selected years) and param is the fog radius
// in meters (0 for trails). Everything that changes the image is in the URL, so MapLibre's
// tile cache stays correct and setTiles() with a new URL is the invalidation.

export const TILE_SIZE = 512;

// Colors follow DESIGN.md. Unexplored land sits under a warm-gray veil darker than the paper,
// so explored areas read as lit; their edges get a soft linen highlight. Trails run through
// the warm data colors (ochre #a97a10 → terracotta #c2603a → brick #b8423f → deep brown),
// lightness and hue both moving, so frequent routes stand out from one-off ones.
export const FOG = {
  imageSize: 256, // half resolution: MapLibre's linear filtering softens the edges for free
  maxZoom: 14,
  pad: 32,
  defaultRadiusMeters: 500,
  fogColor: 'rgba(96, 88, 76, 0.42)',
  glowColor: 'rgba(247, 243, 238, 0.5)',
  // in image pixels; ratios are relative to the cleared stroke width
  minWidthPx: 1,
  clearBlurRatio: 0.15,
  maxClearBlurPx: 5,
  glowWidthRatio: 1,
  glowExtraPx: 3,
  glowBlurRatio: 0.06,
  minGlowBlurPx: 1,
  maxGlowBlurPx: 2.5
};

// Every pass along a route darkens it. Pixel color follows
// t = log(1 + passes) / log(1 + saturationPasses) through the ramp below.
export const TRAILS = {
  imageSize: 512,
  maxZoom: 16,
  pad: 32,
  saturationPasses: 80,
  bloomStrength: 0,
  ramp: [
    [0, [201, 150, 70, 0]],
    [0.06, [214, 170, 100, 50]],
    [0.16, [196, 145, 60, 160]],
    [0.35, [169, 122, 16, 220]],
    [0.55, [194, 96, 58, 242]],
    [0.78, [184, 66, 63, 252]],
    [1, [110, 38, 36, 255]]
  ]
};

export const LEGEND_PASSES = [1, 5, 20, TRAILS.saturationPasses];

// CSS color of a trail after `passes` passes, for the legend.
export function trailColorCss(passes) {
  const t = Math.min(1, Math.log1p(passes) / Math.log1p(TRAILS.saturationPasses));
  let s = 1;
  while (s < TRAILS.ramp.length - 1 && TRAILS.ramp[s][0] < t) s += 1;
  const [t0, c0] = TRAILS.ramp[s - 1];
  const [t1, c1] = TRAILS.ramp[s];
  const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const [r, g, b, a] = c0.map((value, channel) => Math.round(value + (c1[channel] - value) * f));
  return `rgb(${r} ${g} ${b} / ${(a / 255).toFixed(2)})`;
}

export function fogTileUrl(radiusMeters, { i0, i1 }) {
  return `fog://${Math.round(radiusMeters)}/${i0}/${i1}/{z}/{x}/{y}`;
}

export function trailTileUrl({ i0, i1 }) {
  return `trail://0/${i0}/${i1}/{z}/{x}/{y}`;
}

export function parseTileUrl(url) {
  const [kind, rest] = url.split('://');
  const [param, i0, i1, z, x, y] = rest.split('/').map(Number);
  return { kind, param, i0, i1, z, x, y };
}
