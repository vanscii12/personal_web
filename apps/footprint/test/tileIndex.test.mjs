import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLAG_LINKED } from '../src/shared/footprintFormat.js';
import { fogTileUrl, parseTileUrl, trailTileUrl } from '../src/shared/tileStyle.js';
import { buildTrackIndex, querySpans } from '../src/worker/tileIndex.js';

// Points along a horizontal line in Web Mercator units; `breaks` lists indexes that start
// a new track.
function line(count, breaks = []) {
  const mx = new Float64Array(count);
  const my = new Float64Array(count).fill(0.4);
  const flags = new Uint8Array(count);
  for (let i = 0; i < count; i += 1) {
    mx[i] = 0.1 + i * 1e-5;
    flags[i] = i === 0 || breaks.includes(i) ? 0 : FLAG_LINKED;
  }
  return buildTrackIndex(mx, my, flags);
}

test('a track split into several chunks comes back as one span', () => {
  assert.deepEqual(querySpans(line(100), 0, 0, 1, 1, 0, 100), [0, 100]);
});

test('separate tracks stay separate spans', () => {
  assert.deepEqual(querySpans(line(100, [50]), 0, 0, 1, 1, 0, 100), [0, 50, 50, 100]);
});

test('spans are limited to the index range', () => {
  assert.deepEqual(querySpans(line(100), 0, 0, 1, 1, 40, 70), [40, 70]);
  assert.deepEqual(querySpans(line(100), 0, 0, 1, 1, 100, 100), []);
});

test('only chunks touching the box are returned', () => {
  const index = line(100);
  assert.deepEqual(querySpans(index, 0.1 + 10e-5, 0.39, 0.1 + 20e-5, 0.41, 0, 100), [0, 32]);
  assert.deepEqual(querySpans(index, 0.5, 0.39, 0.6, 0.41, 0, 100), []);
});

test('tile URLs carry every setting', () => {
  const tile = (template) => template.replace('{z}/{x}/{y}', '12/654/1580');
  assert.deepEqual(parseTileUrl(tile(fogTileUrl(500.4, { i0: 3, i1: 900 }))), {
    kind: 'fog',
    param: 500,
    i0: 3,
    i1: 900,
    z: 12,
    x: 654,
    y: 1580
  });
  assert.deepEqual(parseTileUrl(tile(trailTileUrl({ i0: 0, i1: 10 }))), {
    kind: 'trail',
    param: 0,
    i0: 0,
    i1: 10,
    z: 12,
    x: 654,
    y: 1580
  });
});
