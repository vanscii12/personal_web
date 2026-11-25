import { MapLibreMap, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { dayIndexToIsoDate, EARTH_CIRCUMFERENCE_METERS } from '../shared/geo.js';
import { fogTileUrl, TILE_SIZE, trailColorCss, trailTileUrl } from '../shared/tileStyle.js';
import { count } from '../ui/format.js';
import { applyBasemapTheme } from './basemapTheme.js';
import './maplibreSetup.js';
import { addFogOutlines, OUTLINE_LAYER_IDS } from './outlines.js';
import { addRegionLayers, REGION_LAYER_IDS } from './regionLayers.js';
import { addTerrainLayers, HILLSHADE_LAYER_ID, setTerrainEnabled } from './terrain.js';
import {
  addFootprintLayers,
  attachTileRenderer,
  FOG_LAYER_ID,
  setOverlayTiles,
  TRAIL_LAYER_ID
} from './tileSources.js';

const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ?? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const CJK_FONTS = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
const HOME_VIEW = { zoom: 11.5, pitch: 55, bearing: -18 };
const FLY_DURATION_MS = 2400;
const HOVER_RADIUS_PX = 14;
const MIN_HOVER_RADIUS_METERS = 30;

function hoverRadiusMeters(map, lat) {
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos((lat * Math.PI) / 180)) / (TILE_SIZE * 2 ** map.getZoom());
  return Math.max(MIN_HOVER_RADIUS_METERS, HOVER_RADIUS_PX * metersPerPixel);
}

function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function dateRange(firstDay, lastDay) {
  const first = dayIndexToIsoDate(firstDay);
  const last = dayIndexToIsoDate(lastDay);
  return first === last ? first : `${first} → ${last}`;
}

function overviewPadding() {
  const wide = window.innerWidth > 760;
  return { top: 60, bottom: 60, left: wide ? 400 : 40, right: 60 };
}

