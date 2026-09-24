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
  assert.deepEqual(icons.find((i) => i.name === 'heart').styles, ['outline', 'solid']);
  for (const { name, styles } of icons) {
    for (const style of styles) assert.ok(existsSync(pkgFile(`core/svg/${style}/${name}.svg`)), `${style}/${name}`);
  }
});

const vueHtml = (C, props) => renderToString(createSSRApp({ render: () => h(C, props) }));
const reactHtml = (C, props) => renderToStaticMarkup(createElement(C, props));

for (const [lib, render] of [['react', reactHtml], ['vue', vueHtml]]) {
  const m = lib === 'react' ? react : vue;

  test(`${lib}: exports Mvi<Style><Name> per Style`, () => {
    assert.ok(m.MviOutlineHeart && m.MviSolidHeart && m.MviOutlineCheck);
    assert.equal(m.MviSolidCheck, undefined);
  });

  test(`${lib}: decorative by default, sized and coloured`, async () => {
    const html = await render(m.MviOutlineHeart, { size: 32, color: 'red' });
    assert.match(html, /^<svg[^>]*width="32"/);
    assert.match(html, /fill="red"/);
    assert.match(html, /aria-hidden="true"/);
    assert.doesNotMatch(html, /role=|<title>/);
  });

  test(`${lib}: title makes it an escaped, labelled image`, async () => {
    const html = await render(m.MviSolidHeart, { title: 'Like <3' });
    assert.match(html, /role="img"/);
    assert.match(html, /<title>Like &(lt|#60);3<\/title>/);
    assert.doesNotMatch(html, /aria-hidden/);
  });

  test(`${lib}: rotate and flip become a CSS transform`, async () => {
    const html = await render(m.MviOutlineHeart, { rotate: 90, flip: 'horizontal' });
    assert.match(html, /transform:\s*rotate\(90deg\) scaleX\(-1\)/);
  });
}

test('web-components: <mvi-icon> renders the requested Icon and Style', async () => {
  // Minimal DOM shim: just enough for MviIcon.
  globalThis.HTMLElement = class {
    attrs = {};
    getAttribute(n) { return this.attrs[n] ?? null; }
    setAttribute(n, v) { this.attrs[n] = String(v); }
    removeAttribute(n) { delete this.attrs[n]; }
    attachShadow() { return (this.shadowRoot = { innerHTML: '' }); }
  };
  const defined = {};
  globalThis.customElements = { get: (n) => defined[n], define: (n, c) => (defined[n] = c) };
  const { MviIcon } = await import('@moonveilicons/web-components');
  assert.equal(defined['mvi-icon'], MviIcon);

  const el = new MviIcon();
  Object.assign(el.attrs, { name: 'heart', type: 'solid', size: '32', rotate: '180' });
  el.connectedCallback();
  const solid = el.shadowRoot.innerHTML;
  assert.match(solid, /width="32"/);
  assert.match(solid, /rotate\(180deg\)/);
  assert.match(solid, /<path d="/);
  assert.equal(el.attrs['aria-hidden'], 'true');

  el.setAttribute('type', 'outline');
  el.setAttribute('title', 'Like');
  el.attributeChangedCallback();
  assert.notEqual(el.shadowRoot.innerHTML, solid);
  assert.equal(el.attrs.role, 'img');
  assert.equal(el.attrs['aria-label'], 'Like');
  assert.equal(el.attrs['aria-hidden'], undefined);
});

test('core ships a woff2 webfont and a CSS class per Icon per Style', () => {
  const woff2 = readFileSync(pkgFile('core/fonts/moonveilicons.woff2'));
  assert.equal(woff2.subarray(0, 4).toString(), 'wOF2');
  const css = readFileSync(pkgFile('core/css/moonveilicons.css'), 'utf8');
  const codepoints = JSON.parse(readFileSync(new URL('../icons/codepoints.json', import.meta.url), 'utf8'));
  const icons = JSON.parse(readFileSync(pkgFile('core/icons.json'), 'utf8'));
  for (const { name, styles } of icons) {
    for (const style of styles) {
      const hex = codepoints[`${style}/${name}`];
      assert.ok(css.includes(`.mvi-${style}-${name}::before { content: '\\${hex}'; }`), `${style}/${name}`);
    }
  }
  assert.match(css, /moonveilicons\.woff2\?v=[0-9a-f]{8}/);
});

test('codepoints are stable: existing keep theirs, removed are never reused', async () => {
  const { assignCodepoints } = await import('../scripts/font.mjs');
  const next = assignCodepoints({ 'outline/a': 'e000', 'outline/gone': 'e001' }, ['outline/b', 'outline/a']);
  assert.deepEqual(next, { 'outline/a': 'e000', 'outline/gone': 'e001', 'outline/b': 'e002' });
  assert.deepEqual(assignCodepoints({}, ['solid/x']), { 'solid/x': 'e000' });
});
