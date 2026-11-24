<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.connections.title')" :subtitle="t('ui.settings.connections.subtitle')" />
    <Message v-if="!account" severity="warn">{{ t('ui.settings.noAccount') }}</Message>
    <section v-else class="ma-card max-w-[760px]">
      <SftpConnectionList :model-value="account.sftpData ?? []" @update:model-value="save">
        <template #empty>
          <EmptyState :icon="Server" :title="t('ui.settings.connections.emptyTitle')" :text="t('ui.settings.connections.emptyText')" />
        </template>
      </SftpConnectionList>
      <Message severity="info" class="mt-2">{{ t('ui.settings.connections.note') }}</Message>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Server } from 'lucide-vue-next';
import Message from 'openvue/message';
import PageHeader from 'components/shell/PageHeader.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import SftpConnectionList from './connections/SftpConnectionList.vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { useNotify } from 'src/composables/useNotify';
import type { AccountData, SftpData } from 'app/src-electron/models/EncryptedStore';

const { t } = useI18n();
const notify = useNotify();
const encryptedStore = useEncryptedStore();
const sessionStore = useSessionStore();

const account = computed(() => (sessionStore.selectedAccountId ? encryptedStore.getAccount(sessionStore.selectedAccountId) ?? null : null));

/** every change is written right away: the whole account is stored again with the new sftpData (format unchanged) */
async function save(sftpData: SftpData[]) {
  if (!account.value) return;
  // copy to avoid reference issues (same as the former save in settings/Account.vue)
  const updated = JSON.parse(JSON.stringify({ ...account.value, sftpData })) as AccountData;
  try {
    await encryptedStore.updateAccount(updated);
    notify.success(t('ui.settings.connections.saved'));
  } catch (e) {
    console.error(e);
    notify.error(t('ui.settings.connections.saveError'));
  }
}
</script>
