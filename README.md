# Sermon Slides – Futures Church Scripture Screens

Self-serve web tool: upload a sermon doc (.docx, .pdf, .odt, .rtf, .html, .txt/.md), extract every scripture line, split long passages, highlight the words that were bold, and download numbered PNG projection screens as a zip.

- `index.html` – the working single-file app (fonts and assets inlined). Open it in a browser or host it as a static site.
- `source/Scripture Screens Template.dc.html` – readable source (parsing, splitting, sizing, export logic in the `Component` class at the bottom).
- `docs/DESIGN_HANDOFF.md` – full design spec and behaviour notes.
- `assets/` – ray mark PNGs.

Libraries (html-to-image, JSZip, pdf.js) load from a CDN at runtime.

Note: `index.html` embeds licensed Futures Church brand fonts. Keep this repository private.

## Illustration Screens (Step 4)

Step 4 turns one set of pasted notes into a basic information screen to insert into a sermon, with no AI service or API key. The tool reads the notes (first line is the title, `Label: value` lines and lines starting with a time such as `7pm` become labelled rows) and lays them out in one of five layouts using the Futures fonts and colour pairings. Regenerate cycles to the next layout and colour pairing. The screen can be added before or after any slide, and is exported with the other screens as a PNG or in the PowerPoint file.

### Tidy notes

Because the layouts read shape, the same set of notes pasted two ways builds two different screens, and a paste out of an email builds a poor one: the greeting becomes the title and the signature becomes three rows. **Tidy notes** puts a paste back into that shape. It is a plain pass over the text, like everything else here — no API, no latency, nothing sent anywhere.

It only moves, joins, splits and restyles what was pasted. It never writes a word that was not already there and never guesses at a missing one, so the result is always the author's own copy and the same paste always tidies the same way. The button sits above Clear, turns into **Undo tidy** afterwards, and every press says what it did in the status line — `Tidied: 14 lines in, 7 out, 6 labels found`, or `Already in shape — nothing to change`.

What it handles: bullets, numbers and markdown; ALL CAPS; emoji, hashtags, URLs, `Sent from my iPhone`, `Page 1 of 2`, greetings and sign-offs; a paste with no line breaks at all (tabs and column runs first, then separators, then sentence ends); rows an email or a PDF wrapped mid-thought; every way a time gets typed (`7:00 PM`, `7.30pm`, `19:00`, `7-9pm`) brought to the one the parser reads; `Doors open at 7pm` turned round to `7pm Doors open`; `Cost - $180` to `Cost: $180` against a closed list of label words; a line that ends on a possessive or a joining word joined to the line under it, so a title split over two lines comes back as one; and a label sitting above its value joined to it, so `Level 6` over `Friend Friend` becomes one row.

A bare `1:30` with no am or pm is left exactly as pasted, because which one it means is not in the paste.

Ported from the Futures Graphic Builder, whose wild card reads notes the same way. Keep the two in step.
