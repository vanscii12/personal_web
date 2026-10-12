# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server on port 3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

## Architecture

A personal website with two main content areas: a **photo gallery** and **physics/math notes**. Built with Vite + React 18 + React Router 7 + Tailwind CSS 4 + motion (framer-motion).

### Routing (React Router v7)

All routes live inside `<Layout />`, which provides a fixed top-left branding link and a fixed bottom navigation pill:

| Path | Page | Component |
|------|------|-----------|
| `/` | Home | `Home.jsx` |
| `/gallery` | Gallery index | `Gallery.jsx` |
| `/gallery/:categoryId` | Category list | `GalleryCategory.jsx` |
| `/gallery/:categoryId/:itemId` | Image detail | `GalleryDetail.jsx` |
| `/notes` | Notes index | `Notes.jsx` |
| `/notes/:noteId` | Note detail | `NotesDetail.jsx` |

### Gallery data model

Three categories defined in `src/gallery/categories.js`: `travel`, `film`, `daily`.

- **Category list files** (`src/gallery/items/travel.js`, `film.js`, `daily.js`) export arrays of item summaries (id, title, date, count, note, coverImage).
- **Item detail files** (`src/gallery/items/<category>/<id>.js`) export `metadata` and `images` arrays. These are dynamically imported via lazy loaders in `src/gallery/items.js`.
- `GalleryDetail.jsx` uses `loadItemData(itemId)` which calls the dynamic import, returning `{ ...metadata, images }`.
- `GalleryGridImage.jsx` wraps each image with `IntersectionObserver` for lazy loading, with thumbSrc fallback on error.

### Notes data model

- Note content lives as JS modules in `src/notes/` (e.g., `maxwell-equation.js`), each exporting `metadata` and `content` (a raw string with `$...$` inline math and `$$...$$` display math).
- `src/notes/index.js` imports these modules, maintains a `notes` array (including placeholder entries without content), and provides `getNote(id)`.
- `NotesDetail.jsx` has a custom `renderContent()` that parses markdown-like headings (`#`, `##`, `###`) and math delimiters into React elements, then loads MathJax 2.7 via CDN to typeset LaTeX.

### Design tokens

Defined in `src/index.css` via Tailwind v4 `@theme`:
- Colors: `bg` (#EBE9E1 warm off-white), `text-primary` (#1A1A1A), `text-secondary` (#55544E), `text-tertiary` (#8C8A82), `surface` (#D1CFC7)
- Fonts: serif = Cormorant Garamond, sans = Manrope/Inter
- Common pattern: `bg-white/70 border border-white/60 rounded-2xl` for cards

### `src/lib/utils.js`

Exports `cn()` — a `clsx` + `tailwind-merge` combiner used across components.

### Python helper scripts (in `scripts/`)

- **`batch_to_webp.py`** — Converts JPG/PNG to WebP, optionally generates thumbnails in a `thumbs/` subdirectory.
- **`generate_gallery_data.py`** — Scans an image folder and generates both the item detail JS file and updates the category list file + `items.js` loader registry.
- **`latex_to_note.py`** — Converts a `.tex` file to a note JS module by extracting the document body, translating math environments (`\begin{equation}` → `$$`, `\(` → `$`), converting `\section` commands to markdown headings, and stripping preamble/noise commands.

### Static assets

- `public/img-webp/` — WebP images served at runtime (organized by category)
- `public/` — Vite public directory (`favicon.svg`, etc.)
- `img/` — Original high-resolution source images (not bundled)
