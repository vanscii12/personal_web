import { FLAG_LINKED } from '../../src/shared/footprintFormat.js';
import { haversineMeters, localDayIndex, minimalLongitudeSpan } from '../../src/shared/geo.js';

export const DEFAULT_RULES = Object.freeze({
  maxAccuracyMeters: 200, // coarser fixes are cell-tower guesses

  // Flights. Seeds are fixes no ground vehicle produces. A run of fast fixes holding enough
  // seeds is a flight and goes as a whole, including approach, holding loops and runway roll.
  flightSeedSpeedKmh: 400, // faster than any train
  flightSeedAltitudeMeters: 6000, // cruising altitude
  flightHighAltitudeMeters: 4500, // above the highest railways...
  flightHighSpeedKmh: 216, // ...while moving this fast
  flightMinSeeds: 3,
  flightFastKmh: 108, // a flight continues over fixes faster than this
  flightBridgeSeconds: 45, // slower readings with fast fixes this close on both sides stay in it
  flightGapSeconds: 180,

  altitudeJumpMeters: 500,
  altitudeJumpSeconds: 10,
  glitchSpeedMps: 110, // a fix reached and left faster than this is a GPS jump

  // Joining consecutive fixes into tracks. Short steps always join. Longer ones only join
  // GPS-quality fixes whose reported speed matches the straight-line speed: a chord across a
  // bend is shorter than the road, and coarse fixes wander off it.
  linkMaxGapSeconds: 300,
  linkMaxSpeedMps: 110,
  linkFreeMeters: 250,
  linkMaxAccuracyMeters: 65,
  linkStraightness: [0.85, 1.25]
});

const HOME_CELL_DEGREES = 0.01;

function isValidFix(time, lon, lat) {
  return (
    Number.isFinite(time) &&
    time > 0 &&
    time < 2 ** 32 &&
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    Math.abs(lon) <= 180 &&
    Math.abs(lat) <= 90 &&
    !(lon === 0 && lat === 0)
  );
}

// Marks the fixes (positions in `order`, which is time-sorted) taken on a plane.
function flightFixes(order, { time, lon, lat, speed, altitude }, rules) {
  const n = order.length;
  const fastSpeed = rules.flightFastKmh / 3.6;
  const fast = new Uint8Array(n);
  const seed = new Uint8Array(n);
  for (let k = 0; k < n; k += 1) {
    const i = order[k];
    let movingSpeed = speed[i];
    if (!(movingSpeed >= 0)) {
      const prev = order[k - 1];
      const seconds = prev === undefined ? 0 : time[i] - time[prev];
      movingSpeed =
        seconds > 0 && seconds <= rules.flightGapSeconds
          ? haversineMeters(lon[prev], lat[prev], lon[i], lat[i]) / seconds
          : 0;
    }
    fast[k] = movingSpeed > fastSpeed ? 1 : 0;
    const kmh = speed[i] * 3.6;
    seed[k] =
      kmh > rules.flightSeedSpeedKmh ||
      altitude[i] > rules.flightSeedAltitudeMeters ||
      (altitude[i] > rules.flightHighAltitudeMeters && kmh > rules.flightHighSpeedKmh)
        ? 1
        : 0;
  }

  // A stray slow reading inside a fast stretch would otherwise split one flight in two.
  const moving = Uint8Array.from(fast);
  const nextFastTime = new Float64Array(n);
  let upcoming = Infinity;
  for (let k = n - 1; k >= 0; k -= 1) {
    if (fast[k]) upcoming = time[order[k]];
    nextFastTime[k] = upcoming;
  }
  let lastFastTime = -Infinity;
  for (let k = 0; k < n; k += 1) {
    const t = time[order[k]];
    if (fast[k]) lastFastTime = t;
    else if (t - lastFastTime <= rules.flightBridgeSeconds && nextFastTime[k] - t <= rules.flightBridgeSeconds) {
      moving[k] = 1;
    }
  }

  const flight = new Uint8Array(n);
  for (let k = 0; k < n; ) {
    if (!moving[k]) {
      k += 1;
      continue;
    }
    let end = k + 1;
    let seeds = seed[k];
    while (end < n && moving[end] && time[order[end]] - time[order[end - 1]] <= rules.flightGapSeconds) {
      seeds += seed[end];
      end += 1;
    }
    if (seeds >= rules.flightMinSeeds) flight.fill(1, k, end);
    k = end;
  }
  // Seeds outside any flight are airborne fixes or GPS errors; neither belongs on the ground.
  for (let k = 0; k < n; k += 1) if (seed[k]) flight[k] = 1;
  return flight;
}

