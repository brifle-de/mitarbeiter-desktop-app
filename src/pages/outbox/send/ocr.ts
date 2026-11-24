import type OcrService from 'src/services/node/OcrService';
import type { OrcAddressResult } from 'src/services/node/OcrService';
import type { OrcDocumentAnalysisResult } from 'app/src-electron/apis/ocr/ocrApi';
import type ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import type { RecommendationRecord } from '../util/types';

/** most frequent amount of the document; on a tie the higher one */
export function detectInvoiceAmount(amounts: string[]): string | null {
  if (amounts.length === 0) return null;
  const clearedAmounts = amounts.map((amount) => amount.replace(/\s/g, '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
  const occuranceCount: Record<string, number> = {};
  clearedAmounts.forEach((amount) => {
    if (amount.trim() !== '' && !isNaN(Number(amount))) {
      occuranceCount[amount] = (occuranceCount[amount] || 0) + 1;
    }
  });
  let maxCount = 0;
  let mostFrequentAmount: string | null = null;
  let maxNumber = 0;
  for (const [amount, count] of Object.entries(occuranceCount)) {
    if (count > maxCount || (count == maxCount && Number(amount) > maxNumber)) {
      maxCount = count;
      mostFrequentAmount = amount;
      maxNumber = Number(amount);
    }
  }
  return mostFrequentAmount;
}

export interface DocumentAnalysis {
  recommendations: RecommendationRecord[];
  /** the text recognition found an invoice */
  isInvoice: boolean;
}

/** document type and, for invoices, IBAN, invoice number (also as subject) and amount */
export function analyseDocument(ocrService: OcrService, pages: string[]): Promise<DocumentAnalysis> {
  return ocrService.performDocumentAnalysisOnBase64Data(pages).then((result: OrcDocumentAnalysisResult) => {
    const recs: RecommendationRecord[] = [];
    let type = '';
    let typeDetectionScore = 0;
    for (const key of Object.keys(result.typeDetection)) {
      const rec = result.typeDetection[key];
      if (rec?.isMatch && rec.score > typeDetectionScore) {
        type = key;
        typeDetectionScore = rec.score;
      }
    }
    if (type.length > 0) recs.push({ type: 'document_type', data: type });

    const isInvoice = type === 'invoice' && !!result.invoiceDetection;
    if (isInvoice && result.invoiceDetection) {
      const iban = result.invoiceDetection.ibans.length > 0 ? result.invoiceDetection.ibans[0] : null;
      const invoiceNumber = result.invoiceDetection.invoiceNumber.trim() !== '' ? result.invoiceDetection.invoiceNumber : null;
      const amount = detectInvoiceAmount(result.invoiceDetection.amounts);
      if (iban) recs.push({ type: 'invoice_iban', data: iban });
      if (invoiceNumber) {
        recs.push({ type: 'invoice_reference', data: invoiceNumber });
        recs.push({ type: 'subject', data: `Rechnung ${invoiceNumber}` });
      }
      if (amount) recs.push({ type: 'invoice_amount', data: amount });
    }
    return { recommendations: recs, isInvoice };
  }).catch((error) => {
    console.error('Error performing document analysis OCR:', error);
    return { recommendations: [], isInvoice: false };
  });
}

/** receiver from the address window of the first page (name, street, postcode and city required) */
export function analyseAddress(ocrService: OcrService, imageString: string): Promise<RecommendationRecord[]> {
  return ocrService.parseAddressesOrcBase64Data(imageString).then((address: OrcAddressResult) => {
    const requiredFields = [address.receiverAddress?.name, address.receiverAddress?.street, address.receiverAddress?.postalCode, address.receiverAddress?.city];
    if (!requiredFields.every((field) => field && field.trim() !== '')) return [];

    const names = address.receiverAddress.name.split(' ');
    const lastName = names.pop() ?? '';
    const firstName = names.join(' ');
    const receiverRecord: ReceiverRecord = {
      firstName,
      lastName,
      addressCity: address.receiverAddress.city,
      addressStreet: address.receiverAddress.street,
      addressCountry: 'DE',
      addressPostcode: address.receiverAddress.postalCode,
    };
    return [{ type: 'receiver_record', data: receiverRecord } as RecommendationRecord];
  }).catch((error) => {
    console.error('Error performing OCR:', error);
    return [];
  });
}