function MapTooltip({ tip, regions, visits }) {
  const { place, regionId } = tip;
  const region = regionId === null ? null : regions[regionId];
  const visit = regionId === null ? null : visits[regionId];
  const parent = region && region.parent >= 0 ? regions[region.parent] : null;
  return (
    <div className="place-tip" style={{ transform: `translate(${tip.x + 14}px, ${tip.y + 14}px)` }}>
      {region && visit ? (
        <div className="place-tip__block">
          <div className="place-tip__title">
            {region.name}
            {parent ? <span> · {parent.name}</span> : null}
          </div>
          <div className="place-tip__date">{dateRange(visit.firstDay, visit.lastDay)}</div>
          <div className="place-tip__row">
            <i className="key key--region" />
            <b>{count(visit.days)}</b>
            <span>天到过</span>
          </div>
        </div>
      ) : null}
      {place ? (
        <div className="place-tip__block">
          <div className="place-tip__note">附近 {formatDistance(tip.radius)}</div>
          <div className="place-tip__date">{dateRange(place.firstDay, place.lastDay)}</div>
          <div className="place-tip__row">
            <i className="key" />
            <b>{count(place.days)}</b>
            <span>天去过</span>
          </div>
          <div className="place-tip__row">
            <i className="key" style={{ background: trailColorCss(place.passes) }} />
            <b>{count(place.passes)}</b>
            <span>次经过</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FootprintMap({
  meta,
  regions,
  visits,
  client,
  range,
  fogRadius,
  showFog,
  showTrails,
  showRegions,
  showTerrain,
  viewCommand
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const regionLayerRef = useRef(null);
  const urlsRef = useRef({});
  const latestRef = useRef(null);
  latestRef.current = { fogRadius, range, visits, showRegions };

  const [mapReady, setMapReady] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    attachTileRenderer(client);
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: meta.home ?? [0, 20],
      ...(meta.home ? HOME_VIEW : { zoom: 1.5 }),
      maxPitch: 80,
      hash: true,
      attributionControl: { compact: true },
      localIdeographFontFamily: CJK_FONTS,
      canvasContextAttributes: { antialias: true }
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    if (import.meta.env.DEV) window.footprintDebug = { map, client };

    let hoveredRegion = null;
    const hoverRegion = (next) => {
      if (next === hoveredRegion || !regionLayerRef.current) return;
      regionLayerRef.current.hover(hoveredRegion, next);
      hoveredRegion = next;
    };

    // One place query in flight at a time; the latest pointer position waits for it.
    let hoverRequest = null;
    let waiting = null;
    const queryPlace = (point, lngLat) => {
      if (hoverRequest) {
        waiting = { point, lngLat };
        return;
      }
      const { range: current } = latestRef.current;
      const radius = hoverRadiusMeters(map, lngLat.lat);
      hoverRequest = new AbortController();
      client
        .call(
          'place',
          { lon: lngLat.lng, lat: lngLat.lat, radiusMeters: radius, i0: current.i0, i1: current.i1 },
          hoverRequest.signal
        )
        .then((place) => {
          const { visits: currentVisits, showRegions: regionsShown } = latestRef.current;
          const layer = regionLayerRef.current;
          const regionId = layer && regionsShown ? layer.at(point, currentVisits) : null;
          hoverRegion(regionId);
          setTooltip(place || regionId !== null ? { x: point.x, y: point.y, radius, place, regionId } : null);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') console.error(error);
        })
        .finally(() => {
          hoverRequest = null;
          if (waiting) {
            const next = waiting;
            waiting = null;
            queryPlace(next.point, next.lngLat);
          }
        });
    };
    const clearTooltip = () => {
      waiting = null;
      hoverRequest?.abort();
      if (mapRef.current) hoverRegion(null);
      setTooltip(null);
    };

    map.on('mousemove', (event) => {
      if (!map.isMoving()) queryPlace(event.point, event.lngLat);
    });
    map.on('movestart', clearTooltip);
    map.getCanvasContainer().addEventListener('mouseleave', clearTooltip);

    // style.load fires before the first frame, so the basemap never shows its own colors.
    map.once('style.load', () => {
      applyBasemapTheme(map);
      const { fogRadius: radius, range: initialRange } = latestRef.current;
      urlsRef.current = { fog: fogTileUrl(radius, initialRange), trail: trailTileUrl(initialRange) };
      addFootprintLayers(map, { fogUrl: urlsRef.current.fog, trailUrl: urlsRef.current.trail });
      addTerrainLayers(map, TRAIL_LAYER_ID);
      addFogOutlines(map, HILLSHADE_LAYER_ID);
      if (regions) regionLayerRef.current = addRegionLayers(map, regions, HILLSHADE_LAYER_ID);
      setMapReady(true);
    });

    return () => {
      setMapReady(false);
      clearTooltip();
      map.remove();
      mapRef.current = null;
      regionLayerRef.current = null;
      if (import.meta.env.DEV) delete window.footprintDebug;
    };
  }, [client, meta, regions]);

  useEffect(() => {
    if (!mapReady) return;
    const fog = fogTileUrl(fogRadius, range);
    const trail = trailTileUrl(range);
    if (fog !== urlsRef.current.fog) setOverlayTiles(mapRef.current, FOG_LAYER_ID, fog);
    if (trail !== urlsRef.current.trail) setOverlayTiles(mapRef.current, TRAIL_LAYER_ID, trail);
    urlsRef.current = { fog, trail };
  }, [mapReady, fogRadius, range]);

  useEffect(() => {
    if (mapReady && visits) regionLayerRef.current?.update(visits);
  }, [mapReady, visits]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const show = (id, visible) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    };
    show(FOG_LAYER_ID, showFog);
    for (const id of OUTLINE_LAYER_IDS) show(id, showFog);
    show(TRAIL_LAYER_ID, showTrails);
    for (const id of REGION_LAYER_IDS) show(id, showRegions);
  }, [mapReady, showFog, showTrails, showRegions]);

  useEffect(() => {
    if (mapReady) setTerrainEnabled(mapRef.current, showTerrain);
  }, [mapReady, showTerrain]);

  useEffect(() => {
    if (!mapReady || !viewCommand) return;
    const map = mapRef.current;
    if (viewCommand.type === 'home' && meta.home) {
      map.flyTo({ center: meta.home, ...HOME_VIEW, duration: FLY_DURATION_MS, essential: true });
    }
    if (viewCommand.type === 'overview' && meta.bounds) {
      const [west, south, east, north] = meta.bounds;
      map.fitBounds(
        [
          [west, south],
          [east, north]
        ],
        { padding: overviewPadding(), pitch: 0, bearing: 0, duration: FLY_DURATION_MS }
      );
    }
  }, [mapReady, viewCommand, meta]);

  return (
    <>
      <div ref={containerRef} className="map" aria-label="足迹地图" />
      {tooltip ? <MapTooltip tip={tooltip} regions={regions?.regions} visits={visits} /> : null}
    </>
  );
}
