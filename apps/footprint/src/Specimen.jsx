import { useId } from 'react';
import { FOG, trailColorCss } from './shared/tileStyle.js';

// A drawn sample of the map for the site's My Apps page (src/apps/index.js). The routes are
// invented, not read from the data. The colors are the app's own: linen paper, the fog cleared
// around every route, fogged water, a lit region with its sage outline, and trails that darken
// and widen with passes. Layer order follows the map (src/map/FootprintMap.jsx).
const LINEN = '#F0EBE3';
const SURFACE = '#F7F3EE';
const SAGE = '#8B9A7B';
const FOGGED_WATER = '#B7C2C4';

const ROUTES = [
  { passes: 1, width: 1.1, d: 'M232 94C252 88 270 70 284 50S306 24 326 14' },
  { passes: 1, width: 1.1, d: 'M188 108C196 130 206 152 214 176S222 196 228 208' },
  { passes: 5, width: 1.7, d: 'M118 136C96 140 80 128 66 110S56 74 72 64 112 60 124 74 140 104 150 124' },
  { passes: 20, width: 2.4, d: 'M188 108C186 92 180 74 176 52S168 30 160 16' },
  { passes: 80, width: 3.2, d: 'M232 94C214 99 200 104 188 108 168 114 148 130 118 136' }
];
const REGION = 'M124 66L158 58 196 62 236 70 258 92 250 124 226 150 186 160 148 156 114 142 102 112Z';
const WATER = 'M326 120C304 134 288 156 280 174S270 196 268 206H326Z';

export function FootprintSpecimen() {
  const id = useId().replace(/:/g, '');
  const clear = `${id}-clear`;
  const soften = `${id}-soften`;

  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id={soften} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id={clear} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="200">
          <rect width="320" height="200" fill="white" />
          <g filter={`url(#${soften})`} fill="none" stroke="black" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            {ROUTES.map((route) => (
              <path key={route.d} d={route.d} />
            ))}
          </g>
        </mask>
      </defs>
      <rect width="320" height="200" fill={LINEN} />
      <rect width="320" height="200" fill={FOG.fogColor} mask={`url(#${clear})`} />
      <path d={WATER} fill={FOGGED_WATER} />
      <path d={REGION} fill={SURFACE} fillOpacity="0.45" stroke={SAGE} strokeWidth="1" strokeLinejoin="round" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ROUTES.map((route) => (
          <path key={route.d} d={route.d} stroke={trailColorCss(route.passes)} strokeWidth={route.width} />
        ))}
      </g>
    </svg>
  );
}
