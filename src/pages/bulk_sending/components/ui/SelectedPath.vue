<template>
  <!-- chosen file / directory with the button that opens the picker -->
  <div class="flex items-center gap-3 rounded-[10px] border border-line bg-flaeche px-4 py-3">
    <component :is="icon" :size="18" class="shrink-0 text-icon-brand" />
    <span class="min-w-0 flex-1 truncate" :class="{ 'text-ink-muted': !path }" :title="path || undefined">{{ path || placeholder }}</span>
    <Button severity="secondary" outlined size="small" :label="buttonLabel" @click="emit('pick')">
      <template #icon><FolderOpen :size="16" /></template>
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import Button from 'openvue/button';
import { FolderOpen } from 'lucide-vue-next';

defineProps<{ icon: Component; path?: string | null; placeholder: string; buttonLabel: string }>();
const emit = defineEmits<{ pick: [] }>();
</script>
