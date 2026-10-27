# Sermon Slides – Futures Church Scripture Screens

Self-serve web tool: upload a sermon doc (.docx, .pdf, .odt, .rtf, .html, .txt/.md), extract every scripture line, split long passages, highlight the words that were bold, and download numbered PNG projection screens as a zip.

- `index.html` – the working single-file app (fonts and assets inlined). Open it in a browser or host it as a static site.
- `source/Scripture Screens Template.dc.html` – readable source (parsing, splitting, sizing, export logic in the `Component` class at the bottom).
- `docs/DESIGN_HANDOFF.md` – full design spec and behaviour notes.
- `assets/` – ray mark PNGs.

Libraries (html-to-image, JSZip, pdf.js) load from a CDN at runtime.

Note: `index.html` embeds licensed Futures Church brand fonts. Keep this repository private.

## Additional screens (Step 4)

Step 4 turns one set of pasted notes (or an uploaded file) into a one-off screen, with no AI service or API key. The tool reads the notes (first line is the title, `Label: value` lines and lines starting with a time such as `7pm` become labelled rows) and lays them out in one of five layouts using the Futures fonts and colour pairings. Regenerate cycles to the next layout and colour pairing. The screen can be added before or after any slide, and is exported with the other screens as a PNG or in the PowerPoint file.
