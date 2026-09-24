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

// --- Framework packages: one component per Icon per Style, named Mvi<Style><Name>
const variants = icons.flatMap((icon) =>
  Object.entries(icon.styles).map(([style, { viewBox, inner }]) => ({
    component: `Mvi${toPascalCase(style)}${icon.pascalName}`,
    style,
    name: icon.name,
    viewBox,
    inner,
  }))
);

fresh(join(pkg('react'), 'src/icons'));
fresh(join(pkg('vue'), 'src/icons'));

for (const { component, viewBox, inner } of variants) {
  writeFileSync(
    join(pkg('react'), 'src/icons', `${component}.tsx`),
    `import { createIcon } from '../createIcon';

export const ${component} = createIcon('${component}', '${viewBox}', <>${kebabAttrsToCamel(inner)}</>);
`
  );
  writeFileSync(
    join(pkg('vue'), 'src/icons', `${component}.ts`),
    `import { createIcon } from '../createIcon';

export const ${component} = createIcon('${component}', '${viewBox}', ${JSON.stringify(inner)});
`
  );
}

const barrel = (lines) => lines.join('\n') + '\n';
for (const p of ['react', 'vue']) {
  writeFileSync(
    join(pkg(p), 'src/index.ts'),
    barrel([
      ...(p === 'react' ? [`export type { IconProps } from './createIcon';`] : []),
      ...variants.map((v) => `export { ${v.component} } from './icons/${v.component}';`),
    ])
  );
}

// Web component: every Icon bundled into one map keyed "<style>/<name>" -> [viewBox, inner]
writeFileSync(
  join(pkg('web-components'), 'src/icons.ts'),
  `export const icons: Record<string, [string, string]> = ${JSON.stringify(
    Object.fromEntries(variants.map((v) => [`${v.style}/${v.name}`, [v.viewBox, v.inner]])),
    null,
    2
  )};
`
);

console.log(`Generated ${icons.length} icons, ${variants.length} components.`);
