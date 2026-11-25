import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gcjToWgs, wgsToGcj } from '../scripts/lib/gcj.mjs';
import {
  assignRegions,
  buildRegionIndex,
  containsPoint,
  simplifyRing,
  summarizeRegions
} from '../scripts/lib/regions.mjs';

const square = (x, y, size) => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y]
];
const polygon = (...rings) => ({ type: 'Polygon', coordinates: rings });

test('GCJ-02 conversion moves Shenzhen ~500 m and round-trips under a meter', () => {
  const [gcjLon, gcjLat] = wgsToGcj(114.08, 22.52);
  assert.ok(gcjLon - 114.08 > 0.004 && gcjLat - 22.52 < -0.002);
  const [lon, lat] = gcjToWgs(gcjLon, gcjLat);
  assert.ok(Math.abs(lon - 114.08) < 1e-6 && Math.abs(lat - 22.52) < 1e-6);
});

test('point in polygon respects holes', () => {
  const { prepared } = buildRegionIndex([
    { id: 'R', name: 'R', level: 0, parent: null, geometry: polygon(square(0, 0, 10), square(4, 4, 2)) }
  ]);
  assert.equal(containsPoint(prepared[0], 1, 1), true);
  assert.equal(containsPoint(prepared[0], 5, 5), false);
  assert.equal(containsPoint(prepared[0], 11, 5), false);
});

test('simplification keeps rings closed and drops points within the tolerance', () => {
  const ring = [[0, 0], [5, 0.001], [10, 0], [10, 10], [0, 10], [0, 0]];
  assert.deepEqual(simplifyRing(ring, 0.01), [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]);
});

test('points go to the finest unit, roll up to parents and snap in from the coast', () => {
  const index = buildRegionIndex([
    { id: 'A', name: 'A', level: 0, parent: null, geometry: polygon(square(0, 0, 10)) },
    { id: 'A-1', name: 'A-1', level: 1, parent: 'A', geometry: polygon(square(0, 0, 10)) },
    { id: 'A-1-a', name: 'A-1-a', level: 2, parent: 'A-1', geometry: polygon(square(0, 0, 5)) },
    { id: 'A-1-b', name: 'A-1-b', level: 2, parent: 'A-1', geometry: polygon(square(5, 0, 5)) },
    { id: 'B', name: 'B', level: 0, parent: null, geometry: polygon(square(20, 0, 10)) }
  ]);
  const noon = Date.UTC(2023, 5, 1, 12) / 1000;
  const day = 86400;
  const points = {
    lon: Float64Array.of(1, 1.5, 6, 10.02, 15, 25),
    lat: Float64Array.of(1, 1, 1, 5, 5, 5),
    time: Uint32Array.of(noon, noon + 600, noon + day, noon + 2 * day, noon + 3 * day, noon + 400 * day)
  };

  const unitOf = assignRegions(index, points);
  const ids = Array.from(unitOf, (unit) => (unit < 0 ? null : index.units[unit].id));
  assert.deepEqual(ids, ['A-1-a', 'A-1-a', 'A-1-b', 'A-1-b', null, 'B']);

  const { regions, shapes } = summarizeRegions(index, points, unitOf);
  const byId = Object.fromEntries(regions.map((region) => [region.id, region]));
  assert.deepEqual(Object.keys(byId), ['A', 'B', 'A-1', 'A-1-a', 'A-1-b']);
  // years[year] = [days, firstDay, lastDay, points]
  const [days, , , pointCount] = byId['A-1-a'].years['2023'];
  assert.deepEqual([days, pointCount], [1, 2]);
  assert.equal(byId['A-1'].years['2023'][0], 3);
  assert.equal(byId.A.years['2023'][3], 4);
  assert.equal(byId.B.years['2024'][0], 1);
  assert.equal(byId['A-1-b'].parent, regions.indexOf(byId['A-1']));
  assert.deepEqual(
    shapes.map((collection) => collection.features.length),
    [2, 1, 2]
  );
});
