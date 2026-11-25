/**
 * My Apps — the apps listed on /apps, and the copy around them; edit text here, not in Apps.jsx.
 *
 * Each app's code lives in its own folder under apps/ at the repository root, with its own
 * CLAUDE.md and README. `load` imports the app on demand, so its code (and whatever data it
 * fetches) is downloaded only when its page is opened. src/App.jsx gives every entry a route
 * at /apps/<id>, where the app runs full-screen, outside the site layout. `Specimen` is a small
 * drawing for the app's card; without one the card shows the glyph.
 */
import { FootprintSpecimen } from '../../apps/footprint/src/Specimen.jsx'

export const intro = {
  // Follows the count in the subtitle: "1 app · …"
  tagline: 'small things I built and still use',
}

export const apps = [
  {
    id: 'footprint',
    name: 'Footprint',
    glyph: '⌖',
    kind: 'personal map',
    blurb:
      'My phone’s GPS history, drawn like ink on linen: routes darken and widen with every pass, unexplored land stays under fog, and the countries, provinces and cities I’ve been to light up over 3D terrain.',
    tags: ['MapLibre', 'Web Workers', '3D terrain'],
    meta: 'opens full-screen · interface in Chinese',
    Specimen: FootprintSpecimen,
    load: () => import('../../apps/footprint/src/App.jsx'),
  },
]
