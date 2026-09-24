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

**React**

```tsx
import { Heart } from '@moonveilicons/react';

<Heart size={32} />;
```

**Vue**

```vue
<script setup>
import { Heart } from '@moonveilicons/vue';
</script>

<template>
  <Heart :size="32" />
</template>
```

**Web Components**

```html
<script type="module">
  import '@moonveilicons/web-components';
</script>

<moonveil-icon-heart size="32" color="crimson"></moonveil-icon-heart>
```

## Development

```bash
npm install
npm run build   # lint icons, generate sources, build every package
npm test        # smoke-test the built packages
```

Generated sources (`packages/*/src/icons`, barrels, `packages/core/svg`, `icons.json`) are gitignored; `npm run build` recreates them. CI runs build and test on every PR.
