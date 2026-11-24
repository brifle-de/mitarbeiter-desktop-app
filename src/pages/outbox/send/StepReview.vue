<template>
  <!-- V4 Prüfen & senden: summary, delivery per receiver, preview -->
  <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6">
    <div class="flex flex-col gap-4">
      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.send.review.summary') }}</h2>
        <dl class="grid grid-cols-[150px_minmax(0,1fr)] gap-x-4 gap-y-2.5">
          <dt class="ma-small text-ink-muted">{{ t('ui.send.review.document') }}</dt>
          <dd>{{ state.files.map((f) => f.name).join(', ') || '—' }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.send.review.receivers') }}</dt>
          <dd>{{ t('ui.send.review.receiverCount', { count: state.receivers.length }) }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.send.options.subject') }}</dt>
          <dd :class="{ 'text-danger': !state.subject.trim() }">{{ state.subject || t('ui.send.review.missing') }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.send.options.type') }}</dt>
          <dd>{{ t(`ui.outbox.types.${state.docType}`) }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.send.review.deliveryCertificate') }}</dt>
          <dd>{{ state.requestDeliveryCertificate ? t('ui.send.review.certificateYes') : t('ui.send.no') }}</dd>
          <dt class="ma-small text-ink-muted">{{ t('ui.send.review.papermail') }}</dt>
          <dd>
            <template v-if="state.allowPapermail">
              {{ t('ui.send.review.papermailYes') }}<template v-if="state.includeCoverLetter"> · {{ state.selectedCoverLetter?.displayName ?? t('ui.send.options.noCoverLetter') }}</template>
              <template v-if="state.testMode"> · {{ t('ui.send.review.testModeTo', { email: state.testModeEmail }) }}</template>
            </template>
            <template v-else>{{ t('ui.send.no') }}</template>
          </dd>
          <template v-if="flow.showInvoiceData.value">
            <dt class="ma-small text-ink-muted">{{ t('ui.send.payment.title') }}</dt>
            <dd class="flex flex-col">
              <span>{{ formatAmount(state.paymentData.amount, state.paymentData.currency) }}<template v-if="state.paymentData.dueDate"> · {{ t('ui.send.review.due', { date: state.paymentData.dueDate }) }}</template></span>
              <span class="ma-small text-ink-muted">{{ t('ui.send.payment.reference') }}: {{ state.paymentData.reference || t('ui.send.review.notGiven') }}</span>
              <span class="ma-small text-ink-muted">{{ t('ui.send.payment.iban') }}: {{ formattedIban || t('ui.send.review.notGiven') }}</span>
              <span class="ma-small text-ink-muted">{{ t('ui.send.payment.receiverName') }}: {{ state.paymentData.paymentReceiverName || t('ui.send.review.notGiven') }}</span>
              <span v-if="state.paymentData.description" class="ma-small text-ink-muted">{{ state.paymentData.description }}</span>
            </dd>
          </template>
          <template v-if="flow.showSignatureData.value">
            <dt class="ma-small text-ink-muted">{{ t('ui.send.signature.title') }}</dt>
            <dd class="flex flex-col">
              <span>{{ t('ui.send.review.signatureCount', { count: state.signatureFields.length }) }}</span>
              <span v-for="(sig, index) in state.signatureFields" :key="'sig' + index" class="ma-small text-ink-muted">
                {{ sig.fieldName }} · {{ sig.role }} · {{ sig.purpose }} · {{ sig.signingParty === 'receiver' ? t('ui.send.signatureModal.receiver') : t('ui.send.signatureModal.sender') }}
              </span>
            </dd>
          </template>
        </dl>
      </section>

      <section class="ma-card">
        <h2 class="ma-title-m">{{ t('ui.send.review.deliveryPerReceiver') }}</h2>
        <ul class="flex flex-col">
          <li v-for="(rec, index) in state.receivers" :key="'review-rec' + index" class="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="ma-text-strong">{{ rec.firstName }} {{ rec.lastName }}</span>
              <span class="ma-small truncate text-ink-muted">{{ [getReceiverAddressString(rec), rec.email, rec.phone, rec.dateOfBirth, rec.placeOfBirth].filter(Boolean).join(' · ') }}</span>
            </span>
            <StatusTag v-bind="groupTag(rec)" />
          </li>
        </ul>
      </section>

      <Message v-if="groups.error.length > 0" severity="error">
        <span class="ma-text-strong block">{{ t('ui.send.review.errorTitle', { count: groups.error.length }) }}</span>
        {{ state.allowPapermail ? t('ui.send.review.errorText') : t('ui.send.review.errorTextNoPost') }}
      </Message>
      <Message v-if="state.allowPapermail && state.testMode" severity="info">
        <span class="ma-text-strong block">{{ t('ui.send.review.testTitle') }}</span>
        {{ t('ui.send.review.testText', { email: state.testModeEmail }) }}
      </Message>
      <Message v-else severity="warn">
        <span class="ma-text-strong block">{{ t('ui.send.review.realTitle') }}</span>
        {{ t('ui.send.review.realText') }}
      </Message>
    </div>

    <section class="ma-card">
      <h2 class="ma-title-m">{{ t('ui.send.preview.title') }}</h2>
      <PreviewComponent
        :receivers="state.receivers"
        :files="state.files"
        :has-checked-receivers="state.hasCheckedReceivers"
        :allow-papermail="state.allowPapermail"
        :include-cover-letter="state.includeCoverLetter"
        :selected-cover-letter="state.selectedCoverLetter"
        :api-id="state.apiId"
        :tenant-id="state.tenantId"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'openvue/message';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import PreviewComponent from '../components/previewComponent.vue';
import type { TrackableReceiverRecord } from '../util/types';
import { getReceiverAddressString } from './requests';
import { useSendDocument } from './useSendDocument';

const { t } = useI18n();
const flow = useSendDocument();
const state = flow.state;
const groups = flow.receiverGroups;

const formattedIban = computed(() => (state.paymentData.iban ?? '').replace(/(.{4})/g, '$1 ').trim());

function formatAmount(amount: number | null, currency: string) {
  return (amount ?? 0).toLocaleString('de-DE', { style: 'currency', currency: currency || 'EUR' });
}
function groupTag(rec: TrackableReceiverRecord): { type: StatusType; label: string } {
  if (groups.value.brifle.includes(rec)) return { type: 'delivered', label: t('ui.send.delivery.brifle') };
  if (groups.value.papermail.includes(rec)) return { type: 'post', label: state.testMode ? t('ui.send.delivery.papermailTest') : t('ui.send.delivery.papermail') };
  return { type: 'error', label: t('ui.send.delivery.none') };
}
</script>
