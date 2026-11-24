<template>
  <Dialog v-model:visible="value" modal :header="parser.name" :style="{ width: '760px', maxWidth: '90vw' }">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="ma-label text-ink-muted">{{ t('ui.settings.parsers.dialog.description') }}</h3>
        <p>{{ parser.description }}</p>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h3 class="ma-label flex-1 text-ink-muted">{{ t('ui.settings.parsers.dialog.rules') }}</h3>
          <Button size="small" text :label="t('ui.settings.parsers.dialog.copy')" @click="cpToClipBoard(jsonValue)">
            <template #icon><Copy :size="16" /></template>
          </Button>
        </div>
        <pre class="max-h-[50vh] overflow-auto rounded-[10px] bg-dezent p-4 font-mono text-[12px] leading-[18px]">{{ jsonValue }}</pre>
      </div>
    </div>
    <template #footer>
      <Button :label="t('ui.settings.close')" @click="value = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Copy } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import { copyToClipboard } from 'src/composables/useClipboard';
import { useNotify } from 'src/composables/useNotify';

const props = defineProps<{ parser: { rules: unknown; name: string; description: string } }>();
const value = defineModel<boolean>({ default: false });
const { t } = useI18n();
const notify = useNotify();

const jsonValue = computed(() => JSON.stringify(props.parser.rules, null, 2));

function cpToClipBoard(text: string) {
  copyToClipboard(text).then(() => {
    notify.success(t('ui.settings.parsers.dialog.copied'), { life: 2000 });
  }).catch(() => {
    notify.error(t('ui.settings.parsers.dialog.copyError'), { life: 2000 });
  });
}
</script>
