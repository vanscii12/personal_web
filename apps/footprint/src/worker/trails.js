import { TRAILS } from '../shared/tileStyle.js';
import { querySpans } from './tileIndex.js';

// Each pass of a track adds 1 along its centerline to a float accumulator, fading over two
// pixels to either side (PROFILE). Accumulated passes are mapped to color through a lookup
// table, so heavily traveled routes come out both darker and wider. An optional blurred copy
// can be added on top as bloom.
const PROFILE = [0.15, 0.55, 1, 0.55, 0.15];
const PROFILE_SUM = PROFILE.reduce((sum, value) => sum + value, 0);
const REACH = (PROFILE.length - 1) / 2;
// Separable stamp: consecutive stamps one pixel apart along a line sum to PROFILE across it.
const KERNEL = PROFILE.flatMap((row) => PROFILE.map((column) => (row * column) / PROFILE_SUM));
const MIN_STEP_PX = 0.7;
const LUT_SIZE = 1024;
const BLOOM_SCALE = 4;

let accumulator = null;
let kernelOffsets = null;
let image = null;
let canvas = null;
let bloomCanvas = null;
let lut = null;
let emptyCanvas = null;

function buildLut(ramp) {
  const table = new Uint8ClampedArray(LUT_SIZE * 4);
  for (let k = 0; k < LUT_SIZE; k += 1) {
    const t = k / (LUT_SIZE - 1);
    let s = 1;
    while (s < ramp.length - 1 && ramp[s][0] < t) s += 1;
    const [t0, c0] = ramp[s - 1];
    const [t1, c1] = ramp[s];
    const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    for (let channel = 0; channel < 4; channel += 1) {
      table[k * 4 + channel] = c0[channel] + (c1[channel] - c0[channel]) * f;
    }
  }
  return table;
}

function stamp(acc, width, x, y, scale = 1) {
  const o = Math.round(y) * width + Math.round(x);
  for (let k = 0; k < KERNEL.length; k += 1) acc[o + kernelOffsets[k]] += KERNEL[k] * scale;
}

// Liang-Barsky clipping of a segment to [lo, hi]², written into `clip`.
const clip = new Float64Array(4);
let tEnter = 0;
let tExit = 1;

function clipEdge(p, q) {
  if (p === 0) return q >= 0;
  const r = q / p;
  if (p < 0) {
    if (r > tExit) return false;
    if (r > tEnter) tEnter = r;
  } else {
    if (r < tEnter) return false;
    if (r < tExit) tExit = r;
  }
  return true;
}

function clipSegment(x0, y0, x1, y1, lo, hi) {
  tEnter = 0;
  tExit = 1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  if (!clipEdge(-dx, x0 - lo) || !clipEdge(dx, hi - x0) || !clipEdge(-dy, y0 - lo) || !clipEdge(dy, hi - y0)) {
    return false;
  }
  clip[0] = x0 + tEnter * dx;
  clip[1] = y0 + tEnter * dy;
  clip[2] = x0 + tExit * dx;
  clip[3] = y0 + tExit * dy;
  return true;
}

// Plots a segment one pixel step at a time. The start pixel is skipped when it was already
// plotted as the end of the previous segment, so a single pass adds exactly 1 per pixel.
function plotSegment(acc, width, x0, y0, x1, y1, skipStart) {
  if (!clipSegment(x0, y0, x1, y1, REACH, width - 1 - REACH)) return;
  const startMoved = tEnter > 0;
  const cx0 = clip[0];
  const cy0 = clip[1];
  const dx = clip[2] - cx0;
  const dy = clip[3] - cy0;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
  for (let s = skipStart && !startMoved ? 1 : 0; s <= steps; s += 1) {
    stamp(acc, width, cx0 + (dx * s) / steps, cy0 + (dy * s) / steps);
  }
}

function emptyTile() {
  if (!emptyCanvas) {
    // A canvas needs a context (a backing store) before an ImageBitmap can be taken from it.
    emptyCanvas = new OffscreenCanvas(1, 1);
    emptyCanvas.getContext('2d').clearRect(0, 0, 1, 1);
  }
  return createImageBitmap(emptyCanvas);
}

export function renderTrailTile(index, { mx, my }, { z, x, y, i0, i1 }, style = TRAILS) {
  const { imageSize: size, pad } = style;
  const width = size + 2 * pad;
  const tiles = 2 ** z;
  const worldPx = size * tiles;
  const originX = x / tiles;
  const originY = y / tiles;
  const margin = (pad + 2) / worldPx;
  const spans = querySpans(
    index,
    originX - margin,
    originY - margin,
    originX + 1 / tiles + margin,
    originY + 1 / tiles + margin,
    i0,
    i1
  );
  if (spans.length === 0) return emptyTile();

  if (!accumulator || accumulator.length !== width * width) {
    accumulator = new Float32Array(width * width);
    kernelOffsets = KERNEL.map((_, k) => (Math.floor(k / PROFILE.length) - REACH) * width + (k % PROFILE.length) - REACH);
    image = new ImageData(width, width);
    canvas = new OffscreenCanvas(width, width);
    bloomCanvas = new OffscreenCanvas(width / BLOOM_SCALE, width / BLOOM_SCALE);
  } else {
    accumulator.fill(0);
  }
  lut ??= buildLut(style.ramp);

  const offsetX = pad - originX * worldPx;
  const offsetY = pad - originY * worldPx;
  for (let k = 0; k < spans.length; k += 2) {
    const start = spans[k];
    const end = spans[k + 1];
    let x0 = mx[start] * worldPx + offsetX;
    let y0 = my[start] * worldPx + offsetY;
    if (end - start === 1) {
      // A lone fix gets the full weight a line would put on its centerline.
      const inside = x0 >= REACH && y0 >= REACH && x0 <= width - 1 - REACH && y0 <= width - 1 - REACH;
      if (inside) stamp(accumulator, width, x0, y0, PROFILE_SUM);
      continue;
    }
    let plotted = false;
    for (let i = start + 1; i < end; i += 1) {
      const x1 = mx[i] * worldPx + offsetX;
      const y1 = my[i] * worldPx + offsetY;
      if (i < end - 1 && Math.abs(x1 - x0) < MIN_STEP_PX && Math.abs(y1 - y0) < MIN_STEP_PX) continue;
      plotSegment(accumulator, width, x0, y0, x1, y1, plotted);
      plotted = true;
      x0 = x1;
      y0 = y1;
    }
  }

  const pixels = image.data;
  const logSaturation = Math.log1p(style.saturationPasses);
  for (let p = 0; p < accumulator.length; p += 1) {
    const passes = accumulator[p];
    const o = p * 4;
    if (passes < 0.02) {
      pixels[o + 3] = 0;
      continue;
    }
    const k = Math.min(LUT_SIZE - 1, ((Math.log1p(passes) / logSaturation) * (LUT_SIZE - 1)) | 0) * 4;
    pixels[o] = lut[k];
    pixels[o + 1] = lut[k + 1];
    pixels[o + 2] = lut[k + 2];
    pixels[o + 3] = lut[k + 3];
  }

  const ctx = canvas.getContext('2d');
  ctx.putImageData(image, 0, 0);

  if (style.bloomStrength > 0) {
    const bloomCtx = bloomCanvas.getContext('2d');
    bloomCtx.globalCompositeOperation = 'copy';
    bloomCtx.filter = 'blur(2px)';
    bloomCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = style.bloomStrength;
    ctx.drawImage(bloomCanvas, 0, 0, width, width);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  return createImageBitmap(canvas, pad, pad, size, size);
}
