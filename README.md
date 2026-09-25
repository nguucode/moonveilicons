# Moonveil Icons

A multi-framework SVG icon library. Icon sources live once in [`icons/`](./icons) and are compiled into these published packages:

- [`moonveilicons`](./packages/core) — optimized SVGs, `icons.json` metadata, woff2 webfont + CSS, and the CLI
- [`@moonveilicons/react`](./packages/react) — React components
- [`@moonveilicons/vue`](./packages/vue) — Vue 3 components
- [`@moonveilicons/web-components`](./packages/web-components) — framework-agnostic custom elements

Browse the icons and read the docs at **https://ontheshore.biz/moonveilicons/**.

## Adding an icon

Icon sources live in `icons/<style>/<name>.svg`, where `<style>` is `outline` or `solid`. An Icon may exist in one Style or both.

- `viewBox="0 0 24 24"`, keeping a 2px margin (20×20 live area).
- **Filled paths only**: run "Outline stroke" before exporting. No `stroke` attributes (see [ADR 0001](./docs/adr/0001-filled-icon-sources.md)).
- One colour: leave `fill` unset or use `currentColor`. No styles, scripts, images or text.
- Names are kebab-case `a-z0-9`, general to specific (`arrow-right`, `user-plus`), with no Style suffix.
- Optional search metadata goes in [`icons/meta.json`](./icons/meta.json): `{ "<name>": { "category": "...", "tags": ["..."] } }`.

Then:

1. `npm run lint:icons` checks the rules above.
2. `npm run generate` lints, then regenerates the React, Vue, and web component sources.
3. `npm run build` builds all packages. Commit the updated `icons/codepoints.json`: it pins each webfont glyph's codepoint so it never moves between releases.

## Usage

Every Icon is exported once per Style as `Mvi<Style><Name>`: `MviOutlineHeart`, `MviSolidHeart`.

Shared props: `size` (default `24`), `color` (default `currentColor`), `rotate` (`90 | 180 | 270`), `flip` (`'horizontal' | 'vertical'`), `title`. Without `title` an icon is decorative (`aria-hidden="true"`); with it, it becomes `role="img"` with a `<title>`.

**React**

```tsx
import { MviOutlineHeart, MviSolidHeart } from '@moonveilicons/react';

<MviOutlineHeart size={32} />
<MviSolidHeart color="crimson" rotate={90} title="Liked" />
```

**Vue**

```vue
<script setup>
import { MviOutlineHeart, MviSolidHeart } from '@moonveilicons/vue';
</script>

<template>
  <MviOutlineHeart :size="32" />
  <mvi-solid-heart color="crimson" flip="horizontal" title="Liked" />
</template>
```

**Web Component**

One element, every Icon bundled:

```html
<script type="module">
  import '@moonveilicons/web-components';
</script>

<mvi-icon name="heart"></mvi-icon>
<mvi-icon name="heart" type="solid" size="32" color="crimson" rotate="90" title="Liked"></mvi-icon>
```

**Webfont + CSS**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/moonveilicons/css/moonveilicons.css">

<i class="mvi mvi-outline-heart"></i>
<i class="mvi mvi-solid-heart mvi-lg mvi-beat"></i>
```

Or `import 'moonveilicons/css/moonveilicons.css'` from npm. Pin a version on the CDN (`moonveilicons@1`) in production.

Utility classes (they also work on the React/Vue components; rotate, flip and animations also on `<mvi-icon>`):

| Class | Effect |
| --- | --- |
| `mvi-xs` `mvi-sm` `mvi-md` `mvi-lg` `mvi-xl` | 16 / 20 / 24 / 32 / 48px |
| `mvi-rotate-90` `mvi-rotate-180` `mvi-rotate-270` | rotate |
| `mvi-flip-horizontal` `mvi-flip-vertical` | mirror |
| `mvi-spin` `mvi-pulse` `mvi-beat` | animate (disabled under `prefers-reduced-motion`) |

**Raw SVG**

`https://cdn.jsdelivr.net/npm/moonveilicons/svg/<style>/<name>.svg`, or `moonveilicons/svg/<style>/<name>.svg` from npm. `moonveilicons/icons.json` lists every Icon with its Styles, category and tags.

**CLI**

Search the set and copy Icons into your project as standalone files (no runtime dependency). Works offline.

```bash
npx moonveilicons search heart
npx moonveilicons list --category social
npx moonveilicons add heart star --style solid --format react --out src/icons
```

`--format` is `svg` (default, `mvi-<style>-<name>.svg`), `react` (`Mvi<Style><Name>.tsx`) or `vue` (`Mvi<Style><Name>.vue`). Existing files are kept unless you pass `--force`.

## Development

Requires Node 22.12+ (`nvm use` reads `.nvmrc`).

```bash
npm install
npm run build          # lint icons, generate sources, build every package and the site
npm test               # smoke-test the built packages
npm run dev -w site    # docs site at http://localhost:4321/moonveilicons/
```

Generated sources (`packages/*/src/icons`, barrels, `packages/core/svg`, `icons.json`) are gitignored; `npm run build` recreates them. CI runs build and test on every PR; every push to `main` deploys the site (`site/`, Astro) to GitHub Pages.

Releases: see [docs/releasing.md](./docs/releasing.md).

## Related

- [Zweihänder](https://ontheshore.biz/zweihander/): a React UI kit by the same author, documented in Storybook.
