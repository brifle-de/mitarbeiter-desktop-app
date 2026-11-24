<template>
  <div class="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <IconBadge :icon="icon" :size="48" round />
    <span class="ma-title-m">{{ title }}</span>
    <span v-if="text" class="max-w-md text-ink-muted">{{ text }}</span>
    <div v-if="$slots.default" class="pt-2"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import IconBadge from './IconBadge.vue';

defineProps<{ icon: Component; title: string; text?: string }>();
</script>
