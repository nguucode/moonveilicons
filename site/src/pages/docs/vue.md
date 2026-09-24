---
layout: ../../layouts/DocsLayout.astro
title: Vue
description: Use Moonveil Icons as Vue 3 components.
---

# Vue

```bash
npm i @moonveilicons/vue
```

```vue
<script setup>
import { MviOutlineHeart, MviSolidHeart } from '@moonveilicons/vue';
</script>

<template>
  <MviOutlineHeart :size="32" />
  <mvi-solid-heart color="crimson" flip="horizontal" title="Liked" />
</template>
```

Components can be written in PascalCase or kebab-case in templates. They take `size`, `color`, `rotate`, `flip` and `title`; other attributes (`class`, `style`, listeners) fall through to the `<svg>`.
