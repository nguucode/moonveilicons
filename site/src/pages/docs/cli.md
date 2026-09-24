---
layout: ../../layouts/DocsLayout.astro
title: CLI
description: Search Moonveil Icons and copy them into your project.
---

# CLI

The CLI copies Icons into your project as standalone files, with no runtime dependency. It reads its own package, so it works offline.

```bash
npx moonveilicons search heart
npx moonveilicons list --category social
npx moonveilicons add heart star --style solid --format react --out src/icons
```

| Option | Default | Values |
| --- | --- | --- |
| `--style` | `outline` | `outline`, `solid` |
| `--format` | `svg` | `svg` → `mvi-<style>-<name>.svg`, `react` → `Mvi<Style><Name>.tsx`, `vue` → `Mvi<Style><Name>.vue` |
| `--out` | `./icons` | any directory |
| `--force` | off | overwrite existing files |

The CLI needs Node 18.3 or newer.
