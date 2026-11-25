// Loads administrative boundaries as a flat list of units:
//   { id, name, level, parent, geometry }  level 0 country, 1 province/state, 2 city/county
// China comes from DataV (data/boundaries/china, see scripts/fetch-boundaries.mjs), the US
// from us-atlas, other countries from world-atlas (Natural Earth). Geometries are GeoJSON
// Polygon/MultiPolygon in WGS-84.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import countryCodes from 'i18n-iso-countries';
import { feature } from 'topojson-client';
import { gcjToWgs } from './gcj.mjs';

const require = createRequire(import.meta.url);

// Municipalities, Taiwan, Hong Kong and Macau each count as one city-level unit; their
// detail files list districts, which are merged.
const SINGLE_CITY_PROVINCES = new Set(['110000', '120000', '310000', '500000', '710000', '810000', '820000']);
// Natural Earth countries replaced by the DataV data when it is present (ISO numeric codes).
const CHINA_REGION_CODES = new Set(['156', '158', '344', '446']);
const US_CODE = '840';

export function chinaDetailFile(adcode) {
  return adcode === '710000' ? '710000.json' : `${adcode}_full.json`;
}

function polygonsOf(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function toWgs(geometry) {
  const polygons = polygonsOf(geometry).map((rings) => rings.map((ring) => ring.map(([lon, lat]) => gcjToWgs(lon, lat))));
  return { type: 'MultiPolygon', coordinates: polygons };
}

function merged(geometries) {
  return { type: 'MultiPolygon', coordinates: geometries.flatMap(polygonsOf) };
}

function topoFeatures(topology, object) {
  const converted = feature(topology, object);
  return converted.type === 'FeatureCollection' ? converted.features : [converted];
}

function loadChina(dir) {
  const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const units = [{ id: 'CN', name: '中国', level: 0, parent: null, geometry: toWgs(read('100000.json').features[0].geometry) }];

  for (const province of read('100000_full.json').features) {
    const adcode = String(province.properties.adcode);
    if (!/^\d{6}$/.test(adcode)) continue; // the nine-dash line is a separate, non-area feature
    const provinceId = `CN-${adcode}`;
    units.push({ id: provinceId, name: province.properties.name, level: 1, parent: 'CN', geometry: toWgs(province.geometry) });

    const detail = path.join(dir, chinaDetailFile(adcode));
    if (!fs.existsSync(detail)) continue;
    const children = read(chinaDetailFile(adcode)).features;
    if (SINGLE_CITY_PROVINCES.has(adcode)) {
      const geometry = toWgs(merged(children.map((child) => child.geometry)));
      units.push({ id: `CN-C-${adcode}`, name: province.properties.name, level: 2, parent: provinceId, geometry });
    } else {
      for (const city of children) {
        const id = `CN-C-${city.properties.adcode}`;
        units.push({ id, name: city.properties.name, level: 2, parent: provinceId, geometry: toWgs(city.geometry) });
      }
    }
  }
  return units;
}

function loadUnitedStates() {
  const topology = require('us-atlas/counties-10m.json');
  const units = [
    { id: 'US', name: '美国', level: 0, parent: null, geometry: topoFeatures(topology, topology.objects.nation)[0].geometry }
  ];
  for (const state of topoFeatures(topology, topology.objects.states)) {
    units.push({ id: `US-${state.id}`, name: state.properties.name, level: 1, parent: 'US', geometry: state.geometry });
  }
  for (const county of topoFeatures(topology, topology.objects.counties)) {
    const parent = `US-${String(county.id).slice(0, 2)}`;
    units.push({ id: `US-${county.id}`, name: county.properties.name, level: 2, parent, geometry: county.geometry });
  }
  return units;
}

function loadWorld(skip) {
  const topology = require('world-atlas/countries-10m.json');
  return topoFeatures(topology, topology.objects.countries)
    .filter((country) => !skip.has(String(country.id)))
    .map((country) => {
      const code = country.id === undefined ? null : String(country.id);
      const alpha2 = code && countryCodes.numericToAlpha2(code);
      return {
        id: `W-${code ?? country.properties.name}`,
        name: (alpha2 && countryCodes.getName(alpha2, 'zh')) || country.properties.name,
        level: 0,
        parent: null,
        geometry: country.geometry
      };
    });
}

export function chinaBoundariesDir(root) {
  return path.join(root, 'data', 'boundaries', 'china');
}

// Without the DataV download, China falls back to Natural Earth countries (no provinces).
export function loadBoundaryUnits(root) {
  const chinaDir = chinaBoundariesDir(root);
  const hasChina = fs.existsSync(path.join(chinaDir, '100000_full.json'));
  const skip = new Set([US_CODE, ...(hasChina ? CHINA_REGION_CODES : [])]);
  return [...loadWorld(skip), ...loadUnitedStates(), ...(hasChina ? loadChina(chinaDir) : [])];
}
