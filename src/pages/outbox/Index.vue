<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :title="t('ui.outbox.title')" :subtitle="t('ui.outbox.subtitle')">
      <template #actions>
        <Button severity="secondary" outlined :label="t('ui.outbox.refresh')" :disabled="!apiId" @click="loadPage()">
          <template #icon><RefreshCw :size="18" /></template>
        </Button>
        <Button severity="secondary" outlined :label="t('ui.outbox.newBulk')" @click="router.push('/bulk_sending')">
          <template #icon><Layers :size="18" /></template>
        </Button>
        <Button :label="t('ui.outbox.newSingle')" @click="router.push('/outbox/send')">
          <template #icon><Send :size="18" /></template>
        </Button>
      </template>
    </PageHeader>

    <!-- filters the outbox endpoint supports: subject and document type -->
    <div class="flex items-end gap-4">
      <FormField :label="t('ui.outbox.filters.search')" for-id="outbox-search" class="w-full max-w-[360px]">
        <IconField>
          <InputIcon><Search :size="16" /></InputIcon>
          <InputText id="outbox-search" ref="searchBox" v-model="subject" class="w-full" :placeholder="t('ui.outbox.filters.searchPlaceholder')" @keyup.enter="search()" />
          <InputIcon v-if="subject !== ''" class="cursor-pointer" :aria-label="t('ui.outbox.filters.clear')" @click="subject = ''; search();"><X :size="16" /></InputIcon>
        </IconField>
      </FormField>
      <FormField :label="t('ui.outbox.filters.type')" for-id="outbox-type" class="w-[200px]">
        <Select input-id="outbox-type" :model-value="documentType" :options="typeOptions" option-label="label" option-value="value" @update:model-value="changeType" />
      </FormField>
      <Button v-if="subject !== '' || documentType !== 'all'" text :label="t('ui.outbox.filters.reset')" @click="resetFilters()">
        <template #icon><X :size="18" /></template>
      </Button>
    </div>

    <DataTable
      :value="values"
      lazy
      paginator
      :rows="pageSize"
      :total-records="total"
      :first="(page - 1) * pageSize"
      :loading="isLoading"
      data-key="id"
      row-hover
      class="cursor-pointer"
      @page="onPage"
      @row-click="(e: { data: Meta }) => routeToItem(e.data.id)"
    >
      <template #empty>
        <EmptyState v-if="!isLoading" :icon="Inbox" :title="t('ui.outbox.emptyTitle')" :text="t('ui.outbox.emptyText')" />
      </template>
      <Column :header="t('ui.outbox.columns.subject')">
        <template #body="{ data }: { data: Meta }">
          <div class="flex min-w-0 flex-col">
            <span class="ma-text-strong">{{ data.subject }}</span>
            <span class="ma-small text-ink-muted">{{ caption(data) }}</span>
          </div>
        </template>
      </Column>
      <Column :header="t('ui.outbox.columns.receiver')">
        <template #body="{ data }: { data: Meta }">{{ receiverName(receivers.get(data.receiver)) ?? t('ui.outbox.unknownReceiver') }}</template>
      </Column>
      <Column :header="t('ui.outbox.columns.sent')">
        <template #body="{ data }: { data: Meta }"><span class="whitespace-nowrap">{{ formatDateTime(data.sent_date) }}</span></template>
      </Column>
      <Column :header="t('ui.outbox.columns.status')">
        <template #body="{ data }: { data: Meta }">
          <StatusTag :type="STATE_TAG[outboxState(data)]" :label="t(`ui.outbox.state.${outboxState(data)}`)" />
        </template>
      </Column>
      <Column header-class="w-0" body-class="w-0">
        <template #body="{ data }: { data: Meta }">
          <div class="flex items-center gap-1">
            <Button v-tooltip.top="t('ui.outbox.open')" text rounded size="small" severity="secondary" :aria-label="t('ui.outbox.open')" @click.stop="routeToItem(data.id)">
              <template #icon><Eye :size="18" /></template>
            </Button>
            <Button v-tooltip.top="t('ui.outbox.download')" text rounded size="small" severity="secondary" :aria-label="t('ui.outbox.download')" :loading="downloading === data.id" @click.stop="download(data)">
              <template #icon><Download :size="18" /></template>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import hotkeys from 'hotkeys-js';
