<template>
  <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.scripts.title')" :subtitle="t('ui.settings.scripts.subtitle')" />

    <div v-if="supportedEnvironments.length > 0" class="flex flex-wrap gap-3">
      <span v-for="env in supportedEnvironments" :key="'env_' + env.name" v-tooltip.bottom="env.installed ? undefined : t('ui.settings.scripts.envMissingHint')">
        <StatusTag
          :type="env.installed ? 'delivered' : 'processing'"
          :label="env.installed ? t('ui.settings.scripts.envFound', { name: envLabel(env.name), version: shortVersion(env.version) }) : t('ui.settings.scripts.envMissing', { name: envLabel(env.name) })"
        />
      </span>
    </div>

    <div class="grid flex-1 grid-cols-[minmax(0,340fr)_minmax(0,544fr)] items-stretch gap-6">
      <section class="ma-card gap-1">
        <ul v-if="allScripts.length > 0" class="flex flex-col gap-1" role="listbox">
          <li v-for="script in allScripts" :key="script.env + '/' + script.name">
            <button
              role="option"
              :aria-selected="isSelected(script)"
              class="flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left"
              :class="isSelected(script) ? 'border-line-brand bg-mint' : 'border-transparent hover:bg-dezent'"
              @click="selected = script"
            >
              <Code :size="18" class="shrink-0" :class="isSelected(script) ? 'text-icon-brand' : 'text-ink-muted'" />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="ma-text-strong truncate">{{ script.name }}</span>
                <span class="ma-small text-ink-muted">{{ envLabel(script.env) }}</span>
              </span>
            </button>
          </li>
        </ul>
        <EmptyState v-else :icon="Code" :title="t('ui.settings.scripts.emptyTitle')" :text="t('ui.settings.scripts.emptyText')" />
      </section>

      <ScriptViewer v-if="selected" :script-environment="selected.env" :script-name="selected.name" />
      <section v-else class="flex items-center justify-center rounded-[12px] border border-line bg-flaeche p-6 text-ink-muted">
        {{ t('ui.settings.scripts.selectHint') }}
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Code } from 'lucide-vue-next';
import Scripts from 'src/services/node/Scripts';
import PageHeader from 'components/shell/PageHeader.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import { useNotify } from 'src/composables/useNotify';
import ScriptViewer from './scripts/ScriptViewer.vue';

interface ScriptEntry { env: string; name: string }

const { t } = useI18n();
const notify = useNotify();
const scriptsService = new Scripts();
const allEnvs = ['python', 'node'];
const supportedEnvironments = ref<{ name: string; version: string; installed: boolean }[]>([]);
const allScripts = ref<ScriptEntry[]>([]);
const selected = ref<ScriptEntry | null>(null);

function isSelected(script: ScriptEntry) {
  return selected.value?.env === script.env && selected.value?.name === script.name;
}

/** "Python 3.12.1" → "3.12.1" (python --version repeats the name) */
function shortVersion(version: string | undefined) {
  return (version ?? '').replace(/^python\s*/i, '');
}

function envLabel(env: string) {
  return env === 'python' || env === 'node' ? t(`ui.settings.scripts.envs.${env}`) : env;
}

async function loadSupportedEnvironments() {
  try {
    supportedEnvironments.value = await scriptsService.getSupportedScriptEnvironments();
  } catch (error) {
    console.error('Error loading supported script environments:', error);
    notify.error(t('ui.settings.scripts.loadEnvError'));
  }
}

async function loadScriptsForEnvironment(env: string): Promise<ScriptEntry[]> {
  try {
    const scripts = await scriptsService.getAvailableScripts(env);
    return scripts.map((name) => ({ env, name }));
  } catch (error) {
    console.error(`Error loading scripts for environment ${env}:`, error);
    notify.error(t('ui.settings.scripts.loadScriptsError', { env: envLabel(env) }));
    return [];
  }
}

onMounted(() => {
  void loadSupportedEnvironments();
  void Promise.all(allEnvs.map((env) => loadScriptsForEnvironment(env))).then((lists) => {
    allScripts.value = lists.flat();
    selected.value = allScripts.value[0] ?? null;
  });
});
</script>
