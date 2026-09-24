import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
// ponytail: outline Style only until the component API ticket decides how Styles surface in each package.
const iconsDir = join(root, 'icons/outline');

const reactIconsDir = join(root, 'packages/react/src/icons');
const vueIconsDir = join(root, 'packages/vue/src/icons');
const wcIconsDir = join(root, 'packages/web-components/src/icons');

for (const dir of [reactIconsDir, vueIconsDir, wcIconsDir]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: { overrides: { removeViewBox: false } },
    },
  ],
};

function toPascalCase(kebab) {
  return kebab
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function kebabAttrsToCamel(markup) {
  return markup.replace(
    /(\s)([a-zA-Z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)+)(?==)/g,
    (_, space, attr) => space + attr.replace(/-([a-z0-9])/g, (_m, c) => c.toUpperCase())
  );
}

function extractSvg(optimizedSvg) {
  const match = optimizedSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);
  if (!match) {
    throw new Error(`Could not parse optimized SVG: ${optimizedSvg}`);
  }
  const [, viewBox, inner] = match;
  return { viewBox, inner: inner.trim() };
}

const files = readdirSync(iconsDir).filter((f) => f.endsWith('.svg'));
const icons = [];

for (const file of files) {
  const name = file.replace(/\.svg$/, '');
  const pascalName = toPascalCase(name);
  const raw = readFileSync(join(iconsDir, file), 'utf8');
  const { data: optimized } = optimize(raw, svgoConfig);
  const { viewBox, inner } = extractSvg(optimized);

  icons.push({ name, pascalName, viewBox, inner });

  // React
  writeFileSync(
    join(reactIconsDir, `${pascalName}.tsx`),
    `import * as React from 'react';
import type { IconProps } from '../types';

export const ${pascalName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBox}"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      ${kebabAttrsToCamel(inner)}
    </svg>
  )
);

${pascalName}.displayName = '${pascalName}';
`
  );

  // Vue
  writeFileSync(
    join(vueIconsDir, `${pascalName}.vue`),
    `<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 24 });
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBox}"
    :width="size"
    :height="size"
    fill="currentColor"
    v-bind="$attrs"
  >
    ${inner}
  </svg>
</template>
`
  );

  // Web Component
  writeFileSync(
    join(wcIconsDir, `${name}.ts`),
    `const template = document.createElement('template');
template.innerHTML = \`
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">
    ${inner}
  </svg>
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
    const color = this.getAttribute('color');
    this.style.color = color ?? '';
  }
}

customElements.define('moonveil-icon-${name}', MoonveilIcon${pascalName});
`
  );
}

// React barrel + shared types
writeFileSync(
  join(root, 'packages/react/src/types.ts'),
  `import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
`
);
writeFileSync(
  join(root, 'packages/react/src/index.ts'),
  `export type { IconProps } from './types';
${icons.map((i) => `export { ${i.pascalName} } from './icons/${i.pascalName}';`).join('\n')}
`
);

// Vue barrel
writeFileSync(
  join(root, 'packages/vue/src/index.ts'),
  `${icons.map((i) => `export { default as ${i.pascalName} } from './icons/${i.pascalName}.vue';`).join('\n')}
`
);

// Web components barrel
writeFileSync(
  join(root, 'packages/web-components/src/index.ts'),
  `${icons.map((i) => `export { MoonveilIcon${i.pascalName} } from './icons/${i.name}';`).join('\n')}
`
);

console.log(`Generated ${icons.length} icons for react, vue, and web-components.`);
