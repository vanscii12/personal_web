// Holds a copy of the decoded points; the app runs a small pool of these. Handles:
//   init   decode footprint.bin and build the track index
//   stats  totals for a point index range
//   place  visits within a radius of a location, for the hover tooltip
//   tile   render a fog:// or trail:// raster tile; queued so `cancel` can drop tiles
//          the map no longer needs
import { decodeFootprint, FLAG_LINKED } from '../shared/footprintFormat.js';
import {
  EARTH_CIRCUMFERENCE_METERS,
  haversineMeters,
  latToMercatorY,
  localDayIndex,
  lonToMercatorX
} from '../shared/geo.js';
import { parseTileUrl } from '../shared/tileStyle.js';
import { renderFogTile } from './fog.js';
import { buildTrackIndex, querySpans } from './tileIndex.js';
import { renderTrailTile } from './trails.js';

const TILE_SLICE_MS = 24;
const RENDERERS = { fog: renderFogTile, trail: renderTrailTile };

let state = null;
const tileQueue = [];
let drainScheduled = false;
let draining = false;

const handlers = {
  init({ buffer }) {
    const points = decodeFootprint(buffer);
    const { count, lon, lat, flags } = points;
    const mx = new Float64Array(count);
    const my = new Float64Array(count);
    const cumulativeMeters = new Float64Array(count);
    for (let i = 0; i < count; i += 1) {
      mx[i] = lonToMercatorX(lon[i]);
      my[i] = latToMercatorY(lat[i]);
      if (i > 0) {
        const step = flags[i] & FLAG_LINKED ? haversineMeters(lon[i - 1], lat[i - 1], lon[i], lat[i]) : 0;
        cumulativeMeters[i] = cumulativeMeters[i - 1] + step;
      }
    }
    state = { points, mx, my, cumulativeMeters, index: buildTrackIndex(mx, my, flags) };
    return { count };
  },

  stats({ i0, i1 }) {
    const { points, cumulativeMeters } = state;
    const { time, lon, flags } = points;
    const days = new Set();
    let tracks = 0;
    for (let i = i0; i < i1; i += 1) {
      days.add(localDayIndex(time[i], lon[i]));
      const startsTrack = i === i0 || !(flags[i] & FLAG_LINKED);
      if (startsTrack && i + 1 < i1 && flags[i + 1] & FLAG_LINKED) tracks += 1;
    }
    const meters = i1 - i0 > 1 ? cumulativeMeters[i1 - 1] - cumulativeMeters[i0] : 0;
    return { points: i1 - i0, days: days.size, distanceKm: meters / 1000, tracks };
  },

  place({ lon, lat, radiusMeters, i0, i1 }) {
    const { points, index, mx, my } = state;
    const x = lonToMercatorX(lon);
    const y = latToMercatorY(lat);
    const reach = radiusMeters / (EARTH_CIRCUMFERENCE_METERS * Math.cos((lat * Math.PI) / 180));
    const spans = querySpans(index, x - reach, y - reach, x + reach, y + reach, i0, i1);

    const days = new Set();
    let pointCount = 0;
    let passes = 0;
    let firstDay = Infinity;
    let lastDay = -Infinity;
    for (let k = 0; k < spans.length; k += 2) {
      let passed = false;
      for (let i = spans[k]; i < spans[k + 1]; i += 1) {
        if (Math.hypot(mx[i] - x, my[i] - y) > reach) continue;
        const day = localDayIndex(points.time[i], points.lon[i]);
        days.add(day);
        pointCount += 1;
        firstDay = Math.min(firstDay, day);
        lastDay = Math.max(lastDay, day);
        passed = true;
      }
      if (passed) passes += 1;
    }
    if (pointCount === 0) return null;
    return { days: days.size, points: pointCount, passes, firstDay, lastDay };
  }
};

function scheduleDrain() {
  if (drainScheduled || draining) return;
  drainScheduled = true;
  setTimeout(drainTileQueue, 0);
}

// Renders queued tiles in short slices so cancel messages for stale tiles get through.
async function drainTileQueue() {
  drainScheduled = false;
  draining = true;
  const deadline = performance.now() + TILE_SLICE_MS;
  while (tileQueue.length > 0 && performance.now() < deadline) {
    const { id, payload } = tileQueue.shift();
    try {
      const request = parseTileUrl(payload.url);
      const bitmap = await RENDERERS[request.kind](state.index, state, request);
      self.postMessage({ id, result: bitmap }, [bitmap]);
    } catch (error) {
      self.postMessage({ id, error: error.message });
    }
  }
  draining = false;
  if (tileQueue.length > 0) scheduleDrain();
}

self.onmessage = ({ data: message }) => {
  const { id, type, payload } = message;

  if (type === 'tile') {
    tileQueue.push(message);
    scheduleDrain();
    return;
  }
  if (type === 'cancel') {
    const queued = tileQueue.findIndex((item) => item.id === payload.id);
    if (queued >= 0) tileQueue.splice(queued, 1);
    return;
  }

  try {
    if (!state && type !== 'init') throw new Error('Footprint worker is not initialized');
    self.postMessage({ id, result: handlers[type](payload) });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
