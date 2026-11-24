<template>
  <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.coverLetters.title')" :subtitle="t('ui.settings.coverLetters.subtitle')">
      <template #actions>
        <Button severity="secondary" outlined :label="t('ui.settings.coverLetters.refresh')" :loading="loading" :disabled="!apiId" @click="loadData()">
          <template #icon><RefreshCw :size="18" /></template>
        </Button>
        <Button :label="t('ui.settings.coverLetters.upload')" :disabled="!apiId" @click="fileInput?.click()">
          <template #icon><Upload :size="18" /></template>
        </Button>
        <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onPick" />
      </template>
    </PageHeader>

    <Message v-if="noAccess" severity="warn">{{ t('ui.settings.coverLetters.noAccess') }}</Message>

    <div class="grid flex-1 grid-cols-[minmax(0,420fr)_minmax(0,464fr)] items-stretch gap-6">
      <section class="ma-card gap-3">
        <ul v-if="allCoverLetters.length > 0" class="flex flex-col gap-1" role="listbox">
          <li v-for="coverLetter in allCoverLetters" :key="coverLetter.type + coverLetter.name">
            <button
              role="option"
              :aria-selected="selected?.name === coverLetter.name && selected?.type === coverLetter.type"
              class="flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left"
              :class="isSelected(coverLetter) ? 'border-line-brand bg-mint' : 'border-transparent hover:bg-dezent'"
              @click="displayPreview(coverLetter)"
            >
              <FileText :size="20" class="shrink-0" :class="isSelected(coverLetter) ? 'text-icon-brand' : 'text-ink-muted'" />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="ma-text-strong truncate">{{ coverLetter.displayName }}</span>
                <span class="ma-small text-ink-muted">{{ coverLetter.type === 'default' ? t('ui.settings.coverLetters.defaultText') : t('ui.settings.coverLetters.customText') }}</span>
              </span>
              <StatusTag
                :type="coverLetter.type === 'default' ? 'test' : 'delivered'"
                :label="coverLetter.type === 'default' ? t('ui.settings.coverLetters.defaultTag') : t('ui.settings.coverLetters.customTag')"
              />
            </button>
          </li>
        </ul>
        <div v-else-if="loading" class="flex justify-center py-10"><ProgressSpinner style="width: 32px; height: 32px" /></div>
        <EmptyState v-else :icon="FileText" :title="t('ui.settings.coverLetters.emptyTitle')" :text="t('ui.settings.coverLetters.emptyText')" />
        <div class="flex-1" />
        <FileDragAndDrop v-if="apiId" @drop="onDrop" />
      </section>

      <section class="flex min-w-0 flex-col gap-3 rounded-[12px] border border-line bg-dezent p-6">
        <template v-if="selected">
          <div class="flex items-center gap-2">
            <h2 class="ma-title-m min-w-0 flex-1 truncate">{{ selected.displayName }}</h2>
            <Button v-if="selected.type !== 'default'" size="small" severity="danger" outlined :label="t('ui.settings.coverLetters.delete')" @click="confirmDeleteItem(selected)">
              <template #icon><Trash2 :size="16" /></template>
            </Button>
          </div>
          <div v-if="previewLoading" class="flex flex-1 items-center justify-center py-10"><ProgressSpinner style="width: 40px; height: 40px" /></div>
          <div v-else-if="previewContent" class="min-h-0 flex-1 overflow-auto">
            <DocumentView :key="'preview' + previewContentName" :base-key="previewContentName" :content="previewBody" />
          </div>
        </template>
        <div v-else class="flex flex-1 items-center justify-center py-10 text-center text-ink-muted">{{ t('ui.settings.coverLetters.selectHint') }}</div>
      </section>
    </div>

    <AddCoverLetterModal v-if="contentValue != null" v-model="showAddCoverLetterModal" :content-value="contentValue!" @create="createCoverLetter" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FileText, RefreshCw, Trash2, Upload } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import ProgressSpinner from 'openvue/progressspinner';
