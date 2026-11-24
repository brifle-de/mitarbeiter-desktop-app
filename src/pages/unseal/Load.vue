<template>
  <UpdateBanner class="w-full" />
  <BrandLogo />
  <form class="ma-card w-full gap-4 p-8" @submit.prevent="unsealApp()">
    <div class="flex items-center gap-3">
      <IconBadge :icon="Lock" :size="40" round />
      <h1 class="ma-title-l">{{ t('ui.access.unlock.title') }}</h1>
    </div>
    <p class="text-ink-muted">{{ t('ui.access.unlock.text') }}</p>
    <FormField :label="t('ui.access.password')" for-id="unlock-password">
      <Password input-id="unlock-password" v-model="password" :feedback="false" toggle-mask fluid autofocus />
    </FormField>
    <Button type="submit" :label="t('ui.access.unlock.submit')" :disabled="password.length === 0" :loading="busy" fluid>
      <template #icon><ChevronRight :size="18" /></template>
    </Button>
  </form>
  <span v-if="version" class="ma-small text-ink-muted">{{ t('ui.access.unlock.version', { version }) }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronRight, Lock } from 'lucide-vue-next';
import Button from 'openvue/button';
import Password from 'openvue/password';
import FormField from 'components/ui/FormField.vue';
import IconBadge from 'components/ui/IconBadge.vue';
import UpdateBanner from 'components/ui/UpdateBanner.vue';
import BrandLogo from './BrandLogo.vue';
import { useEncryptedStore } from '@src/stores/encrypted-store';
import { useNotify } from 'src/composables/useNotify';

const { t } = useI18n();
const router = useRouter();
const notify = useNotify();
const encryptedStorage = useEncryptedStore();

const password = ref('');
const busy = ref(false);
const version = ref('');
void window.electronApi.getAppVersion().then((v: string) => (version.value = v)).catch(() => undefined);

function unsealApp() {
  if (busy.value) return;
  busy.value = true;
  encryptedStorage.loadData(password.value).then(() => {
    void router.push({ path: '/accounts' });
  }).catch((err: Error) => {
    console.error('Error unsealing application:', err);
    notify.error(t('ui.access.unlock.error'), { detail: t('ui.access.unlock.errorDetail') });
  }).finally(() => {
    busy.value = false;
  });
}
</script>
