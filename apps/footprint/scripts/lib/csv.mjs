const COLUMNS = {
  time: 'dataTime',
  lon: 'longitude',
  lat: 'latitude',
  accuracy: 'accuracy',
  speed: 'speed',
  altitude: 'altitude'
};
const REQUIRED = ['time', 'lon', 'lat'];

function toNumber(value) {
  return value === undefined || value === '' ? NaN : Number(value);
}

// Parses the footprint export (one GPS fix per row) into columnar Float64Arrays.
// Missing optional columns and empty cells become NaN.
export function parseFootprintCsv(text) {
  const lines = text.split(/\r?\n/);
  const header = lines[0]
    .replace(/^﻿/, '')
    .split(',')
    .map((name) => name.trim().replace(/^"|"$/g, ''));

  const index = {};
  for (const [key, name] of Object.entries(COLUMNS)) {
    index[key] = header.indexOf(name);
    if (index[key] < 0 && REQUIRED.includes(key)) {
      throw new Error(`CSV is missing the "${name}" column (found: ${header.join(', ')})`);
    }
  }

  const capacity = lines.length - 1;
  const columns = Object.fromEntries(Object.keys(COLUMNS).map((key) => [key, new Float64Array(capacity).fill(NaN)]));

  let rows = 0;
  for (let i = 1; i < lines.length; i += 1) {
    let line = lines[i];
    if (!line) continue;
    if (line.includes('"')) line = line.replaceAll('"', '');

    const values = line.split(',');
    for (const key of Object.keys(COLUMNS)) {
      if (index[key] >= 0) columns[key][rows] = toNumber(values[index[key]]);
    }
    rows += 1;
  }

  return Object.fromEntries(Object.entries(columns).map(([key, values]) => [key, values.subarray(0, rows)]));
}
