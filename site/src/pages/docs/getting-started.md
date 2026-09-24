---
layout: ../../layouts/DocsLayout.astro
title: Getting started
description: Pick the Moonveil Icons package that fits your stack.
---

# Getting started

Moonveil Icons is one icon set drawn in two **Styles**, `outline` and `solid`, and shipped to several places. Pick the one that fits your project:

| You use | Install | Guide |
| --- | --- | --- |
| React | `npm i @moonveilicons/react` | [React](/moonveilicons/docs/react) |
| Vue 3 | `npm i @moonveilicons/vue` | [Vue](/moonveilicons/docs/vue) |
| Any HTML page | `npm i @moonveilicons/web-components` | [Web Component](/moonveilicons/docs/web-components) |
| CSS classes | `npm i moonveilicons` or a CDN link | [Webfont + CSS](/moonveilicons/docs/webfont) |
| Plain SVG files | CDN or `npm i moonveilicons` | [CDN & raw SVG](/moonveilicons/docs/cdn) |
| Copy into your repo | `npx moonveilicons add <name>` | [CLI](/moonveilicons/docs/cli) |

## Naming

Every Icon has a kebab-case name such as `arrow-right`. It shows up the same way everywhere:

- React and Vue components: `Mvi<Style><Name>`, for example `MviOutlineArrowRight`
- CSS classes: `mvi mvi-outline-arrow-right`
- Web Component: `<mvi-icon name="arrow-right" type="outline">`
- Files: `svg/outline/arrow-right.svg`

## Shared options

All the component Surfaces accept the same options:

| Prop | Default | Notes |
| --- | --- | --- |
| `size` | `24` | number (px) or any CSS length |
| `color` | `currentColor` | inherits the text colour by default |
| `rotate` | none | `90`, `180` or `270` |
| `flip` | none | `horizontal` or `vertical` |
| `title` | none | gives the icon an accessible name |

Icons are **decorative by default** (`aria-hidden="true"`). Pass a `title` when the icon carries meaning on its own, like an icon-only button.
