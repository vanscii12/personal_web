/**
 * About page content — the one place to edit its copy.
 *
 * The numbers on the page (photographs, rolls, notes) are not stored here:
 * they are computed from the gallery and notes registries so they never drift.
 */

export const profile = {
  name: 'VanScii',
  tagline: 'Photographs, field notes, and things worth remembering.',

  // *Asterisked* words render in the sage accent colour, like the home headline.
  lede: 'I make photographs on *film* and in pixels, and keep notes on the *physics* and *mathematics* I’m working through.',

  paragraphs: [
    'This site is a slow, hand-kept archive. Photographs are gathered by roll, by place and by date, and they go up when they’re ready rather than when they’re new.',
    'The notes are the other half: derivations rewritten step by step until they make sense, then typeset so the equations read as easily as the prose.',
  ],

  quote:
    'Light turns up on both sides of this site — as exposure in the photographs, as electromagnetism in the notes.',

  // Plain facts, shown as a definition list. `values` are joined with a sage dot.
  facts: [
    { label: 'medium', values: ['film', 'digital'] },
    { label: 'subjects', values: ['skies', 'coastlines', 'mountains', 'quiet streets'] },
    { label: 'places', values: ['Dali 2020', 'Santa Barbara 2021–22', 'Xinjiang 2026'] },
    { label: 'notes on', values: ['electrodynamics', 'classical mechanics', 'spacetime & geometry'] },
  ],

  // The photograph beside the introduction. `thumb` is tried first, then `src`.
  // `to` makes it a door into the roll it came from; `frame` is the film-edge number.
  portrait: {
    src: '/img-webp/film/2025-xinjiang/000073800021.webp',
    thumb: '/img-webp/film/2025-xinjiang/thumbs/000073800021.webp',
    alt: 'Birch trees along a snow-covered slope under a pale blue sky',
    caption: 'Xinjiang, March 2026',
    frame: '21',
    to: '/gallery/film/2026-xinjiang',
  },

  // Sentence above the contact links (only shown when `links` is not empty).
  contactNote: 'If a frame or an equation here is useful — or wrong — I would like to hear about it.',
}

// The two halves of the site, as panels that link into them.
export const practice = {
  photographs: {
    glyph: '◎',
    eyebrow: 'archive',
    title: 'Photographs',
    blurb: 'Film rolls, trips and dated daily sequences, kept in the order they were made.',
    to: '/gallery',
  },
  notes: {
    glyph: '⟨ψ⟩',
    eyebrow: 'notes',
    title: 'Notes',
    blurb: 'Physics and mathematics, derived step by step, with the equations typeset in LaTeX.',
    to: '/notes',
  },
}

// One line per subject in the notes, shown as a "specimen" on the Notes panel.
export const equations = [
  { eq: '∇·E = ρ/ε₀', label: 'electrodynamics' },
  { eq: 'δS = 0', label: 'classical mechanics' },
  { eq: 'ds² = −c²dt² + dx²', label: 'spacetime' },
]

// Where to find you. Leave empty and the "Elsewhere" section stays hidden.
// Example: { label: 'email', handle: 'you@example.com', href: 'mailto:you@example.com' }
export const links = []

export const colophon = [
  'Set in Playfair Display, Inter & JetBrains Mono',
  'Built with React, Vite & Tailwind CSS',
  'Equations by MathJax',
]
