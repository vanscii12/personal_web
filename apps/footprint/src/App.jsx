import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState } from 'react';
import { regionVisits, visitedCounts } from './data/regions.js';
import { useFootprint } from './data/useFootprint.js';
import { FootprintMap } from './map/FootprintMap.jsx';
import { FOG } from './shared/tileStyle.js';
import { Crumb } from './ui/Crumb.jsx';
import { Hud } from './ui/Hud.jsx';
import './styles.css';

const FOG_RADIUS_DEBOUNCE_MS = 250;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Point index range [i0, i1) covering the selected years; points are sorted by time.
function indexRangeForYears(meta, [from, to]) {
  const i0 = meta.years.find((entry) => entry.year >= from)?.startIndex ?? meta.points;
  const i1 = meta.years.find((entry) => entry.year > to)?.startIndex ?? meta.points;
  return { i0, i1 };
}

function FootprintView({ meta, regions, client }) {
  const years = useMemo(() => meta.years.map((entry) => entry.year), [meta]);
  const [yearRange, setYearRange] = useState(() => [years[0], years.at(-1)]);
  const range = useMemo(() => indexRangeForYears(meta, yearRange), [meta, yearRange]);
  const visits = useMemo(() => (regions ? regionVisits(regions.regions, yearRange) : null), [regions, yearRange]);
  const lit = useMemo(() => (visits ? visitedCounts(regions.regions, visits) : null), [regions, visits]);
  const [radius, setRadius] = useState(FOG.defaultRadiusMeters);
  const fogRadius = useDebouncedValue(radius, FOG_RADIUS_DEBOUNCE_MS);
  const [layers, setLayers] = useState({ fog: true, trails: true, regions: true, terrain: true });
  const [stats, setStats] = useState(null);
  const [viewCommand, setViewCommand] = useState(null);

  useEffect(() => {
    let active = true;
    client
      .call('stats', range)
      .then((result) => active && setStats(result))
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
  }, [client, range]);

  return (
    <main className="app">
      <FootprintMap
        meta={meta}
        regions={regions}
        visits={visits}
        client={client}
        range={range}
        fogRadius={fogRadius}
        showFog={layers.fog}
        showTrails={layers.trails}
        showRegions={layers.regions}
        showTerrain={layers.terrain}
        viewCommand={viewCommand}
      />
      <Hud
        meta={meta}
        stats={stats}
        lit={lit}
        years={years}
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        radius={radius}
        onRadiusChange={setRadius}
        layers={layers}
        onLayersChange={setLayers}
        onView={(type) => setViewCommand({ type, at: Date.now() })}
      />
    </main>
  );
}

function Splash({ children }) {
  return (
    <main className="splash">
      <div className="splash__card rise-in">
        <Crumb />
        <h1 className="title">
          Footprint<span className="title__dot">.</span>
        </h1>
        {children}
      </div>
    </main>
  );
}

function FootprintScreen() {
  const footprint = useFootprint();

  if (footprint.status === 'ready' && footprint.meta.points > 0) {
    return <FootprintView meta={footprint.meta} regions={footprint.regions} client={footprint.client} />;
  }
  if (footprint.status === 'loading') {
    return (
      <Splash>
        <p className="empty">正在加载足迹 …</p>
      </Splash>
    );
  }
  if (footprint.status === 'error') {
    return (
      <Splash>
        <p className="warn">{footprint.error}</p>
      </Splash>
    );
  }
  return (
    <Splash>
      <p className="empty">
        还没有足迹数据。把导出的 CSV 放到 <span className="mono">apps/footprint/data/backUpData.csv</span>，然后运行{' '}
        <span className="mono">npm run footprint:data</span>。
      </p>
    </Splash>
  );
}

// The site mounts this at /apps/footprint (see src/apps/index.js), lazily and full-screen,
// outside its own layout. styles.css scopes every rule to this root element.
export default function FootprintApp() {
  return (
    <div className="footprint" lang="zh-CN">
      <FootprintScreen />
    </div>
  );
}
