---
layout: ../../layouts/DocsLayout.astro
title: Adding icons
description: The rules every Moonveil Icons source file follows.
---

# Adding icons

Icon sources live in [`icons/`](https://github.com/nguucode/moonveilicons/tree/main/icons) as `icons/<style>/<name>.svg`. An Icon can exist in one Style or both.

## The rules

- `viewBox="0 0 24 24"`, keeping a 2px margin (20×20 live area).
- **Filled paths only.** Run *Outline stroke* before exporting, and leave no `stroke` attributes.
- One colour: leave `fill` unset or use `currentColor`. No styles, scripts, images or text.
- Names are kebab-case `a-z0-9`, going from general to specific (`arrow-right`, `user-plus`), with no Style suffix.
- Search metadata is optional and lives in `icons/meta.json`: `{ "<name>": { "category": "...", "tags": ["..."] } }`.

## Check and build

```bash
npm run lint:icons   # checks the rules above
npm run build        # generates every package and this site
npm test
```

Commit the updated `icons/codepoints.json` along with your icons. It pins each glyph's webfont codepoint.
