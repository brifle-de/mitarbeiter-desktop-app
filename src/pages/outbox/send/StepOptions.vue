<template>
  <!-- V3 Optionen: letter, paper mail fallback, payment / signature -->
  <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
    <section class="ma-card">
      <h2 class="ma-title-m">{{ t('ui.send.options.letter') }}</h2>
      <FormField :label="t('ui.send.options.subject') + '*'" for-id="send-subject" :error="showErrors && state.subject.trim() === '' ? t('ui.send.options.subjectRequired') : ''">
        <InputText id="send-subject" v-model="state.subject" :readonly="state.readonly" :invalid="showErrors && state.subject.trim() === ''" :placeholder="t('ui.send.options.subjectPlaceholder')" />
      </FormField>
      <FormField :label="t('ui.send.options.type')" for-id="send-type">
        <Select v-model="state.docType" input-id="send-type" :options="typeOptions" option-label="label" option-value="value" :disabled="state.readonly" />
      </FormField>
      <label class="flex items-center gap-2.5">
        <ToggleSwitch v-model="state.requestDeliveryCertificate" :disabled="state.readonly" />
        {{ t('ui.send.options.deliveryCertificate') }}
      </label>
    </section>

    <section class="ma-card">
      <h2 class="ma-title-m">{{ t('ui.send.options.papermail') }}</h2>
      <label class="flex items-center gap-2.5">
        <ToggleSwitch v-model="state.allowPapermail" :disabled="state.readonly" />
        {{ t('ui.send.options.allowPapermail') }}
      </label>
      <template v-if="state.allowPapermail">
        <label class="flex items-center gap-2.5">
          <ToggleSwitch v-model="state.includeCoverLetter" :disabled="state.readonly" />
          {{ t('ui.send.options.coverLetter') }}
        </label>
        <div v-if="state.includeCoverLetter" class="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
          <FileText :size="18" class="text-icon-brand" />
          <span class="flex-1" :class="{ 'text-ink-muted': !state.selectedCoverLetter }">
            {{ state.selectedCoverLetter?.displayName ?? t('ui.send.options.noCoverLetter') }}
          </span>
          <Button severity="secondary" outlined size="small" :label="t('ui.send.options.chooseCoverLetter')" :disabled="state.readonly" @click="isCoverLetterModalOpen = true" />
        </div>
        <label class="flex items-center gap-2.5">
          <Checkbox v-model="state.testMode" binary :disabled="state.readonly" />
          {{ t('ui.send.options.testMode') }}
        </label>
        <FormField v-if="state.testMode" :label="t('ui.send.options.testModeEmail') + '*'" for-id="send-test-email" :error="testEmailError">
          <InputText id="send-test-email" v-model="state.testModeEmail" type="email" :readonly="state.readonly" :invalid="!!testEmailError" />
        </FormField>
        <Message severity="info">{{ t('ui.send.options.papermailInfo') }}</Message>
      </template>
      <p v-else class="text-ink-muted">{{ t('ui.send.options.papermailOff') }}</p>
      <CoverLetterSelectionModal v-model="isCoverLetterModalOpen" :api-id="state.apiId" :tenant-id="state.tenantId" @selected="state.selectedCoverLetter = $event" />
    </section>

    <section class="ma-card">
      <!-- invoices: payment data -->
      <template v-if="flow.canAttachInvoice.value">
        <h2 class="ma-title-m">{{ t('ui.send.payment.title') }}</h2>
        <label class="flex items-center gap-2.5">
          <ToggleSwitch v-model="state.attachInvoiceData" :disabled="state.readonly" />
          {{ t('ui.send.payment.attach') }}
        </label>
        <template v-if="flow.showInvoiceData.value">
          <div class="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
            <FormField :label="t('ui.send.payment.amount')" for-id="pay-amount">
              <InputNumber v-model="state.paymentData.amount" input-id="pay-amount" mode="decimal" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" locale="de-DE" :readonly="state.readonly" fluid />
            </FormField>
            <FormField :label="t('ui.send.payment.currency')" for-id="pay-currency">
              <Select v-model="state.paymentData.currency" input-id="pay-currency" :options="supportedCurrencies" :disabled="state.readonly" />
            </FormField>
          </div>
          <FormField :label="t('ui.send.payment.dueDate')" for-id="pay-due">
            <DatePicker v-model="dueDate" input-id="pay-due" date-format="dd/mm/yy" show-icon icon-display="input" :readonly="state.readonly" fluid />
          </FormField>
          <FormField :label="t('ui.send.payment.reference') + '*'" for-id="pay-ref">
            <InputText id="pay-ref" v-model="state.paymentData.reference" :readonly="state.readonly" />
          </FormField>
          <FormField :label="t('ui.send.payment.iban')" for-id="pay-iban">
            <InputMask id="pay-iban" v-model="state.paymentData.iban" mask="aa99 9999 9999 9999 9999 99" unmask slot-char="_" :readonly="state.readonly" />
          </FormField>
          <FormField :label="t('ui.send.payment.receiverName')" for-id="pay-name">
            <InputText id="pay-name" v-model="state.paymentData.paymentReceiverName" :readonly="state.readonly" />
          </FormField>
          <FormField :label="t('ui.send.payment.description')" for-id="pay-desc" :hint="`${(state.paymentData.description ?? '').length} / 100`">
            <Textarea id="pay-desc" v-model="state.paymentData.description" :maxlength="100" rows="2" auto-resize :readonly="state.readonly" />
          </FormField>
        </template>
      </template>

      <!-- letters and contracts: signature fields -->
      <template v-if="flow.canAttachSignature.value">
        <h2 class="ma-title-m">{{ t('ui.send.signature.title') }}</h2>
        <label class="flex items-center gap-2.5">
          <ToggleSwitch v-model="state.attachSignatureData" :disabled="state.readonly" />
          {{ t('ui.send.signature.attach') }}
        </label>
        <template v-if="flow.showSignatureData.value">
          <div v-for="(field, index) in state.signatureFields" :key="index + 'signatureField'" class="flex items-start gap-3 rounded-[10px] border border-line px-3 py-2.5">
            <PenLine :size="18" class="mt-0.5 text-icon-brand" />
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="ma-text-strong break-words">{{ field.fieldName }}</span>
              <span class="ma-small text-ink-muted">{{ field.purpose }} · {{ field.role }} · {{ field.signingParty === 'receiver' ? t('ui.send.signatureModal.receiver') : t('ui.send.signatureModal.sender') }}</span>
            </span>
            <Button text rounded size="small" severity="danger" :aria-label="t('ui.send.signature.remove')" :disabled="state.readonly" @click="state.signatureFields.splice(index, 1)">
              <template #icon><Trash2 :size="16" /></template>
            </Button>
          </div>
          <p v-if="state.signatureFields.length === 0" class="text-ink-muted">{{ t('ui.send.signature.empty') }}</p>
          <Button text size="small" class="self-start" :label="t('ui.send.signature.add')" :disabled="state.readonly" @click="showAddSignatureFieldModal = true">
            <template #icon><Plus :size="16" /></template>
          </Button>
        </template>
      </template>
      <AddSignatureFieldModal v-model="showAddSignatureFieldModal" @save="state.signatureFields.push($event)" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FileText, PenLine, Plus, Trash2 } from 'lucide-vue-next';