// Cleans raw columnar fixes (see parseFootprintCsv) and returns time-sorted points with
// FLAG_LINKED set where a point continues the track of the one before it.
export function cleanPoints(raw, rules = DEFAULT_RULES) {
  const { time, lon, lat, accuracy, speed, altitude } = raw;
  const rejected = { invalid: 0, inaccurate: 0, flight: 0, duplicate: 0, altitudeJump: 0, glitch: 0 };

  const candidates = [];
  for (let i = 0; i < time.length; i += 1) {
    if (!isValidFix(time[i], lon[i], lat[i])) rejected.invalid += 1;
    else if (accuracy[i] > rules.maxAccuracyMeters) rejected.inaccurate += 1;
    else candidates.push(i);
  }
  candidates.sort((a, b) => time[a] - time[b] || a - b);

  const speedBetween = (a, b) => {
    const meters = haversineMeters(lon[a], lat[a], lon[b], lat[b]);
    const seconds = time[b] - time[a];
    if (seconds > 0) return meters / seconds;
    return meters > 0 ? Infinity : 0;
  };

  const unique = [];
  for (const i of candidates) {
    const prev = unique.at(-1);
    if (prev !== undefined && time[i] === time[prev] && lon[i] === lon[prev] && lat[i] === lat[prev]) {
      rejected.duplicate += 1;
      continue;
    }
    unique.push(i);
  }

  const flight = flightFixes(unique, raw, rules);
  const ordered = [];
  for (let k = 0; k < unique.length; k += 1) {
    const i = unique[k];
    if (flight[k]) {
      rejected.flight += 1;
      continue;
    }
    const prev = ordered.at(-1);
    if (prev !== undefined) {
      const seconds = time[i] - time[prev];
      if (
        seconds > 0 &&
        seconds < rules.altitudeJumpSeconds &&
        Math.abs(altitude[i] - altitude[prev]) > rules.altitudeJumpMeters
      ) {
        rejected.altitudeJump += 1;
        continue;
      }
    }
    ordered.push(i);
  }

  const kept = [];
  for (let k = 0; k < ordered.length; k += 1) {
    if (k > 0 && k < ordered.length - 1) {
      const [a, b, c] = [ordered[k - 1], ordered[k], ordered[k + 1]];
      const limit = rules.glitchSpeedMps;
      if (speedBetween(a, b) > limit && speedBetween(b, c) > limit && speedBetween(a, c) <= limit) {
        rejected.glitch += 1;
        continue;
      }
    }
    kept.push(ordered[k]);
  }

  const [minStraightness, maxStraightness] = rules.linkStraightness;
  const joins = (prev, i) => {
    if (time[i] - time[prev] > rules.linkMaxGapSeconds) return false;
    const straightSpeed = speedBetween(prev, i);
    if (straightSpeed > rules.linkMaxSpeedMps) return false;
    if (haversineMeters(lon[prev], lat[prev], lon[i], lat[i]) <= rules.linkFreeMeters) return true;
    if (!(accuracy[prev] <= rules.linkMaxAccuracyMeters && accuracy[i] <= rules.linkMaxAccuracyMeters)) return false;
    if (!(speed[prev] >= 0 && speed[i] >= 0)) return false;
    const ratio = straightSpeed / ((speed[prev] + speed[i]) / 2);
    return ratio >= minStraightness && ratio <= maxStraightness;
  };

  const count = kept.length;
  const points = {
    lon: new Float64Array(count),
    lat: new Float64Array(count),
    time: new Uint32Array(count),
    flags: new Uint8Array(count)
  };
  for (let k = 0; k < count; k += 1) {
    const i = kept[k];
    points.lon[k] = lon[i];
    points.lat[k] = lat[i];
    points.time[k] = time[i];
    if (k > 0 && joins(kept[k - 1], i)) points.flags[k] = FLAG_LINKED;
  }

  return { points, rejected };
}

// Totals, per-year index ranges, bounds and the most visited spot for meta.json.
export function summarize({ lon, lat, time, flags }) {
  const count = time.length;
  const days = new Set();
  const years = [];
  const homeCells = new Map();
  let distanceMeters = 0;
  let tracks = 0;
  let isolatedPoints = 0;
  let south = 90;
  let north = -90;

  for (let i = 0; i < count; i += 1) {
    const day = localDayIndex(time[i], lon[i]);
    days.add(day);

    const year = new Date(time[i] * 1000).getUTCFullYear();
    let bucket = years.at(-1);
    if (!bucket || bucket.year !== year) {
      bucket = { year, startIndex: i, points: 0, days: new Set() };
      years.push(bucket);
    }
    bucket.points += 1;
    bucket.days.add(day);

    const linked = flags[i] & FLAG_LINKED;
    const linksNext = i + 1 < count && flags[i + 1] & FLAG_LINKED;
    if (linked) distanceMeters += haversineMeters(lon[i - 1], lat[i - 1], lon[i], lat[i]);
    else if (linksNext) tracks += 1;
    else isolatedPoints += 1;

    south = Math.min(south, lat[i]);
    north = Math.max(north, lat[i]);

    const key = `${Math.floor(lon[i] / HOME_CELL_DEGREES)}:${Math.floor(lat[i] / HOME_CELL_DEGREES)}`;
    let cell = homeCells.get(key);
    if (!cell) {
      cell = { days: 0, lastDay: -1, lonSum: 0, latSum: 0, points: 0 };
      homeCells.set(key, cell);
    }
    if (cell.lastDay !== day) {
      cell.days += 1;
      cell.lastDay = day;
    }
    cell.lonSum += lon[i];
    cell.latSum += lat[i];
    cell.points += 1;
  }

  let home = null;
  for (const cell of homeCells.values()) {
    if (!home || cell.days > home.days) home = cell;
  }

  const [west, east] = minimalLongitudeSpan(lon);
  return {
    points: count,
    tracks,
    isolatedPoints,
    distanceKm: Math.round(distanceMeters / 1000),
    days: days.size,
    timeRange: count ? [time[0], time[count - 1]] : null,
    bounds: count ? [west, south, east, north] : null,
    home: home ? [home.lonSum / home.points, home.latSum / home.points] : null,
    years: years.map(({ year, startIndex, points, days: yearDays }) => ({
      year,
      startIndex,
      points,
      days: yearDays.size
    }))
  };
}
