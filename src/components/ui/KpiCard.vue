<template>
  <!-- MA/Kennzahl -->
  <div class="flex flex-col gap-1.5 rounded-[12px] border border-line bg-flaeche px-5 py-4">
    <span class="ma-label text-ink-muted">{{ label }}</span>
    <span class="ma-title-xl">{{ value }}</span>
    <span v-if="hint" class="ma-small text-ink-muted">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>();
</script>
