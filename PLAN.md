# Naši Ptáci - Astro.js Bird Atlas & Quiz Website

## Context
We have 198 crawled markdown files from nasiptaci.info (170+ bird species), 396 MP3 bird sounds, and ~181 images in `/public/media/`. Goal: build a static Astro.js website with a bird atlas and interactive quiz, styled as a birdwatcher's handwritten field notebook.

## User Decisions
- **Language**: Czech UI
- **Quiz**: Fixed rounds (pick 10/20/30 at start, results at end)
- **Atlas**: Grid of summary cards → click for full detail page
- **Style**: Birdwatcher's handwritten notebook on paper

---

## Phase 1: Project Setup & Data Pipeline

### 1a. Initialize Astro project
```bash
npm create astro@latest . -- --template minimal
npm install @astrojs/preact preact
```
- Preact for quiz interactivity only (3KB vs 40KB React)
- Everything else is static Astro components

### 1b. Build script: `scripts/build-bird-index.mjs`
Pre-build Node script that:
1. Reads all `.md` files in `/data/`
2. **Filters birds**: keep only files containing `## Velikost` (100% accurate heuristic)
3. **Extracts per bird**:
   - `slug` from filename (`kos-cerny.md` → `kos-cerny`)
   - `czechName` from `#### <name>` line
   - `latinName` from `**CzechName (LatinName)**` pattern
   - `taxonomy` (řád, čeleď) from bulleted list
   - `size` (délka, rozpětí, hmotnost) from Velikost section
4. **Matches media**:
   - Image: find `{slug}.{jpg,png,gif}` in `/public/media/`
   - Sound: find `*-{slug}-1.mp3` in `/public/media/`
5. **Outputs**:
   - `src/data/birds.json` — full index for atlas grid & quiz
   - `src/content/birds/{slug}.md` — enriched markdown with clean frontmatter, stripped of redundant header lines

### 1c. Content collection config (`src/content.config.ts`)
Define `birds` collection with typed schema (czechName, latinName, image, sounds, size, taxonomy).

---

## Phase 2: Atlas

### 2a. Homepage — Atlas Grid (`src/pages/index.astro`)
- Import `birds.json`, render grid of `BirdCard` components
- Each card: thumbnail image, Czech name, Latin name italic
- Cards link to `/atlas/{slug}/`
- Client-side search filter via inline `<script>` + `data-name` attributes (no framework needed)
- Alphabetical sort by Czech name

### 2b. Detail Page (`src/pages/atlas/[slug].astro`)
- `getStaticPaths()` from content collection
- Bird image as hero (styled as taped photo)
- Sound player (`<audio>` with custom styled play button)
- Taxonomy & size in a sidebar/info box
- Full markdown body via Astro `<Content />`
- Back to atlas link, prev/next bird navigation
- Link to original source page on nasiptaci.info (e.g. `https://nasiptaci.info/kos-cerny/`)

---

## Phase 3: Quiz (Preact Islands)

### 3a. Quiz Setup (`src/pages/kviz/index.astro` + `QuizSetup.tsx`)
- Two mode cards: "Poznej podle fotky" / "Poznej podle hlasu"
- Round count selector: 10 / 20 / 30
- "Vlastní sada ptáků" button → opens `BirdSetManager.tsx`
- Start button navigates to `/kviz/hra?mode=image&count=10`

### 3b. Quiz Game (`src/pages/kviz/hra.astro` + `Quiz.tsx`)
- Reads mode & count from query params, custom set from localStorage
- Filters birds to those with required media
- Per question: 1 correct + 3 random distractors, shuffled
- **Image mode**: show bird image → pick from 4 name buttons
- **Sound mode**: play sound → pick from 4 image+name cards
- On answer: highlight correct/wrong, brief delay, next question
- After last question: results screen with score + answer review

### 3c. Bird Set Manager (`BirdSetManager.tsx`)
- Checklist of all birds with search filter
- Select all / deselect all
- Saves to `localStorage` key `"nasiptaci-bird-set"`
- Toggle to use all birds (clears custom set)

---

## Phase 4: Notebook Styling

### Typography
- **Headings**: "Caveat" (handwritten, Czech diacritics supported)
- **Body**: "Kalam" (readable handwritten)
- **Latin names**: system serif italic
- Self-hosted `.woff2` in `/public/fonts/`

### Color Palette
- Background: `#f5f0e8` (aged paper) with tiled paper texture
- Text: `#3d3225` (dark brown ink)
- Accent: `#5a7a3a` (nature green)
- Borders: `#8b7355` (brown)
- Correct: `#4a7a4a` / Wrong: `#a04040`

### Notebook Effects
- Faint ruled lines via `repeating-linear-gradient`
- Cards as small notebook pages with slight random rotation (`rotate(-0.5deg)` to `rotate(0.5deg)`)
- Photos styled as taped/pinned with shadow + CSS pseudo-element tape corners
- Asymmetric `border-radius` for hand-drawn feel
- Audio player styled as simple sketchy play button

---

## Footer
- Credit the original data source: link to [nasiptaci.info](https://nasiptaci.info) with a short attribution line (e.g. "Data z nasiptaci.info")
- Displayed on every page via `BaseLayout.astro`

---

## File Structure
```
astro.config.mjs
package.json
scripts/
  build-bird-index.mjs
data/                          # Original crawled markdown (untouched)
public/
  media/                       # Existing images + MP3s (untouched)
  fonts/                       # Caveat + Kalam .woff2
src/
  content/
    config.ts
    birds/                     # Generated by build script (gitignored)
  data/
    birds.json                 # Generated bird index (gitignored)
  layouts/
    BaseLayout.astro
  pages/
    index.astro                # Atlas grid
    atlas/[slug].astro         # Bird detail
    kviz/index.astro           # Quiz setup
    kviz/hra.astro             # Quiz game
  components/
    BirdCard.astro
    SoundPlayer.astro
    Quiz.tsx                   # Preact
    QuizSetup.tsx              # Preact
    BirdSetManager.tsx         # Preact
  styles/
    global.css
```

---

## Verification
1. `node scripts/build-bird-index.mjs` — check it finds ~170+ birds, matches images & sounds
2. `npm run dev` — verify atlas grid loads, cards show images, search works
3. Click a bird card → detail page renders full content + sound player
4. Navigate to `/kviz/` → pick mode & count → play through quiz → see results
5. Configure custom bird set → verify quiz only uses selected birds
6. Test on mobile viewport (responsive grid)
