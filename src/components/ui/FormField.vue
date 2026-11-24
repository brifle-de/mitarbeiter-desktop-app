<template>
  <!-- MA/Eingabe wrapper: label, control (slot), hint or error -->
  <div class="flex min-w-0 flex-col gap-1.5">
    <label v-if="label" :for="forId" class="ma-label">{{ label }}</label>
    <slot />
    <span v-if="error" class="ma-small text-danger">{{ error }}</span>
    <span v-else-if="hint" class="ma-small text-ink-muted">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string; hint?: string; error?: string; forId?: string }>();
</script>
