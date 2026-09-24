---
layout: ../../layouts/DocsLayout.astro
title: React
description: Use Moonveil Icons as React components.
---

# React

```bash
npm i @moonveilicons/react
```

```tsx
import { MviOutlineHeart, MviSolidHeart } from '@moonveilicons/react';

export function Like({ liked }: { liked: boolean }) {
  return liked ? <MviSolidHeart color="crimson" title="Liked" /> : <MviOutlineHeart />;
}
```

Each Icon is exported once per Style, so bundlers keep only the ones you import. Every component takes `size`, `color`, `rotate`, `flip` and `title`, forwards its ref to the `<svg>`, and passes any other SVG attribute (`className`, `style`, `onClick`…) through.

```tsx
<MviOutlineArrowRight size={32} rotate={90} className="text-violet-600" />
```

Types: `import type { IconProps } from '@moonveilicons/react'`.
