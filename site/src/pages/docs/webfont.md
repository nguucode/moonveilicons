---
layout: ../../layouts/DocsLayout.astro
title: Webfont + CSS
description: Moonveil Icons as an icon font with CSS classes.
---

# Webfont + CSS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/moonveilicons/css/moonveilicons.css">

<i class="mvi mvi-outline-heart"></i>
<i class="mvi mvi-solid-heart mvi-lg mvi-beat"></i>
```

With a bundler: `import 'moonveilicons/css/moonveilicons.css'`. The font is a single woff2 holding both Styles. Glyphs keep their codepoint across releases, so cached CSS never shows the wrong icon.

Glyphs follow the surrounding text: they take its `font-size` and `color`.

## Utility classes

These also work on the React and Vue components. The rotate, flip and animation classes also work on `<mvi-icon>`.

| Class | Effect |
| --- | --- |
| `mvi-xs` `mvi-sm` `mvi-md` `mvi-lg` `mvi-xl` | 16 / 20 / 24 / 32 / 48px |
| `mvi-rotate-90` `mvi-rotate-180` `mvi-rotate-270` | rotate |
| `mvi-flip-horizontal` `mvi-flip-vertical` | mirror |
| `mvi-spin` `mvi-pulse` `mvi-beat` | animate |

Animations switch off when the visitor asks for reduced motion.

<p>
  <i class="mvi mvi-outline-star mvi-lg mvi-spin"></i>
  <i class="mvi mvi-solid-heart mvi-lg mvi-pulse" style="color:crimson"></i>
  <i class="mvi mvi-solid-star mvi-lg mvi-beat"></i>
</p>
