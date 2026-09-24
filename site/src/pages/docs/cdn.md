---
layout: ../../layouts/DocsLayout.astro
title: CDN & raw SVG
description: Load Moonveil Icons files straight from a CDN.
---

# CDN & raw SVG

Everything in the `moonveilicons` package is served by jsDelivr:

| File | URL |
| --- | --- |
| CSS + font | `https://cdn.jsdelivr.net/npm/moonveilicons/css/moonveilicons.css` |
| One SVG | `https://cdn.jsdelivr.net/npm/moonveilicons/svg/<style>/<name>.svg` |
| Metadata | `https://cdn.jsdelivr.net/npm/moonveilicons/icons.json` |

**Pin a version in production**, for example `moonveilicons@1`, so a new release can't change your pages without you knowing.

`icons.json` lists every Icon with its Styles, category and tags:

```json
[{ "name": "heart", "category": "social", "tags": ["like", "love"], "styles": ["outline", "solid"] }]
```

SVGs are 24×24, filled, and use `currentColor`, so they take the colour of the text around them when inlined.
