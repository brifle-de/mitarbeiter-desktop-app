<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.outbox.details.path')" :title="content?.meta.subject ?? t('ui.outbox.details.title')" :subtitle="subtitle">
      <template #actions>
        <Button v-if="deliveryCertificate" severity="secondary" outlined :label="t('ui.outbox.details.certificate.download')" @click="downloadDeliveryCertificate()">
          <template #icon><FileBadge :size="18" /></template>
        </Button>
        <Button :label="t('ui.outbox.details.download')" :disabled="!content" @click="download()">
          <template #icon><Download :size="18" /></template>
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading && !content" class="flex justify-center py-16"><ProgressSpinner style="width: 40px; height: 40px" /></div>
    <EmptyState v-else-if="!content" :icon="FileX" :title="t('ui.outbox.details.notFound')" :text="loadError">
      <Button severity="secondary" outlined :label="t('ui.outbox.details.back')" @click="router.push('/outbox')" />
    </EmptyState>

    <div v-else class="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
      <!-- preview -->
      <section class="rounded-[12px] border border-line bg-dezent p-6">
        <DocumentView :content="content.content" />
      </section>

      <!-- side column -->
      <div class="flex flex-col gap-4">
        <section class="ma-card">
          <div class="flex items-center gap-2">
            <h2 class="ma-title-m flex-1">{{ t('ui.outbox.details.delivery.title') }}</h2>
            <StatusTag :type="STATE_TAG[state]" :label="t(`ui.outbox.state.${state}`)" />
          </div>
          <ol class="flex flex-col gap-3">
            <li v-for="step in timeline" :key="step.key" class="flex items-start gap-3">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" :class="step.done ? 'bg-brand text-on-brand' : 'bg-dezent text-ink-muted'">
                <Check v-if="step.done" :size="14" />
              </span>
              <span class="flex flex-col">
                <span :class="step.done ? 'ma-text-strong' : 'text-ink-muted'">{{ step.label }}</span>
                <span v-if="step.date" class="ma-small text-ink-muted">{{ step.date }}</span>
              </span>
            </li>
          </ol>
          <template v-if="deliveryStatus">
            <hr class="border-line" />
            <dl class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.delivery.mode') }}</dt>
              <dd>{{ deliveryModeLabel }}</dd>
              <template v-if="deliveryStatus.physical">
                <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.delivery.physicalState') }}</dt>
                <dd>{{ physicalStateLabel }}</dd>
                <template v-if="deliveryStatus.physical.last_status_check">
                  <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.delivery.lastCheck') }}</dt>
                  <dd>{{ formatDateTime(deliveryStatus.physical.last_status_check) }}</dd>
                </template>
              </template>
            </dl>
            <Message v-for="(err, index) in deliveryStatus.physical?.errors ?? []" :key="'dp-error-' + index" severity="error">
              {{ err.dp_error_description || err.dp_error_code }}<span v-if="err.dp_error_date" class="ma-small"> · {{ formatDateTime(err.dp_error_date) }}</span>
            </Message>
          </template>
        </section>

        <section class="ma-card">
          <h2 class="ma-title-m">{{ t('ui.outbox.details.receiver.title') }}</h2>
          <dl class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
            <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.receiver.name') }}</dt>
            <dd>{{ receiverDisplay }}</dd>
            <template v-if="receiverAccount">
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.receiver.account') }}</dt>
              <dd>{{ t(`ui.outbox.details.receiver.accountType.${receiverAccount.type}`) }}</dd>
            </template>
            <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.receiver.type') }}</dt>
            <dd>{{ documentTypeLabel }}</dd>
            <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.receiver.documentId') }}</dt>
            <dd class="break-all">{{ docId }}</dd>
          </dl>
        </section>

        <section v-if="payment" class="ma-card">
          <h2 class="ma-title-m">{{ t('ui.outbox.details.payment.title') }}</h2>
          <dl class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
            <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.amount') }}</dt>
            <dd>{{ formatAmount(payment.amount, payment.currency) }}</dd>
            <template v-if="payment.reference">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.reference') }}</dt>
              <dd>{{ payment.reference }}</dd>
            </template>
            <template v-if="payment.due_date">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.dueDate') }}</dt>
              <dd>{{ payment.due_date }}</dd>
            </template>
            <template v-if="payment.iban">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.iban') }}</dt>
              <dd class="break-all">{{ payment.iban.replace(/(.{4})/g, '$1 ').trim() }}</dd>
            </template>
            <template v-if="payment.recipient_name">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.receiverName') }}</dt>
              <dd>{{ payment.recipient_name }}</dd>
            </template>
          </dl>
        </section>

        <section v-if="deliveryCertificate" class="ma-card">
          <div class="flex items-start gap-3">
            <IconBadge :icon="ShieldCheck" :size="36" />
            <div class="flex min-w-0 flex-1 flex-col">
              <h2 class="ma-title-m">{{ t('ui.outbox.details.certificate.title') }}</h2>
              <span class="ma-small text-ink-muted">{{ t('ui.outbox.details.certificate.subtitle') }}</span>
            </div>
            <Button severity="secondary" outlined size="small" :label="t('ui.outbox.details.certificate.load')" @click="downloadDeliveryCertificate()">
              <template #icon><Download :size="16" /></template>
            </Button>
          </div>
          <dl class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
            <template v-for="item in deliveryCertRows" :key="'cert-' + item.key">
              <dt class="ma-small text-ink-muted">{{ item.key }}</dt>
              <dd class="break-all">{{ item.value }}</dd>
            </template>
          </dl>
        </section>

        <section v-if="signatures && signatures.embedded_signatures?.length" class="ma-card">
          <h2 class="ma-title-m">{{ t('ui.outbox.details.signatures.title') }}</h2>
          <div v-for="sig in signatures.embedded_signatures" :key="'embed-signature-' + sig.id" class="flex flex-col gap-3 rounded-[10px] border border-line p-4">
            <div class="flex items-center gap-2">
              <PenLine :size="18" class="text-icon-brand" />
              <span class="ma-text-strong flex-1 break-all">{{ sig.field_name }}</span>
              <StatusTag :type="signatureTag(sig)" :label="t(`ui.outbox.details.signatures.state.${signatureState(sig)}`)" />
            </div>
            <dl class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.signatures.requestedAt') }}</dt>
              <dd>{{ SignatureActionsParser.getRequestDate(sig) }}</dd>
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.signatures.signedAt') }}</dt>
              <dd>{{ SignatureActionsParser.getSigningDate(sig) }}</dd>
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.signatures.to') }}</dt>
              <dd>{{ sig.requested_to != myAccountId ? receiverDisplay : t('ui.outbox.details.signatures.me') }}</dd>
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.signatures.place') }}</dt>
              <dd>{{ SignatureActionsParser.getSignaturePlace(sig) }}</dd>
              <dt class="ma-small text-ink-muted">{{ t('ui.outbox.details.signatures.roles') }}</dt>
              <dd>{{ SignatureActionsParser.getSignatureRoles(sig) }}</dd>
            </dl>
            <Button v-if="sig.value != null" severity="secondary" outlined size="small" :label="t('ui.outbox.details.signatures.show')" @click="displaySignatureValue(sig.value, sig.id)">
              <template #icon><Eye :size="16" /></template>
            </Button>
            <Button v-else-if="sig.requested_to == myAccountId" size="small" :label="t('ui.outbox.details.signatures.create')" :disabled="sig.status === 'rejected'" @click="openDocumentQrWindow()">
              <template #icon><PenLine :size="16" /></template>
            </Button>
          </div>
        </section>
      </div>
    </div>

    <SignatureModal v-model="showDetails" :account-id="myAccountId" :signature-id="shownSignatureId" :signature-value="displayValue" @export-xml="downloadSignature" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dateFormat from 'dateformat';
