<template>
  <!-- preview per receiver: original PDF for Brifle, rendered paper letter (with cover letter) for postal delivery -->
  <div class="flex flex-col gap-4">
    <div class="flex items-end gap-3">
      <FormField :label="t('ui.send.preview.receiver')" for-id="preview-receiver" class="flex-1" :hint="!hasCheckedReceivers && receivers.length > 0 ? t('ui.send.preview.checkFirst') : ''">
        <Select
          v-model="selectedReceiver"
          input-id="preview-receiver"
          :options="availableReceivers"
          :option-label="(r: TrackableReceiverRecord) => receiverLabel(r)"
          :disabled="!hasCheckedReceivers"
          :placeholder="receivers.length === 0 ? t('ui.send.preview.noReceivers') : t('ui.send.preview.choose')"
          @update:model-value="previewLoaded = false; paperMailPreview = null"
        />
      </FormField>
      <Button severity="secondary" outlined :label="previewLoaded ? t('ui.send.preview.refresh') : t('ui.send.preview.generate')" :disabled="!hasCheckedReceivers || !selectedReceiver" :loading="loading" @click="loadPreview()">
        <template #icon><RefreshCw v-if="previewLoaded" :size="18" /><Eye v-else :size="18" /></template>
      </Button>
    </div>

    <dl v-if="selectedReceiver" class="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
      <dt class="ma-small text-ink-muted">{{ t('ui.send.preview.brifleAccount') }}</dt>
      <dd>{{ selectedReceiver.existsBrifle ? t('ui.send.yes') : t('ui.send.no') }}</dd>
      <dt class="ma-small text-ink-muted">{{ t('ui.send.preview.validAddress') }}</dt>
      <dd>{{ selectedReceiver.validPostalAddress ? t('ui.send.yes') : t('ui.send.no') }}</dd>
      <dt class="ma-small text-ink-muted">{{ t('ui.send.preview.deliveryBy') }}</dt>
      <dd>{{ deliveryMethod(selectedReceiver) }}</dd>
    </dl>

    <div class="min-h-[320px] rounded-[12px] border border-line bg-dezent p-4">
      <template v-if="previewLoaded && selectedReceiver">
        <div v-if="loading" class="flex justify-center py-16"><ProgressSpinner style="width: 32px; height: 32px" /></div>
        <DocumentView v-else-if="requiresPapermail && paperMailPreview" base-key="preview-papermail" :content="[paperMailPreview]" />
        <DocumentView v-else-if="selectedReceiver.existsBrifle" base-key="preview-raw" :content="previewContent" />
        <Message v-else-if="requiresPapermail" severity="error">{{ t('ui.send.preview.failed') }}</Message>
        <EmptyState v-else :icon="CircleSlash" :title="t('ui.send.preview.noDelivery')" />
      </template>
      <EmptyState v-else :icon="FileSearch" :title="t('ui.send.preview.emptyTitle')" :text="t('ui.send.preview.emptyText')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { CircleSlash, Eye, FileSearch, RefreshCw } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import ProgressSpinner from 'openvue/progressspinner';
import Select from 'openvue/select';
import type { ContentBody, PreviewCoverLetterRequest, PreviewPaperMailRequest } from '@brifle/brifle-sdk';
import FormField from 'components/ui/FormField.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import type { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import BrifleApi from 'src/services/node/Brifle';
import type { CoverLetterData, TrackableReceiverRecord } from '../util/types';
import { toContentBodies } from '../send/pdf';

const props = defineProps<{
  apiId: string;
  tenantId: string;
  receivers: TrackableReceiverRecord[];
  hasCheckedReceivers: boolean;
  allowPapermail: boolean;
  files: FileContent[];
  includeCoverLetter: boolean;
  selectedCoverLetter?: CoverLetterData | null;
}>();
const { t } = useI18n();

const selectedReceiver = ref<TrackableReceiverRecord | null>(null);
const previewLoaded = ref(false);
const loading = ref(false);
const paperMailPreview = ref<ContentBody | null>(null);

const previewContent = computed(() => toContentBodies(props.files));
const availableReceivers = computed(() => props.receivers.filter((r) => r.existsBrifle || (props.allowPapermail && r.validPostalAddress)));
const requiresPapermail = computed(() => !!selectedReceiver.value && !selectedReceiver.value.existsBrifle && !!selectedReceiver.value.validPostalAddress);

function receiverLabel(receiver: TrackableReceiverRecord | null) {
  return receiver ? [receiver.firstName ?? '', receiver.lastName ?? ''].join(' ').trim() : 'n/a';
}
function deliveryMethod(receiver: TrackableReceiverRecord) {
  if (receiver.existsBrifle) return t('ui.send.delivery.brifle');
  if (receiver.validPostalAddress) return t('ui.send.delivery.papermail');
  return t('ui.send.delivery.none');
}

async function loadPreview() {
  const receiver = selectedReceiver.value;
  previewLoaded.value = true;
  if (!receiver || !requiresPapermail.value) return;

  const coverLetter: PreviewCoverLetterRequest = {
    type: props.selectedCoverLetter?.type || 'default',
    enable: props.includeCoverLetter && !!props.selectedCoverLetter,
    data: undefined,
    name: props.selectedCoverLetter?.name || 'cover_letter',
  };
  if (!coverLetter.enable) coverLetter.name = undefined;

  const previewReq: PreviewPaperMailRequest = {
    to: {
      address_line1: receiverLabel(receiver),
      address_line2: receiver.addressStreet || '',
      postal_code: receiver.addressPostcode || '',
      city: receiver.addressCity || '',
      country: receiver.addressCountry || '',
    },
    body: previewContent.value,
    cover_letter: coverLetter,
  };
  loading.value = true;
  paperMailPreview.value = null;
  try {
    const res = await BrifleApi.content().previewPaperMail(props.apiId, props.tenantId, previewReq);
    if (res.isSuccess && res.data) {
      paperMailPreview.value = { type: 'application/pdf', content: res.data as unknown as string };
    } else {
      console.error('Fehler beim Laden der Vorschau:', res.error);
    }
  } catch (err) {
    console.error('Fehler beim Laden der Vorschau:', err);
  } finally {
    loading.value = false;
  }
}
</script>
