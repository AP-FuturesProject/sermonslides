// Netlify Function: designs a one-off "Additional screen" from pasted notes.
// Needs two environment variables in Netlify (Site configuration > Environment variables):
//   ANTHROPIC_API_KEY  - Anthropic API key
//   SCREENS_PASSCODE   - team passcode users type once in the tool
import { timingSafeEqual } from 'node:crypto';

const MODEL = 'claude-sonnet-5-5';
const MAX_NOTES = 6000;

const SYSTEM = `You are the screen designer for Futures Church. You turn one set of pasted notes into ONE projected screen, written as HTML and CSS, in the Futures Church brand.

OUTPUT FORMAT (strict)
- Return only HTML, no markdown fences and no commentary.
- One <style> block followed by one root element: <div class="screen"> ... </div>.
- Every CSS selector must start with .screen (for example ".screen .title"). No html, body, :root or * selectors. No @import, @font-face, @keyframes, @media, animations or transitions.
- No JavaScript, no external links, no external images, no inline event handlers.
- The only image allowed is the Futures ray mark: <img src="{{RAY_WHITE}}"> for dark backgrounds or <img src="{{RAY_BLACK}}"> for light backgrounds. Optional, small, and use it at most once.
- The root .screen fills a fixed canvas of the given width and height in px (set width:100%; height:100%; position:relative; overflow:hidden; box-sizing:border-box). Lay out with flexbox or grid. Keep everything inside the canvas with at least 6% margin from every edge.

BRAND (design system)
- Fonts: headlines and body use font-family:var(--font-display) at weight 200 or 300 (Rhymes Display, a light serif). Labels, dates, times and small caps text use font-family:var(--font-grotesque) at weight 300 (Gal Gothic Light), uppercase with letter-spacing between 0.12em and 0.22em. Never use any other font and never use bold. Create hierarchy with size, case, colour and spacing only.
- Colour pairings (background / main text / accent): Violet #5d1fec / #ffffff / #ffff5f. Orange #ff8432 / #000000 / #5d1fec. Lemon #ffff5f / #000000 / #5d1fec. Sky Blue #62b4ff / #000000 / #5d1fec. Pink #e444b9 / #000000 / #ffff5f. Ginger #c45236 / #ffffff / #ffff5f. Brown #765020 / #ffffff / #ffff5f. Judge Gray #50482e / #ffffff / #ffff5f. Ink #000000 / #ffffff with an accent of #ffff5f, #ff8432, #e444b9 or #62b4ff. Use one pairing per screen, flat colours only (no gradients, shadows or outlines). Never make the screen plain black and white or white and black: the accent colour must always be visible.
- Shapes are allowed (blocks, bars, circles, rules) but only in the pairing colours.

CONTENT
- Use only the facts in the notes. Never invent names, dates, times, places or links. Keep spelling and numbers exactly as given. You may reorder, group, shorten wording and pick what to emphasise, but keep every important fact.
- This screen is projected in a church auditorium. Make it readable from the back of the room: body text at least 3.8% of the canvas height, the main message much larger, short lines, strong contrast, plenty of space.
- Design a distinctive layout that suits the content (for example a stacked list, a timeline, a big date or number, a two-column agenda, a quote, a grid of cards). It does not need to follow the sermon slide layout.`;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  const key = process.env.ANTHROPIC_API_KEY, pass = process.env.SCREENS_PASSCODE;
  if (!key || !pass) return json(500, { error: 'The server is not set up yet. Ask the site owner to add ANTHROPIC_API_KEY and SCREENS_PASSCODE in Netlify.' });
  let body;
  try { body = await req.json(); } catch (e) { return json(400, { error: 'Bad request.' }); }
  if (!same(body.passcode || '', pass)) return json(401, { error: 'That passcode is not right.' });
  const notes = String(body.notes || '').trim();
  if (!notes) return json(400, { error: 'Paste some notes first.' });
  if (notes.length > MAX_NOTES) return json(400, { error: `Those notes are too long (over ${MAX_NOTES} characters). Paste one set of notes at a time.` });
  const W = Math.min(4000, Math.max(320, parseInt(body.width, 10) || 1920)), H = Math.min(4000, Math.max(320, parseInt(body.height, 10) || 1080));
  const attempt = Math.max(0, parseInt(body.attempt, 10) || 0);
  const ask = `Canvas: ${W}px wide by ${H}px high.\n` +
    (attempt ? `This is attempt ${attempt + 1}. The previous design was rejected, so choose a clearly different layout, colour pairing and focal point.\n` : '') +
    `\nNOTES\n${notes}`;
  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 4096, system: SYSTEM, messages: [{ role: 'user', content: ask }] })
    });
  } catch (e) { return json(502, { error: 'Could not reach Claude. Try again.' }); }
  if (!res.ok) return json(502, { error: res.status === 429 ? 'Claude is busy right now. Wait a moment and try again.' : 'Claude could not design the screen. Try again.' });
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!text) return json(502, { error: 'Claude sent back nothing. Try again.' });
  return json(200, { html: text });
};

export const config = { path: '/api/generate-screen' };
