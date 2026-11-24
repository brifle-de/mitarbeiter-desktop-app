<template>
  <!-- MA/Dateiablage: drag & drop or click to choose (files come back as File objects) -->
  <div
    class="flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border-[1.5px] border-dashed px-6 py-8 text-center transition-colors"
    :class="over ? 'border-line-brand bg-mint' : 'border-line bg-flaeche hover:border-line-brand'"
    role="button"
    tabindex="0"
    @click="input?.click()"
    @keydown.enter="input?.click()"
    @dragover.prevent="over = true"
    @dragleave.prevent="over = false"
    @drop.prevent="onDrop"
  >
    <IconBadge :icon="Upload" :size="44" round />
    <span class="ma-text-strong">{{ over ? overTitle : title }}</span>
    <span v-if="hint" class="ma-small text-ink-muted">{{ hint }}</span>
    <input ref="input" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="onPick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';
import IconBadge from './IconBadge.vue';

withDefaults(defineProps<{ title: string; overTitle?: string | undefined; hint?: string | undefined; accept?: string | undefined; multiple?: boolean }>(), {
  overTitle: 'Loslassen zum Hinzufügen',
  accept: 'application/pdf',
});
const emit = defineEmits<{ files: [files: File[]] }>();
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);

function onDrop(e: DragEvent) {
  over.value = false;
  emit('files', Array.from(e.dataTransfer?.files ?? []));
}
function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  emit('files', Array.from(el.files ?? []));
  el.value = '';
}
</script>
