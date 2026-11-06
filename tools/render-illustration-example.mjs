#!/usr/bin/env node
/**
 * Re-renders the Step 4 "See example" illustration screen.
 *
 * The modal shows a flat JPG (so its text cannot be selected or copied), which
 * means the example no longer follows changes to the fonts, colours or layout.
 * This script is the way to regenerate it:
 *
 *   npm i -D playwright   # or use a Chromium that Playwright can find
 *   node tools/render-illustration-example.mjs
 *
 * It renders SCREEN_HTML below at 1920 x 1080 using the brand fonts unpacked
 * from index.html, writes assets/illustration-example.jpg, and replaces the
 * image bytes inside index.html's bundler manifest so the single-file app and
 * the loose asset stay in step. Nothing else in index.html is touched.
 *
 * Edit SCREEN_HTML (not the JPG) when the example itself should change.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Resolved through CJS so a globally installed Playwright works too — ESM
// imports ignore NODE_PATH and only look in local node_modules.
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'index.html');
const JPG = join(ROOT, 'assets', 'illustration-example.jpg');
const QUALITY = 90;

/* ── the example screen, at full 1920 x 1080 projection size ─────────────── */

const ROWS = [
  ['Level 6', 'Friend Friend'],
  ['Level 5', 'Moving house friend'],
  ['Level 4', 'BBQ friend'],
  ['Level 3', 'The church foyer friend'],
  ['Level 2', 'School drop off friend'],
  ['Level 1', 'Facebook Friend'],
];

const list = ROWS.map(([level, label], i) =>
  '<div style="display:grid;grid-template-columns:232px 1fr;align-items:center;gap:0;flex:1 1 0;' +
  (i ? 'border-top:1px solid rgba(255,255,255,0.16);' : '') +
  '"><div style="font-family:var(--font-grotesque);font-weight:300;font-size:36px;letter-spacing:0.2em;text-transform:uppercase;color:' +
  (i ? '#6b6b6b' : '#ffff5f') + ';">' + level + '</div><div style="font-size:' + (i ? 84 : 92) +
  'px;line-height:1.02;color:' + (i ? '#767676' : '#ffff5f') + ';">' + label + '</div></div>').join('');

const SCREEN_HTML =
  '<div style="position:relative;width:1920px;height:1080px;display:flex;overflow:hidden;font-family:var(--font-display);font-weight:300;">' +
  '<div style="flex:none;width:640px;background:#ffff5f;color:#000;display:flex;flex-direction:column;justify-content:center;padding:0 80px 0 90px;box-sizing:border-box;">' +
  '<div style="font-style:italic;font-size:104px;line-height:1;">Josh’s</div>' +
  '<div style="font-family:var(--font-grotesque);font-weight:300;font-size:104px;line-height:0.95;text-transform:uppercase;">Friend Ladder.</div></div>' +
  '<div style="flex:1 1 0;background:#000;padding:120px 140px 120px 110px;display:flex;flex-direction:column;box-sizing:border-box;">' +
  list + '</div></div>';

/* ── index.html bundle: manifest of uuid -> asset, plus the app template ──── */

const MANIFEST_RE = /(<script type="__bundler\/manifest">\s*\n)([\s\S]*?)(\n\s*<\/script>)/;
const TEMPLATE_RE = /(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/;
const FONT_EXT = { 'font/otf': 'otf', 'font/ttf': 'ttf', 'font/woff': 'woff', 'font/woff2': 'woff2', 'application/font-woff': 'woff' };

const html = readFileSync(INDEX, 'utf8');
const manifestMatch = html.match(MANIFEST_RE);
const templateMatch = html.match(TEMPLATE_RE);
if (!manifestMatch || !templateMatch) throw new Error('index.html: bundler manifest/template not found');

const manifest = JSON.parse(manifestMatch[2]);
const template = JSON.parse(templateMatch[2]);

const bytes = (uuid) => {
  const entry = manifest[uuid];
  const raw = Buffer.from(entry.data, 'base64');
  return entry.compressed ? gunzipSync(raw) : raw;
};

// The <img> in the modal names the uuid whose bytes we are about to replace.
const imgMatch = template.match(/<img src="([0-9a-f-]{36})" alt="Example illustration screen"/);
if (!imgMatch) throw new Error('index.html: example illustration <img> not found in template');
const targetUuid = imgMatch[1];
if (!manifest[targetUuid]) throw new Error('index.html: manifest has no entry for ' + targetUuid);

/* ── render ───────────────────────────────────────────────────────────────── */

const work = mkdtempSync(join(tmpdir(), 'illus-'));
const styleMatch = template.match(/<style>(\/\* =+[\s\S]*?@font-face[\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error('index.html: webfont @font-face block not found in template');

let css = styleMatch[1];
for (const [uuid, entry] of Object.entries(manifest)) {
  const ext = FONT_EXT[entry.mime];
  if (!ext || !css.includes(uuid)) continue;
  const file = uuid + '.' + ext;
  writeFileSync(join(work, file), bytes(uuid));
  css = css.split('"' + uuid + '"').join('"' + file + '"');
}
writeFileSync(join(work, 'fonts.css'), css);
writeFileSync(join(work, 'render.html'),
  '<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="fonts.css">' +
  '<style>*{margin:0;padding:0;box-sizing:border-box}' +
  ":root{--font-display:'Rhymes Display', Georgia, 'Times New Roman', serif;" +
  "--font-grotesque:'Gal Gothic','Lausanne',system-ui,sans-serif;}" +
  'html,body{width:1920px;height:1080px;overflow:hidden;background:#000;}</style></head><body>' +
  SCREEN_HTML + '</body></html>');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + join(work, 'render.html'));
await page.evaluate(() => document.fonts.ready);
const jpg = await page.screenshot({ type: 'jpeg', quality: QUALITY });
await browser.close();

/* ── write the loose asset and the copy inside index.html ─────────────────── */

writeFileSync(JPG, jpg);
manifest[targetUuid] = { mime: 'image/jpeg', compressed: false, data: jpg.toString('base64') };
writeFileSync(INDEX,
  html.replace(MANIFEST_RE, (_, open, __, close) => open + JSON.stringify(manifest) + close));

console.log('assets/illustration-example.jpg — ' + jpg.length + ' bytes');
console.log('index.html — manifest asset ' + targetUuid + ' updated');
