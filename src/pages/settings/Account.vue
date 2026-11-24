<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.account.title')" :subtitle="t('ui.settings.account.subtitle')">
      <template #actions>
        <Button severity="secondary" outlined :label="t('ui.settings.account.backup.action')" :disabled="!lastData" @click="showExportAccountModal = true">
          <template #icon><Download :size="18" /></template>
        </Button>
        <Button :label="t('ui.settings.account.save')" :disabled="!isDirty || !requiredFieldsFilledOut" :loading="saving" @click="saveAccount()">
          <template #icon><Check :size="18" /></template>
        </Button>
      </template>
    </PageHeader>

    <Message v-if="!lastData" severity="warn">{{ t('ui.settings.noAccount') }}</Message>
    <div v-else class="grid grid-cols-2 items-start gap-6">
      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.settings.account.access') }}</h2>
        <AccountFields
          v-model:name="name"
          v-model:api-key="apiKey"
          v-model:api-secret="apiSecret"
          v-model:api-env="apiEnv"
          v-model:tenant-id="tenantId"
          :show-errors="true"
        />
        <p class="ma-small text-ink-muted">{{ t('ui.settings.account.fields.requiredNote') }}</p>
      </section>

      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.settings.account.storage.title') }}</h2>
        <p class="text-ink-muted">{{ t('ui.settings.account.storage.text') }}</p>
        <ul class="flex flex-col">
          <li class="flex items-center gap-3 py-2">
            <Download :size="20" class="shrink-0 text-ink-muted" />
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="ma-text-strong">{{ t('ui.settings.account.storage.exportTitle') }}</span>
              <span class="ma-small text-ink-muted">{{ t('ui.settings.account.storage.exportText') }}</span>
            </div>
            <Button size="small" severity="secondary" outlined :label="t('ui.settings.account.storage.open')" @click="showExportAccountModal = true" />
          </li>
          <li class="flex items-center gap-3 py-2">
            <Trash2 :size="20" class="shrink-0 text-ink-muted" />
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="ma-text-strong">{{ t('ui.settings.account.storage.removeTitle') }}</span>
              <span class="ma-small text-ink-muted">{{ t('ui.settings.account.storage.removeText') }}</span>
            </div>
            <Button size="small" severity="danger" outlined :label="t('ui.settings.account.storage.remove')" @click="confirmDelete()" />
          </li>
        </ul>
      </section>
    </div>

    <ExportAccountModal v-model="showExportAccountModal" @export="backupAccount($event)" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Check, Download, Trash2 } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import { useConfirm } from 'openvue/useconfirm';
import PageHeader from 'components/shell/PageHeader.vue';
import { useEncryptedStore } from '@src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { useNotify } from 'src/composables/useNotify';
import { AccountData, ApiEnvironment } from 'app/src-electron/models/EncryptedStore';
import ExportAccountModal from './modals/exportAccountModal.vue';
import AccountFields from './components/AccountFields.vue';

const { t } = useI18n();
const router = useRouter();
const notify = useNotify();
const confirm = useConfirm();
const sessionStore = useSessionStore();
const encryptedStore = useEncryptedStore();

const name = ref<string>('');
const apiKey = ref<string>('');
const apiSecret = ref<string>('');
const apiEnv = ref<ApiEnvironment>(ApiEnvironment.PRODUCTION);
const tenantId = ref<string>('');
// last saved state of the account (also carries sftpData, which is edited under Verbindungen)
const lastData = ref<AccountData | null>(null);
const showExportAccountModal = ref<boolean>(false);
const saving = ref(false);

function cpAccount(account?: AccountData | null): AccountData | null {
  if (!account) {
    return null;
  }
  return JSON.parse(JSON.stringify(account)) as AccountData;
}

onMounted(() => {
  const selectedAccountId = sessionStore.selectedAccountId;
  if (!selectedAccountId) {
    console.error('No account selected.');
    return;
  }
  // copy to avoid reference issues
  const selectedAccount = cpAccount(encryptedStore.getAccount(selectedAccountId));
  if (selectedAccount) {
    name.value = selectedAccount.name;
    apiKey.value = selectedAccount.apiKey ?? '';
    apiSecret.value = selectedAccount.apiSecret ?? '';
    apiEnv.value = selectedAccount.apiEnv;
    tenantId.value = selectedAccount.tenantId || '';
    lastData.value = { ...selectedAccount, tenantId: tenantId.value };
  }
});

const requiredFieldsFilledOut = computed(() => !!(name.value.trim() && apiKey.value.trim() && apiSecret.value.trim()));
const isDirty = computed(() =>
  name.value !== lastData.value?.name ||
  apiKey.value !== (lastData.value?.apiKey ?? '') ||
  apiSecret.value !== (lastData.value?.apiSecret ?? '') ||
  tenantId.value !== (lastData.value?.tenantId ?? '') ||
  apiEnv.value !== lastData.value?.apiEnv,
);

/** the account as currently edited; SFTP connections come from the stored account */
function currentAccount(): AccountData {
  const id = sessionStore.selectedAccountId || '';
  const stored = encryptedStore.getAccount(id) ?? lastData.value;
  return cpAccount({
    ...stored,
    name: name.value,
    apiKey: apiKey.value,
    apiSecret: apiSecret.value,
    sftpData: stored?.sftpData ?? [],
    apiEnv: apiEnv.value,
    id,
    tenantId: tenantId.value,
  })!;
}

function backupAccount(event: { password: string }) {
  const accountData = currentAccount();
  void encryptedStore.exportAccount(event.password, accountData).then((exportData) => {
    if (!exportData) {
      console.error('Export failed or no data to export.');
      notify.error(t('ui.settings.account.backup.error'));
      return;
    }
    // trigger download
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accountData.name || 'account'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch((err: Error) => {
    console.error(err);
    notify.error(t('ui.settings.account.backup.error'));
  });
}

function saveAccount() {
  if (!requiredFieldsFilledOut.value) {
    notify.warn(t('ui.settings.account.requiredMissing'));
    return;
  }
  const accountData = currentAccount();
  saving.value = true;
  encryptedStore.updateAccount(accountData).then(() => {
    lastData.value = cpAccount(accountData);
    notify.success(t('ui.settings.account.saved'));
  }).catch((err: Error) => {
    console.error(err);
    notify.error(t('ui.settings.account.saveError'));
  }).finally(() => {
    saving.value = false;
  });
}

function confirmDelete() {
  confirm.require({
    header: t('ui.settings.account.storage.removeTitle'),
    message: t('ui.settings.account.storage.removeConfirm', { name: lastData.value?.name ?? '' }),
    rejectProps: { label: t('ui.settings.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('ui.settings.account.storage.remove'), severity: 'danger' },
    accept: () => deleteAccount(),
  });
}

function deleteAccount() {
  const selectedAccountId = sessionStore.selectedAccountId;
  if (!selectedAccountId) {
    console.error('No account selected for deletion.');
    return;
  }
  Promise.resolve().then(() => encryptedStore.deleteAccount(selectedAccountId)).then(() => {
    notify.success(t('ui.settings.account.storage.removed'));
    void router.push({ path: '/accounts' });
  }).catch(() => {
    notify.error(t('ui.settings.account.storage.removeError'));
  });
}
</script>
