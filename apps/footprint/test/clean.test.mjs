import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanPoints, DEFAULT_RULES, summarize } from '../scripts/lib/clean.mjs';
import { parseFootprintCsv } from '../scripts/lib/csv.mjs';
import { decodeFootprint, encodeFootprint, FLAG_LINKED } from '../src/shared/footprintFormat.js';
import { minimalLongitudeSpan } from '../src/shared/geo.js';

const HEADER = 'dataTime,locType,longitude,latitude,heading,accuracy,speed,distance,isBackForeground,stepType,altitude';
const T0 = 1700000000;

// Each fix: [secondsAfterT0, lon, lat, accuracy?, speedMps?, altitude?]
function csv(fixes) {
  const rows = fixes.map(([dt, lon, lat, accuracy = 5, speed = 10, altitude = 20]) =>
    [T0 + dt, 1, lon, lat, 0, accuracy, speed, 0, 1, 0, altitude].join(',')
  );
  return [HEADER, ...rows].join('\n');
}

function clean(fixes, rules = DEFAULT_RULES) {
  return cleanPoints(parseFootprintCsv(csv(fixes)), rules);
}

// ~111 m per 0.001 degrees of latitude.
const north = (meters) => 34.4 + meters / 111195;

// Fixes moving east along one parallel. Each leg is [seconds, speedMps, altitude,
// accuracy, reportedSpeed] and ends in one fix; reportedSpeed defaults to the true speed.
const LAT = 34.43;
function travel(startSeconds, startLon, legs) {
  const metersPerDegree = 111319.49 * Math.cos((LAT * Math.PI) / 180);
  let t = startSeconds;
  let lon = startLon;
  return legs.map(([seconds, speed, altitude = 20, accuracy = 5, reported = speed]) => {
    t += seconds;
    lon += (speed * seconds) / metersPerDegree;
    return [t, lon, LAT, accuracy, reported, altitude];
  });
}

test('drops invalid, inaccurate and in-flight fixes', () => {
  const { points, rejected } = clean([
    [0, -119.8, north(0)],
    [10, 0, 0],
    [20, -119.8, north(200), 900],
    [30, -119.8, north(400), 5, 230],
    [40, -119.8, north(600), 5, -1, 10500],
    [50, -119.8, north(800)]
  ]);
  assert.equal(points.time.length, 2);
  assert.deepEqual(rejected, { invalid: 1, inaccurate: 1, flight: 2, duplicate: 0, altitudeJump: 0, glitch: 0 });
});

test('keeps high-speed rail fixes below the flight threshold', () => {
  const { points } = clean([
    [0, 116.3, 39.9, 5, 94],
    [10, 116.3, 39.9 + 940 / 111195, 5, 94]
  ]);
  assert.equal(points.time.length, 2);
  assert.equal(points.flags[1], FLAG_LINKED);
});

test('drops a whole flight, including the slower approach and runway roll', () => {
  const { points, rejected } = clean([
    [0, -119.84, LAT, 5, 2], // at the gate
    ...travel(300, -119.84, [
      [10, 60], // takeoff roll
      [10, 75, 60],
      [20, 90, 800],
      [20, 130, 3000], // three fixes faster than any train
      [20, 135, 3100],
      [20, 140, 3200],
      [20, 85, 900], // approach, with one bogus zero-speed reading
      [5, 85, 900, 5, 0],
      [5, 85, 900],
      [20, 70, 300],
      [20, 65, 90] // landing
    ]),
    ...travel(520, -119.7, [[0, 8]]), // taxiing, well after the landing roll
    ...travel(1200, -119.6, [[0, 28], [10, 28], [10, 28]]) // driving home
  ]);
  assert.equal(rejected.flight, 11);
  assert.deepEqual(Array.from(points.time, (t) => t - T0), [0, 520, 1200, 1210, 1220]);
});

