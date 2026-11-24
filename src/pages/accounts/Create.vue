<template>
  <!-- A4 Konto anlegen -->
  <form class="ma-card my-auto w-full max-w-[640px] gap-4 p-8" @submit.prevent="addAccount()">
    <div class="flex items-start gap-3">
      <h1 class="ma-title-l flex-1">{{ t('ui.access.create.title') }}</h1>
      <Button type="button" text size="small" :label="t('ui.access.accounts.import')" @click="showImportModal = true">
        <template #icon><Upload :size="16" /></template>
      </Button>
    </div>
    <p class="text-ink-muted">{{ t('ui.access.create.text') }}</p>

    <AccountFields
      v-model:name="name"
      v-model:api-key="apiKey"
      v-model:api-secret="apiSecret"
      v-model:api-env="apiEnv"
      v-model:tenant-id="tenantId"
      id-prefix="create"
      columns
      :show-errors="hasSent"
    />

    <h2 class="ma-title-m pt-2">{{ t('ui.access.create.sftpTitle') }}</h2>
    <SftpConnectionList v-model="sftpServer" />
    <Message severity="info">{{ t('ui.settings.connections.note') }}</Message>

    <Message v-if="!requiredFieldsFilledOut && hasSent" severity="error">{{ t('ui.settings.account.requiredMissing') }}</Message>
    <p v-else class="ma-small text-ink-muted">{{ t('ui.settings.account.fields.requiredNote') }}</p>

    <div class="flex justify-end gap-2">
      <Button type="button" severity="secondary" outlined :label="t('ui.access.create.cancel')" @click="$router.push({ path: '/accounts' })" />
      <Button type="submit" :label="t('ui.access.create.submit')" :loading="saving">
        <template #icon><Check :size="18" /></template>
      </Button>
    </div>
    <ImportModal v-model="showImportModal" @import="importData($event)" />
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Check, Upload } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import { SftpData, ApiEnvironment, AccountData } from 'app/src-electron/models/EncryptedStore';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useNotify } from 'src/composables/useNotify';
import AccountFields from 'src/pages/settings/components/AccountFields.vue';
import SftpConnectionList from 'src/pages/settings/connections/SftpConnectionList.vue';
import ImportModal from './modals/ImportModal.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const notify = useNotify();
const encryptedStore = useEncryptedStore();

const name = ref<string>('');
const apiKey = ref<string>('');
const apiSecret = ref<string>('');
const sftpServer = ref<SftpData[]>([]);
const apiEnv = ref<ApiEnvironment>(ApiEnvironment.PRODUCTION);
const tenantId = ref<string>('');
const hasSent = ref<boolean>(false);
const showImportModal = ref<boolean>(false);
const saving = ref(false);

const requiredFieldsFilledOut = computed(() => name.value.trim() !== '' && apiKey.value.trim() !== '' && apiSecret.value.trim() !== '');

onMounted(() => {
  // "Sicherung importieren" on the account list opens the import right away
  if (route.query.import) {
    showImportModal.value = true;
  }
});

function importData(event: { accountData: AccountData }) {
  name.value = event.accountData.name;
  apiKey.value = event.accountData.apiKey ?? '';
  apiEnv.value = event.accountData.apiEnv;
  apiSecret.value = event.accountData.apiSecret ?? '';
  tenantId.value = event.accountData.tenantId ?? '';
  sftpServer.value = [...sftpServer.value, ...(event.accountData.sftpData ?? [])];
}

function addAccount() {
  if (!requiredFieldsFilledOut.value) {
    hasSent.value = true;
    return;
  }
  const accountData: AccountData = {
    name: name.value,
    apiKey: apiKey.value,
    apiSecret: apiSecret.value,
    sftpData: sftpServer.value,
    apiEnv: apiEnv.value,
    id: '',
    tenantId: tenantId.value,
  };
  saving.value = true;
  // save account data to encrypted store (createAccount throws synchronously without key)
  Promise.resolve().then(() => encryptedStore.createAccount(accountData)).then(() => {
    void router.push({ path: '/accounts' });
  }).catch((err: unknown) => {
    console.error(err);
    notify.error(t('ui.access.create.error'), { detail: t('ui.access.create.errorDetail') });
  }).finally(() => {
    saving.value = false;
  });
}
</script>
