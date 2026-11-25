# Sermon Slides – Futures Church Scripture Screens

Self-serve web tool: upload a sermon doc (.docx, .pdf, .odt, .rtf, .html, .txt/.md), extract every scripture line, split long passages, highlight the words that were bold, and download numbered PNG projection screens as a zip.

- `index.html` – the working single-file app (fonts and assets inlined). Open it in a browser or host it as a static site.
- `source/Scripture Screens Template.dc.html` – readable source (parsing, splitting, sizing, export logic in the `Component` class at the bottom).
- `docs/DESIGN_HANDOFF.md` – full design spec and behaviour notes.
- `assets/` – ray mark PNGs and `illustration-example.jpg` (the Step 4 "See example" screen, a flattened JPG so its text cannot be selected).
- `tools/render-illustration-example.mjs` – regenerates that JPG (and the copy bundled in `index.html`) when the example screen, fonts or colours change: `node tools/render-illustration-example.mjs`, with Playwright available.

Libraries (html-to-image, JSZip, pdf.js) load from a CDN at runtime.

## Checking your words (Step 3)

The importers write `**` around any words the uploaded document had in bold, so a volunteer opens Step 3 and finds markup they never typed. The box now shows formatting instead of markup: highlighted words appear in violet and the `**` fade back to near-invisible grey.

It works by letting the existing highlight overlay carry the visible text and making the textarea's own text transparent. The textarea keeps the caret, selection, spellcheck and native undo underneath, so **every character has to occupy exactly the width it does in the textarea**. That is why the markers are faded rather than hidden or shrunk, and why the violet words get their weight from `-webkit-text-stroke` rather than a bolder face — either would change advance widths and the two layers would drift apart. If you touch `hlHtml`, keep that rule.

A **Highlight words** button (and Ctrl/Cmd+B) wraps or unwraps the selection, or the word under the caret if there is no selection, so nobody has to type or count asterisks.

## PowerPoint export (editable, for ProPresenter)

**Download screens → PowerPoint** builds real PowerPoint objects, not pictures: each scripture screen is a solid-colour slide with a live text box (body in Rhymes Display, bold keywords in Gal Gothic uppercase at the accent colour), the ray mark as a placed image, and separate text boxes for the reference and the message title. Geometry is measured off the live preview node, so position, size, line spacing and letter-spacing match the PNG. ProPresenter imports the .pptx and the operator can fix a typo in place during a service.

Illustration screens (Step 4) are editable too. Rather than duplicating their five layouts, `renderExtra` tags each text leaf `data-pt`, each filled panel `data-ps` and each ruled row `data-pb`, and the exporter measures those tagged elements against the live screen and reads their computed style — so font, size, colour, letter-spacing, uppercasing and alignment come from the same CSS that draws the preview, and a layout change needs no change to the exporter. Panels and rules become filled rectangles; the ray mark is placed as an image. Uploaded image slides stay as images.

One limit worth knowing: PowerPoint has no document flow, so every element lands in its own absolutely-positioned box. Each text box is given the vertical room down to whatever sits beneath it and is set to shrink text on overflow, so a line that wraps differently in PowerPoint shrinks inside its own box instead of running over the next row. If the operator types a much longer value into a row, that row's text gets smaller rather than pushing the rest of the screen down.

Two things to check on the ProPresenter machine before relying on this:

1. **Fonts.** PowerPoint and ProPresenter reference fonts by name; they are not embedded. Rhymes Display and Gal Gothic must be installed there or the text falls back to a system sans. Both are variable fonts, so the installed desktop family may be named differently (e.g. `Rhymes Display Light`) — if so, change `Component.PPTX_FONTS` in the source, which is the single place the names are set.
2. **Import behaviour.** Confirm that ProPresenter's PowerPoint import gives editable text rather than flattening to images on that build and platform. If it flattens, the text boxes are still correct in PowerPoint itself.


Note: `index.html` embeds licensed Futures Church brand fonts. Keep this repository private.

## Restyling a `*SCREEN` slide

A line marked `*SCREEN` becomes a screen with no reference. Those slides carry a **Restyle** button: pressing it lays the screen out with the same engine Step 4 uses for Illustration Screens, and pressing it again moves to the next style. There are three styles for a single statement, each with its own colour pairing; after the last one the slide goes back to plain. Choosing a colour pairing by hand on that slide keeps it through a restyle.

## Illustration Screens (Step 4)

Step 4 turns one set of pasted notes into a basic information screen to insert into a sermon, with no AI service or API key. The tool reads the notes (first line is the title, `Label: value` lines and lines starting with a time such as `7pm` become labelled rows) and lays them out in one of five layouts using the Futures fonts and colour pairings. Regenerate cycles to the next layout and colour pairing. The screen can be added before or after any slide, and is exported with the other screens as a PNG or in the PowerPoint file.

### Tidy notes

Because the layouts read shape, the same set of notes pasted two ways builds two different screens, and a paste out of an email builds a poor one: the greeting becomes the title and the signature becomes three rows. **Tidy notes** puts a paste back into that shape. It is a plain pass over the text, like everything else here — no API, no latency, nothing sent anywhere.

It only moves, joins, splits and restyles what was pasted. It never writes a word that was not already there and never guesses at a missing one, so the result is always the author's own copy and the same paste always tidies the same way. The button sits above Clear, turns into **Undo tidy** afterwards, and every press says what it did in the status line — `Tidied: 14 lines in, 7 out, 6 labels found`, or `Already in shape — nothing to change`.

What it handles: bullets, numbers and markdown; ALL CAPS; emoji, hashtags, URLs, `Sent from my iPhone`, `Page 1 of 2`, greetings and sign-offs; a paste with no line breaks at all (tabs and column runs first, then separators, then sentence ends); rows an email or a PDF wrapped mid-thought; every way a time gets typed (`7:00 PM`, `7.30pm`, `19:00`, `7-9pm`) brought to the one the parser reads; `Doors open at 7pm` turned round to `7pm Doors open`; `Cost - $180` to `Cost: $180` against a closed list of label words; a line that ends on a possessive or a joining word joined to the line under it, so a title split over two lines comes back as one; and a label sitting above its value joined to it, so `Level 6` over `Friend Friend` becomes one row.

A bare `1:30` with no am or pm is left exactly as pasted, because which one it means is not in the paste.

Ported from the Futures Graphic Builder, whose wild card reads notes the same way. Keep the two in step.
