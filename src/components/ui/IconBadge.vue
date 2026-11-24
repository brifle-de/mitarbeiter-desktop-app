<template>
  <span class="flex shrink-0 items-center justify-center" :class="[round ? 'rounded-full' : 'rounded-[10px]', tones[tone]]" :style="{ width: `${size}px`, height: `${size}px` }">
    <component :is="icon" :size="Math.round(size / 2)" />
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(defineProps<{ icon: Component; size?: number | undefined; round?: boolean | undefined; tone?: 'brand' | 'danger' | 'info' | 'warn' }>(), { size: 40, round: false, tone: 'brand' });
const tones = { brand: 'bg-mint text-icon-brand', danger: 'bg-danger-soft text-danger', info: 'bg-info-soft text-info', warn: 'bg-warn-soft text-ink' };
</script>
