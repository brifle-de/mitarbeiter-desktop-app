<template>
  <!-- A3 Konto wählen -->
  <div class="my-auto flex w-full max-w-[720px] flex-col gap-5 py-6">
    <div class="flex flex-col gap-2">
      <h1 class="ma-title-xl">{{ t('ui.access.accounts.title') }}</h1>
      <p class="text-ink-muted">{{ t('ui.access.accounts.subtitle') }}</p>
    </div>

    <ul v-if="availableAccounts.length > 0" class="flex flex-col gap-3">
      <li v-for="account in availableAccounts" :key="account.id">
        <button
          class="flex w-full items-center gap-4 rounded-[12px] border bg-flaeche px-5 py-4 text-left transition-colors hover:border-line-brand disabled:cursor-wait"
          :class="selectedAccount === account.id ? 'border-line-brand' : 'border-line'"
          :disabled="isLoading"
          @click="selectAccount(account.id)"
        >
          <span class="ma-text-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-brand-ink">{{ initials(account.name) }}</span>
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="ma-text-strong truncate">{{ account.name }}</span>
            <span class="ma-small truncate text-ink-muted">{{ subline(account) }}</span>
          </span>
          <StatusTag :type="envTag(account.apiEnv)" :label="t(`ui.shell.account.environment.${account.apiEnv}`)" />
          <ProgressSpinner v-if="isLoading && selectedAccount === account.id" style="width: 20px; height: 20px" stroke-width="6" :aria-label="t('ui.access.accounts.connecting')" />
          <ChevronRight v-else :size="20" class="shrink-0 text-ink-muted" />
        </button>
      </li>
    </ul>
    <section v-else class="ma-card">
      <EmptyState :icon="UserPlus" :title="t('ui.access.accounts.emptyTitle')" :text="t('ui.access.accounts.emptyText')" />
    </section>

    <div class="flex items-center gap-2">
      <Button severity="secondary" outlined :label="t('ui.access.accounts.new')" @click="$router.push({ path: '/accounts/create' })">
        <template #icon><Plus :size="18" /></template>
      </Button>
      <Button text :label="t('ui.access.accounts.import')" @click="$router.push({ path: '/accounts/create', query: { import: '1' } })">
        <template #icon><Upload :size="18" /></template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronRight, Plus, Upload, UserPlus } from 'lucide-vue-next';
import Button from 'openvue/button';
import ProgressSpinner from 'openvue/progressspinner';
import EmptyState from 'components/ui/EmptyState.vue';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { AccountData, ApiEndpoints, ApiEnvironment } from 'app/src-electron/models/EncryptedStore';

const { t } = useI18n();
const router = useRouter();
const encryptedStore = useEncryptedStore();
const sessionStore = useSessionStore();
const selectedAccount = ref<string | null>(null);
const isLoading = ref<boolean>(false);

// accounts are decrypted one by one after unlocking, so read them reactively from the store
const availableAccounts = computed<AccountData[]>(() => encryptedStore.accounts);

function selectAccount(accountId: string) {
  isLoading.value = true;
  selectedAccount.value = accountId;
  sessionStore.setSelectedAccountId(accountId);
  void router.push({ path: '/' }).finally(() => {
    isLoading.value = false;
  });
}

function initials(name: string): string {
  const words = name.split(/[\s–-]+/).filter((w) => /\p{L}|\d/u.test(w[0] ?? ''));
  return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
}

function subline(account: AccountData): string {
  const host = new URL(ApiEndpoints.getEndpoint(account.apiEnv)).host;
  return account.tenantId ? `${host} · ${t('ui.access.accounts.tenant', { tenant: account.tenantId })}` : host;
}

function envTag(env: ApiEnvironment): StatusType {
  if (env === ApiEnvironment.PRODUCTION) return 'delivered';
  if (env === ApiEnvironment.SANDBOX) return 'processing';
  return 'test';
}
</script>
