import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

// MapLibre 6 looks for its worker next to its own module, which Vite's dependency
// pre-bundling (dev) and chunking (build) both move. Point it at the emitted file.
setWorkerUrl(workerUrl);
