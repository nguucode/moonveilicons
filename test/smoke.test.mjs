// Smoke tests against the built packages. Run `npm run build` first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import * as react from '@moonveilicons/react';
import * as vue from '@moonveilicons/vue';

const pkgFile = (p) => new URL(`../packages/${p}`, import.meta.url);

test('core ships icons.json and every listed SVG', () => {
  const icons = JSON.parse(readFileSync(pkgFile('core/icons.json'), 'utf8'));
  const heart = icons.find((i) => i.name === 'heart');
  assert.deepEqual(heart.styles, ['outline', 'solid']);
  for (const { name, styles } of icons) {
    for (const style of styles) assert.ok(existsSync(pkgFile(`core/svg/${style}/${name}.svg`)), `${style}/${name}`);
  }
});

test('react renders a sized, recolourable svg', () => {
  const html = renderToStaticMarkup(createElement(react.Heart, { size: 32, className: 'x' }));
  assert.match(html, /^<svg[^>]*width="32"[^>]*fill="currentColor"[^>]*class="x"/);
  assert.match(html, /<path d="/);
});

test('vue renders a sized, recolourable svg', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(vue.Heart, { size: 32, class: 'x' }) }));
  assert.match(html, /^<svg[^>]*width="32"[^>]*fill="currentColor"/);
  assert.match(html, /class="x"/);
  assert.match(html, /<path d="/);
});

test('web-components defines one custom element per icon', () => {
  const js = readFileSync(pkgFile('web-components/dist/index.js'), 'utf8');
  assert.match(js, /customElements\.define\("moonveil-icon-heart"/);
});
