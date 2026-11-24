<template>
  <!-- selectable option card (source, assignment type, action for receivers without Brifle) -->
  <button
    type="button"
    class="flex items-start gap-3 rounded-[12px] border p-4 text-left transition-colors"
    :class="active ? 'border-line-brand bg-mint' : 'border-line bg-flaeche hover:border-line-brand'"
    :aria-pressed="active"
    @click="emit('select')"
  >
    <IconBadge :icon="icon" :size="40" />
    <span class="flex min-w-0 flex-1 flex-col gap-0.5">
      <span class="ma-text-strong">{{ title }}</span>
      <span v-if="text" class="ma-small text-ink-muted">{{ text }}</span>
    </span>
    <Check v-if="active" :size="18" class="shrink-0 text-icon-brand" />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { Check } from 'lucide-vue-next';
import IconBadge from 'components/ui/IconBadge.vue';

defineProps<{ icon: Component; title: string; text?: string; active?: boolean }>();
const emit = defineEmits<{ select: [] }>();
</script>
