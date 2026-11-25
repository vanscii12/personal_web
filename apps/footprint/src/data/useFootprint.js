import { useEffect, useState } from 'react';
import { createFootprintClient } from './footprintClient.js';

// Written by scripts/build-data.mjs into the site's public/data/footprint/.
const DATA_URL = `${import.meta.env.BASE_URL}data/footprint/`;

class MissingDataError extends Error {}

// The dev server answers unknown paths with index.html, so check the content type too.
async function fetchData(name, expectedType) {
  const response = await fetch(DATA_URL + name);
  const type = response.headers.get('content-type') ?? '';
  if (response.status === 404 || type.includes('text/html')) throw new MissingDataError(name);
  if (!response.ok) throw new Error(`Loading ${name} failed: HTTP ${response.status}`);
  if (!type.includes(expectedType)) throw new Error(`Loading ${name} returned ${type}`);
  return expectedType === 'json' ? response.json() : response.arrayBuffer();
}

// regions.json is optional: without it the map simply has no region layer.
function optional(promise) {
  return promise.catch((error) => {
    if (error instanceof MissingDataError) return null;
    throw error;
  });
}

// Loads meta.json, footprint.bin and regions.json and hands the points to the worker pool.
// Returns { status: 'loading' | 'missing' | 'error' | 'ready', meta, regions, client, error }.
export function useFootprint() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let active = true;
    const client = createFootprintClient();

    (async () => {
      try {
        const [meta, buffer, regions] = await Promise.all([
          fetchData('meta.json', 'json'),
          fetchData('footprint.bin', 'octet-stream'),
          optional(fetchData('regions.json', 'json'))
        ]);
        await client.init(buffer);
        if (active) setState({ status: 'ready', meta, regions, client });
      } catch (error) {
        if (!active) return;
        if (error instanceof MissingDataError) setState({ status: 'missing' });
        else setState({ status: 'error', error: error.message });
      }
    })();

    return () => {
      active = false;
      client.terminate();
    };
  }, []);

  return state;
}
