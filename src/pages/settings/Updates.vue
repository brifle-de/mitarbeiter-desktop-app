<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.updates.title')" :subtitle="t('ui.settings.updates.subtitle')" />
    <div class="grid grid-cols-2 gap-6">
      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.settings.updates.version') }}</h2>
        <dl class="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2.5">
          <dt class="ma-small text-ink-muted">{{ t('ui.settings.updates.installed') }}</dt>
          <dd>{{ version }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.settings.updates.available') }}</dt>
          <dd>{{ info?.isUpdateAvailable ? info.version : t('ui.settings.updates.none') }}</dd>
          <template v-if="status">
            <dt class="ma-small text-ink-muted">Status</dt>
            <dd>{{ t(`ui.settings.updates.state.${status.state}`) }}</dd>
          </template>
          <template v-if="status?.error">
            <dt class="ma-small text-ink-muted">{{ t('ui.settings.updates.lastError') }}</dt>
            <dd class="text-danger">{{ status.error }}</dd>
          </template>
        </dl>
        <Message v-if="status && !status.supported" severity="info">{{ t('ui.settings.updates.unsupported') }}</Message>
        <UpdateBanner />
        <div class="flex gap-2">
          <Button severity="secondary" outlined :label="t('ui.settings.updates.checkNow')" :disabled="!status?.supported" :loading="checking" @click="check">
            <template #icon><RefreshCw :size="18" /></template>
          </Button>
        </div>
      </section>
      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.settings.updates.channel') }}</h2>
        <p class="text-ink-muted">{{ t('ui.settings.updates.channelText') }}</p>
        <label class="flex items-center gap-2.5">
          <ToggleSwitch :model-value="status?.channel === 'test'" :disabled="!status?.supported" @update:model-value="(on: boolean) => setChannel(on ? 'test' : 'stable')" />
          {{ t('ui.settings.updates.testChannel') }}
        </label>
        <Message severity="info">
          <span class="ma-text-strong">{{ t('ui.settings.updates.infoTitle') }}</span><br />{{ t('ui.settings.updates.infoText') }}
        </Message>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RefreshCw } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import ToggleSwitch from 'openvue/toggleswitch';
import PageHeader from 'components/shell/PageHeader.vue';
import UpdateBanner from 'components/ui/UpdateBanner.vue';
import { useUpdates } from 'src/composables/useUpdates';

const { t } = useI18n();
const { status, info, checkNow, setChannel } = useUpdates();
const version = ref('');
const checking = ref(false);
void window.electronApi.getAppVersion().then((v: string) => (version.value = v));

async function check() {
  checking.value = true;
  try { await checkNow(); } finally { checking.value = false; }
}
</script>
