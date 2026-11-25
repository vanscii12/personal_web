// Downloads China's national outline, provinces and prefecture-level cities from Aliyun
// DataV GeoAtlas into data/boundaries/china/. Files already present are kept. US and world
// boundaries ship with the us-atlas and world-atlas packages and need no download.
// DataV coordinates are GCJ-02; scripts/lib/boundaries.mjs converts them to WGS-84.
//
// Usage (from the site root): npm run footprint:boundaries [-- --force]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chinaDetailFile } from './lib/boundaries.mjs';

const BASE_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/';
const PAUSE_MS = 150;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'data', 'boundaries', 'china');
const force = process.argv.includes('--force');

async function download(name) {
  const file = path.join(outDir, name);
  if (!force && fs.existsSync(file)) return { name, bytes: fs.statSync(file).size, cached: true };
  const response = await fetch(BASE_URL + name);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const text = await response.text();
  JSON.parse(text);
  fs.writeFileSync(file, text);
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  return { name, bytes: text.length, cached: false };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const results = [await download('100000.json'), await download('100000_full.json')];

  const provinces = JSON.parse(fs.readFileSync(path.join(outDir, '100000_full.json'), 'utf8'))
    .features.map((feature) => String(feature.properties.adcode))
    .filter((adcode) => /^\d{6}$/.test(adcode));
  for (const adcode of provinces) results.push(await download(chinaDetailFile(adcode)));

  const fetched = results.filter((result) => !result.cached);
  const megabytes = (results.reduce((sum, result) => sum + result.bytes, 0) / 1e6).toFixed(1);
  console.log(`China boundaries: ${results.length} files, ${megabytes} MB (${fetched.length} downloaded) in ${path.relative(process.cwd(), outDir)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
