<template>
  <!-- Fußleiste of multi-step flows: cancel left, back/next right -->
  <footer class="flex items-center gap-2 border-t border-line bg-flaeche px-8 py-3.5">
    <Button v-if="cancelLabel" text :label="cancelLabel" @click="emit('cancel')" />
    <div class="flex-1" />
    <span v-if="hint" class="ma-small text-ink-muted">{{ hint }}</span>
    <slot name="extra" />
    <Button v-if="backLabel" severity="secondary" outlined :label="backLabel" @click="emit('back')">
      <template #icon><ChevronLeft :size="18" /></template>
    </Button>
    <Button :label="nextLabel" :disabled="nextDisabled" :loading="loading" @click="emit('next')">
      <template #icon><component :is="nextIcon ?? ChevronRight" :size="18" /></template>
    </Button>
  </footer>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import Button from 'openvue/button';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
  nextLabel: string;
  backLabel?: string;
  cancelLabel?: string;
  hint?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  nextIcon?: Component;
}>();
const emit = defineEmits<{ next: []; back: []; cancel: [] }>();
</script>
