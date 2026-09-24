// Enforces the Icon source contract (docs/adr/0001-filled-icon-sources.md).
// Exits non-zero with one line per violation.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
const STYLES = ['outline', 'solid'];
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const names = new Set();

for (const entry of readdirSync(iconsDir, { withFileTypes: true })) {
  if (entry.name === 'meta.json') continue;
  if (!entry.isDirectory() || !STYLES.includes(entry.name)) {
    errors.push(`icons/${entry.name}: only ${STYLES.join('/')} folders and meta.json belong in icons/`);
  }
}

for (const style of STYLES) {
  const dir = join(iconsDir, style);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const at = `icons/${style}/${file}`;
    const name = file.replace(/\.svg$/, '');
    if (!file.endsWith('.svg')) { errors.push(`${at}: not an .svg file`); continue; }
    if (!NAME.test(name)) errors.push(`${at}: name must be kebab-case a-z0-9`);
    names.add(name);

    const svg = readFileSync(join(dir, file), 'utf8');
    if (!/<svg[^>]*\sviewBox="0 0 24 24"/.test(svg)) errors.push(`${at}: viewBox must be "0 0 24 24"`);
    if (/\sstroke(-[a-z]+)?=/.test(svg)) errors.push(`${at}: strokes are not allowed, outline strokes to filled paths`);
    if (/\sfill="(?!none"|currentColor")/.test(svg)) errors.push(`${at}: fill may only be "none" or "currentColor"`);
    if (/\sstyle=|<style|<script|<image|<text|<foreignObject|\son[a-z]+=/i.test(svg)) {
      errors.push(`${at}: no style, script, image, text, foreignObject or event attributes`);
    }
  }
}

const metaFile = join(iconsDir, 'meta.json');
if (existsSync(metaFile)) {
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  for (const [name, m] of Object.entries(meta)) {
    if (!names.has(name)) errors.push(`icons/meta.json: "${name}" has no Icon source`);
    if (m.category !== undefined && typeof m.category !== 'string') errors.push(`icons/meta.json: "${name}".category must be a string`);
    if (m.tags !== undefined && !(Array.isArray(m.tags) && m.tags.every((t) => typeof t === 'string'))) {
      errors.push(`icons/meta.json: "${name}".tags must be an array of strings`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Icon sources OK (${names.size} icons).`);
