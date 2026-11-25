// Binary layout of public/data/footprint/footprint.bin (little-endian), points sorted by time:
//   0        uint32  magic "FPT1"
//   4        uint32  format version
//   8        uint32  point count N
//   12       uint32  reserved
//   16       int32[N]  longitude in microdegrees
//   16 + 4N  int32[N]  latitude in microdegrees
//   16 + 8N  uint32[N] unix time in seconds
//   16 + 12N uint8[N]  flags

export const FORMAT_MAGIC = 0x31545046;
export const FORMAT_VERSION = 1;
export const FLAG_LINKED = 1; // the point continues the track of the previous point

const HEADER_BYTES = 16;
const MICRO = 1e6;

export function encodeFootprint({ lon, lat, time, flags }) {
  const count = time.length;
  const buffer = new ArrayBuffer(HEADER_BYTES + count * 13);
  const header = new Uint32Array(buffer, 0, 4);
  header[0] = FORMAT_MAGIC;
  header[1] = FORMAT_VERSION;
  header[2] = count;

  const lonOut = new Int32Array(buffer, HEADER_BYTES, count);
  const latOut = new Int32Array(buffer, HEADER_BYTES + count * 4, count);
  const timeOut = new Uint32Array(buffer, HEADER_BYTES + count * 8, count);
  const flagsOut = new Uint8Array(buffer, HEADER_BYTES + count * 12, count);
  for (let i = 0; i < count; i += 1) {
    lonOut[i] = Math.round(lon[i] * MICRO);
    latOut[i] = Math.round(lat[i] * MICRO);
    timeOut[i] = time[i];
    flagsOut[i] = flags[i];
  }
  return buffer;
}

export function decodeFootprint(buffer) {
  const header = new Uint32Array(buffer, 0, 4);
  if (header[0] !== FORMAT_MAGIC) throw new Error('footprint.bin has an unknown format');
  if (header[1] !== FORMAT_VERSION) {
    throw new Error(`footprint.bin is format v${header[1]}, expected v${FORMAT_VERSION}; rerun npm run footprint:data`);
  }

  const count = header[2];
  const lonMicro = new Int32Array(buffer, HEADER_BYTES, count);
  const latMicro = new Int32Array(buffer, HEADER_BYTES + count * 4, count);
  const lon = new Float64Array(count);
  const lat = new Float64Array(count);
  for (let i = 0; i < count; i += 1) {
    lon[i] = lonMicro[i] / MICRO;
    lat[i] = latMicro[i] / MICRO;
  }

  return {
    count,
    lon,
    lat,
    time: new Uint32Array(buffer, HEADER_BYTES + count * 8, count),
    flags: new Uint8Array(buffer, HEADER_BYTES + count * 12, count)
  };
}
