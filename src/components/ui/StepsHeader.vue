<template>
  <!-- row of MA/Stepper-Schritt: done ✓, active (outlined), open (muted) -->
  <ol class="flex items-center gap-3 rounded-[12px] border border-line bg-flaeche px-5 py-4">
    <template v-for="(s, i) in steps" :key="s.title">
      <li class="flex items-center gap-2.5" :class="{ 'cursor-pointer': clickable && i < active }" @click="clickable && i < active && emit('select', i)">
        <span
          class="ma-label flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="i < active ? 'bg-brand text-on-brand' : i === active ? 'border-2 border-line-brand bg-flaeche text-brand-ink' : 'bg-dezent text-ink-muted'"
        >
          <Check v-if="i < active" :size="16" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="flex flex-col">
          <span :class="i <= active ? 'ma-text-strong' : 'text-ink-muted'">{{ s.title }}</span>
          <span v-if="s.description" class="ma-small text-ink-muted">{{ s.description }}</span>
        </span>
      </li>
      <li v-if="i < steps.length - 1" aria-hidden="true" class="h-0.5 min-w-6 flex-1 rounded" :class="i < active ? 'bg-brand' : 'bg-dezent'" />
    </template>
  </ol>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';

defineProps<{ steps: { title: string; description?: string }[]; active: number; clickable?: boolean }>();
const emit = defineEmits<{ select: [index: number] }>();
</script>
