<template>
  <!-- read-only Monaco view of one script with "Ausführen" (F5); dark code surface as in Figma E3 -->
  <section class="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[12px] border border-line bg-flaeche">
    <div class="flex items-center gap-3 border-b border-line px-4 py-2.5">
      <span class="ma-text-strong min-w-0 flex-1 truncate">{{ scriptName }}</span>
      <span class="ma-small text-ink-muted">{{ t('ui.settings.scripts.readOnly') }}</span>
      <Button size="small" :label="t('ui.settings.scripts.run')" v-tooltip.bottom="'F5'" @click="showStartDialog = true">
        <template #icon><Play :size="16" /></template>
      </Button>
    </div>
    <div class="relative min-h-0 flex-1 bg-brand-strong">
      <div ref="codeContainer" class="absolute inset-0 py-3" />
    </div>

    <Dialog v-model:visible="showStartDialog" modal :header="t('ui.settings.scripts.runTitle')" :style="{ width: '720px', maxWidth: '90vw' }">
      <div class="flex flex-col gap-3">
        <p class="text-ink-muted">{{ t('ui.settings.scripts.runConfirm', { name: scriptName }) }}</p>
        <span class="ma-label text-ink-muted">{{ t('ui.settings.scripts.output') }}</span>
        <div class="max-h-[50vh] min-h-[160px] overflow-auto rounded-[10px] bg-dezent p-4">
          <pre v-if="result !== null" class="whitespace-pre-wrap font-mono text-[12px] leading-[18px]" :class="executionSucess === false ? 'text-danger' : ''">{{ result }}</pre>
          <div v-else-if="isExecuting" class="flex items-center gap-3">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="6" />
            <span>{{ t('ui.settings.scripts.running') }}</span>
          </div>
          <div v-else-if="executionSucess === false" class="text-danger">{{ t('ui.settings.scripts.failed') }}</div>
          <div v-else class="text-ink-muted">{{ t('ui.settings.scripts.notRun') }}</div>
        </div>
      </div>
      <template #footer>
        <Button severity="secondary" outlined :label="t('ui.settings.cancel')" @click="showStartDialog = false" />
        <Button :label="t('ui.settings.scripts.start')" :loading="isExecuting" @click="startScript()">
          <template #icon><Play :size="18" /></template>
        </Button>
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Play } from 'lucide-vue-next';
import * as monaco from 'monaco-editor';
import hotkeys from 'hotkeys-js';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import ProgressSpinner from 'openvue/progressspinner';
import Scripts from 'src/services/node/Scripts';
import { useNotify } from 'src/composables/useNotify';

const props = defineProps<{ scriptEnvironment: string; scriptName: string }>();
const { t } = useI18n();
const notify = useNotify();
const scriptsService = new Scripts();

const codeContainer = ref<HTMLElement | null>(null);
const showStartDialog = ref(false);
const result = ref<string | null>(null);
const executionSucess = ref<boolean | null>(null);
const isExecuting = ref(false);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const language = computed(() => {
  switch (props.scriptEnvironment) {
    case 'python':
      return 'python';
    case 'node':
      return 'javascript';
    default:
      return 'plaintext';
  }
});

function ensureEditor() {
  if (editor || !codeContainer.value) return;
  // transparent dark theme: the container provides the dark brand surface
  monaco.editor.defineTheme('transparent-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#00000000' },
  });
  editor = monaco.editor.create(codeContainer.value, {
    value: '',
    language: language.value,
    automaticLayout: true,
    theme: 'transparent-theme',
    readOnly: true,
    minimap: { enabled: false },
    hideCursorInOverviewRuler: true,
    cursorBlinking: 'expand',
    scrollBeyondLastLine: false,
  });
}

async function load() {
  result.value = null;
  executionSucess.value = null;
  try {
    const content = await scriptsService.readScriptContent(props.scriptEnvironment, props.scriptName);
    ensureEditor();
    if (!editor) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelLanguage(model, language.value);
    editor.setValue(content);
  } catch (e) {
    console.error('Error reading script:', e);
    notify.error(t('ui.settings.scripts.loadContentError'));
  }
}

function startScript() {
  isExecuting.value = true;
  result.value = null;
  scriptsService.executeScript(props.scriptEnvironment, props.scriptName).then((res) => {
    result.value = res.output;
    executionSucess.value = true;
  }).catch((error) => {
    console.error('Error executing script:', error);
    executionSucess.value = false;
    result.value = t('ui.settings.scripts.failed');
  }).finally(() => {
    isExecuting.value = false;
  });
}

// F5 toggles the run dialog, Enter starts the script while it is open
function onF5(event: KeyboardEvent) {
  event.preventDefault();
  showStartDialog.value = !showStartDialog.value;
}
function onEnter(event: KeyboardEvent) {
  if (showStartDialog.value && !isExecuting.value) {
    event.preventDefault();
    startScript();
  }
}

onMounted(() => {
  void load();
  hotkeys('f5', onF5);
  hotkeys('enter', onEnter);
});
watch(() => [props.scriptEnvironment, props.scriptName], () => void load());
onBeforeUnmount(() => {
  hotkeys.unbind('f5', onF5);
  hotkeys.unbind('enter', onEnter);
  editor?.dispose();
  editor = null;
});
</script>