import { useConfirm } from 'openvue/useconfirm';
import type { ContentBody } from '@brifle/brifle-sdk';
import BrifleApi from 'src/services/node/Brifle';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { useNotify } from 'src/composables/useNotify';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import FileDragAndDrop, { type FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import PageHeader from 'components/shell/PageHeader.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import AddCoverLetterModal, { type CoverLetterCreateValue } from './modals/AddCoverLetterModal.vue';

interface CoverLetterSelectionValue {
  name: string;
  type: 'default' | 'custom';
  displayName: string;
}

const { t } = useI18n();
const notify = useNotify();
const confirm = useConfirm();
const sessionStore = useSessionStore();
const encryptedStore = useEncryptedStore();
const brifleStore = useBrifleStore();

const allCoverLetters = ref<CoverLetterSelectionValue[]>([]);
const loading = ref(false);
const previewLoading = ref(false);
const apiId = ref<string>('');
const account = ref<AccountData | null>(null);
const tenantId = ref<string>('');
const previewContent = ref<string | null>(null);
const contentValue = ref<FileContent>();
const showAddCoverLetterModal = ref(false);
const previewContentName = ref<string>('');
const selected = ref<CoverLetterSelectionValue | null>(null);
const noAccess = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// computed, so other state changes do not reload the PDF preview
const previewBody = computed<ContentBody[]>(() => (previewContent.value ? [{ type: 'application/pdf', content: previewContent.value }] : []));

onMounted(() => {
  loading.value = true;
  const accountId = sessionStore.getSelectedAccountId as string;
  // get account data
  account.value = encryptedStore.getAccount(accountId) ?? null;
  if (account.value) {
    tenantId.value = account.value.tenantId ?? '';
    void brifleStore.getApi(account.value.apiKey ?? '', ApiEndpoints.getEndpoint(account.value.apiEnv)).then((api) => {
      if (api) {
        apiId.value = api;
        loadData();
      } else {
        noAccess.value = true;
        loading.value = false;
      }
    });
  } else {
    apiId.value = '';
    noAccess.value = true;
    loading.value = false;
  }
});

function isSelected(coverLetter: CoverLetterSelectionValue) {
  return selected.value?.name === coverLetter.name && selected.value?.type === coverLetter.type;
}

function deleteItem(item: CoverLetterSelectionValue) {
  void BrifleApi.content().deleteCoverLetter(apiId.value, tenantId.value, item.name).then((response) => {
    if (response?.isSuccess) {
      notify.success(t('ui.settings.coverLetters.deleted'));
      if (isSelected(item)) {
        selected.value = null;
        previewContent.value = null;
      }
      loadData();
    } else {
      console.error('Error deleting cover letter:', response.error);
      notify.error(t('ui.settings.coverLetters.deleteError'));
    }
  }).catch((error: unknown) => {
    console.error('Error deleting cover letter:', error);
    notify.error(t('ui.settings.coverLetters.deleteError'));
  });
}

function confirmDeleteItem(coverLetter: CoverLetterSelectionValue) {
  confirm.require({
    header: t('ui.settings.coverLetters.delete'),
    message: t('ui.settings.coverLetters.deleteConfirm', { name: coverLetter.displayName }),
    rejectProps: { label: t('ui.settings.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('ui.settings.coverLetters.delete'), severity: 'danger' },
    accept: () => deleteItem(coverLetter),
  });
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000; // 32 KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function createCoverLetter(value: CoverLetterCreateValue) {
  loading.value = true;
  const base64Content = uint8ToBase64(value.content.content);
  const opts: { description?: string } = {};
  if (value.description) {
    opts.description = value.description;
  }
  BrifleApi.content().createCoverLetter(apiId.value, tenantId.value, value.name, base64Content, opts).then((response) => {
    if (response?.isSuccess) {
      notify.success(t('ui.settings.coverLetters.created'));
      loadData();
    } else {
      console.error('Error creating cover letter:', response.error);
      notify.error(t('ui.settings.coverLetters.createError'));
    }
  }).catch((error) => {
    console.error('Error creating cover letter:', error);
    notify.error(t('ui.settings.coverLetters.createError'));
  }).finally(() => {
    loading.value = false;
  });
}

function onDrop(fileContent: FileContent[]) {
  if (fileContent.length === 0) return;
  contentValue.value = fileContent[0]!;
  showAddCoverLetterModal.value = true;
}

/** "Deckblatt hochladen": same flow as dropping a file */
async function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  onDrop([{ name: file.name, content: new Uint8Array(await file.arrayBuffer()) }]);
}

function displayPreview(coverLetter: CoverLetterSelectionValue) {
  selected.value = coverLetter;
  previewLoading.value = true;
  previewContent.value = null;
  previewContentName.value = coverLetter.displayName;
  BrifleApi.content().contentCoverLetterGet(apiId.value, tenantId.value, coverLetter.type, coverLetter.name).then((response) => {
    if (!isSelected(coverLetter)) return;
    if (response?.isSuccess) {
      previewContent.value = response.data || null;
    } else {
      console.error('Error fetching cover letter preview:', response.error);
      notify.error(t('ui.settings.coverLetters.previewError'));
    }
  }).catch((error) => {
    console.error('Error fetching cover letter preview:', error);
    notify.error(t('ui.settings.coverLetters.previewError'));
  }).finally(() => {
    if (isSelected(coverLetter)) previewLoading.value = false;
  });
}

function loadData() {
  loading.value = true;
  BrifleApi.content().listCoverLetters(apiId.value, tenantId.value).then((response) => {
    if (response.isSuccess) {
      allCoverLetters.value = response.data?.cover_letters.map((cl) => ({
        name: cl.name,
        type: cl.type as 'default' | 'custom',
        displayName: cl.display_name,
      })) || [];
    }
  }).catch((error) => {
    console.error('Error fetching cover letters:', error);
  }).finally(() => {
    loading.value = false;
  });
}
</script>