import { Download, Eye, Inbox, Layers, RefreshCw, Search, Send, X } from 'lucide-vue-next';
import Button from 'openvue/button';
import Column from 'openvue/column';
import DataTable, { type DataTablePageEvent } from 'openvue/datatable';
import IconField from 'openvue/iconfield';
import InputIcon from 'openvue/inputicon';
import InputText from 'openvue/inputtext';
import Select from 'openvue/select';
import type { AccountInfo, Meta } from '@brifle/brifle-sdk';
import PageHeader from 'components/shell/PageHeader.vue';
import FormField from 'components/ui/FormField.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import Brifle from 'src/services/node/Brifle';
import Downloader from 'src/utils/downloader';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { useNotify } from 'src/composables/useNotify';
import { ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import {
  DOCUMENT_TYPES, type DocumentType, formatDateTime, formatSize, isDocumentType, loadOutboxPage,
  OUTBOX_PAGE_SIZE, outboxState, receiverName, STATE_TAG,
} from './util/outbox';

const { t } = useI18n();
const router = useRouter();
const notify = useNotify();
const encryptedStore = useEncryptedStore();
const sessionStore = useSessionStore();
const brifleStore = useBrifleStore();

const apiId = ref('');
const currentTenant = ref('');
const subject = ref('');
const documentType = ref<DocumentType | 'all'>('all');
const page = ref(1);
const pageSize = OUTBOX_PAGE_SIZE;
const values = ref<Meta[]>([]);
const total = ref(0);
const receivers = ref(new Map<string, AccountInfo>());
const isLoading = ref(true);
const downloading = ref<string | null>(null);
const searchBox = ref<{ $el: HTMLInputElement } | null>(null);

const typeOptions = computed(() => [
  { label: t('ui.outbox.types.all'), value: 'all' },
  ...DOCUMENT_TYPES.map((value) => ({ label: t(`ui.outbox.types.${value}`), value })),
]);

function caption(item: Meta) {
  const type = isDocumentType(item.type) ? t(`ui.outbox.types.${item.type}`) : item.type;
  return [type, formatSize(item.size)].filter(Boolean).join(' · ');
}

async function loadPage() {
  if (!apiId.value) return;
  isLoading.value = true;
  try {
    const res = await loadOutboxPage(apiId.value, currentTenant.value, { subject: subject.value, type: documentType.value }, page.value);
    values.value = res.values;
    total.value = res.total;
    res.receivers.forEach((receiver, id) => receivers.value.set(id, receiver));
  } catch (e) {
    console.error('Could not load the outbox', e);
    values.value = [];
    total.value = 0;
  } finally {
    isLoading.value = false;
  }
}

function search() {
  page.value = 1;
  void loadPage();
}
function changeType(type: DocumentType | 'all') {
  documentType.value = type;
  search();
}
function resetFilters() {
  subject.value = '';
  documentType.value = 'all';
  search();
}
function onPage(e: DataTablePageEvent) {
  page.value = e.page + 1;
  void loadPage();
}
function routeToItem(id: string) {
  void router.push(`/outbox/${id}`);
}

/** saves every PDF of the document, like "PDF speichern" on the details page */
async function download(item: Meta) {
  downloading.value = item.id;
  try {
    const res = await Brifle.content().contentGetContent(apiId.value, item.id);
    if (!res.isSuccess || res.data == null) {
      notify.error(t('ui.outbox.downloadFailed'), { detail: res.error?.code != null ? String(res.error.code) : '' });
      return;
    }
    const pdfs = res.data.content.filter((c) => c.type === 'application/pdf');
    pdfs.forEach((c, index) => Downloader.downloadPdf(c.content, pdfs.length > 1 ? `${item.subject}_${index}` : item.subject));
  } catch (e) {
    console.error(e);
    notify.error(t('ui.outbox.downloadFailed'));
  } finally {
    downloading.value = null;
  }
}

onMounted(async () => {
  // Ctrl+F focuses the search
  hotkeys('ctrl+f,cmd+f', (event) => {
    event.preventDefault();
    searchBox.value?.$el?.focus();
  });

  const account = sessionStore.getSelectedAccountId ? encryptedStore.getAccount(sessionStore.getSelectedAccountId) : undefined;
  currentTenant.value = account?.tenantId ?? '';
  if (account) {
    const id = await brifleStore.getApi(account.apiKey ?? '', ApiEndpoints.getEndpoint(account.apiEnv));
    if (id) {
      apiId.value = id;
      await loadPage();
    }
  }
  isLoading.value = false;
});
onBeforeUnmount(() => hotkeys.unbind('ctrl+f,cmd+f'));
</script>
