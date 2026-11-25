const EARTH_RADIUS_METERS = 6371008.8;
const RAD = Math.PI / 180;

export const EARTH_CIRCUMFERENCE_METERS = 40075016.686;

export function haversineMeters(lon1, lat1, lon2, lat2) {
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Calendar day in approximate local time. The UTC offset is the solar time zone
// implied by longitude, which is close enough to bucket visits by day.
export function localDayIndex(unixSeconds, lon) {
  return Math.floor((unixSeconds + Math.round(lon / 15) * 3600) / 86400);
}

export function dayIndexToIsoDate(dayIndex) {
  return new Date(dayIndex * 86400000).toISOString().slice(0, 10);
}

export function lonToMercatorX(lon) {
  return (lon + 180) / 360;
}

export function latToMercatorY(lat) {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  return (1 - Math.log(Math.tan(Math.PI / 4 + (clamped * RAD) / 2)) / Math.PI) / 2;
}

export function mercatorYToLat(y) {
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) / RAD;
}

// Smallest longitude window containing every value, allowing it to wrap across the
// antimeridian. Returns [west, east] with west < east; east may exceed 180.
export function minimalLongitudeSpan(longitudes) {
  const sorted = Float64Array.from(longitudes).sort();
  if (sorted.length === 0) return [-180, 180];

  let widestGap = sorted[0] + 360 - sorted[sorted.length - 1];
  let gapEnd = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > widestGap) {
      widestGap = gap;
      gapEnd = i;
    }
  }

  if (gapEnd === 0) return [sorted[0], sorted[sorted.length - 1]];
  return [sorted[gapEnd], sorted[gapEnd - 1] + 360];
}
