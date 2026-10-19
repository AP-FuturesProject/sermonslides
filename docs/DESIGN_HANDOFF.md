# Handoff: Futures Church Scripture Screens Tool

## Overview
A self-serve web tool for the Futures Church team. A user uploads a sermon/scripture document; the tool extracts every line that carries a scripture reference, splits long passages, highlights the words that were **bold** in the document, and renders on-brand projection screens. The user can adjust colours, emphasis and screen size, then download all screens as numbered PNGs in a zip.

## About the Design Files
`Scripture Screens Tool (standalone).html` is a **working, self-contained HTML prototype** — open it in a browser to see every behaviour described here. It is a design reference, not production code. Recreate it in the target environment (e.g. a small React/Vite or Next.js app, or keep as a static single-page app) using that codebase's patterns. `source/Scripture Screens Template.dc.html` is the readable source: the markup (inline styles) plus a `class Component` logic block at the bottom containing all parsing, splitting, sizing and export logic — port that logic directly.

## Fidelity
**High-fidelity.** Colours, type, spacing and slide geometry are final. Recreate pixel-accurately.

## Screens / Views

### 1. Tool page (single page)
Background `#f2f0ea`. Font: Gal Gothic (UI/sans) + Rhymes Display (display serif).

**Header** — white, `padding: 36px 40px 28px`, `border-bottom: 1px solid #000`, flex space-between, wraps.
- Left: eyebrow row (ray mark 18px + "FUTURES CHURCH", Gal Gothic 13px, tracking 0.22em, uppercase); H1 "Scripture SCREENS" — "Scripture" Rhymes Display 200 48px, "SCREENS" Gal Gothic 300 uppercase.
- Right: summary text ("8 screens from 7 passages", 14px #555); **Shuffle colours** (secondary pill button); **split download button** — one pill, `border:1px solid #000`, left segment yellow `#ffff5f` "STEP 3" (Gal Gothic 13px, tracking 0.2em, nowrap), right segment black with white "Download screens" (15px). Disabled → opacity 0.5; while exporting label reads "Exporting n/N…".
- Error banner below header: `#ffff5f` background, 15px text.

**Main** — flex wrap, `gap 40px`, `padding 32px 40px 64px`.

**Left panel (aside)** — `flex: 1 1 300px; max-width: 440px`, white card, `padding 28px`, `border: 1px solid #000`, `border-radius 14px`, `box-shadow: 0 2px 0 #000`, column gap 20px. In order:
1. **Before you START** — heading Rhymes Display 300 28px with "START" in Gal Gothic uppercase `#5d1fec`. Tips (14px/1.5, #333):
   - "Each verse needs its reference, like John 15:5, at the start or end of the line."
   - "Long verses are split across screens for you."
   - "If you have something you would like as a screen that isn't a scripture, add the word *SCREEN to it."
   - **See example** button (secondary, small) → opens example modal.
   Block ends with `border-bottom: 1px solid #000; padding-bottom: 24px`.
2. **Screen size** — label (Gal Gothic 13px uppercase), stacked option list in a 1px black bordered, 12px-radius box. Each row: note (STANDARD / SOUTH / CITY, 11px tracked, violet; yellow when selected) left, size label (14px) right. Selected row: black bg, white text. Options: 1920×1080 (default), 3264×960 (South), 3072×960 (City).
3. **Message title on screens** — label + toggle switch (44×26, knob 22px; on `#5d1fec`, off `#d9d6cc`; 150–180ms ease-out) + text input (bg `#f2f0ea`, 1px rgba(0,0,0,.2), radius 10px). Off by default.
4. **STEP 1** eyebrow (violet) + **upload panel**: full-width button, black bg (violet while dragging), `2px dashed` border rgba(255,255,255,.5) (yellow while dragging), radius 14px, padding 32px 28px. Content: "Upload your SERMON DOC here" (Rhymes 200 44px; "SERMON DOC" Gal Gothic uppercase yellow), "Click to choose a file, or drop it here in this box." (15px), "Word, PDF or text files" (12px tracked uppercase). **Pulses** (`fcPulse`: violet box-shadow ring 0→18px + scale 1→1.015, 2s ease-out infinite) until the first upload. Hover opacity .92, active scale .98.
5. **STEP 2** eyebrow + "Check your words" (Rhymes 300 28px) + helper "Your document's text appears here. Fix any typos and the screens update as you type." + **textarea** (min-height 420px, bg `#f2f0ea`, radius 12px, 15px/1.5, `spellcheck=true lang="en-AU"`).

**Preview grid** — `flex: 999 1 480px`, CSS grid `repeat(auto-fill, minmax(min(100%, 460px), 1fr))` (720px min for wide sizes), gap 32px 24px. Each card:
- Row: "Slide N" (Rhymes 300 22px) + reference/name (Gal Gothic 15px uppercase violet, ellipsis); right: **Emphasise** pill toggle (black when on, label "Emphasised") + colour-pairing `<select>`.
- Preview: aspect-ratio = screen W/H, radius 6px; contains the full-size slide node scaled with `transform: scale(colWidth / W)`.
- Empty state: dashed box "No verses found yet. Upload a doc or paste text with references."

### 2. Example modal
Fixed overlay rgba(0,0,0,.6); white 760px card, radius 14px. Header "Example DOCUMENT" + Close. Body shows a mock Word page (Georgia 16px) of the sample doc with bold rendered, each line followed by a tag pill: violet "Becomes a screen…" or grey "Left out…". Footer: "Put the reference at the start of each verse, and make the words you want highlighted bold." Click backdrop or Close to dismiss.

### 3. Rendered slide (the export artwork)
Let `k = H / 1080`.

**Standard (16:9, 1920×1080)**
- Padding: top `110k`, sides `180k`. Verse block max-width `W − 2·side` (1560).
- Verse: Rhymes Display 300, top-left aligned, `text-wrap: pretty`. Size by length (weighted chars, keywords ×1.3): ≤70 → 120px, ≤105 → 104px, else 92px; line-height 1.12 (≥104) / 1.14.
- Keywords (bold in source): Gal Gothic, uppercase, accent colour.
- Reference: absolute, `left: side; bottom: 110k`; ray mark 62×64 (scaled k) + gap 30k + text Gal Gothic 56k px, tracking 0.22em, uppercase, colour = body text colour (black or white).
- Message title (optional): absolute bottom-right (`right: side; bottom: 110k`), Gal Gothic 28k px, tracking 0.22em, uppercase, body text colour, vertically aligned to the reference.

**Wide (South 3264×960, City 3072×960; any W/H > 2)**
- Side padding `0.2·W` each side; everything centred horizontally, text-align center.
- Verse starts at top padding `110k`; reference flows directly **below** the verse (margin-top 70k), centred.
- Message title: absolute, centred, `bottom: 0.8·pad`.

**Emphasise (per slide)**
- If the slide has keywords: body and keywords both grow to fill the available height; keyword size = 1.35 × body. Paragraph line-height is a fixed px value `max(body×1.2, kw×1.02)` so every line has identical pitch. Keyword spans: `line-height: 0; position: relative; top: (0.35·kw − 0.3·body)px` so they're optically centred on the body line without changing line box height.
- If no keywords: whole verse scales up (max 240k px) to fill.
- Available height: standard `H − 2·pad − 120k`; wide `H − pad − (56k + 70k) − (0.8·pad + 28k + 50k)`.
- **Post-render fit check** (required): after render, measure the verse/reference with `offsetTop/offsetHeight`. Standard: verse bottom must be ≤ reference top − 40k. Wide: reference bottom must be ≤ title top − 24k (or H − 0.6·pad if no title). If over, multiply that slide's fit factor by 0.94 and re-render; repeat (floor 0.4).

## Interactions & Behavior
- **Upload**: click panel or drop file anywhere on page. Supported: .docx (bold from `w:b` runs), .pdf (pdf.js 3.11; bold if font name contains bold/black/heavy/semibold/demi), .odt (bold from automatic styles), .rtf (`\b` control word), .html/.htm (`b`, `strong`, font-weight ≥600), .txt/.md (use `**word**`). `.pages` and `.doc` show an instruction error ("export to Word"). Text is normalised to one blank line between paragraphs and placed in the textarea. First non-reference line ≤60 chars becomes the message title. Upload resets colour overrides and emphasis.
- **Parsing** (per paragraph):
  - Reference at start (`Book 1:2`, `1 John 3:16-18`, `Ps 23:1, 4`, optional translation tag) → verse = rest of line. Reference alone on a line → applies to the next line. Reference at end (optionally in parentheses/after a dash) → verse = preceding text. Book name validated against a list of Bible book names/abbreviations.
  - `*SCREEN` or `[screen]` anywhere → becomes a screen with no reference (marker removed).
  - Anything else is skipped.
  - Zero-width/bidi characters stripped; reference normalised (en dash for ranges).
- **Splitting**: budget = maxLines (default 4) × 36 weighted chars × (text width ratio vs standard). Cut points scored: sentence end (. ! ? ;) preferred, then clause (, : — –), nearest the even-split target, between 0.45×–1.2× budget. A last chunk < 25% budget is merged back if it fits. Parts named "John 15:12–17 (1/3)".
- **Never a single line**: if a non-emphasised verse would fit on one line, insert a `<br>` at the space nearest the middle.
- **Colours**: 12 brand pairings (below). Default cycles per passage; parts of a passage share a pairing. Per-slide `<select>` override. **Shuffle colours** assigns a random pairing per passage, never the same as the previous passage.
- **Export**: html-to-image `toBlob` on each full-size slide node (`transform: none`, width/height = screen size, embedded font CSS), zipped with JSZip → `scripture-screens.zip`. Filenames: `NN-<Name-slug>.png`, e.g. `01-John-15-12-17-1-3.png`.
- Spellcheck: native browser, `lang="en-AU"`.

## State Management
`text`, `size` ('std'|'south'|'city'), `title`, `showTitle`, `overrides {slideKey: pairingName}`, `emph {slideKey: bool}`, `fit {slideKey|size|textKey: factor}`, `exporting` (null|n), `error`, `drag`, `uploaded`, `showExample`, `gridW` (ResizeObserver on grid for preview scale). Slide key = `passageIndex:chunkIndex`. Parsed passages memoised on `text|maxLines|size`.

## Design Tokens
Colour pairings (background / body text / keyword):
- Violet / Lemon — `#5d1fec` / `#fff` / `#ffff5f`
- Orange / Violet — `#ff8432` / `#000` / `#5d1fec`
- Lemon / Violet — `#ffff5f` / `#000` / `#5d1fec`
- Sky Blue / Violet — `#62b4ff` / `#000` / `#5d1fec`
- Pink / Lemon — `#e444b9` / `#000` / `#ffff5f`
- Ginger / Lemon — `#c45236` / `#fff` / `#ffff5f`
- Brown / Lemon — `#765020` / `#fff` / `#ffff5f`
- Judge Gray / Lemon — `#50482e` / `#fff` / `#ffff5f`
- Ink / Lemon, Ink / Orange, Ink / Pink, Ink / Sky Blue — `#000` / `#fff` / accent
Default cycle order: Violet/Lemon, Orange/Violet, Ink/Lemon, Sky Blue/Violet, Ginger/Lemon, Lemon/Violet, Ink/Pink, Judge Gray/Lemon, Pink/Lemon, Ink/Orange, Brown/Lemon, Ink/Sky Blue.

UI: page `#f2f0ea`, ink `#000`, muted text `#333` / `#555`, hairline rgba(0,0,0,.15–.2). Radii: 6 (preview), 8–10 (inputs), 12 (option box), 14 (cards/panels), 999 (pills).

Type: Rhymes Display (UltraLight 200, Light 300, + italics), Gal Gothic Light 300 (only licensed weight — hierarchy via size/case/colour), Lausanne (wordmark only). Fonts are licensed Futures Church files from the brand design system (not bundled here — source from the church's brand assets).

## Assets
- `assets/ray-mark-000000.png`, `assets/ray-mark-ffffff.png` — the Futures ray-burst mark (trimmed from the official brand icon), black and white.
- Brand fonts — from the Futures Church design system (`assets/fonts/Rhymes-*.otf`, `GalGothic-Light.otf/woff`).
- Libraries (CDN): html-to-image 1.11.11, JSZip 3.10.1, pdf.js 3.11.174 (lazy-loaded for PDFs).

## Files
- `Scripture Screens Tool (standalone).html` — fully working single-file prototype (fonts and assets inlined). Open in a browser.
- `source/Scripture Screens Template.dc.html` — readable source; logic class at the bottom (`passages()`, `chunk()`, `build()`, `checkFit()`, file readers, `exportAll()`).
- `assets/` — ray mark PNGs.
