<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 24 });
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="currentColor"
    v-bind="$attrs"
  >
    <path d="M18.44 19.83 12 13.41l-6.44 6.42-.36.15h-.4l-.36-.15-.15-.12-.21-.33L4 19l.08-.38.09-.18L10.59 12 4.17 5.56l-.15-.36v-.4l.06-.18.21-.33.33-.21L5 4l.38.08.18.09L12 10.59l6.44-6.42.18-.09L19 4l.38.08.33.21.12.15.15.36v.4l-.15.36L13.41 12l6.42 6.44.15.36v.4l-.15.36-.12.15-.15.12-.36.15h-.4Z"/>
  </svg>
</template>
