<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :title="t('ui.home.title')" :subtitle="subtitle" />
    <UpdateBanner />

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <ActionTile to="/outbox/send" :icon="Send" :title="t('ui.home.tiles.send.title')" :text="t('ui.home.tiles.send.text')" :link="t('ui.home.tiles.send.link')" />
      <ActionTile to="/bulk_sending" :icon="Layers" :title="t('ui.home.tiles.bulk.title')" :text="t('ui.home.tiles.bulk.text')" :link="t('ui.home.tiles.bulk.link')" />
      <ActionTile to="/templates" :icon="LayoutTemplate" :title="t('ui.home.tiles.templates.title')" :text="t('ui.home.tiles.templates.text')" :link="t('ui.home.tiles.templates.link')" />
      <ActionTile to="/bulk_sending/receiver_check" :icon="UserCheck" :title="t('ui.home.tiles.receiverCheck.title')" :text="t('ui.home.tiles.receiverCheck.text')" :link="t('ui.home.tiles.receiverCheck.link')" />
    </div>

    <div class="grid grid-cols-[minmax(0,1fr)_260px] items-start gap-4">
      <section class="ma-card">
        <div class="flex items-center gap-2">
          <h2 class="ma-title-m flex-1">{{ t('ui.home.recent.title') }}</h2>
          <Button text size="small" :label="t('ui.home.recent.all')" @click="router.push('/outbox')">
            <template #icon><ChevronRight :size="16" /></template>
          </Button>
        </div>
        <div v-if="isLoading" class="flex justify-center py-8"><ProgressSpinner style="width: 32px; height: 32px" /></div>
        <EmptyState v-else-if="recent.length === 0" :icon="Inbox" :title="t('ui.home.recent.emptyTitle')" :text="t('ui.home.recent.emptyText')">
          <Button :label="t('ui.home.tiles.send.title')" @click="router.push('/outbox/send')">
            <template #icon><Send :size="18" /></template>
          </Button>
        </EmptyState>
        <div v-else class="overflow-hidden rounded-[10px] border border-line">
          <div class="ma-label grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 bg-dezent px-3 py-2.5 text-ink-muted">
            <span>{{ t('ui.outbox.columns.subject') }}</span>
            <span>{{ t('ui.outbox.columns.receiver') }}</span>
            <span>{{ t('ui.outbox.columns.sent') }}</span>
            <span class="min-w-[90px]">{{ t('ui.outbox.columns.status') }}</span>
          </div>
          <OutboxItem
            v-for="item in recent"
            :key="item.id"
            :subject="item.subject"
            :mail-id="item.id"
            :receiver="receiverName(receivers.get(item.receiver))"
            :caption="caption(item)"
            :created-date="new Date(item.sent_date)"
            :is-read="item.read"
            :is-delivered="item.delivered"
            @open-mail="(id: string) => router.push(`/outbox/${id}`)"
          />
        </div>
      </section>

      <!-- only numbers the outbox call returns; no invented statistics -->
      <KpiCard v-if="total !== null" :label="t('ui.home.kpi.total')" :value="total.toLocaleString('de-DE')" :hint="t('ui.home.kpi.totalHint')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronRight, Inbox, Layers, LayoutTemplate, Send, UserCheck } from 'lucide-vue-next';
import Button from 'openvue/button';
import ProgressSpinner from 'openvue/progressspinner';
import type { AccountInfo, Meta } from '@brifle/brifle-sdk';
import PageHeader from 'components/shell/PageHeader.vue';
import UpdateBanner from 'components/ui/UpdateBanner.vue';
import ActionTile from 'components/ui/ActionTile.vue';
import KpiCard from 'components/ui/KpiCard.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import OutboxItem from 'components/OutboxItem.vue';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { formatSize, isDocumentType, loadOutboxPage, receiverName } from 'src/pages/outbox/util/outbox';

/** rows of the first outbox page shown under "Letzte Sendungen" */
const RECENT_ROWS = 6;

const { t } = useI18n();
const router = useRouter();
const sessionStore = useSessionStore();
const encryptedStore = useEncryptedStore();
const brifleStore = useBrifleStore();

const account = computed(() => (sessionStore.selectedAccountId ? encryptedStore.getAccount(sessionStore.selectedAccountId) : undefined) ?? null);
const subtitle = computed(() => (account.value ? `${account.value.name} · ${t(`ui.shell.account.environment.${account.value.apiEnv}`)}` : ''));

const isLoading = ref(true);
const values = ref<Meta[]>([]);
const receivers = ref(new Map<string, AccountInfo>());
const total = ref<number | null>(null);
const recent = computed(() => values.value.slice(0, RECENT_ROWS));

function caption(item: Meta) {
  const type = isDocumentType(item.type) ? t(`ui.outbox.types.${item.type}`) : item.type;
  return [type, formatSize(item.size)].filter(Boolean).join(' · ');
}

onMounted(async () => {
  const acc = account.value;
  try {
    if (!acc) return;
    const apiId = await brifleStore.getApi(acc.apiKey ?? '', ApiEndpoints.getEndpoint(acc.apiEnv));
    if (!apiId) return;
    const page = await loadOutboxPage(apiId, acc.tenantId ?? '', { type: 'all' }, 1);
    values.value = page.values;
    receivers.value = page.receivers;
    total.value = page.total;
  } catch (e) {
    console.error('Could not load the outbox', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