import { Check, Download, Eye, FileBadge, FileX, PenLine, ShieldCheck } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import ProgressSpinner from 'openvue/progressspinner';
import type {
  AccountInfo, ContentActionsPaymentResponse, ContentActionsSignatureResponse, ContentResponse, DeliveryCertificateResponse,
  DeliveryStatusResponse, EmbbededSignatureResponse,
} from '@brifle/brifle-sdk';
import PageHeader from 'components/shell/PageHeader.vue';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import IconBadge from 'components/ui/IconBadge.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import SignatureModal from 'src/components/modals/SignatureModal.vue';
import Brifle from 'src/services/node/Brifle';
import Downloader from 'src/utils/downloader';
import SessionContext from 'src/utils/sessionContext';
import { SignatureActionsParser } from 'src/services/helper/signatureActionsParser';
import { DeliveryCertificateParser } from 'src/services/helper/deliveryCertificateParser';
import { useNotify } from 'src/composables/useNotify';
import { formatDateTime, formatSize, isDocumentType, outboxState, receiverName, STATE_TAG } from './util/outbox';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const notify = useNotify();
const sessionContext = new SessionContext();

const docId = route.params.id as string;
const myAccountId = ref('');
const isLoading = ref(true);
const loadError = ref('');
const content = ref<ContentResponse | null>(null);
const receiverAccount = ref<AccountInfo | null>(null);
const receiverLoaded = ref(false);
const signatures = ref<ContentActionsSignatureResponse | undefined>(undefined);
const payment = ref<ContentActionsPaymentResponse['details'] | null>(null);
const deliveryCertificate = ref<DeliveryCertificateResponse | undefined>(undefined);
const deliveryStatus = ref<DeliveryStatusResponse | null>(null);
const showDetails = ref(false);
const displayValue = ref('');
const shownSignatureId = ref('');
const showDocumentQrWindow = ref(false);

