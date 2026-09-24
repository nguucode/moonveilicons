# Moonveil Icons

A multi-framework SVG icon library. Icon sources live once in [`icons/`](./icons) and are compiled into these published packages:

- [`moonveilicons`](./packages/core) — optimized SVGs and `icons.json` metadata
- [`@moonveilicons/react`](./packages/react) — React components
- [`@moonveilicons/vue`](./packages/vue) — Vue 3 components
- [`@moonveilicons/web-components`](./packages/web-components) — framework-agnostic custom elements

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
3. `npm run build` builds all packages.

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

## Development

```bash
npm install
npm run build   # lint icons, generate sources, build every package
npm test        # smoke-test the built packages
```

Generated sources (`packages/*/src/icons`, barrels, `packages/core/svg`, `icons.json`) are gitignored; `npm run build` recreates them. CI runs build and test on every PR.
