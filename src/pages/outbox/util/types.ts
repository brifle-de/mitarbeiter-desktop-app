import { SendContentRequest } from "@brifle/brifle-sdk";
import type { FileContent } from "src/components/ui-elements/FileDragAndDrop.vue";
import ReceiverRecord from "src/pages/bulk_sending/util/receivers/receiverRecord";

export interface PaymentData {
    amount: number;
    currency: string;
    dueDate: string; // ISO date string
    reference: string;
    iban: string;
    description?: string;
    paymentReceiverName: string;
}

export interface SignatureRecord {
    purpose: string;
    fieldName: string;
    role: string;
    signingParty: "sender" | "receiver";
}

export interface TrackableReceiverRecord extends ReceiverRecord {
    existsBrifle?: boolean;
    // only if set to true it is possible to set it via post
    validPostalAddress?: boolean;
}

export interface SendConfirmData {
    documentType: string;
    subject: string;
    receivers: TrackableReceiverRecord[];
    paymentData?: PaymentData | undefined
    signatureData?: SignatureRecord[] | undefined;

    attachInvoiceData?: boolean;
    attachSignatureData?: boolean;
    allowSendingPapermail?: boolean;
    requireDeliveryConfirmation?: boolean;
    content: FileContent[];
    includeCoverLetter?: boolean;
    selectedCoverLetter?: CoverLetterData | null;
    /** paper mail test mode: the letter is not printed but sent to `testModeEmail` */
    testMode?: boolean;
    testModeEmail?: string;
}

export interface SendConfirmEventData {
    requestData: SendContentRequest[];
    receivers: TrackableReceiverRecord[]; 
    signatureData ?: SignatureRecord[] | undefined;
}

export interface CoverLetterData {
    name: string;
    type: 'default' | 'custom';
    displayName: string;
}
/** a suggestion of the text recognition (OCR) the user can take over */
export interface RecommendationRecord {
    data: string | ReceiverRecord;
    type: 'receiver_record' | 'subject' | 'document_type' | 'invoice_iban' | 'invoice_amount' | 'invoice_due_date' | 'signature_field' | 'invoice_reference';
}
