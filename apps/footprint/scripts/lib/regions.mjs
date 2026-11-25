// Assigns cleaned points to administrative units (see boundaries.mjs) and summarizes visits per
// unit and year for public/data/footprint/regions.json.
import { localDayIndex } from '../../src/shared/geo.js';

const GRID_DEGREES = 0.5; // candidate lookup grid
const MAX_GRID_CELLS = 400; // units spanning more cells are checked on every lookup instead
const CELL_DEGREES = 0.001; // points within one ~100 m cell share a lookup
// Points outside every unit but this close to one (degrees of latitude, ~5.5 km) join it:
// beaches, piers and reclaimed land that coarse coastlines leave out.
const SNAP_DEGREES = 0.05;
// Display simplification (degrees) and coordinate rounding per level.
const SIMPLIFY = [0.02, 0.005, 0.0015];
const DECIMALS = [3, 4, 4];

function polygonsOf(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function prepare(unit) {
  const polygons = polygonsOf(unit.geometry).map((rings) => {
    const flat = rings.map((ring) => Float64Array.from(ring.flat()));
    const outer = flat[0];
    let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
    for (let k = 0; k < outer.length; k += 2) {
      minX = Math.min(minX, outer[k]);
      maxX = Math.max(maxX, outer[k]);
      minY = Math.min(minY, outer[k + 1]);
      maxY = Math.max(maxY, outer[k + 1]);
    }
    return { rings: flat, bbox: [minX, minY, maxX, maxY] };
  });
  const bbox = polygons.reduce(
    (box, { bbox: [a, b, c, d] }) => [Math.min(box[0], a), Math.min(box[1], b), Math.max(box[2], c), Math.max(box[3], d)],
    [Infinity, Infinity, -Infinity, -Infinity]
  );
  return { polygons, bbox };
}

// Even-odd rule over every ring of every polygon (holes toggle back out).
export function containsPoint(prepared, x, y) {
  const [minX, minY, maxX, maxY] = prepared.bbox;
  if (x < minX || x > maxX || y < minY || y > maxY) return false;
  let inside = false;
  for (const { rings, bbox } of prepared.polygons) {
    if (x < bbox[0] || x > bbox[2] || y < bbox[1] || y > bbox[3]) continue;
    for (const ring of rings) {
      for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
        const yi = ring[i + 1];
        const yj = ring[j + 1];
        if (yi > y !== yj > y && x < ((ring[j] - ring[i]) * (y - yi)) / (yj - yi) + ring[i]) inside = !inside;
      }
    }
  }
  return inside;
}

// Squared distance from a point to a unit's boundary, with longitude scaled by cos(latitude)
// so the result is in degrees of latitude. Only polygons within `reach` are measured.
function sqDistanceToUnit(prepared, x, y, reach) {
  const scale = Math.cos((y * Math.PI) / 180);
  let best = Infinity;
  for (const { rings, bbox } of prepared.polygons) {
    if (x < bbox[0] - reach / scale || x > bbox[2] + reach / scale || y < bbox[1] - reach || y > bbox[3] + reach) continue;
    for (const ring of rings) {
      for (let i = 2; i < ring.length; i += 2) {
        const ax = ring[i - 2] * scale;
        const ay = ring[i - 1];
        const dx = ring[i] * scale - ax;
        const dy = ring[i + 1] - ay;
        const length = dx * dx + dy * dy;
        const t = length > 0 ? Math.max(0, Math.min(1, ((x * scale - ax) * dx + (y - ay) * dy) / length)) : 0;
        best = Math.min(best, (x * scale - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2);
      }
    }
  }
  return best;
}

function buildGrid(prepared, members) {
  const cells = new Map();
  const wide = [];
  for (const u of members) {
    const [minX, minY, maxX, maxY] = prepared[u].bbox;
    const [cx0, cy0] = [Math.floor(minX / GRID_DEGREES), Math.floor(minY / GRID_DEGREES)];
    const [cx1, cy1] = [Math.floor(maxX / GRID_DEGREES), Math.floor(maxY / GRID_DEGREES)];
    if ((cx1 - cx0 + 1) * (cy1 - cy0 + 1) > MAX_GRID_CELLS) {
      wide.push(u);
      continue;
    }
    for (let cx = cx0; cx <= cx1; cx += 1) {
      for (let cy = cy0; cy <= cy1; cy += 1) {
        const key = `${cx}:${cy}`;
        const list = cells.get(key);
        if (list) list.push(u);
        else cells.set(key, [u]);
      }
    }
  }
  // Candidate units whose grid cells touch the box around (x, y).
  return (x, y, reach = 0) => {
    const found = new Set(wide);
    for (let cx = Math.floor((x - reach) / GRID_DEGREES); cx <= Math.floor((x + reach) / GRID_DEGREES); cx += 1) {
      for (let cy = Math.floor((y - reach) / GRID_DEGREES); cy <= Math.floor((y + reach) / GRID_DEGREES); cy += 1) {
        for (const u of cells.get(`${cx}:${cy}`) ?? []) found.add(u);
      }
    }
    return found;
  };
}

// Points are matched against the finest units (cities, counties, and countries without
// subdivisions). Points that fall between them (coarse coastlines) try provinces/states, then
// the countries that have subdivisions.
export function buildRegionIndex(units) {
  const position = new Map(units.map((unit, i) => [unit.id, i]));
  const prepared = units.map(prepare);
  const parentOf = units.map((unit) => position.get(unit.parent) ?? -1);
  const hasChildren = new Set(units.map((unit) => unit.parent).filter(Boolean));
  const finest = [];
  const coarser = [];
  units.forEach((unit, i) => {
    if (unit.level === 2 || (unit.level === 0 && !hasChildren.has(unit.id))) finest.push(i);
    else coarser.push(i);
  });
  coarser.sort((a, b) => units[b].level - units[a].level);
  return { units, prepared, parentOf, finest: buildGrid(prepared, finest), coarser: buildGrid(prepared, coarser) };
}

function locate(index, x, y, hint) {
  if (hint >= 0 && containsPoint(index.prepared[hint], x, y)) return hint;
  for (const candidates of [index.finest(x, y), index.coarser(x, y)]) {
    for (const u of candidates) if (containsPoint(index.prepared[u], x, y)) return u;
  }

  const reach = SNAP_DEGREES / Math.cos((y * Math.PI) / 180);
  let nearest = -1;
  let nearestDistance = SNAP_DEGREES ** 2;
  for (const u of index.finest(x, y, reach)) {
    const distance = sqDistanceToUnit(index.prepared[u], x, y, SNAP_DEGREES);
    if (distance < nearestDistance) {
      nearest = u;
      nearestDistance = distance;
    }
  }
  return nearest;
}

// Unit index for every point (-1 when it lies outside every unit, e.g. offshore).
export function assignRegions(index, { lon, lat }) {
  const unitOf = new Int32Array(lon.length);
  const cache = new Map();
  let last = -1;
  for (let i = 0; i < lon.length; i += 1) {
    const key = (Math.floor(lon[i] / CELL_DEGREES) + 180000) * 200000 + Math.floor(lat[i] / CELL_DEGREES) + 90000;
    let unit = cache.get(key);
    if (unit === undefined) {
      unit = locate(index, lon[i], lat[i], last);
      cache.set(key, unit);
    }
    unitOf[i] = unit;
    if (unit >= 0) last = unit;
  }
  return unitOf;
}

function sqSegmentDistance([px, py], [ax, ay], [bx, by]) {
  let dx = bx - ax;
  let dy = by - ay;
  let x = ax;
  let y = ay;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = [bx, by];
    else if (t > 0) [x, y] = [ax + dx * t, ay + dy * t];
  }
  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
}