const state = computed(() => outboxState(content.value?.meta ?? { read: false, delivered: false }));
const receiverDisplay = computed(() => receiverName(receiverAccount.value) ?? (receiverLoaded.value ? t('ui.outbox.unknownReceiver') : '…'));
const documentTypeLabel = computed(() => {
  const type = content.value?.meta.type;
  return isDocumentType(type) ? t(`ui.outbox.types.${type}`) : t('ui.outbox.types.letter');
});
const subtitle = computed(() => {
  const meta = content.value?.meta;
  if (!meta) return '';
  return t('ui.outbox.details.subtitle', {
    receiver: receiverDisplay.value,
    date: formattedDate(meta.sent_date),
    type: [documentTypeLabel.value, formatSize(meta.size)].filter(Boolean).join(', '),
  });
});
const timeline = computed(() => {
  const meta = content.value?.meta;
  return [
    { key: 'sent', label: t('ui.outbox.details.delivery.sent'), done: !!meta, date: formatDateTime(meta?.sent_date) },
    { key: 'delivered', label: t('ui.outbox.details.delivery.delivered'), done: !!meta?.delivered, date: meta?.delivered ? formatDateTime(meta.delivered_date) : '' },
    { key: 'read', label: t('ui.outbox.details.delivery.read'), done: !!meta?.read, date: meta?.read ? formatDateTime(meta.read_date) : '' },
  ];
});
const deliveryModeLabel = computed(() => {
  const mode = deliveryStatus.value?.delivery_mode ?? '';
  return ['brifle', 'physical'].includes(mode) ? t(`ui.outbox.details.delivery.modes.${mode as 'brifle' | 'physical'}`) : mode;
});
const physicalStateLabel = computed(() => {
  const physical = deliveryStatus.value?.physical;
  if (!physical) return '';
  const label = t(`ui.outbox.details.delivery.physical.${physical.state}`);
  return `${label} (${physical.deliverer})`;
});
const deliveryCertRows = computed(() => {
  const cert = deliveryCertificate.value;
  if (cert == null) return [];
  const rows = [
    { key: t('ui.outbox.details.certificate.id'), value: cert.meta.id },
    { key: t('ui.outbox.details.certificate.documentId'), value: cert.meta.document_id },
    { key: t('ui.outbox.details.certificate.kind'), value: cert.meta.type === 'aes' ? t('ui.outbox.details.certificate.aes') : cert.meta.type },
  ];
  try {
    return rows.concat(new DeliveryCertificateParser().parseDeliveryCertificate(cert));
  } catch (e) {
    console.error('Could not parse the delivery certificate', e);
    return rows;
  }
});

