import { FOG } from '../shared/tileStyle.js';
import { EARTH_CIRCUMFERENCE_METERS, mercatorYToLat } from '../shared/geo.js';
import { querySpans } from './tileIndex.js';

const RAD = Math.PI / 180;

let canvas = null;

function solidFogTile(style) {
  const tiny = new OffscreenCanvas(1, 1);
  const ctx = tiny.getContext('2d');
  ctx.fillStyle = style.fogColor;
  ctx.fillRect(0, 0, 1, 1);
  return createImageBitmap(tiny);
}

// Fog tile: opaque fog with soft holes wherever the points in [i0, i1) passed within
// `radius` meters, and a glow on the fog around each hole.
export function renderFogTile(index, { mx, my }, { z, x, y, param: radius, i0, i1 }, style = FOG) {
  const { imageSize: size, pad } = style;
  const tiles = 2 ** z;
  const worldPx = size * tiles;
  const originX = x / tiles;
  const originY = y / tiles;
  const span = 1 / tiles;

  const latitude = mercatorYToLat(originY + span / 2);
  const pxPerMeter = worldPx / (EARTH_CIRCUMFERENCE_METERS * Math.cos(latitude * RAD));
  const width = Math.max(style.minWidthPx, 2 * radius * pxPerMeter);
  const clearBlur = Math.min(style.maxClearBlurPx, width * style.clearBlurRatio);
  const glowWidth = width * style.glowWidthRatio + style.glowExtraPx;
  const glowBlur = Math.min(style.maxGlowBlurPx, Math.max(style.minGlowBlurPx, width * style.glowBlurRatio));

  // Strokes up to `reach` outside the tile still tint it.
  const reach = (glowWidth / 2 + 3 * glowBlur) / worldPx;
  const spans = querySpans(index, originX - reach, originY - reach, originX + span + reach, originY + span + reach, i0, i1);
  if (spans.length === 0) return solidFogTile(style);

  const full = size + 2 * pad;
  if (!canvas || canvas.width !== full) canvas = new OffscreenCanvas(full, full);
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'copy';
  ctx.filter = 'none';
  ctx.fillStyle = style.fogColor;
  ctx.fillRect(0, 0, full, full);

  const path = new Path2D();
  const offsetX = pad - originX * worldPx;
  const offsetY = pad - originY * worldPx;
  for (let k = 0; k < spans.length; k += 2) {
    const start = spans[k];
    const end = spans[k + 1];
    let lastX = mx[start] * worldPx + offsetX;
    let lastY = my[start] * worldPx + offsetY;
    path.moveTo(lastX, lastY);
    if (end - start === 1) {
      path.lineTo(lastX + 0.01, lastY);
      continue;
    }
    for (let i = start + 1; i < end; i += 1) {
      const px = mx[i] * worldPx + offsetX;
      const py = my[i] * worldPx + offsetY;
      if (i < end - 1 && Math.abs(px - lastX) < 0.5 && Math.abs(py - lastY) < 0.5) continue;
      path.lineTo(px, py);
      lastX = px;
      lastY = py;
    }
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.globalCompositeOperation = 'source-atop';
  ctx.filter = `blur(${glowBlur.toFixed(1)}px)`;
  ctx.strokeStyle = style.glowColor;
  ctx.lineWidth = glowWidth;
  ctx.stroke(path);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.filter = clearBlur >= 0.5 ? `blur(${clearBlur.toFixed(1)}px)` : 'none';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = width;
  ctx.stroke(path);

  return createImageBitmap(canvas, pad, pad, size, size);
}
