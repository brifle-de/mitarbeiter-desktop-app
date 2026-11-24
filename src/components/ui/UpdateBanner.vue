<template>
  <!-- MA/Update-Banner: shows download progress, "ready" with restart, or the test channel -->
  <div v-if="mode" class="flex items-center gap-3 rounded-[12px] px-4 py-3" :class="mode === 'test' ? 'bg-warn-soft' : 'bg-mint'">
    <component :is="mode === 'downloading' ? Download : mode === 'ready' ? RefreshCw : TriangleAlert" :size="20" :class="mode === 'test' ? 'text-ink' : 'text-brand-ink'" />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="ma-text-strong">{{ heading }}</span>
      <ProgressBar v-if="mode === 'downloading'" :value="status?.progressPercent ?? 0" :show-value="false" class="!h-1.5 max-w-[300px]" />
      <span v-else class="ma-small" :class="mode === 'test' ? 'text-ink' : 'text-ink-muted'">{{ mode === 'ready' ? t('ui.shell.update.readyHint') : t('ui.shell.update.testChannelHint') }}</span>
    </div>
    <Button v-if="mode === 'ready'" size="small" :label="t('ui.shell.update.restart')" @click="installNow">
      <template #icon><RefreshCw :size="16" /></template>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Download, RefreshCw, TriangleAlert } from 'lucide-vue-next';
import Button from 'openvue/button';
import ProgressBar from 'openvue/progressbar';
import { useUpdates } from 'src/composables/useUpdates';

const props = withDefaults(defineProps<{ showTestChannel?: boolean }>(), { showTestChannel: false });
const { t } = useI18n();
const { status, info, installNow } = useUpdates();

const mode = computed<'downloading' | 'ready' | 'test' | null>(() => {
  if (!status.value?.supported) return null;
  if (status.value.state === 'ready') return 'ready';
  if (status.value.state === 'downloading') return 'downloading';
  if (props.showTestChannel && status.value.channel === 'test') return 'test';
  return null;
});
const heading = computed(() => {
  const version = info.value?.version ?? '';
  if (mode.value === 'downloading') return t('ui.shell.update.downloading', { version, percent: status.value?.progressPercent ?? 0 });
  if (mode.value === 'ready') return t('ui.shell.update.ready', { version });
  return t('ui.shell.update.testChannel', { version });
});
</script>
