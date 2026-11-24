<template>
  <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="`${t('ui.settings.path')} · ${t('ui.settings.scripts.title')}`" :title="scriptName" :subtitle="t(`ui.settings.scripts.envs.${envKey}`)">
      <template #actions>
        <Button severity="secondary" outlined :label="t('ui.settings.scripts.back')" @click="router.push({ name: 'settings.scripts' })">
          <template #icon><ArrowLeft :size="18" /></template>
        </Button>
      </template>
    </PageHeader>
    <ScriptViewer class="flex-1" :script-environment="scriptEnvironment" :script-name="scriptName" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft } from 'lucide-vue-next';
import Button from 'openvue/button';
import PageHeader from 'components/shell/PageHeader.vue';
import ScriptViewer from './ScriptViewer.vue';

const props = defineProps<{ scriptEnvironment: string; scriptName: string }>();
const { t } = useI18n();
const router = useRouter();
const envKey = computed(() => (props.scriptEnvironment === 'python' ? 'python' : 'node'));
</script>
