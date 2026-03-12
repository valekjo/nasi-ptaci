# Nasi Ptaci

Atlas and quiz website for Czech birds, built with [Astro](https://astro.build/) and [Preact](https://preactjs.com/).

Browse 184 bird species with photos, sounds, and detailed descriptions — or test your knowledge in the interactive quiz.

## Features

**Atlas** — Searchable grid of all birds, sorted alphabetically. Click any card to see the full detail page with photo, sound player, taxonomy, size info, and rich description. Diacritics-insensitive search.

**Quiz** — Two modes: identify a bird by photo or by sound. Choose 10, 20, or 30 questions. Optionally pick a custom subset of birds. Results screen with score and answer review.

## Getting Started

```bash
npm install
npm run dev
```

This runs the data build pipeline and starts the dev server.

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build:data` | Regenerate bird index and content from source markdown |
| `npm run build` | Build static site for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Playwright end-to-end tests |

## Data Pipeline

`scripts/build-bird-index.mjs` reads 198 crawled markdown files from `data/`, extracts bird species (184 total), matches them with images and MP3 sounds in `public/media/`, and outputs:

- `src/data/birds.json` — full index used by the atlas grid and quiz
- `src/content/birds/*.md` — enriched markdown with frontmatter for Astro's content collection

## Tech Stack

- **Astro 6** — static site generation
- **Preact** — lightweight interactive islands for the quiz
- **Playwright** — end-to-end tests (38 tests)

## Data Source

Bird data sourced from [nasiptaci.info](https://nasiptaci.info).
