# 🌿 "Collected Light" — New Site Design Proposal

A redesign concept that preserves the **calm, archival, analog** DNA of the current site while introducing fresh structural ideas and refined micro-interactions.

---

## Original vs. New — At a Glance

````carousel
![Original Homepage](file:///E:/Personal-Web/design/.user_uploaded/media_1791798587629_73aba305.png)
<!-- slide -->
![New Homepage Concept](file:///E:/Personal-Web/design/homepage_concept_1791798673404.jpg)
<!-- slide -->
![Original Film Rolls](file:///E:/Personal-Web/design/.user_uploaded/media_1791798587626_7f437240.png)
<!-- slide -->
![New Gallery Concept](file:///E:/Personal-Web/design/gallery_page_concept_1791798688456.jpg)
<!-- slide -->
![New Journal Concept](file:///E:/Personal-Web/design/journal_page_concept_1791798700500.jpg)
````

---

## What Stays the Same (Design DNA)

| Element | Original | New |
|---------|----------|-----|
| Background | Warm linen off-white | Same family `#F0EBE3` |
| Typography | Elegant serif headings + small sans body | Same — serif titles, monospace dates |
| Color accent | Muted olive / sage green | `#8B9A7B` on key words |
| Photo style | Analog film, warm tones | Same — cream Polaroid borders added |
| Feeling | *"A calm, browsable archive"* | *"Collected light, scattered thoughts"* |

---

## What's New

### 1. Vertical Side Navigation
Replaces the bottom pill bar with **rotated text labels** pinned to the left edge — `archive` · `journal` · `about`. This frees vertical space and gives a gallery/museum feel.

### 2. Asymmetric / Staggered Photo Strip (Home)
The 4 featured photos sit at **different vertical offsets**, creating a rhythm like film negatives drying on a line.

### 3. Masonry Grid (Gallery)
Instead of uniform cards, Photo Rolls uses a **masonry layout** — photos keep their natural aspect ratios. Hover reveals a caption overlay with roll number and location.

### 4. Timeline Journal
Notes/journal entries use a **date | title | tag** horizontal row structure — editorial and scannable, like a literary magazine table of contents.

### 5. "Now" Section
A minimal footer line: *"currently — reading Borges, editing rolls from Hokkaido"* — replacing the "Currently" card with a quieter single-line treatment.

### 6. About Page

The proposal named the page but never drew it. It reuses the grammar of Notes and Photo Rolls (eyebrow label, serif title with a sage full stop, growing hairline) and is built around one idea taken from the homepage line *"collected light, scattered thoughts"*: **light appears on both sides of the site** — as exposure in the photographs, as electromagnetism in the notes.

| Section | Content | Treatment |
|---------|---------|-----------|
| Header | `ABOUT → VANSCII`, **About.**, tagline | Same as every other page header |
| Introduction | Serif lede with sage keywords, two short paragraphs, a pull-quote, a definition list of plain facts | Left column; body copy capped at 54ch |
| Portrait | One archive photograph (2:3) in a cream frame, caption and a film-edge frame number (`▸ 21`) | Right column, 300px; links to the roll it came from, hover reveals "View the roll →" |
| The archive in numbers | Photographs · rolls · notes | Three columns of large serif numerals with mono captions, divided by hairlines; computed from the gallery and notes data |
| Practice | *"Two ways of keeping light."* — a Photographs panel (three covers) and a Notes panel (three equations) | Two cream cards; hover lifts 2px and draws a sage border; each links into its half of the site |
| Elsewhere | Contact links as `note-row`s | Only rendered when links are configured |
| Colophon | Typefaces, stack, © line | Mono 11px, muted |

**Motion** — Same vocabulary and timings as the rest of the site: header and paragraphs fade up (600ms, 80ms stagger), fact rows slide in from the left (60ms stagger), the portrait and panels scale-fade in, hairlines grow from 0% to 100%. Nothing bounces.

**Responsive** — Above 860px: text column plus a 300px portrait. At 860px and below: a single column ordered lede → photograph → text. At 720px the panels stack; at 640px the numbers become rows and fact labels sit above their values.

### 7. My Apps Page

A shelf of small apps that run inside the site (`my apps` in the side nav). The page keeps the usual header — `ARCHIVE → APPS`, **My Apps.**, a count with a one-line tagline, the growing hairline — then one wide card per app, so a single app doesn't look stranded in a grid.

| Part | Content | Treatment |
|------|---------|-----------|
| Specimen | A drawing of what the app shows, in the app's own colours (Footprint: invented routes clearing the fog, a lit region, trails darkening with passes) — never a screenshot of real data | Left 5/11 of the card on linen; zooms to 1.04 on hover, like the About frames |
| Text | Glyph and eyebrow (`⌖ PERSONAL MAP`), serif name, muted blurb capped at 46ch, stack as small tag pills | Right side of the cream card |
| Foot | Mono meta line (`opens full-screen · interface in Chinese`) and a sage `enter →` | Arrow nudges 4px on hover; the card lifts 2px and takes the sage border, as the About panels do |

Entering an app leaves the site chrome behind: the app owns the viewport, and its own panel carries a `← MY APPS` crumb back. At 720px and below the specimen moves above the text at 16:10.

---

## 🎬 Motion & Interaction Design

> [!IMPORTANT]
> All animations use `ease-out` or custom cubic-bezier curves. Nothing should feel "bouncy" — the mood is **gentle, unhurried, analog**.

### Page Entry Animations

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Page heading | Fade up from `translateY(20px)`, opacity 0→1 | 600ms | 0ms |
| Subtitle / breadcrumb | Fade up | 400ms | 150ms |
| Photos (each) | Fade up + slight scale `0.97→1` | 500ms | staggered 80ms per item |
| "Now" section / footer | Fade in (no translate) | 400ms | 400ms |
| Side navigation labels | Slide in from left `translateX(-20px)` | 500ms | 300ms |

### Scroll-Triggered Animations

| Trigger | Effect |
|---------|--------|
| Photos entering viewport | Fade up + scale with `IntersectionObserver`, staggered 80ms |
| Journal rows entering viewport | Slide in from left, staggered 60ms per row |
| Section dividers (thin lines) | Width grows from 0% → 100%, `600ms ease-out` |

### Hover Micro-Interactions

| Element | Hover Effect | Duration |
|---------|-------------|----------|
| Photo card | `scale(1.03)` + subtle box-shadow appears + olive-green 1px border | 300ms |
| Photo card (gallery) | Caption overlay fades in from bottom `translateY(10px)` → `0` | 250ms |
| Journal row | Background tint shifts slightly warmer `rgba(139,154,123,0.06)` | 200ms |
| Tag pills | Background fills to olive, text goes cream | 200ms |
| Side nav labels | Opacity `0.4 → 1`, slight `translateX(4px)` nudge right | 200ms |
| "Now" text | Italic words get a subtle underline growing from center | 300ms |

### Page Transitions

```
Route change:
  1. Current page content fades out (opacity 1→0, 200ms)
  2. Short pause (50ms)
  3. New page content fades in with entry animation cascade
  
Total perceived transition: ~400ms
```

### Special: Photo Lightbox

```
Click photo:
  1. Photo scales up from its grid position to center-screen (400ms, ease-out)
  2. Background dims with warm overlay rgba(240,235,227, 0.92) (300ms)
  3. Caption slides up from bottom (300ms, 100ms delay)
  
Close:
  1. Reverse — photo scales back to grid position (350ms)
  2. Overlay fades out (250ms)
```

### Cursor

Custom cursor: a small `○` circle (12px) in charcoal that subtly scales to `●` (filled) when hovering interactive elements.

---

## CSS Motion Variables (Reference)

```css
:root {
  /* Timing */
  --ease-gentle: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out-soft: cubic-bezier(0, 0, 0.2, 1);
  --duration-fast: 200ms;
  --duration-medium: 400ms;
  --duration-slow: 600ms;
  
  /* Distances */
  --fade-distance: 20px;
  --hover-scale: 1.03;
  --hover-shadow: 0 8px 30px rgba(0,0,0,0.06);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Typography Stack

```css
--font-heading: 'Playfair Display', 'Noto Serif', Georgia, serif;
--font-body: 'Inter', 'Helvetica Neue', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-linen` | `#F0EBE3` | Page background |
| `--fg-charcoal` | `#2C2C2C` | Primary text |
| `--fg-muted` | `#8A8378` | Secondary text |
| `--accent-sage` | `#8B9A7B` | Accent words, tags, hover borders |
| `--accent-sage-light` | `rgba(139,154,123,0.12)` | Tag backgrounds, hover tints |
| `--border-warm` | `#DDD6CC` | Dividers, card borders |
| `--photo-border` | `#F7F3EE` | Polaroid-style photo frames |

---

> [!TIP]
> See the **interactive motion demo** artifact for a live preview of the hover and scroll animations described above.
