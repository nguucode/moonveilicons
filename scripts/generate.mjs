// Builds one manifest from the Icon sources in icons/<style>/ and emits every package's
// generated files from it. Generated files are gitignored; `npm run build` recreates them.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'icons');
const STYLES = ['outline', 'solid'];
const pkg = (p) => join(root, 'packages', p);

const svgoConfig = {
  multipass: true,
  plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
};

const toPascalCase = (kebab) =>
  kebab.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');

const kebabAttrsToCamel = (markup) =>
  markup.replace(
    /(\s)([a-zA-Z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)+)(?==)/g,
    (_, space, attr) => space + attr.replace(/-([a-z0-9])/g, (_m, c) => c.toUpperCase())
  );

function extractSvg(optimizedSvg) {
  const match = optimizedSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);
  if (!match) throw new Error(`Could not parse optimized SVG: ${optimizedSvg}`);
  return { viewBox: match[1], inner: match[2].trim() };
}

function fresh(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

// --- Manifest: { name, pascalName, category, tags, styles: { outline?: { viewBox, inner, svg } } }
const meta = JSON.parse(readFileSync(join(iconsDir, 'meta.json'), 'utf8'));
const byName = new Map();
for (const style of STYLES) {
  const dir = join(iconsDir, style);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.svg')).sort()) {
    const name = file.replace(/\.svg$/, '');
    const { data: svg } = optimize(readFileSync(join(dir, file), 'utf8'), svgoConfig);
    if (!byName.has(name)) {
      byName.set(name, { name, pascalName: toPascalCase(name), ...meta[name], styles: {} });
    }
    byName.get(name).styles[style] = { ...extractSvg(svg), svg };
  }
}
const icons = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));

// --- Core: optimized SVGs + icons.json
for (const style of STYLES) fresh(join(pkg('core'), 'svg', style));
for (const icon of icons) {
  for (const [style, { svg }] of Object.entries(icon.styles)) {
    writeFileSync(join(pkg('core'), 'svg', style, `${icon.name}.svg`), svg + '\n');
  }
}
writeFileSync(
  join(pkg('core'), 'icons.json'),
  JSON.stringify(
    icons.map(({ name, category, tags, styles }) => ({ name, category, tags, styles: Object.keys(styles) })),
    null,
    2
  ) + '\n'
);

// --- Framework packages
// ponytail: outline Style only until the component API ticket decides how Styles surface in each package.
const outlineIcons = icons.filter((i) => i.styles.outline).map((i) => ({ ...i, ...i.styles.outline }));

fresh(join(pkg('react'), 'src/icons'));
fresh(join(pkg('vue'), 'src/icons'));
fresh(join(pkg('web-components'), 'src/icons'));

for (const { name, pascalName, viewBox, inner } of outlineIcons) {
  writeFileSync(
    join(pkg('react'), 'src/icons', `${pascalName}.tsx`),
    `import * as React from 'react';
import type { IconProps } from '../types';

export const ${pascalName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, ...props }, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width={size} height={size} fill="currentColor" {...props}>
      ${kebabAttrsToCamel(inner)}
    </svg>
  )
);

${pascalName}.displayName = '${pascalName}';
`
  );

  writeFileSync(
    join(pkg('vue'), 'src/icons', `${pascalName}.ts`),
    `import { defineComponent, h } from 'vue';

export const ${pascalName} = defineComponent({
  name: '${pascalName}',
  props: { size: { type: [Number, String], default: 24 } },
  setup(props) {
    return () =>
      h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '${viewBox}',
        width: props.size,
        height: props.size,
        fill: 'currentColor',
        innerHTML: ${JSON.stringify(inner)},
      });
  },
});
`
  );

  writeFileSync(
    join(pkg('web-components'), 'src/icons', `${name}.ts`),
    `const template = document.createElement('template');
template.innerHTML = \`
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${inner}</svg>
\`;

export class MoonveilIcon${pascalName} extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'color'];
  }

  private svg: SVGSVGElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.svg = shadow.querySelector('svg') as SVGSVGElement;
  }

  connectedCallback() {
    this.applySize();
    this.applyColor();
  }

  attributeChangedCallback(name: string) {
    if (name === 'size') this.applySize();
    if (name === 'color') this.applyColor();
  }

  private applySize() {
    const size = this.getAttribute('size') ?? '24';
    this.svg.setAttribute('width', size);
    this.svg.setAttribute('height', size);
  }

  private applyColor() {
    this.style.color = this.getAttribute('color') ?? '';
  }
}

customElements.define('moonveil-icon-${name}', MoonveilIcon${pascalName});
`
  );
}

const barrel = (lines) => lines.join('\n') + '\n';
writeFileSync(
  join(pkg('react'), 'src/index.ts'),
  barrel([
    `export type { IconProps } from './types';`,
    ...outlineIcons.map((i) => `export { ${i.pascalName} } from './icons/${i.pascalName}';`),
  ])
);
writeFileSync(
  join(pkg('vue'), 'src/index.ts'),
  barrel(outlineIcons.map((i) => `export { ${i.pascalName} } from './icons/${i.pascalName}';`))
);
writeFileSync(
  join(pkg('web-components'), 'src/index.ts'),
  barrel(outlineIcons.map((i) => `export { MoonveilIcon${i.pascalName} } from './icons/${i.name}';`))
);

console.log(`Generated ${icons.length} icons (${outlineIcons.length} in framework packages).`);
