import { computed, inject, type InjectionKey, provide, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CreateSignatureReferenceRequest, ParsedAddressResponse, SendContentResponse } from '@brifle/brifle-sdk';
import BrifleApi from 'src/services/node/Brifle';
import OcrService from 'src/services/node/OcrService';
import { useAddressStore } from 'src/stores/address-store';
import { useNotify } from 'src/composables/useNotify';
import type { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import type ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import type {
  CoverLetterData, PaymentData, RecommendationRecord, SendConfirmData, SignatureRecord, TrackableReceiverRecord,
} from '../util/types';
import type { DocumentType } from '../util/outbox';
import { pdfFirstPageToPNG, pdfPagesToPng } from './pdf';
import { analyseAddress, analyseDocument } from './ocr';
import { buildReceiverRequest, buildSendRequests, isReceiverMatch } from './requests';

function emptyPayment(): PaymentData {
  return { amount: 0, currency: 'EUR', dueDate: '', reference: '', iban: '', paymentReceiverName: '' };
}

function initialState() {
  return {
    apiId: '',
    tenantId: '',
    files: [] as FileContent[],
    subject: '',
    docType: 'letter' as DocumentType,
    receivers: [] as TrackableReceiverRecord[],
    hasCheckedReceivers: false,
    isCheckingReceivers: false,
    allowPapermail: false,
    requestDeliveryCertificate: false,
    attachInvoiceData: false,
    attachSignatureData: false,
    paymentData: emptyPayment(),
    signatureFields: [] as SignatureRecord[],
    includeCoverLetter: false,
    selectedCoverLetter: null as CoverLetterData | null,
    testMode: false,
    testModeEmail: '',
    isProcessingOcr: false,
    recommendations: [] as RecommendationRecord[],
    selectedRecommendations: [] as RecommendationRecord[],
    readonly: false,
    isSending: false,
  };
}

export type SendState = ReturnType<typeof initialState>;

export interface SendResult {
  /** responses of the receivers that got the document */
  sent: SendContentResponse[];
  total: number;
}

/**
 * State and actions of the single-send flow (/outbox/send). The page creates it
 * with `provideSendDocument()`, the step components read it with `useSendDocument()`.
 */
function createSendDocument() {
  const { t } = useI18n();
  const notify = useNotify();
  const addressStore = useAddressStore();
  const ocrService = new OcrService();
  const state = reactive(initialState());

  const canAttachInvoice = computed(() => state.docType === 'invoice');
  const canAttachSignature = computed(() => state.docType === 'contract' || state.docType === 'letter');
  const showInvoiceData = computed(() => canAttachInvoice.value && state.attachInvoiceData);
  const showSignatureData = computed(() => canAttachSignature.value && state.attachSignatureData);
  const canSend = computed(() => state.subject.trim() !== '' && state.receivers.length > 0 && state.files.length > 0 && state.hasCheckedReceivers);

  /** receivers by the way they will get the letter (Brifle, paper mail, not deliverable) */
  const receiverGroups = computed(() => {
    const groups = { brifle: [] as TrackableReceiverRecord[], papermail: [] as TrackableReceiverRecord[], error: [] as TrackableReceiverRecord[] };
    for (const rec of state.receivers) {
      if (rec.existsBrifle === true) groups.brifle.push(rec);
      else if (rec.existsBrifle === false && state.allowPapermail && rec.validPostalAddress) groups.papermail.push(rec);
      else groups.error.push(rec);
    }
    return groups;
  });

  const confirmData = computed<SendConfirmData>(() => ({
    documentType: state.docType,
    subject: state.subject,
    receivers: state.receivers,
    paymentData: state.attachInvoiceData ? state.paymentData : undefined,
    signatureData: state.attachSignatureData ? state.signatureFields : undefined,
    allowSendingPapermail: state.allowPapermail,
    requireDeliveryConfirmation: state.requestDeliveryCertificate,
    attachInvoiceData: showInvoiceData.value,
    attachSignatureData: showSignatureData.value,
    content: state.files,
    includeCoverLetter: state.includeCoverLetter,
    selectedCoverLetter: state.selectedCoverLetter,
    testMode: state.allowPapermail && state.testMode,
    testModeEmail: state.testModeEmail,
  }));

  async function fetchParsedAddress(addressString: string | null): Promise<ParsedAddressResponse | null> {
    if (!addressString || addressString.trim() === '') return null;
    const trimmedAddress = addressString.trim();
    // cache avoids repeated api calls for the same address
    if (addressStore.hasAddress(trimmedAddress)) return addressStore.findAddress(trimmedAddress) || null;
    const res = await BrifleApi.address().parsePostalAddress(state.apiId, addressString);
    if (res.isSuccess) {
      addressStore.storeAddress(trimmedAddress, res.data as ParsedAddressResponse);
      return res.data ?? null;
    }
    throw new Error('Failed to parse address: ' + JSON.stringify(res.error));
  }

  // ---- document + text recognition -------------------------------------------------

  async function addFiles(fileContent: FileContent[]) {
    state.files.push(...fileContent);
    if (state.files.length !== 1) return;

    // text recognition runs on the first document only
    state.isProcessingOcr = true;
    try {
      const first = state.files[0]!.content;
      const addressRecs = pdfFirstPageToPNG(first)
        .then((dataUrl) => analyseAddress(ocrService, dataUrl))
        .catch((error) => { console.error('Error generating first page preview:', error); return [] as RecommendationRecord[]; });
      const documentRecs = pdfPagesToPng(first)
        .then((pages) => analyseDocument(ocrService, pages))
        .catch((error) => { console.error('Error generating page previews:', error); return { recommendations: [], isInvoice: false }; });
      const [address, analysis] = await Promise.all([addressRecs, documentRecs]);

      // an invoice: show the invoice data option right away
      if (analysis.isInvoice) state.attachInvoiceData = true;

      const allRecs: RecommendationRecord[] = [];
      for (const rec of address) {
        if (!allRecs.some((r) => JSON.stringify(r) === JSON.stringify(rec))) allRecs.push(rec);
      }
      allRecs.push(...analysis.recommendations);
      state.recommendations = allRecs;
      state.selectedRecommendations = [...allRecs]; // all selected by default
    } finally {
      state.isProcessingOcr = false;
    }
  }

  function removeFile(index: number) {
    state.files.splice(index, 1);
  }

  function rejectRecommendations() {
    state.recommendations = [];
    state.selectedRecommendations = [];
  }

  function acceptRecommendations() {
    state.selectedRecommendations.forEach((rec) => {
      if (rec.type === 'receiver_record') addReceiver(rec.data as ReceiverRecord);
      else if (rec.type === 'document_type') state.docType = rec.data as DocumentType;
      else if (rec.type === 'signature_field') state.signatureFields.push(rec.data as unknown as SignatureRecord);
      else if (rec.type === 'subject') state.subject = rec.data as string;
      else if (rec.type === 'invoice_amount') state.paymentData.amount = Number(rec.data);
      else if (rec.type === 'invoice_due_date') state.paymentData.dueDate = rec.data as string;
      else if (rec.type === 'invoice_iban') state.paymentData.iban = rec.data as string;
      else if (rec.type === 'invoice_reference') state.paymentData.reference = rec.data as string;
    });
    rejectRecommendations();
  }

  // ---- receivers ---------------------------------------------------------------------

  function addReceiver(receiver: ReceiverRecord) {
    state.receivers.push(receiver);
    // a new receiver has to be checked again before sending
    state.hasCheckedReceivers = false;
  }

  function removeReceiver(receiver: ReceiverRecord) {
    state.receivers = state.receivers.filter((r) => !isReceiverMatch(r, receiver));
    state.hasCheckedReceivers = false;
  }

  /** asks Brifle for every receiver whether it is reachable and parses its postal address */
  async function checkReceivers() {
    state.isCheckingReceivers = true;
    try {
      for (const receiver of state.receivers) {
        const name = `${receiver.firstName ?? ''} ${receiver.lastName ?? ''}`.trim();
        try {
          const req = await buildReceiverRequest(receiver, fetchParsedAddress);
          const res = await BrifleApi.content().contentCheckReceiver(state.apiId, req);
          if (res.isSuccess) {
            receiver.existsBrifle = true;
            notify.success(t('ui.send.receiver.notify.valid', { name }));
          } else {
            receiver.existsBrifle = false;
            notify.warn(t('ui.send.receiver.notify.invalid', { name }), { detail: JSON.stringify(res.error), life: 5000 });
          }
        } catch (error) {
          console.error('Error checking receiver:', error);
          notify.error(t('ui.send.receiver.notify.failed', { name }), { life: 5000 });
        }
      }
      state.hasCheckedReceivers = true;
    } finally {
      state.isCheckingReceivers = false;
    }
  }

  // ---- send --------------------------------------------------------------------------

  /** creates the signature reference (if any) and sends one document per receiver */
  async function send(): Promise<SendResult> {
    state.readonly = true;
    state.isSending = true;
    try {
      const data = confirmData.value;
      const receivers = [...data.receivers];
      const requestData = await buildSendRequests({ ...data, receivers }, fetchParsedAddress);

      const signatureRefReq: CreateSignatureReferenceRequest = {
        fields: (showSignatureData.value ? state.signatureFields : []).map((field) => ({ name: field.fieldName, purpose: field.purpose, role: field.role })),
      };
      if (signatureRefReq.fields.length > 0) {
        const signatureRef = await BrifleApi.signatures().createSignatureReference(state.apiId, state.tenantId, signatureRefReq);
        if (signatureRef.isSuccess) {
          const sref = signatureRef.data?.id;
          if (sref) requestData.forEach((req) => { req.signature_info!.signature_reference = sref; });
        } else {
          console.error('Failed to create signature reference:', signatureRef.error);
          notify.error(t('ui.send.notify.signatureReferenceFailed'), { detail: JSON.stringify(signatureRef.error), life: 5000 });
        }
      }

      const sent: SendContentResponse[] = [];
      for (const [index, req] of requestData.entries()) {
        try {
          const response = await BrifleApi.content().contentSendContent(state.apiId, state.tenantId, req);
          if (response.isSuccess) {
            // sent receivers leave the list, so a second try does not send twice
            if (receivers[index]) removeReceiver(receivers[index]);
            sent.push(response.data as SendContentResponse);
          } else {
            console.error('Failed to send document:', response.error);
            notify.error(t('ui.send.notify.sendFailed'), { detail: JSON.stringify(response.error), life: 5000 });
          }
        } catch (error) {
          console.error('Error sending document:', error);
          notify.error(t('ui.send.notify.sendFailed'), { detail: error instanceof Error ? error.message : String(error), life: 5000 });
        }
      }
      return { sent, total: requestData.length };
    } finally {
      state.isSending = false;
      state.readonly = false;
    }
  }

  function reset() {
    const { apiId, tenantId } = state;
    Object.assign(state, initialState(), { apiId, tenantId });
  }

  return {
    state,
    canAttachInvoice,
    canAttachSignature,
    showInvoiceData,
    showSignatureData,
    canSend,
    receiverGroups,
    confirmData,
    fetchParsedAddress,
    addFiles,
    removeFile,
    acceptRecommendations,
    rejectRecommendations,
    addReceiver,
    removeReceiver,
    checkReceivers,
    send,
    reset,
  };
}

export type SendDocument = ReturnType<typeof createSendDocument>;
const KEY: InjectionKey<SendDocument> = Symbol('send-document');

export function provideSendDocument(): SendDocument {
  const flow = createSendDocument();
  provide(KEY, flow);
  return flow;
}

export function useSendDocument(): SendDocument {
  const flow = inject(KEY);
  if (!flow) throw new Error('useSendDocument() needs provideSendDocument() in a parent component');
  return flow;
}