// Douglas-Peucker; keeps the ring closed.
export function simplifyRing(ring, tolerance) {
  if (ring.length <= 4) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  const limit = tolerance * tolerance;
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let farthest = -1;
    let farthestDistance = limit;
    for (let i = first + 1; i < last; i += 1) {
      const distance = sqSegmentDistance(ring[i], ring[first], ring[last]);
      if (distance > farthestDistance) {
        farthest = i;
        farthestDistance = distance;
      }
    }
    if (farthest > 0) {
      keep[farthest] = 1;
      stack.push([first, farthest], [farthest, last]);
    }
  }
  return ring.filter((_, i) => keep[i]);
}

function displayGeometry(geometry, level) {
  const factor = 10 ** DECIMALS[level];
  const round = ([x, y]) => [Math.round(x * factor) / factor, Math.round(y * factor) / factor];
  const polygons = [];
  for (const [outer, ...holes] of polygonsOf(geometry)) {
    const shell = simplifyRing(outer, SIMPLIFY[level]).map(round);
    if (shell.length < 4) continue; // islands smaller than the tolerance
    const kept = holes.map((ring) => simplifyRing(ring, SIMPLIFY[level]).map(round)).filter((ring) => ring.length >= 4);
    polygons.push([shell, ...kept]);
  }
  return { type: 'MultiPolygon', coordinates: polygons };
}

// Visited units with per-year [days, firstDay, lastDay, points] (days are local calendar days)
// and their simplified shapes, one FeatureCollection per level. Feature ids index `regions`.
export function summarizeRegions(index, { lon, time }, unitOf) {
  const visits = new Map();
  for (let i = 0; i < unitOf.length; i += 1) {
    if (unitOf[i] < 0) continue;
    const day = localDayIndex(time[i], lon[i]);
    const year = new Date(time[i] * 1000).getUTCFullYear();
    for (let u = unitOf[i]; u >= 0; u = index.parentOf[u]) {
      let entry = visits.get(u);
      if (!entry) visits.set(u, (entry = { years: new Map(), lastDay: -1 }));
      let stats = entry.years.get(year);
      if (!stats) entry.years.set(year, (stats = [0, day, day, 0]));
      stats[3] += 1;
      if (entry.lastDay !== day) {
        stats[0] += 1;
        entry.lastDay = day;
      }
      stats[1] = Math.min(stats[1], day);
      stats[2] = Math.max(stats[2], day);
    }
  }

  const visited = [...visits.keys()].sort(
    (a, b) => index.units[a].level - index.units[b].level || index.units[a].id.localeCompare(index.units[b].id)
  );
  const slot = new Map(visited.map((u, k) => [u, k]));
  const regions = visited.map((u) => {
    const unit = index.units[u];
    return {
      id: unit.id,
      name: unit.name,
      level: unit.level,
      parent: slot.get(index.parentOf[u]) ?? -1,
      years: Object.fromEntries(visits.get(u).years)
    };
  });
  const shapes = [0, 1, 2].map((level) => ({
    type: 'FeatureCollection',
    features: visited
      .filter((u) => index.units[u].level === level)
      .map((u) => ({
        type: 'Feature',
        id: slot.get(u),
        properties: {},
        geometry: displayGeometry(index.units[u].geometry, level)
      }))
  }));
  return { regions, shapes };
}