test('keeps a highway drive with one bad speed reading', () => {
  const legs = Array.from({ length: 10 }, (_, k) => [10, 30, 20, 5, k === 4 ? 150 : 30]);
  const { points, rejected } = clean(travel(0, -119.9, legs));
  assert.equal(rejected.flight, 1);
  assert.equal(points.time.length, 9);
  assert.ok(Array.from(points.flags).slice(1).every((flag) => flag === FLAG_LINKED));
});

test('joins long steps only when the reported speed matches the straight line', () => {
  // Every pair is 900 m apart in 30 s; pairs are far apart in time so they never join.
  const pair = (start, lon, accuracy, reported) =>
    travel(start, lon, [
      [0, 30, 20, accuracy, reported],
      [30, 30, 20, accuracy, reported]
    ]);
  const { points } = clean([
    ...pair(0, -119.9, 5, 30), // straight road
    ...pair(1000, -119.8, 5, 40), // drove further along a bend than the 900 m chord
    ...pair(2000, -119.7, 100, 30), // coarse Wi-Fi/cell fixes
    ...pair(3000, -119.6, 5, -1) // no speed reading
  ]);
  assert.deepEqual(Array.from(points.flags), [0, FLAG_LINKED, 0, 0, 0, 0, 0, 0]);
});

test('sorts by time and removes exact duplicates', () => {
  const { points, rejected } = clean([
    [20, -119.8, north(200)],
    [0, -119.8, north(0)],
    [10, -119.8, north(100)],
    [10, -119.8, north(100)]
  ]);
  assert.deepEqual(Array.from(points.time), [T0, T0 + 10, T0 + 20]);
  assert.equal(rejected.duplicate, 1);
});

test('removes a single GPS jump but keeps the track around it', () => {
  const { points, rejected } = clean([
    [0, -119.8, north(0)],
    [10, -119.8, north(100)],
    [20, -118.5, north(100)],
    [30, -119.8, north(200)],
    [40, -119.8, north(300)]
  ]);
  assert.equal(rejected.glitch, 1);
  assert.deepEqual(Array.from(points.flags), [0, FLAG_LINKED, FLAG_LINKED, FLAG_LINKED]);
});

test('starts a new track after a long pause or an impossible jump', () => {
  const { points } = clean([
    [0, -119.8, north(0)],
    [10, -119.8, north(100)],
    [10 + DEFAULT_RULES.linkMaxGapSeconds + 1, -119.8, north(150)],
    [10 + DEFAULT_RULES.linkMaxGapSeconds + 20, -119.8, north(250)],
    [3000, 121.47, 31.23],
    [3010, 121.47, 31.231]
  ]);
  assert.deepEqual(Array.from(points.flags), [0, FLAG_LINKED, 0, FLAG_LINKED, 0, FLAG_LINKED]);
});

test('summarize counts tracks, isolated points and year ranges', () => {
  const { points } = clean([
    [0, -119.8, north(0)],
    [10, -119.8, north(100)],
    [5000, -119.8, north(5000)],
    [400 * 86400, 121.47, 31.23]
  ]);
  const summary = summarize(points);
  assert.equal(summary.tracks, 1);
  assert.equal(summary.isolatedPoints, 2);
  assert.equal(summary.distanceKm, 0);
  assert.deepEqual(
    summary.years.map(({ year, startIndex, points: n }) => [year, startIndex, n]),
    [
      [2023, 0, 3],
      [2024, 3, 1]
    ]
  );
});

test('binary format round-trips to microdegree precision', () => {
  const { points } = clean([
    [0, -100.123456, 40.654321],
    [10, 121.473701, 31.230416]
  ]);
  const decoded = decodeFootprint(encodeFootprint(points));
  assert.equal(decoded.count, 2);
  assert.deepEqual(Array.from(decoded.lon), [-100.123456, 121.473701]);
  assert.deepEqual(Array.from(decoded.lat), [40.654321, 31.230416]);
  assert.deepEqual(Array.from(decoded.time), Array.from(points.time));
});

test('longitude span wraps across the Pacific when that is narrower', () => {
  assert.deepEqual(minimalLongitudeSpan([-120, -118, 116, 121]), [116, 242]);
  assert.deepEqual(minimalLongitudeSpan([2, 10, 30]), [2, 30]);
});
