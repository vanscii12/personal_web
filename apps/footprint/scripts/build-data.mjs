// Turns the GPS export CSV into the static files the app loads. They go into the site's
// public/ folder, which serves them at /data/footprint/ (see src/data/useFootprint.js):
//   public/data/footprint/footprint.bin  cleaned, time-sorted points (see src/shared/footprintFormat.js)
//   public/data/footprint/meta.json      totals, per-year ranges, bounds and cleaning stats
//   public/data/footprint/regions.json   visited countries, provinces/states and cities/counties
//
// Usage (from the site root): npm run footprint:data [-- path/to/export.csv]
//   node apps/footprint/scripts/build-data.mjs [path/to/export.csv] [--if-stale]
// The site's predev and prebuild run it with --if-stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeFootprint } from '../src/shared/footprintFormat.js';
import { chinaBoundariesDir, loadBoundaryUnits } from './lib/boundaries.mjs';
import { DEFAULT_RULES, cleanPoints, summarize } from './lib/clean.mjs';
import { parseFootprintCsv } from './lib/csv.mjs';
import { assignRegions, buildRegionIndex, summarizeRegions } from './lib/regions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // apps/footprint
const siteRoot = path.resolve(root, '..', '..');
const args = process.argv.slice(2);
const ifStale = args.includes('--if-stale');
const csvPath = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? path.join(root, 'data', 'backUpData.csv'));
const outDir = path.join(siteRoot, 'public', 'data', 'footprint');
const binPath = path.join(outDir, 'footprint.bin');
const metaPath = path.join(outDir, 'meta.json');
const regionsPath = path.join(outDir, 'regions.json');

function mtime(file) {
  return fs.existsSync(file) ? fs.statSync(file).mtimeMs : 0;
}

function newestIn(dir) {
  return fs.existsSync(dir) ? Math.max(0, ...fs.readdirSync(dir).map((name) => mtime(path.join(dir, name)))) : 0;
}

function inputMtime() {
  const files = [
    csvPath,
    fileURLToPath(import.meta.url),
    ...fs.readdirSync(path.join(root, 'scripts', 'lib')).map((name) => path.join(root, 'scripts', 'lib', name)),
    ...fs.readdirSync(path.join(root, 'src', 'shared')).map((name) => path.join(root, 'src', 'shared', name))
  ];
  return Math.max(newestIn(chinaBoundariesDir(root)), ...files.map(mtime));
}

// The export the current files were built from (meta.json source.file), or null.
function builtFrom() {
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8')).source?.file ?? null;
  } catch {
    return null;
  }
}

function buildRegions(points) {
  const index = buildRegionIndex(loadBoundaryUnits(root));
  const unitOf = assignRegions(index, points);
  const summary = summarizeRegions(index, points, unitOf);
  const perLevel = [0, 1, 2].map((level) => summary.regions.filter((region) => region.level === level).length);
  const unassigned = unitOf.reduce((count, unit) => count + (unit < 0 ? 1 : 0), 0);
  return { summary, perLevel, unassigned };
}

function main() {
  const outputTime = Math.min(mtime(binPath), mtime(metaPath), mtime(regionsPath));

  if (!fs.existsSync(csvPath)) {
    const message = `No GPS export at ${path.relative(siteRoot, csvPath)}.`;
    if (ifStale) {
      if (!outputTime) console.warn(`${message} The app will start without data.`);
      return;
    }
    throw new Error(`${message} Put the export there or pass its path: npm run footprint:data -- path/to/file.csv`);
  }

  if (ifStale && outputTime > inputMtime()) return;

  // An automatic rebuild must not switch exports: the files may have been built from another
  // CSV (npm run footprint:data -- other.csv), and the default one can be an older export.
  const previous = ifStale && outputTime ? builtFrom() : null;
  if (previous && previous !== path.basename(csvPath)) {
    console.warn(
      `Footprint data is older than its inputs, but it was built from ${previous}, not ` +
        `${path.relative(siteRoot, csvPath)}, so it is not rebuilt automatically. ` +
        'Rebuild it with: npm run footprint:data -- path/to/export.csv'
    );
    return;
  }

  const started = Date.now();
  const raw = parseFootprintCsv(fs.readFileSync(csvPath, 'utf8'));
  const { points, rejected } = cleanPoints(raw, DEFAULT_RULES);
  const summary = summarize(points);

  const meta = {
    generatedAt: new Date().toISOString(),
    source: { file: path.basename(csvPath), rows: raw.time.length },
    rules: DEFAULT_RULES,
    rejected,
    ...summary
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(binPath, Buffer.from(encodeFootprint(points)));
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  const dropped = Object.entries(rejected)
    .filter(([, n]) => n > 0)
    .map(([reason, n]) => `${reason} ${n}`)
    .join(', ');
  console.log(
    `Footprint data: ${raw.time.length} rows -> ${summary.points} points, ${summary.tracks} tracks, ` +
      `${summary.days} days, ${summary.distanceKm} km (dropped: ${dropped || 'none'}) in ${Date.now() - started} ms`
  );

  const regionsStarted = Date.now();
  const { summary: regions, perLevel, unassigned } = buildRegions(points);
  fs.writeFileSync(regionsPath, JSON.stringify(regions));
  const hint = fs.existsSync(chinaBoundariesDir(root)) ? '' : ' (no China provinces/cities: run npm run footprint:boundaries)';
  console.log(
    `Regions: ${perLevel[0]} countries, ${perLevel[1]} provinces/states, ${perLevel[2]} cities/counties; ` +
      `${unassigned} points outside every boundary; ${(fs.statSync(regionsPath).size / 1e6).toFixed(1)} MB ` +
      `in ${Date.now() - regionsStarted} ms${hint}`
  );
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
