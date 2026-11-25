// GCJ-02, the obfuscated datum maps published in mainland China must use, to and from WGS-84.
// The offset is a few hundred meters and varies smoothly with position.
const A = 6378245.0;
const EE = 0.006693421622965943;
const PI = Math.PI;

function transformLat(x, y) {
  let value = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  value += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  value += ((20 * Math.sin(y * PI) + 40 * Math.sin((y / 3) * PI)) * 2) / 3;
  value += ((160 * Math.sin((y / 12) * PI) + 320 * Math.sin((y * PI) / 30)) * 2) / 3;
  return value;
}

function transformLon(x, y) {
  let value = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  value += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  value += ((20 * Math.sin(x * PI) + 40 * Math.sin((x / 3) * PI)) * 2) / 3;
  value += ((150 * Math.sin((x / 12) * PI) + 300 * Math.sin((x / 30) * PI)) * 2) / 3;
  return value;
}

export function wgsToGcj(lon, lat) {
  const radLat = (lat / 180) * PI;
  const magic = 1 - EE * Math.sin(radLat) ** 2;
  const sqrtMagic = Math.sqrt(magic);
  const dLat = (transformLat(lon - 105, lat - 35) * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  const dLon = (transformLon(lon - 105, lat - 35) * 180) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lon + dLon, lat + dLat];
}

// Inverse by fixed-point iteration; three steps bring it well under a meter.
export function gcjToWgs(lon, lat) {
  let x = lon;
  let y = lat;
  for (let step = 0; step < 3; step += 1) {
    const [gx, gy] = wgsToGcj(x, y);
    x -= gx - lon;
    y -= gy - lat;
  }
  return [x, y];
}
