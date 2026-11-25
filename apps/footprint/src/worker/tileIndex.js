import { FLAG_LINKED } from '../shared/footprintFormat.js';

const GRID_SIZE = 4096; // index cells per axis over the Web Mercator square
const MAX_CHUNK_POINTS = 32;
const MAX_CHUNK_CELLS = 64 * 64; // chunks spanning more cells are checked on every query instead

const toCell = (value) => Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(value * GRID_SIZE)));

// Splits each track (a run of linked points) into chunks of up to MAX_CHUNK_POINTS that
// share their end points, and buckets the chunks into a grid by bounding box. Chunk ids
// increase with point index.
export function buildTrackIndex(mx, my, flags) {
  const count = mx.length;
  const starts = [];
  const ends = [];
  for (let i = 0; i < count; ) {
    let j = i + 1;
    while (j < count && flags[j] & FLAG_LINKED) j += 1;
    for (let s = i; ; s += MAX_CHUNK_POINTS - 1) {
      const e = Math.min(j, s + MAX_CHUNK_POINTS);
      starts.push(s);
      ends.push(e);
      if (e === j) break;
    }
    i = j;
  }

  const chunkCount = starts.length;
  const bbox = new Float64Array(chunkCount * 4);
  const cells = new Map();
  const wideChunks = [];
  for (let c = 0; c < chunkCount; c += 1) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = starts[c]; i < ends[c]; i += 1) {
      minX = Math.min(minX, mx[i]);
      maxX = Math.max(maxX, mx[i]);
      minY = Math.min(minY, my[i]);
      maxY = Math.max(maxY, my[i]);
    }
    bbox[c * 4] = minX;
    bbox[c * 4 + 1] = minY;
    bbox[c * 4 + 2] = maxX;
    bbox[c * 4 + 3] = maxY;

    const [cx0, cy0, cx1, cy1] = [toCell(minX), toCell(minY), toCell(maxX), toCell(maxY)];
    if ((cx1 - cx0 + 1) * (cy1 - cy0 + 1) > MAX_CHUNK_CELLS) {
      wideChunks.push(c);
      continue;
    }
    for (let cy = cy0; cy <= cy1; cy += 1) {
      for (let cx = cx0; cx <= cx1; cx += 1) {
        const key = cy * GRID_SIZE + cx;
        const list = cells.get(key);
        if (list) list.push(c);
        else cells.set(key, [c]);
      }
    }
  }

  return {
    starts: Uint32Array.from(starts),
    ends: Uint32Array.from(ends),
    bbox,
    cells,
    wideChunks,
    stamp: new Uint32Array(chunkCount),
    query: 0
  };
}

function queryChunks(index, minX, minY, maxX, maxY) {
  const { bbox, stamp } = index;
  index.query += 1;
  const query = index.query;
  const found = [];

  const visit = (list) => {
    for (const c of list) {
      if (stamp[c] === query) continue;
      stamp[c] = query;
      const o = c * 4;
      if (bbox[o] <= maxX && bbox[o + 2] >= minX && bbox[o + 1] <= maxY && bbox[o + 3] >= minY) found.push(c);
    }
  };

  const [cx0, cy0, cx1, cy1] = [toCell(minX), toCell(minY), toCell(maxX), toCell(maxY)];
  if ((cx1 - cx0 + 1) * (cy1 - cy0 + 1) > index.cells.size) {
    for (const [key, list] of index.cells) {
      const cx = key % GRID_SIZE;
      const cy = (key - cx) / GRID_SIZE;
      if (cx >= cx0 && cx <= cx1 && cy >= cy0 && cy <= cy1) visit(list);
    }
  } else {
    for (let cy = cy0; cy <= cy1; cy += 1) {
      for (let cx = cx0; cx <= cx1; cx += 1) {
        const list = index.cells.get(cy * GRID_SIZE + cx);
        if (list) visit(list);
      }
    }
  }
  visit(index.wideChunks);
  return found;
}

// Point index spans near a Web Mercator box, limited to [i0, i1), as a flat
// [start0, end0, start1, end1, ...] array. Neighboring chunks of one track are merged, so
// each span is one continuous pass of a track through the area.
export function querySpans(index, minX, minY, maxX, maxY, i0, i1) {
  const chunks = queryChunks(index, minX, minY, maxX, maxY).sort((a, b) => a - b);
  const spans = [];
  let spanStart = -1;
  let spanEnd = -1;
  for (const c of chunks) {
    const start = Math.max(index.starts[c], i0);
    const end = Math.min(index.ends[c], i1);
    if (start >= end) continue;
    // Chunks of one track overlap by exactly one point; separate tracks never overlap.
    if (spanEnd > start) {
      spanEnd = Math.max(spanEnd, end);
    } else {
      if (spanEnd >= 0) spans.push(spanStart, spanEnd);
      spanStart = start;
      spanEnd = end;
    }
  }
  if (spanEnd >= 0) spans.push(spanStart, spanEnd);
  return spans;
}
