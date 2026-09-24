// Webfont Surface: one woff2 holding every Icon in every Style, plus moonveilicons.css.
// Codepoints live in icons/codepoints.json (committed) so a glyph never moves between releases.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import { compress } from 'wawoff2';

const FIRST_CODEPOINT = 0xe000; // Unicode Private Use Area

// Assigns stable codepoints: existing keys keep theirs, new keys get max+1, removed keys are never reused.
export function assignCodepoints(existing, keys) {
  const codepoints = { ...existing };
  let next = Math.max(FIRST_CODEPOINT - 1, ...Object.values(codepoints).map((h) => parseInt(h, 16))) + 1;
  for (const key of keys) if (!(key in codepoints)) codepoints[key] = (next++).toString(16);
  return codepoints;
}

function svgFont(glyphs) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = new SVGIcons2SVGFontStream({ fontName: 'moonveilicons', fontHeight: 960, normalize: false, log: () => {} });
    stream.on('data', (c) => chunks.push(String(c))).on('end', () => resolve(chunks.join(''))).on('error', reject);
    for (const { style, name, codepoint, svg } of glyphs) {
      const glyph = Readable.from([svg]);
      glyph.metadata = { name: `${style}-${name}`, unicode: [String.fromCodePoint(codepoint)] };
      stream.write(glyph);
    }
    stream.end();
  });
}

const css = (fontFile, glyphs) => `/* Moonveil Icons webfont. Usage: <i class="mvi mvi-outline-heart"></i> */
@font-face {
  font-family: 'moonveilicons';
  src: url('../fonts/${fontFile}') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.mvi {
  display: inline-block;
  font-family: 'moonveilicons' !important;
  font-weight: normal;
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-transform: none;
  vertical-align: -0.125em;
  speak: never;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

${glyphs.map((g) => `.mvi-${g.style}-${g.name}::before { content: '\\${g.codepoint.toString(16)}'; }`).join('\n')}

/* Utilities: also work on the React/Vue SVG components (and rotate/flip/animations on <mvi-icon>). */
.mvi-xs { font-size: 16px; width: 16px; height: 16px; }
.mvi-sm { font-size: 20px; width: 20px; height: 20px; }
.mvi-md { font-size: 24px; width: 24px; height: 24px; }
.mvi-lg { font-size: 32px; width: 32px; height: 32px; }
.mvi-xl { font-size: 48px; width: 48px; height: 48px; }

.mvi-rotate-90 { rotate: 90deg; }
.mvi-rotate-180 { rotate: 180deg; }
.mvi-rotate-270 { rotate: 270deg; }
.mvi-flip-horizontal { scale: -1 1; }
.mvi-flip-vertical { scale: 1 -1; }

@keyframes mvi-spin { to { transform: rotate(360deg); } }
@keyframes mvi-pulse { 50% { opacity: 0.35; } }
@keyframes mvi-beat { 0%, 60%, 100% { transform: scale(1); } 30% { transform: scale(1.25); } }
.mvi-spin { animation: mvi-spin 1.2s linear infinite; }
.mvi-pulse { animation: mvi-pulse 1.5s ease-in-out infinite; }
.mvi-beat { animation: mvi-beat 1.2s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .mvi-spin, .mvi-pulse, .mvi-beat { animation: none; }
}
`;

/** @param variants [{ style, name, svg }] @returns {{ woff2: Buffer, css: string }} */
export async function buildFont(variants, codepointsFile) {
  const saved = existsSync(codepointsFile) ? JSON.parse(readFileSync(codepointsFile, 'utf8')) : {};
  const codepoints = assignCodepoints(saved, variants.map((v) => `${v.style}/${v.name}`));
  writeFileSync(codepointsFile, JSON.stringify(codepoints, null, 2) + '\n');

  const glyphs = variants.map((v) => ({ ...v, codepoint: parseInt(codepoints[`${v.style}/${v.name}`], 16) }));
  const ttf = Buffer.from(svg2ttf(await svgFont(glyphs), { ts: 0 }).buffer);
  const woff2 = Buffer.from(await compress(ttf));
  const hash = createHash('sha256').update(woff2).digest('hex').slice(0, 8);
  return {
    woff2,
    css: css(`moonveilicons.woff2?v=${hash}`, glyphs),
  };
}
