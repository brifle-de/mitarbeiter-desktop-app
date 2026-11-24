<template>
  <!-- document type as a coloured pill; the colour name comes from computePillColors() -->
  <span class="ma-label inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px]" :class="tone">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ label?: string | null; color?: string | undefined }>();

const tones: Record<string, string> = {
  blue: 'bg-info-soft text-info',
  orange: 'bg-warn-soft text-ink',
  yellow: 'bg-warn-soft text-ink',
  purple: 'bg-highlight text-on-highlight',
  red: 'bg-danger-soft text-danger',
  green: 'bg-mint text-brand-ink',
};
const tone = computed(() => (props.color && tones[props.color]) || 'bg-dezent text-ink-muted');
</script>
