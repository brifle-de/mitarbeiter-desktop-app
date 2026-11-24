<template>
  <!-- MA/Seitenkopf: path, title (Figtree), subtitle, actions on the right (max. one primary) -->
  <header class="flex items-end gap-4">
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div v-if="path" class="ma-small text-ink-muted">{{ path }}</div>
      <h1 class="ma-title-xl">{{ title }}</h1>
      <p v-if="subtitle" class="text-ink-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2"><slot name="actions" /></div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string; path?: string; subtitle?: string }>();
</script>
