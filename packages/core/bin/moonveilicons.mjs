#!/usr/bin/env node
// moonveilicons CLI: search, list and copy Icons into a project. Reads this package's own files, so it works offline.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const icons = JSON.parse(readFileSync(join(root, 'icons.json'), 'utf8'));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const HELP = `moonveilicons ${version}

Usage:
  moonveilicons search <query>             Find Icons by name, tag or category
  moonveilicons list [--category <name>]   List Icons
  moonveilicons add <name...> [options]    Copy Icons into your project

Options for add:
  --style <outline|solid>    Style to copy (default: outline)
  --format <svg|react|vue>   Output format (default: svg)
  --out <dir>                Output directory (default: ./icons)
  --force                    Overwrite existing files
`;

const pascal = (kebab) => kebab.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const camelAttrs = (markup) =>
  markup.replace(/(\s)([a-z][a-z0-9]*(?:-[a-z0-9]+)+)(?==)/g, (_, s, a) => s + a.replace(/-([a-z0-9])/g, (_m, c) => c.toUpperCase()));
const row = (i) => `${i.name.padEnd(24)} ${i.styles.join(', ').padEnd(16)} ${[i.category && `[${i.category}]`, ...(i.tags ?? [])].filter(Boolean).join(' ')}`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function render(format, style, name, svg) {
  const [, viewBox, inner] = svg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);
  const component = `Mvi${pascal(style)}${pascal(name)}`;
  if (format === 'svg') return [`mvi-${style}-${name}.svg`, svg];
  if (format === 'react') {
    return [
      `${component}.tsx`,
      `import type { SVGProps } from 'react';

export function ${component}({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      ${camelAttrs(inner)}
    </svg>
  );
}
`,
    ];
  }
  if (format === 'vue') {
    return [
      `${component}.vue`,
      `<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 24 });
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" :width="size" :height="size" fill="currentColor" aria-hidden="true">
    ${inner}
  </svg>
</template>
`,
    ];
  }
  fail(`Unknown --format "${format}". Use svg, react or vue.`);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      style: { type: 'string', default: 'outline' },
      format: { type: 'string', default: 'svg' },
      out: { type: 'string', default: 'icons' },
      category: { type: 'string' },
      force: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
} catch (e) {
  fail(`${e.message}\n\n${HELP}`);
}
const { values: opts, positionals: [command, ...args] } = parsed;

if (opts.version) console.log(version);
else if (opts.help || !command) console.log(HELP);
else if (command === 'search') {
  const q = args.join(' ').toLowerCase();
  if (!q) fail('Usage: moonveilicons search <query>');
  const hits = icons.filter((i) => [i.name, i.category, ...(i.tags ?? [])].some((s) => s?.toLowerCase().includes(q)));
  if (!hits.length) fail(`No Icons match "${q}".`);
  hits.forEach((i) => console.log(row(i)));
} else if (command === 'list') {
  icons.filter((i) => !opts.category || i.category === opts.category).forEach((i) => console.log(row(i)));
} else if (command === 'add') {
  if (!args.length) fail('Usage: moonveilicons add <name...> [--style outline|solid] [--format svg|react|vue] [--out dir]');
  const { style, format, out, force } = opts;
  const planned = args.map((name) => {
    const icon = icons.find((i) => i.name === name);
    if (!icon) fail(`Unknown Icon "${name}". Try: moonveilicons search ${name}`);
    if (!icon.styles.includes(style)) fail(`"${name}" has no ${style} Style (available: ${icon.styles.join(', ')}).`);
    const [file, content] = render(format, style, name, readFileSync(join(root, 'svg', style, `${name}.svg`), 'utf8').trim());
    const path = join(out, file);
    if (existsSync(path) && !force) fail(`${path} already exists. Use --force to overwrite.`);
    return [path, content];
  });
  mkdirSync(out, { recursive: true });
  for (const [path, content] of planned) {
    writeFileSync(path, content.endsWith('\n') ? content : content + '\n');
    console.log(`added ${path}`);
  }
} else fail(`Unknown command "${command}".\n\n${HELP}`);