import Button from 'openvue/button';
import Checkbox from 'openvue/checkbox';
import DatePicker from 'openvue/datepicker';
import InputMask from 'openvue/inputmask';
import InputNumber from 'openvue/inputnumber';
import InputText from 'openvue/inputtext';
import Message from 'openvue/message';
import Select from 'openvue/select';
import Textarea from 'openvue/textarea';
import ToggleSwitch from 'openvue/toggleswitch';
import FormField from 'components/ui/FormField.vue';
import CoverLetterSelectionModal from 'src/components/modals/coverLetter/CoverLetterSelectionModal.vue';
import AddSignatureFieldModal from '../modals/AddSignatureFieldModal.vue';
import { DOCUMENT_TYPES } from '../util/outbox';
import { useSendDocument } from './useSendDocument';

defineProps<{ showErrors?: boolean }>();

const { t } = useI18n();
const flow = useSendDocument();
const state = flow.state;
const supportedCurrencies = ['EUR'];
const isCoverLetterModalOpen = ref(false);
const showAddSignatureFieldModal = ref(false);

const typeOptions = computed(() => DOCUMENT_TYPES.map((value) => ({ label: t(`ui.outbox.types.${value}`), value })));
/** the API gets the due date as DD/MM/YYYY (as before the redesign) */
const dueDate = computed<Date | null>({
  get: () => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(state.paymentData.dueDate ?? '');
    return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
  },
  set: (d) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    state.paymentData.dueDate = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '';
  },
});
const testEmailError = computed(() => (state.testMode && state.testModeEmail.trim() === '' ? t('ui.send.options.testModeEmailRequired') : ''));
</script>
