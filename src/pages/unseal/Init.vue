<template>
  <BrandLogo />
  <form class="ma-card w-full gap-4 p-8" @submit.prevent="initApp()">
    <h1 class="ma-title-l">{{ t('ui.access.init.title') }}</h1>
    <p class="text-ink-muted">{{ t('ui.access.init.text') }}</p>
    <FormField :label="t('ui.access.password')" for-id="init-password" :hint="passwordHint">
      <Password input-id="init-password" v-model="password" :feedback="false" toggle-mask fluid autofocus />
    </FormField>
    <div class="grid grid-cols-4 gap-1" aria-hidden="true">
      <span v-for="i in 4" :key="i" class="h-1 rounded-full" :class="i <= filledSegments ? 'bg-brand' : 'bg-dezent'" />
    </div>
    <FormField :label="t('ui.access.init.repeat')" for-id="init-password-repeat" :error="mismatch ? t('ui.access.init.mismatch') : ''">
      <Password input-id="init-password-repeat" v-model="repeat" :feedback="false" toggle-mask fluid :invalid="mismatch" />
    </FormField>
    <Button type="submit" :label="t('ui.access.init.submit')" :disabled="!validPassword" :loading="busy" fluid>
      <template #icon><Check :size="18" /></template>
    </Button>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Check } from 'lucide-vue-next';
import Button from 'openvue/button';
import Password from 'openvue/password';
import FormField from 'components/ui/FormField.vue';
import BrandLogo from './BrandLogo.vue';
import { useEncryptedStore } from '@src/stores/encrypted-store';
import { useNotify } from 'src/composables/useNotify';

const MIN_LENGTH = 12;
const { t } = useI18n();
const router = useRouter();
const notify = useNotify();
const encryptedStorage = useEncryptedStore();

const password = ref('');
const repeat = ref('');
const busy = ref(false);

/** progress towards the minimum length (12 characters = all four segments) */
const filledSegments = computed(() => Math.min(4, Math.floor((password.value.length / MIN_LENGTH) * 4)));
const passwordHint = computed(() =>
  password.value.length > 0 && password.value.length < MIN_LENGTH
    ? t('ui.access.init.tooShort', { count: MIN_LENGTH - password.value.length })
    : t('ui.access.init.hint'),
);
const mismatch = computed(() => repeat.value.length > 0 && repeat.value !== password.value);
const validPassword = computed(() => password.value.length >= MIN_LENGTH && repeat.value === password.value);

function initApp() {
  if (!validPassword.value || busy.value) return;
  busy.value = true;
  encryptedStorage.init(password.value).then(() => {
    void router.push({ path: '/accounts' });
  }).catch((err: Error) => {
    console.error(err);
    notify.error(t('ui.access.init.error'));
  }).finally(() => {
    busy.value = false;
  });
}
</script>
