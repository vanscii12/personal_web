// Visits per region for a year range, from public/data/footprint/regions.json (see
// scripts/lib/regions.mjs). Levels: 0 country, 1 province/state, 2 city/county.
export const REGION_LEVELS = [0, 1, 2];

// One entry per region: { days, points, firstDay, lastDay } or null when not visited in
// [from, to]. Days add up across years because a calendar day belongs to a single year.
export function regionVisits(regions, [from, to]) {
  return regions.map((region) => {
    let days = 0;
    let points = 0;
    let firstDay = Infinity;
    let lastDay = -Infinity;
    for (const [year, [yearDays, first, last, yearPoints]] of Object.entries(region.years)) {
      if (Number(year) < from || Number(year) > to) continue;
      days += yearDays;
      points += yearPoints;
      firstDay = Math.min(firstDay, first);
      lastDay = Math.max(lastDay, last);
    }
    return days > 0 ? { days, points, firstDay, lastDay } : null;
  });
}

export function visitedCounts(regions, visits) {
  const counts = REGION_LEVELS.map(() => 0);
  regions.forEach((region, i) => {
    if (visits[i]) counts[region.level] += 1;
  });
  return counts;
}
