// Number and date formatting from DESIGN.md: missing values are "—", big numbers use 万 / 亿
// with three significant digits, dates are ISO.
export function count(value) {
  return value == null ? '—' : Math.round(value).toLocaleString('en-US');
}

export function big(value) {
  if (value == null) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e8) return `${Number((value / 1e8).toPrecision(3))}亿`;
  if (abs >= 1e4) return `${Number((value / 1e4).toPrecision(3))}万`;
  return count(value);
}

export function isoMonth(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 7);
}
