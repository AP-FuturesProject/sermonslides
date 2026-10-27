# Sermon Slides – Futures Church Scripture Screens

Self-serve web tool: upload a sermon doc (.docx, .pdf, .odt, .rtf, .html, .txt/.md), extract every scripture line, split long passages, highlight the words that were bold, and download numbered PNG projection screens as a zip.

- `index.html` – the working single-file app (fonts and assets inlined). Open it in a browser or host it as a static site.
- `source/Scripture Screens Template.dc.html` – readable source (parsing, splitting, sizing, export logic in the `Component` class at the bottom).
- `docs/DESIGN_HANDOFF.md` – full design spec and behaviour notes.
- `assets/` – ray mark PNGs.

Libraries (html-to-image, JSZip, pdf.js) load from a CDN at runtime.

Note: `index.html` embeds licensed Futures Church brand fonts. Keep this repository private.

## Additional screens (Step 4)

Step 4 lets a user paste one set of notes (announcements, an event, and so on) and have Claude design a one-off screen in the Futures brand. The screen can be regenerated, then added to the slide list before or after any slide. It is exported with the other screens as a PNG or in the PowerPoint file.

It runs through a Netlify Function, `netlify/functions/generate-screen.mjs`, available at `/api/generate-screen`. Set these in Netlify under Site configuration > Environment variables, then redeploy:

- `ANTHROPIC_API_KEY` – an Anthropic API key (never put it in the page).
- `SCREENS_PASSCODE` – the team passcode users type once (it is remembered in their browser).

The function uses the `claude-sonnet-5-5` model and limits notes to 6,000 characters. The page cleans Claude's HTML before showing it: scripts, event handlers, external images and external CSS URLs are removed, and its CSS is scoped to its own screen.
