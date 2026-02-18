import { SendContentRequest } from "@brifle/brifle-sdk";
import { FileContent } from "src/components/ui-elements/FileDragAndDrop.vue";
import ReceiverRecord from "src/pages/bulk_sending/util/receivers/receiverRecord";

export interface PaymentData {
    amount: number;
    currency: string;
    dueDate: string; // ISO date string
    reference: string;
    iban: string;
    description?: string;
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
    
}

export interface SendConfirmEventData {
    requestData: SendContentRequest[];
    signatureData ?: SignatureRecord[] | undefined;
}