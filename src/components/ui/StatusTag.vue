<template>
  <!-- MA/Status-Tag: never colour alone, the label is always written out -->
  <span class="ma-label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px]" :class="styles[type]">
    <span class="h-1.5 w-1.5 rounded-full bg-current" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
export type StatusType = 'delivered' | 'read' | 'post' | 'processing' | 'error' | 'test' | 'signature';

withDefaults(defineProps<{ type: StatusType; label?: string }>(), { label: '' });

const styles: Record<StatusType, string> = {
  delivered: 'bg-mint text-brand-ink',
  read: 'bg-brand text-on-brand',
  post: 'bg-info-soft text-info',
  processing: 'bg-warn-soft text-ink',
  error: 'bg-danger-soft text-danger',
  test: 'bg-dezent text-ink-muted',
  signature: 'bg-highlight text-on-highlight',
};
</script>
