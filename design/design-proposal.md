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
