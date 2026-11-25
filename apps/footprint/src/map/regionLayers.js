import { INK } from './basemapTheme.js';

// Visited regions are "lit": a pale fill that lifts the fog, and a sage outline. Each level
// has its own source and shows over its own zoom band, crossfading into the next. Up close
// the fill fades out so it does not wash out the fog around individual streets. Whether a
// region counts as visited in the selected years is feature state, so changing years never
// re-tiles the geometry.
const LEVELS = [
  { name: 'country', fadeOut: [3.5, 4.5], lineWidth: 1.4 },
  { name: 'province', fadeIn: [3.5, 4.5], fadeOut: [6, 7], lineWidth: 1.1 },
  { name: 'city', fadeIn: [6, 7], fillFadeOut: [9, 10.5], lineWidth: 0.8 }
];
const LIT_COLOR = INK.surface;
const MIN_FILL = 0.3; // least visited region in a level
const MAX_FILL = 0.55; // most visited region in a level

const sourceId = (level) => `footprint-regions-${LEVELS[level].name}`;
const fillLayerId = (level) => `${sourceId(level)}-fill`;
const lineLayerId = (level) => `${sourceId(level)}-line`;
export const REGION_LAYER_IDS = LEVELS.flatMap((_, level) => [fillLayerId(level), lineLayerId(level)]);

// Zoom-faded value: `value` inside the band, 0 outside.
function faded({ fadeIn, fadeOut }, value) {
  const stops = [];
  if (fadeIn) stops.push(fadeIn[0], 0, fadeIn[1], value);
  if (fadeOut) stops.push(fadeOut[0], value, fadeOut[1], 0);
  return ['interpolate', ['linear'], ['zoom'], ...stops];
}

const tone = ['coalesce', ['feature-state', 'tone'], -1];
const hovered = ['boolean', ['feature-state', 'hover'], false];
const lit = (value) => ['case', ['<', tone, 0], 0, value];

// Adds the layers for regions.json ({ regions, shapes }) and returns handles to update them.
export function addRegionLayers(map, { regions, shapes }, beforeLayerId) {
  // Countries without subdivisions are drawn again with the provinces and with the cities,
  // so they stay lit when zoomed in.
  const parents = new Set(regions.map((region) => region.parent));
  const leafCountries = shapes[0].features.filter((feature) => !parents.has(feature.id));
  const levelsOf = regions.map((region, i) => (region.level === 0 && !parents.has(i) ? [0, 1, 2] : [region.level]));

  LEVELS.forEach(({ fadeIn, fadeOut, fillFadeOut, lineWidth }, level) => {
    const features = level === 0 ? shapes[0].features : [...shapes[level].features, ...leafCountries];
    const minzoom = fadeIn ? fadeIn[0] : 0;
    const maxzoom = fadeOut ? fadeOut[1] : 24;
    map.addSource(sourceId(level), { type: 'geojson', data: { type: 'FeatureCollection', features }, tolerance: 0.2 });
    map.addLayer(
      {
        id: fillLayerId(level),
        type: 'fill',
        source: sourceId(level),
        minzoom,
        maxzoom,
        paint: {
          'fill-color': LIT_COLOR,
          'fill-opacity': faded(
            { fadeIn, fadeOut: fillFadeOut ?? fadeOut },
            lit(['+', MIN_FILL, ['*', MAX_FILL - MIN_FILL, tone], ['case', hovered, 0.1, 0]])
          )
        }
      },
      beforeLayerId
    );
    map.addLayer(
      {
        id: lineLayerId(level),
        type: 'line',
        source: sourceId(level),
        minzoom,
        maxzoom,
        paint: {
          'line-color': ['case', hovered, INK.sageInk, INK.sage],
          'line-width': ['case', hovered, lineWidth + 0.8, lineWidth],
          'line-opacity': faded({ fadeIn, fadeOut }, lit(0.9))
        }
      },
      beforeLayerId
    );
  });

  const setState = (i, state) => {
    for (const level of levelsOf[i]) map.setFeatureState({ source: sourceId(level), id: i }, state);
  };

  return {
    // tone in [0, 1]: log of days relative to the most visited region of the same level; -1 hides.
    update(visits) {
      const maxDays = [0, 0, 0];
      regions.forEach((region, i) => {
        if (visits[i]) maxDays[region.level] = Math.max(maxDays[region.level], visits[i].days);
      });
      regions.forEach((region, i) => {
        const top = maxDays[region.level];
        const value = !visits[i] ? -1 : top > 1 ? Math.log1p(visits[i].days) / Math.log1p(top) : 1;
        setState(i, { tone: value });
      });
    },

    hover(previous, next) {
      if (previous !== null) setState(previous, { hover: false });
      if (next !== null) setState(next, { hover: true });
    },

    // The most detailed visited region drawn under a screen point, or null.
    at(point, visits) {
      const layers = LEVELS.map((_, level) => fillLayerId(level));
      let best = null;
      for (const feature of map.queryRenderedFeatures(point, { layers })) {
        if (!visits[feature.id]) continue;
        const level = regions[feature.id].level;
        if (best === null || level > regions[best].level) best = feature.id;
      }
      return best;
    }
  };
}
