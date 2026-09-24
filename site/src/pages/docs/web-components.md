---
layout: ../../layouts/DocsLayout.astro
title: Web Component
description: One <mvi-icon> element that works in any framework or plain HTML.
---

# Web Component

One custom element, `<mvi-icon>`, with every Icon bundled in. It works offline and in any framework.

```bash
npm i @moonveilicons/web-components
```

```html
<script type="module">
  import '@moonveilicons/web-components';
</script>

<mvi-icon name="heart"></mvi-icon>
<mvi-icon name="heart" type="solid" size="32" color="crimson" rotate="90" title="Liked"></mvi-icon>
```

Without a bundler, load it from a CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@moonveilicons/web-components/+esm"></script>
```

| Attribute | Default |
| --- | --- |
| `name` | required |
| `type` | `outline` (or `solid`) |
| `size` | `24` |
| `color` | `currentColor` |
| `rotate` | `90` / `180` / `270` |
| `flip` | `horizontal` / `vertical` |
| `title` | sets `role="img"` and `aria-label` |