function formattedDate(value: string) {
  return value ? `${dateFormat(value, 'dd.mm.yyyy HH:MM')} Uhr` : '';
}
function formatAmount(amount: number, currency: string) {
  // the API keeps amounts in cents
  return (amount / 100).toLocaleString('de-DE', { style: 'currency', currency: currency || 'EUR' });
}
function signatureState(sig: EmbbededSignatureResponse): 'rejected' | 'signed' | 'open' {
  if (sig.status === 'rejected') return 'rejected';
  if (sig.status === 'signed' || sig.value != null) return 'signed';
  return 'open';
}
function signatureTag(sig: EmbbededSignatureResponse): StatusType {
  return ({ rejected: 'error', signed: 'delivered', open: 'signature' } as const)[signatureState(sig)];
}

async function loadItem() {
  isLoading.value = true;
  try {
    const apiId = await sessionContext.getCurrentApiId();
    const response = await Brifle.content().contentGetContent(apiId, docId);
    if (response == null || response.data == null) {
      if (response?.isError) {
        loadError.value = t('ui.outbox.details.errorCode', { code: String(response.error?.code ?? '') });
        notify.error(loadError.value);
      }
      return;
    }
    content.value = response.data;
    const receiverId = response.data.meta.receiver;

    // everything below is optional: show what the API returns, skip what fails
    await Promise.allSettled([
      Brifle.content().getDeliveryCertificate(apiId, docId).then((res) => {
        if (res?.data != null) deliveryCertificate.value = res.data;
      }),
      Brifle.content().getDeliveryStatus(apiId, docId).then((res) => {
        if (res?.isSuccess && res.data != null) {
          const data = res.data as unknown;
          deliveryStatus.value = (typeof data === 'string' ? JSON.parse(data) : data) as DeliveryStatusResponse;
        }
      }),
      (receiverId ? Brifle.accounts().getById(apiId, receiverId) : Promise.resolve(null)).then((res) => {
        receiverAccount.value = res?.data ?? null;
      }).finally(() => { receiverLoaded.value = true; }),
      Brifle.content().contentGetContentActions(apiId, docId).then((res) => {
        signatures.value = res.data?.signatures;
        payment.value = res.data?.payments?.details ?? null;
      }),
    ]);
  } catch (e) {
    console.error('Could not load the document', e);
    loadError.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}

function download() {
  content.value?.content.forEach((cont, index) => {
    if (cont.type === 'application/pdf') {
      const baseTitle = content.value?.meta.subject ?? docId;
      const items = content.value?.content.length ?? 0;
      Downloader.downloadPdf(cont.content, items > 1 ? `${baseTitle}_${index}` : baseTitle);
    }
  });
}
function downloadDeliveryCertificate() {
  if (deliveryCertificate.value == null) return;
  const blob = new Blob([deliveryCertificate.value.certificate], { type: 'text/plain' });
  Downloader.downloadXMLString(blob, 'delivery_certificate.xml');
}
function displaySignatureValue(xmlString: string, signatureId: string) {
  displayValue.value = xmlString;
  shownSignatureId.value = signatureId;
  showDetails.value = true;
}
/** exports the XAdES signature shown in the modal */
function downloadSignature(signatureId: string) {
  if (!displayValue.value) return;
  Downloader.downloadXMLString(new Blob([displayValue.value], { type: 'text/xml' }), `signature_${signatureId}.xml`);
}
function openDocumentQrWindow() {
  showDocumentQrWindow.value = true;
}

onMounted(() => { void loadItem(); });
</script>
